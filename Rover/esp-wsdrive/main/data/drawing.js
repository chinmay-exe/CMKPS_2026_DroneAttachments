import Joystick from "./joystick.js";
import D_Pad from "./d_pad.js";

let data = JSON.parse(localStorage.getItem("data"));

// Values to place the joystick and d-pad when site loads for the first time
// X-axis and Y-axis positions are in percent
// radius or width and height is in pixels
const default_val = {
  input_method: "pitch_roll_yaw",
  pitch_roll_yaw: {},
  pitch_roll: {},
  pitch_yaw: {},
  d_pad: {},
  portrait: {
    pitch_roll_yaw: {
        pitch_roll_x: 0.30,
        pitch_roll_y: 0.48,
        pitch_roll_r: 100, // Outer radius
        pitch_roll_ir: 40, // Inner radius
        yaw_x: 0.01, 
        yaw_y: 0.15,
        yaw_r: 100,
        yaw_ir: 40 
      },
      pitch_roll: {
        pitch_roll_x: 0.20,
        pitch_roll_y: 0.45,
        pitch_roll_r: 100, // Outer radius
        pitch_roll_ir: 40 // Inner radius
      },
      pitch_yaw: {
        pitch_yaw_x: 0.20,
        pitch_yaw_y: 0.45,
        pitch_yaw_r: 100, // Outer radius
        pitch_yaw_ir: 40, // Inner radius
      },
      d_pad: {
        up_x: 0.38,
        up_y: 0.49,
        up_size: 100, // height and width
        down_x: 0.38,
        down_y: 0.61,
        down_size: 100, // height and width
        left_x: 0.13,
        left_y: 0.55,
        left_size: 100, // height and width
        right_x: 0.63,
        right_y: 0.55,
        right_size: 100 // heightrect_width and width
      }
  },
  landscape: {
    pitch_roll_yaw: {
        pitch_roll_x: 0.63,
        pitch_roll_y: 0.00,
        pitch_roll_r: 100, // Outer radius
        pitch_roll_ir: 40, // Inner radius
        yaw_x: 0.03, 
        yaw_y: 0.00,
        yaw_r: 100,
        yaw_ir: 40 
      },
      pitch_roll: {
        pitch_roll_x: 0.63,
        pitch_roll_y: 0.00,
        pitch_roll_r: 100, // Outer radius
        pitch_roll_ir: 40 // Inner radius
      },
      pitch_yaw: {
        pitch_yaw_x: 0.63,
        pitch_yaw_y: 0.00,
        pitch_yaw_r: 100, // Outer radius
        pitch_yaw_ir: 40, // Inner radius
      },
      d_pad: {
        up_x: 0.75,
        up_y: 0.16,
        up_size: 100, // height and width
        down_x: 0.75,
        down_y: 0.46,
        down_size: 100, // height and width
        left_x: 0.05,
        left_y: 0.30,
        left_size: 100, // height and width
        right_x: 0.17,
        right_y: 0.30,
        right_size: 100 // height and width
      }
   }
};

// Changes the X-axis and Y-axis percent given in default to pixels by using screen size for portrait mode
function upgradeDefaultsForPortrait() {
  const drawing_container_rect = document.getElementById("drawing-container").getBoundingClientRect();
  console.log(drawing_container_rect);
  let rect_height = drawing_container_rect.height;
  let rect_width = drawing_container_rect.width;

  default_val.portrait.pitch_roll_yaw.pitch_roll_x *= rect_width;
  default_val.portrait.pitch_roll_yaw.pitch_roll_y *= rect_height;
  default_val.portrait.pitch_roll_yaw.yaw_x *= rect_width;
  default_val.portrait.pitch_roll_yaw.yaw_y *= rect_height;
  
  default_val.portrait.pitch_roll.pitch_roll_x *= rect_width;
  default_val.portrait.pitch_roll.pitch_roll_y *= rect_height;
  
  default_val.portrait.pitch_yaw.pitch_yaw_x *= rect_width;
  default_val.portrait.pitch_yaw.pitch_yaw_y *= rect_height;

  default_val.portrait.d_pad.up_x *= rect_width;
  default_val.portrait.d_pad.up_y *= rect_height;
  default_val.portrait.d_pad.down_x *= rect_width;
  default_val.portrait.d_pad.down_y *= rect_height;
  default_val.portrait.d_pad.left_x *= rect_width;
  default_val.portrait.d_pad.left_y *= rect_height;
  default_val.portrait.d_pad.right_x *= rect_width;
  default_val.portrait.d_pad.right_y *= rect_height;
}

