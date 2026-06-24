#include <LittleFS.h>
#include <ESP8266WiFi.h>
#include <ESPAsyncTCP.h>
#include <ESPAsyncWebServer.h>

const char *ssid = "Galaxy S24 79A5";
const char *password = "Vivaan7306";

AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

struct __attribute__((packed)) DataPacket {
  unsigned short pitch, roll, yaw;
};

int wsConnected = false;
void onEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
  if(type == WS_EVT_CONNECT){
    //client connected
    wsConnected = true;
    os_printf("ws[%s][%u] connect\n", server->url(), client->id());
    client->printf("Hello Client %u :)", client->id());
    client->ping();
  } else if(type == WS_EVT_DISCONNECT){
    wsConnected = false;
    //client disconnected
    os_printf("ws[%s][%u] disconnect: %u\n", server->url(), client->id());

    // STOP vehicle when disconnected
    doMovement(0x7FFF, 0x7FFF, 0x7FFF);
  } else if(type == WS_EVT_ERROR){
    //error was received from the other end
    os_printf("ws[%s][%u] error(%u): %s\n", server->url(), client->id(), *((uint16_t*)arg), (char*)data);
  } else if(type == WS_EVT_PONG){
    //pong message was received (in response to a ping request maybe)
    os_printf("ws[%s][%u] pong[%u]: %s\n", server->url(), client->id(), len, (len)?(char*)data:"");
  } else if(type == WS_EVT_DATA){
    //data packet
    AwsFrameInfo * info = (AwsFrameInfo*)arg;
    if(info->final && info->index == 0 && info->len == len){
      //the whole message is in a single frame and we got all of it's data
      os_printf("ws[%s][%u] %s-message[%llu]: ", server->url(), client->id(), (info->opcode == WS_TEXT)?"text":"binary", info->len);
      if(info->opcode == WS_TEXT){
        data[len] = 0;
        os_printf("%s\n", (char*)data);
      } else {
        struct DataPacket *packet = (DataPacket *) data;

        doMovement(packet->pitch, packet->roll, packet->yaw);
      }
    } else {
      //message is comprised of multiple frames or the frame is split into multiple packets
      if(info->index == 0){
        if(info->num == 0)
          os_printf("ws[%s][%u] %s-message start\n", server->url(), client->id(), (info->message_opcode == WS_TEXT)?"text":"binary");
        os_printf("ws[%s][%u] frame[%u] start[%llu]\n", server->url(), client->id(), info->num, info->len);
      }

      os_printf("ws[%s][%u] frame[%u] %s[%llu - %llu]: ", server->url(), client->id(), info->num, (info->message_opcode == WS_TEXT)?"text":"binary", info->index, info->index + len);
      if(info->message_opcode == WS_TEXT){
        data[len] = 0;
        os_printf("%s\n", (char*)data);
      } else {
        for(size_t i=0; i < len; i++){
          os_printf("%02x ", data[i]);
        }
        os_printf("\n");
      }

      if((info->index + len) == info->len){
        os_printf("ws[%s][%u] frame[%u] end[%llu]\n", server->url(), client->id(), info->num, info->len);
        if(info->final){
          os_printf("ws[%s][%u] %s-message end\n", server->url(), client->id(), (info->message_opcode == WS_TEXT)?"text":"binary");
        }
      }
    }
  }
}

int internalLed = 2;

// Blinks if websocket is connected, otherwise always ON
void espWsConnected() {
  if (wsConnected) {
    digitalWrite(internalLed, HIGH);
    delay(500);
    digitalWrite(internalLed, LOW);
    delay(500);
  } else {
    digitalWrite(internalLed, HIGH);
  }
}

void setup() {
  pinMode(internalLed, OUTPUT);
  Serial.begin(115400);
  delay(1000);
  motorPinSetup();
  doMovement(0x7FFF, 0x7FFF, 0x7FFF); // Vehicle in stopped state

  Serial.println("Connecting to WiFi...");
  espWsConnected();
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected! IP Address: ");
  Serial.println(WiFi.localIP());

  if (!LittleFS.begin()) {
    Serial.println("Error Mounting FileSystem");
    return;
  }

  ws.onEvent(onEvent);
  server.addHandler(&ws);

  server.serveStatic("/", LittleFS, "/").setDefaultFile("/main.html");
  //server.serveStatic("/", LittleFS, "/").setDefaultFile("/main.html").setCacheControl("no-cache, no-store, must-revalidate"); Use cache control in development so new files are returned by servery

  server.begin();
  Serial.println("Server Started");
}

void loop() {
  espWsConnected();
}