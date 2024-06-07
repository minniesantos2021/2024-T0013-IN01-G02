// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "../../main.js";

// Importa a cena da trivia
import Trivia from "../trivia.js";

// Importa jogadores do jogo do arquivo "player.js"
import Player from "../../player.js";

// Importa funções de controle para serem utilizadas do arquivo "functions.js"
import {
  winGame,
  endGame,
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

// Adiciona Phaser.scene para criação da classe Phase1 que representa a cena do jogo
export default class Phase1 extends Phaser.Scene {
  // Chama o construtor da classe pai (Phaser.Scene) e passa um objeto de configuração com a chave "Phase1" para identificar esta cena
  constructor() {
    super({ key: "Phase1" }); // Criação de uma chave

    // Declaração de variáveis para elementos visuais e de jogo
    // Elementos visuais:
    this.grass;
    this.state;

    // Receberá a instância de Player
    this.player;

    // Textos e botões
    this.homeBtn;
    this.soundBtn;
    this.pauseBtn;
    this.restartBtn;
    this.winGameTxt1;
    this.winGameTxt2;
    this.nextPhaseBtn;
    this.fullscreenBtn;
    this.setaCima;
    this.setaBaixo;

    // Valor para fazer uma transição suave da câmera
    this.transitionValue = 0;

    // Posição inicial pós tutorial
    this.initPositionX = 6000;

    this.progressBar; // Receberá a barra de progresso
    this.progressHead; // Receberá a barra de progresso

    // Bestiário:
    this.pressurePans;
    this.bonfires;
    this.grills;

    // Variável de controle para saber se o personagem está tocando o chão
    this.isTouchingFloor = false;
  }

  // Carrega todas as imagens, sprites e áudios que farão parte da cena no jogo
  preload() {
    // Carrega elementos de imagem do tutorial
    this.load.image("pular", "src/assets/phase1/pular.png");
    this.load.image("abaixar", "src/assets/phase1/abaixar.png");
    this.load.image("evite", "src/assets/phase1/evite.png");
    this.load.image("tutorial", "src/assets/phase1/tutorial.png");
    this.load.image("fimTutorial", "src/assets/phase1/fimTutorial.png");
    this.load.image("comandos", "src/assets/phase1/comandos.png");
    this.load.image("panTutorial", "src/assets/phase1/pan.png");
    this.load.image("carlos", "src/assets/phase1/carlos.png");

    this.load.spritesheet("setaCima", "src/assets/phase1/setaCima.png", {
      frameWidth: 480,
      frameHeight: 540,
    }); // Carrega a spritesheet de seta para cima

    this.load.spritesheet("setaBaixo", "src/assets/phase1/setaBaixo.png", {
      frameWidth: 480,
      frameHeight: 540,
    }); // Carrega a spritesheet de seta para baixo

    this.load.spritesheet(
      "bonfireTutorial",
      "src/assets/phase1/bonfireTutorial.png",
      {
        frameWidth: 32,
        frameHeight: 80,
      }
    ); // Carrega a spritesheet da fogueira no tutorial

    // Carrega o bestiário
    this.load.spritesheet("bonfire", "src/assets/phase1/bonfire.png", {
      frameWidth: 32,
      frameHeight: 28,
    }); // Carrega a spritesheet da fogueira

    this.load.spritesheet("pressurePan", "src/assets/phase1/pressurePan.png", {
      frameWidth: 80,
      frameHeight: 63.8,
    }); // Carrega a spritesheet da panela de pressão

    this.load.spritesheet("grill", "src/assets/phase1/grill.png", {
      frameWidth: 80,
      frameHeight: 109,
    }); // Carrega a spritesheet da churrasqueira

    this.load.audio("musicPhase1", "src/assets/phase1/theme.mp3"); // Carrega a música desta fase

    // Carrega elementos para construção do mapa do jogo
    this.load.tilemapTiledJSON("mapPhase1", "src/assets/phase1/map/map.json"); // Carrega Json com informações sobre a construção do mapa
    this.load.image("grassTileset", "src/assets/phase1/map/grassTileset.png");
    this.load.image("fenceTileset", "src/assets/phase1/map/fenceTileset.png");
    this.load.image("skyTileset", "src/assets/phase1/map/skyTileset.png");
    this.load.image("treeTileset", "src/assets/phase1/map/treeTileset.png");
    this.load.image("cloudTileset", "src/assets/phase1/map/cloudTileset.png");

    // Reseta algumas variáveis:
    this.lastCheckpoint = 0; // Último marco de posição para a lógica de acréscimo de velocidade

    // Velocidade do personagem
    this.playerVelocityX = 300;

    // Controle para saber se a partida está acontecendo
    this.gameIsRunning = true;

    this.burnsIcons = []; // Ícone indicativo de tentativas
  }

  // Adiciona na tela do jogo elementos que foram carregados no preload
  create() {
    this.cameras.main.fadeIn(500, 0, 0, 0); // Faz a transição de fade-in da câmera com duração de 1000 milissegundos

    this.tweenAdded = false; // Define uma variável de controle para animação como falsa

    this.cameras.main.setBounds(
      // Define os limites da câmera
      0, // Limite esquerdo
      0, // Limite superior
      49984, // Limite horizontal
      gameState.height // Limite vertical
    );

    // Adiciona elementos visuais em forma de mosaico para compor o cenário
    const map = this.make.tilemap({ key: "mapPhase1" }); // Cria o mapa

    // Associa as imagens que compõe o mapa com o json
    const grassTileset = map.addTilesetImage("grass", "grassTileset");
    const skyTileset = map.addTilesetImage("sky", "skyTileset");
    const fenceTileset = map.addTilesetImage("fence", "fenceTileset");
    const treeTileset = map.addTilesetImage("tree", "treeTileset");
    const hiddenTreeTileset = map.addTilesetImage("tree", "treeTileset");
    const cloudTileset = map.addTilesetImage("cloud", "cloudTileset");

    // Cria uma camada para cada imagem
    map.createLayer("sky", skyTileset);
    map.createLayer("tree", treeTileset);
    map.createLayer("hiddenTrees", hiddenTreeTileset);
    map.createLayer("fence", fenceTileset);
    map.createLayer("cloud", cloudTileset);

    this.grass = map.createLayer("grass", grassTileset);
    this.grass.setCollisionByProperty({ collider: true }); // Adiciona colisão onde houver a propriedade collider = verdadeiro

    this.buttonSound = this.sound.get("buttonSound");

    this.musicPhase1 = this.sound.add("musicPhase1", {
      volume: 0.3,
      loop: true,
    });

    this.musicPhase1.play();

    this.bonfireTutorial = this.add
      .sprite(3000, 310, "bonfireTutorial")
      .setScale(3.5);

    if (!this.anims.exists("bonfireTutorial")) {
      // Anima a fogueira
      this.anims.create({
        key: "bonfireTutorial", // Cria uma chave única para identificar esta animação
        frames: this.anims.generateFrameNumbers("bonfireTutorial", {
          // Gera uma sequência de frames da sprite "bonfire"
          start: 0, // Frame inicial
          end: 3, // Frame final
        }),
        frameRate: 3, // Taxa de quadros por segundo
        repeat: -1, // Repetir indefinidamente
      });
    }

    this.bonfireTutorial.anims.play("bonfireTutorial", true); // Inicia a animação da fogueira do tutorial

    this.add.image(2100, 180, "evite").setScale(1); // Adiciona uma mensagem em formato de imagem png
    this.add.image(700, 180, "tutorial").setScale(1); // Adiciona uma mensagem em formato de imagem png
    this.add.image(5250, 180, "fimTutorial").setScale(1); // Adiciona uma mensagem em formato de imagem png

    this.winGameTxt1 = this.add // Adiciona um texto de 'Parabéns' à cena do jogo
      .image(gameState.width / 2, gameState.height / 2 - 100, "winGameTxt1")
      .setScale(1.5)
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.winGameTxt2 = this.add // Adiciona um segundo texto para que o jogador siga para a próxima fase
      .image(gameState.width / 2, gameState.height / 2 + 20, "winGameTxt2")
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9);

    this.setaBaixo = this.add // Adiciona a imagem de seta para baixo ao tutorial
      .sprite(240, 270, "setaBaixo")
      .setScale(0.5)
      .setScrollFactor(0)
      .setDepth(1e8)
      .setAlpha(0.7)

    this.setaCima = this.add // Adiciona a imagem de seta para cima ao tutorial
      .sprite(719, 269, "setaCima")
      .setScale(0.5)
      .setScrollFactor(0)
      .setDepth(1e8)
      .setAlpha(0.7)

    // Define o quadro inicial das setas
    this.setaBaixo.setFrame(1);
    this.setaCima.setFrame(1);

    this.player = new Player(this, 0, 300, gameState.player);
    this.player.addPlayerToScene(this); // Método da classe PLayer para adicionar o personagem à fase
    this.player.setVelocity(this.playerVelocityX); // Define a velocidade do personagem como 300
    this.player.anims.play(gameState.player + "Run", true); // Inicia a animação do personagem
    this.physics.add.collider(
      // Adiciona uma colisão entre o personagem e o chão e chama uma função anônima para dizer que o personagem tocou o chão
      this.player,
      this.grass,
      () => {
        this.isTouchingFloor = true;
      },
      null,
      this
    );

    this.cameras.main.startFollow(this.player, true, 0.05, 0.05, -400); // Câmera segue o personagem deslocada 400px para direita

    // Cria grupos de elementos de panelas de pressão, de fogueiras e de churrasqueiras
    this.pressurePans = this.physics.add.group();
    this.bonfires = this.physics.add.group();
    this.grills = this.physics.add.group();

    // Adiciona elemento colisor às panelas de pressão, fogueiras e churrasqueiras
    this.physics.add.collider(this.pressurePans, this.grass);
    this.physics.add.collider(this.bonfires, this.grass);
    this.physics.add.collider(this.grills, this.grass);

    [this.pressurePans, this.bonfires, this.grills].forEach((obstacle) => {
      // Itera sobre o array com o bestiário e adiciona o chamado a uma função no caso do personagem sobrepor algum item do bestiário
      this.physics.add.collider(
        this.player,
        obstacle,
        () => {
          this.cameras.main.shake(240, 0.01); // Aplica um efeito de tremido na câmera principal

          if (this.burnsIcons.length) this.burnsIcons.pop().destroy(); // Diminui uma tentativa de trivia

          if (this.burnsIcons.length == 1) {
            // Aplica uma animação de fade in/out no ícone restante
            this.tweens.add({
              targets: this.burnsIcons[0], // O ícone de queima restante
              alpha: 0, // Define a opacidade para 0
              duration: 500, // Define a duração da animação (500 milissegundos)
              ease: "Power1", // Define a função de easing para a animação
              yoyo: true, // Faz com que a animação retorne ao estado original após ser concluída
              repeat: -1, // Repete a animação indefinidamente
            });
          }

          if (!this.scene.isActive("Trivia") && this.burnsIcons.length) {
            // Verifica se a cena "Trivia" não está ativa e se ainda há ícones de queima disponíveis
            this.gameIsRunning = false;

            this.musicPhase1.pause();

            pauseForTrivia(this, this.player, false);

            this.scene.add("Trivia", Trivia, true, this.scene.key); // Aciona a trivia
          } else {
            // Adiciona ícones de queima adicionais e reinicia o jogo, caso perca todos os ícones
            addBurns(this, 220, 300, 40, this.burnsIcons);

            this.playerVelocityX = 300;

            cleanBeasts(this.pressurePans, this.bonfires, this.grills);

            this.addPressurePans();
            this.addBonfires();
            this.addGrills();

            restartGame(this, this.player, this.initPositionX, 300);
          }
        },
        null,
        this
      );
    });

    [
      // Cria as animações das bestas
      { key: "bonfireFlaming", sprite: "bonfire", end: 3 },
      { key: "pressurePanExplode", sprite: "pressurePan", end: 8 },
      { key: "grillFlaming", sprite: "grill", end: 2 },
    ].forEach(({ key, sprite, end }) => {
      // Itera sobre o objeto acima e cria todas as animações do bestiário

      let shouldCreateAnimation = true; // Variável para controlar se vai criar a animação ou não

      Object.keys(this.anims.anims.entries).forEach((entryKey) => {
        // Itera sobre a lista de animações existentes
        if (key == entryKey) {
          // Testa se a animação a ser criada já exite
          shouldCreateAnimation = false; // Caso exista, a variável de controle é igualada a 'false'
        }
      });

      if (shouldCreateAnimation) {
        this.anims.create({
          // Cria a animação usando o método 'create' do objeto 'anims' (um sistema de animação Phaser)
          key: key,
          frames: this.anims.generateFrameNumbers(sprite, {
            // Gera um conjunto de números de quadros para a animação
            start: 0,
            end: end,
          }),
          frameRate: 5, // Taxa de reprodução da animação (quadros por segundo)
          repeat: -1, // Número de repetições da animação (-1 significa repetição infinita)
        });
      }
    });

    // Funções para adicionar o bestiário
    this.addPressurePans();
    this.addBonfires();
    this.addGrills();

    // Evento para detectar se a trivia foi respondida
    this.events.on("triviaCompleted", this.handleTriviaCompleted, this);

    // Combinação de teclas para teletransportar o personagem para o final da fase:
    teleportPlayer(this, this.player, 300, this.cameras.main.getBounds().width - 200);

    // Botão para pausar
    this.pauseBtn = this.add // Adiciona um botão de pause
      .image(gameState.width - 60, 60, "pauseBtn")
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

    // Botão de tela cheia
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
      this.sound.stopByKey("musicPhase1");

      gameState.player = ""; // Limpa o nome do jogador, deixando-o em branco

      this.scene.start("StartScene");

      if (this.scene.isActive("Trivia")) this.scene.remove("Trivia");
    });

    // Configura escalas para o botão de "Home" quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.homeBtn, 1.1);
    scaleElement("out", this.homeBtn, 1);

    // Botão para reiniciar jogo
    this.restartBtn = this.add // Adiciona um botão de home
      .image(gameState.width / 2 - 130, gameState.height / 2, "restartBtn")
      .setVisible(false)
      .setScrollFactor(0)
      .setDepth(1e9)
      .setScale(1.5)
      .setInteractive({ cursor: "pointer" });

    this.restartBtn.on("pointerdown", () => {
      this.buttonSound.play();

      addBurns(this, 220, 300, 40, this.burnsIcons);

      this.gameIsRunning = true;

      this.playerVelocityX = 300;

      cleanBeasts(this.pressurePans, this.bonfires, this.grills);

      this.addPressurePans();
      this.addBonfires();
      this.addGrills();

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
      this.sound.stopByKey("musicPhase1");

      this.cameras.main.fadeOut(500, 0, 0, 0);

      this.time.delayedCall(
        500,
        () => {
          this.scene.start("Phase2");
        },
        [],
        this
      );
    });

    // Configura tamanhos para o botão de próxima fase quando o cursor do mouse passa sobre ele e quando sai de cima
    scaleElement("over", this.nextPhaseBtn, 1.5);
    scaleElement("out", this.nextPhaseBtn, 1.35);

    this.pular = this.add // Adição de elemento do tutorial (texto em forma de imagem de 'pular')
      .image(719, 100, "pular")
      .setScrollFactor(0)
      .setAlpha(1)
      .setScale(0.5)
      .setDepth(1e9)
      .setVisible(false);

    this.abaixar = this.add
      .image(240, 100, "abaixar")
      .setScrollFactor(0)
      .setAlpha(1)
      .setDepth(1e9)
      .setScale(0.5)
      .setVisible(false);

    this.comandos = this.add
      .image(480, 40, "comandos")
      .setScrollFactor(0)
      .setAlpha(1)
      .setDepth(1e9)
      .setVisible(false);

    this.panTutorial = this.add // Frigideira presente no tutorial
      .image(4000, 350, "panTutorial")
      .setAlpha(1)
      .setDepth(1e9);

    // HUD:
    // Queimaduras:
    this.add
      .image(10, 10, "burnsFrame")
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(1e9);

    addBurns(this, 220, 300, 40, this.burnsIcons);

    // Barra de progresso:
    this.add // Adiciona um fundo escuro à moldura da barra de progresso
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

    this.add // Adiciona a moldura da barra de progresso
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
    this.dialogBox.fillRect(160, 100, 700, 80);
    this.dialogBox.fillStyle(0x000000, 0.8);
    this.dialogBox.fillRect(49200, 240, 700, 40);

    // Texto da caixa de diálogo
    this.dialogText = this.add.text(170, 110, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });
    this.dialogText1 = this.add.text(49210, 250, "", {
      fontFamily: "Arial",
      fontSize: "18px",
      fill: "#ffffff",
      wordWrap: { width: 680 },
    });

    // Texto a ser exibido gradualmente
    this.dialogue1 =
      "Pai: " +
      this.actCha +
      " me ajude! Eu acabei correndo muito risco de queimadura por explosões e estou com medo de me queimar! Cuidado com as fogueiras, panelas de pressão e churrasqueiras, elas podem te machucar!";

    this.dialogue2 =
      "Pai: " +
      this.actCha +
      ", que bom que você conseguiu chegar até aqui sem se queimar!";

    this.dialogue3 =
      this.actCha + ": Sim, pai, era só prestar atenção com os sinais!";

    this.dialogue4 = "Pai: Ah, sim, como a panela expandindo, não é?";

    this.dialogue5 =
      this.actCha +
      ": Isso mesmo, e nunca manusear gasolina ou álcool próximo a fogo!";

    this.dialogue6 =
      "Pai: Ok, " +
      this.actCha +
      ", eu vou prestar mais atenção nas próximas vezes!";

    this.dialogBox.setVisible(false);
    this.dialogText.setVisible(false);

    this.add.image(540, 370, "carlos").setScale(0.1).setFlipX(true);
    this.add.image(49500, 370, "carlos").setScale(0.1).setFlipX(true);
  }

  update() {
    if (this.player.x > 400 && this.player.x < 500) {
      this.dialogText.setText(this.dialogue1);
      if (this.dial1Active) {
        this.time.delayedCall(
          8000,
          () => {
            this.player.setVelocityX(this.playerVelocityX);
            this.dialogBox.setVisible(false);
            this.dialogText.setVisible(false);
            this.dial1Active = false;
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
    if (this.player.x > 49350 && this.player.x < 49500) {
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
        this.player.setVelocityX(200);
      } else {
        this.player.setVelocityX(0);
      }
    }
    
    if (this.player.x < 6000) {
      this.cameras.main.startFollow(this.player, true, 0.05, 0.05, 0); // Se a posição em x do jogador for menor que 6000px, a câmera segue o jogador sem deslocamento adicional
    } else {
      // Caso contrário, há deslocamento para direita
      this.cameras.main.startFollow(
        this.player,
        true,
        0.05,
        0.05,
        this.transitionValue > -300 // O deslocamento adicional é controlado pelo valor de transitionValue
          ? this.transitionValue--
          : this.transitionValue
      );
      // Adição de elementos do tutorial
      this.setaBaixo.setFrame(1);
      this.setaCima.setFrame(1);
      this.pular.setVisible(false);
      this.abaixar.setVisible(false);
      this.comandos.setVisible(false);
    }

    if (
      // Condições para controlar a animação da seta para cima presente no tutorial
      (this.player.x > 2835 && this.player.x < 2860) || // Área de exibição do tutorial com y menor que 388 (obrigatoriamente colidir com a fogueira)
      (this.player.x > 2835 && this.player.x < 2845)
    ) {
      if (this.player.y < 388) {
        this.player.setVelocityX(this.playerVelocityX); // Define a velocidade como 300
        this.tweens.killTweensOf(this.setaCima); // Ocorre a animação de seta para cima
        this.setaCima.setScale(0.5, 0.5);

        this.tweenAdded = false; // Define a flag como false para que a animação possa ser adicionada novamente
      } else {
        this.setaCima.setFrame(0);
        this.comandos.setVisible(true); // Torna o texto de 'comandos' visível
        this.pular.setVisible(true); // Torna o aviso de 'pular' visível

        this.player.setVelocityX(0); // Deixa a velocidade do jogador como 0 enquanto a seta para cima não é pressionada

        // Adiciona a animação apenas se ainda não tiver sido adicionada
        if (!this.tweenAdded) {
          // Adiciona uma animação ao objeto setaCima para aumentar e diminuir ligeiramente o tamanho ao aparecer
          this.tweens.add({
            targets: this.setaCima,
            scaleX: 0.55,
            scaleY: 0.55,
            yoyo: true, // Faz a animação fazer um loop de volta ao tamanho original após aumentar
            duration: 500, // Duração de um ciclo da animação em milissegundos
            repeat: -1, // Repete a animação indefinidamente
          });

          this.tweenAdded = true; // Animação não será adicionada novamente
        }
      }
    } else {
      this.tweenAdded = false; // Caso contrário, a animação acontecerá
    }
    if (
      // Condições para controlar a animação da seta para baixo presente no tutorial
      (this.player.x > 3900 && this.player.x < 3925) || // Área de exibição do tutorial com y maior que 410 (obrigatoriamente colidir com a panela)
      (this.player.x > 3900 && this.player.x < 3915)
    ) {
      if (this.player.y > 410) {
        this.player.setVelocityX(this.playerVelocityX);

        this.tweens.killTweensOf(this.setaBaixo);
        this.setaBaixo.setScale(0.5, 0.5);

        this.tweenAdded = false;
      } else {
        this.setaBaixo.setFrame(0);
        this.abaixar.setVisible(true); // Torna o aviso de 'abaixar' visível

        this.player.setVelocityX(0);

        // Adiciona a animação apenas se ainda não tiver sido adicionada
        if (!this.tweenAdded) {
          // Adiciona uma animação ao objeto setaBaixo para aumentar e diminuir ligeiramente o tamanho ao aparecer
          this.tweens.add({
            targets: this.setaBaixo,
            scaleX: 0.55,
            scaleY: 0.55,
            yoyo: true,
            duration: 500,
            repeat: -1,
          });

          this.tweenAdded = true; // Animação não será adicionada novamente
        }
      }
    } else {
      this.tweenAdded = false; // Animação acontecerá
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
        this.pauseBtn,
        this.nextPhaseBtn, // Botão para ir para a próxima fase
        2 // Próxima fase após a vitória
      );
      this.gameIsRunning = false;
    } else if (
      this.player.body.position.y >= gameState.height &&
      this.gameIsRunning
    ) {
      // Caso o personagem caia do mapa
      endGame(this, this.player, this.pauseBtn);
      this.gameIsRunning = false;
    } else if (this.gameIsRunning) {
      // Se o jogador não alcançou o final da fase, permite que o jogador continue se movendo
      this.player.move(this.isTouchingFloor); // Passa a variável que informa caso o jogador tenha tocado o chão
      this.isTouchingFloor = false; // Define que o jogador não tocou o chão
    }

    if (this.player.x > 6000 && this.player.x > this.lastCheckpoint + 1500) {
      this.player.setVelocityX((this.playerVelocityX += 8));
      this.lastCheckpoint = this.player.x;
    }

    // Atualiza a barra de progresso
    updateProgressBar(this, this.player, this.progressBar, this.progressHead);
  }

  // Função executada ao receber o resultado da trivia
  handleTriviaCompleted(success) {
    this.scene.remove("Trivia");

    this.musicPhase1.resume();

    this.gameIsRunning = true;

    if (success) {
      //Algoritimo para remover todas as bestas da tela
      [this.pressurePans, this.bonfires, this.grills].forEach((group) => {
        const children = group.getChildren();
        for (let i = 0; i < children.length; i++) {
          if (
            // Verifica se o elemento está dentro da visão da câmera
            children[i].x > this.cameras.main.scrollX &&
            children[i].x < this.cameras.main.scrollX + gameState.width
          ) {
            children[i].destroy(); // Remoção do elemento
            i--; // Diminuição do número do índice no array para compensar a perda do elemento
          }
        }
      });

      // Função que pausa o jogo para a Trivia
      pauseForTrivia(this, this.player, true, this.playerVelocityX);
    } else {
      cleanBeasts(this.pressurePans, this.bonfires, this.grills);

      // Funções para adicionar o bestiário
      this.addPressurePans();
      this.addBonfires();
      this.addGrills();

      addBurns(this, 220, 300, 40, this.burnsIcons); // Adiciona os ícones de fogo, ou seja, quantidade de vidas sobrando

      this.playerVelocityX = 300;

      restartGame(this, this.player, this.initPositionX, 300); // Adiciona o reinicio do jogo em caso de erro da trivia
    }
  }

  addPressurePans() {
    // Adiciona múltiplas panelas de pressão
    const pressurePanCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (panela de pressão) dentro de um array
      { x: 8750, y: 200, scale: 1 },
      { x: 8800, y: 200, scale: 1 },
      { x: 10865, y: 200, scale: 1 },
      { x: 12495, y: 200, scale: 1 },
      { x: 13100, y: 200, scale: 1 },
      { x: 13160, y: 200, scale: 1 },
      { x: 13750, y: 200, scale: 1 },
      { x: 14800, y: 200, scale: 1 },
      { x: 17600, y: 200, scale: 1 },
      { x: 18700, y: 200, scale: 1 },
      { x: 19968, y: 200, scale: 1 },
      { x: 20750, y: 200, scale: 1 },
      { x: 20800, y: 200, scale: 1 },
      { x: 21140, y: 200, scale: 1 },
      { x: 23050, y: 200, scale: 1 },
      { x: 23100, y: 200, scale: 1 },
      { x: 25300, y: 200, scale: 1 },
      { x: 27550, y: 200, scale: 1 },
      { x: 29500, y: 200, scale: 1 },
      { x: 30000, y: 200, scale: 1 },
      { x: 30400, y: 200, scale: 1 },
      { x: 30460, y: 200, scale: 1 },
      { x: 34000, y: 200, scale: 1 },
      { x: 34060, y: 200, scale: 1 },
      { x: 34120, y: 200, scale: 1 },
      { x: 37000, y: 200, scale: 1 },
      { x: 37060, y: 200, scale: 1 },
      { x: 37120, y: 200, scale: 1 },
      { x: 38480, y: 200, scale: 1 },
      { x: 39590, y: 200, scale: 1 },
      { x: 42000, y: 200, scale: 1 },
      { x: 42060, y: 200, scale: 1 },
      { x: 42120, y: 200, scale: 1 },
      { x: 44060, y: 200, scale: 1 },
      { x: 44120, y: 200, scale: 1 },
      { x: 47060, y: 200, scale: 1 },
      { x: 47120, y: 200, scale: 1 },
      { x: 47180, y: 200, scale: 1 },
      { x: 47687, y: 200, scale: 1 },
    ];

    pressurePanCoordinates.forEach((coord) => {
      // Retoma as coordenadas
      let sizeX = 0; // Variável para o tamanho horizontal
      let sizeY = 0; // Variável para o tamanho vertical
      let offsetX = 0; // Variável para o deslocamento horizontal
      let offsetY = 0; // Variável para o deslocamento vertical

      if (coord.scale == 1) {
        // Define os valores
        sizeX = 56;
        sizeY = 36;
        offsetX = 7;
        offsetY = 24;
      }

      const pressurePan = this.pressurePans // Cria uma constante que agrupa todas as panelas de pressão
        .create(coord.x, coord.y, "pressurePan")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      pressurePan.anims.play("pressurePanExplode", true); // Inicia a animação de explosão das panelas de pressão
    });
  }

  addBonfires() {
    // Adiciona múltiplas fogueiras
    const bonfireCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (fogueira) dentro de um array
      { x: 7250, y: 200, scale: 2.8 },
      { x: 9400, y: 200, scale: 2.8 },
      { x: 10365, y: 200, scale: 2.8 },
      { x: 11975, y: 200, scale: 2.8 },
      { x: 14370, y: 200, scale: 2.8 },
      { x: 14415, y: 200, scale: 2.8 },
      { x: 16070, y: 200, scale: 2.8 },
      { x: 16910, y: 200, scale: 2.8 },
      { x: 17224, y: 200, scale: 2.8 },
      { x: 19300, y: 200, scale: 2.8 },
      { x: 21550, y: 200, scale: 2.8 },
      { x: 21590, y: 200, scale: 2.8 },
      { x: 23800, y: 200, scale: 2.8 },
      { x: 24885, y: 200, scale: 2.8 },
      { x: 26050, y: 200, scale: 2.8 },
      { x: 27895, y: 200, scale: 2.8 },
      { x: 28300, y: 200, scale: 2.8 },
      { x: 28340, y: 200, scale: 2.8 },
      { x: 30856, y: 200, scale: 2.8 },
      { x: 31770, y: 200, scale: 2.8 },
      { x: 33134, y: 200, scale: 2.8 },
      { x: 33486, y: 200, scale: 2.8 },
      { x: 35000, y: 200, scale: 2.8 },
      { x: 35040, y: 200, scale: 2.8 },
      { x: 35080, y: 200, scale: 2.8 },
      { x: 35590, y: 200, scale: 2.8 },
      { x: 36524, y: 200, scale: 2.8 },
      { x: 38000, y: 200, scale: 2.8 },
      { x: 38040, y: 200, scale: 2.8 },
      { x: 38080, y: 200, scale: 2.8 },
      { x: 40000, y: 100, scale: 2.8 },
      { x: 40040, y: 100, scale: 2.8 },
      { x: 45000, y: 100, scale: 2.8 },
      { x: 45040, y: 100, scale: 2.8 },
      { x: 48373, y: 100, scale: 2.8 },
    ];

    bonfireCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 2.8) {
        sizeX = 15;
        sizeY = 15;
        offsetX = 8;
        offsetY = 13;
      }

      const bonfire = this.bonfires
        .create(coord.x, coord.y, "bonfire")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      bonfire.anims.play("bonfireFlaming", true);
    });
  }

  addGrills() {
    // Adiciona múltiplas chrrasqueiras
    const grillCoordinates = [
      // Armazena valores de coordenadas de colocação de bestiários (churrasqueira) dentro de um array
      { x: 8200, y: 200, scale: 0.9 },
      { x: 9850, y: 320, scale: 0.9 },
      { x: 11490, y: 200, scale: 0.9 },
      { x: 15275, y: 200, scale: 0.9 },
      { x: 15325, y: 200, scale: 0.9 },
      { x: 16400, y: 200, scale: 0.9 },
      { x: 18050, y: 200, scale: 0.9 },
      { x: 18645, y: 200, scale: 0.9 },
      { x: 20050, y: 200, scale: 0.9 },
      { x: 22300, y: 200, scale: 0.9 },
      { x: 24550, y: 200, scale: 0.9 },
      { x: 26800, y: 200, scale: 0.9 },
      { x: 26850, y: 200, scale: 0.9 },
      { x: 29050, y: 200, scale: 0.9 },
      { x: 32500, y: 200, scale: 0.9 },
      { x: 34520, y: 200, scale: 0.9 },
      { x: 36000, y: 200, scale: 0.9 },
      { x: 36050, y: 200, scale: 0.9 },
      { x: 36100, y: 200, scale: 0.9 },
      { x: 39000, y: 200, scale: 0.9 },
      { x: 39050, y: 200, scale: 0.9 },
      { x: 39100, y: 200, scale: 0.9 },
      { x: 40700, y: 100, scale: 0.9 },
      { x: 41400, y: 100, scale: 0.9 },
      { x: 41450, y: 100, scale: 0.9 },
      { x: 43000, y: 100, scale: 0.9 },
      { x: 43050, y: 100, scale: 0.9 },
      { x: 43100, y: 100, scale: 0.9 },
      { x: 44537, y: 100, scale: 0.9 },
      { x: 46000, y: 100, scale: 0.9 },
      { x: 46050, y: 100, scale: 0.9 },
      { x: 46100, y: 100, scale: 0.9 },
      { x: 49000, y: 100, scale: 0.9 },
      { x: 49050, y: 100, scale: 0.9 },
      { x: 49100, y: 100, scale: 0.9 },
    ];

    grillCoordinates.forEach((coord) => {
      let sizeX = 0;
      let sizeY = 0;
      let offsetX = 0;
      let offsetY = 0;

      if (coord.scale == 0.9) {
        sizeX = 70;
        sizeY = 72;
        offsetX = 8;
        offsetY = 33;
      }

      const grill = this.grills
        .create(coord.x, coord.y, "grill")
        .setScale(coord.scale)
        .setSize(sizeX, sizeY)
        .setOffset(offsetX, offsetY);
      grill.anims.play("grillFlaming", true);
    });
  }
}
