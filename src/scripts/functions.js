// Importa o estado do jogo do arquivo "main.js"
import { gameState } from "./main.js";

// Função para carregar sprites, textos e botões
export function loadSpritesTxtsBtns(scene) {
  // Carrega imagens para os botões e textos do jogo
  scene.load.image("homeBtn", "src/assets/textsAndButtons/homeBtn.png"); // Carrega o botão para retornar à tela inicial
  scene.load.image("pauseBtn", "src/assets/textsAndButtons/pauseBtn.png"); // Carrega o botão para pause partida
  scene.load.image("soundBtn", "src/assets/textsAndButtons/soundBtn.png"); // Carrega o botão para parar a música partida
  scene.load.image("restartBtn", "src/assets/textsAndButtons/restartBtn.png"); // Carrega o botão para recomeçar a partida
  scene.load.image(
    "nextPhaseBtn",
    "src/assets/textsAndButtons/nextPhaseBtn.png"
  ); // Carrega o botão para retornar à tela inicial
  scene.load.image(
    "fullscreenBtn",
    "src/assets/textsAndButtons/fullscreenBtn.png"
  ); // Carrega o botão colocar o jogo em modo tela cheia
  scene.load.image("winGameTxt1", "src/assets/textsAndButtons/winGameTxt1.png"); // Carrega o botão para reiniciar partida
  scene.load.image("winGameTxt2", "src/assets/textsAndButtons/winGameTxt2.png"); // Carrega o botão para reiniciar partida
  scene.load.image("burnsFrame", "src/assets/textsAndButtons/burnsFrame.png"); // Carrega o quadro que informa a quantidade restante de queimaduras
  scene.load.image("burn", "src/assets/textsAndButtons/burn.png"); // Carrega o ícone que informa a quantidade restante de queimaduras
  scene.load.image(
    "celsinhoHead",
    "src/assets/textsAndButtons/celsinhoHead.png"
  ); // Carrega o ícone que informa a quantidade restante de queimaduras
  scene.load.image(
    "kelvinhaHead",
    "src/assets/textsAndButtons/kelvinhaHead.png"
  ); // Carrega o ícone que informa a quantidade restante de queimaduras
  scene.load.image(
    "progressBarFrame",
    "src/assets/textsAndButtons/progressBarFrame.png"
  ); // Carrega a moldura da barra de progresso da fase
}

// Função para vencer o jogo
export function winGame(
  context,
  winGameTxt1,
  winGameTxt2,
  homeBtn,
  player,
  pauseBtn,
  nextPhaseBtn = null,
  sceneStartNum = null
) {
  console.log("winGame()");

  // Para o movimento do jogador e inicia uma animação de inatividade
  player.setVelocity(0); // Define a velocidade do jogador como zero
  player.body.setAllowGravity(false); // Desativa a gravidade
  player.anims.play(gameState.player + "Idle", true); // Inicia uma animação de inatividade do jogador

  // Posiciona e exibe os botões e elementos de mensagem de vitória
  homeBtn.setX(
    context.scene.key === "Phase3"
      ? gameState.width / 2
      : gameState.width / 2 + 140
  ); // Define a posição x do botão "Home"
  homeBtn.setY(gameState.height / 2 + 140); // Define a posição y do botão "Home"
  homeBtn.setScale(1.35);

  scaleElement("over", homeBtn, 1.5);
  scaleElement("out", homeBtn, 1.35);

  if (sceneStartNum && sceneStartNum > gameState.phase)
    gameState.phase = sceneStartNum;

  pauseBtn.setVisible(false); // Torna o botão "Home" visível
  homeBtn.setVisible(true); // Torna o botão "Home" visível
  winGameTxt1.setVisible(true); // Torna o texto/imagem de vitória 1 visível
  winGameTxt2.setVisible(true); // Torna o texto/imagem de vitória 2 visível
  if (nextPhaseBtn != null) nextPhaseBtn.setVisible(true); // Torna o botão de próxima fase visível
}

