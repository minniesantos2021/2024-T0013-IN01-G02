import { gameState } from "../../main.js";

import Trivia from "../trivia.js";

import Player from "../../player.js";

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

// Define a classe Phase2, que representa a segunda fase do jogo, estendendo Phaser.Scene.
export default class Phase2 extends Phaser.Scene {
  constructor() {
    super({ key: "Phase2" }); // Chama o construtor da classe pai (Phaser.Scene) e atribui uma chave identificadora para esta cena.

    // Declaração de variáveis para elementos visuais e de jogo
    this.ground;
    this.cabinet;
    this.player;
    this.table;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.restartBtn;
    this.nextPhaseBtn;
    this.fullscreenBtn;
    this.winGameTxt1;
    this.winGameTxt2;

    // Bestiário:
    this.coffeMachines;
    this.panWaters;
    this.panOils;

    // Temporizador para o personagem escapar de plataforma
    this.escapeTimer;
    this.timerIsCreate = false;

    this.progressBar; // Receberá a barra de progresso
    this.progressHead; // Receberá a barra de progresso
    this.firstTime = true;

    // Isto receberá o retângulo vermelho que aparecerá ao colidir com plataformas
    this.screenOverlay;

    // Controle para saber se jogador toca o chão
    this.isTouchingFloor = false;
  }

  // Função de pré-carregamento de recursos do jogo
  preload() {
    // Carrega elementos para construção do mapa do jogo
    this.load.tilemapTiledJSON("mapPhase2", "src/assets/phase2/map/map.json"); // Carrega Json com informações sobre a construção do mapa
    this.load.image("ground", "src/assets/phase2/map/tilesetGround.png"); // Imagem para construir o mapa do jogo
    this.load.image("cabinet", "src/assets/phase2/map/tilesetCabinet.png");
    this.load.image("cabinet1", "src/assets/phase2/map/tilesetCabinet1.png");
    this.load.image("tile", "src/assets/phase2/map/tilesetTile.png");
    this.load.image("window", "src/assets/phase2/map/tilesetWindow.png");
    this.load.image("oven", "src/assets/phase2/map/tilesetOven.png");
    this.load.image("freezer", "src/assets/phase2/map/tilesetFreezer.png");
    this.load.image("trash", "src/assets/phase2/map/tilesetTrash.png");
    this.load.image("sink", "src/assets/phase2/map/tilesetSink.png");
    this.load.image("table", "src/assets/phase2/map/tilesetTable.png");
    this.load.image("lara", "src/assets/phase2/lara.png");

    // Carrega os bestiários da fase
    this.load.spritesheet(
      "coffeMachine",
      "src/assets/phase2/coffeMachine.png",
      {
        frameWidth: 80,
        frameHeight: 106.66,
      }
    ); // Máquina de café

    this.load.spritesheet("panWater", "src/assets/phase2/panWater.png", {
      frameWidth: 80,
      frameHeight: 50,
    }); // Panela de água quente

    this.load.spritesheet("panOil", "src/assets/phase2/panOil.png", {
      frameWidth: 80,
      frameHeight: 50,
    }); // Panela de óleo quente

    this.load.audio("musicPhase2", "src/assets/phase2/musicPhase2.mp3");

    this.lastCheckpoint = 0; // Último marco de posição para a lógica de acréscimo de velocidade

    // Velocidade inicial do personagem:
    this.playerVelocityX = 300;

    this.gameIsRunning = true;

    this.burnsIcons = [];
  }

