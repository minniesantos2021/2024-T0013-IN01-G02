// Importa as dependências necessárias
import { gameState } from "../main.js"; // Importa o objeto gameState que contém informações globais do jogo
import { scaleElement, startFullscreen, soundGame } from "../functions.js";

export default class ChoosePhase extends Phaser.Scene {
  constructor() {
    super({ key: "ChoosePhase" });

    // Botões
    this.soundBtn;
    this.fullscreen;
  }

  preload() {
    // Adiciona elementos visuais da fase
    this.load.image("phases", "src/assets/choosePhase/phaseSelect.png");
    this.load.image("fase1C", "src/assets/choosePhase/fase1C.png");
    this.load.image("fase2C", "src/assets/choosePhase/fase2C.png");
    this.load.image("fase3C", "src/assets/choosePhase/fase3C.png");
    this.load.image("fase1K", "src/assets/choosePhase/fase1K.png");
    this.load.image("fase2K", "src/assets/choosePhase/fase2K.png");
    this.load.image("fase3K", "src/assets/choosePhase/fase3K.png");
    this.load.image("legenda1", "src/assets/choosePhase/legenda1.png");
    this.load.image("legenda2", "src/assets/choosePhase/legenda2.png");
    this.load.image("legenda3", "src/assets/choosePhase/legenda3.png");
  }

  create() {
    this.buttonSound = this.sound.get("buttonSound");

    this.add.image(gameState.width / 2, gameState.height / 2, "phases"); //Adiciona a imagem que comporta as imagens das fases

    if (gameState.player === "celsinho") { // Verifica se o personagem é o Celsinho
      this.phase1 = this.add.image(495, 175, "fase1C").setScale(0.3); // Adiciona a imagem da fase 1 para o personagem "Celsinho"

      scaleElement("over", this.phase1, 0.31);
      scaleElement("out", this.phase1, 0.3);

      this.phase2 = this.add // Adiciona a imagem da fase 2 para o personagem "Celsinho" e define interatividade
        .image(495, 310, "fase2C")
        .setScale(0.3)
        .setInteractive({ cursor: "pointer" });

      this.phase3 = this.add // Adiciona a imagem da fase 3 para o personagem "Celsinho" e define interatividade
        .image(495, 440, "fase3C")
        .setScale(0.3)
        .setInteractive({ cursor: "pointer" });
    }

    if (gameState.player === "kelvinha") { // Verifica se o personagem é a Kelvinha
      this.phase1 = this.add.image(495, 175, "fase1K").setScale(0.3);

      scaleElement("over", this.phase1, 0.31);
      scaleElement("out", this.phase1, 0.3);

      this.phase2 = this.add
        .image(495, 310, "fase2K")
        .setScale(0.3)
        .setInteractive({ cursor: "pointer" });

      this.phase3 = this.add
        .image(495, 440, "fase3K")
        .setScale(0.3)
        .setInteractive({ cursor: "pointer" });
    }

    // Adiciona o nome das fases em forma de imagem 
    this.legenda = this.add.image(495, 120, "legenda1").setScale(0.7);
    this.legenda = this.add.image(495, 255, "legenda2").setScale(0.7);
    this.legenda = this.add.image(495, 390, "legenda3").setScale(0.7);

    this.phase1.setInteractive({ cursor: "pointer" }); // Define interatividade

    this.phase1.on("pointerdown", () => {
      this.sound.stopByKey("themeStartScene");
      this.buttonSound.play();
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.time.delayedCall(
        500, // Define o tempo de espera (500 milissegundos) antes de iniciar a próxima fase
        () => {
          this.scene.start("Phase1"); // Inicia a cena "Phase1" 
        },
        [],
        this
      );
    });

    // Botão de som
    this.soundBtn = this.add // Adiciona um botão de som
      .image(gameState.width - 50, 50, "soundBtn")
      .setTint(gameState.isSoundMute ? "0x858585": "0xffffff")
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Adiciona evento de clique ao botão de tela cheia
    this.soundBtn.on("pointerdown", () => {
      this.buttonSound.play();
      soundGame(this, this.soundBtn);
    });

    scaleElement("over", this.soundBtn, 1.1);
    scaleElement("out", this.soundBtn, 1);

    // Botão de tela cheia
    this.fullscreenBtn = this.add // Adiciona um botão de tela cheia
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

    // Mecânica de possibilitar ou nao o usuario de acessar dadas fases
    if (gameState.phase < 2) {
      this.phase2.setTint("0x858585"); // Define uma cor de tonalidade cinza para o botão (fase 2 bloqueada)
    } else {
      scaleElement("over", this.phase2, 0.31);
      scaleElement("out", this.phase2, 0.3);

      this.phase2.on("pointerdown", () => {
        this.sound.stopByKey("themeStartScene");
        this.buttonSound.play();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(
          500, 
          () => {
            this.scene.start("Phase2"); // Inicia a fase 2
          },
          [],
          this
        );
      });
    }

    if (gameState.phase < 3) {
      this.phase3.setTint("0x858585"); // Define uma cor de tonalidade cinza para o botão
    } else {
      scaleElement("over", this.phase3, 0.31);
      scaleElement("out", this.phase3, 0.3);

      this.phase3.on("pointerdown", () => {
        this.sound.stopByKey("themeStartScene");
        this.buttonSound.play();
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.time.delayedCall(
          500, 
          () => {
            this.scene.start("Phase3");
          },
          [],
          this
        );
      });
    }
  }
}
