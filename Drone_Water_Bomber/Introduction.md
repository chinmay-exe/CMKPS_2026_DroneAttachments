# Introduction

This project uses an RC controller to trigger a confetti sprayer attachment mounted on a drone. The system uses a rotating disc mechanism driven by a stepper motor to release confetti on command.

---

## Equipment

- FlySky FS-i6S RC controller
- FlySky FS-iA6B receiver
- Pixhawk 2.4.8 flight controller
- Arduino Nano
- 28BYJ-48 stepper motor
- ULN2003A stepper motor driver
- 3D printed parts PLA material (container, inner disc, outer disc, shaft rod, mounting bracket)

---
## Connecting the Pixhawk to the Arduino

1. Connect the Pixhawk AUX OUT 3 to pin D2 on the Arduino Nano.
2. Connect the Vin of Pixhawk to Vin of Arduino Nano.
3. Connect GND of the Pixhawk to GND of the Arduino for a common ground.


## Connecting the Arduino to the Stepper Motor Driver

1. Connect stepper driver input IN1 to Arduino pin D8.
2. Connect stepper driver input IN2 to Arduino pin D9.
3. Connect stepper driver input IN3 to Arduino pin D10.
4. Connect stepper driver input IN4 to Arduino pin D11.
5. Connect the 28BYJ-48 stepper motor to the ULN2003A driver output.
6. Power the driver from the Arduino's 5V and GND pins.

## Assembling the Disc Mechanism

1. Insert the inner disc into the container.
2. Attach the two guide rods to the outer disc so they sit inside the arc slots of the inner disc. These limit rotation to exactly 90°.
3. Attach the outer disc to the contianer using screws.
4. Connect the shaft rod between the stepper motor and the inner disc.
5. Mount the entire assembly onto the drone using the mounting bracket.

## Uploading the Code and Setting the Trigger

1. Upload the code to the Arduino Nano.
2. Use the VRB auxiliary knob on the FlySky FS-i6S as the trigger. Rotating it on rightside increases the PWM pulse width.
3. The Arduino reads the PWM signal on pin D2.
4. When the pulse width exceeds 1700 µs, a trigger is registered and the motor rotates 90° anticlockwise, aligning the disc holes and releasing confetti.
5. On the next trigger, the motor rotates 90° clockwise, closing the holes.
