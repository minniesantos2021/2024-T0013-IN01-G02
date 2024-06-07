// Classe que define um jogador no jogo
export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, positionX, positionY, player) {
    super(scene, positionX, positionY, player);
    this.player = player; // Define qual é o persongem escolhido
    this.controls = scene.input.keyboard.createCursorKeys(); // Mapeia as teclas de controle do jogador
    this.interactionKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE // Define a tecla de interação (espaço)
    );

    scene.input.on("pointerdown", this.handlePointerDown, this);
    scene.input.on("pointerup", this.handlePointerUp, this);

    this.lastAnimation; // Variável para armazenar a última animação reproduzida a fim de evitar que o personagem caia do mapa
    this.isJumping = false; // Variável de controle para saber se o personagem está pulando
  }

  // Adiciona o jogador à cena do jogo
  addPlayerToScene(scene) {
    scene.add.existing(this); // Adiciona o jogador à cena
    scene.physics.add.existing(this); // Adiciona o jogador à física da cena

    this.setScale(0.5).setSize(100, 200).setOffset(20, 10);
    this.anims.play(this.player + "Idle", true); // Começa a animação padrão do personagem parado
  }

  /// Função para controlar o movimento do jogador
  move(isTouchingFloor) {
    if (
      (this.controls.space.isDown || this.controls.up.isDown) &&
      isTouchingFloor &&
      !this.isJumping
    ) {
      this.jump();
    } else if (this.controls.down.isDown || this.leftTouch) {
      // Verifica se o controle de toque esquerdo está ativado
      this.squat(isTouchingFloor);
    } else if (isTouchingFloor) {
      this.run();
    }

    this.isTouchingFloor = isTouchingFloor;
  }

  handlePointerDown(pointer) {
    const centerX = this.scene.game.config.width / 2;
    if (pointer.x < centerX) {
      this.leftTouch = true; // Atualiza o estado do controle de toque esquerdo
    } else if (this.isTouchingFloor) {
      this.jump();
    }
  }

  handlePointerUp() {
    this.leftTouch = false;
  }

  // Função para fazer o jogador pular
  jump() {
    this.setVelocityY(-500) // Velocidade vertical negativa, o personagem vai para cima
      .setSize(
        this.player == "celsinho" ? 100 : 100, // Retorna um tamanho diferente dependendo se o sprite é o celsinho ou a kelvinha
        this.player == "celsinho" ? 170 : 130
      )
      .setOffset(
        this.player == "celsinho" ? 30 : 65,
        this.player == "celsinho" ? 23 : 25
      );

    this.isJumping = true;

    if (this.lastAnimation == this.player + "Squat") this.setY(this.y - 15); // Se a última animação é o agachamento, manda o personagem um pouco para cima, evitando que ele sobreponha o chão e caia do mapa

    this.anims.play(this.player + "Jump");
    this.lastAnimation = this.player + "Jump"; // Armazena a última animação reproduzida, agora: jump
  }

  // Função para fazer o jogador agachar
  squat(isTouchingFloor) {
    this.setVelocityY(350);

    if (isTouchingFloor) {
      // Só reproduz a animação de agachamento caso o personagem toque o chão
      this.setSize(
        this.player == "celsinho" ? 130 : 120,
        this.player == "celsinho" ? 120 : 120
      ).setOffset(
        this.player == "celsinho" ? 10 : 20,
        this.player == "celsinho" ? 20 : 5
      );
      this.anims.play(this.player + "Squat", true); // Inicia a animação de agachamento
      this.isJumping = false;
      this.lastAnimation = this.player + "Squat";
    }
  }

  // Função para fazer o jogador correr
  run() {
    this.setSize(
      this.player == "celsinho" ? 100 : 120, // Dimensões da hit box, ou seja, área de colisão
      this.player == "celsinho" ? 190 : 150
    ).setOffset(
      this.player == "celsinho" ? 22 : 15, // Deslocamento da hit box
      this.player == "celsinho" ? 15 : 15
    );

    if (this.lastAnimation == this.player + "Squat") this.setY(this.y - 15); // Se o personagem estiver agachado, a posição vertical será corrigida para sua posição normal

    this.isJumping = false;

    this.anims.play(this.player + "Run", true); // Inicia a animação de corrida do jogador
    this.lastAnimation = this.player + "Run";
  }
}
// Funções para carregamento de imagens do personagem. Estão fora da classe porque precisam ser executadas antes da criação de um personagem
export function loadSprites(scene) {
  // Carrega a spritesheet do personagem
  const spritesheets = [
    {
      // Define os dados de cada spritesheet do personagem
      key: "celsinhoIdle", // Define a chave para identificar a spritesheet do estado idle (parado) do personagem "Celsinho"
      path: "src/assets/celsinhoSprites/celsinhoIdle.png", // Define o caminho para a imagem da spritesheet do estado idle do personagem "Celsinho"
      width: 140, // Define a largura dos frames na spritesheet
      height: 193, // Define a altura dos frames na spritesheet
    },
    {
      key: "celsinhoRun",
      path: "src/assets/celsinhoSprites/celsinhoRun.png",
      width: 150,
      height: 205,
    },
    {
      key: "celsinhoJump",
      path: "src/assets/celsinhoSprites/celsinhoJump.png",
      width: 150,
      height: 193.5,
    },
    {
      key: "celsinhoSquat",
      path: "src/assets/celsinhoSprites/celsinhoSquat.png",
      width: 150,
      height: 141.5,
    },
    {
      key: "kelvinhaIdle",
      path: "src/assets/kelvinhaSprites/kelvinhaIdle.png",
      width: 160,
      height: 172,
    },
    {
      key: "kelvinhaRun",
      path: "src/assets/kelvinhaSprites/kelvinhaRun.png",
      width: 150,
      height: 168,
    },
    {
      key: "kelvinhaJump",
      path: "src/assets/kelvinhaSprites/kelvinhaJump.png",
      width: 182,
      height: 167,
    },
    {
      key: "kelvinhaSquat",
      path: "src/assets/kelvinhaSprites/kelvinhaSquat.png",
      width: 150,
      height: 127.5,
    },
  ];

  // Carrega cada spritesheet na cena
  spritesheets.forEach((spritesheet) => {
    // Carrega a spritesheet da iteração sobre o objeto spritesheets atual na cena
    scene.load.spritesheet(spritesheet.key, spritesheet.path, {
      frameWidth: spritesheet.width, // Define a largura dos frames na spritesheet
      frameHeight: spritesheet.height, // Define a altura dos frames na spritesheet
    });
  });
}

