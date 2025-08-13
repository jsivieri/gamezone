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
        this.logSpawnRate = 0.08; // Aumentada para compensar a remoção das tartarugas
        this.gameTimer = null;
        
        // Controle de dificuldade dos troncos
        this.currentLogWidth = 180; // Tamanho inicial dos troncos
        
        // Quadradinhos de chegada (como no Frogger original)
        this.goalSlots = [
            { x: 120, y: 30, width: 80, height: 60, occupied: false },
            { x: 280, y: 30, width: 80, height: 60, occupied: false },
            { x: 440, y: 30, width: 80, height: 60, occupied: false },
            { x: 600, y: 30, width: 80, height: 60, occupied: false }
        ];
        this.completedSlots = 0;
        
        // Elementos de áudio
        this.jumpSound = null;
        this.backgroundSound = null;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.setupEventListeners();
        this.showScreen('menuScreen');
        this.gameLoop();
    }
    
    setupAudio() {
        // Configurar áudios
        this.jumpSound = document.getElementById('jumpSound');
        this.backgroundSound = document.getElementById('backgroundSound');
        
        // Configurar volume
        if (this.jumpSound) {
            this.jumpSound.volume = 0.6; // Volume do pulo mais baixo
        }
        if (this.backgroundSound) {
            this.backgroundSound.volume = 0.3; // Volume de fundo baixo
        }
    }
    
    // Controle de volume dos áudios
    setAudioVolume(jumpVol = 0.6, backgroundVol = 0.3) {
        if (this.jumpSound) {
            this.jumpSound.volume = jumpVol;
        }
        if (this.backgroundSound) {
            this.backgroundSound.volume = backgroundVol;
        }
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
        
        // Tocar som de pulo
        if (this.jumpSound) {
            this.jumpSound.currentTime = 0; // Reiniciar o áudio
            this.jumpSound.play().catch(() => {
                console.log('Não foi possível reproduzir o som de pulo');
            });
        }
        
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
        
        // Iniciar música de fundo
        if (this.backgroundSound) {
            this.backgroundSound.currentTime = 0;
            this.backgroundSound.play().catch(() => {
                console.log('Não foi possível reproduzir o áudio de fundo');
            });
        }
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.timeLeft = this.maxTime;
        this.crossings = 0;
        
        // Resetar tamanho dos troncos para o padrão
        this.currentLogWidth = 180;
        
        // Resetar slots de chegada
        this.goalSlots.forEach(slot => slot.occupied = false);
        this.completedSlots = 0;
        
        this.frog.x = this.gameWidth / 2 - 20;
        this.frog.y = this.frog.startY;
        this.frog.isMoving = false;
        
        this.cars = [];
        this.logs = [];
        this.particles = [];
        
        // Spawn troncos iniciais para garantir que existam
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
            
            // Pausar música de fundo
            if (this.backgroundSound) {
                this.backgroundSound.pause();
            }
            
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            
            // Retomar música de fundo
            if (this.backgroundSound) {
                this.backgroundSound.play().catch(() => {
                    console.log('Não foi possível retomar o áudio de fundo');
                });
            }
            
            this.showScreen('gameScreen');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameTimer);
        
        // Parar música de fundo
        if (this.backgroundSound) {
            this.backgroundSound.pause();
        }
        
        this.saveScore();
        this.updateFinalStats();
        this.showScreen('gameOverScreen');
    }
    
    checkGoal() {
        // Verificar se chegou à zona de meta
        if (this.frog.y <= 90) {
            // Verificar qual slot o sapinho está tentando ocupar
            const frogCenter = { x: this.frog.x + this.frog.width / 2, y: this.frog.y + this.frog.height / 2 };
            
            for (let i = 0; i < this.goalSlots.length; i++) {
                const slot = this.goalSlots[i];
                
                // Verificar se o sapinho está dentro do slot
                if (frogCenter.x >= slot.x && frogCenter.x <= slot.x + slot.width &&
                    frogCenter.y >= slot.y && frogCenter.y <= slot.y + slot.height) {
                    
                    if (!slot.occupied) {
                        // Slot livre - sapinho conseguiu!
                        slot.occupied = true;
                        this.completedSlots++;
                        this.score += 500; // Bonus por slot completado
                        
                        // Verificar se completou todos os slots
                        if (this.completedSlots === 4) {
                            this.levelComplete();
                        } else {
                            // Resetar sapinho para nova tentativa
                            this.resetFrogPosition();
                            this.score += 200; // Bonus adicional por slot
                        }
                        return;
                    } else {
                        // Slot já ocupado - sapinho morre
                        this.loseLife();
                        return;
                    }
                }
            }
            
            // Se chegou na área de meta mas não em nenhum slot específico, morre
            this.loseLife();
        }
    }
    
    resetFrogPosition() {
        this.frog.x = this.gameWidth / 2 - 20;
        this.frog.y = this.frog.startY;
        this.frog.isMoving = false;
        this.timeLeft = this.maxTime; // Resetar tempo
    }
    
    levelComplete() {
        this.gameState = 'levelComplete';
        this.crossings++;
        
        // Pontuação bonus
        const timeBonus = this.timeLeft * 10;
        const levelBonus = this.level * 100;
        const slotsBonus = this.completedSlots * 200; // Bonus pelos slots completados
        this.score += 1000 + timeBonus + levelBonus + slotsBonus;
        
        // Atualizar estatísticas da tela
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('bonusPoints').textContent = 1000 + timeBonus + levelBonus + slotsBonus;
        document.getElementById('timeBonus').textContent = this.timeLeft + 's';
        
        // Resetar slots para o próximo nível
        this.goalSlots.forEach(slot => slot.occupied = false);
        this.completedSlots = 0;
        
        this.showScreen('levelCompleteScreen');
    }
    
    nextLevel() {
        this.level++;
        this.timeLeft = this.maxTime;
        
        // Aumentar dificuldade progressivamente
        this.lanes.forEach(lane => {
            if (lane.speed) {
                // Carros ficam mais rápidos a cada nível
                lane.speed += 0.2 + (this.level * 0.1); // Aumenta mais conforme o nível
            }
        });
        
        // Calcular novo tamanho dos troncos (diminui gradualmente)
        const baseLogWidth = 180; // Tamanho inicial
        const minLogWidth = 100;  // Tamanho mínimo
        const widthReduction = Math.min(this.level * 8, 80); // Reduz 8px por nível, máximo 80px
        this.currentLogWidth = Math.max(baseLogWidth - widthReduction, minLogWidth);
        
        console.log(`Nível ${this.level}: Troncos agora têm ${this.currentLogWidth}px de largura`);
        
        // Não resetar os slots - jogador mantém progresso do nível anterior
        // this.goalSlots.forEach(slot => slot.occupied = false);
        // this.completedSlots = 0;
        
        // Resetar posição do sapinho
        this.resetFrogPosition();
        
        // Limpar objetos
        this.cars = [];
        this.logs = [];
        
        // Respawnar objetos aquáticos iniciais com novo tamanho
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
        this.resetFrogPosition();
        
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
        this.updateParticles();
        this.checkCollisions();
        this.updateHUD();
    }
    
    spawnObjects() {
        // Spawn carros
        if (Math.random() < this.carSpawnRate + (this.level * 0.002)) {
            this.spawnCar();
        }
        
        // Spawn troncos (aumentada a frequência)
        if (Math.random() < this.logSpawnRate + (this.level * 0.002)) {
            this.spawnLog();
        }
    }
    
    // Função para spawnar objetos aquáticos iniciais
    spawnInitialWaterObjects() {
        const waterLanes = this.lanes.filter(lane => lane.type === 'water');
        
        // Garantir cobertura total - spawn determinístico de troncos
        waterLanes.forEach((lane, laneIndex) => {
            // Para cada faixa, criar mais troncos em posições estratégicas
            const trunkPositions = [50, 200, 350, 500, 650]; // Mais troncos e melhor distribuição
            
            trunkPositions.forEach((basePos, i) => {
                const log = {
                    x: lane.direction > 0 ? basePos : this.gameWidth - basePos,
                    y: lane.y - 15, // Ajustado de -20 para -15 para melhor alinhamento
                    width: this.currentLogWidth, // Usa o tamanho dinâmico dos troncos
                    height: 30,
                    speed: lane.speed * lane.direction,
                    color: '#8b4513',
                    type: 'log'
                };
                this.logs.push(log);
            });
        });
        
        console.log(`Spawned ${this.logs.length} logs with ${this.currentLogWidth}px width`);
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
            x: lane.direction > 0 ? -this.currentLogWidth : this.gameWidth + 20,
            y: lane.y - 15, // Ajustado de -20 para -15 para melhor alinhamento
            width: this.currentLogWidth, // Usa o tamanho dinâmico dos troncos
            height: 30,
            speed: lane.speed * lane.direction,
            color: '#8b4513',
            type: 'log'
        };
        
        this.logs.push(log);
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
            if (log.x < -(this.currentLogWidth + 50) || log.x > this.gameWidth + this.currentLogWidth + 50) {
                this.logs.splice(i, 1);
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
            // Na água, verificar se está em cima de tronco
            let onSafeObject = false;
            
            for (let log of this.logs) {
                if (this.isOnLog(log)) {
                    onSafeObject = true;
                    break;
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
            if (Math.abs(this.frog.y + this.frog.height / 2 - lane.y) < 40) { // Aumentado de 30 para 40
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
        
        // Verificação mais tolerante para X e Y
        const isOnX = frogCenter.x >= (log.x - 10) && frogCenter.x <= (log.x + log.width + 10);
        const isOnY = Math.abs(frogCenter.y - (log.y + log.height / 2)) < 35; // Aumentado de 25 para 35
        
        return isOnX && isOnY;
    }
    
    renderGoalSlots() {
        this.goalSlots.forEach((slot, index) => {
            if (slot.occupied) {
                // Slot ocupado - mostrar sapinho
                this.ctx.fillStyle = '#00ff00';
                this.ctx.fillRect(slot.x + 15, slot.y + 10, 50, 40);
                
                // Cabeça do sapinho no slot
                this.ctx.fillStyle = '#32cd32';
                this.ctx.fillRect(slot.x + 20, slot.y + 5, 40, 25);
                
                // Olhos
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(slot.x + 28, slot.y + 15, 3, 0, Math.PI * 2);
                this.ctx.arc(slot.x + 52, slot.y + 15, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(slot.x + 28, slot.y + 15, 1.5, 0, Math.PI * 2);
                this.ctx.arc(slot.x + 52, slot.y + 15, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
                
            } else {
                // Slot vazio - mostrar casa/buraco
                this.ctx.fillStyle = '#8b4513'; // Marrom escuro
                this.ctx.fillRect(slot.x + 5, slot.y + 5, slot.width - 10, slot.height - 10);
                
                // Interior do slot (mais escuro)
                this.ctx.fillStyle = '#654321';
                this.ctx.fillRect(slot.x + 10, slot.y + 10, slot.width - 20, slot.height - 20);
                
                // Número do slot
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '14px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText((index + 1).toString(), slot.x + slot.width / 2, slot.y + slot.height / 2 + 5);
            }
            
            // Borda do slot
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(slot.x, slot.y, slot.width, slot.height);
        });
    }
    
    render() {
        // Limpar canvas
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);
        
        if (this.gameState === 'playing') {
            this.renderLanes();
            this.renderGoalSlots();
            this.renderCars();
            this.renderLogs();
            this.renderFrog();
            this.renderParticles();
            // this.renderDifficultyInfo(); // Comentado para remover da tela
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
        
        // Zona de chegada
        this.ctx.fillStyle = '#228b22'; // Verde mais escuro para a base
        this.ctx.fillRect(0, 30, this.gameWidth, 60);
        
        // Título da zona de chegada
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('� CHEGADA �', this.gameWidth / 2, 25);
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
            
            // Textura do tronco melhorada
            this.ctx.strokeStyle = '#654321';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 4; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(log.x, log.y + (i + 1) * log.height / 5);
                this.ctx.lineTo(log.x + log.width, log.y + (i + 1) * log.height / 5);
                this.ctx.stroke();
            }
            
            // Círculos nas extremidades para mostrar que é um tronco
            this.ctx.fillStyle = '#654321';
            this.ctx.beginPath();
            this.ctx.arc(log.x, log.y + log.height/2, log.height/2, 0, Math.PI * 2);
            this.ctx.arc(log.x + log.width, log.y + log.height/2, log.height/2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Detalhes dos anéis do tronco
            this.ctx.strokeStyle = '#8b4513';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(log.x, log.y + log.height/2, log.height/3, 0, Math.PI * 2);
            this.ctx.arc(log.x + log.width, log.y + log.height/2, log.height/3, 0, Math.PI * 2);
            this.ctx.stroke();
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
    
    renderDifficultyInfo() {
        // Mostrar informações de dificuldade no canto superior direito
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.gameWidth - 220, 10, 210, 110);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        this.ctx.textAlign = 'left';
        
        this.ctx.fillText(`Nível: ${this.level}`, this.gameWidth - 210, 30);
        this.ctx.fillText(`Slots: ${this.completedSlots}/4`, this.gameWidth - 210, 50);
        this.ctx.fillText(`Tamanho Troncos: ${this.currentLogWidth}px`, this.gameWidth - 210, 70);
        
        // Calcular velocidade média dos carros
        const roadLanes = this.lanes.filter(lane => lane.type === 'road');
        const avgSpeed = roadLanes.length > 0 ? 
            (roadLanes.reduce((sum, lane) => sum + Math.abs(lane.speed), 0) / roadLanes.length).toFixed(1) : 
            '0.0';
        
        this.ctx.fillText(`Vel. Carros: ${avgSpeed}x`, this.gameWidth - 210, 90);
        this.ctx.fillText(`Dificuldade: ${this.getDifficultyLevel()}`, this.gameWidth - 210, 110);
    }
    
    getDifficultyLevel() {
        if (this.level <= 2) return 'Fácil';
        if (this.level <= 5) return 'Normal';
        if (this.level <= 8) return 'Difícil';
        if (this.level <= 12) return 'Muito Difícil';
        return 'Extremo';
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
    
    // Parar música de fundo
    if (game.backgroundSound) {
        game.backgroundSound.pause();
    }
    
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
