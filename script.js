// Configuração do Firebase para o projeto velha-moderno[span_1](start_span)[span_1](end_span)
const firebaseConfig = {
  apiKey: "AIzaSyBHZieDnI_p1hJZopsZ2xH_Y8FDJGPC7Hg",
  authDomain: "velha-moderno.firebaseapp.com",
  projectId: "velha-moderno",
  storageBucket: "velha-moderno.firebasestorage.app",
  messagingSenderId: "808746347861",
  appId: "1:808746347861:web:firebase"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

document.addEventListener("DOMContentLoaded", () => {
  // Telas
  const welcomeScreen = document.getElementById("welcome-screen");
  const mainMenu = document.getElementById("main-menu");
  const startMenu = document.getElementById("start-menu");
  const difficultyMenu = document.getElementById("difficulty-menu");
  const optionsMenu = document.getElementById("options-menu");
  const gameScreen = document.getElementById("game-screen");

  // Botões de Autenticação / Welcome
  const btnLogin = document.getElementById("btn-login");
  const btnGuest = document.getElementById("btn-guest");
  const dontShowAgainCheckbox = document.getElementById("dont-show-again");
  const btnResetLoginPref = document.getElementById("btn-reset-login-pref");
  const userNameDisplay = document.getElementById("user-name-display");

  // Botões do Menu
  const btnGotoStart = document.getElementById("btn-goto-start");
  const btnGotoOptions = document.getElementById("btn-goto-options");
  const btnExit = document.getElementById("btn-exit");
  const btnBackToMain = document.getElementById("btn-back-to-main");
  const btnBackToStart = document.getElementById("btn-back-to-start");
  const btnBackFromOptions = document.getElementById("btn-back-from-options");
  const btnQuitGame = document.getElementById("btn-quit-game");

  // Modos de Jogo
  const btnMode2P = document.getElementById("btn-mode-2p");
  const btnModeIA = document.getElementById("btn-mode-ia");
  const btnDiffEasy = document.getElementById("btn-diff-easy");
  const btnDiffHard = document.getElementById("btn-diff-hard");

  // Elementos do Tabuleiro
  const cells = document.querySelectorAll(".cell");
  const turnDisplay = document.getElementById("turn");
  const statusDisplay = document.getElementById("status");
  const resetButton = document.getElementById("reset-btn");

  // Elementos de Áudio
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

  // --- CONTROLE DE NAVEGAÇÃO ENTRE TELAS ---
  function showScreen(screen) {
    [welcomeScreen, mainMenu, startMenu, difficultyMenu, optionsMenu, gameScreen].forEach(s => s.classList.add("hidden"));
    screen.classList.remove("hidden");
  }

  // --- LÓGICA DE INICIALIZAÇÃO E FIREBASE AUTH ---
  function checkInitialScreen() {
    const skipWelcome = localStorage.getItem("skipWelcomeScreen");

    // Verifica se já está autenticado no Firebase ou se escolheu pular
    auth.onAuthStateChanged(user => {
      if (user) {
        userNameDisplay.textContent = user.isAnonymous ? "Convidado" : (user.displayName || user.email || "Jogador");
        showScreen(mainMenu);
      } else if (skipWelcome === "true") {
        // Se marcou para não mostrar mas não logou, entra como anônimo padrão
        auth.signInAnonymously().catch(() => {
          showScreen(welcomeScreen);
        });
      } else {
        showScreen(welcomeScreen);
      }
    });
  }

  // Ação de Login com o Google
  btnLogin.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then((result) => {
        if (dontShowAgainCheckbox.checked) {
          localStorage.setItem("skipWelcomeScreen", "true");
        }
        showScreen(mainMenu);
      })
      .catch((error) => {
        console.error("Erro no login:", error);
        alert("Não foi possível realizar o login com o Google. Verifique a configuração no console do Firebase.");
      });
  });

  // Ação de Convidado (Login Anônimo no Firebase)
  btnGuest.addEventListener("click", () => {
    auth.signInAnonymously()
      .then(() => {
        if (dontShowAgainCheckbox.checked) {
          localStorage.setItem("skipWelcomeScreen", "true");
        }
        showScreen(mainMenu);
      })
      .catch((error) => {
        console.error("Erro no login anônimo:", error);
        // Fallback local caso o Auth anônimo não esteja ativado no console
        showScreen(mainMenu);
      });
  });

  // Botão em Opções para resetar a preferência da tela de login
  btnResetLoginPref.addEventListener("click", () => {
    localStorage.removeItem("skipWelcomeScreen");
    auth.signOut().then(() => {
      alert("Sessão encerrada e tela de login redefinida!");
      showScreen(welcomeScreen);
    });
  });

  // Eventos de Navegação do Menu
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

  // Seleção de Modos
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

  // --- CONTROLE DE ÁUDIO ---
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

  // --- LÓGICA DO TABULEIRO ---
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

    cell.classList.add("pop");
    setTimeout(() => cell.classList.remove("pop"), 250);

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
    let winningCombination = null;
    let winningPlayer = "";

    for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
      const [a, b, c] = WINNING_COMBINATIONS[i];
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        winningCombination = WINNING_COMBINATIONS[i];
        winningPlayer = boardState[a];
        break;
      }
    }

    if (winningCombination) {
      statusDisplay.textContent = `Vitória do Jogador ${winningPlayer}!`;
      isGameActive = false;

      winningCombination.forEach(index => {
        cells[index].classList.add("win");
      });
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
    cells.forEach(cell => {
      cell.textContent = "";
      cell.classList.remove("win", "pop");
    });
  }

  cells.forEach(cell => cell.addEventListener("click", handleCellClick));
  resetButton.addEventListener("click", resetGame);

  // Executa a checagem inicial da sessão do Firebase
  checkInitialScreen();
});
