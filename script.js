const boardSize = 20;
const tickRate = 140;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const restartBtn = document.getElementById("restart");
const controlButtons = document.querySelectorAll(".control");

const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const keyToDirection = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
};

const createCellElements = () => {
  boardEl.innerHTML = "";
  const cells = [];
  for (let i = 0; i < boardSize * boardSize; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
    cells.push(cell);
  }
  return cells;
};

const cells = createCellElements();

const getIndex = (position) => position.y * boardSize + position.x;

const isSamePosition = (a, b) => a.x === b.x && a.y === b.y;

const clampPositions = (positions) =>
  positions.map((segment) => ({
    x: Math.max(0, Math.min(boardSize - 1, segment.x)),
    y: Math.max(0, Math.min(boardSize - 1, segment.y)),
  }));

const generateFood = (snake) => {
  const available = [];
  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      if (!snake.some((segment) => segment.x === x && segment.y === y)) {
        available.push({ x, y });
      }
    }
  }
  return available[Math.floor(Math.random() * available.length)];
};

const initialState = () => ({
  snake: [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ],
  direction: "right",
  pendingDirection: "right",
  food: { x: 14, y: 10 },
  score: 0,
  running: false,
  gameOver: false,
});

let state = initialState();

const resetGame = () => {
  state = initialState();
  updateStatus("Press any arrow key to start.");
  render();
};

const updateStatus = (message) => {
  statusEl.textContent = message;
};

const setDirection = (nextDirection) => {
  const opposite = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };
  if (nextDirection === opposite[state.direction]) {
    return;
  }
  state.pendingDirection = nextDirection;
  if (!state.running) {
    state.running = true;
  }
};

const tick = () => {
  if (!state.running || state.gameOver) {
    return;
  }

  state.direction = state.pendingDirection;
  const head = state.snake[0];
  const move = directions[state.direction];
  const nextHead = { x: head.x + move.x, y: head.y + move.y };

  if (
    nextHead.x < 0 ||
    nextHead.x >= boardSize ||
    nextHead.y < 0 ||
    nextHead.y >= boardSize
  ) {
    state.gameOver = true;
    state.running = false;
    updateStatus("Game over. Press restart to play again.");
    render();
    return;
  }

  const nextSnake = [nextHead, ...state.snake];
  const ateFood = isSamePosition(nextHead, state.food);

  if (!ateFood) {
    nextSnake.pop();
  }

  const hitSelf = nextSnake
    .slice(1)
    .some((segment) => isSamePosition(segment, nextHead));

  if (hitSelf) {
    state.gameOver = true;
    state.running = false;
    updateStatus("Game over. Press restart to play again.");
    render();
    return;
  }

  state.snake = clampPositions(nextSnake);

  if (ateFood) {
    state.score += 1;
    state.food = generateFood(state.snake);
  }

  render();
};

const render = () => {
  cells.forEach((cell) => {
    cell.classList.remove("snake", "food");
  });

  state.snake.forEach((segment) => {
    const index = getIndex(segment);
    if (cells[index]) {
      cells[index].classList.add("snake");
    }
  });

  const foodIndex = getIndex(state.food);
  if (cells[foodIndex]) {
    cells[foodIndex].classList.add("food");
  }

  scoreEl.textContent = String(state.score);

  if (!state.running && !state.gameOver) {
    updateStatus("Press any arrow key to start.");
  }
};

window.addEventListener("keydown", (event) => {
  const direction = keyToDirection[event.key];
  if (direction) {
    event.preventDefault();
    setDirection(direction);
  }
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    setDirection(direction);
  });
});

restartBtn.addEventListener("click", () => {
  resetGame();
});

setInterval(tick, tickRate);
resetGame();
