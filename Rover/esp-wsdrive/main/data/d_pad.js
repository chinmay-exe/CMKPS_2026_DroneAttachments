export default class D_Pad {
  constructor(x_pos, y_pos, side, text, edit_mode, onChange, onEdit) {
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    this.side = side;
    this.text = text;
    this.edit_mode = edit_mode;
    this.onChange = onChange;
    this.onEdit = onEdit;

    const drawing_container = document.getElementById("drawing-container");

    this.div = document.getElementById("d_pad");

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = side;
    
    this.canvas.style.left = x_pos + 'px';
    this.canvas.style.top = y_pos + 'px';
    
    this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = "purple";
    this.ctx.fillRect(0, 0, side, side);
    
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.font = '30px Arial';
    this.ctx.fillStyle = 'black';
    
    const center_x = this.canvas.width / 2;
    const center_y = this.canvas.height / 2;
    this.ctx.fillText(text, center_x, center_y);

    this.canvas.addEventListener("mousedown", this.buttonPress);
    this.canvas.addEventListener("movemove", this.buttonPress);
    this.canvas.addEventListener("touchstart", this.buttonPress);
    this.canvas.addEventListener("mouseleave", this.buttonRelease);
    this.canvas.addEventListener("mouseup", this.buttonRelease);
    this.canvas.addEventListener("touchmove", this.buttonPress);
    this.canvas.addEventListener("touchcancel", this.buttonRelease);
    this.canvas.addEventListener("touchend", this.buttonRelease);

    this.div.appendChild(this.canvas);
    drawing_container.appendChild(this.div);
  }

  buttonPress = (event) => {
    if (!this.edit_mode) {
      this.onChange(true);
    } else {
      this.onEdit(event.clientX, event.clientY, false, false);
    }
  }

  buttonRelease = (event) => {
    if (!this.edit_mode) {
      this.onChange(false);
    } else {
      this.onEdit(event.clientX, event.clientY, false, false);
    }
  }
}