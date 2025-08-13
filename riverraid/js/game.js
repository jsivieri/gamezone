// River Raid Game - KMIKZ GameZone
class RiverRaidGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gameWidth = 800;
        this.gameHeight = 600;
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        
        // Estados do jogo
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.fuel = 100;
        this.level = 1;
        this.speed = 2;
        this.enemiesDestroyed = 0;
        this.distanceTraveled = 0;
        
        // Player
        this.player = {
            x: this.gameWidth / 2 - 15,
            y: this.gameHeight - 100,
            width: 30,
            height: 40,
            speed: 5,
            color: '#00ffff'
        };
        
        // Arrays de objetos
        this.bullets = [];
        this.enemies = [];
        this.fuelTanks = [];
        this.obstacles = [];
        this.explosions = [];
        this.particles = [];
        this.riverBanks = [];
        
        // Controles
        this.keys = {};
        
        // Configurações de spawn
        this.enemySpawnRate = 0.02;
        this.fuelSpawnRate = 0.005;
        this.obstacleSpawnRate = 0.01;
        
        // Configurações do rio
        this.riverWidth = 400;
        this.riverOffset = 0;
        this.riverWave = 0;
        
        // Elementos de áudio
        this.backgroundMusic = null;
        this.shotSound = null;
        this.explosionSound = null;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupEventListeners();
        this.generateInitialRiver();
        this.showScreen('menuScreen');
        this.gameLoop();
    }
    
    setupAudio() {
        try {
            // Configurar áudio de fundo
            this.backgroundMusic = document.getElementById('backgroundMusic');
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = 0.3;
                this.backgroundMusic.preload = 'auto';
            }
            
            // Configurar som de tiro
            this.shotSound = document.getElementById('shotSound');
            if (this.shotSound) {
                this.shotSound.volume = 0.5;
                this.shotSound.preload = 'auto';
            }
            
            // Configurar som de explosão
            this.explosionSound = document.getElementById('explosionSound');
            if (this.explosionSound) {
                this.explosionSound.volume = 0.6;
                this.explosionSound.preload = 'auto';
            }
        } catch (error) {
            console.log('Erro ao configurar áudio:', error);
        }
    }
    
    setupEventListeners() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === 'Escape') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Prevenir comportamento padrão das setas
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }
    
    generateInitialRiver() {
        this.riverBanks = [];
        for (let i = 0; i < 50; i++) {
            this.riverBanks.push({
                leftBank: (this.gameWidth - this.riverWidth) / 2 + Math.sin(i * 0.1) * 50,
                rightBank: (this.gameWidth + this.riverWidth) / 2 + Math.sin(i * 0.1) * 50,
                y: i * 20
            });
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
        this.showScreen('gameScreen');
        
        // Iniciar música de fundo
        try {
            if (this.backgroundMusic) {
                this.backgroundMusic.currentTime = 0;
                this.backgroundMusic.play().catch(() => {});
            }
        } catch (error) {
            console.log('Erro ao reproduzir música de fundo:', error);
        }
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.fuel = 100;
        this.level = 1;
        this.speed = 2;
        this.enemiesDestroyed = 0;
        this.distanceTraveled = 0;
        
        this.player.x = this.gameWidth / 2 - 15;
        this.player.y = this.gameHeight - 100;
        
        this.bullets = [];
        this.enemies = [];
        this.fuelTanks = [];
        this.obstacles = [];
        this.explosions = [];
        this.particles = [];
        
        this.generateInitialRiver();
        this.updateHUD();
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseScreen');
            
            // Pausar música de fundo
            try {
                if (this.backgroundMusic && !this.backgroundMusic.paused) {
                    this.backgroundMusic.pause();
                }
            } catch (error) {
                console.log('Erro ao pausar música:', error);
            }
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('gameScreen');
            
            // Retomar música de fundo
            try {
                if (this.backgroundMusic && this.backgroundMusic.paused) {
                    this.backgroundMusic.play().catch(() => {});
                }
            } catch (error) {
                console.log('Erro ao retomar música:', error);
            }
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.saveScore();
        this.updateFinalStats();
        this.showScreen('gameOverScreen');
        
        // Parar música de fundo
        try {
            if (this.backgroundMusic && !this.backgroundMusic.paused) {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
            }
        } catch (error) {
            console.log('Erro ao parar música:', error);
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateFuelTanks();
        this.updateObstacles();
        this.updateExplosions();
        this.updateParticles();
        this.updateRiver();
        this.spawnObjects();
        this.checkCollisions();
        this.updateGameLogic();
        this.updateHUD();
    }
    
    handleInput() {
        // Movimento do jogador
        if (this.keys['ArrowLeft'] && this.player.x > 50) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.gameWidth - 50) {
            this.player.x += this.player.speed;
        }
        if (this.keys['ArrowUp'] && this.player.y > 50) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['ArrowDown'] && this.player.y < this.gameHeight - 50) {
            this.player.y += this.player.speed;
        }
        
        // Tiro
        if (this.keys[' '] && this.bullets.length < 10) {
            this.shoot();
            this.keys[' '] = false; // Evitar tiro contínuo
        }
    }
    
    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8,
            color: '#ffff00'
        });
        
        // Reproduzir som de tiro
        try {
            if (this.shotSound) {
                this.shotSound.currentTime = 0;
                this.shotSound.play().catch(() => {});
            }
        } catch (error) {
            console.log('Erro ao reproduzir som de tiro:', error);
        }
    }
    
    updatePlayer() {
        // Manter jogador dentro das margens do rio
        const currentRiver = this.getCurrentRiverBounds();
        if (this.player.x < currentRiver.left + 10) {
            this.player.x = currentRiver.left + 10;
        }
        if (this.player.x + this.player.width > currentRiver.right - 10) {
            this.player.x = currentRiver.right - 10 - this.player.width;
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += this.speed;
            
            // Movimento lateral dos inimigos
            if (enemy.type === 'helicopter') {
                enemy.x += Math.sin(enemy.y * 0.01) * 1;
            } else if (enemy.type === 'jet') {
                enemy.x += enemy.direction * 2;
                if (enemy.x <= 50 || enemy.x >= this.gameWidth - 50) {
                    enemy.direction *= -1;
                }
            }
            
            if (enemy.y > this.gameHeight) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateFuelTanks() {
        for (let i = this.fuelTanks.length - 1; i >= 0; i--) {
            const tank = this.fuelTanks[i];
            tank.y += this.speed;
            
            if (tank.y > this.gameHeight) {
                this.fuelTanks.splice(i, 1);
            }
        }
    }
    
    updateObstacles() {
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.y += this.speed;
            
            if (obstacle.y > this.gameHeight) {
                this.obstacles.splice(i, 1);
            }
        }
    }
    
    updateExplosions() {
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            const explosion = this.explosions[i];
            explosion.frame++;
            explosion.radius += 2;
            explosion.alpha -= 0.05;
            
            if (explosion.alpha <= 0) {
                this.explosions.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateRiver() {
        this.riverWave += 0.02;
        
        // Atualizar bancos do rio
        for (let i = 0; i < this.riverBanks.length; i++) {
            this.riverBanks[i].y += this.speed;
        }
        
        // Adicionar novos segmentos do rio
        while (this.riverBanks[this.riverBanks.length - 1].y > -20) {
            const lastBank = this.riverBanks[this.riverBanks.length - 1];
            this.riverBanks.push({
                leftBank: (this.gameWidth - this.riverWidth) / 2 + Math.sin(this.riverWave) * 80,
                rightBank: (this.gameWidth + this.riverWidth) / 2 + Math.sin(this.riverWave) * 80,
                y: lastBank.y - 20
            });
        }
        
        // Remover segmentos antigos
        this.riverBanks = this.riverBanks.filter(bank => bank.y < this.gameHeight + 50);
    }
    
    spawnObjects() {
        // Spawn inimigos
        if (Math.random() < this.enemySpawnRate) {
            this.spawnEnemy();
        }
        
        // Spawn combustível
        if (Math.random() < this.fuelSpawnRate) {
            this.spawnFuelTank();
        }
        
        // Spawn obstáculos
        if (Math.random() < this.obstacleSpawnRate) {
            this.spawnObstacle();
        }
    }
    
    spawnEnemy() {
        const riverBounds = this.getCurrentRiverBounds();
        const enemyTypes = ['helicopter', 'jet', 'boat'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let enemy = {
            x: riverBounds.left + Math.random() * (riverBounds.right - riverBounds.left - 40),
            y: -50,
            width: 30,
            height: 25,
            type: type,
            color: type === 'helicopter' ? '#ff0000' : type === 'jet' ? '#ff6600' : '#008000',
            direction: Math.random() > 0.5 ? 1 : -1,
            health: type === 'jet' ? 2 : 1
        };
        
        this.enemies.push(enemy);
    }
    
    spawnFuelTank() {
        const riverBounds = this.getCurrentRiverBounds();
        
        this.fuelTanks.push({
            x: riverBounds.left + Math.random() * (riverBounds.right - riverBounds.left - 25),
            y: -30,
            width: 25,
            height: 30,
            color: '#ffff00'
        });
    }
    
    spawnObstacle() {
        const riverBounds = this.getCurrentRiverBounds();
        
        this.obstacles.push({
            x: riverBounds.left + Math.random() * (riverBounds.right - riverBounds.left - 35),
            y: -40,
            width: 35,
            height: 40,
            color: '#666666'
        });
    }
    
    getCurrentRiverBounds() {
        const riverIndex = Math.floor(this.player.y / 20);
        const riverBank = this.riverBanks[Math.min(riverIndex, this.riverBanks.length - 1)] || this.riverBanks[0];
        return {
            left: riverBank.leftBank,
            right: riverBank.rightBank
        };
    }
    
    checkCollisions() {
        // Balas vs Inimigos
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.bullets.splice(i, 1);
                    
                    enemy.health--;
                    if (enemy.health <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += enemy.type === 'jet' ? 200 : 100;
                        this.enemiesDestroyed++;
                    }
                    break;
                }
            }
        }
        
        // Jogador vs Inimigos
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.isColliding(this.player, enemy)) {
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                this.enemies.splice(i, 1);
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Jogador vs Combustível
        for (let i = this.fuelTanks.length - 1; i >= 0; i--) {
            const tank = this.fuelTanks[i];
            
            if (this.isColliding(this.player, tank)) {
                this.fuelTanks.splice(i, 1);
                this.fuel = Math.min(100, this.fuel + 30);
                this.score += 50;
                this.createParticles(tank.x + tank.width / 2, tank.y + tank.height / 2, '#ffff00');
            }
        }
        
        // Jogador vs Obstáculos
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            
            if (this.isColliding(this.player, obstacle)) {
                this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameOver();
                    return;
                }
            }
        }
        
        // Verificar colisão com margens do rio
        const riverBounds = this.getCurrentRiverBounds();
        if (this.player.x < riverBounds.left || this.player.x + this.player.width > riverBounds.right) {
            this.fuel -= 0.5; // Penalidade por sair do rio
        }
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        this.explosions.push({
            x: x,
            y: y,
            radius: 5,
            frame: 0,
            alpha: 1,
            color: '#ff6600'
        });
        
        this.createParticles(x, y, '#ff0000');
        
        // Reproduzir som de explosão
        try {
            if (this.explosionSound) {
                this.explosionSound.currentTime = 0;
                this.explosionSound.play().catch(() => {});
            }
        } catch (error) {
            console.log('Erro ao reproduzir som de explosão:', error);
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                alpha: 1,
                color: color,
                size: Math.random() * 3 + 1
            });
        }
    }
    
    updateGameLogic() {
        // Diminuir combustível
        this.fuel -= 0.05;
        
        if (this.fuel <= 0) {
            this.gameOver();
            return;
        }
        
        // Aumentar velocidade gradualmente
        this.speed = Math.min(5, 2 + Math.floor(this.score / 1000) * 0.5);
        
        // Atualizar distância
        this.distanceTraveled += this.speed;
        
        // Aumentar nível
        this.level = Math.floor(this.score / 2000) + 1;
        
        // Aumentar dificuldade
        this.enemySpawnRate = Math.min(0.05, 0.02 + this.level * 0.003);
    }
    
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        if (this.gameState === 'playing') {
            this.renderRiver();
            this.renderObjects();
            this.renderParticles();
            this.renderExplosions();
            this.renderPlayer();
        }
    }
    
    renderRiver() {
        // Renderizar água
        this.ctx.fillStyle = '#0066cc';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        // Renderizar margens
        this.ctx.fillStyle = '#004400';
        for (let bank of this.riverBanks) {
            // Margem esquerda
            this.ctx.fillRect(0, bank.y, bank.leftBank, 20);
            // Margem direita
            this.ctx.fillRect(bank.rightBank, bank.y, this.gameWidth - bank.rightBank, 20);
        }
        
        // Efeito de ondas na água
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 10; i++) {
            const waveY = (this.riverWave * 100 + i * 60) % this.gameHeight;
            this.ctx.fillRect(100, waveY, this.gameWidth - 200, 2);
        }
    }
    
    renderObjects() {
        // Renderizar balas
        this.ctx.fillStyle = '#ffff00';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Renderizar inimigos
        for (let enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.renderEnemy(enemy);
        }
        
        // Renderizar combustível
        this.ctx.fillStyle = '#ffff00';
        for (let tank of this.fuelTanks) {
            this.ctx.fillRect(tank.x, tank.y, tank.width, tank.height);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(tank.x + 5, tank.y + 5, tank.width - 10, tank.height - 10);
            this.ctx.fillStyle = '#ffff00';
        }
        
        // Renderizar obstáculos
        this.ctx.fillStyle = '#666666';
        for (let obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    }
    
    renderEnemy(enemy) {
        const { x, y, width, height, type } = enemy;
        
        this.ctx.fillStyle = enemy.color;
        
        if (type === 'helicopter') {
            // Corpo do helicóptero
            this.ctx.fillRect(x, y + 10, width, height - 10);
            // Hélice
            this.ctx.fillRect(x - 5, y, width + 10, 3);
        } else if (type === 'jet') {
            // Corpo do jato
            this.ctx.fillRect(x + 5, y, width - 10, height);
            // Asas
            this.ctx.fillRect(x, y + height / 2, width, 5);
        } else if (type === 'boat') {
            // Casco do barco
            this.ctx.fillRect(x, y + height / 2, width, height / 2);
            // Superestrutura
            this.ctx.fillRect(x + width / 3, y, width / 3, height / 2);
        }
    }
    
    renderParticles() {
        for (let particle of this.particles) {
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    renderExplosions() {
        for (let explosion of this.explosions) {
            this.ctx.globalAlpha = explosion.alpha;
            this.ctx.fillStyle = explosion.color;
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }
    
    renderPlayer() {
        const { x, y, width, height } = this.player;
        
        // Corpo da aeronave
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(x + width / 4, y, width / 2, height);
        
        // Asas
        this.ctx.fillRect(x, y + height / 2, width, height / 4);
        
        // Cockpit
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + width / 3, y + 5, width / 3, height / 4);
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        
        const fuelLevel = document.getElementById('fuelLevel');
        fuelLevel.style.width = Math.max(0, this.fuel) + '%';
        
        // Mudança de cor da barra de combustível
        if (this.fuel > 50) {
            fuelLevel.style.background = 'linear-gradient(90deg, #ffff00, #00ff00)';
        } else if (this.fuel > 20) {
            fuelLevel.style.background = 'linear-gradient(90deg, #ff6600, #ffff00)';
        } else {
            fuelLevel.style.background = '#ff0000';
        }
    }
    
    updateFinalStats() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('enemiesDestroyed').textContent = this.enemiesDestroyed;
        document.getElementById('distanceTraveled').textContent = Math.floor(this.distanceTraveled);
        
        // Verificar se é novo recorde
        const highScores = this.getHighScores();
        const isNewRecord = highScores.length === 0 || this.score > highScores[0].score;
        
        if (isNewRecord) {
            document.getElementById('newRecordMessage').classList.remove('hidden');
        } else {
            document.getElementById('newRecordMessage').classList.add('hidden');
        }
    }
    
    saveScore() {
        const scores = this.getHighScores();
        scores.push({
            score: this.score,
            enemies: this.enemiesDestroyed,
            distance: Math.floor(this.distanceTraveled),
            date: new Date().toLocaleDateString()
        });
        
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Manter apenas top 10
        
        localStorage.setItem('riverRaidScores', JSON.stringify(scores));
    }
    
    getHighScores() {
        return JSON.parse(localStorage.getItem('riverRaidScores')) || [];
    }
    
    showScreen(screenId) {
        // Esconder todas as telas
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Mostrar tela solicitada
        document.getElementById(screenId).classList.add('active');
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Instância global do jogo
let game;

// Funções globais para os botões
function startGame() {
    game.startGame();
}

function showInstructions() {
    game.showScreen('instructionsScreen');
}

function showScores() {
    displayHighScores();
    game.showScreen('scoresScreen');
}

function backToMenu() {
    game.gameState = 'menu';
    game.showScreen('menuScreen');
    
    // Parar música de fundo
    try {
        if (game.backgroundMusic && !game.backgroundMusic.paused) {
            game.backgroundMusic.pause();
            game.backgroundMusic.currentTime = 0;
        }
    } catch (error) {
        console.log('Erro ao parar música:', error);
    }
}

function restartGame() {
    game.startGame();
}

function resumeGame() {
    game.resumeGame();
}

function clearScores() {
    if (confirm('Tem certeza que deseja limpar todos os recordes?')) {
        localStorage.removeItem('riverRaidScores');
        displayHighScores();
    }
}

function displayHighScores() {
    const scoresList = document.getElementById('scoresList');
    const scores = JSON.parse(localStorage.getItem('riverRaidScores')) || [];
    
    if (scores.length === 0) {
        scoresList.innerHTML = '<p style="color: #cccccc; text-align: center;">Nenhum recorde ainda!</p>';
        return;
    }
    
    scoresList.innerHTML = scores.map((score, index) => `
        <div class="score-item">
            <span class="score-rank">${index + 1}º</span>
            <span>${score.score} pts</span>
            <span>${score.enemies} inimigos</span>
            <span>${score.distance}m</span>
            <span>${score.date}</span>
        </div>
    `).join('');
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    game = new RiverRaidGame();
});