// Changes the X-axis and Y-axis percent given in default to pixels by using screen size for landscape mode
function upgradeDefaultsForLadscape() {
  const drawing_container_rect = document.getElementById("drawing-container").getBoundingClientRect();
  console.log(drawing_container_rect);
  let rect_height = drawing_container_rect.height;
  let rect_width = drawing_container_rect.width;
  
  default_val.landscape.pitch_roll_yaw.pitch_roll_x *= rect_width;
  default_val.landscape.pitch_roll_yaw.pitch_roll_y *= rect_height;
  default_val.landscape.pitch_roll_yaw.yaw_x *= rect_width;
  default_val.landscape.pitch_roll_yaw.yaw_y *= rect_height;
  
  default_val.landscape.pitch_roll.pitch_roll_x *= rect_width;
  default_val.landscape.pitch_roll.pitch_roll_y *= rect_height;
  
  default_val.landscape.pitch_yaw.pitch_yaw_x *= rect_width;
  default_val.landscape.pitch_yaw.pitch_yaw_y *= rect_height;

  default_val.landscape.d_pad.up_x *= rect_width;
  default_val.landscape.d_pad.up_y *= rect_height;
  default_val.landscape.d_pad.down_x *= rect_width;
  default_val.landscape.d_pad.down_y *= rect_height;
  default_val.landscape.d_pad.left_x *= rect_width;
  default_val.landscape.d_pad.left_y *= rect_height;
  default_val.landscape.d_pad.right_x *= rect_width;
  default_val.landscape.d_pad.right_y *= rect_height;
}

// Checks if user is using the current orientation for the first time
let areValuesSavedForPortrait = localStorage.getItem("areValuesSavedForPortrait");
let areValuesSavedForLandscape = localStorage.getItem("areValuesSavedForLandscape");
if (areValuesSavedForLandscape == null) {
  areValuesSavedForLandscape = false;
}
if (areValuesSavedForPortrait == null) {
  areValuesSavedForPortrait = false;
}

// First called function
// Updates the default values
function preRendering() {
  const currentOrientation = screen.orientation.type;
  if (!areValuesSavedForLandscape && !areValuesSavedForPortrait) {
    data = default_val;
  }
  if (!areValuesSavedForLandscape || !areValuesSavedForPortrait) {
    if (currentOrientation.includes("portrait") && !areValuesSavedForPortrait) {
      console.log("portrait")
      upgradeDefaultsForPortrait();
      areValuesSavedForPortrait = true;
      localStorage.setItem("areValuesSavedForPortrait", true);
      data.portrait = default_val.portrait;
    }
  }
  if (currentOrientation.includes("landscape") && !areValuesSavedForLandscape) {
    console.log("landscape")
    upgradeDefaultsForLadscape();
    areValuesSavedForLandscape = true;
    localStorage.setItem("areValuesSavedForLandscape", true);
    data.landscape = default_val.landscape;
  }
  saveSettings();
  setDataByOrientation((currentOrientation.includes("portrait")) ? "portrait" : "landscape");
}

function saveSettings() {
  console.log(data);
  localStorage.setItem("data", JSON.stringify(data));
}

// NOT Implemented: Go back to default position for joystick or d-pad
// If changeAll is true, position for all input method is changed
// If changeAll is false, only position for the current input method is changed
function originalDefaults(changeAll) {
  if (data.input_method == "pitch_roll_yaw" || changeAll) {
    data.pitch_roll_yaw = default_val.pitch_roll_yaw;
  }
  if (data.input_method == "pitch_roll" || changeAll) {
    data.pitch_roll = default_val.pitch_roll;
  }
  if (data.input_method == "pitch_yaw" || changeAll) {
    data.pitch_yaw = default_val.pitch_yaw;
  }
  if (data.input_method == "d_pad" || changeAll) {
    data.d_pad = default_val.d_pad;
  }
  changeInputRender(true);
}

const current_to_default = document.getElementById("current-to-default");
current_to_default.addEventListener("click", () => { originalDefaults(false) });

const all_to_default = document.getElementById("all-to-default");
all_to_default.addEventListener("click", () => { originalDefaults(true) });

