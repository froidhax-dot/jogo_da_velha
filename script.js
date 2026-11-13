// Configuração do Firebase para o projeto velha-moderno
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

    // Verifica o resultado do redirecionamento do Google primeiro
    auth.getRedirectResult().then((result) => {
      if (result.user) {
        showScreen(mainMenu);
        return;
      }
    }).catch((error) => {
      console.error("Erro no redirect:", error);
    });

    // Escuta mudanças de estado do Firebase Auth
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

  // Ação de Login com o Google (Usando Redirect para mobile)
  btnLogin.addEventListener("click", () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    
    if (dontShowAgainCheckbox.checked) {
      localStorage.setItem("skipWelcomeScreen", "true");
    }

    auth.signInWithRedirect(provider).catch((error) => {
      console.error("Erro no login:", error);
      alert("Não foi possível realizar o login com o Google: " + error.message);
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
  btnBackToStart.addEventListener("click", () => show
