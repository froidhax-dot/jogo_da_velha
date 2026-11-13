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
  const btnDiff
