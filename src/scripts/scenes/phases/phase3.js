import { gameState } from "../../main.js";

import Trivia from "../trivia.js";

import Player from "../../player.js";

// Importa funções de controle para serem utilizadas do arquivo "functions.js"
import {
  endGame,
  winGame,
  addBurns,
  soundGame,
  pauseGame,
  cleanBeasts,
  restartGame,
  scaleElement,
  teleportPlayer,
  pauseForTrivia,
  startFullscreen,
  updateProgressBar,
} from "../../functions.js";

// Define a classe Phase3, que representa a terceira fase do jogo, estendendo Phaser.Scene.
export default class Phase3 extends Phaser.Scene {
  constructor() {
    super({ key: "Phase3" });

    // Declaração de variáveis para elementos visuais e de jogo
    this.floor;
    this.player;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.restartBtn;
    this.fullscreenBtn;
    this.winGameTxt1;
    this.winGameTxt2;
    this.attentionBullet;

    // Bestiário:
    this.pans;
    this.irons;
    this.stoves;
    this.bullets;

    this.progressBar; // Receberá a barra de progresso
    this.progressHead; // Receberá a barra de progresso
    this.firstTime = true;

    // Temporizador para o personagem escapar de plataforma
    this.escapeTimer;
    this.timerIsCreate = false;

    // Isto receberá o retângulo vermelho que aparecerá ao colidir com plataformas
    this.screenOverlay;

    // Controle para saber se jogador toca o chão
    this.isTouchingFloor = false;

    // Controle para saber se a partida está acontecendo
    this.gameIsRunning = true;
  }

  // Carrega recursos necessários para a cena
  preload() {
    // Carrega elementos que irão compor o mapa
    this.load.tilemapTiledJSON("mapPhase3", "src/assets/phase3/map/floor.json"); // Carrega Json com informações sobre a construção do mapa
    this.load.image("floorTileset", "src/assets/phase3/map/floorTileset.png"); // Imagem para construir o mapa do jogo
    this.load.image("tilesetDoor", "src/assets/phase3/map/tilesetDoor.png");
    this.load.image("tilesetSky", "src/assets/phase3/map/tilesetSky.png");
    this.load.image("tilesetTile", "src/assets/phase3/map/tilesetTile.png");
    this.load.image("tilesetTile2", "src/assets/phase3/map/tilesetTile2.png");
    this.load.image("tilesetTile3", "src/assets/phase3/map/tilesetTile3.png");
    this.load.image("tilesetWindow", "src/assets/phase3/map/tilesetWindow.png");
    this.load.image("marta", "src/assets/phase3/marta.png");

    this.load.image("attentionBullet", "src/assets/phase3/attentionBullet.png"); // Elemento de HUD para alertar sobre os projeteis

    this.load.image("checkpointFlag", "src/assets/phase3/checkpointFlag.png"); // bandeira para indicar o checkpoint

    // Carrega elementos do bestiário
    this.load.spritesheet("iron", "src/assets/phase3/iron.png", {
      frameWidth: 80,
      frameHeight: 102.8,
    });

    this.load.spritesheet("stove", "src/assets/phase3/stove.png", {
      frameWidth: 80,
      frameHeight: 80,
    });

    this.load.spritesheet("pan", "src/assets/phase3/pan.png", {
      frameWidth: 80,
      frameHeight: 37,
    });

    this.load.audio("musicPhase3", "src/assets/phase3/musicPhase3.mp3");

    this.lastCheckpoint = 0; // Último marco de posição para a lógica de disparo de projéteis

    this.gameIsRunning = true;

    this.burnsIcons = [];
  }

