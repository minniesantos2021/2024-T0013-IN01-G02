// Importa as dependências necessárias
import { gameState } from "../main.js"; // Importa o objeto gameState que contém informações globais do jogo

import {
  scaleElement,
  loadSpritesTxtsBtns,
  startFullscreen,
  soundGame,
} from "../functions.js"; // Importa uma função para aumentar o tamanho de elementos na tela

import { loadSprites, animsCreate } from "../player.js"; // Importa funções para carregar sprites e criar animações do jogador

// Classe que representa a cena inicial do jogo
export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartScene" });

    // Inicializa as variáveis ​​da cena
    this.startHistoryTxt; // Texto para iniciar o modo história
    this.startQuicklyTxt; // Texto para iniciar o modo rápido

    // Botões:
    this.soundBtn;
    this.fullscreen;
  }

  // Carregar os recursos (imagens e áudios) necessários para a tela inicial
  preload() {
    this.load.image("background", "src/assets/startScene/background.png");
    this.load.image("startGameBtn", "src/assets/startScene/startGameBtn.png");
    this.load.image("100celsiusLogo", "src/assets/startScene/100celsius.png");
    this.load.image("runOrBurnTxt", "src/assets/startScene/runOrBurnTxt.png");

    // Carrega sprites e animações do jogador
    loadSprites(this);

    // Chama a função para carregar sprites, textos e botões
    loadSpritesTxtsBtns(this);

    // Carrega o áudio para a tela de início
    this.load.audio("themeStartScene", "src/assets/startScene/theme.mp3");
    this.load.audio("buttonSound", "src/assets/textsAndButtons/button.mp3");
  }

  // Adicionar elementos à tela inicial do jogo
  create() {
    // Adiciona a música de fundo
    this.theme = this.sound.add("themeStartScene", {
      loop: true,
    }); // adição da música

    this.buttonSound = this.sound.add("buttonSound", {
      volume: 0.2,
    });

    if (!this.sound.locked) {
      // already unlocked so play
      this.theme.play();
    } else {
      // wait for 'unlocked' to fire and then play
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        this.theme.play();
      });
    }

    // Adiciona imagens na tela inicial
    this.add.image(gameState.width / 2, gameState.height / 2, "background"); // Plano de fundo
    this.add.image(gameState.width / 2 + 15, 190, "runOrBurnTxt"); // Subtítulo
    this.add.image(gameState.width / 2, 110, "100celsiusLogo"); // Título

    // Cria as animações do jogador
    animsCreate(this);

    this.startGameBtn = this.add
      .image(gameState.width / 2, 310, "startGameBtn")
      .setScale(3, 2)
      .setInteractive({ cursor: "pointer" }); // Torna o botão interativo e define que quando o cursor sobre este elemento seja o pointer

    // Adiciona evento de clique ao botão de iniciar modo história
    this.startGameBtn.on("pointerdown", () => {
      this.buttonSound.play();
      this.scene.start("ChooseCharacter"); // Começa a cena "ChooseCharacter"
    });

    this.startGameBtn.on("pointerover", () => {
      this.startGameBtn.setScale(3.2, 2.2);
    });

    this.startGameBtn.on("pointerout", () => {
      this.startGameBtn.setScale(3, 2);
    });

    // Botão de som
    this.soundBtn = this.add // Adiciona um botão de som
      .image(gameState.width - 50, 50, "soundBtn")
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Adiciona evento de clique ao botão de som
    this.soundBtn.on("pointerdown", () => {
      this.buttonSound.play();
      soundGame(this, this.soundBtn);
    });

    // Define comportamentos de escala para o botão
    scaleElement("over", this.soundBtn, 1.1); // Ajusta a escala do botão quando o cursor está sobre ele
    scaleElement("out", this.soundBtn, 1); // Restaura a escala original do botão quando o cursor sai dele

    // Botão de tela cheia
    this.fullscreenBtn = this.add // Adiciona um botão de tela cheia
      .image(gameState.width - 130, 50, "fullscreenBtn")
      .setTint("0x707070")
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.fullscreenBtn.on("pointerdown", () => {
      this.buttonSound.play();
      startFullscreen(this, this.fullscreenBtn);
    });

    scaleElement("over", this.fullscreenBtn, 1.1);
    scaleElement("out", this.fullscreenBtn, 1);
  }
}
