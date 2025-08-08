// Jogo de Damas - Lógica Completa com IA
class CheckersGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.captureSequence = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.isGameOver = false;
        this.mandatoryCapture = null;
        this.isVsComputer = false;
        this.aiDifficulty = 'easy'; // easy, medium, hard
        this.isAiThinking = false;
        this.moveTimeout = null;
        this.moveTimeLimit = 30; // 30 segundos para cada jogada
        this.currentMoveStartTime = null;
        
        this.sounds = {
            move: this.createSound('move'),
            capture: this.createSound('capture'),
            king: this.createSound('king'),
            gameOver: this.createSound('gameOver')
        };
        
        this.init();
    }
    
    init() {
        this.setupBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.startGameTimer();
        this.updateGameStatus();
        // Removido temporariamente: this.startMoveTimer(); // Timer removido para debug
    }
    
    // Criar sons sintéticos (já que não temos arquivos de som)
    createSound(type) {
        return {
            play: () => {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                switch(type) {
                    case 'move':
                        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.1);
                        break;
                    case 'capture':
                        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                        break;
                    case 'king':
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.5);
                        break;
                    case 'gameOver':
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.8);
                        break;
                }
            }
        };
    }
    
    setupBoard() {
        // Inicializar tabuleiro 8x8
        this.board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Colocar peças pretas (computador/jogador 2) nas 3 primeiras fileiras (topo)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) { // Apenas casas escuras
                    this.board[row][col] = { player: 'black', isKing: false };
                }
            }
        }
        
        // Colocar peças vermelhas (usuário/jogador 1) nas 3 últimas fileiras (baixo)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) { // Apenas casas escuras
                    this.board[row][col] = { player: 'red', isKing: false };
                }
            }
        }
    }
    
    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `board-cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.player}${piece.isKing ? ' king' : ''}`;
                    pieceElement.dataset.row = row;
                    pieceElement.dataset.col = col;
                    cell.appendChild(pieceElement);
                }
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        // Eventos do tabuleiro
        document.getElementById('gameBoard').addEventListener('click', (e) => {
            if (this.isGameOver) return;
            
            const cell = e.target.closest('.board-cell');
            const piece = e.target.closest('.piece');
            
            if (piece) {
                this.handlePieceClick(parseInt(piece.dataset.row), parseInt(piece.dataset.col));
            } else if (cell) {
                this.handleCellClick(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
            }
        });
        
        // Botões de controle
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('vsComputerBtn').addEventListener('click', () => this.startVsComputerGame());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRulesModal());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('difficultyBtn').addEventListener('click', () => this.cycleDifficulty());
        document.getElementById('surrenderBtn').addEventListener('click', () => this.surrender());
        
        // Modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.closeModals();
            // Manter o modo atual (vs computador ou 2 jogadores)
            if (this.isVsComputer) {
                this.startVsComputerGame();
            } else {
                this.newGame();
            }
        });
        
        document.getElementById('backHomeBtn').addEventListener('click', () => {
            window.open('../index.html', '_blank');
        });
        
        // Fechar modal clicando fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });
        
        // Atalhos do teclado
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'n':
                case 'N':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.newGame();
                    }
                    break;
                case 'z':
                case 'Z':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.undoMove();
                    }
                    break;
                case 'h':
                case 'H':
                    if (!e.ctrlKey) {
                        this.showHint();
                    }
                    break;
                case 'Escape':
                    this.closeModals();
                    this.clearSelection();
                    break;
            }
        });
    }
    
    handlePieceClick(row, col) {
        const piece = this.board[row][col];
        
        // Verificar se é a vez do jogador correto
        if (piece.player !== this.currentPlayer) {
            this.showMessage(`É a vez do ${this.getPlayerName(this.currentPlayer)}!`);
            return;
        }
        
        // Se estiver jogando contra IA e for a vez da IA, não permitir cliques
        if (this.isVsComputer && this.currentPlayer === 'black') {
            this.showMessage('Aguarde a jogada do computador...');
            return;
        }
        
        // Verificar se há captura obrigatória
        if (this.mandatoryCapture && (this.mandatoryCapture.row !== row || this.mandatoryCapture.col !== col)) {
            this.showMessage('Você deve continuar capturando com a peça selecionada!');
            return;
        }
        
        this.selectPiece(row, col);
    }
    
    handleCellClick(row, col) {
        if (!this.selectedPiece) return;
        
        const moveIndex = this.possibleMoves.findIndex(move => 
            move.toRow === row && move.toCol === col
        );
        
        if (moveIndex !== -1) {
            this.makeMove(this.possibleMoves[moveIndex]);
        }
    }
    
    selectPiece(row, col) {
        // Limpar seleção anterior
        this.clearSelection();
        
        this.selectedPiece = { row, col };
        this.possibleMoves = this.getPossibleMoves(row, col);
        
        // Destacar peça selecionada
        const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cellElement.classList.contains('board-cell')) {
            cellElement.classList.add('selected');
        }
        
        // Destacar movimentos possíveis
        this.possibleMoves.forEach(move => {
            const targetCell = document.querySelector(
                `.board-cell[data-row="${move.toRow}"][data-col="${move.toCol}"]`
            );
            if (targetCell) {
                if (move.captures && move.captures.length > 0) {
                    targetCell.classList.add('capture-move');
                } else {
                    targetCell.classList.add('possible-move');
                }
            }
        });
        
        if (this.possibleMoves.length === 0) {
            this.showMessage('Esta peça não tem movimentos válidos!');
        } else {
            const captureCount = this.possibleMoves.filter(move => move.captures && move.captures.length > 0).length;
            if (captureCount > 0) {
                this.showMessage(`${captureCount} captura(s) disponível(is)!`);
            } else {
                this.showMessage('Selecione onde mover a peça.');
            }
        }
    }
    
    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const directions = this.getMoveDirections(piece);
        
        // Verificar se há capturas obrigatórias primeiro
        const captures = this.getAllCaptures(piece.player);
        if (captures.length > 0) {
            // Se há capturas disponíveis, apenas elas são válidas
            return captures.filter(move => move.fromRow === row && move.fromCol === col);
        }
        
        // Movimentos normais (sem captura)
        directions.forEach(dir => {
            const newRow = row + dir.row;
            const newCol = col + dir.col;
            
            if (this.isValidPosition(newRow, newCol) && !this.board[newRow][newCol]) {
                moves.push({
                    fromRow: row,
                    fromCol: col,
                    toRow: newRow,
                    toCol: newCol,
                    captures: []
                });
            }
        });
        
        // Capturas (mesmo quando não obrigatórias, mostrar como opção)
        const pieceCapttures = this.getCaptureMoves(row, col);
        moves.push(...pieceCapttures);
        
        return moves;
    }
    
    getMoveDirections(piece) {
        const directions = [];
        
        // Peças vermelhas (usuário) se movem para cima (direção negativa)
        if (piece.player === 'red' || piece.isKing) {
            directions.push({ row: -1, col: -1 }, { row: -1, col: 1 }); // Para cima
        }
        
        // Peças pretas (computador) se movem para baixo (direção positiva)  
        if (piece.player === 'black' || piece.isKing) {
            directions.push({ row: 1, col: -1 }, { row: 1, col: 1 }); // Para baixo
        }
        
        return directions;
    }
    
    getCaptureMoves(row, col, capturedPositions = []) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        const captures = [];
        const directions = this.getMoveDirections(piece);
        
        directions.forEach(dir => {
            const jumpRow = row + dir.row;
            const jumpCol = col + dir.col;
            const landRow = row + (dir.row * 2);
            const landCol = col + (dir.col * 2);
            
            // Verificar se a posição de salto tem uma peça inimiga
            if (this.isValidPosition(jumpRow, jumpCol) && 
                this.isValidPosition(landRow, landCol) &&
                this.board[jumpRow][jumpCol] &&
                this.board[jumpRow][jumpCol].player !== piece.player &&
                !this.board[landRow][landCol] &&
                !capturedPositions.some(pos => pos.row === jumpRow && pos.col === jumpCol)) {
                
                const newCapturedPositions = [...capturedPositions, { row: jumpRow, col: jumpCol }];
                
                // Movimento básico de captura
                const basicCapture = {
                    fromRow: row,
                    fromCol: col,
                    toRow: landRow,
                    toCol: landCol,
                    captures: newCapturedPositions
                };
                
                // Simular o movimento para verificar capturas múltiplas
                const tempBoard = this.simulateMove(basicCapture);
                const additionalCaptures = this.getCaptureMoves(landRow, landCol, newCapturedPositions);
                
                if (additionalCaptures.length > 0) {
                    // Há capturas múltiplas possíveis
                    additionalCaptures.forEach(additionalCapture => {
                        captures.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: additionalCapture.toRow,
                            toCol: additionalCapture.toCol,
                            captures: [...newCapturedPositions, ...additionalCapture.captures.slice(newCapturedPositions.length)]
                        });
                    });
                } else {
                    // Apenas uma captura
                    captures.push(basicCapture);
                }
            }
        });
        
        return captures;
    }
    
    getAllCaptures(player) {
        const allCaptures = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === player) {
                    const captures = this.getCaptureMoves(row, col);
                    allCaptures.push(...captures);
                }
            }
        }
        
        return allCaptures;
    }
    
    simulateMove(move) {
        const tempBoard = this.board.map(row => row.map(cell => cell ? {...cell} : null));
        
        // Mover peça
        tempBoard[move.toRow][move.toCol] = tempBoard[move.fromRow][move.fromCol];
        tempBoard[move.fromRow][move.fromCol] = null;
        
        // Remover peças capturadas
        if (move.captures) {
            move.captures.forEach(capture => {
                tempBoard[capture.row][capture.col] = null;
            });
        }
        
        return tempBoard;
    }
    
    makeMove(move) {
        // Salvar estado para desfazer
        this.gameHistory.push({
            board: this.board.map(row => row.map(cell => cell ? {...cell} : null)),
            currentPlayer: this.currentPlayer,
            moveCount: this.moveCount,
            captureCount: this.captureCount
        });
        
        const piece = this.board[move.fromRow][move.fromCol];
        const wasKing = piece.isKing;
        
        // Mover peça
        this.board[move.toRow][move.toCol] = piece;
        this.board[move.fromRow][move.fromCol] = null;
        
        // Processar capturas
        let capturedPieces = 0;
        if (move.captures && move.captures.length > 0) {
            move.captures.forEach(capture => {
                const capturedPiece = this.board[capture.row][capture.col];
                if (capturedPiece) {
                    this.board[capture.row][capture.col] = null;
                    capturedPieces++;
                    
                    // Animar captura
                    const capturedElement = document.querySelector(
                        `.piece[data-row="${capture.row}"][data-col="${capture.col}"]`
                    );
                    if (capturedElement) {
                        capturedElement.classList.add('piece-capturing');
                    }
                }
            });
            
            this.captureCount += capturedPieces;
            this.sounds.capture.play();
        } else {
            this.sounds.move.play();
        }
        
        // Verificar promoção a rei/dama
        const shouldPromote = (piece.player === 'red' && move.toRow === 0) || 
                             (piece.player === 'black' && move.toRow === 7);
        
        if (shouldPromote && !piece.isKing) {
            piece.isKing = true;
            this.sounds.king.play();
            
            // Animar promoção
            setTimeout(() => {
                const promotedElement = document.querySelector(
                    `.piece[data-row="${move.toRow}"][data-col="${move.toCol}"]`
                );
                if (promotedElement) {
                    promotedElement.classList.add('piece-promoting');
                }
            }, 100);
        }
        
        // Atualizar contadores
        this.moveCount++;
        
        // Adicionar ao histórico de jogadas
        this.addMoveToHistory(move, capturedPieces, shouldPromote && !wasKing);
        
        // Verificar se há capturas múltiplas obrigatórias
        const additionalCaptures = this.getCaptureMoves(move.toRow, move.toCol);
        if (additionalCaptures.length > 0 && move.captures && move.captures.length > 0) {
            // Captura múltipla obrigatória - mesmo jogador continua
            this.mandatoryCapture = { row: move.toRow, col: move.toCol };
            this.clearSelection();
            this.selectPiece(move.toRow, move.toCol);
            this.showMessage('Captura múltipla! Continue capturando com a mesma peça.');
        } else {
            // Mudar turno
            this.mandatoryCapture = null;
            this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
            
            // Parar timer da jogada anterior
            this.stopMoveTimer();
            
            // Se está jogando contra IA e agora é a vez da IA
            if (this.isVsComputer && this.currentPlayer === 'black') {
                setTimeout(() => this.makeAIMove(), 1000);
            } else {
                // Timer desabilitado temporariamente para debug
                // if (!this.isVsComputer || this.currentPlayer === 'red') {
                //     this.startMoveTimer();
                // }
            }
        }
        
        // Atualizar interface
        setTimeout(() => {
            this.renderBoard();
            this.clearSelection();
            this.updateGameStatus();
            this.checkGameOver();
        }, 300);
    }
    
    // ============= SISTEMA DE TIMEOUT =============
    
    startMoveTimer() {
        this.stopMoveTimer(); // Garantir que não há timer rodando
        
        if (this.isGameOver) return;
        
        // Mostrar timer apenas para jogadores humanos
        const isHumanPlayer = !this.isVsComputer || this.currentPlayer === 'red';
        if (!isHumanPlayer) return;
        
        this.currentMoveStartTime = Date.now();
        document.getElementById('moveTimerContainer').style.display = 'block';
        
        // Atualizar display do timer a cada segundo
        this.moveTimeout = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.currentMoveStartTime) / 1000);
            const remaining = Math.max(0, this.moveTimeLimit - elapsed);
            
            const timerElement = document.getElementById('moveTimer');
            timerElement.textContent = remaining + 's';
            
            // Aplicar classes de aviso
            timerElement.classList.remove('warning', 'critical');
            if (remaining <= 5) {
                timerElement.classList.add('critical');
            } else if (remaining <= 10) {
                timerElement.classList.add('warning');
            }
            
            // Se o tempo acabou
            if (remaining <= 0) {
                this.handleMoveTimeout();
            }
        }, 1000);
        
        // Timer de segurança para forçar timeout
        setTimeout(() => {
            if (this.moveTimeout) {
                this.handleMoveTimeout();
            }
        }, this.moveTimeLimit * 1000 + 100);
    }
    
    stopMoveTimer() {
        if (this.moveTimeout) {
            clearInterval(this.moveTimeout);
            this.moveTimeout = null;
        }
        document.getElementById('moveTimerContainer').style.display = 'none';
        this.currentMoveStartTime = null;
    }
    
    handleMoveTimeout() {
        this.stopMoveTimer();
        
        if (this.isGameOver) return;
        
        // Se há movimento obrigatório (captura múltipla), fazer automaticamente
        if (this.mandatoryCapture) {
            const moves = this.getPossibleMoves(this.mandatoryCapture.row, this.mandatoryCapture.col);
            if (moves.length > 0) {
                this.makeMove(moves[0]); // Fazer o primeiro movimento disponível
                this.showMessage('⏰ Tempo esgotado! Movimento automático realizado.');
                return;
            }
        }
        
        // Verificar se há algum movimento possível
        const allMoves = this.getAllValidMoves(this.currentPlayer);
        if (allMoves.length > 0) {
            // Fazer movimento aleatório
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            this.makeMove(randomMove);
            this.showMessage('⏰ Tempo esgotado! Movimento aleatório realizado.');
        } else {
            // Se não há movimentos, é fim de jogo
            this.checkGameOver();
        }
    }
    
    addMoveToHistory(move, capturedPieces, wasPromoted) {
        const fromNotation = this.getPositionNotation(move.fromRow, move.fromCol);
        const toNotation = this.getPositionNotation(move.toRow, move.toCol);
        
        let moveText = `${fromNotation} → ${toNotation}`;
        let moveType = 'Movimento';
        
        if (capturedPieces > 0) {
            moveType = capturedPieces === 1 ? 'Captura' : `${capturedPieces} Capturas`;
        }
        
        if (wasPromoted) {
            moveType += ' + Dama';
        }
        
        const moveItem = document.createElement('div');
        moveItem.className = `move-item ${this.currentPlayer}-move`;
        moveItem.innerHTML = `
            <span class="move-notation">${this.moveCount}. ${moveText}</span>
            <span class="move-type">${moveType}</span>
        `;
        
        const movesContainer = document.getElementById('movesContainer');
        const noMoves = movesContainer.querySelector('.no-moves');
        if (noMoves) noMoves.remove();
        
        movesContainer.appendChild(moveItem);
        movesContainer.scrollTop = movesContainer.scrollHeight;
    }
    
    getPositionNotation(row, col) {
        const letters = 'ABCDEFGH';
        return letters[col] + (row + 1); // Agora row 0 = linha 1, row 7 = linha 8
    }
    
    clearSelection() {
        document.querySelectorAll('.board-cell').forEach(cell => {
            cell.classList.remove('selected', 'possible-move', 'capture-move', 'highlighted');
        });
        this.selectedPiece = null;
        this.possibleMoves = [];
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    updateGameStatus() {
        // Atualizar informações dos jogadores
        const redPieces = this.countPieces('red');
        const blackPieces = this.countPieces('black');
        
        document.getElementById('redPieces').textContent = redPieces.normal;
        document.getElementById('redKings').textContent = redPieces.kings;
        document.getElementById('blackPieces').textContent = blackPieces.normal;
        document.getElementById('blackKings').textContent = blackPieces.kings;
        
        // Atualizar turno atual
        const currentPlayerName = this.getPlayerName(this.currentPlayer);
        document.getElementById('turnIndicator').textContent = `Vez do ${currentPlayerName}`;
        
        // Adicionar indicador se IA está pensando
        if (this.isVsComputer && this.currentPlayer === 'black' && this.isAiThinking) {
            document.getElementById('turnIndicator').textContent = '🤖 Computador pensando...';
        }
        
        // Atualizar classes dos jogadores
        document.getElementById('player1Info').classList.toggle('current-player', this.currentPlayer === 'red');
        document.getElementById('player2Info').classList.toggle('current-player', this.currentPlayer === 'black');
        
        // Atualizar contadores
        document.getElementById('moveCount').textContent = this.moveCount;
        document.getElementById('captureCount').textContent = this.captureCount;
        
        // Verificar capturas obrigatórias
        const mandatoryCaptures = this.getAllCaptures(this.currentPlayer);
        if (mandatoryCaptures.length > 0) {
            this.showMessage(`${mandatoryCaptures.length} captura(s) obrigatória(s) disponível(is)!`);
        } else if (!this.mandatoryCapture) {
            const playerName = this.getPlayerName(this.currentPlayer);
            if (this.isVsComputer && this.currentPlayer === 'black') {
                this.showMessage('🤖 Vez do computador...');
            } else {
                this.showMessage(`Vez do ${playerName}. Selecione uma peça para mover.`);
            }
        }
    }
    
    countPieces(player) {
        let normal = 0;
        let kings = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === player) {
                    if (piece.isKing) {
                        kings++;
                    } else {
                        normal++;
                    }
                }
            }
        }
        
        return { normal, kings };
    }
    
    checkGameOver() {
        const redPieces = this.countPieces('red');
        const blackPieces = this.countPieces('black');
        const currentPlayerPieces = this.currentPlayer === 'red' ? redPieces : blackPieces;
        
        let gameOverReason = '';
        let winner = '';
        
        // Verificar se não há peças
        if (redPieces.normal + redPieces.kings === 0) {
            winner = 'black';
            gameOverReason = this.isVsComputer ? 
                '🤖 Computador capturou todas as suas peças!' : 
                'Jogador 2 capturou todas as peças do Jogador 1!';
        } else if (blackPieces.normal + blackPieces.kings === 0) {
            winner = 'red';
            gameOverReason = this.isVsComputer ? 
                'Você capturou todas as peças do computador!' : 
                'Jogador 1 capturou todas as peças do Jogador 2!';
        }
        
        // Verificar se não há movimentos válidos
        if (!winner) {
            const allMoves = this.getAllValidMoves(this.currentPlayer);
            if (allMoves.length === 0) {
                winner = this.currentPlayer === 'red' ? 'black' : 'red';
                const currentPlayerName = this.getPlayerName(this.currentPlayer);
                const winnerPlayerName = this.getPlayerName(winner);
                gameOverReason = `${currentPlayerName} não tem movimentos válidos! ${winnerPlayerName} venceu!`;
            }
        }
        
        if (winner) {
            this.isGameOver = true;
            this.stopGameTimer();
            this.sounds.gameOver.play();
            setTimeout(() => this.showGameOverModal(winner, gameOverReason), 500);
        }
    }
    
    getAllValidMoves(player) {
        const allMoves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.player === player) {
                    const moves = this.getPossibleMoves(row, col);
                    allMoves.push(...moves);
                }
            }
        }
        
        return allMoves;
    }
    
    showGameOverModal(winner, reason) {
        const modal = document.getElementById('gameOverModal');
        const winnerName = this.getPlayerName(winner);
        
        document.getElementById('gameOverTitle').innerHTML = `🏆 ${winnerName} Venceu!`;
        document.getElementById('winnerMessage').textContent = reason;
        document.getElementById('finalTime').textContent = document.getElementById('gameTimer').textContent;
        document.getElementById('finalMoves').textContent = this.moveCount;
        document.getElementById('finalCaptures').textContent = this.captureCount;
        
        modal.style.display = 'block';
    }
    
    startGameTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            if (!this.isGameOver) {
                const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                document.getElementById('gameTimer').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.stopMoveTimer(); // Parar timer de jogadas também
    }
    
    showMessage(message) {
        const messageElement = document.getElementById('gameMessage');
        messageElement.textContent = message;
        messageElement.classList.remove('message');
        void messageElement.offsetWidth; // Força reflow
        messageElement.classList.add('message');
    }
    
    showHint() {
        if (this.isGameOver) return;
        
        const allMoves = this.getAllValidMoves(this.currentPlayer);
        const captures = allMoves.filter(move => move.captures && move.captures.length > 0);
        
        if (captures.length > 0) {
            // Mostrar dica de captura
            const bestCapture = captures.reduce((best, current) => 
                current.captures.length > best.captures.length ? current : best
            );
            
            this.showHintHighlight(bestCapture.fromRow, bestCapture.fromCol, bestCapture.toRow, bestCapture.toCol);
            this.showMessage(`💡 Dica: Capture ${bestCapture.captures.length} peça(s) movendo de ${this.getPositionNotation(bestCapture.fromRow, bestCapture.fromCol)} para ${this.getPositionNotation(bestCapture.toRow, bestCapture.toCol)}!`);
        } else if (allMoves.length > 0) {
            // Mostrar dica de movimento comum
            const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
            this.showHintHighlight(randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
            this.showMessage(`💡 Dica: Mova de ${this.getPositionNotation(randomMove.fromRow, randomMove.fromCol)} para ${this.getPositionNotation(randomMove.toRow, randomMove.toCol)}`);
        } else {
            this.showMessage('💡 Não há movimentos disponíveis!');
        }
    }
    
    showHintHighlight(fromRow, fromCol, toRow, toCol) {
        // Limpar highlights anteriores
        document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        
        // Destacar posições da dica
        const fromCell = document.querySelector(`.board-cell[data-row="${fromRow}"][data-col="${fromCol}"]`);
        const toCell = document.querySelector(`.board-cell[data-row="${toRow}"][data-col="${toCol}"]`);
        
        if (fromCell) fromCell.classList.add('highlighted');
        if (toCell) toCell.classList.add('highlighted');
        
        // Remover highlight após alguns segundos
        setTimeout(() => {
            document.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
        }, 3000);
    }
    
    undoMove() {
        if (this.gameHistory.length === 0 || this.isGameOver) {
            this.showMessage('Não há jogadas para desfazer!');
            return;
        }
        
        const lastState = this.gameHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.moveCount = lastState.moveCount;
        this.captureCount = lastState.captureCount;
        this.mandatoryCapture = null;
        
        // Remover última entrada do histórico visual
        const movesContainer = document.getElementById('movesContainer');
        const lastMove = movesContainer.lastElementChild;
        if (lastMove && lastMove.classList.contains('move-item')) {
            lastMove.remove();
        }
        
        if (movesContainer.children.length === 0) {
            movesContainer.innerHTML = '<div class="no-moves">Nenhuma jogada ainda</div>';
        }
        
        this.clearSelection();
        this.renderBoard();
        this.updateGameStatus();
        this.showMessage('Jogada desfeita!');
    }
    
    surrender() {
        if (this.isGameOver) return;
        
        const opponentName = this.getPlayerName(this.currentPlayer === 'red' ? 'black' : 'red');
        const confirmSurrender = confirm(`Tem certeza que deseja desistir? ${opponentName} será declarado vencedor.`);
        
        if (confirmSurrender) {
            const winner = this.currentPlayer === 'red' ? 'black' : 'red';
            const currentPlayerName = this.getPlayerName(this.currentPlayer);
            const reason = `${currentPlayerName} desistiu do jogo.`;
            
            this.isGameOver = true;
            this.stopGameTimer();
            setTimeout(() => this.showGameOverModal(winner, reason), 200);
        }
    }
    
    newGame() {
        // Parar timer atual
        this.stopGameTimer();
        
        // Resetar todas as variáveis
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.captureSequence = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.isGameOver = false;
        this.mandatoryCapture = null;
        this.isVsComputer = false;
        this.isAiThinking = false;
        
        // Atualizar interface
        this.updatePlayerNames();
        document.getElementById('difficultyBtn').style.display = 'none';
        
        // Limpar histórico visual
        document.getElementById('movesContainer').innerHTML = '<div class="no-moves">Nenhuma jogada ainda</div>';
        
        // Fechar modais
        this.closeModals();
        
        // Reinicializar jogo
        this.setupBoard();
        this.renderBoard();
        this.startGameTimer();
        this.updateGameStatus();
        this.showMessage('Novo jogo iniciado! Você (peças vermelhas) começa jogando de baixo.');
    }
    
    // ============= FUNÇÕES DA IA =============
    
    startVsComputerGame() {
        // Parar timer atual
        this.stopGameTimer();
        
        // Resetar todas as variáveis
        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.captureSequence = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.isGameOver = false;
        this.mandatoryCapture = null;
        this.isVsComputer = true;
        this.isAiThinking = false;
        
        // Limpar histórico visual
        document.getElementById('movesContainer').innerHTML = '<div class="no-moves">Nenhuma jogada ainda</div>';
        
        // Fechar modais
        this.closeModals();
        
        // Atualizar interface para jogo vs IA
        this.updatePlayerNames();
        document.getElementById('difficultyBtn').style.display = 'flex';
        
        // Reinicializar jogo
        this.setupBoard();
        this.renderBoard();
        this.startGameTimer();
        this.updateGameStatus();
        this.showMessage('🤖 Jogo contra o computador iniciado! Você joga com as peças vermelhas na parte de baixo.');
    }
    
    updatePlayerNames() {
        if (this.isVsComputer) {
            document.getElementById('player1Name').textContent = 'Você';
            document.getElementById('player2Name').textContent = '🤖 Computador';
        } else {
            document.getElementById('player1Name').textContent = 'Jogador 1';
            document.getElementById('player2Name').textContent = 'Jogador 2';
        }
    }
    
    getPlayerName(player) {
        if (this.isVsComputer) {
            return player === 'red' ? 'Você' : '🤖 Computador';
        } else {
            return player === 'red' ? 'Jogador 1 (Vermelho)' : 'Jogador 2 (Preto)';
        }
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const difficultyNames = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' };
        
        const currentIndex = difficulties.indexOf(this.aiDifficulty);
        this.aiDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
        
        document.getElementById('difficultyText').textContent = difficultyNames[this.aiDifficulty];
        this.showMessage(`Dificuldade alterada para: ${difficultyNames[this.aiDifficulty]}`);
    }
    
    async makeAIMove() {
        if (this.isGameOver || !this.isVsComputer || this.currentPlayer !== 'black') {
            return;
        }
        
        this.isAiThinking = true;
        this.updateGameStatus();
        
        // Simular tempo de pensamento da IA
        const thinkingTime = this.aiDifficulty === 'easy' ? 500 : 
                            this.aiDifficulty === 'medium' ? 1000 : 1500;
        
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
        
        const bestMove = this.getBestAIMove();
        
        if (bestMove) {
            this.isAiThinking = false;
            this.makeMove(bestMove);
        } else {
            this.isAiThinking = false;
            console.log('IA não encontrou movimento válido');
        }
    }
    
    getBestAIMove() {
        const allMoves = this.getAllValidMoves('black');
        
        if (allMoves.length === 0) return null;
        
        switch (this.aiDifficulty) {
            case 'easy':
                return this.getRandomMove(allMoves);
            case 'medium':
                return this.getMediumAIMove(allMoves);
            case 'hard':
                return this.getHardAIMove(allMoves);
            default:
                return this.getRandomMove(allMoves);
        }
    }
    
    getRandomMove(moves) {
        // IA Fácil - movimento aleatório, mas prioriza capturas
        const captures = moves.filter(move => move.captures && move.captures.length > 0);
        
        if (captures.length > 0) {
            return captures[Math.floor(Math.random() * captures.length)];
        }
        
        return moves[Math.floor(Math.random() * moves.length)];
    }
    
    getMediumAIMove(moves) {
        // IA Média - estratégia básica
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            let score = 0;
            
            // Priorizar capturas
            if (move.captures && move.captures.length > 0) {
                score += move.captures.length * 10;
                
                // Bonificação por capturar damas
                move.captures.forEach(capture => {
                    const capturedPiece = this.board[capture.row][capture.col];
                    if (capturedPiece && capturedPiece.isKing) {
                        score += 5;
                    }
                });
            }
            
            // Priorizar promoção a dama (peças pretas chegam à linha 7)
            if (move.toRow === 7) {
                score += 8;
            }
            
            // Preferir movimentos centrais
            const centerDistance = Math.abs(3.5 - move.toCol) + Math.abs(3.5 - move.toRow);
            score += (7 - centerDistance) * 0.5;
            
            // Evitar bordas quando possível
            if (move.toRow === 0 || move.toRow === 7 || move.toCol === 0 || move.toCol === 7) {
                score -= 1;
            }
            
            // Adicionar aleatoriedade
            score += Math.random() * 2;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getHardAIMove(moves) {
        // IA Difícil - minimax simples com avaliação mais profunda
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of moves) {
            const score = this.evaluateMove(move, 2); // Profundidade 2
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    evaluateMove(move, depth) {
        // Simular o movimento
        const originalBoard = this.board.map(row => row.map(cell => cell ? {...cell} : null));
        
        // Aplicar movimento
        const piece = this.board[move.fromRow][move.fromCol];
        this.board[move.toRow][move.toCol] = piece;
        this.board[move.fromRow][move.fromCol] = null;
        
        // Aplicar capturas
        if (move.captures) {
            move.captures.forEach(capture => {
                this.board[capture.row][capture.col] = null;
            });
        }
        
        // Verificar promoção
        if (piece.player === 'black' && move.toRow === 7) {
            piece.isKing = true;
        }
        
        let score = this.evaluateBoard();
        
        // Se há profundidade restante, simular resposta do oponente
        if (depth > 1) {
            const opponentMoves = this.getAllValidMoves('red');
            let worstOpponentScore = Infinity;
            
            for (const opponentMove of opponentMoves.slice(0, 5)) { // Limitar para performance
                const opponentScore = -this.evaluateMove(opponentMove, depth - 1);
                worstOpponentScore = Math.min(worstOpponentScore, opponentScore);
            }
            
            if (worstOpponentScore !== Infinity) {
                score += worstOpponentScore * 0.5;
            }
        }
        
        // Restaurar tabuleiro
        this.board = originalBoard;
        
        return score;
    }
    
    evaluateBoard() {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (!piece) continue;
                
                let pieceValue = piece.isKing ? 5 : 1;
                
                if (piece.player === 'black') {
                    score += pieceValue;
                    
                    // Bonificação por posição
                    if (!piece.isKing) {
                        score += row * 0.1; // Peças avançadas (mais para baixo) valem mais
                    }
                    
                    // Bonificação por posição central
                    const centerDistance = Math.abs(3.5 - col) + Math.abs(3.5 - row);
                    score += (7 - centerDistance) * 0.05;
                    
                } else {
                    score -= pieceValue;
                    
                    if (!piece.isKing) {
                        score -= (7 - row) * 0.1; // Peças vermelhas avançadas (mais para cima) são ameaça
                    }
                    
                    const centerDistance = Math.abs(3.5 - col) + Math.abs(3.5 - row);
                    score -= (7 - centerDistance) * 0.05;
                }
            }
        }
        
        // Verificar mobilidade
        const aiMoves = this.getAllValidMoves('black').length;
        const playerMoves = this.getAllValidMoves('red').length;
        score += (aiMoves - playerMoves) * 0.1;
        
        return score;
    }
    
    showRulesModal() {
        document.getElementById('rulesModal').style.display = 'block';
    }
    
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Inicializar o jogo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.checkersGame = new CheckersGame();
});
