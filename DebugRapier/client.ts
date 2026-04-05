// Define the expected data structure from your server
interface DebugData {
  vertices: Float32Array; // [x1, y1, x2, y2, ...]
  colors: Float32Array; // [r, g, b, a, r, g, b, a, ...]
}

const canvas = document.getElementById("debugCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Configuration: Adjust zoom/offset to fit your world coordinates
const SCALE = 50;
const OFFSET_X = canvas.width / 2;
const OFFSET_Y = canvas.height / 2;

const socket = new WebSocket("ws://127.0.0.1:8080");
socket.onopen = () => console.log("✅ Connected!");
socket.onerror = (error) => console.error("❌ WebSocket Error:", error);
socket.onclose = (event) => console.log("🔌 Closed:", event.code, event.reason);
socket.onmessage = (event) => {
  const data: DebugData = JSON.parse(event.data);
  console.log(data);
  drawDebug(data);
};

function drawDebug(data: DebugData) {
  const { vertices, colors } = data;

  // 1. Clear previous frame
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 2. Iterate through line segments
  // Rapier's debugRender returns segments: 2 vertices (4 floats) per line
  for (let i = 0; i < vertices.length; i += 4) {
    const x1 = vertices[i] * SCALE + OFFSET_X;
    const y1 = -vertices[i + 1] * SCALE + OFFSET_Y; // Flip Y for screen space
    const x2 = vertices[i + 2] * SCALE + OFFSET_X;
    const y2 = -vertices[i + 3] * SCALE + OFFSET_Y;

    // 3. Get color for this segment
    // Colors are 4 floats (RGBA) per vertex. We use the first vertex's color.
    const colorIndex = (i / 2) * 4;
    const r = Math.floor(colors[colorIndex] * 255);
    const g = Math.floor(colors[colorIndex + 1] * 255);
    const b = Math.floor(colors[colorIndex + 2] * 255);
    const a = colors[colorIndex + 3];

    ctx.beginPath();
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}
