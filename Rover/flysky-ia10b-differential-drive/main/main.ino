/* 
  Author: EM (greyhatem@gmail.com)
  Description: To control a dual motor based ground vehicle with RC Controller
  Equipments: This project has been tested with the Flysky-i6S RC Controller and Flysky-iA6B Receiver. An Arduino Nano microcontroller is used. L298 motor driver is also used
*/

/* Description of the channels on FS-iA6B reciever
   There are two ways to get channel info from the reciever
   1) Use the PPM that is on CH1. In this all channel information is given on a single pin. Requires extraction of each channel info
   2) Each channel information is given parallely on the channels CH1 to CH6. Its way easier to connect 4 wires, each to a channel to get that channels information
   The reciever follows AETR configuration
    CH1- Aileron(Roll)
    CH2- Elevator(Pitch)
    CH4- Throttle
    CH5- Rudder(Yaw)

    The reciever has 3 rows, the top row is for signal, the middle for VCC and the bottom for GND
    Select any Column and connect the VCC and GND to 5V and GND on arduino. Only connection on one column is required as intenally the rows are shorted to each column
    For the signal, connect each channel to the digital pins as given below
*/
int throttlePin = 4; // Throttle is actually not going to be used, as full pitch is giving full power
int yawPin = 5;
int pitchPin = 3;
int rollPin = 2;

#define OUT_MAX  255
#define OUT_MID  0
#define OUT_MIN -255

/* Here I explain the Mapping from the controller joystick to outputs to the motor driver
   On the Flysky, the joysticks give PWM values of the range 1000-2000.
   As the joystick snaps back to the middle position, that value is 1500
   Pitch:
      1000 to 1500: Joystick pulled back
      1500 to 2000: Joystick pulled infront
    Roll:
      1000 to 1500: Joystick pulled left
      1500 to 2000: Joystick pulled right
    Yaw:
      1000 to 1500: Joystick pulled left
      1500 to 2000: Joystick pulled right
    Throttle:
      1000 to 1500: Joystick pulled back
      1500 to 2000: Joystick pulled infront

    As the PWM output on a digital pin is 8 bit, only 255 can be given at max

    So the above values are mapped to -255 to 255, where -255 means bottom/left and 255 means front/right
*/
int pitchMin = 1000; // PWM(in microseconds) when pitch is at low
int pitchMid = 1500; // PWM when pitch is at middle
int pitchMax = 2000; // PWM when pitch is at max

int rollMin = 1000; // PWM(in microseconds) when roll is at low
int rollMid = 1500; // PWM when roll is at middle
int rollMax = 2000; // PWM when roll is at max

int yawMin = 1000; // PWM(in microseconds) when yaw is at low
int yawMid = 1500; // PWM when yaw is at middle
int yawMax = 2000; // PWM when yaw is at max

int throttleMin = 1000; // PWM(in microseconds) when throttle is at low
int throttleMid = 1500; // PWM when throttle is at middle
int throttleMax = 2000; // PWM when throttle is at max

// Connect the motor driver input pins to the following as required and the corresponding outputs to the motors
int motorLPos = 8;  // Positive terminal of left motor
int motorLNeg = 9;  // Negative terminal of left motor
int motorRPos = 7;  // Positive terminal of right motor
int motorRNeg = 6;  // Negative terminal of right motor

int motorLEnb = 10; // Enable pin for left motor
int motorREnb = 11; // Enable pin for right motor


void setup() {
  pinMode(throttlePin, INPUT);
  pinMode(pitchPin, INPUT);
  pinMode(yawPin, INPUT);
  pinMode(rollPin, INPUT);

  pinMode(motorLPos, OUTPUT);
  pinMode(motorLNeg, OUTPUT);
  pinMode(motorRPos, OUTPUT);
  pinMode(motorRNeg, OUTPUT);

  pinMode(motorLEnb, OUTPUT);
  pinMode(motorREnb, OUTPUT);

  Serial.begin(115200);
}