  create() {
    this.firstTime = true;

    this.cameras.main.fadeIn(500, 0, 0, 0);

    this.cameras.main.setBounds(0, 0, 49984, gameState.height);

    // Associa as imagens que compõe o mapa com o json
    const map = this.make.tilemap({ key: "mapPhase2" }); // Cria mapa
    const tilesetGround = map.addTilesetImage("ground", "ground");
    const tilesetTile = map.addTilesetImage("tile", "tile");
    const tilesetCabinet = map.addTilesetImage("cabinet", "cabinet");
    const tilesetCabinet1 = map.addTilesetImage("cabinet1", "cabinet1");
    const tilesetWindow = map.addTilesetImage("window", "window");
    const tilesetOven = map.addTilesetImage("oven", "oven");
    const tilesetFreezer = map.addTilesetImage("freezer", "freezer");
    const tilesetTrash = map.addTilesetImage("trash", "trash");
    const tilesetSink = map.addTilesetImage("sink", "sink");
    const tilesetTable = map.addTilesetImage("table", "table");

    // Cria uma camada para cada imagem
    map.createLayer("tile", tilesetTile);
    this.ground = map.createLayer("ground", tilesetGround);
    this.cabinet = map.createLayer("cabinet", tilesetCabinet);
    this.table = map.createLayer("table", tilesetTable);
    map.createLayer("cabinet1", tilesetCabinet1);
    map.createLayer("window", tilesetWindow);
    map.createLayer("oven", tilesetOven);
    map.createLayer("freezer", tilesetFreezer);
    map.createLayer("trash", tilesetTrash);
    map.createLayer("sink", tilesetSink);

    this.ground.setCollisionByProperty({ collider: true }); // Adiciona colisão onde houver a propriedade collider = verdadeiro
    this.cabinet.setCollisionByProperty({ collider: true });
    this.table.setCollisionByProperty({ collider: true });

    // Adiciona o jogador
    this.player = new Player(this, 0, 300, gameState.player); // Cria uma nova instância do jogador, passando as coordenadas x e y iniciais, e o tipo de jogador
    this.player.addPlayerToScene(this); // Adiciona o jogador na cena
    this.player.setVelocityX(this.playerVelocityX); // Define a velocidade inicial do jogador
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do jogador, baseada no tipo de jogador e no estado de "correndo"

    [this.ground, this.cabinet, this.table].forEach((platform) => {
      this.physics.add.collider(
        this.player,
        platform,
        () => {
          this.isTouchingFloor = true;
        },
        null,
        this
      );
    }); // Adiciona uma colisão entre o jogador e a camada do chão

    // Configura a câmera para seguir o jogador
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o celsinho deslocada 400px para direita

    this.buttonSound = this.sound.get("buttonSound");

    this.musicPhase2 = this.sound.add("musicPhase2", {
      volume: 0.3,
      loop: true,
    });

    this.musicPhase2.play();

    // Criação do bestiário
    this.coffeMachines = this.physics.add.group();
    this.panWaters = this.physics.add.group();
    this.panOils = this.physics.add.group();

    this.physics.add.collider(this.coffeMachines, this.cabinet);
    this.physics.add.collider(this.panWaters, this.cabinet);
    this.physics.add.collider(this.panOils, this.cabinet);
    this.physics.add.collider(this.coffeMachines, this.ground);
    this.physics.add.collider(this.panWaters, this.ground);
    this.physics.add.collider(this.panOils, this.ground);

    [this.panOils, this.coffeMachines, this.panWaters].forEach((obstacle) => {
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
            this.gameIsRunning = false;

            this.musicPhase2.pause();

            pauseForTrivia(this, this.player, false);

            this.scene.add("Trivia", Trivia, true, this.scene.key);
          } else {
            addBurns(this, 215, 318, 32, this.burnsIcons);

            cleanBeasts(this.panOils, this.coffeMachines, this.panWaters);

            this.addPanOils();
            this.addCoffeMachines();
            this.addPanWaters();

            restartGame(this, this.player, this.initPositionX, 300);
          }
        },
        null,
        this
      );
    });

    [
      // Criação das animações do bestiário
      { key: "coffeMachineHeating", sprite: "coffeMachine", end: 2 },
      { key: "panOilBoiling", sprite: "panOil", end: 4 },
      { key: "panWaterBoiling", sprite: "panWater", end: 6 },
    ].forEach(({ key, sprite, end }) => {
      // Itera sobre o objeto acima e cria todas as animações do bestiário

      let shouldCreateAnimation = true; // Variável para controlar se vai criar a animação ou não

      Object.keys(this.anims.anims.entries).forEach((entryKey) => {
        // Itera sobre a lista de animações existentes
        if (key == entryKey) {
          // Testa se a animação a ser criada já exite
          shouldCreateAnimation = false; // Caso exista, a variável de controle é igualada a false
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

    // Funções para adicionar o obestiário
    this.addPanOils();
    this.addCoffeMachines();
    this.addPanWaters();

    // Cria um evento para receber a resposta da trivia
    this.events.on("triviaCompleted", this.handleTriviaCompleted, this);

    teleportPlayer(this, this.player, 300, this.cameras.main.getBounds().width - 5000);

    // Botões e textos do jogo:
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
    this.fullscreenBtn = this.add // Adiciona um botão de tela cheia
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

    // Define a ação a ser executada quando o botão de home é clicado
    this.homeBtn.on("pointerdown", () => {
      this.buttonSound.play();
      this.sound.stopByKey("musicPhase2");

      gameState.player = ""; // Limpa o nome do jogador, deixando-o em branco

      this.scene.start("StartScene");

      if (this.scene.isActive("Trivia")) this.scene.remove("Trivia");
    });

    // Configura escalas para o botão de "Home" quando o cursor do mouse passa sobre ele e quando sai de cima
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

      addBurns(this, 215, 318, 32, this.burnsIcons);

      this.gameIsRunning = true;

      cleanBeasts(this.panOils, this.coffeMachines, this.panWaters);

      this.addPanOils();
      this.addCoffeMachines();
      this.addPanWaters();

      restartGame(
        this,
        this.player,
        this.initPositionX,
        300,
        this.homeBtn,
        this.restartBtn,
        this.screenOverlay
      );
    });

    scaleElement("over", this.restartBtn, 1.7);
    scaleElement("out", this.restartBtn, 1.5);

    this.nextPhaseBtn = this.add // Adiciona um botão de próxima fase
      .image(350, gameState.height / 2 + 140, "nextPhaseBtn")
      .setScale(1.35)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setInteractive({ cursor: "pointer" });

    // Configura evento de clique para o botão de próxima fase (nextPhaseBtn)
    this.nextPhaseBtn.on("pointerdown", () => {
      this.buttonSound.play();
      this.sound.stopByKey("musicPhase2");

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

    // Configura tamanhos para o botão de próxima fase quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.nextPhaseBtn, 1.5);
    scaleElement("out", this.nextPhaseBtn, 1.35);

    // HUD:
    this.add
      .image(10, 10, "burnsFrame")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1e9);

    addBurns(this, 215, 318, 32, this.burnsIcons);

    // Barra de progresso:
    this.add // adiciona um fundo escuro à moldura da barra de progresso
      .rectangle(gameState.width / 2, gameState.height - 35, 236, 8, 0x000000)
      .setScrollFactor(0)
      .setAlpha(0.5)
      .setDepth(1e9);

    this.progressBar = this.add // Adiciona a barra de progresso
      .rectangle(
        gameState.width / 2 - 120,
        gameState.height - 40,
        240,
        10,
        0xffffff
      )
      .setScrollFactor(0)
      .setOrigin(0)
      //.setScale(0, 1)
      .setDepth(1e9);

    this.add // Aiciona a moldura da barra de progresso
      .image(gameState.width / 2, gameState.height - 35, "progressBarFrame")
      .setScrollFactor(0)
      .setDepth(1e9);

    this.progressHead = this.add // Adiciona a cabeça do personagem na barra de progresso
      .image(
        gameState.width / 2 - 110,
        gameState.height - 35,
        gameState.player + "Head"
      )
      .setScrollFactor(0)
      .setScale(0.2)
      .setDepth(1e9);

    // Camada vermelha para escurecer a tela ao colidir com plataforma
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
    this.dialogBox.fillRect(49250, 240, 700, 80);

    // Texto da caixa de diálogo
    this.dialogText = this.add.text(410, 200, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });
    this.dialogText1 = this.add.text(49260, 250, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });

    this.dialogue1 =
      "Lara: Nossa, " +
      this.actCha +
      "! Essas bolhas que saem das panelas ferventes são muito legais! Será que dá pra colocar a mão? ";

    this.dialogue2 =
      "Lara: " +
      this.actCha +
      ", muito obrigado por não deixar eu me queimar! Aquelas bolhas chamam muita atenção… Mas pode deixar que eu não vou mais mexer com elas.";

    this.dialogue3 =
      this.actCha + ": Tá tudo certo, Larinha, realmente são atraentes. Mas ninguém quer ter que ir ao médico por conta de umas bolhinhas, né?";

    this.dialogue4 = "Lara: Sim, sim... Melhor não ir ao médico.";

    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);

    this.add.image(540, 415, "lara").setScale(0.065).setFlipX(true);
    this.add.image(49800, 415, "lara").setScale(0.065).setFlipX(true);
  }

  update() {
    if (this.player.x > 400 && this.player.x < 500 && this.firstTime) {
      this.gameIsRunning = false;
      this.dialogText.setText(this.dialogue1);
      if (this.dial1Active) {
        this.time.delayedCall(
          8000,
          () => {
            this.player.setVelocityX(this.playerVelocityX);
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
    if (this.player.x > 49650 && this.player.x < 49800) {
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

      if (this.dialogue3A) {
        this.gameIsRunning = true;
        this.player.setVelocityX(100);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // Quando o jogador chega ao final da fase
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
        this.pauseBtn,
        this.nextPhaseBtn,
        3 // Próxima fase após a vitória
      );
      this.gameIsRunning = false;
    } else if (this.player.y >= gameState.height && this.gameIsRunning) {
      // Caso o personagem caia do mapa
      endGame(this, this.restartBtn, this.homeBtn, this.screenOverlay);
      this.gameIsRunning = false;
    } else if (this.gameIsRunning) {
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se panWaterdo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão
    }

    if (this.player.body.velocity.x <= 0 && this.gameIsRunning) {
      // Caso o personagem colida e trave
      this.platformCollision(); // Executa essa função
      this.timerIsCreate = true;
    } else if (this.escapeTimer && this.gameIsRunning) {
      // Caso contrário, se conseguir escapar
      this.tweens.add({
        targets: this.screenOverlay,
        alpha: 0, // Volta ao transparente
        duration: 500, // Duração da transição
        ease: "Linear",
      });
      this.escapeTimer.remove(); // O temporizador é removido
      this.timerIsCreate = false;
    }

    if (this.player.x > this.lastCheckpoint + 1500) {
      // Atualização da velocidade do jogador e do valor da poisição do checkpoint
      this.player.setVelocityX((this.playerVelocityX += 8));
      this.lastCheckpoint = this.player.x;
    }

    updateProgressBar(this, this.player, this.progressBar, this.progressHead);
  }

  platformCollision() {
    // Função de elemento colisor de plataformas
    this.player.setVelocityX(this.playerVelocityX);

    if (!this.timerIsCreate) {
      // Gradativamente escurece a tela para vermelho
      this.tweens.add({
        targets: this.screenOverlay,
        alpha: 0.7, // Defina o valor desejado para a opacidade vermelha
        duration: 3000, // Duração da transição
        ease: "Linear",
      });

      this.escapeTimer = this.time.delayedCall(
        // Cria um temporizador onde o jogador tem chance de desviar da plataforma que o bloqueou
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

  handleTriviaCompleted(success) {
    this.scene.remove("Trivia");

    this.musicPhase2.resume();

    this.gameIsRunning = true;

    if (success) {
      // Algoritimo para remover todas as bestas da tela
      [this.panOils, this.coffeMachines, this.panWaters].forEach((group) => {
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
      pauseForTrivia(this, this.player, true, this.playerVelocityX);
    } else {
      cleanBeasts(this.panOils, this.coffeMachines, this.panWaters);

      // Funções para adicionar o bestiário
      this.addPanOils();
      this.addCoffeMachines();
      this.addPanWaters();

      addBurns(this, 215, 318, 32, this.burnsIcons);

      restartGame(this, this.player, this.initPositionX, 300);
    }
  }

  addCoffeMachines() {
    // Adiciona múltiplas máquinas de café quente no mapa
    const coffeMachineCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (máquina de café quente) dentro de um array
      { x: 1200, y: 200, scale: 0.7 },
      { x: 4400, y: 200, scale: 0.7 },
      { x: 5630, y: 200, scale: 0.7 },
      { x: 6000, y: 200, scale: 0.7 },
      { x: 10090, y: 200, scale: 0.7 },
      { x: 13900, y: 200, scale: 0.7 },
      { x: 15900, y: 200, scale: 0.7 },
      { x: 17600, y: 200, scale: 0.7 },
      { x: 19580, y: 200, scale: 0.7 },
      { x: 22500, y: 200, scale: 0.7 },
      { x: 22560, y: 200, scale: 0.7 },
      { x: 28000, y: 200, scale: 0.7 },
      { x: 30900, y: 200, scale: 0.7 },
      { x: 30960, y: 200, scale: 0.7 },
      { x: 31020, y: 200, scale: 0.7 },
      { x: 43400, y: 200, scale: 0.7 },
    ];

    coffeMachineCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.7) {
        sizeX = 65;
        sizeY = 75;
        offsetX = 3;
        offsetY = 30;
      }

      if (coord.scale == 0.5) {
        sizeX = 65;
        sizeY = 85;
        offsetX = 15;
        offsetY = 11;
      }

      const coffeMachine = this.coffeMachines
        .create(coord.x, coord.y, "coffeMachine")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      coffeMachine.anims.play("coffeMachineHeating", true); // Substitua "coffeMachineAnimation" pela animação correta
    });
  }

  addPanOils() {
    // Adiciona múltiplas panelas de óleo quente no mapa
    const panCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (panela com óleo quente) dentro de um array
      { x: 1600, y: 200, scale: 1 },
      { x: 2920, y: 200, scale: 1 },
      { x: 2990, y: 200, scale: 1 },
      { x: 7100, y: 200, scale: 1 },
      { x: 11960, y: 200, scale: 1 },
      { x: 19300, y: 200, scale: 1 },
      { x: 20586, y: 200, scale: 1 },
      { x: 22900, y: 200, scale: 1 },
      { x: 23900, y: 200, scale: 1 },
      { x: 25700, y: 200, scale: 1 },
      { x: 30300, y: 200, scale: 1 },
      { x: 30360, y: 200, scale: 1 },
      { x: 30420, y: 200, scale: 1 },
      { x: 37650, y: 200, scale: 1 },
      { x: 37710, y: 200, scale: 1 },
      { x: 46860, y: 100, scale: 1 },
    ];

    panCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 65;
        sizeY = 38;
        offsetX = 2;
        offsetY = 12;
      }

      const pan = this.panOils
        .create(coord.x, coord.y, "panOil")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pan.anims.play("panOilBoiling", true);
    });
  }

  addPanWaters() {
    // Adiciona múltiplas panelas de água quente no mapa
    const panWaterCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (panela com água quente) dentro de um array
      { x: 1900, y: 320, scale: 1 },
      { x: 3500, y: 320, scale: 1 },
      { x: 4000, y: 320, scale: 1 },
      { x: 8200, y: 200, scale: 1 },
      { x: 10500, y: 200, scale: 1 },
      { x: 11490, y: 200, scale: 1 },
      { x: 15525, y: 200, scale: 1 },
      { x: 17990, y: 200, scale: 1 },
      { x: 21067, y: 200, scale: 1 },
      { x: 21450, y: 200, scale: 1 },
      { x: 25350, y: 200, scale: 1 },
      { x: 29100, y: 200, scale: 1 },
      { x: 34300, y: 200, scale: 1 },
      { x: 41400, y: 100, scale: 1 },
      { x: 46800, y: 100, scale: 1 },
    ];

    panWaterCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 1) {
        sizeX = 65;
        sizeY = 36;
        offsetX = 3;
        offsetY = 14;
      }

      const panWater = this.panWaters
        .create(coord.x, coord.y, "panWater")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      panWater.anims.play("panWaterBoiling", true);
    });
  }
}
