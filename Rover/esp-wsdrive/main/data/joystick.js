const drawingContainerUi = document.getElementById("drawing-container");

export default class Joystick {
  constructor(
    name,
    x_pos,
    y_pos,
    outer_radius,
    inner_radius,
    edit_mode,
    allow_x_move,
    allow_y_move,
    onChange,
    onEdit
  ) {
    this.name = name;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.outer_radius = outer_radius;
    this.inner_radius = inner_radius;
    this.edit_mode = edit_mode;
    this.allow_x_move = allow_x_move; // Whether to allow joystick to move in X-Axis
    this.allow_y_move = allow_y_move; // Whether to allow joystick to move in Y-Axis
    this.onChange = onChange; // User given function that gets called when movement is detected. onChange(float x, float y). -1.0 < x, y < 1.0
    this.onEdit = onEdit; // User given function that gets called when movement is detected during editing. onEdit(int x, int y, bool decrease_radius, bool increase_radius);
    
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = 2*(outer_radius+inner_radius) + 10; // 10 is some extra padding
    this.canvas.style.left = x_pos + 'px';
    this.canvas.style.top = y_pos + 'px';
  
    this.canvas.id = name;
  
    drawingContainerUi.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
  
    let canDraw = false;
    this.canvas.addEventListener("mousedown", (event) => {
      this.joystickInputStart(event);
      canDraw = true;
    });
    this.canvas.addEventListener("touchstart", (event) => {
      this.joystickInputStart(event.targetTouches[0] || event.changedTouches[0]) 
      canDraw = true;
    });
    this.canvas.addEventListener("mousemove", (event) => {
      if (canDraw) {
        this.joystickInputStart(event);
      } 
    });
    this.canvas.addEventListener("touchmove", (event) => {
      if (canDraw) {
        this.joystickInputStart(event.targetTouches[0] || event.changedTouches[0]);
      }
    }, { passive: false });
    this.canvas.addEventListener("mouseleave", (event) => {
      this.joystickInputEnd();
      canDraw = false;
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.joystickInputEnd();
      canDraw = false;
    });
    this.canvas.addEventListener("touchcancel", (event) => {
      this.joystickInputEnd();
      canDraw = false;
    });
    this.canvas.addEventListener("touchend", (event) => {
      this.joystickInputEnd();
      canDraw = false;
    });
  
    this.joystickInputEnd();
  }
  
  joystickInputStart(event) {
    if (event.cancelable) {
        event.preventDefault();
    }
    this.canvas.width = this.canvas.width; // Clears the canvas
    const center_x = this.canvas.width/2;
    const center_y = this.canvas.height/2;
    
    const rect = this.canvas.getBoundingClientRect();
    let inner_x = event.clientX - rect.left;
    let inner_y = event.clientY - rect.top;
  
    if (!this.edit_mode) {
      if (Math.sqrt((center_x - inner_x) ** 2 + (center_y - inner_y) ** 2) > this.outer_radius) {
        inner_x = center_x;
        inner_y = center_y;
      }
    
      if (!this.allow_x_move) {
        inner_x = center_x;
      }
      if (!this.allow_y_move) {
        inner_y = center_y;
      }
      this.onChange((inner_x - center_x) / this.outer_radius, -(inner_y - center_y) / this.outer_radius);
      
      this.ctx.arc(center_x, center_y, this.outer_radius, 0, 2 * Math.PI);
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    
      this.ctx.beginPath();
      this.ctx.arc(inner_x, inner_y, this.inner_radius, 0, 2 * Math.PI);
      this.ctx.lineWidth = 3;
      this.ctx.fillStyle = 'green';
      this.ctx.fill();
    } else {
      const rect = document.getElementById("drawing-container").getBoundingClientRect();
      this.onEdit(event.clientX - center_x - rect.left, event.clientY - center_y - rect.top);
      this.canvas.style.left = (event.clientX - center_x - rect.left) + 'px';
      this.canvas.style.top = (event.clientY - center_y - rect.top) + 'px';
      
      this.ctx.arc(center_x, center_y, this.outer_radius, 0, 2 * Math.PI);
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
    
      this.ctx.beginPath();
      this.ctx.arc(center_x, center_y, this.inner_radius, 0, 2 * Math.PI);
      this.ctx.lineWidth = 3;
      this.ctx.fillStyle = 'red';
      this.ctx.fill();
     }
  }
  
  joystickInputEnd() {
    this.canvas.width = this.canvas.width; // Clears canvas
    const center_x = this.canvas.width/2;
    const center_y = this.canvas.height/2;
  
    if (!this.edit_mode) {
      this.onChange(0, 0);
    } else {
      this.onEdit(parseInt(this.canvas.style.left, 10), parseInt(this.canvas.style.top, 10));
    }
    
    this.ctx.arc(center_x, center_y, this.outer_radius, 0, 2*Math.PI);
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
  
    this.ctx.beginPath();
    this.ctx.arc(center_x, center_y, this.inner_radius, 0, 2*Math.PI);
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
  }}