const statusEl = document.querySelector("#status");
const resetBtn = document.querySelector("#reset");
const boardEl = document.querySelector("#board");
const difficultyEl = document.querySelector("#difficulty");
const symbolBtns = document.querySelectorAll(".symbol-btn");

const Game = (() => {
  let humanSymbol = "X";
  let aiSymbol = "O";

  let board = Array(9).fill("");
  let currentPlayer = humanSymbol;
  let running = true;
  let difficulty = "medium";

  function reset() {
    board = Array(9).fill("");
    currentPlayer = humanSymbol;
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

    currentPlayer = currentPlayer === humanSymbol ? aiSymbol : humanSymbol;
    return { ok: true, next: currentPlayer };
  }

  function getAvailableMoves(boardState) {
    const moves = [];
    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === "") moves.push(i);
    }
    return moves;
  }

  function isDraw(boardState) {
    return boardState.every((cell) => cell !== "");
  }

  function minimax(boardState, depth, isMaximizing) {
    if (getWinningCombo(aiSymbol, boardState)) return 10 - depth;
    if (getWinningCombo(humanSymbol, boardState)) return depth - 10;
    if (isDraw(boardState)) return 0;

    const moves = getAvailableMoves(boardState);
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (const move of moves) {
        boardState[move] = aiSymbol;
        const score = minimax(boardState, depth + 1, false);
        boardState[move] = "";
        bestScore = Math.max(score, bestScore);
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (const move of moves) {
        boardState[move] = humanSymbol;
        const score = minimax(boardState, depth + 1, true);
        boardState[move] = "";
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
      boardState[move] = aiSymbol;
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
    if (!running || currentPlayer !== aiSymbol) return;

    statusEl.textContent = "AI is thinking...";

    const boardState = board.slice();

    let randomMoveProbability = 0.4;
    if (difficulty === "easy") randomMoveProbability = 0.7;
    else if (difficulty === "hard") randomMoveProbability = 0.1;

    const makeRandomMove = Math.random() < randomMoveProbability;
    let move;

    if (makeRandomMove) {
      const availableMoves = getAvailableMoves(boardState);
      move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    } else {
      move = getBestMove(boardState);
    }

    if (move === null) return;

    const result = playMove(move);

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

  return {
    reset,
    getBoard,
    isRunning,
    getCurrentPlayer,
    playMove,
    aiMove,
    setDifficulty: (level) => {
      difficulty = level;
    },
    getDifficulty: () => difficulty,
    setPlayerSymbol: (symbol) => {
      humanSymbol = symbol;
      aiSymbol = symbol === "X" ? "O" : "X";
    },
    getHumanSymbol: () => humanSymbol,
    getAISymbol: () => aiSymbol,
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
    const currentSymbol = board[index];
    const hasSymbol = cell.querySelector(".mark") !== null;

    if (currentSymbol !== "" && !hasSymbol) {
      renderSymbol(cell, currentSymbol);
    } else if (currentSymbol === "" && hasSymbol) {
      cell.innerHTML = "";
    }

    cell.disabled = currentSymbol !== "" || !Game.isRunning();
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
        if (result.next === Game.getAISymbol()) {
          setTimeout(Game.aiMove, 500);
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

function difficultySelect(event) {
  const difficulty = event.target.value;
  Game.setDifficulty(difficulty);
}

function selectSymbol(event) {
  if (!event.target.classList.contains("symbol-btn")) return;

  const selectedSymbol = event.target.dataset.symbol;

  symbolBtns.forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  Game.setPlayerSymbol(selectedSymbol);
  resetGame();

  if (selectedSymbol === "O") {
    setTimeout(Game.aiMove, 500);
  }
}

function renderSymbol(cellEl, symbol) {
  cellEl.innerHTML = symbol === "X" ? getXSVG() : getOSVG();
}

function getXSVG() {
  return `<svg class= "mark mark-x" viewBox="0 0 100 100" aria-hidden="true">
    <line class="stroke a" x1="30" y1="30" x2="70" y2="70"></line>
    <line class="stroke b" x1="70" y1="30" x2="30" y2="70"></line>
  </svg>`;
}

function getOSVG() {
  return `<svg class="mark mark-o" viewBox="0 0 100 100" aria-hidden="true">
    <circle class="stroke" cx="50" cy="50" r="25" fill="none"></circle>
  </svg>`;
}

function handleCellClick(e) {
  const cell = e.target.closest(".cell");
  if (!cell) return;

  const index = parseInt(cell.dataset.index);
  const result = Game.playMove(index);
  if (result.ok) {
    updateUI();
  }
}

createBoard();
updateUI();

boardEl.addEventListener("click", playGame);
resetBtn.addEventListener("click", resetGame);
difficultyEl.addEventListener("change", difficultySelect);
symbolBtns.forEach((btn) => btn.addEventListener("click", selectSymbol));

statusEl.textContent = `Player ${Game.getCurrentPlayer()}'s turn`;