// Função que encerra o jogo
export function endGame(scene, restartBtn, homeBtn, screenOverlay) {
  console.log("endGame()");

  scene.cameras.main.shake(240, 0.01); // Cria um efeito onde a tela treme

  scene.anims.pauseAll(); // Pausa todas animações
  scene.physics.pause(); // Pausa toda a física do jogo

  screenOverlay.setAlpha(0.7);

  restartBtn.setVisible(true); // Torna o botão de restart visível
  homeBtn.setVisible(true); // Torna o botão de voltar ao menu visível

  homeBtn.x = gameState.width / 2 + 130; // Reposiciona o botão de voltar ao menu
  homeBtn.y = gameState.height / 2;
  homeBtn.setScale(1.5);

  scaleElement("over", homeBtn, 1.7);
  scaleElement("out", homeBtn, 1.5);
}

// Função para reiniciar o jogo
export function restartGame(
  scene,
  player,
  positionX,
  positionY,
  homeBtn = null,
  restartBtn = null,
  screenOverlay = null
) {
  console.log("restartGame()");
  // Reposiciona o jogador para a posição inicial
  player
    .setVelocityX(300) // Define a velocidade inicial do jogador
    .setTint("0xffffff")
    .setPosition(positionX, positionY);

  scene.anims.resumeAll(); // Retorna a reprodução das animações
  scene.physics.resume(); // Retorna a física do jogo

  // Se a variável do botão de recomeçar jogo foi passada, escondê-la
  if (homeBtn) {
    homeBtn.x = gameState.width - 330;
    homeBtn.y = 60;
    homeBtn.setScale(1);

    scaleElement("over", homeBtn, 1.1);
    scaleElement("out", homeBtn, 1);
    homeBtn.setVisible(false);
  } // Torna o botão de pausar invisível

  if (restartBtn) restartBtn.setVisible(false); // Torna o botão de pausar invisível

  if (screenOverlay) screenOverlay.setAlpha(0); // Define a opacidade (alfa) da tela como zero, tornando-o completamente transparente
}

// Função para pausar o jogo
export function pauseGame(
  scene,
  player,
  soundBtn,
  fullscreenBtn,
  homeBtn,
  playerVelocityX = 300
) {
  gameState.isPause = !gameState.isPause;
  if (gameState.isPause) {
    console.log(
      `Jogador - X: ${player.x.toFixed(2)} Y: ${player.y.toFixed(2)}`
    );

    soundBtn.setVisible(true); // Torna o botão de controle do som do jogo inicial visível
    homeBtn.setVisible(true); // Torna o botão de controle de voltar ao menu visível
    fullscreenBtn.setVisible(true); // Torna o botão de tela cheia visível

    if (player.anims.currentAnim.key == gameState.player + "Squat") {
      // Verifica se o jogador está agachado e ajusta sua posição vertical
      player.setY(player.y - 20);
    }

    player.anims.play(gameState.player + "Idle", true); // Define a animação do jogador como "Idle" e ajusta seu tamanho e posição
    player
      .setSize(
        gameState.player == "celsinho" ? 115 : 100,
        gameState.player == "celsinho" ? 180 : 150
      )
      .setOffset(0, 15);

    scene.physics.pause(); // Pausa toda a física do jogo
  } else {
    player.setVelocity(playerVelocityX); // Define a velocidade inicial do jogador

    scene.anims.resumeAll(); // Retorna a reprodução das animações
    scene.physics.resume(); // Retorna a física do jogo

    soundBtn.setVisible(false); // Torna o botão de controle do som do jogo inicial invisível
    homeBtn.setVisible(false); // Torna o botão de voltar ao menu do jogo invisível
    fullscreenBtn.setVisible(false); // Torna o botão de tela cheia do jogo invisível
  }
}

// Função de pause, enquanto a trivia ocorre
export function pauseForTrivia(scene, player, unpause, playerVelocityX = 300) {
  console.log("pauseForTrivia()");

  player.anims.play(gameState.player + "Idle", true);
  player // Se unpause for verdadeiro, a velocidade X é definida como playerVelocityX, caso contrário, é definida como 0
    .setVelocityX(unpause ? playerVelocityX : 0)
    .setTint(unpause ? "0xffffff" : "0xff0000");
  unpause ? scene.physics.resume() : scene.physics.pause(); // Se unpause for verdadeiro, retoma a física do cenário, caso contrário, pausa
}

// Função do som do jogo
export function soundGame(scene, soundBtn) {
  gameState.isSoundMute = !gameState.isSoundMute; // Inverte o estado que informa de o jogo está mutado
  scene.sound.mute = !scene.sound.mute; // Muta o jogo caso ele não esteja mutado

  soundBtn.setTint(gameState.isSoundMute ? "0x858585" : "0xffffff"); // Define uma cor de tonalidade cinza para o botão dependendo se o jogo tá mutado
}

