// Código Principal do Jogo
document.addEventListener('DOMContentLoaded', function() {

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

// VER LÓGICA DE PAUSAR E REINICIAR O JOGO
// const pauseScreen = document.getElementById('pauseScreen');
// const resumeButton = document.getElementById('resumeButton');
const restartButton = document.getElementById('restartButton');
const gameOverScreen = document.getElementById('gameOverScreen');
//FIM DA LÓGICA DE PAUSAR E REINICIAR O JOGO


// Configurações do Canvas
canvas.width = 896;
canvas.height = 704;

//Loop do jogo
let gameStarted = false;
let lastTime = 0;
const FPS = 60;
const MAX_BALAS = 6;
let balasDisponiveis = MAX_BALAS;
let recarregando = false;
let playerLives = 3; // Vidas do jogador
let score = 0;
let fase = 1; // Fase inicial
const MAX_FASE = 3; // Fase máxima
// let paused = false; // Variável para controlar o estado de pausa
let spawnIntervalId = null; // Variável para armazenar o ID do intervalo de spawn

//Player
const player = { 
    x: 400,
    y: 300,
    width: 50,
    height: 40,
    speed: 3,
    direction: 'right', //direção inicial
    imageRight: new Image(), //Sprite p direita
    imageLeft: new Image() //Sprite p esquerda
}

player.imageRight.src = 'img/personagemD.png'; // Caminho para a sprite da direita
player.imageLeft.src = 'img/personagemE.png'; // Caminho para a sprite da esquerda

const groundImage = new Image();
groundImage.src = 'img/Mapa-GameSurvival.png'; // Caminho para a imagem do chão

/*const wallImage = new Image();
wallImage.src = 'img/arbusto-sprite.png'; // Caminho para a imagem da parede*/

// Array para as balas
const bullets = [];
const bulletSpeed = 4;

//Arrays para os inimigos
const enemies = [];
const enemySpeed = 2;


const keys ={};
window.addEventListener('keydown', function(e){
    keys[e.key] = true;
    //se a tecla for uma seta e não for repetição, dispara a bala
    if((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.repeat) {
       shootBullet();
    }
});
window.addEventListener('keyup', function(e){
    keys[e.key] = false;
}),
    window.addEventListener('keydown', function(e) {
        if (e.key.toLowerCase() === 'r') {
            recarregar();
        } 
});

document.getElementById('reloadButton').addEventListener('click', recarregar);

//TESTAR O BOTÃO DE PAUSAR E REINICIAR

// window.addEventListener('keydown', function(e) {
//     if (e.key === 'Escape') {
//         paused = !paused; // Alterna o estado de pausa
//         if (paused) {
//             pauseScreen.classList.remove('hidden'); // Mostra a tela de pausa
//         } else {
//             pauseScreen.classList.add('hidden'); // Esconde a tela de pausa
//             requestAnimationFrame(gameLoop); // Retorna ao loop do jogo
//         }
//     }
// });

// document.getElementById('restartButtonPause').addEventListener('click', function() {
//     location.reload(); // Reinicia o jogo
// });
// document.getElementById('restartButtonGameOver').addEventListener('click', function() {
//     location.reload(); // Reinicia o jogo
// });

// resumeButton.addEventListener('click', function() {
//     paused = false; // Retorna ao estado normal
//     pauseScreen.classList.add('hidden'); // Esconde a tela de pausa
//     requestAnimationFrame(gameLoop); // Retorna ao loop do jogo
// });

// // Função para reiniciar o jogo
// function reiniciarJogo() {
//     playerLives = 3; // Reinicia as vidas do jogador
//     score = 0; // Reinicia a pontuação
//     fase = 1; // Reinicia a fase
//     balasDisponiveis = MAX_BALAS; // Reinicia as balas disponíveis
//     enemies.length = 0; // Limpa os inimigos
//     bullets.length = 0; // Limpa as balas
//     gameStarted = false; // Reinicia o estado do jogo
//     gameOverScreen.style.display = 'none'; // Esconde a tela de Game Over
// }

// restartButton.addEventListener('click', function() {
//     reiniciarJogo(); // Reinicia o jogo
//     startButton.style.display = 'block'; // Mostra o botão de iniciar
//     gameOverScreen.style.display = 'none'; // Esconde a tela de Game Over
// });

//FIM DO TESTE DO BOTÃO DE PAUSAR E REINICIAR

// Função para atualizar o HUD (Heads-Up Display)
function atualizarHud() {
    const contadorBalas = document.getElementById('bulletCount');
    contadorBalas.textContent = `Balas: ${balasDisponiveis}`;
    const vidasJogador = document.getElementById('livesCount');
    vidasJogador.textContent = `Vidas: ${playerLives}`;
    const scoreHud = document.getElementById('scoreCount');
    if (scoreHud) scoreHud.textContent = `Pontuação: ${score}`;
    const faseHud = document.getElementById('faseCount');
    if (faseHud) faseHud.textContent = `Fase: ${fase}`;
}

// Função para criar uma bala na direção da seta pressionada
function shootBullet() {
    if (balasDisponiveis > 0 && !recarregando) {
        const bullet = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            radius: 5,
            vx: 0,
            vy: 0,
        };

        if (keys['ArrowUp'] && keys['ArrowRight']) {
            bullet.vx = bulletSpeed * Math.cos(Math.PI / 4);
            bullet.vy = -bulletSpeed * Math.sin(Math.PI / 4);
        } else if (keys['ArrowUp'] && keys['ArrowLeft']) {
            bullet.vx = -bulletSpeed * Math.cos(Math.PI / 4);
            bullet.vy = -bulletSpeed * Math.sin(Math.PI / 4);
        } else if (keys['ArrowDown'] && keys['ArrowRight']) {
            bullet.vx = bulletSpeed * Math.cos(Math.PI / 4);
            bullet.vy = bulletSpeed * Math.sin(Math.PI / 4);
        } else if (keys['ArrowDown'] && keys['ArrowLeft']) {
            bullet.vx = -bulletSpeed * Math.cos(Math.PI / 4);
            bullet.vy = bulletSpeed * Math.sin(Math.PI / 4);
        } else if (keys['ArrowUp']) {
            bullet.vy = -bulletSpeed;
        } else if (keys['ArrowDown']) {
            bullet.vy = bulletSpeed;
        } else if (keys['ArrowLeft']) {
            bullet.vx = -bulletSpeed;
        } else if (keys['ArrowRight']) {
            bullet.vx = bulletSpeed;
        } else {
            return;
        }

        bullets.push(bullet);
        balasDisponiveis--;
        atualizarHud();
    } else if (balasDisponiveis === 0) {
        console.log('Sem balas disponíveis! Recarregue.');
    }
}

function recarregar() {
    if (!recarregando && balasDisponiveis < MAX_BALAS) {
        recarregando = true;
        console.log('Recarregando...');
        setTimeout(() => {
            balasDisponiveis = MAX_BALAS;
            atualizarHud();
            recarregando = false;
            console.log('Arma recarregada.');
        }, 2000); // Tempo de recarga em milissegundos
    }
}

// Função para criar um inimigo
function spawnEnemy() {
    const side = Math.floor(Math.random() * 4); // 0: cima, 1: baixo, 2: esquerda, 3: direita
    let enemy = {
        x: 0,
        y: 0,
        width: 50,
        height: 40,
        speed: enemySpeed,
        frameX: 0, // Controle da animação do inimigo
        frameWidth: 50,
        frameHeight: 40,
        direction: 'right', // Direção inicial do inimigo
        imageEnemy1: new Image(),
    }

    enemy.imageEnemy1.src = 'img/enemy1-sprite.png'; // Caminho para a imagem do inimigo
    
    // Define a posição de spawn com base no lado escolhido
    if (side === 0) { // Topo
        enemy.x = Math.random() * canvas.width;
        enemy.y = -enemy.height;
    } else if (side === 1) { // Direita
        enemy.x = canvas.width + enemy.width;
        enemy.y = Math.random() * canvas.height;
        enemy.direction = 'left'; // Direção inicial para a esquerda
    } else if (side === 2) { // Baixo
        enemy.x = Math.random() * canvas.width;
        enemy.y = canvas.height + enemy.height;
    } else if (side === 3) { // Esquerda
        enemy.x = -enemy.width;
        enemy.y = Math.random() * canvas.height;
        enemy.direction = 'right'; // Direção inicial para a direita
    }

    enemies.push(enemy);
}

function checarColisao(){
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (
            player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y
        ) {
            // Colisão detectada, remova o inimigo e diminua a vida do jogador
            enemies.splice(i, 1);
            playerLives--;
            atualizarHud();
            
            if (playerLives <= 0) {
                gameOver();
            }
        }
    }
}

// Os inimigos devem se mover em direção ao jogador.
//Função que gerencia o movimento dos inimigos
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        let enemy = enemies[i];

        // Direção em direção ao jogador
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) { // Evita divisão por zero
            enemy.x += (dx / distance) * enemy.speed;
            enemy.y += (dy / distance) * enemy.speed;
        }

        /*// Remover inimigos que saírem da tela (opcional)
        if (enemy.x < -50 || enemy.x > canvas.width + 50 || 
            enemy.y < -50 || enemy.y > canvas.height + 50) {
            enemies.splice(i, 1);
        }*/

        // Atualiza a direção do inimigo
        enemy.direction = dx > 0 ? 'right' : 'left';

        // Alterna os frames da animação
        enemy.frameX = enemy.frameX === 0 ? 50 : 0; // Alterna entre os frames

        // Verifica se algum inimigo foi atingido por uma bala
        for (let j = bullets.length - 1; j >= 0; j--) {
            let bullet = bullets[j];

            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.radius > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.radius > enemy.y
            ) {
                // Remove a bala e o inimigo atingido
                bullets.splice(j, 1);
                enemies.splice(i, 1);
                score++; // Aumenta a pontuação
                atualizarHud();

                if (score % 100 === 0 && fase < MAX_FASE) {
                    fase++; // Aumenta a fase a cada 100 pontos
                    startSpawnEnemies(3000 - (fase * 500)); // Diminui o intervalo de spawn
                    // alert(`Fase ${fase} Os inimigos estão mais rápidos!`);
                    atualizarHud();
                }
                break;
            }
        }
    }
}

