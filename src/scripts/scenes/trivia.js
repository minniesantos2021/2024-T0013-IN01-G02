import { gameState } from "../main.js";
import { scaleElement } from "../functions.js";

export default class Trivia extends Phaser.Scene {
  constructor() {
    super({ key: "Trivia", active: false }); // Defina como não ativa por padrão

    // Adicione uma variável de controle para verificar se a trivia foi respondida
    this.triviaAnswered = false;

    this.triviaSuccess = false;

    this.actualScene;
  }

  preload() {
    if (
      // Verifica se as texturas existem e remove-as se existirem para evitar duplicatas
      this.textures.exists("triviaImage") ||
      this.textures.exists("text") ||
      this.textures.exists("option1") ||
      this.textures.exists("option2") ||
      this.textures.exists("lesson") ||
      this.textures.exists("clock")
    ) {
      this.textures.remove("triviaImage");
      this.textures.remove("text");
      this.textures.remove("option1");
      this.textures.remove("option2");
      this.textures.remove("lesson");
      this.textures.remove("clock");
    }

    this.load.spritesheet("triviaImage", this.trivia.path + "trivia.png", {
      // Carrega as texturas necessárias para a trivia
      frameWidth: 400,
      frameHeight: 280,
    });

    this.load.image("text", this.trivia.path + "text.png");
    this.load.image("option1", this.trivia.path + "option1.png");
    this.load.image("option2", this.trivia.path + "option2.png");
    this.load.image("lesson", this.trivia.path + "lesson.png");

    this.load.image("clock", "src/assets/trivia/clock.png");

    // Áudios:
    this.load.audio("triviaTheme", "src/assets/trivia/theme.mp3");
    this.load.audio("triviaCorrect", "src/assets/trivia/triviaCorrect.mp3");
    this.load.audio("triviaError", "src/assets/trivia/triviaError.mp3");
    this.load.audio("characterHit", "src/assets/trivia/characterHit.mp3");
  }

  init(data) {
    this.actualScene = data;

    this.randomTrivia = Phaser.Math.RND.between(1, 3);
    this.trivia = {
      animKey: `${this.actualScene}Trivia${this.randomTrivia}`,
      path: `src/assets/${this.actualScene.toLowerCase()}/trivias/trivia${
        this.randomTrivia
      }/`,
    };

    if (this.actualScene == "Phase1" && this.randomTrivia == 1) {
      // Trivia da Carlos com o a fogueira
      this.timeTrivia = 15;
      this.timeLesson = 10;
    } else if (this.actualScene == "Phase1" && this.randomTrivia == 2) {
      // Trivia da Carlos com o a churrasqueira
      this.timeTrivia = 15;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase1" && this.randomTrivia == 3) {
      // Trivia da Carlos com o a panela de pressão
      this.timeTrivia = 15;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase2" && this.randomTrivia == 1) {
      // Trivia da Marta com o a cafeteira
      this.timeTrivia = 10;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase2" && this.randomTrivia == 2) {
      // Trivia da Marta com o a panela de óleo quente
      this.timeTrivia = 10;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase2" && this.randomTrivia == 3) {
      // Trivia da Lara com o panela para fora deo fogão
      this.timeTrivia = 15;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase3" && this.randomTrivia == 1) {
      // Trivia da Marta com o ferro de passar
      this.timeTrivia = 15;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase3" && this.randomTrivia == 2) {
      // Trivia da Marta com o forno
      this.timeTrivia = 15;
      this.timeLesson = 15;
    } else if (this.actualScene == "Phase3" && this.randomTrivia == 3) {
      // Trivia da Marta com o a frigideira
      this.timeTrivia = 15;
      this.timeLesson = 15;
    }
  }

