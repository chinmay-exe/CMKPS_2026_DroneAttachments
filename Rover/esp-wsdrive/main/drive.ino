/* Contains functions for driving an differential drive
*/

// Magic Number Definitions
#define FORWARD_DIR 0
#define BACKWARD_DIR 1

/*
  L293 unlike L298, has 4 input pins. 2 being enable pins for 2 motors, and 2 for setting direction of each motor
*/
const int motorLEnb = 5; // D1
const int motorLDir = 0; // D3
const int motorREnb = 4; // D2
const int motorRDir = 2; // D4

void motorPinSetup() {
  pinMode(motorLEnb, OUTPUT);
  pinMode(motorLDir, OUTPUT);
  pinMode(motorREnb, OUTPUT);
  pinMode(motorRDir, OUTPUT);
}

/* An abstract function to set motor direction and its speed
  Inputs:
    direction: Takes the above defined constants, 0 for forward, anything else for backwards
    motorDir
    motorEnbPin: Pin number for enabSerial.println(value);le pin of motor
    value: PWM value to send to the enable pin
*/
void moveMotor(
  int direction,   // Takes the above defined constants, 0 for forward, anything else for backwards
  int motorDirPin, // L293 Pin that sets the direction, refer to the pin variables above. HIGH rotates motor in one direction, LOW in opposite direction
  int motorEnbPin, // L293 Pin that sets speed using PWM
  long value       // PWM value to send to motor
) {
  digitalWrite(motorDirPin, (FORWARD_DIR==direction)?HIGH:LOW);
  os_printf("%d %d\n", direction, value);
  analogWrite(motorEnbPin, abs(value));
}

/*
  Value of rotation, maps to the following values
*/
#define OUT_MIN -1023
#define OUT_MID 0
#define OUT_MAX 1023

/* Converts the OUT_MIN to OUT_MAX mapping of pitch, roll and yaw to a singular value to send to individual motor
  Inputs:
    pitchVal: Value of pitch 
    rollVal: Value of roll
    yawVal: Value of yaw
*/
void doMovement(unsigned short pitch, unsigned short roll, unsigned short yaw) {
  int pitchVal = map(pitch, 0x0000, 0xFFFF, OUT_MIN, OUT_MAX);
  int rollVal = map(roll, 0x0000, 0xFFFF, OUT_MIN, OUT_MAX);
  int yawVal = map(yaw, 0x0000, 0xFFFF, OUT_MIN, OUT_MAX);
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
    leftMotor = pitchVal + pitchVal*rollVal/OUT_MAX;
  else if (rollVal >= OUT_MID && rollVal <= OUT_MAX)
    rightMotor = pitchVal - pitchVal*rollVal/OUT_MAX;

  // For Yaw, add the yaw value to left motor and subtract from right motor(actually formula sign should change but as yaw value also changes signs it cancels out), then contraint the values
  leftMotor += yawVal;
  rightMotor -= yawVal;

  leftMotor = constrain(leftMotor, OUT_MIN, OUT_MAX);
  rightMotor = constrain(rightMotor, OUT_MIN, OUT_MAX);

  Serial.print("Left Motor: ");
  if (leftMotor >= OUT_MID && leftMotor <= OUT_MAX) {
    moveMotor(FORWARD_DIR, motorLDir, motorLEnb, leftMotor);
  } else if (leftMotor < OUT_MID && leftMotor >= OUT_MIN) {
    moveMotor(BACKWARD_DIR, motorLDir, motorLEnb, leftMotor);
  }

  Serial.print("Right Motor: ");
  if (rightMotor >= OUT_MID && rightMotor <= OUT_MAX) {
    moveMotor(FORWARD_DIR, motorRDir, motorREnb, rightMotor);
  } else if (rightMotor < OUT_MID && rightMotor >= OUT_MIN) {
    moveMotor(BACKWARD_DIR, motorRDir, motorREnb, rightMotor);
  }
}