// Desenha os inimigos com sprites animados
function drawEnemies() {
    enemies.forEach(enemy => {
        let spriteX = enemy.direction === 'right' ? 0 : 50; // Escolhe a parte do sprite
        ctx.drawImage(
            enemy.imageEnemy1,
            spriteX, 0, // Posição do frame na spritesheet
            enemy.frameWidth, enemy.frameHeight, // Tamanho do frame
            enemy.x, enemy.y, // Posição no canvas
            enemy.width, enemy.height // Tamanho no canvas
        );
    });
}

function startSpawnEnemies(interval) {
    if (spawnIntervalId) clearInterval(spawnIntervalId); // Limpa o intervalo anterior
    spawnIntervalId = setInterval(spawnEnemy, interval);
}

function gameOver() {
    // alert('Game Over!');
    // location.reload(); // Reinicia o jogo
    document.getElementById('gameOverScreen').classList.remove('hidden'); // Mostra a tela de Game Over
}

document.getElementById('restartButton').addEventListener('click', function() {
    location.reload(); // Reinicia o jogo
});

function update(){

    if (playerLives <= 0) {
        return; // Não atualiza se o jogador estiver sem vidas
    }

    if(keys['w']){
        player.y -= player.speed;
    }
    if(keys['s']){
        player.y += player.speed;
    }
    if(keys['a']){
        player.x -= player.speed;
        player.direction = 'left'; // Atualiza a direção
    }
    if(keys['d']){
        player.x += player.speed;
        player.direction = 'right'; // Atualiza a direção
    }

    // Limites da tela
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, canvas.height - player.height));

    // Atualiza a posição das balas
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.vx;
        b.y += b.vy;

        // Remove a bala se ela sair da tela
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(i, 1);
        }
    }

}


