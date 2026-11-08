document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const turnDisplay = document.getElementById("turn");
  const statusDisplay = document.getElementById("status");
  const resetButton = document.getElementById("reset-btn");

  let boardState = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let isGameActive = true;

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute("data-index"));

    if (boardState[index] !== "" || !isGameActive) return;

    updateCell(cell, index);
    evaluateGame();
  }

  function updateCell(cell, index) {
    boardState[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.style.color = currentPlayer === "X" ? "#38bdf8" : "#f43f5e";
  }

  function evaluateGame() {
    let roundWon = false;

    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        roundWon = true;
        break;
      }
    }

    if (roundWon) {
      statusDisplay.textContent = `Vitória do Jogador ${currentPlayer}!`;
      isGameActive = false;
      return;
    }

    if (!boardState.includes("")) {
      statusDisplay.textContent = "Empate!";
      isGameActive = false;
      return;
    }

    switchPlayer();
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    turnDisplay.textContent = currentPlayer;
  }

  function resetGame() {
    boardState = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    isGameActive = true;
    statusDisplay.innerHTML = 'Vez do jogador: <span id="turn">X</span>';
    cells.forEach(cell => (cell.textContent = ""));
  }

  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  resetButton.addEventListener("click", resetGame);
});
