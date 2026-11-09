document.addEventListener("DOMContentLoaded", () => {
  const mainMenu = document.getElementById("main-menu");
  const startMenu = document.getElementById("start-menu");
  const difficultyMenu = document.getElementById("difficulty-menu");
  const optionsMenu = document.getElementById("options-menu");
  const gameScreen = document.getElementById("game-screen");

  const btnGotoStart = document.getElementById("btn-goto-start");
  const btnGotoOptions = document.getElementById("btn-goto-options");
  const btnExit = document.getElementById("btn-exit");
  const btnBackToMain = document.getElementById("btn-back-to-main");
  const btnBackToStart = document.getElementById("btn-back-to-start");
  const btnBackFromOptions = document.getElementById("btn-back-from-options");
  const btnQuitGame = document.getElementById("btn-quit-game");

  const btnMode2P = document.getElementById("btn-mode-2p");
  const btnModeIA = document.getElementById("btn-mode-ia");
  const btnDiffEasy = document.getElementById("btn-diff-easy");
  const btnDiffHard = document.getElementById("btn-diff-hard");

  const cells = document.querySelectorAll(".cell");
  const turnDisplay = document.getElementById("turn");
  const statusDisplay = document.getElementById("status");
  const resetButton = document.getElementById("reset-btn");

  const bgMusic = document.getElementById("bg-music");
  const touchSound = document.getElementById("touch-sound");
  const musicToggle = document.getElementById("music-toggle");
  const sfxToggle = document.getElementById("sfx-toggle");

  let boardState = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let isGameActive = true;
  let gameMode = "2p";
  let difficulty = "hard";

  const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  function showScreen(screen) {
    [mainMenu, startMenu, difficultyMenu, optionsMenu, gameScreen].forEach(s => s.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  btnGotoStart.addEventListener("click", () => showScreen(startMenu));
  btnGotoOptions.addEventListener("click", () => showScreen(optionsMenu));
  btnBackToMain.addEventListener("click", () => showScreen(mainMenu));
  btnBackToStart.addEventListener("click", () => showScreen(startMenu));
  btnBackFromOptions.addEventListener("click", () => showScreen(mainMenu));
  btnQuitGame.addEventListener("click", () => {
    stopMusic();
    showScreen(mainMenu);
  });

  btnExit.addEventListener("click", () => {
    window.close();
    alert("Você pode fechar o aplicativo agora.");
  });

  btnMode2P.addEventListener("click", () => {
    gameMode = "2p";
    startGame();
  });

  btnModeIA.addEventListener("click", () => {
    gameMode = "ia";
    showScreen(difficultyMenu);
  });

  btnDiffEasy.addEventListener("click", () => {
    difficulty = "easy";
    startGame();
  });

  btnDiffHard.addEventListener("click", () => {
    difficulty = "hard";
    startGame();
  });

  function playTouchSound() {
    if (sfxToggle.checked && touchSound) {
      touchSound.currentTime = 0;
      touchSound.play().catch(() => {});
    }
  }

  function startMusic() {
    if (musicToggle.checked && bgMusic) {
      bgMusic.play().catch(() => {});
    }
  }

  function stopMusic() {
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  musicToggle.addEventListener("change", () => {
    if (musicToggle.checked) {
      bgMusic.play().catch(() => {});
    } else {
      bgMusic.pause();
    }
  });

  function startGame() {
    resetGame();
    showScreen(gameScreen);
    startMusic();
  }

  function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.getAttribute("data-index"));

    if (boardState[index] !== "" || !isGameActive) return;
    if (gameMode === "ia" && currentPlayer === "O") return;

    playTouchSound();
    makeMove(index, currentPlayer);

    if (isGameActive) {
      if (gameMode === "ia" && currentPlayer === "O") {
        setTimeout(handleAIMove, 400);
      }
    }
  }

  function makeMove(index, player) {
    boardState[index] = player;
    const cell = cells[index];
    cell.textContent = player;
    cell.style.color = player === "X" ? "#38bdf8" : "#f43f5e";
    evaluateGame();

    if (isGameActive) {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      turnDisplay.textContent = currentPlayer;
    }
  }

  function handleAIMove() {
    if (!isGameActive) return;

    let index = difficulty === "easy" ? getRandomMove() : getBestMoveMinimax();

    if (index !== undefined) {
      playTouchSound();
      makeMove(index, "O");
    }
  }

  function getRandomMove() {
    const emptyCells = boardState
      .map((val, idx) => (val === "" ? idx : null))
      .filter(val => val !== null);

    if (emptyCells.length === 0) return;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

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