let currentScene ={
    ground: [
        {x: 0, y: 0, width: 896, height: 704}
    ],

    /*walls: [
        //parede esquerda
        {x: 0, y: 0, width: 20, height: 700},
        //topo
        {x: 0, y: 0, width: 450, height: 20},
        {x: 450, y: 0, width: 450, height: 20},
        {x: 880, y: 0, width: 20, height: 700},
        //inferior
        {x: 0, y: 680, width: 450, height: 20},
        {x: 450, y: 680, width: 450, height: 20},
    ]*/
}

// Exemplo de função que lida com o disparo de uma bala
/*function dispararBala() {
    if (balasDisponiveis > 0) {
        // Lógica para disparar a bala
        balasDisponiveis--;
        atualizarHud();
    } else {
        console.log('Sem balas disponíveis!');
    }
}*/



function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o chão
    /*ctx.fillStyle = '#008000';
    currentScene.ground.forEach(ground => {
        ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
    });*/
    currentScene.ground.forEach(ground => {
        ctx.drawImage(
            groundImage, 
            ground.x, 
            ground.y, 
            ground.width, 
            ground.height
        );
    });

    // Desenha as paredes
    /*ctx.fillStyle = '#0000ff';
    currentScene.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });*/
    /*currentScene.walls.forEach(wall => {
        ctx.drawImage(
            wallImage, 
            wall.x, 
            wall.y, 
            wall.width, 
            wall.height
        );
    });*/

    // Desenha o jogador
    // ctx.fillStyle = '#ffd700';
    // ctx.fillRect(player.x, player.y, player.width, player.height);

    // Desenha o jogador (imagem)
    
    if (player.direction === 'right') {
        // Desenha o frame para a direita
        ctx.drawImage(
            player.imageRight,
            player.x,// Coordenada X de origem na spritesheet
            player.y, // Coordenada Y de origem na spritesheet
            //50, // Largura do frame
            //40, // Altura do frame
            //player.x, // Posição X no canvas
            //player.y, // Posição Y no canvas
            player.width, // Largura no canvas
            player.height // Altura no canvas
        );
    } else if (player.direction === 'left') {
        // Desenha o frame para a esquerda
        ctx.drawImage(
            player.imageLeft,
            player.x, // Coordenada X de origem na spritesheet (segundo frame)
            player.y, // Coordenada Y de origem na spritesheet
            //50, // Largura do frame
            //40, // Altura do frame
            //player.x, // Posição X no canvas
            //player.y, // Posição Y no canvas
            player.width, // Largura no canvas
            player.height // Altura no canvas
        );
    }

    /*if (player.direction === 'right') {
        ctx.drawImage(player.image, 100, 0, 50, 40, player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(player.image, 150, 0, 50, 40, player.x, player.y, player.width, player.height);
    }*/

    // Desenha as balas
    ctx.fillStyle = '#889895';
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();
    });

    //desenha os inimigos
    /*enemies.forEach(enemy => {
        ctx.drawImage(
            enemy.imageEnemy1, 
            enemy.x, 
            enemy.y, 
            enemy.width, 
            enemy.height
        );
    });*/
    drawEnemies();

    //Pausa display

    // if (paused) {
    //     ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    //     ctx.fillRect(0, 0, canvas.width, canvas.height);
    //     ctx.fillStyle = '#fff';
    //     ctx.font = '30px Arial';
    //     ctx.fillText('Jogo Pausado', canvas.width / 2 - 70, canvas.height / 2);
    // }

}