  create() {
    this.firstTime = true;

    this.cameras.main.fadeIn(1000, 0, 0, 0); // Faz a transição de fade-in da câmera com duração de 1000 milissegundos

    this.cameras.main.setBounds(0, 0, 62624, gameState.height);

    // Associa as imagens que compõe o mapa com o json
    const map = this.make.tilemap({ key: "mapPhase3" }); // Cria o mapa
    const tilesetFloor = map.addTilesetImage("floor", "floorTileset");
    const tilesetDoor = map.addTilesetImage("door", "tilesetDoor");
    const tilesetSky = map.addTilesetImage("sky", "tilesetSky");
    const tilesetTile = map.addTilesetImage("tile", "tilesetTile");
    const tilesetTile2 = map.addTilesetImage("tile2", "tilesetTile2");
    const tilesetTile3 = map.addTilesetImage("tile3", "tilesetTile3");
    const tilesetWindow = map.addTilesetImage("window", "tilesetWindow");

    // Cria uma camada para cada imagem
    map.createLayer("sky", tilesetSky);
    map.createLayer("door", tilesetDoor);
    map.createLayer("tile", tilesetTile);
    map.createLayer("tile2", tilesetTile2);
    map.createLayer("tile3", tilesetTile3);
    map.createLayer("window", tilesetWindow);

    this.floor = map.createLayer("floor", tilesetFloor);
    this.floor.setCollisionByProperty({ collider: true }); // Adiciona colisão onde houver a propriedade collider = verdadeiro

    // Configura a gravidade para essa cena específica
    this.physics.world.gravity.y = 1000;

    // Adiciona o jogador
    this.player = new Player(this, 0, 100, gameState.player); // Cria uma nova instância do jogador, passando as coordenadas x e y iniciais, e o tipo de jogador
    this.player.addPlayerToScene(this); // Adiciona o jogador na cena
    this.player.setVelocityX(300); // Define a velocidade inicial do jogador
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do jogador, baseada no tipo de jogador e no estado de "correndo"
    this.physics.add.collider(
      this.player,
      this.floor,
      () => {
        this.isTouchingFloor = true;
      },
      null,
      this
    ); // Adiciona uma colisão entre o jogador e a camada do chão

    // Configura a câmera para seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o celsinho deslocada 400px para direita

    this.buttonSound = this.sound.get("buttonSound");

    this.musicPhase3 = this.sound.add("musicPhase3", {
      volume: 0.3,
      loop: true,
    });

    this.musicPhase3.play();

    // Criação do bestiário
    this.pans = this.physics.add.group();
    this.irons = this.physics.add.group();
    this.stoves = this.physics.add.group();
    this.bullets = this.physics.add.group();

    this.physics.add.collider(this.pans, this.floor);
    this.physics.add.collider(this.irons, this.floor);
    this.physics.add.collider(this.stoves, this.floor);

    [this.pans, this.irons, this.stoves, this.bullets].forEach((obstacle) => {
      // Itera sobre o array com o bestiário e adiciona o chamado a uma função no caso do personagem sobrepor algum item do bestiário
      this.physics.add.collider(
        this.player,
        obstacle,
        () => {
          this.cameras.main.shake(240, 0.01);

          if (this.burnsIcons.length) this.burnsIcons.pop().destroy(); // Diminui uma tentativa de trivia

          if (this.burnsIcons.length == 1) {
            this.tweens.add({
              targets: this.burnsIcons[0],
              alpha: 0,
              duration: 500,
              ease: "Power1",
              yoyo: true,
              repeat: -1,
            });
          }

          if (!this.scene.isActive("Trivia") && this.burnsIcons.length) {
            this.musicPhase3.pause();

            this.gameIsRunning = false;

            pauseForTrivia(this, this.player, false);

            this.scene.add("Trivia", Trivia, true, this.scene.key);
          } else {
            addBurns(this, 210, 315, 26, this.burnsIcons);

            cleanBeasts(this.pans, this.irons, this.stoves, this.bullets);

            this.addPans();
            this.addIrons();
            this.addStoves();

            restartGame(
              this,
              this.player,
              this.player.x > this.checkpointFlag2.x
                ? this.checkpointFlag2.x - 500
                : this.player.x > this.checkpointFlag1.x
                ? this.checkpointFlag1.x - 350
                : 0,
              this.player.x > this.checkpointFlag2.x
                ? this.checkpointFlag2.y - 300
                : this.player.x > this.checkpointFlag1.x
                ? this.checkpointFlag1.y - 300
                : 300
            );
          }
        },
        null,
        this
      );
    });

    [
      // Cria a animação dos bestiários
      { key: "ironHeating", sprite: "iron", end: 4 },
      { key: "panBoiling", sprite: "pan", end: 5 },
      { key: "stoveBaking", sprite: "stove", end: 2 },
    ].forEach(({ key, sprite, end }) => {
      let shouldCreateAnimation = true; // Variável para controlar se vai criar a animação ou não

      Object.keys(this.anims.anims.entries).forEach((entryKey) => {
        if (key == entryKey) {
          shouldCreateAnimation = false;
        }
      });

      if (shouldCreateAnimation) {
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers(sprite, {
            start: 0,
            end: end,
          }),
          frameRate: 5,
          repeat: -1,
        });
      }
    });

    this.addPans();
    this.addIrons();
    this.addStoves();

    this.events.on("triviaCompleted", this.handleTriviaCompleted, this);

    teleportPlayer(this, this.player, 0, this.cameras.main.getBounds().width);

     // checkpoint
     this.checkpointFlag1 = this.add
     .image(34800, 115, "checkpointFlag")
     .setScale(1.5, 0.8);
   this.checkpointFlag2 = this.add
     .image(50750, 340, "checkpointFlag")
     .setScale(1.5, 0.8);

    // Animação do aviso de projétil:
    this.tweens.add({
      targets: this.attentionBullet,
      scaleX: 1.1, // A escala x aumenta para 1.1
      scaleY: 1.1, // A escala y aumenta para 1.1
      duration: 150, // Duração de 1 segundo
      yoyo: true, // Alterna entre o valor inicial e o final
      repeat: -1, // Repete infinitamente
    });

    // Botão para pausar
    this.pauseBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 60, 60, "pauseBtn")
      .setScale(1)
      .setVisible(true)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Mesma lógica dos botões acima para o botão pause
    this.pauseBtn.on("pointerdown", () => {
      if (this.gameIsRunning) {
        this.buttonSound.play();
        pauseGame(
          this,
          this.player,
          this.soundBtn,
          this.fullscreenBtn,
          this.homeBtn,
          this.playerVelocityX
        );
      }
    });

    scaleElement("over", this.pauseBtn, 1.1);
    scaleElement("out", this.pauseBtn, 1);

    this.winGameTxt1 = this.add
      .image(gameState.width / 2, gameState.height / 2 - 100, "winGameTxt1")
      .setScale(1.5)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.winGameTxt2 = this.add
      .image(gameState.width / 2, gameState.height / 2 + 20, "winGameTxt2")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.attentionBullet = this.add // Adiciona o ícone que aparecerá como alerta do surgimento de projéteis
      .image(gameState.width - 50, 0, "attentionBullet")
      .setScale(1)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    // Botão de som
    this.soundBtn = this.add // Adiciona um botão de som
      .image(gameState.width - 150, 60, "soundBtn")
      .setScale(1)
      .setTint(gameState.isSoundMute ? "0x858585" : "0xffffff")
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Mesma lógica dos botões acima para o botão do som
    this.soundBtn.on("pointerdown", () => {
      this.buttonSound.play();
      soundGame(this, this.soundBtn);
    });

    scaleElement("over", this.soundBtn, 1.1);
    scaleElement("out", this.soundBtn, 1);

    // Botão de tela cheia:
    this.fullscreenBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 240, 60, "fullscreenBtn")
      .setTint(gameState.isFullscreen ? "0xffffff" : "0x707070")
      .setDepth(1e9)
      .setVisible(false)
      .setScrollFactor(0)
      .setInteractive({ cursor: "pointer" });

    this.fullscreenBtn.on("pointerdown", () => {
      this.buttonSound.play();
      startFullscreen(this, this.fullscreenBtn);
    });

    scaleElement("over", this.fullscreenBtn, 1.1);
    scaleElement("out", this.fullscreenBtn, 1);

    this.homeBtn = this.add // Adiciona um botão de home
      .image(gameState.width - 330, 60, "homeBtn")
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    this.homeBtn.on("pointerdown", () => {
      this.buttonSound.play();
      this.sound.stopByKey("musicPhase3");

      gameState.player = "";

      this.scene.start("StartScene");
      if (this.scene.isActive("Trivia")) this.scene.remove("Trivia");
    });

    scaleElement("over", this.homeBtn, 1.1);
    scaleElement("out", this.homeBtn, 1);

    // Botão para reiniciar jogo
    this.restartBtn = this.add // Adiciona um botão de restart
      .image(gameState.width / 2 - 130, gameState.height / 2, "restartBtn")
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setScale(1.5)
      .setInteractive({ cursor: "pointer" });

    this.restartBtn.on("pointerdown", () => {
      this.buttonSound.play();

      addBurns(this, 210, 315, 26, this.burnsIcons);

      this.gameIsRunning = true;

      cleanBeasts(this.pans, this.irons, this.stoves, this.bullets);

      this.addPans();
      this.addIrons();
      this.addStoves();

      restartGame(
        this,
        this.player,
        this.player.x > this.checkpointFlag2.x
          ? this.checkpointFlag2.x - 500
          : this.player.x > this.checkpointFlag1.x
          ? this.checkpointFlag1.x - 350
          : 0,
        this.player.x > this.checkpointFlag2.x
          ? this.checkpointFlag2.y - 300
          : this.player.x > this.checkpointFlag1.x
          ? this.checkpointFlag1.y - 300
          : 300,
        this.homeBtn,
        this.restartBtn,
        this.screenOverlay
      );
    });

    scaleElement("over", this.restartBtn, 1.7);
    scaleElement("out", this.restartBtn, 1.5);

    // HUD
    this.add
      .image(10, 10, "burnsFrame")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1e9);

    addBurns(this, 210, 315, 26, this.burnsIcons);

    // Barra de progresso
    this.add
      .rectangle(gameState.width / 2, gameState.height - 13, 236, 8, 0x000000)
      .setScrollFactor(0)
      .setAlpha(0.5)
      .setDepth(1e9);

    this.progressBar = this.add
      .rectangle(
        gameState.width / 2 - 120,
        gameState.height - 18,
        240,
        10,
        0xffffff
      )
      .setScrollFactor(0)
      .setOrigin(0)
      //.setScale(0, 1)
      .setDepth(1e9);

    this.add
      .image(gameState.width / 2, gameState.height - 13, "progressBarFrame")
      .setScrollFactor(0)
      .setDepth(1e9);

    this.progressHead = this.add
      .image(
        gameState.width / 2 - 110,
        gameState.height - 13,
        gameState.player + "Head"
      )
      .setScrollFactor(0)
      .setScale(0.2)
      .setDepth(1e9);

    this.screenOverlay = this.add
      .rectangle(0, 0, gameState.width, gameState.height, 0xff0000)
      .setOrigin(0)
      .setScrollFactor(0)
      .setAlpha(0);

    this.dial1Active = false;

    if (gameState.player === "celsinho") {
      this.actCha = "Celsinho";
    }
    if (gameState.player === "kelvinha") {
      this.actCha = "Kelvinha";
    }

    // Criar a caixa de diálogo
    this.dialogBox = this.add.graphics();
    this.dialogBox.fillStyle(0x000000, 0.8);
    this.dialogBox.fillRect(400, 190, 700, 60);
    this.dialogBox.fillStyle(0x000000, 0.8);
    this.dialogBox.fillRect(61800, 65, 700, 80);

    // Texto da caixa de diálogo
    this.dialogText = this.add.text(410, 200, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });
    this.dialogText1 = this.add.text(61810, 75, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });

    this.dialogue1 =
      "Mãe: " +
      this.actCha +
      " me ajuda! Eu estou cheia de coisas para fazer e tudo parece que pode me queimar! Eu preciso de você!";

    this.dialogue2 = "Mãe: Obrigada, " + this.actCha + ", você me salvou!";

    this.dialogue3 =
      this.actCha +
      ": Mãe, você precisa tomar cuidado com todos esses aparelhos elétricos espalhados na casa…";

    this.dialogue4 = "Mãe: Sim, eu vou tomar mais cuidado!";

    this.dialogue5 =
      this.actCha + ": Ok, mamãe, isso é para você não se machucar.";

    this.dialogue6 = "Mãe: Tudo bem, eu vou tomar cuidado";

    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);

    this.add.image(540, 350, "marta").setScale(0.13);
    this.add.image(62300, 220, "marta").setScale(0.13);
  }

  update() {
    if (this.player.x > 400 && this.player.x < 500 && this.firstTime) {
      this.gameIsRunning = false;
      this.dialogText.setText(this.dialogue1);
      if (this.dial1Active) {
        this.time.delayedCall(
          8000,
          () => {
            this.player.setVelocityX(300);
            this.dialogBox.setVisible(false);
            this.dialogText.setVisible(false);
            this.dial1Active = false;
            this.gameIsRunning = true;
            this.firstTime = false;
          },
          [],
          this
        );
      } else {
        this.player.setVelocityX(0);
      }
      this.dialogText.setVisible(true);
      this.dialogBox.setVisible(true);

      this.dial1Active = true;
      this.dialogue1A = true;
    }
    if (this.player.x > 62200 && this.player.x < 62300) {
      this.gameIsRunning = false;

      this.input.on("pointerdown", () => {
        this.skip2 = true;
      });

      this.dialogText1.setVisible(true);
      this.dialogBox.setVisible(true);

      if (this.dialogue1A) {
        this.dialogText1.setText(this.dialogue2);
        this.time.delayedCall(
          3500,
          () => {
            this.dialogue1A = false;
            this.dialogue2A = true;
            this.dialogText1.setText(this.dialogue3);
          },
          [],
          this
        );
      }

      if (this.dialogue2A && !this.dialogue3A) {
        this.time.delayedCall(
          3500,
          () => {
            this.dialogue2A = false;
            this.dialogue3A = true;
            this.dialogText1.setText(this.dialogue4);
          },
          [],
          this
        );
      }
      if (this.dialogue3A && !this.dialogue4A) {
        this.time.delayedCall(
          3500,
          () => {
            this.dialogue3A = false;
            this.dialogue4A = true;
            this.dialogText1.setText(this.dialogue5);
          },
          [],
          this
        );
      }
      if (this.dialogue4A && !this.dialogue5A) {
        this.time.delayedCall(
          3500,
          () => {
            this.dialogue4A = false;
            this.dialogue5A = true;
            this.dialogText1.setText(this.dialogue6);
          },
          [],
          this
        );
      }

      if (this.dialogue5A) {
        this.gameIsRunning = true;
        this.player.setVelocityX(100);
      } else {
        this.player.setVelocityX(0);
      }
    }

    if (
      this.player.x >= this.cameras.main.getBounds().width - 300 &&
      this.gameIsRunning
    ) {
      // Se o jogador alcançou o final da fase, chama a função de vitória do jogo
      winGame(
        this, // Passagem do contexto atual
        this.winGameTxt1, // Texto de vitória (parte 1)
        this.winGameTxt2, // Texto de vitória (parte 2)
        this.homeBtn, // Botão para retornar ao menu principal
        this.player, // Referência ao jogador
        this.pauseBtn
      );
      this.gameIsRunning = false;
    } else if (this.player.y >= gameState.height && this.gameIsRunning) {
      // Caso o personagem caia do mapa
      endGame(this, this.restartBtn, this.homeBtn, this.screenOverlay);
      this.gameIsRunning = false;
    } else if (this.gameIsRunning) {
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se mstovedo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão

      this.fireBulletControl();
    }

    if (this.player.body.velocity.x <= 0 && this.gameIsRunning) {
      // Caso o personagem colida e trave
      this.platformCollision();
      this.timerIsCreate = true;
    } else if (this.escapeTimer && this.gameIsRunning) {
      this.tweens.add({
        targets: this.screenOverlay,
        alpha: 0, // Volta ao transparente
        duration: 500, // Duração da transição
        ease: "Linear",
      });
      this.escapeTimer.remove();
      this.timerIsCreate = false;
    }

    updateProgressBar(this, this.player, this.progressBar, this.progressHead);
  }

  platformCollision() {
    this.player.setVelocityX(300);

    if (!this.timerIsCreate) {
      // Gradativamente escurece a tela para vermelho
      this.tweens.add({
        targets: this.screenOverlay,
        alpha: 0.7, // Defina o valor desejado para a opacidade vermelha
        duration: 3000, // Duração da transição
        ease: "Linear",
      });
      this.escapeTimer = this.time.delayedCall(
        3000,
        () => {
          // Se o temporizador expirar e o jogador não tiver escapado, chame a função endGame()
          endGame(this, this.restartBtn, this.homeBtn, this.screenOverlay);
          this.gameIsRunning = false;
        },
        null,
        this
      );
    }
  }

  // RANGE DE DISPAROS:
  // 1ª ZONA: 11872 - 21664
  // 2ª ZONA: 26304 - 31680
  // 3ª ZONA: 43648 - 50240

  fireBulletControl() {
    if (
      // Verifica se o jogador está em uma determinada área do jogo e se avançou uma certa distância
      ((this.player.x >= 11872 && this.player.x <= 21664) || // Primeira área
        (this.player.x >= 26304 && this.player.x <= 31680) || // Segunda área
        (this.player.x >= 43648 && this.player.x <= 50240)) && // Terceira área
      this.player.x > this.lastCheckpoint + 1000
    ) {
      this.fireBullet(); // As coordenadas de disparo dos projéteis começam a ser aplicadas
      this.lastCheckpoint = this.player.x; // Atualiza o último ponto de controle para a posição atual do jogador
    }

    this.bullets.getChildren().forEach((bullet) => {
      this.attentionBullet.y = bullet.y; // Define a posição y do elemento de atenção igual à posição y do projétil, iterando os projéteis

      if (bullet.x < this.cameras.main.scrollX + gameState.width + 1000) {
        // Verifica se o projétil está dentro da área de visão da câmera mais uma margem de 1000 pixels
        this.attentionBullet.setVisible(true);
      }

      if (bullet.x < this.cameras.main.scrollX + gameState.width - 100) {
        // Verifica se o projétil está fora da área de visão da câmera menos uma margem de 100 pixels
        this.attentionBullet.setVisible(false);
      }

      // Se o projétil sair da tela, será removido
      if (bullet.x < this.cameras.main.scrollX) {
        bullet.destroy(); // Remove o projétil do jogo
      }
    });
  }

  fireBullet() {
    const shouldBeFired = Phaser.Math.RND.between(0, 3); // Determina aleatoriamente se o projétil deve ser disparado com uma probabilidade matemática
    if (shouldBeFired == 0) return; // 66,66% de chance do projétil ser disparado
    console.log("fireBullet()");
    const bulletSpeedRandom = Phaser.Math.RND.between(-300, -600); // Determina aleatoriamente a velocidade do projétil
    let bulletHeight = 0;
    Phaser.Math.RND.between(0, 1) ? (bulletHeight = -50) : (bulletHeight = 20); // Determina aleatoriamente a altura do projétil
    const bulletTypeRandom = Phaser.Math.RND.between(0, 1); // Determina aleatoriamente o tipo de besta a ser projetada

    // Define as propriedades do projétil com base no tipo aleatório selecionado
    let sprite = bulletTypeRandom ? "pan" : "iron";
    let animation = bulletTypeRandom ? "panBoiling" : "ironHeating";
    let sizeX = 0;
    let sizeY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let scale = 0;

    if (bulletTypeRandom) {
      sizeX = 75;
      sizeY = 18;
      offsetX = 0;
      offsetY = 18;
      scale = 0.6;
    } else {
      sizeX = 65;
      sizeY = 85;
      offsetX = 15;
      offsetY = 11;
      scale = 0.4;
    }

    const bullet = this.bullets // Cria o projétil na posição inicial e configura suas propriedades
      .create(
        gameState.width + this.player.x + 1500,
        this.player.y + bulletHeight,
        sprite
      )
      .setScale(scale) // Define a escala do sprite do projétil
      .setScale(scale)
      .setSize(sizeX, sizeY) // Define o tamanho do elemento colisor
      .setOffset(offsetX, offsetY) // Define o deslocamento do colisor
      .setVelocityX(bulletSpeedRandom); // Define a velocidade horizontal do projétil
    bullet.body.setAllowGravity(false); // Desativa a gravidade do corpodo projétil
    bullet.anims.play(animation, true); // Inicia sua animação
  }

  // Função executada ao receber o resultado da trivia
  handleTriviaCompleted(success) {
    this.scene.remove("Trivia");

    this.musicPhase3.resume();

    this.gameIsRunning = true;

    if (success) {
      [this.pans, this.irons, this.stoves, this.bullets].forEach((group) => {
        const children = group.getChildren();
        for (let i = 0; i < children.length; i++) {
          if (
            children[i].x > this.cameras.main.scrollX &&
            children[i].x < this.cameras.main.scrollX + gameState.width
          ) {
            children[i].destroy();
            i--;
          }
        }
      });

      // Função que pausa o jogo para a Trivia
      pauseForTrivia(this, this.player, true);
    } else {
      cleanBeasts(this.pans, this.irons, this.stoves, this.bullets);

      this.addPans();
      this.addIrons();
      this.addStoves();

      addBurns(this, 210, 315, 26, this.burnsIcons);

      restartGame(
        this,
        this.player,
        this.player.x > this.checkpointFlag2.x
          ? this.checkpointFlag2.x - 500
          : this.player.x > this.checkpointFlag1.x
          ? this.checkpointFlag1.x - 350
          : 0,
        this.player.x > this.checkpointFlag2.x
          ? this.checkpointFlag2.y - 300
          : this.player.x > this.checkpointFlag1.x
          ? this.checkpointFlag1.y - 300
          : 300
      );
    }
  }

  addIrons() {
    const ironCoordinates = [
      // Adiciona múltiplos ferros de passsar roupa no mapa
      // Armazena valores de coordenadas de colocação de bestiários (ferro de passar roupa) dentro de um array
      { x: 1100, y: 200, scale: 0.6 }, // Armazena valores de coordenadas de colocação de bestiários (ferro de passar roupa) dentro de um array
      { x: 3550, y: 200, scale: 0.6 },
      { x: 4500, y: 200, scale: 0.6 },
      { x: 6510, y: 200, scale: 0.6 },
      { x: 5400, y: 200, scale: 0.6 },
      { x: 6200, y: 200, scale: 0.6 },
      { x: 7750.5, y: 200, scale: 0.6 },
      { x: 9490, y: 200, scale: 0.6 },
      { x: 12495, y: 200, scale: 0.6 },
      { x: 13200, y: 200, scale: 0.6 },
      { x: 17400, y: 200, scale: 0.6 },
      { x: 26658, y: 200, scale: 0.6 },
      { x: 28000, y: 200, scale: 0.6 },
      { x: 32695, y: 0, scale: 0.6 },
      { x: 33283, y: 0, scale: 0.6 },
      { x: 34200, y: 0, scale: 0.6 },
      { x: 38342, y: 0, scale: 0.6 },
      { x: 38825, y: 0, scale: 0.6 },
      { x: 40550, y: 200, scale: 0.6 },
      { x: 46705, y: 200, scale: 0.6 },
      { x: 46745, y: 200, scale: 0.6 },
      { x: 60635, y: 200, scale: 0.6 },
      { x: 61290, y: 200, scale: 0.6 },
    ];

    ironCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.6) {
        sizeX = 50;
        sizeY = 75;
        offsetX = 25;
        offsetY = 20;
      }

      const iron = this.irons
        .create(coord.x, coord.y, "iron")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      iron.anims.play("ironHeating", true);
    });
  }

  addPans() {
    const panCoordinates = [
      // Adiciona múltiplas panelas quentes no mapa
      // Armazena valores de coordenadas de colocação de bestiários (panela quente) dentro de um array
      { x: 1400, y: 200, scale: 1 },
      { x: 7140, y: 200, scale: 1 },
      { x: 7200, y: 200, scale: 1 },
      { x: 7430, y: 200, scale: 1 },
      { x: 8485, y: 200, scale: 1 },
      { x: 9900, y: 200, scale: 1 },
      { x: 12800, y: 200, scale: 1 },
      { x: 14425, y: 200, scale: 1 },
      { x: 16540, y: 200, scale: 1 },
      { x: 16585, y: 200, scale: 1 },
      { x: 19300, y: 200, scale: 1 },
      { x: 24325, y: 200, scale: 1 },
      { x: 24385, y: 200, scale: 1 },
      { x: 25650, y: 200, scale: 1 },
      { x: 30700, y: 200, scale: 1 },
      { x: 35885, y: 200, scale: 1 },
      { x: 37815, y: 200, scale: 1 },
      { x: 39575, y: 200, scale: 1 },
      { x: 40000, y: 100, scale: 1 },
      { x: 44100, y: 100, scale: 1 },
      { x: 46185, y: 100, scale: 1 },
      { x: 47000, y: 100, scale: 1 },
      { x: 48400, y: 100, scale: 1 },
      { x: 58900, y: 100, scale: 1 },
      { x: 61580, y: 100, scale: 1 },
    ];

    panCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 75;
        sizeY = 18;
        offsetX = 0;
        offsetY = 18;
      }

      const pan = this.pans
        .create(coord.x, coord.y, "pan")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pan.anims.play("panBoiling", true);
    });
  }

  addStoves() {
    // Adiciona múltiplos fornos no mapa
    const stoveCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (forno) dentro de um array
      { x: 2150, y: 320, scale: 0.7 },
      { x: 4000, y: 320, scale: 0.7 },
      { x: 4900, y: 320, scale: 0.7 },
      { x: 5800, y: 320, scale: 0.7 },
      { x: 6600, y: 320, scale: 0.7 },
      { x: 8200, y: 200, scale: 0.7 },
      { x: 10580, y: 200, scale: 0.7 },
      { x: 11490, y: 200, scale: 0.7 },
      { x: 15325, y: 200, scale: 0.7 },
      { x: 19700, y: 200, scale: 0.7 },
      { x: 24900, y: 200, scale: 0.7 },
      { x: 25298, y: 200, scale: 0.7 },
      { x: 29590, y: 200, scale: 0.7 },
      { x: 33800, y: 0, scale: 0.7 },
      { x: 37475, y: 0, scale: 0.7 },
      { x: 42800, y: 0, scale: 0.7 },
      { x: 45500, y: 200, scale: 0.7 },
      { x: 48935, y: 200, scale: 0.7 },
      { x: 59185, y: 0, scale: 0.7 },
      { x: 59500, y: 0, scale: 0.7 },
      { x: 59785, y: 0, scale: 0.7 },
      { x: 61000, y: 200, scale: 0.7 },
    ];

    stoveCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.7) {
        sizeX = 65;
        sizeY = 55;
        offsetX = 8;
        offsetY = 25;
      }

      const stove = this.stoves
        .create(coord.x, coord.y, "stove")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      stove.anims.play("stoveBaking", true);
    });
  }
}
