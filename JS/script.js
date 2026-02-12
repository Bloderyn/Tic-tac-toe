let board = Array(9).fill("");
let currentPlayer = "X";
let gameRunning = true;

const statusEl = document.querySelector("#status");
const resetBtn = document.querySelector("#reset");
const boardEl = document.querySelector("#board");

function playGame(e) {
  const cell = e.target;

  if (!cell.classList.contains("cell")) return;

  const index = Number(cell.dataset.index);

  if (!gameRunning) return;
  if (board[index] !== "") return;

  board[index] = currentPlayer;
  updateUI();
  animateCells(index);

  const winningCombo = getWinningCombo(currentPlayer, board);
  if (winningCombo) {
    statusEl.textContent = `Player ${currentPlayer} wins!`;
    highlightWinningCombo(winningCombo);
    gameRunning = false;
    return;
  }

  if (checkDraw()) {
    statusEl.textContent = "It's a draw!";
    gameRunning = false;
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
}

function createBoard() {
  boardEl.innerHTML = "";

  board.forEach((_, index) => {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.dataset.index = index;
    boardEl.appendChild(cell);
  });
}

function updateUI() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = board[index] !== "" || !gameRunning;
  });
}

function getWinningCombo(player, board) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combo of winConditions) {
    const [a, b, c] = combo;
    if (board[a] === player && board[b] === player && board[c] === player) {
      return combo;
    }
  }
  return null;
}

function highlightWinningCombo(combo) {
  combo.forEach((i) => {
    const cellEl = boardEl.querySelector(`.cell[data-index="${i}"]`);
    cellEl.classList.add("win");
  });
}

function checkDraw() {
  return board.every((cell) => cell !== "");
}

function animateCells(index) {
  const cellEl = boardEl.querySelector(`.cell[data-index="${index}"]`);
  cellEl.classList.remove("pop");
  void cellEl.offsetWidth;
  cellEl.classList.add("pop");
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameRunning = true;
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => cell.classList.remove("win"));
  updateUI();
}

createBoard();
updateUI();

boardEl.addEventListener("click", playGame);
resetBtn.addEventListener("click", resetGame);

statusEl.textContent = `Player ${currentPlayer}'s turn`;

// AI SIMULATOR - So we can test the game against AI without having to play against ourselves
const human = "X";
const ai = "O";

function getAvailableMoves(board) {
  const moves = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === "") moves.push(i);
  }
  return moves;
}

function isDraw(board) {
  return board.every((cell) => cell !== "");
}

function minimax(board, depth, isMaximizing) {
  if (getWinningCombo(ai, board)) return 10 - depth;
  if (getWinningCombo(human, board)) return depth - 10;
  if (isDraw(board)) return 0;

  const moves = getAvailableMoves(board);

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (const move of moves) {
      board[move] = ai;
      const score = minimax(board, depth + 1, false);
      board[move] = "";
      bestScore = Math.max(score, bestScore);
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (const move of moves) {
      board[move] = human;
      const score = minimax(board, depth + 1, true);
      board[move] = "";
      bestScore = Math.min(score, bestScore);
    }
    return bestScore;
  }
}