function gameLoop(timestamp) {
    //isso que falha o jogo
    /*if (gameStarted){
        if (timestamp - lastTime > 1000/FPS) {
            update();
            updateEnemies(); // Atualiza a posição dos inimigos
            draw();
            lastTime = timestamp;
        }
    }*/
    if (!gameStarted){
        return; // Não faz nada se o jogo não tiver iniciado
    }

    if (timestamp - lastTime > 1000/FPS) {
        update();
        updateEnemies(); // Atualiza a posição dos inimigos
        checarColisao(); // Verifica colisões entre o jogador e os inimigos
        draw();
        lastTime = timestamp;
    }
    requestAnimationFrame((timestamp) => gameLoop(timestamp));
}

startButton.addEventListener('click', function () {
    if (!gameStarted) {
        gameStarted = true;
        gameLoop(); // Inicia o loop do jogo
        atualizarHud();
        startSpawnEnemies(3000); // Inicia o spawn dos inimigos
        startButton.style.display = 'none'; // Esconde o botão após começar
    }
});


/*player.image.onload = function() {
    // Inicia o loop do jogo quando a imagem do jogador estiver carregada
    gameLoop();
    // Atualiza o HUD inicial
    atualizarHud();
}*/
/*
// Inicia o loop do jogo quando a imagem do jogador estiver carregada
gameLoop();
// Atualiza o HUD inicial
atualizarHud();

setInterval(spawnEnemy, 3000); // Gera um inimigo a cada 2 segundos 
*/

});