// Cria as animações do personagem
export function animsCreate(scene) {
  const animationsData = {
    celsinho: {
      Idle: { end: 1 }, // Fim da animação de parado, é necessário informar porque esta é uma característica que é bastante distinto em todas as spritesheets
      Run: { end: 3 }, // Fim da animação de correr, é necessário informar porque esta é uma característica que é bastante distinto em todas as spritesheets
      Jump: { end: 1 }, // Fim da animação de saltar, é necessário informar porque esta é uma característica que é bastante distinto em todas as spritesheets
      Squat: { end: 3 }, // Fim da animação de agachar, é necessário informar porque esta é uma característica que é bastante distinto em todas as spritesheets
    },
    kelvinha: {
      Idle: { end: 1 },
      Run: { end: 3 },
      Jump: { end: 2 },
      Squat: { end: 3 },
    },
  };

  // Percorre os dados de animação e cria cada animação na cena
  Object.keys(animationsData).forEach((character) => {
    // Para cada personagem definido nos dados de animação
    Object.keys(animationsData[character]).forEach((animation) => {
      // Para cada tipo de animação definido para o personagem atual
      const { end } = animationsData[character][animation];
      let shouldCreateAnimation = true; // Verifica se a animação deve ser criada

      // Verifica se a animação já foi criada na cena
      Object.keys(scene.anims.anims.entries).forEach((entryKey) => {
        if (`${character}${animation}` == entryKey) {
          // Se a animação atual a ser criada é igual a alguma já existente
          shouldCreateAnimation = false;
        }
      });

      // Cria a animação se ainda não tiver sido criada
      if (shouldCreateAnimation) {
        scene.anims.create({
          key: `${character}${animation}`, // Chave única para a animação
          frameRate: 7, // Taxa de quadros por segundo
          frames: scene.anims.generateFrameNumbers(`${character}${animation}`, {
            start: 0,
            end: end, // Fim dos quadros da animação
          }),
          repeat: animation === "Jump" ? 0 : -1, // Se a animação deve ser repetida
        });
      }
    });
  });
}
