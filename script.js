Document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll(".cell");
  const turnDisplay = document.getElementById("turn");
  const statusDisplay = document.getElementById("status");
  const resetButton = document.getElementById("reset-btn");
  const difficultySelect = document.getElementById("difficulty-select"); // Seletor de dificuldade

  let boardState = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let isGameActive = true;
  let difficulty = "hard"; // Dificuldade padrão

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]             // Diagonais
  ];

  // Atualiza a dificuldade se houver seletor na tela
  if (difficultySelect) {
    difficultySelect.addEventListener("change", (e) => {
      difficulty = e.target.value;
      resetGame();
    });
  }

  function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute("data-index"));

    // Impede clique se a casa estiver ocupada, jogo pausado ou se for turno da IA
    if (boardState[index] !== "" || !isGameActive || currentPlayer === "O") return;

    makeMove(index, "X");
    
    if (isGameActive) {
      currentPlayer = "O";
      turnDisplay.textContent = currentPlayer;
      
      // Pequeno atraso de meio segundo para simular o "pensamento" da IA
      setTimeout(handleAIMove, 400);
    }
  }

  function makeMove(index, player) {
    boardState[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.style.color = player === "X" ? "#38bdf8" : "#f43f5e";
    evaluateGame();
  }

  function handleAIMove() {
    if (!isGameActive) return;

    let index;
    if (difficulty === "easy") {
      index = getRandomMove();
    } else {
      index = getBestMoveMinimax();
    }

    if (index !== undefined) {
      makeMove(index, "O");
      if (isGameActive) {
        currentPlayer = "X";
        turnDisplay.textContent = currentPlayer;
      }
    }
  }

  // --- NÍVEL FÁCIL: Escolha aleatória ---
  function getRandomMove() {
    const emptyCells = boardState
      .map((val, idx) => (val === "" ? idx : null))
      .filter(val => val !== null);

    if (emptyCells.length === 0) return;
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
  }

  // --- NÍVEL DIFÍCIL: Algoritmo Minimax ---
  function getBestMoveMinimax() {
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < boardState.length; i++) {
      if (boardState[i] === "") {
        boardState[i] = "O";
        let score = minimax(boardState, 0, false);
        boardState[i] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(board, depth, isMaximizing) {
    if (checkWin(board, "O")) return 10 - depth;
    if (checkWin(board, "X")) return depth - 10;
    if (!board.includes("")) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = "O";
          let score = minimax(board, depth + 1, false);
          board[i] = "";
          maxScore = Math.max(score, maxScore);
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
          board[i] = "X";
          let score = minimax(board, depth + 1, true);
          board[i] = "";
          minScore = Math.min(score, minScore);
        }
      }
      return minScore;
    }
  }

  function checkWin(board, player) {
    return WINNING_COMBINATIONS.some(combination => {
      return combination.every(index => board[index] === player);
    });
  }

  function evaluateGame() {
    let roundWon = false;
    let winningPlayer = "";

    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        roundWon = true;
        winningPlayer = boardState[a];
        break;
      }
    }

    if (roundWon) {
      statusDisplay.textContent = `Vitória do Jogador ${winningPlayer}!`;
      isGameActive = false;
      return;
    }

    if (!boardState.includes("")) {
      statusDisplay.textContent = "Empate!";
      isGameActive = false;
      return;
    }
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
