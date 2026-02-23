// ── DOM Elements ──
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var W = canvas.width;
var H = canvas.height;

// UI elements
const startModal = document.getElementById("start-modal");
const gameoverModal = document.getElementById("gameover-modal");
const playerNameInput = document.getElementById("player-name-input");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const hud = document.getElementById("hud");
const canvasWrapper = document.getElementById("canvas-wrapper");
const hudName = document.getElementById("hud-name");
const hudScore = document.getElementById("hud-score");
const timerValue = document.getElementById("timer-value");
const hudLevel = document.getElementById("hud-level");
const gameoverName = document.getElementById("gameover-name");
const gameoverScore = document.getElementById("gameover-score");
const gameoverLevel = document.getElementById("gameover-level");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const themeToggleLabel = document.getElementById("theme-toggle-label");

// ── Theme System ──
const THEMES = ["nebula", "cyber", "sunset", "forest", "frost"];
const THEME_LABELS = {
  nebula: "Nebula",
  cyber: "Cyber",
  sunset: "Sunset",
  forest: "Forest",
  frost: "Frost",
};

// Canvas colors per theme (read from CSS is tricky, so we define them here too)
const THEME_CANVAS = {
  nebula: {
    bg1: "#13111c",
    bg2: "#1a1832",
    gridDot: "rgba(167, 139, 250, 0.04)",
    playerDefault: "#a78bfa",
  },
  cyber: {
    bg1: "#0a0a0a",
    bg2: "#0d1a14",
    gridDot: "rgba(0, 255, 170, 0.03)",
    playerDefault: "#00ffaa",
  },
  sunset: {
    bg1: "#1a0a0a",
    bg2: "#241018",
    gridDot: "rgba(255, 107, 157, 0.03)",
    playerDefault: "#ff6b9d",
  },
  forest: {
    bg1: "#0a1a0a",
    bg2: "#0f1f0f",
    gridDot: "rgba(74, 222, 128, 0.03)",
    playerDefault: "#4ade80",
  },
  frost: {
    bg1: "#0c1929",
    bg2: "#0f2238",
    gridDot: "rgba(103, 232, 249, 0.03)",
    playerDefault: "#67e8f9",
  },
};

let currentTheme = "nebula";

function setTheme(themeName) {
  currentTheme = themeName;
  document.documentElement.setAttribute("data-theme", themeName);
  themeToggleLabel.textContent = THEME_LABELS[themeName];

  // Update swatch active state in start modal
  document.querySelectorAll(".theme-swatch").forEach((swatch) => {
    swatch.classList.toggle("active", swatch.dataset.theme === themeName);
  });
}

// Theme picker in start modal
document.querySelectorAll(".theme-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => {
    setTheme(swatch.dataset.theme);
  });
});

// Theme toggle button in HUD (cycles through themes)
themeToggleBtn.addEventListener("click", () => {
  const currentIndex = THEMES.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % THEMES.length;
  setTheme(THEMES[nextIndex]);
});

// ── Game State ──
let playerName = "";
let xi = 0;
let yi = 0;
let lado = 50;
let dir = 4;
let speed = 5;
let boxColor = "#a78bfa";
let foods = [];
let points = 0;
let level = 1;
let gameRunning = false;
let gameLoopId = null;

// Timer (millisecond precision)
const GAME_DURATION_MS = 120000; // 2 minutes in milliseconds
let timerStartTime = 0;
let timerRemainingMs = GAME_DURATION_MS;
let timerAnimFrameId = null;

const directions = new Map();
directions.set("ArrowUp", 1);
directions.set("ArrowDown", 2);
directions.set("ArrowLeft", 3);
directions.set("ArrowRight", 4);

// ── Start Modal Logic ──
playerNameInput.addEventListener("input", () => {
  const name = playerNameInput.value.trim();
  startBtn.disabled = name.length === 0;
});

playerNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && playerNameInput.value.trim().length > 0) {
    startGame();
  }
});

