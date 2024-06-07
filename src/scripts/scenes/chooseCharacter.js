// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "../main.js";

import { scaleElement, startFullscreen, soundGame } from "../functions.js";

// Importa a classe Player do arquivo "player.js"
import Player from "../player.js";

// Define a classe ChooseCharacter que estende Phaser.Scene
export default class ChooseCharacter extends Phaser.Scene {
  constructor() {
    super({ key: "ChooseCharacter" });

    // Declaração de variáveis para elementos visuais
    this.chooseCharacterTxt;
    this.celsinhoBtn;
    this.kelvinhaBtn;

    // Botões
    this.soundBtn;
    this.fullscreen;
  }

  // Carrega os recursos necessários para a cena
  preload() {
    // Carrega a imagem do texto "Escolha o personagem"
    this.load.image(
      "chooseCharacterTxt",
      "src/assets/textsAndButtons/chooseCharacterTxt.png"
    );

    // Carrega os textos com os nomes dos personagens e músicas
    this.load.image("celsinhoTxt", "src/assets/textsAndButtons/celsinhoTxt.png");
    this.load.image("kelvinhaTxt", "src/assets/textsAndButtons/kelvinhaTxt.png");
    this.load.audio("music1", "src/assets/phase1/musicPhase1.mp3");
    this.load.audio("music2", "src/assets/phase2/musicPhase2.mp3");
    this.load.audio("music3", "src/assets/phase3/musicPhase3.mp3");
  }

  // Cria os elementos visuais e define a interatividade
  create() {
    this.buttonSound = this.sound.get("buttonSound");

    // Adiciona a imagem de fundo no centro da tela
    this.add.image(gameState.width / 2, gameState.height / 2, "background");
    this.chooseCharacterTxt = this.add.image( // Adiciona o texto que indica para escolher o personagem no topo da tela
      gameState.width / 2,
      120,
      "chooseCharacterTxt"
    );

    // Adiciona as imagens dos textos "Celsinho" e "Kelvinha"
    this.add.image(270, 460, "celsinhoTxt");
    this.add.image(670, 460, "kelvinhaTxt");

    // Anima o texto "Escolha o personagem"
    this.tweens.add({
      targets: this.chooseCharacterTxt, // O objeto que você deseja animar
      scaleX: 1.05, // Escala horizontal desejada
      scaleY: 1.05, // Escala vertical desejada
      duration: 1000, // A duração da animação em milissegundos
      ease: "Cubic", // A função de easing para a animação
      yoyo: true, // Fazer a animação de ida e volta
      repeat: -1, // Repetir a animação indefinidamente
    });

    // Cria os sprites dos personagens celsinho e kelvinha por meio da classe "Player"
    this.celsinhoBtn = new Player(this, 270, 336, "celsinho");
    this.kelvinhaBtn = new Player(this, 650, 346, "kelvinha");

    // Adiciona os personagens à cena
    this.celsinhoBtn.addPlayerToScene(this);
    this.kelvinhaBtn.addPlayerToScene(this);

    // Desativa a gravidade dos personagens
    this.celsinhoBtn.body.setAllowGravity(false);
    this.kelvinhaBtn.body.setAllowGravity(false);

    // Define os personagens como interativos e configura o cursor do mouse
    this.celsinhoBtn.setScale(1).setInteractive({ cursor: "pointer" });
    this.kelvinhaBtn.setScale(1).setInteractive({ cursor: "pointer" });

    // Define ação quando o jogador escolhe o personagem celsinho
    this.celsinhoBtn.on(
      "pointerdown",
      () => {
        this.buttonSound.play();
        gameState.player = "celsinho"; // Define o personagem escolhido como "celsinho" no estado do jogo
        this.scene.start("ChoosePhase");
      },
      this
    );

    // Define ações de interação com o mouse para o personagem celsinho
    this.celsinhoBtn.on(
      "pointerover",
      () => {
        // Aumenta o tamanho do sprite quando o mouse passa sobre ele
        this.celsinhoBtn.setScale(1.1).setPosition(270, 326);
      },
      this
    );

    this.celsinhoBtn.on(
      "pointerout",
      () => {
        // Retorna o tamanho do sprite ao normal quando o mouse sai de cima dele
        this.celsinhoBtn.setScale(1).setPosition(270, 336);
      },
      this
    );

    // Define ação quando o jogador escolhe a personagem kelvinha
    this.kelvinhaBtn.on(
      "pointerdown",
      () => {
        this.buttonSound.play();
        gameState.player = "kelvinha"; // Define o personagem escolhido como "celsinho" no estado do jogo
        this.scene.start("ChoosePhase");
      },
      this
    );

    // Define ações de interação com o mouse para a personagem kelvinha
    this.kelvinhaBtn.on(
      "pointerover",
      () => {
        // Aumenta o tamanho do sprite quando o mouse passa sobre ela
        this.kelvinhaBtn.setScale(1.1).setPosition(650, 337);
      },
      this
    );

    this.kelvinhaBtn.on(
      "pointerout",
      () => {
        // Retorna o tamanho do sprite ao normal quando o mouse sai de cima dela
        this.kelvinhaBtn.setScale(1).setPosition(650, 346);
      },
      this
    );

    // Botão de som
    this.soundBtn = this.add // Adiciona um botão de som
      .image(gameState.width - 50, 50, "soundBtn")
      .setTint(gameState.isSoundMute ? "0x858585": "0xffffff")
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Adiciona evento de clique ao botão de som
    this.soundBtn.on("pointerdown", () => {
      this.buttonSound.play();
      soundGame(this, this.soundBtn);
    });

    scaleElement("over", this.soundBtn, 1.1);
    scaleElement("out", this.soundBtn, 1);

    // Botão de tela cheia
    this.fullscreenBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 130, 50, "fullscreenBtn")
      .setTint(gameState.isFullscreen ? "0xffffff" : "0x707070")
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