// Função de tela cheia
export function startFullscreen(scene, fullscreenBtn) {
  if (
    // Verifica se o dispositivo suporta tela cheia e se a tela não está em tela cheia
    scene.scale.game.device.fullscreen.available &&
    !scene.scale.isFullscreen
  ) {
    scene.scale.startFullscreen(); // Inicia o modo de tela cheia
    fullscreenBtn.setTint("0xffffff");
    gameState.isFullscreen = true; // Atualiza o estado de tela cheia do jogo
  } else if (scene.scale.isFullscreen) {
    // Se já estiver em tela cheia, desativa o modo de tela cheia
    scene.scale.stopFullscreen();
    gameState.isFullscreen = false;
    fullscreenBtn.setTint("0x707070"); // Define a cor do botão de tela cheia como cinza
  } else {
    // Se a tela cheia não estiver disponível, exibe um alerta
    alert(
      "A opção de tela cheia não está disponível: O dispositivo atual não suporta esse modo."
    );
  }
}

// Função para ajustar a escala de um elemento em resposta a um evento de ponteiro
export function scaleElement(event, element, scale) {
  // Define um manipulador de eventos para um tipo específico de evento de ponteiro
  element.on("pointer" + event, () => {
    element.setScale(scale); // Quando o evento é acionado, ajusta a escala do elemento para o valor especificado
  });
}

// Função para contabilização de vidas que ainda estão sobrando
export function addBurns(scene, init, limit, sum, burnsIcons) {
  if (burnsIcons.length) {
    // Limpa os indicadores existentes, caso haja
    burnsIcons.forEach((burn) => {
      burn.destroy();
    });
  }

  for (let i = init; i <= limit; i += sum) {
    const icon = scene.add // Adiciona os ícones que indicam a quantidade de vezes que o jogador pode se queimar
      .image(i, 25, "burn")
      .setScale(1.18)
      .setScrollFactor(0)
      .setDepth(1e9);

    burnsIcons.push(icon); // Adiciona o ícone à lista de ícones de queimadura
  }
}

// Função para alterar o comprimento da barra de progresso
export function updateProgressBar(scene, player, progressBar, head) {
  let worldWidth = scene.cameras.main.getBounds().width; // Obtém a largura do mundo da cena
  let progress = 1 - ((worldWidth - player.x) * 1) / worldWidth; // Calcula o progresso com base na posição do jogador

  head.setX(progressBar.width * progressBar.scaleX + gameState.width / 2 - 110); // Define a posição horizontal da cabeça da barra de progresso

  progressBar.setScale(progress, 1); // Define a escala horizontal da barra de progresso de acordo com o progresso
}

export function cleanBeasts(
  beastsGroup1,
  beastsGroup2,
  beastsGroup3,
  beastsGroup4 = null
) {
  const groups = [
    beastsGroup1,
    beastsGroup2,
    beastsGroup3,
    beastsGroup4,
  ].filter((group) => group !== null);

  groups.forEach((group) => {
    const children = group.getChildren();
    for (let i = 0; i < children.length; i++) {
      if (children[i]) {
        // Verifica se children[i] não é nulo ou indefinido
        children[i].destroy();
        i--;
      }
    }
  });
}

// Função que teleporta o jogador
export function teleportPlayer(context, player, heighPlayerPos, worldX) {
  console.log("teleportPlayer()");
  context.input.keyboard.on(
    // Captura as teclas pressionadas
    "keydown",
    function (event) {
      // Verifica qual tecla foi pressionada e atualiza as variáveis de contexto correspondentes
      if (event.key === "t") {
        context.keyT = true;
      } else if (event.key === "e") {
        context.keyE = true;
      } else if (event.key === "l") {
        context.keyL = true;
      }

      // Verifica se a combinação de teclas foi pressionada
      if (context.keyT && context.keyT && context.keyL) {
        player.setPosition(worldX - 500, heighPlayerPos); // Teleporta o jogador para a nova posição especificada pelos parâmetros 'worldX' e 'heighPlayerPos'
        // Reinicia as variáveis de contexto para false, preparando-as para futuras combinações de teclas
        context.keyT = false;
        context.keyE = false;
        context.keyL = false;
      }
    },
    context // Define o contexto para a função de callback do evento de teclado
  );
}