startBtn.addEventListener("click", () => {
  startGame();
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

function startGame() {
  playerName = playerNameInput.value.trim();
  if (!playerName) return;

  // Hide start modal, show HUD & canvas
  startModal.classList.add("hidden");
  hud.style.display = "flex";
  canvasWrapper.style.display = "block";

  // Update HUD
  hudName.textContent = playerName;
  hudScore.textContent = "0";
  hudLevel.textContent = "1";
  timerValue.textContent = "2:00.000";
  timerValue.classList.remove("warning");

  // Reset game state
  const tc = THEME_CANVAS[currentTheme];
  xi = 0;
  yi = 0;
  lado = 50;
  dir = 4;
  speed = 5;
  boxColor = tc.playerDefault;
  foods = [];
  points = 0;
  level = 1;
  timerRemainingMs = GAME_DURATION_MS;
  gameRunning = true;

  // Generate initial food
  generateFood();

  // Start game loop
  run();

  // Start timer
  startTimer();
}

function resetGame() {
  // Stop everything
  gameRunning = false;
  if (gameLoopId) {
    clearTimeout(gameLoopId);
    gameLoopId = null;
  }
  stopTimer();

  // Hide game over modal, show start modal
  gameoverModal.classList.add("hidden");
  startModal.classList.remove("hidden");
  hud.style.display = "none";
  canvasWrapper.style.display = "none";

  // Reset input
  playerNameInput.value = "";
  startBtn.disabled = true;
  playerNameInput.focus();
}

function endGame() {
  gameRunning = false;

  if (gameLoopId) {
    clearTimeout(gameLoopId);
    gameLoopId = null;
  }
  stopTimer();

  // Show game over modal
  gameoverName.textContent = playerName;
  gameoverScore.textContent = points;
  gameoverLevel.textContent = level;
  gameoverModal.classList.remove("hidden");
}

// ── Timer (millisecond precision) ──
function startTimer() {
  timerStartTime = Date.now();
  timerTick();
}

function timerTick() {
  const elapsed = Date.now() - timerStartTime;
  timerRemainingMs = GAME_DURATION_MS - elapsed;

  if (timerRemainingMs <= 0) {
    timerRemainingMs = 0;
    updateTimerDisplay();
    endGame();
    return;
  }

  updateTimerDisplay();

  // Warning state when less than 30 seconds
  if (timerRemainingMs <= 30000) {
    timerValue.classList.add("warning");
  }

  timerAnimFrameId = requestAnimationFrame(timerTick);
}

function stopTimer() {
  if (timerAnimFrameId) {
    cancelAnimationFrame(timerAnimFrameId);
    timerAnimFrameId = null;
  }
}

function updateTimerDisplay() {
  const totalMs = Math.max(0, timerRemainingMs);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  timerValue.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
}

// ── Game Loop ──
function run() {
  if (!gameRunning) return;
  mover();
  dibujar();
  eatFood({ x: xi + lado / 2, y: yi + lado / 2 });
  gameLoopId = setTimeout(run, speed);
}

function mover() {
  // Movement speed scales with level
  const moveSpeed = 1 + (level - 1) * 0.4;

  switch (dir) {
    case 1:
      yi -= moveSpeed;
      break;
    case 2:
      yi += moveSpeed;
      break;
    case 3:
      xi -= moveSpeed;
      break;
    case 4:
      xi += moveSpeed;
      break;
  }
}

function dibujar() {
  limpiar();

  // Draw player with a subtle glow
  ctx.shadowColor = boxColor;
  ctx.shadowBlur = 18;
  rectangulo(xi, yi, lado, lado, boxColor);
  ctx.shadowBlur = 0;

  // Wrap around edges (use >= / <= for robustness at higher speeds)
  if (xi >= W) {
    xi = -lado;
  } else if (xi + lado <= 0) {
    xi = W;
  }
  if (yi >= H) {
    yi = -lado;
  } else if (yi + lado <= 0) {
    yi = H;
  }
}

function rectangulo(xi, yi, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(xi, yi, w, h);
}

function limpiar() {
  const tc = THEME_CANVAS[currentTheme];

  // Dark background with subtle gradient
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, tc.bg1);
  gradient.addColorStop(1, tc.bg2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // Draw grid dots for visual interest
  ctx.fillStyle = tc.gridDot;
  for (let gx = 0; gx < W; gx += 40) {
    for (let gy = 0; gy < H; gy += 40) {
      ctx.beginPath();
      ctx.arc(gx, gy, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawFoods();
}

// ── Input ──
document.addEventListener("keyup", (keyHandler) => {
  if (!gameRunning) return;
  const { key } = keyHandler;
  dir = directions.has(key) ? directions.get(key) : dir;
});

// ── Food System ──
function drawFoods() {
  foods.forEach((food) => {
    drawFood({ ...food, radius: lado / 2 });
  });
}

function generateFood() {
  for (let index = 0; index < 10; index++) {
    foods.push({
      x: Math.floor(Math.random() * (W - lado / 2 - lado / 2 + 1) + lado / 2),
      y: Math.floor(Math.random() * (H - lado / 2 - lado / 2 + 1) + lado / 2),
      color: getRandomVibrantColor(),
      check: false,
    });
  }
}

function getRandomVibrantColor() {
  const colors = [
    "#f472b6", "#fb923c", "#a78bfa", "#34d399",
    "#60a5fa", "#fbbf24", "#f87171", "#2dd4bf",
    "#c084fc", "#4ade80", "#38bdf8", "#fb7185",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function drawFood(foodProps) {
  const { x, y, radius, color, check } = foodProps;
  if (!check) {
    // Glow effect
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();

    // Inner highlight
    ctx.beginPath();
    ctx.arc(
      x - radius * 0.25,
      y - radius * 0.25,
      radius * 0.35,
      0,
      2 * Math.PI,
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.fill();

    ctx.shadowBlur = 0;
  }
}

function eatFood(position) {
  foods = foods.filter((food) => {
    if (position.x >= food.x - lado / 2 && position.x <= food.x + lado / 2) {
      if (position.y >= food.y - lado / 2 && position.y <= food.y + lado / 2) {
        points += 1;
        boxColor = food.color;

        // Update HUD score with animation
        hudScore.textContent = points;
        hudScore.style.transform = "scale(1.3)";
        setTimeout(() => {
          hudScore.style.transform = "scale(1)";
        }, 150);

        return false;
      }
    }
    return true;
  });

  // When all 10 foods eaten, generate more (level up)
  if (foods.length === 0) {
    level++;
    lado = Math.max(lado - lado * 0.10, 15); // shrink but min 15
    speed = Math.max(speed * 0.85, 1);        // faster but min 1ms
    generateFood();

    // Update HUD level with animation
    hudLevel.textContent = level;
    hudLevel.style.transform = "scale(1.4)";
    setTimeout(() => {
      hudLevel.style.transform = "scale(1)";
    }, 200);
  }
}
