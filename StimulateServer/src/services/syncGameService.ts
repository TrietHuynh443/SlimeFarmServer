const TICK_RATE = 16; // ~60 FPS

function updateGame() {
  const startTime = Date.now();

  const endTime = Date.now();
  const delta = endTime - startTime;

  setTimeout(updateGame, Math.max(0, TICK_RATE - delta));
}
