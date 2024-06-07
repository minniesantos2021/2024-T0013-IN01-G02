// Importa as diferentes cenas do jogo
import StartScene from "./scenes/startScene.js";
import ChooseCharacter from "./scenes/chooseCharacter.js";
import ChoosePhase from "./scenes/choosePhase.js";
import Phase1 from "./scenes/phases/phase1.js";
import Phase2 from "./scenes/phases/phase2.js";
import Phase3 from "./scenes/phases/phase3.js";

export const gameState = {
  // Declara variáveis e constantes compartilhadas globalmente
  width: 960, // Largura da tela do jogo
  height: 540, // Altura da tela do jogo
  player: "", // Armazena jogador selecionado
  phase: 1, // Fase atual do jogo
  isPause: false, // Variável de controle indicando se o jogo está pausado
  isSoundMute: false, // variável de controle indicando se o som do jogo eswtá sendo exeutado
  isFullscreen: false,
};

// Configurações do jogo
const config = {
  type: Phaser.AUTO, // Tipo de renderização automática
  width: gameState.width, // Largura da tela conforme definido no gameState
  height: gameState.height, // Altura da tela conforme definido no gameState
  physics: {
    default: "arcade", // Tipo de motor de física padrão: arcade
    arcade: {
      gravity: { y: 800 }, // Configura a gravidade do jogo
      debug: false, // Define se o modo de depuração está ativado ou desativado
    },
  },
  pixelArt: true, // Configura para usar arte de pixel
  scale: {
    mode: Phaser.Scale.SMOOTH, // Tenta manter as proporções a todo custo e redimensiona o conteúdo (quando há necessidade) de forma sutil
  },
  scene: [ // Cenas do jogo 
    StartScene,
    ChooseCharacter,
    ChoosePhase,
    Phase1,
    Phase2,
    Phase3,
  ], 
};

// Cria uma nova instância do jogo Phaser com as configurações definidas anteriormente
const game = new Phaser.Game(config);

window.addEventListener("DOMContentLoaded", (event) => { // Adiciona um evento que é disparado quando o conteúdo HTML da janela é carregado
  const landscapeAlert = document.getElementById("landscapeAlert");
  function handleOrientationChange() {
    if (window.innerWidth < window.innerHeight) { // Verifica se a largura da janela é menor que a altura, o que indica modo paisagem
      landscapeAlert.style.display = "block"; // Bloqueia o modo paisagem se a largura foi maior
    } else {
      landscapeAlert.style.display = "none";
    }
  }

  window.addEventListener("orientationchange", handleOrientationChange); // Adiciona um evento que é disparado quando a orientação do dispositivo muda
  window.addEventListener("resize", handleOrientationChange); // Adiciona um evento que é disparado quando a janela é redimensionada

  // Verifica a orientação inicial ao carregar a página
  handleOrientationChange();
});