// This functions determines and draws the current input method
function changeInputRender(edit_mode = false) {
  const drawing_container = document.getElementById("drawing-container");
  document.getElementById("pitch_roll")?.remove();
  document.getElementById("yaw")?.remove();
  document.getElementById("pitch_yaw")?.remove();
  document.getElementById("d_pad")?.remove();
  
  if (data.input_method=="pitch_roll_yaw") {
    new Joystick(
      "pitch_roll",
      data.pitch_roll_yaw.pitch_roll_x, 
      data.pitch_roll_yaw.pitch_roll_y, 
      data.pitch_roll_yaw.pitch_roll_r, 
      data.pitch_roll_yaw.pitch_roll_ir, 
      edit_mode,
      true,
      true,
      (x_val, y_val) => {
        movement_values.pitch = y_val;
        movement_values.roll = x_val;
      },
      (x_val, y_val, decrease, increase) => {
        data.pitch_roll_yaw.pitch_roll_x = x_val;
        data.pitch_roll_yaw.pitch_roll_y = y_val;
      }
    );
    
    new Joystick(
      "yaw",
      data.pitch_roll_yaw.yaw_x, 
      data.pitch_roll_yaw.yaw_y, 
      data.pitch_roll_yaw.yaw_r, 
      data.pitch_roll_yaw.yaw_ir, 
      edit_mode,
      true,
      false,
      (x_val, y_val) => {
        movement_values.yaw = x_val;
      },
      (x_val, y_val) => {
        data.pitch_roll_yaw.yaw_x = x_val;
        data.pitch_roll_yaw.yaw_y = y_val;
      }
    );
    } else if (data.input_method=="pitch_roll") {
      new Joystick(
        "pitch_roll",
        data.pitch_roll.pitch_roll_x, 
        data.pitch_roll.pitch_roll_y, 
        data.pitch_roll.pitch_roll_r, 
        data.pitch_roll.pitch_roll_ir, 
        edit_mode,
        true,
        true,
        (x_val, y_val) => {
          movement_values.pitch = y_val;
          movement_values.roll  = x_val;
          movement_values.yaw   = 0x7FFF;
        },
        (x_val, y_val, decrease, increase) => {
          data.pitch_roll.pitch_roll_x = x_val;
          data.pitch_roll.pitch_roll_y = y_val;
        }
      );
    } else if (data.input_method=="pitch_yaw") {
      new Joystick(
        "pitch_yaw",
        data.pitch_yaw.pitch_yaw_x, 
        data.pitch_yaw.pitch_yaw_y, 
        data.pitch_yaw.pitch_yaw_r, 
        data.pitch_yaw.pitch_yaw_ir, 
        edit_mode,
        true,
        true,
        (x_val, y_val) => {
          movement_values.pitch = y_val;
          movement_values.yaw  = x_val;
          movement_values.roll   = 0x7FFF;
        },
        (x_val, y_val, decrease, increase) => {
          data.pitch_yaw.pitch_yaw_x = x_val;
          data.pitch_yaw.pitch_yaw_y = y_val;
        }
       );
      
  } else if (data.input_method=="d_pad") {
    const d_pad = document.createElement("div");
    d_pad.id = "d_pad";
    drawing_container.appendChild(d_pad);
    
    new D_Pad(
      data.d_pad.up_x,
      data.d_pad.up_y,
      data.d_pad.up_size,
      '↑',
      edit_mode,
      (pressed) => {
        movement_values.pitch = (pressed)?1.0:0.0;
      },
      (x_val, y_val, decrease, increase) => {
        data.d_pad.up_x = x_val;
        data.d_pad.up_y = y_val;
      }
    );
    new D_Pad(
      data.d_pad.right_x,
      data.d_pad.right_y,
      data.d_pad.right_size,
      '→',
      edit_mode,
      (pressed) => {
        movement_values.yaw = (pressed)?1.0:0.0;
      },
      (x_val, y_val, decrease, increase) => {
        data.d_pad.right_x = x_val;
        data.d_pad.right_y = y_val;
      }
    );
    new D_Pad(
      data.d_pad.down_x,
      data.d_pad.down_y,
      data.d_pad.down_size,
      '↓',
      edit_mode,
      (pressed) => {
        movement_values.pitch = (pressed)?-1.0:0.0;
      },
      (x_val, y_val, decrease, increase) => {
        data.d_pad.down_x = x_val;
        data.d_pad.down_y = y_val;
      }
    );
    new D_Pad(
      data.d_pad.left_x,
      data.d_pad.left_y,
      data.d_pad.left_size,
      '←',
      edit_mode,
      (pressed) => {
        movement_values.yaw = (pressed)?-1.0:0.0;
      },
      (x_val, y_val, decrease, increase) => {
        data.d_pad.left_x = x_val;
        data.d_pad.left_y = y_val;
      }
    );
  }
}

// When user changes input method
const inputMethodUi = document.getElementById("input-method");
inputMethodUi.addEventListener("change", (event) => {
  data.input_method = event.target.value;
  changeInputRender(true);
})

function settingsButton() {
  const settingsButtonUi = document.getElementById("settings-button");
  if (settingsButtonUi.innerText=="Open Settings") {
    settingsButtonUi.innerText = "Save Settings";
    inputMethodUi.style.visibility = "visible";
    changeInputRender(true);
  } else {
    settingsButtonUi.innerText = "Open Settings";
    inputMethodUi.style.visibility = "hidden";
    changeInputRender(false);
    saveSettings();
  }
}

const settings_button = document.getElementById("settings-button");
settings_button.addEventListener("click", settingsButton)

function setDataByOrientation(orientation) {
  if (orientation == "portrait") {
    data.pitch_roll_yaw = data.portrait.pitch_roll_yaw;
    data.pitch_roll = data.portrait.pitch_roll;
    data.pitch_yaw = data.portrait.pitch_yaw;
    data.d_pad = data.portrait.d_pad;
  } else {
    data.pitch_roll_yaw = data.landscape.pitch_roll_yaw;
    data.pitch_roll = data.landscape.pitch_roll;
    data.pitch_yaw = data.landscape.pitch_yaw;
    data.d_pad = data.landscape.d_pad;
  }
  changeInputRender();
}

const resizeObserver = new ResizeObserver((entries) => {
  for (let entry of entries) {
    preRendering();
  }
});

// Waits for parent element to change its size rather than screen.orientation to change
// Just because screen.orientation changes does not mean the parent height and width changed instantly, it takes time, thats why the parent size is observed for changes
preRendering();
const drawing_container = document.getElementById("drawing-container");
resizeObserver.observe(drawing_container);