void loop() {
  int throttleDur = pulseIn(throttlePin, HIGH);
  int yawDur = pulseIn(yawPin, HIGH);
  int pitchDur = pulseIn(pitchPin, HIGH);
  int rollDur = pulseIn(rollPin, HIGH);

  Serial.print("Throttle: ");
  Serial.println(throttleDur);
  Serial.print("Yaw: ");
  Serial.println(yawDur);
  Serial.print("Roll: ");
  Serial.println(rollDur);
  Serial.print("Pitch: ");
  Serial.println(pitchDur);

  int pitchVal = map(pitchDur, pitchMin, pitchMax, OUT_MIN, OUT_MAX);
  int rollVal = map(rollDur, rollMin, rollMax, OUT_MIN, OUT_MAX);
  int yawVal = map(yawDur, yawMin, yawMax, OUT_MIN, OUT_MAX);

  pitchVal = constrain(pitchVal, OUT_MIN, OUT_MAX);
  rollVal = constrain(rollVal, OUT_MIN, OUT_MAX);
  yawVal = constrain(yawVal, OUT_MIN, OUT_MAX);

  moveVehicle(pitchVal, rollVal, yawVal);
}

#define FORWARD_DIR 0
#define BACKWARD_DIR 1

/* An abstract function to set motor direction and its speed
  Inputs:
    direction: Takes the above defined constants, 0 for forward, anything else for backwards
    motorPosPin: Pin number for positive terminal of motor
    motorNegPin: Pin number for negative terminal of motor
    motorEnbPin: Pin number for enable pin of motor
    value: PWM value to send to the enable pin
*/
void moveMotor(int direction, int motorPosPin, int motorNegPin, int motorEnbPin, long value) {
  if (direction == FORWARD_DIR) {
    digitalWrite(motorPosPin, HIGH);
    digitalWrite(motorNegPin, LOW);
  } else {
    digitalWrite(motorPosPin, LOW);
    digitalWrite(motorNegPin, HIGH);
  }
  analogWrite(motorEnbPin, abs(value));
}

/* Converts the OUT_MIN to OUT_MAX mapping of pitch, roll and yaw to a singular value to send to individual motor
  Inputs:
    pitchVal: Value of pitch 
    rollVal: Value of roll
    yawVal: Value of yaw
*/
void moveVehicle(int pitchVal, int rollVal, int yawVal) {
  long leftMotor, rightMotor;

  leftMotor = rightMotor = pitchVal;

  /* Formula to set roll
    The formula handles case whether pitch is positive or negative
    Let us assume pitch is at some value X and roll is at value Y
    To rotate left
      leftMotor = X + XY/255
      rightMotor = X
    To rotate right
      leftMotor = X
      rightMotor = X - XY/255
    The change is sign is becuase Y also changes sign going from left to right

    Explaination:
      When going forward, both motors are at speed X
      Then if we want left, the left motor slows down from X to 0
      If we want to turn right, the right motor slows down from X to 0

    Pros:
      1) The speed of rotation is capped by the pitch
    Cons:
      1) No rotation when pitch is 0
      2) The radius of turning depends on pitch, so sharp turns cannot be done at low pitch. Issue can be resolved by using yaw
  */
  if (rollVal < OUT_MID && rollVal >= OUT_MIN)
    leftMotor = pitchVal + pitchVal*rollVal/255;
  else if (rollVal >= OUT_MID && rollVal <= OUT_MAX)
    rightMotor = pitchVal - pitchVal*rollVal/255;

  // For Yaw, add the yaw value to left motor and subtract from right motor(actually formula sign should change but as yaw value also changes signs it cancels out), then contraint the values
  leftMotor += yawVal;
  rightMotor -= yawVal;

  leftMotor = constrain(leftMotor, OUT_MIN, OUT_MAX);
  rightMotor = constrain(rightMotor, OUT_MIN, OUT_MAX);

  if (leftMotor >= OUT_MID && leftMotor <= OUT_MAX) {
    moveMotor(FORWARD_DIR, motorLPos, motorLNeg, motorLEnb, leftMotor);
  } else if (leftMotor < OUT_MID && leftMotor >= OUT_MIN) {
    moveMotor(BACKWARD_DIR, motorLPos, motorLNeg, motorLEnb, leftMotor);
  } else {
    moveMotor(FORWARD_DIR, motorLPos, motorLNeg, motorLEnb, leftMotor);
  }

  if (rightMotor >= OUT_MID && rightMotor <= OUT_MAX) {
    moveMotor(FORWARD_DIR, motorRPos, motorRNeg, motorREnb, rightMotor);
  } else if (rightMotor < OUT_MID && rightMotor >= OUT_MIN) {
    moveMotor(BACKWARD_DIR, motorRPos, motorRNeg, motorREnb, rightMotor);
  } else {
    moveMotor(FORWARD_DIR, motorRPos, motorRNeg, motorREnb, rightMotor);
  }
}