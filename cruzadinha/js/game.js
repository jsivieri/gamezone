// Jogo de Cruzadinha - KMIKZ GameZone
class CrosswordGame {
    constructor() {
        this.currentCrossword = null;
        this.currentCategory = '';
        this.gameTimer = null;
        this.startTime = null;
        this.score = 0;
        this.hintsUsed = 0;
        this.selectedCell = null;
        this.gameState = 'menu'; // menu, playing, paused, completed
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.setupEventListeners();
        this.loadHighScores();
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;
        
        const colors = [
            'rgba(255, 182, 193, 0.7)',
            'rgba(173, 216, 230, 0.7)',
            'rgba(144, 238, 144, 0.7)',
            'rgba(255, 218, 185, 0.7)',
            'rgba(221, 160, 221, 0.7)'
        ];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 8 + 4;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = randomColor;
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
            
            particlesContainer.appendChild(particle);
        }
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.gameState === 'playing') {
                this.handleKeyPress(e);
            }
        });
    }
    
    handleKeyPress(e) {
        if (!this.selectedCell) return;
        
        const key = e.key.toUpperCase();
        
        if (key >= 'A' && key <= 'Z') {
            this.selectedCell.textContent = key;
            this.selectedCell.classList.add('filled');
            this.moveToNextCell();
            this.checkProgress();
        } else if (e.key === 'Backspace') {
            this.selectedCell.textContent = '';
            this.selectedCell.classList.remove('filled', 'correct', 'incorrect');
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                   e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            this.moveSelection(e.key);
        }
    }
    
    moveToNextCell() {
        const cells = Array.from(document.querySelectorAll('.crossword-cell:not(.black)'));
        const currentIndex = cells.indexOf(this.selectedCell);
        
        if (currentIndex < cells.length - 1) {
            this.selectCell(cells[currentIndex + 1]);
        }
    }
    
    moveSelection(direction) {
        const grid = document.getElementById('crosswordGrid');
        const cells = grid.children;
        const currentIndex = Array.from(cells).indexOf(this.selectedCell);
        const gridSize = 7;
        
        let newIndex = currentIndex;
        
        switch (direction) {
            case 'ArrowLeft':
                newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
                break;
            case 'ArrowRight':
                newIndex = currentIndex < cells.length - 1 ? currentIndex + 1 : currentIndex;
                break;
            case 'ArrowUp':
                newIndex = currentIndex >= gridSize ? currentIndex - gridSize : currentIndex;
                break;
            case 'ArrowDown':
                newIndex = currentIndex < cells.length - gridSize ? currentIndex + gridSize : currentIndex;
                break;
        }
        
        if (newIndex !== currentIndex && !cells[newIndex].classList.contains('black')) {
            this.selectCell(cells[newIndex]);
        }
    }
    
    selectCell(cell) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }
        
        this.selectedCell = cell;
        cell.classList.add('selected');
        cell.focus();
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showDifficultyScreen() {
        this.showScreen('difficultyScreen');
    }
    
    showCategoryScreen(difficulty) {
        if (difficulty !== 'facil') {
            alert('Modo Difícil em desenvolvimento! Em breve com IA e APIs.');
            return;
        }
        
        this.populateCategoryGrid();
        this.showScreen('categoryScreen');
    }
    
    populateCategoryGrid() {
        const grid = document.getElementById('categoryGrid');
        grid.innerHTML = '';
        
        availableCategories.forEach(categoryKey => {
            const category = crosswordData[categoryKey];
            const card = document.createElement('div');
            card.className = 'category-card';
            card.onclick = () => this.startGame(categoryKey);
            
            card.innerHTML = `
                <span class="category-icon">${category.icon}</span>
                <h3>${category.name}</h3>
                <p>${category.description}</p>
            `;
            
            grid.appendChild(card);
        });
    }
    
    startGame(categoryKey) {
        this.currentCategory = categoryKey;
        this.currentCrossword = crosswordData[categoryKey];
        this.score = 0;
        this.hintsUsed = 0;
        this.startTime = Date.now();
        this.gameState = 'playing';
        
        this.setupGame();
        this.startTimer();
        this.showScreen('gameScreen');
    }
    
    setupGame() {
        // Atualizar informações do cabeçalho
        document.getElementById('currentCategory').textContent = `Categoria: ${this.currentCrossword.name}`;
        document.getElementById('gameScore').textContent = `🏆 ${this.score} pts`;
        
        // Criar grade
        this.createGrid();
        
        // Criar dicas
        this.createClues();
    }
    
    createGrid() {
        const grid = document.getElementById('crosswordGrid');
        grid.innerHTML = '';
        
        const crosswordGrid = this.currentCrossword.grid;
        
        for (let row = 0; row < 7; row++) {
            for (let col = 0; col < 7; col++) {
                const cell = document.createElement('div');
                cell.className = 'crossword-cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (!crosswordGrid[row] || !crosswordGrid[row][col]) {
                    cell.classList.add('black');
                } else {
                    cell.classList.add('empty');
                    cell.addEventListener('click', () => this.selectCell(cell));
                    
                    // Adicionar números para início de palavras
                    const wordNumber = this.getWordNumber(row, col);
                    if (wordNumber) {
                        cell.classList.add('number');
                        cell.dataset.number = wordNumber;
                    }
                }
                
                grid.appendChild(cell);
            }
        }
    }
    
    getWordNumber(row, col) {
        for (let word of this.currentCrossword.words) {
            if (word.startRow === row && word.startCol === col) {
                return word.number;
            }
        }
        return null;
    }
    
    createClues() {
        const horizontalClues = document.getElementById('horizontalClues');
        const verticalClues = document.getElementById('verticalClues');
        
        horizontalClues.innerHTML = '';
        verticalClues.innerHTML = '';
        
        this.currentCrossword.words.forEach(word => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue-item';
            clueElement.innerHTML = `<strong>${word.number}.</strong> ${word.clue}`;
            clueElement.addEventListener('click', () => this.highlightWord(word));
            
            if (word.direction === 'across') {
                horizontalClues.appendChild(clueElement);
            } else {
                verticalClues.appendChild(clueElement);
            }
        });
    }
    
    highlightWord(word) {
        // Remover destaque anterior
        document.querySelectorAll('.crossword-cell.highlighted').forEach(cell => {
            cell.classList.remove('highlighted');
        });
        
        // Destacar palavra atual
        const cells = this.getWordCells(word);
        cells.forEach(cell => {
            cell.classList.add('highlighted');
        });
        
        // Selecionar primeira célula da palavra
        if (cells.length > 0) {
            this.selectCell(cells[0]);
        }
    }
    
    getWordCells(word) {
        const cells = [];
        const grid = document.getElementById('crosswordGrid');
        
        for (let i = 0; i < word.word.length; i++) {
            let row = word.startRow;
            let col = word.startCol;
            
            if (word.direction === 'across') {
                col += i;
            } else {
                row += i;
            }
            
            const cellIndex = row * 7 + col;
            if (grid.children[cellIndex]) {
                cells.push(grid.children[cellIndex]);
            }
        }
        
        return cells;
    }
    
    startTimer() {
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            
            document.getElementById('gameTimer').textContent = 
                `⏱️ ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameTimer);
            this.showScreen('pauseScreen');
        }
    }
    
    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            this.showScreen('gameScreen');
        }
    }
    
    restartGame() {
        this.startGame(this.currentCategory);
    }
    
    giveHint() {
        if (!this.selectedCell || this.selectedCell.classList.contains('black')) {
            alert('Selecione uma célula válida primeiro!');
            return;
        }
        
        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        const correctLetter = this.currentCrossword.grid[row][col];
        
        if (correctLetter) {
            this.selectedCell.textContent = correctLetter;
            this.selectedCell.classList.add('filled');
            this.hintsUsed++;
            this.score = Math.max(0, this.score - 10); // Penalidade por dica
            this.updateScore();
            
            this.checkProgress();
        }
    }
    
    checkAnswers() {
        let correctWords = 0;
        
        this.currentCrossword.words.forEach(word => {
            const cells = this.getWordCells(word);
            const userWord = cells.map(cell => cell.textContent).join('');
            
            if (userWord === word.word) {
                correctWords++;
                cells.forEach(cell => {
                    cell.classList.add('correct');
                    cell.classList.remove('incorrect');
                });
                
                // Marcar dica como completa
                const clueElements = document.querySelectorAll('.clue-item');
                clueElements.forEach(clueEl => {
                    if (clueEl.textContent.includes(`${word.number}.`)) {
                        clueEl.classList.add('completed');
                    }
                });
            } else if (userWord.length === word.word.length) {
                cells.forEach(cell => {
                    if (cell.textContent) {
                        cell.classList.add('incorrect');
                        cell.classList.remove('correct');
                    }
                });
            }
        });
        
        if (correctWords === this.currentCrossword.words.length) {
            this.completeGame();
        }
    }
    
    checkProgress() {
        // Verificação automática quando células são preenchidas
        setTimeout(() => {
            this.checkAnswers();
        }, 100);
    }
    
    completeGame() {
        this.gameState = 'completed';
        clearInterval(this.gameTimer);
        
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const timeBonus = Math.max(0, 300 - timeElapsed); // Bônus por velocidade
        const hintPenalty = this.hintsUsed * 10;
        
        this.score = 1000 + timeBonus - hintPenalty;
        
        this.saveScore();
        this.showVictoryScreen(timeElapsed);
    }
    
    showVictoryScreen(timeElapsed) {
        const minutes = Math.floor(timeElapsed / 60);
        const seconds = timeElapsed % 60;
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalTime').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('finalCategory').textContent = this.currentCrossword.name;
        
        this.showScreen('victoryScreen');
    }
    
    updateScore() {
        document.getElementById('gameScore').textContent = `🏆 ${this.score} pts`;
    }
    
    clearGrid() {
        if (confirm('Tem certeza que deseja limpar toda a grade?')) {
            document.querySelectorAll('.crossword-cell:not(.black)').forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('filled', 'correct', 'incorrect');
            });
            
            document.querySelectorAll('.clue-item').forEach(clue => {
                clue.classList.remove('completed');
            });
        }
    }
    
    saveScore() {
        const scores = this.getHighScores();
        scores.push({
            score: this.score,
            category: this.currentCrossword.name,
            hintsUsed: this.hintsUsed,
            time: Math.floor((Date.now() - this.startTime) / 1000),
            date: new Date().toLocaleDateString()
        });
        
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Manter apenas top 10
        
        localStorage.setItem('crosswordScores', JSON.stringify(scores));
    }
    
    getHighScores() {
        return JSON.parse(localStorage.getItem('crosswordScores')) || [];
    }
    
    loadHighScores() {
        this.displayHighScores();
    }
    
    displayHighScores() {
        const scoresList = document.getElementById('scoresList');
        const scores = this.getHighScores();
        
        if (scores.length === 0) {
            scoresList.innerHTML = '<p style="color: rgba(255,255,255,0.7); text-align: center;">Nenhum recorde ainda!</p>';
            return;
        }
        
        scoresList.innerHTML = scores.map((score, index) => `
            <div class="score-item">
                <span class="score-rank">${index + 1}º</span>
                <span>${score.category}</span>
                <span>${score.score} pts</span>
                <span>${Math.floor(score.time / 60)}:${(score.time % 60).toString().padStart(2, '0')}</span>
            </div>
        `).join('');
    }
    
    clearScores() {
        if (confirm('Tem certeza que deseja limpar todos os recordes?')) {
            localStorage.removeItem('crosswordScores');
            this.displayHighScores();
        }
    }
    
    showInstructions() {
        this.showScreen('instructionsScreen');
    }
    
    showScores() {
        this.displayHighScores();
        this.showScreen('scoresScreen');
    }
    
    backToMain() {
        window.location.href = '../index.html';
    }
}

// Instância global do jogo
let game;

// Funções globais para os botões
function showDifficultyScreen() {
    game.showDifficultyScreen();
}

function showCategoryScreen(difficulty) {
    game.showCategoryScreen(difficulty);
}

function showScreen(screenId) {
    game.showScreen(screenId);
}

function pauseGame() {
    game.pauseGame();
}

function resumeGame() {
    game.resumeGame();
}

function restartGame() {
    game.restartGame();
}

function giveHint() {
    game.giveHint();
}

function checkAnswers() {
    game.checkAnswers();
}

function clearGrid() {
    game.clearGrid();
}

function showInstructions() {
    game.showInstructions();
}

function showScores() {
    game.showScores();
}

function clearScores() {
    game.clearScores();
}

function backToMain() {
    game.backToMain();
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    game = new CrosswordGame();
});
