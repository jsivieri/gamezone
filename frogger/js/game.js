// Frogger Game - KMIKZ GameZone
class FroggerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configurações do jogo
        this.gameWidth = 800;
        this.gameHeight = 600;
        this.canvas.width = this.gameWidth;
        this.canvas.height = this.gameHeight;
        
        // Estados do jogo
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelComplete
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeLeft = 90;
        this.maxTime = 90;
        this.crossings = 0;
        
        // Player (Sapinho)
        this.frog = {
            x: this.gameWidth / 2 - 20,
            y: this.gameHeight - 60,
            width: 40,
            height: 40,
            startY: this.gameHeight - 60,
            targetY: 60,
            isMoving: false,
            direction: 'up'
        };
        
        // Arrays de objetos
        this.cars = [];
        this.logs = [];
        this.turtles = [];
        this.lilypads = [];
        this.particles = [];
        
        // Configurações das faixas
        this.lanes = [
            { y: 540, type: 'safe', color: '#4caf50' }, // Início (grama)
            { y: 480, type: 'road', color: '#333333', speed: 1.2, direction: 1 }, // Reduzido de 2
            { y: 420, type: 'road', color: '#333333', speed: 1.5, direction: -1 }, // Reduzido de 2.5
            { y: 360, type: 'road', color: '#333333', speed: 1.0, direction: 1 }, // Reduzido de 1.8
            { y: 300, type: 'road', color: '#333333', speed: 1.8, direction: -1 }, // Reduzido de 3
            { y: 240, type: 'safe', color: '#4caf50' }, // Meio (grama)
            { y: 180, type: 'water', color: '#4169e1', speed: 0.8, direction: 1 }, // Reduzido de 1.5
            { y: 120, type: 'water', color: '#4169e1', speed: 1.0, direction: -1 }, // Reduzido de 2
            { y: 60, type: 'goal', color: '#ffd700' } // Meta
        ];
        
        // Configurações de spawn
        this.carSpawnRate = 0.01;
        this.logSpawnRate = 0.05; // Taxa muito alta para garantir troncos
        this.turtleSpawnRate = 0.025; // Taxa alta para tartarugas
        this.gameTimer = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showScreen('menuScreen');
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.handleInput(e.key);
            }
            
            if (e.key === 'Escape') {
                if (this.gameState === 'playing') {
                    this.pauseGame();
                }
            }
        });
        
        // Controles mobile
        document.getElementById('upBtn').addEventListener('click', () => this.handleInput('ArrowUp'));
        document.getElementById('downBtn').addEventListener('click', () => this.handleInput('ArrowDown'));
        document.getElementById('leftBtn').addEventListener('click', () => this.handleInput('ArrowLeft'));
        document.getElementById('rightBtn').addEventListener('click', () => this.handleInput('ArrowRight'));
        
        // Prevenir scroll no mobile
        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    handleInput(key) {
        if (this.frog.isMoving || this.gameState !== 'playing') return;
        
        const moveDistance = 60; // Distância de cada movimento
        let newX = this.frog.x;
        let newY = this.frog.y;
        
        switch (key) {
            case 'ArrowUp':
                newY = Math.max(60, this.frog.y - moveDistance);
                this.frog.direction = 'up';
                break;
            case 'ArrowDown':
                newY = Math.min(this.frog.startY, this.frog.y + moveDistance);
                this.frog.direction = 'down';
                break;
            case 'ArrowLeft':
                newX = Math.max(20, this.frog.x - moveDistance);
                this.frog.direction = 'left';
                break;
            case 'ArrowRight':
                newX = Math.min(this.gameWidth - 60, this.frog.x + moveDistance);
                this.frog.direction = 'right';
                break;
        }
        
        this.moveFrog(newX, newY);
    }
    
    moveFrog(x, y) {
        this.frog.isMoving = true;
        this.frog.x = x;
        this.frog.y = y;
        
        // Animação de salto
        setTimeout(() => {
            this.frog.isMoving = false;
            this.checkGoal();
        }, 200);
        
        // Pontuação por movimento para frente
        if (this.frog.direction === 'up' && y < this.frog.y) {
            this.score += 10;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
        this.showScreen('gameScreen');
        this.startTimer();
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeLeft = this.maxTime;
        this.crossings = 0;
        
        this.frog.x = this.gameWidth / 2 - 20;
        this.frog.y = this.frog.startY;
        this.frog.isMoving = false;
        
        this.cars = [];
        this.logs = [];
        this.turtles = [];
        this.particles = [];
        
        // Spawn troncos e tartarugas iniciais para garantir que existam
        this.spawnInitialWaterObjects();
        
        this.updateHUD();
    }
    
    startTimer() {
        clearInterval(this.gameTimer);
        this.gameTimer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.timeLeft--;
                
                if (this.timeLeft <= 0) {
                    this.loseLife();
                }
            }
        }, 1000);
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.showScreen('gameScreen');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameTimer);
        this.saveScore();
        this.updateFinalStats();
        this.showScreen('gameOverScreen');
    }
    
    checkGoal() {
        // Verificar se chegou à meta
        if (this.frog.y <= 60) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        this.crossings++;
        
        // Pontuação bonus
        const timeBonus = this.timeLeft * 10;
        const levelBonus = this.level * 100;
        this.score += 500 + timeBonus + levelBonus;
        
        // Atualizar estatísticas da tela
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('bonusPoints').textContent = 500 + timeBonus + levelBonus;
        document.getElementById('timeBonus').textContent = this.timeLeft + 's';
        
        this.showScreen('levelCompleteScreen');
    }
    
    nextLevel() {
        this.level++;
        this.timeLeft = this.maxTime;
        
        // Aumentar dificuldade mais gradualmente
        this.lanes.forEach(lane => {
            if (lane.speed) {
                lane.speed += 0.15; // Reduzido de 0.3 para 0.15
            }
        });
        
        // Resetar posição do sapinho
        this.frog.x = this.gameWidth / 2 - 20;
        this.frog.y = this.frog.startY;
        this.frog.isMoving = false;
        
        // Limpar objetos
        this.cars = [];
        this.logs = [];
        this.turtles = [];
        
        // Respawnar objetos aquáticos iniciais
        this.spawnInitialWaterObjects();
        
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.updateHUD();
    }
    
    loseLife() {
        this.lives--;
        this.createDeathEffect();
        
        if (this.lives <= 0) {
            this.gameOver();
            return;
        }
        
        // Resetar posição e tempo
        this.frog.x = this.gameWidth / 2 - 20;
        this.frog.y = this.frog.startY;
        this.frog.isMoving = false;
        this.timeLeft = this.maxTime;
        
        this.updateHUD();
    }
    
    createDeathEffect() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.frog.x + this.frog.width / 2,
                y: this.frog.y + this.frog.height / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: '#ff0000',
                size: Math.random() * 4 + 2
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.spawnObjects();
        this.updateCars();
        this.updateLogs();
        this.updateTurtles();
        this.updateParticles();
        this.checkCollisions();
        this.updateHUD();
    }
    
    spawnObjects() {
        // Spawn carros
        if (Math.random() < this.carSpawnRate + (this.level * 0.002)) {
            this.spawnCar();
        }
        
        // Spawn troncos
        if (Math.random() < this.logSpawnRate + (this.level * 0.001)) {
            this.spawnLog();
        }
        
        // Spawn tartarugas
        if (Math.random() < this.turtleSpawnRate + (this.level * 0.001)) {
            this.spawnTurtle();
        }
    }
    
    // Função para spawnar objetos aquáticos iniciais
    spawnInitialWaterObjects() {
        const waterLanes = this.lanes.filter(lane => lane.type === 'water');
        
        // Garantir cobertura total - spawn determinístico de troncos
        waterLanes.forEach((lane, laneIndex) => {
            // Para cada faixa, criar troncos em posições fixas garantidas
            const trunkPositions = [100, 300, 500, 700]; // Posições fixas
            
            trunkPositions.forEach((basePos, i) => {
                const log = {
                    x: lane.direction > 0 ? basePos : this.gameWidth - basePos,
                    y: lane.y - 20,
                    width: 160, // Troncos ainda maiores
                    height: 30,
                    speed: lane.speed * lane.direction,
                    color: '#8b4513',
                    type: 'log'
                };
                this.logs.push(log);
            });
            
            // Adicionar algumas tartarugas entre os troncos
            const turtlePositions = [200, 400, 600];
            turtlePositions.forEach((basePos, i) => {
                if (Math.random() < 0.3) { // 30% chance de tartaruga
                    const turtle = {
                        x: lane.direction > 0 ? basePos : this.gameWidth - basePos,
                        y: lane.y - 15,
                        width: 80,
                        height: 25,
                        speed: lane.speed * lane.direction * 0.5, // Reduzido de 0.7 para 0.5
                        color: '#006400',
                        type: 'turtle',
                        diving: false,
                        diveTimer: Math.random() * 180 + 60 // Timer mais longo
                    };
                    this.turtles.push(turtle);
                }
            });
        });
        
        console.log(`Spawned ${this.logs.length} logs and ${this.turtles.length} turtles initially`);
    }
    
    spawnCar() {
        const roadLanes = this.lanes.filter(lane => lane.type === 'road');
        const lane = roadLanes[Math.floor(Math.random() * roadLanes.length)];
        
        const car = {
            x: lane.direction > 0 ? -80 : this.gameWidth + 20,
            y: lane.y - 30,
            width: 80,
            height: 30,
            speed: lane.speed * lane.direction,
            color: this.getRandomCarColor(),
            type: 'car'
        };
        
        this.cars.push(car);
    }
    
    spawnLog() {
        const waterLanes = this.lanes.filter(lane => lane.type === 'water');
        const lane = waterLanes[Math.floor(Math.random() * waterLanes.length)];
        
        const log = {
            x: lane.direction > 0 ? -160 : this.gameWidth + 20,
            y: lane.y - 20,
            width: 160, // Tamanho consistente com os iniciais
            height: 30,
            speed: lane.speed * lane.direction,
            color: '#8b4513',
            type: 'log'
        };
        
        this.logs.push(log);
    }
    
    spawnTurtle() {
        const waterLanes = this.lanes.filter(lane => lane.type === 'water');
        const lane = waterLanes[Math.floor(Math.random() * waterLanes.length)];
        
        const turtle = {
            x: lane.direction > 0 ? -80 : this.gameWidth + 20,
            y: lane.y - 15,
            width: 80, // Tamanho consistente com os iniciais
            height: 25,
            speed: lane.speed * lane.direction * 0.5, // Reduzido de 0.7 para 0.5
            color: '#006400',
            type: 'turtle',
            diving: false,
            diveTimer: 0
        };
        
        this.turtles.push(turtle);
    }
    
    getRandomCarColor() {
        const colors = ['#ff0000', '#0000ff', '#ffff00', '#ff6600', '#800080', '#00ff00'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateCars() {
        for (let i = this.cars.length - 1; i >= 0; i--) {
            const car = this.cars[i];
            car.x += car.speed;
            
            // Remover carros que saíram da tela
            if (car.x < -100 || car.x > this.gameWidth + 100) {
                this.cars.splice(i, 1);
            }
        }
    }
    
    updateLogs() {
        for (let i = this.logs.length - 1; i >= 0; i--) {
            const log = this.logs[i];
            log.x += log.speed;
            
            // Mover sapinho junto com o tronco se estiver em cima
            if (this.isOnLog(log)) {
                this.frog.x += log.speed;
                
                // Verificar se o sapinho saiu da tela
                if (this.frog.x < 0 || this.frog.x > this.gameWidth - this.frog.width) {
                    this.loseLife();
                }
            }
            
            // Remover troncos que saíram da tela
            if (log.x < -180 || log.x > this.gameWidth + 180) {
                this.logs.splice(i, 1);
            }
        }
    }
    
    updateTurtles() {
        for (let i = this.turtles.length - 1; i >= 0; i--) {
            const turtle = this.turtles[i];
            turtle.x += turtle.speed;
            
            // Sistema de mergulho das tartarugas (mais lento)
            turtle.diveTimer++;
            if (turtle.diveTimer > 300) { // Aumentado de 180 para 300 (5 segundos)
                turtle.diving = !turtle.diving;
                turtle.diveTimer = 0;
            }
            
            // Mover sapinho junto com a tartaruga se não estiver mergulhando
            if (this.isOnTurtle(turtle) && !turtle.diving) {
                this.frog.x += turtle.speed;
            }
            
            // Remover tartarugas que saíram da tela
            if (turtle.x < -100 || turtle.x > this.gameWidth + 100) {
                this.turtles.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        const frogLane = this.getCurrentLane();
        
        if (frogLane.type === 'road') {
            // Verificar colisão com carros
            for (let car of this.cars) {
                if (this.isColliding(this.frog, car)) {
                    this.loseLife();
                    return;
                }
            }
        } else if (frogLane.type === 'water') {
            // Na água, verificar se está em cima de tronco ou tartaruga
            let onSafeObject = false;
            
            for (let log of this.logs) {
                if (this.isOnLog(log)) {
                    onSafeObject = true;
                    break;
                }
            }
            
            if (!onSafeObject) {
                for (let turtle of this.turtles) {
                    if (this.isOnTurtle(turtle) && !turtle.diving) {
                        onSafeObject = true;
                        break;
                    }
                }
            }
            
            if (!onSafeObject) {
                this.loseLife();
                return;
            }
        }
    }
    
    getCurrentLane() {
        for (let lane of this.lanes) {
            if (Math.abs(this.frog.y + this.frog.height / 2 - lane.y) < 30) {
                return lane;
            }
        }
        return this.lanes[0]; // Fallback
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    isOnLog(log) {
        const frogCenter = { x: this.frog.x + this.frog.width / 2, y: this.frog.y + this.frog.height / 2 };
        return frogCenter.x >= log.x && frogCenter.x <= log.x + log.width &&
               Math.abs(frogCenter.y - (log.y + log.height / 2)) < 25;
    }
    
    isOnTurtle(turtle) {
        const frogCenter = { x: this.frog.x + this.frog.width / 2, y: this.frog.y + this.frog.height / 2 };
        return frogCenter.x >= turtle.x && frogCenter.x <= turtle.x + turtle.width &&
               Math.abs(frogCenter.y - (turtle.y + turtle.height / 2)) < 25;
    }
    
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        if (this.gameState === 'playing') {
            this.renderLanes();
            this.renderCars();
            this.renderLogs();
            this.renderTurtles();
            this.renderFrog();
            this.renderParticles();
        }
    }
    
    renderLanes() {
        for (let lane of this.lanes) {
            this.ctx.fillStyle = lane.color;
            this.ctx.fillRect(0, lane.y - 30, this.gameWidth, 60);
            
            // Linhas divisórias das estradas
            if (lane.type === 'road') {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(0, lane.y - 2, this.gameWidth, 4);
            }
        }
        
        // Linha de chegada
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillRect(0, 30, this.gameWidth, 60);
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '20px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🏆 META 🏆', this.gameWidth / 2, 70);
    }
    
    renderCars() {
        for (let car of this.cars) {
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // Detalhes do carro
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(car.x + 10, car.y + 5, car.width - 20, car.height - 10);
            
            // Rodas
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(car.x + 5, car.y - 3, 15, 6);
            this.ctx.fillRect(car.x + car.width - 20, car.y - 3, 15, 6);
            this.ctx.fillRect(car.x + 5, car.y + car.height - 3, 15, 6);
            this.ctx.fillRect(car.x + car.width - 20, car.y + car.height - 3, 15, 6);
        }
    }
    
    renderLogs() {
        for (let log of this.logs) {
            this.ctx.fillStyle = log.color;
            this.ctx.fillRect(log.x, log.y, log.width, log.height);
            
            // Textura do tronco
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(log.x, log.y + (i + 1) * log.height / 4);
                this.ctx.lineTo(log.x + log.width, log.y + (i + 1) * log.height / 4);
                this.ctx.stroke();
            }
        }
    }
    
    renderTurtles() {
        for (let turtle of this.turtles) {
            if (!turtle.diving) {
                this.ctx.fillStyle = turtle.color;
                this.ctx.fillRect(turtle.x, turtle.y, turtle.width, turtle.height);
                
                // Casco da tartaruga
                this.ctx.fillStyle = '#228b22';
                this.ctx.fillRect(turtle.x + 5, turtle.y - 5, turtle.width - 10, turtle.height);
                
                // Cabeça
                this.ctx.fillStyle = turtle.color;
                this.ctx.fillRect(turtle.x + turtle.width - 15, turtle.y + 2, 10, 8);
            } else {
                // Tartaruga mergulhando - bolhas
                for (let i = 0; i < 3; i++) {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    this.ctx.beginPath();
                    this.ctx.arc(turtle.x + 20 + i * 15, turtle.y + 5, 3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }
    
    renderFrog() {
        // Sombra
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(this.frog.x + 2, this.frog.y + this.frog.height - 2, this.frog.width, 4);
        
        // Corpo do sapinho
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.frog.x + 5, this.frog.y + 10, this.frog.width - 10, this.frog.height - 15);
        
        // Cabeça
        this.ctx.fillStyle = '#32cd32';
        this.ctx.fillRect(this.frog.x + 8, this.frog.y, this.frog.width - 16, 20);
        
        // Olhos
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.frog.x + 12, this.frog.y + 8, 4, 0, Math.PI * 2);
        this.ctx.arc(this.frog.x + this.frog.width - 12, this.frog.y + 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.frog.x + 12, this.frog.y + 8, 2, 0, Math.PI * 2);
        this.ctx.arc(this.frog.x + this.frog.width - 12, this.frog.y + 8, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Pernas
        this.ctx.fillStyle = '#00ff00';
        if (this.frog.direction === 'up' || this.frog.direction === 'down') {
            // Pernas laterais
            this.ctx.fillRect(this.frog.x - 2, this.frog.y + 15, 8, 15);
            this.ctx.fillRect(this.frog.x + this.frog.width - 6, this.frog.y + 15, 8, 15);
        } else {
            // Pernas para frente/trás
            this.ctx.fillRect(this.frog.x + 10, this.frog.y + this.frog.height - 5, 20, 8);
        }
    }
    
    renderParticles() {
        for (let particle of this.particles) {
            this.ctx.globalAlpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color;
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    updateHUD() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
        
        const timeLevel = document.getElementById('timeLevel');
        const timePercentage = (this.timeLeft / this.maxTime) * 100;
        timeLevel.style.width = Math.max(0, timePercentage) + '%';
        
        // Mudança de cor da barra de tempo
        if (timePercentage > 50) {
            timeLevel.style.background = 'linear-gradient(90deg, #ffff00, #00ff00)';
        } else if (timePercentage > 20) {
            timeLevel.style.background = 'linear-gradient(90deg, #ff6600, #ffff00)';
        } else {
            timeLevel.style.background = '#ff0000';
        }
    }
    
    updateFinalStats() {
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalLevel').textContent = this.level;
        document.getElementById('crossings').textContent = this.crossings;
        
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
            level: this.level,
            crossings: this.crossings,
            date: new Date().toLocaleDateString()
        });
        
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Manter apenas top 10
        
        localStorage.setItem('froggerScores', JSON.stringify(scores));
    }
    
    getHighScores() {
        return JSON.parse(localStorage.getItem('froggerScores')) || [];
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
    clearInterval(game.gameTimer);
}

function restartGame() {
    game.startGame();
}

function resumeGame() {
    game.resumeGame();
}

function nextLevel() {
    game.nextLevel();
}

function clearScores() {
    if (confirm('Tem certeza que deseja limpar todos os recordes?')) {
        localStorage.removeItem('froggerScores');
        displayHighScores();
    }
}

function displayHighScores() {
    const scoresList = document.getElementById('scoresList');
    const scores = JSON.parse(localStorage.getItem('froggerScores')) || [];
    
    if (scores.length === 0) {
        scoresList.innerHTML = '<p style="color: #cccccc; text-align: center;">Nenhum recorde ainda!</p>';
        return;
    }
    
    scoresList.innerHTML = scores.map((score, index) => `
        <div class="score-item">
            <span class="score-rank">${index + 1}º</span>
            <span>${score.score} pts</span>
            <span>Nível ${score.level}</span>
            <span>${score.crossings} travessias</span>
            <span>${score.date}</span>
        </div>
    `).join('');
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    game = new FroggerGame();
});
