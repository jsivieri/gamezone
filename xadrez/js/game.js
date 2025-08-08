// Jogo de Xadrez - Lógica Completa com IA
class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.isGameOver = false;
        this.isVsComputer = false;
        this.aiDifficulty = 'easy';
        this.isAiThinking = false;
        this.capturedPieces = {white: [], black: []};
        this.kingPositions = {white: {row: 7, col: 4}, black: {row: 0, col: 4}};
        this.castlingRights = {
            white: {kingside: true, queenside: true, kingMoved: false},
            black: {kingside: true, queenside: true, kingMoved: false}
        };
        this.enPassantTarget = null;
        this.promotionPending = null;
        
        this.pieceValues = {
            'pawn': 1, 'knight': 3, 'bishop': 3,
            'rook': 5, 'queen': 9, 'king': 0
        };
        
        this.sounds = {
            move: this.createSound('move'),
            capture: this.createSound('capture'),
            check: this.createSound('check'),
            castling: this.createSound('castling'),
            promotion: this.createSound('promotion'),
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
    }
    
    // Criar sons sintéticos
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
                    case 'check':
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.2);
                        break;
                    case 'castling':
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.4);
                        break;
                    case 'promotion':
                        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.5);
                        break;
                    case 'gameOver':
                        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
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
        
        // Posição inicial das peças
        const initialSetup = [
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            ['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
            ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
        ];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (initialSetup[row][col]) {
                    this.board[row][col] = {
                        type: initialSetup[row][col],
                        color: row < 2 ? 'black' : 'white',
                        hasMoved: false
                    };
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
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece.type, piece.color);
                    cell.appendChild(pieceElement);
                }
                
                boardElement.appendChild(cell);
            }
        }
        
        this.updateCapturedPieces();
    }
    
    getPieceSymbol(type, color) {
        const symbols = {
            white: {
                'king': '♔', 'queen': '♕', 'rook': '♖',
                'bishop': '♗', 'knight': '♘', 'pawn': '♙'
            },
            black: {
                'king': '♚', 'queen': '♛', 'rook': '♜',
                'bishop': '♝', 'knight': '♞', 'pawn': '♟'
            }
        };
        
        return symbols[color][type];
    }
    
    setupEventListeners() {
        // Cliques no tabuleiro
        document.getElementById('gameBoard').addEventListener('click', (e) => {
            const cell = e.target.closest('.board-cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.handleCellClick(row, col);
        });
        
        // Botões de controle
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('vsComputerBtn').addEventListener('click', () => this.startVsComputerGame());
        document.getElementById('rulesBtn').addEventListener('click', () => this.showRulesModal());
        document.getElementById('undoBtn').addEventListener('click', () => this.undoMove());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        document.getElementById('difficultyBtn').addEventListener('click', () => this.cycleDifficulty());
        document.getElementById('surrenderBtn').addEventListener('click', () => this.surrender());
        
        // Fechar modais
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Botões de promoção
        document.querySelectorAll('.promotion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pieceType = e.target.dataset.piece;
                this.handlePromotion(pieceType);
            });
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
                case 'Escape':
                    this.closeModals();
                    this.clearSelection();
                    break;
                case 'u':
                case 'U':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.undoMove();
                    }
                    break;
                case 'n':
                case 'N':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.newGame();
                    }
                    break;
            }
        });
    }
    
    handleCellClick(row, col) {
        if (this.isGameOver || this.promotionPending) return;
        
        const piece = this.board[row][col];
        
        // Se clicou em uma casa com movimento possível
        if (this.selectedPiece && this.isPossibleMove(row, col)) {
            this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
            return;
        }
        
        // Se clicou em uma peça própria
        if (piece && piece.color === this.currentPlayer) {
            if (this.isVsComputer && this.currentPlayer === 'black') {
                this.showMessage('Aguarde a jogada do computador...');
                return;
            }
            this.selectPiece(row, col);
        } else {
            this.clearSelection();
        }
    }
    
    selectPiece(row, col) {
        this.clearSelection();
        
        this.selectedPiece = {row, col};
        this.possibleMoves = this.getPossibleMoves(row, col);
        
        // Destacar peça selecionada
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cell.classList.add('selected');
        
        // Mostrar movimentos possíveis
        this.possibleMoves.forEach(move => {
            const targetCell = document.querySelector(`[data-row="${move.toRow}"][data-col="${move.toCol}"]`);
            if (move.isCapture) {
                targetCell.classList.add('possible-capture');
            } else {
                targetCell.classList.add('possible-move');
            }
        });
    }
    
    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece || piece.color !== this.currentPlayer) {
            console.log(`[DEBUG] getPossibleMoves: No valid piece at ${row},${col} for ${this.currentPlayer}`);
            return [];
        }
        
        console.log(`[DEBUG] getPossibleMoves: Getting moves for ${piece.color} ${piece.type} at ${row},${col}`);
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = this.getQueenMoves(row, col);
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }
        
        console.log(`[DEBUG] getPossibleMoves: Found ${moves.length} raw moves for ${piece.type}`);
        
        // Filtrar movimentos que deixam o rei em xeque
        const validMoves = moves.filter(move => !this.wouldBeInCheck(row, col, move.toRow, move.toCol));
        console.log(`[DEBUG] getPossibleMoves: ${validMoves.length} valid moves after check filter`);
        
        return validMoves;
    }
    
    getPawnMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // Movimento para frente
        if (this.isValidPosition(row + direction, col) && !this.board[row + direction][col]) {
            moves.push({toRow: row + direction, toCol: col, isCapture: false});
            
            // Movimento duplo inicial
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push({toRow: row + 2 * direction, toCol: col, isCapture: false});
            }
        }
        
        // Capturas
        for (const colOffset of [-1, 1]) {
            const newCol = col + colOffset;
            if (this.isValidPosition(row + direction, newCol)) {
                const targetPiece = this.board[row + direction][newCol];
                if (targetPiece && targetPiece.color !== piece.color) {
                    moves.push({toRow: row + direction, toCol: newCol, isCapture: true});
                }
                
                // En passant
                if (this.enPassantTarget && 
                    this.enPassantTarget.row === row + direction && 
                    this.enPassantTarget.col === newCol) {
                    moves.push({
                        toRow: row + direction, 
                        toCol: newCol, 
                        isCapture: true,
                        isEnPassant: true
                    });
                }
            }
        }
        
        return moves;
    }
    
    getRookMoves(row, col) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece) {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({toRow: newRow, toCol: newCol, isCapture: true});
                    }
                    break;
                } else {
                    moves.push({toRow: newRow, toCol: newCol, isCapture: false});
                }
            }
        }
        
        return moves;
    }
    
    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                const isCapture = targetPiece && targetPiece.color !== this.board[row][col].color;
                
                if (!targetPiece || isCapture) {
                    moves.push({toRow: newRow, toCol: newCol, isCapture: !!isCapture});
                }
            }
        }
        
        return moves;
    }
    
    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        
        for (const [dRow, dCol] of directions) {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * dRow;
                const newCol = col + i * dCol;
                
                if (!this.isValidPosition(newRow, newCol)) break;
                
                const targetPiece = this.board[newRow][newCol];
                if (targetPiece) {
                    if (targetPiece.color !== this.board[row][col].color) {
                        moves.push({toRow: newRow, toCol: newCol, isCapture: true});
                    }
                    break;
                } else {
                    moves.push({toRow: newRow, toCol: newCol, isCapture: false});
                }
            }
        }
        
        return moves;
    }
    
    getQueenMoves(row, col) {
        return [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
    }
    
    getKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];
        
        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                const isCapture = targetPiece && targetPiece.color !== this.board[row][col].color;
                
                if (!targetPiece || isCapture) {
                    moves.push({toRow: newRow, toCol: newCol, isCapture: !!isCapture});
                }
            }
        }
        
        // Roque
        const piece = this.board[row][col];
        const castlingRights = this.castlingRights[piece.color];
        
        if (!piece.hasMoved && !this.isInCheck(piece.color)) {
            // Roque pequeno
            if (castlingRights.kingside && 
                !this.board[row][5] && !this.board[row][6] &&
                this.board[row][7] && this.board[row][7].type === 'rook' && !this.board[row][7].hasMoved) {
                
                if (!this.isSquareAttacked(row, 5, piece.color) && !this.isSquareAttacked(row, 6, piece.color)) {
                    moves.push({toRow: row, toCol: 6, isCapture: false, isCastling: true, castlingSide: 'kingside'});
                }
            }
            
            // Roque grande
            if (castlingRights.queenside && 
                !this.board[row][3] && !this.board[row][2] && !this.board[row][1] &&
                this.board[row][0] && this.board[row][0].type === 'rook' && !this.board[row][0].hasMoved) {
                
                if (!this.isSquareAttacked(row, 3, piece.color) && !this.isSquareAttacked(row, 2, piece.color)) {
                    moves.push({toRow: row, toCol: 2, isCapture: false, isCastling: true, castlingSide: 'queenside'});
                }
            }
        }
        
        return moves;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    isPossibleMove(row, col) {
        return this.possibleMoves.some(move => move.toRow === row && move.toCol === col);
    }
    
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const targetPiece = this.board[toRow][toCol];
        const move = this.possibleMoves.find(m => m.toRow === toRow && m.toCol === toCol);
        
        if (!move) return false;
        
        // Salvar estado para histórico
        const gameState = {
            board: JSON.parse(JSON.stringify(this.board)),
            currentPlayer: this.currentPlayer,
            kingPositions: {...this.kingPositions},
            castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
            enPassantTarget: this.enPassantTarget,
            moveCount: this.moveCount,
            captureCount: this.captureCount,
            move: {fromRow, fromCol, toRow, toCol, piece: piece.type, captured: targetPiece?.type}
        };
        
        this.gameHistory.push(gameState);
        
        // Executar movimento
        let capturedPiece = null;
        
        // En passant
        if (move.isEnPassant) {
            const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            capturedPiece = this.board[capturedRow][toCol];
            this.board[capturedRow][toCol] = null;
        } else if (targetPiece) {
            capturedPiece = targetPiece;
        }
        
        // Mover peça
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        piece.hasMoved = true;
        
        // Atualizar posição do rei
        if (piece.type === 'king') {
            this.kingPositions[piece.color] = {row: toRow, col: toCol};
        }
        
        // Roque
        if (move.isCastling) {
            if (move.castlingSide === 'kingside') {
                this.board[toRow][5] = this.board[toRow][7];
                this.board[toRow][7] = null;
                this.board[toRow][5].hasMoved = true;
            } else {
                this.board[toRow][3] = this.board[toRow][0];
                this.board[toRow][0] = null;
                this.board[toRow][3].hasMoved = true;
            }
            this.sounds.castling.play();
        }
        
        // En passant target
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: toCol
            };
        }
        
        // Atualizar direitos de roque
        if (piece.type === 'king') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        } else if (piece.type === 'rook') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }
        
        // Promoção de peão
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            this.promotionPending = {row: toRow, col: toCol, color: piece.color};
            document.getElementById('promotionModal').style.display = 'block';
            return true;
        }
        
        this.finishMove(capturedPiece, move);
        return true;
    }
    
    finishMove(capturedPiece, move) {
        // Atualizar contadores
        this.moveCount++;
        if (capturedPiece) {
            this.captureCount++;
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
            this.sounds.capture.play();
        } else if (move.isCastling) {
            // Som já tocado
        } else {
            this.sounds.move.play();
        }
        
        // Alternar jogador
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // Verificar xeque
        if (this.isInCheck(this.currentPlayer)) {
            this.sounds.check.play();
        }
        
        // Limpar seleção
        this.clearSelection();
        
        // Atualizar interface
        setTimeout(() => {
            this.renderBoard();
            this.updateGameStatus();
            this.checkGameOver();
            
            // IA jogará se necessário
            console.log('Verificando condições da IA:', {
                isVsComputer: this.isVsComputer,
                currentPlayer: this.currentPlayer,
                isGameOver: this.isGameOver
            });
            
            if (this.isVsComputer && this.currentPlayer === 'black' && !this.isGameOver) {
                console.log('Chamando IA após movimento do jogador');
                setTimeout(() => this.makeAIMove(), 1000);
            } else {
                console.log('IA não será chamada - condições não atendidas');
            }
        }, 100);
        
        // Adicionar ao histórico
        this.addMoveToHistory();
    }
    
    handlePromotion(pieceType) {
        if (!this.promotionPending) return;
        
        const {row, col, color} = this.promotionPending;
        this.board[row][col] = {
            type: pieceType,
            color: color,
            hasMoved: true
        };
        
        this.promotionPending = null;
        document.getElementById('promotionModal').style.display = 'none';
        this.sounds.promotion.play();
        
        this.renderBoard();
        this.updateGameStatus();
        this.checkGameOver();
        
        // IA jogará se necessário
        if (this.isVsComputer && this.currentPlayer === 'black' && !this.isGameOver) {
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }
    
    // Continua na próxima parte...
    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        console.log(`[DEBUG] Checking if move ${fromRow},${fromCol} -> ${toRow},${toCol} would leave in check`);
        
        // Simular movimento
        const originalPiece = this.board[toRow][toCol];
        const movingPiece = this.board[fromRow][fromCol];
        
        if (!movingPiece) {
            console.log(`[DEBUG] No piece at ${fromRow},${fromCol} - returning false`);
            return false;
        }
        
        this.board[toRow][toCol] = movingPiece;
        this.board[fromRow][fromCol] = null;
        
        // Atualizar posição do rei temporariamente se necessário
        let originalKingPos = null;
        if (movingPiece.type === 'king') {
            originalKingPos = {...this.kingPositions[movingPiece.color]};
            this.kingPositions[movingPiece.color] = {row: toRow, col: toCol};
        }
        
        const inCheck = this.isInCheck(movingPiece.color);
        console.log(`[DEBUG] Move would result in check: ${inCheck}`);
        
        // Reverter movimento
        this.board[fromRow][fromCol] = movingPiece;
        this.board[toRow][toCol] = originalPiece;
        
        if (originalKingPos) {
            this.kingPositions[movingPiece.color] = originalKingPos;
        }
        
        return inCheck;
    }
    
    isInCheck(color) {
        const kingPos = this.kingPositions[color];
        console.log(`[DEBUG] Checking if ${color} king at ${kingPos.row},${kingPos.col} is in check`);
        
        const attacked = this.isSquareAttacked(kingPos.row, kingPos.col, color);
        console.log(`[DEBUG] King square is attacked: ${attacked}`);
        return attacked;
    }
    
    isSquareAttacked(row, col, defenderColor) {
        const attackerColor = defenderColor === 'white' ? 'black' : 'white';
        
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === attackerColor) {
                    if (this.canAttackSquare(r, c, row, col)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    canAttackSquare(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        
        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                return toRow === fromRow + direction && Math.abs(toCol - fromCol) === 1;
            
            case 'rook':
                return (fromRow === toRow || fromCol === toCol) && 
                       this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'knight':
                const dr = Math.abs(toRow - fromRow);
                const dc = Math.abs(toCol - fromCol);
                return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
            
            case 'bishop':
                return Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol) && 
                       this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'queen':
                return ((fromRow === toRow || fromCol === toCol) || 
                        (Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol))) && 
                       this.isPathClear(fromRow, fromCol, toRow, toCol);
            
            case 'king':
                return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
            
            default:
                return false;
        }
    }
    
    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowDir = toRow === fromRow ? 0 : (toRow - fromRow) / Math.abs(toRow - fromRow);
        const colDir = toCol === fromCol ? 0 : (toCol - fromCol) / Math.abs(toCol - fromCol);
        
        let currentRow = fromRow + rowDir;
        let currentCol = fromCol + colDir;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) {
                return false;
            }
            currentRow += rowDir;
            currentCol += colDir;
        }
        
        return true;
    }
    
    clearSelection() {
        document.querySelectorAll('.board-cell').forEach(cell => {
            cell.classList.remove('selected', 'possible-move', 'possible-capture', 'last-move');
        });
        this.selectedPiece = null;
        this.possibleMoves = [];
    }
    
    // ============= IA DO COMPUTADOR =============
    
    async makeAIMove() {
        console.log('makeAIMove chamada - Estado:', {
            isGameOver: this.isGameOver,
            isVsComputer: this.isVsComputer, 
            currentPlayer: this.currentPlayer
        });
        
        if (this.isGameOver || !this.isVsComputer || this.currentPlayer !== 'black') {
            console.log('makeAIMove cancelada - condições não atendidas');
            return;
        }
        
        this.isAiThinking = true;
        this.updateGameStatus();
        console.log('IA iniciando pensamento...');
        
        // Simular tempo de pensamento
        const thinkingTime = this.aiDifficulty === 'easy' ? 500 : 
                            this.aiDifficulty === 'medium' ? 1000 : 1500;
        
        await new Promise(resolve => setTimeout(resolve, thinkingTime));
        
        const bestMove = this.getBestAIMove();
        console.log('Melhor movimento encontrado:', bestMove);
        
        if (bestMove) {
            this.isAiThinking = false;
            this.makeMove(bestMove.fromRow, bestMove.fromCol, bestMove.toRow, bestMove.toCol);
        } else {
            this.isAiThinking = false;
            console.log('IA não encontrou movimento válido');
        }
    }
    
    getBestAIMove() {
        const allMoves = this.getAllValidMoves('black');
        console.log('Movimentos disponíveis para IA:', allMoves.length);
        
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
        console.log('getRandomMove - movimentos recebidos:', moves.length);
        if (moves.length === 0) return null;
        
        // Priorizar capturas se houver
        const captures = moves.filter(move => {
            const targetPiece = this.board[move.toRow][move.toCol];
            return targetPiece && targetPiece.color === 'white';
        });
        
        console.log('Capturas disponíveis:', captures.length);
        
        if (captures.length > 0) {
            const selectedMove = captures[Math.floor(Math.random() * captures.length)];
            console.log('Movimento de captura selecionado:', selectedMove);
            return selectedMove;
        }
        
        const selectedMove = moves[Math.floor(Math.random() * moves.length)];
        console.log('Movimento aleatório selecionado:', selectedMove);
        return selectedMove;
    }
    
    getMediumAIMove(moves) {
        let bestMove = null;
        let bestValue = -Infinity;
        
        for (const move of moves) {
            const value = this.evaluateMove(move);
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
        }
        
        return bestMove;
    }
    
    getHardAIMove(moves) {
        return this.minimax(moves, 3, -Infinity, Infinity, true);
    }
    
    evaluateMove(move) {
        let score = 0;
        
        // Valor da peça capturada
        const targetPiece = this.board[move.toRow][move.toCol];
        if (targetPiece) {
            score += this.pieceValues[targetPiece.type] * 10;
        }
        
        // Controle do centro
        const centerDistance = Math.abs(3.5 - move.toRow) + Math.abs(3.5 - move.toCol);
        score += (7 - centerDistance) * 0.5;
        
        // Desenvolvimento de peças
        const piece = this.board[move.fromRow][move.fromCol];
        if (!piece.hasMoved && (piece.type === 'knight' || piece.type === 'bishop')) {
            score += 2;
        }
        
        return score;
    }
    
    minimax(moves, depth, alpha, beta, maximizingPlayer) {
        if (depth === 0) {
            return this.evaluatePosition();
        }
        
        let bestMove = null;
        
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (const move of moves) {
                const evaluation = this.evaluateMove(move);
                if (evaluation > maxEval) {
                    maxEval = evaluation;
                    bestMove = move;
                }
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
            return depth === 3 ? bestMove : maxEval;
        } else {
            let minEval = Infinity;
            for (const move of moves) {
                const evaluation = -this.evaluateMove(move);
                if (evaluation < minEval) {
                    minEval = evaluation;
                    bestMove = move;
                }
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
            return depth === 3 ? bestMove : minEval;
        }
    }
    
    evaluatePosition() {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece) {
                    const value = this.pieceValues[piece.type];
                    if (piece.color === 'black') {
                        score += value;
                    } else {
                        score -= value;
                    }
                }
            }
        }
        
        return score;
    }
    
    getAllValidMoves(color) {
        const moves = [];
        console.log(`getAllValidMoves para cor ${color}`);
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    console.log(`Encontrada peça ${piece.type} ${piece.color} em (${row},${col})`);
                    const pieceMoves = this.getPossibleMoves(row, col);
                    console.log(`Movimentos possíveis para ${piece.type}:`, pieceMoves.length);
                    pieceMoves.forEach(move => {
                        moves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.toRow,
                            toCol: move.toCol,
                            isCapture: move.isCapture
                        });
                    });
                }
            }
        }
        
        console.log(`Total de movimentos válidos para ${color}:`, moves.length);
        return moves;
    }
    
    // ============= FUNÇÕES DE CONTROLE =============
    
    newGame() {
        // Parar timer atual
        this.stopGameTimer();
        
        // Resetar estado
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.isGameOver = false;
        this.isVsComputer = false;
        this.isAiThinking = false;
        this.capturedPieces = {white: [], black: []};
        this.kingPositions = {white: {row: 7, col: 4}, black: {row: 0, col: 4}};
        this.castlingRights = {
            white: {kingside: true, queenside: true},
            black: {kingside: true, queenside: true}
        };
        this.enPassantTarget = null;
        this.promotionPending = null;
        
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
        this.showMessage('Novo jogo iniciado! Brancas começam jogando.');
    }
    
    startVsComputerGame() {
        // Parar timer atual
        this.stopGameTimer();
        
        // Resetar estado
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.gameHistory = [];
        this.moveCount = 0;
        this.captureCount = 0;
        this.isGameOver = false;
        this.isVsComputer = true;
        this.isAiThinking = false;
        this.capturedPieces = {white: [], black: []};
        this.kingPositions = {white: {row: 7, col: 4}, black: {row: 0, col: 4}};
        this.castlingRights = {
            white: {kingside: true, queenside: true},
            black: {kingside: true, queenside: true}
        };
        this.enPassantTarget = null;
        this.promotionPending = null;
        
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
        this.showMessage('🤖 Jogo contra o computador iniciado! Você joga com as peças brancas.');
    }
    
    updatePlayerNames() {
        if (this.isVsComputer) {
            document.getElementById('player1Name').textContent = 'Você (Brancas)';
            document.getElementById('player2Name').textContent = '🤖 Computador (Pretas)';
        } else {
            document.getElementById('player1Name').textContent = 'Brancas';
            document.getElementById('player2Name').textContent = 'Pretas';
        }
    }
    
    cycleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const currentIndex = difficulties.indexOf(this.aiDifficulty);
        this.aiDifficulty = difficulties[(currentIndex + 1) % difficulties.length];
        
        const difficultyNames = {easy: 'Fácil', medium: 'Médio', hard: 'Difícil'};
        document.getElementById('difficultyText').textContent = difficultyNames[this.aiDifficulty];
        this.showMessage(`Dificuldade alterada para: ${difficultyNames[this.aiDifficulty]}`);
    }
    
    undoMove() {
        if (this.gameHistory.length === 0 || this.isGameOver || this.promotionPending) return;
        
        const lastState = this.gameHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.kingPositions = lastState.kingPositions;
        this.castlingRights = lastState.castlingRights;
        this.enPassantTarget = lastState.enPassantTarget;
        this.moveCount = lastState.moveCount;
        this.captureCount = lastState.captureCount;
        
        // Se jogando contra IA, desfazer duas jogadas
        if (this.isVsComputer && this.gameHistory.length > 0) {
            const previousState = this.gameHistory.pop();
            this.board = previousState.board;
            this.currentPlayer = previousState.currentPlayer;
            this.kingPositions = previousState.kingPositions;
            this.castlingRights = previousState.castlingRights;
            this.enPassantTarget = previousState.enPassantTarget;
            this.moveCount = previousState.moveCount;
            this.captureCount = previousState.captureCount;
        }
        
        this.clearSelection();
        this.renderBoard();
        this.updateGameStatus();
        this.showMessage('Jogada desfeita!');
    }
    
    showHint() {
        if (this.isGameOver || (this.isVsComputer && this.currentPlayer === 'black')) {
            return;
        }
        
        const allMoves = this.getAllValidMoves(this.currentPlayer);
        if (allMoves.length === 0) return;
        
        const hintMove = this.getBestAIMove();
        if (hintMove) {
            this.clearSelection();
            
            const fromCell = document.querySelector(`[data-row="${hintMove.fromRow}"][data-col="${hintMove.fromCol}"]`);
            const toCell = document.querySelector(`[data-row="${hintMove.toRow}"][data-col="${hintMove.toCol}"]`);
            
            fromCell.classList.add('selected');
            toCell.classList.add('possible-move');
            
            setTimeout(() => {
                this.clearSelection();
            }, 3000);
            
            this.showMessage('💡 Dica mostrada por 3 segundos!');
        }
    }
    
    surrender() {
        if (this.isGameOver) return;
        
        const winner = this.currentPlayer === 'white' ? 'Pretas' : 'Brancas';
        this.endGame(`${winner} vencem por desistência!`, winner.toLowerCase());
    }
    
    // ============= SISTEMA DE STATUS E TIMER =============
    
    updateGameStatus() {
        // Atualizar informações dos jogadores
        this.updateCapturedPieces();
        
        // Atualizar turno atual
        const currentPlayerName = this.getPlayerName(this.currentPlayer);
        document.getElementById('turnIndicator').textContent = `Vez das ${currentPlayerName}`;
        
        // Adicionar indicador se IA está pensando
        if (this.isVsComputer && this.currentPlayer === 'black' && this.isAiThinking) {
            document.getElementById('turnIndicator').textContent = '🤖 Computador pensando...';
        }
        
        // Atualizar classes dos jogadores
        document.getElementById('player1Info').classList.toggle('current-player', this.currentPlayer === 'white');
        document.getElementById('player2Info').classList.toggle('current-player', this.currentPlayer === 'black');
        
        // Atualizar contadores
        document.getElementById('moveCount').textContent = this.moveCount;
        document.getElementById('captureCount').textContent = this.captureCount;
        
        // Verificar xeque
        if (this.isInCheck(this.currentPlayer)) {
            this.showMessage(`⚠️ ${this.getPlayerName(this.currentPlayer)} em XEQUE!`);
            
            // Destacar rei em xeque
            const kingPos = this.kingPositions[this.currentPlayer];
            const kingCell = document.querySelector(`[data-row="${kingPos.row}"][data-col="${kingPos.col}"]`);
            kingCell.classList.add('in-check');
        } else {
            const playerName = this.getPlayerName(this.currentPlayer);
            if (this.isVsComputer && this.currentPlayer === 'black') {
                this.showMessage('🤖 Vez do computador...');
            } else {
                this.showMessage(`Vez das ${playerName}. Selecione uma peça para mover.`);
            }
        }
    }
    
    updateCapturedPieces() {
        const whiteCapturedElement = document.getElementById('whiteCaptured');
        const blackCapturedElement = document.getElementById('blackCaptured');
        const whiteScoreElement = document.getElementById('whiteScore');
        const blackScoreElement = document.getElementById('blackScore');
        
        // Mostrar peças capturadas
        whiteCapturedElement.innerHTML = '';
        blackCapturedElement.innerHTML = '';
        
        let whiteScore = 0;
        let blackScore = 0;
        
        this.capturedPieces.white.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.getPieceSymbol(piece.type, piece.color);
            whiteCapturedElement.appendChild(pieceElement);
            whiteScore += this.pieceValues[piece.type];
        });
        
        this.capturedPieces.black.forEach(piece => {
            const pieceElement = document.createElement('span');
            pieceElement.className = 'captured-piece';
            pieceElement.textContent = this.getPieceSymbol(piece.type, piece.color);
            blackCapturedElement.appendChild(pieceElement);
            blackScore += this.pieceValues[piece.type];
        });
        
        whiteScoreElement.textContent = `+${blackScore - whiteScore}`;
        blackScoreElement.textContent = `+${whiteScore - blackScore}`;
    }
    
    getPlayerName(color) {
        return color === 'white' ? 'Brancas' : 'Pretas';
    }
    
    showMessage(message) {
        const messageElement = document.getElementById('gameMessage');
        messageElement.textContent = message;
        messageElement.style.animation = 'none';
        setTimeout(() => {
            messageElement.style.animation = 'message-fade-in 0.5s ease';
        }, 10);
    }
    
    startGameTimer() {
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('gameTimer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    stopGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
    
    // ============= FIM DE JOGO =============
    
    checkGameOver() {
        const allMoves = this.getAllValidMoves(this.currentPlayer);
        const inCheck = this.isInCheck(this.currentPlayer);
        
        if (allMoves.length === 0) {
            if (inCheck) {
                // Xeque-mate
                const winner = this.currentPlayer === 'white' ? 'Pretas' : 'Brancas';
                this.endGame(`Xeque-mate! ${winner} vencem!`, winner.toLowerCase());
            } else {
                // Afogamento
                this.endGame('Empate por afogamento!', 'draw');
            }
            return;
        }
        
        // Verificar empate por material insuficiente
        if (this.isInsufficientMaterial()) {
            this.endGame('Empate por material insuficiente!', 'draw');
        }
    }
    
    isInsufficientMaterial() {
        const pieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type !== 'king') {
                    pieces.push(piece);
                }
            }
        }
        
        // Rei vs Rei
        if (pieces.length === 0) return true;
        
        // Rei + Cavalo vs Rei ou Rei + Bispo vs Rei
        if (pieces.length === 1) {
            const pieceType = pieces[0].type;
            return pieceType === 'knight' || pieceType === 'bishop';
        }
        
        return false;
    }
    
    endGame(message, winner) {
        this.isGameOver = true;
        this.stopGameTimer();
        this.clearSelection();
        
        // Tocar som de fim de jogo
        this.sounds.gameOver.play();
        
        // Calcular tempo final
        const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const finalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Atualizar modal de fim de jogo
        document.getElementById('gameOverTitle').textContent = winner === 'draw' ? '🤝 Empate!' : '🏆 Fim de Jogo!';
        document.getElementById('winnerMessage').textContent = message;
        document.getElementById('finalTime').textContent = finalTime;
        document.getElementById('finalMoves').textContent = this.moveCount;
        document.getElementById('finalCaptures').textContent = this.captureCount;
        
        // Mostrar modal
        setTimeout(() => {
            document.getElementById('gameOverModal').style.display = 'block';
        }, 1000);
    }
    
    addMoveToHistory() {
        if (this.gameHistory.length === 0) return;
        
        const lastMove = this.gameHistory[this.gameHistory.length - 1];
        const move = lastMove.move;
        
        const fromNotation = this.getPositionNotation(move.fromRow, move.fromCol);
        const toNotation = this.getPositionNotation(move.toRow, move.toCol);
        
        let moveText = `${fromNotation} → ${toNotation}`;
        let moveType = 'Movimento';
        
        if (move.captured) {
            moveType = `Capturou ${move.captured}`;
        }
        
        const moveItem = document.createElement('div');
        moveItem.className = `move-item ${lastMove.currentPlayer}-move`;
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
        const letters = 'abcdefgh';
        return letters[col] + (8 - row);
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
    window.chessGame = new ChessGame();
});