  create() {
    // Áudio
    this.sound
      .add("characterHit", {
        volume: 0.5,
      })
      .play();

    this.triviaTheme = this.sound.add("triviaTheme", {
      volume: 0.5,
      loop: true,
    });

    this.triviaTheme.play();

    this.add // Fundo escuro  no resto da fase para melhorar a legibilidade do texto
      .rectangle(0, 0, gameState.width, gameState.height, 0x000000)
      .setAlpha(0.5)
      .setOrigin(0, 0);

    this.clockImage = this.add // Adiciona a imagem de relógio do temporizador
      .image(80, gameState.height / 2, "clock")
      .setScale(0.05);

    this.timerTxt = this.add // Adiciona texto de pergunta da trivia
      .text(140, gameState.height / 2, this.timeTrivia, {
        fontSize: "50px",
        fill: "#fff",
        fontWeight: "bold",
      })
      .setOrigin(0.5);

    // Criação da imagem da trivia
    this.triviaImage = this.add.sprite(
      gameState.width / 2,
      gameState.height / 2,
      "triviaImage"
    );

    // Criação da animação da trivia
    this.triviaAnimCreate();

    // Reproduz a animação da ilustração da trivia
    this.triviaImage.anims.play(this.trivia.animKey);

    this.triviaTxt = this.add
      .image(
        gameState.width / 2,
        this.triviaImage.y - this.triviaImage.displayHeight / 2 - 5, // Poiciona o texto da trivia em relação à localização da imagem da trivia
        "text"
      )
      .setOrigin(0.5, 1); // Texto de contextualização da trivia

    // Randomiza o posicionamento das opões das trivias
    let randomOptionPosition = Phaser.Math.RND.between(0, 1);

    // Botão 1
    this.option1Btn = this.add
      .image(randomOptionPosition ? 275 : 650, 475, "option1")
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => {
        this.optionPress(this.option1Btn, true);
      });

    scaleElement("over", this.option1Btn, 1.05);
    scaleElement("out", this.option1Btn, 1);

    // Botão 2
    this.option2Btn = this.add
      .image(randomOptionPosition ? 650 : 275, 475, "option2") // A resposta correta pode estar na esquerda ou na direita
      .setInteractive({ cursor: "pointer" })
      .on("pointerdown", () => {
        this.optionPress(this.option2Btn);
      });

    scaleElement("over", this.option2Btn, 1.05);
    scaleElement("out", this.option2Btn, 1);

    // Inicie a contagem regressiva do temporizador
    this.countdownTrivia = this.time.addEvent({
      delay: 1000,
      callback: this.countdown,
      callbackScope: this,
      loop: true,
    });
  }

  optionPress(optionBtn, success = false) {
    this.add.image(gameState.width / 2, gameState.height / 2, "lesson"); // Adiciona imagem da lição
    // Remove a imagem e o texto da trivia, a imagem do relógio e desativa os botões de opção
    this.triviaImage.destroy();
    this.triviaTxt.destroy();
    this.clockImage.destroy();
    this.option1Btn.disableInteractive();
    this.option2Btn.disableInteractive();
    optionBtn.setTint(success ? "0x00ff00" : "0xff0000");

    this.sound
      .add(success ? "triviaCorrect" : "triviaError", {
        volume: success ? 0.5 : 0.25,
      })
      .play();

    if (!success) this.cameras.main.shake(240, 0.01); // Se a resposta não for correta, a câmera é sacudida

    this.triviaSuccess = success; // Define se a trivia foi respondida com sucesso

    this.triviaAnswered = true; // Define que a trivia foi respondida
    this.countdownTrivia.remove(false); // Remove o evento de contagem regressiva

    // Reposiciona o texto do temporizador e define o tempo para a lição
    this.timerTxt.setPosition(gameState.width / 2, 100);
    this.timerTxt.setText(this.timeLesson);

    this.countdownLesson = this.time.addEvent({
      // Inicia a contagem regressiva para a lição
      delay: 1000, // Define o intervalo de tempo para 1 segundo
      callback: this.countdown, // Define a função de retorno de chamada para executar a cada intervalo
      callbackScope: this, // Define o escopo da função de retorno de chamada
      loop: true, // Define se o evento deve ser repetido
    });
  }

  countdown() {
    !this.triviaAnswered ? this.timeTrivia-- : this.timeLesson--; // Decrementa o tempo restante da trivia ou da lição com base se a trivia foi respondida

    this.timerTxt.setText(
      // Atualiza o texto do temporizador com o tempo restante da trivia ou da lição
      !this.triviaAnswered ? this.timeTrivia : this.timeLesson
    );

    if (this.timeTrivia <= 0 && !this.triviaAnswered) {
      this.triviaTheme.stop();
      this.scene.get(this.actualScene).events.emit("triviaCompleted", false);
    }

    if (this.timeLesson == 0) {
      this.triviaTheme.stop();
      this.countdownLesson.remove(false); // Remove o evento de contagem regressiva
      this.scene
        .get(this.actualScene)
        .events.emit("triviaCompleted", this.triviaSuccess);
    }
  }

  triviaAnimCreate() {
    if (this.anims.exists(this.trivia.animKey)) {
      // Verifica se a animação da trivia já existe e a remove se necessário
      this.anims.remove(this.trivia.animKey);
    }

    this.anims.create({
      // Cria a animação da trivia
      key: this.trivia.animKey,
      frames: this.anims.generateFrameNumbers("triviaImage", {
        start: 0,
        end: 1,
      }),
      frameRate: 5,
      repeat: -1,
    });
  }
}
