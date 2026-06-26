// ── Pin definitions ──────────────────────────────────────────
#define IN1 8
#define IN2 9
#define IN3 10
#define IN4 11
#define PWM_PIN 2

// ── Stepper config ───────────────────────────────────────────
const int STEPS_PER_REV = 2048;
const int STEPS_90      = STEPS_PER_REV / 2;  // 512 steps = 90°

// Half-step sequence for 28BYJ-48
const int stepSequence[8][4] = {
  {1, 0, 0, 0},
  {1, 1, 0, 0},
  {0, 1, 0, 0},
  {0, 1, 1, 0},
  {0, 0, 1, 0},
  {0, 0, 1, 1},
  {0, 0, 0, 1},
  {1, 0, 0, 1}
};

int stepIndex = 0;

// ── State tracking ───────────────────────────────────────────
bool motorAtBase = true;

// ── Step motor one step in given direction ────────────────────
void stepMotor(int direction) {
  stepIndex = (stepIndex + direction + 8) % 8;
  digitalWrite(IN1, stepSequence[stepIndex][0]);
  digitalWrite(IN2, stepSequence[stepIndex][1]);
  digitalWrite(IN3, stepSequence[stepIndex][2]);
  digitalWrite(IN4, stepSequence[stepIndex][3]);
  delayMicroseconds(1200);
}

// ── Rotate a given number of steps then stop ─────────────────
void rotate(int steps, int direction) {
  for (int i = 0; i < steps; i++) {
    stepMotor(direction);
  }
  // De-energise coils — motor stops completely
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

// ── Read Pixhawk PWM pulse width (µs) ────────────────────────
unsigned long readPWM() {
  return pulseIn(PWM_PIN, HIGH, 25000UL);
}

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  pinMode(PWM_PIN, INPUT);
  Serial.begin(9600);
  Serial.println("Ready.");
}

void loop() {
  unsigned long pw = readPWM();
  Serial.println(pw);

  // VRB right = high PWM > 1700
  // VRB left  = low PWM < 1300
  bool switchHigh = (pw > 1700);
  bool switchLow  = (pw > 100 && pw < 1300);

  // VRB turned right → rotate anticlockwise (only if at base)
  if (switchHigh && motorAtBase) {
    Serial.println("VRB HIGH → Rotating 90° ANTICLOCKWISE");
    rotate(STEPS_90, -1);
    motorAtBase = false;
    delay(500);  // small pause after move
  }

  // VRB turned left → rotate clockwise back to origin (only if NOT at base)
  if (switchLow && !motorAtBase) {
    Serial.println("VRB LOW → Rotating 90° CLOCKWISE back to origin");
    rotate(STEPS_90, +1);
    motorAtBase = true;
    delay(500);  // small pause after move
  }

  delay(20);
}
