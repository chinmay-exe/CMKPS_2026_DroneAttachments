document.addEventListener('DOMContentLoaded', () => {
  const ws = new WebSocket(`ws://${window.location.hostname}/ws`);

  ws.addEventListener("open", (event) => {
    const buffer = new ArrayBuffer(6);
    const view = new Uint16Array(buffer);
    setInterval(() => {
      view[0] = (movement_values.pitch+1)*0x7FFF;
      view[1] = (movement_values.roll+1)*0x7FFF;
      view[2] = (movement_values.yaw+1)*0x7FFF;

      ws.send(buffer);
    }, 50)
  });
});
