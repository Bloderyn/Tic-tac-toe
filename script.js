function displayBoard() {
  console.clear?.();
  console.log(`
        ${board[0] || " "} | ${board[1] || " "} | ${board[2] || " "}
        ---------
        ${board[3] || " "} | ${board[4] || " "} | ${board[5] || " "}
        ---------
        ${board[6] || " "} | ${board[7] || " "} | ${board[8] || " "}
    `);
}

function getPlayerMove() {
  const input = alert(`Player ${currentPlayer}, enter your move (0-8):`);
  if (input === null) {
    gameRunning = false;
    return -1;
  }

  const index = Number(input);
  return index;
}

function isValidMove(index) {
  if (Number.isNaN(index)) return false;
  if (index < 0 || index > 8) return false;

  if (board[index] !== "") return false;

  return true;
}

function makeMove(index) {
  board[index] = currentPlayer;
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function checkWin(player) {
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

  for (const condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] === player && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}

function checkDraw() {
  return board.every((cell) => cell !== "");
}

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameRunning = true;

function playGame() {
  while (gameRunning) {
    displayBoard();

    let move = getPlayerMove();

    while (!isValidMove(move)) {
      console.log("Invalid move. Try again.");
      move = getPlayerMove();
    }

    makeMove(move);

    if (checkWin(currentPlayer)) {
      displayBoard();
      alert(`Player ${currentPlayer} wins!`);
      gameRunning = false;
      break;
    }

    if (checkDraw()) {
      displayBoard();
      alert("It's a draw!");
      gameRunning = false;
      break;
    }

    switchPlayer();
  }
}

playGame();
