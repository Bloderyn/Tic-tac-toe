const statusEl = document.querySelector("#status");
const resetBtn = document.querySelector("#reset");
const boardEl = document.querySelector("#board");

const Game = (() => {
  const human = "X";
  const ai = "O";

  let board = Array(9).fill("");
  let currentPlayer = human;
  let running = true;

  function reset() {
    board = Array(9).fill("");
    currentPlayer = human;
    running = true;
  }

  function getBoard() {
    return board.slice();
  }

  function isRunning() {
    return running;
  }
  function getCurrentPlayer() {
    return currentPlayer;
  }

  function playMove(index) {
    if (!running) return { ok: false };
    if (board[index] !== "") return { ok: false };

    board[index] = currentPlayer;

    const combo = getWinningCombo(currentPlayer, board);
    if (combo) {
      running = false;
      return { ok: true, win: true, combo, player: currentPlayer };
    }

    if (board.every((c) => c !== "")) {
      running = false;
      return { ok: true, draw: true };
    }

    currentPlayer = currentPlayer === human ? ai : human;
    return { ok: true, next: currentPlayer };
  }

  return {
    human,
    ai,
    reset,
    getBoard,
    isRunning,
    getCurrentPlayer,
    playMove,
  };
})();

function createBoard() {
  boardEl.innerHTML = "";

  const board = Game.getBoard();
  board.forEach((_, index) => {
    const cell = document.createElement("button");
    cell.classList.add("cell");
    cell.dataset.index = index;
    boardEl.appendChild(cell);
  });
}

function updateUI() {
  const cells = document.querySelectorAll(".cell");
  const board = Game.getBoard();

  cells.forEach((cell, index) => {
    cell.textContent = board[index];
    cell.disabled = board[index] !== "" || !Game.isRunning();
  });

  cells.forEach((cell, index) => {
    cell.classList.remove("x", "o");
    if (board[index] === "X") cell.classList.add("x");
    if (board[index] === "O") cell.classList.add("o");
  });
}

function playGame(e) {
  if (e.target.classList.contains("cell")) {
    const index = parseInt(e.target.dataset.index);
    const result = Game.playMove(index);

    if (result.ok) {
      updateUI();
      animateCells(index);

      if (result.win) {
        statusEl.textContent = `Player ${result.player} wins!`;
        highlightWinningCombo(result.combo);
      } else if (result.draw) {
        statusEl.textContent = "It's a draw!";
      } else {
        statusEl.textContent = `Player ${result.next}'s turn`;
        
        // Trigger AI move after human plays
        if (result.next === Game.ai) {
          setTimeout(aiMove, 500);
        }
      }
    }
  }
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
  Game.reset();
  statusEl.textContent = `Player ${Game.getCurrentPlayer()}'s turn`;
  const cells = document.querySelectorAll(".cell");
  cells.forEach((cell) => cell.classList.remove("win"));
  updateUI();
}

createBoard();
updateUI();

boardEl.addEventListener("click", playGame);
resetBtn.addEventListener("click", resetGame);

statusEl.textContent = `Player ${Game.getCurrentPlayer()}'s turn`;

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

function getBestMove(boardState) {
  let bestScore = -Infinity;
  let bestMove = null;
  const moves = getAvailableMoves(boardState);

  for (const move of moves) {
    boardState[move] = ai;
    const score = minimax(boardState, 0, false);
    boardState[move] = "";

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}

function aiMove() {
  if (!Game.isRunning() || Game.getCurrentPlayer() !== Game.ai) return;
  
  statusEl.textContent = "AI is thinking...";
  
  const board = Game.getBoard();
  const move = getBestMove(board);
  
  if (move === null) return;

  const result = Game.playMove(move);
  
  if (result.ok) {
    updateUI();
    animateCells(move);

    if (result.win) {
      statusEl.textContent = `Player ${result.player} wins!`;
      highlightWinningCombo(result.combo);
    } else if (result.draw) {
      statusEl.textContent = "It's a draw!";
    } else {
      statusEl.textContent = `Player ${result.next}'s turn`;
    }
  }
}
