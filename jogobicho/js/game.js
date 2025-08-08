// Dados dos animais do Jogo do Bicho
const animals = [
    { id: 1, name: "Avestruz", emoji: "🦆", numbers: ["01", "02", "03", "04"] },
    { id: 2, name: "Águia", emoji: "🦅", numbers: ["05", "06", "07", "08"] },
    { id: 3, name: "Burro", emoji: "🫏", numbers: ["09", "10", "11", "12"] },
    { id: 4, name: "Borboleta", emoji: "🦋", numbers: ["13", "14", "15", "16"] },
    { id: 5, name: "Cachorro", emoji: "🐕", numbers: ["17", "18", "19", "20"] },
    { id: 6, name: "Cabra", emoji: "🐐", numbers: ["21", "22", "23", "24"] },
    { id: 7, name: "Carneiro", emoji: "🐑", numbers: ["25", "26", "27", "28"] },
    { id: 8, name: "Camelo", emoji: "🐪", numbers: ["29", "30", "31", "32"] },
    { id: 9, name: "Cobra", emoji: "🐍", numbers: ["33", "34", "35", "36"] },
    { id: 10, name: "Coelho", emoji: "🐰", numbers: ["37", "38", "39", "40"] },
    { id: 11, name: "Cavalo", emoji: "🐎", numbers: ["41", "42", "43", "44"] },
    { id: 12, name: "Elefante", emoji: "🐘", numbers: ["45", "46", "47", "48"] },
    { id: 13, name: "Galo", emoji: "🐓", numbers: ["49", "50", "51", "52"] },
    { id: 14, name: "Gato", emoji: "🐱", numbers: ["53", "54", "55", "56"] },
    { id: 15, name: "Jacaré", emoji: "🐊", numbers: ["57", "58", "59", "60"] },
    { id: 16, name: "Leão", emoji: "🦁", numbers: ["61", "62", "63", "64"] },
    { id: 17, name: "Macaco", emoji: "🐒", numbers: ["65", "66", "67", "68"] },
    { id: 18, name: "Porco", emoji: "🐷", numbers: ["69", "70", "71", "72"] },
    { id: 19, name: "Pavão", emoji: "🦚", numbers: ["73", "74", "75", "76"] },
    { id: 20, name: "Peru", emoji: "🦃", numbers: ["77", "78", "79", "80"] },
    { id: 21, name: "Touro", emoji: "🐂", numbers: ["81", "82", "83", "84"] },
    { id: 22, name: "Tigre", emoji: "🐅", numbers: ["85", "86", "87", "88"] },
    { id: 23, name: "Urso", emoji: "🐻", numbers: ["89", "90", "91", "92"] },
    { id: 24, name: "Veado", emoji: "🦌", numbers: ["93", "94", "95", "96"] },
    { id: 25, name: "Vaca", emoji: "🐄", numbers: ["97", "98", "99", "00"] }
];

// Estado do jogo
let gameState = {
    balance: 100.00,
    currentBet: null,
    selectedAnimal: null,
    selectedNumber: null,
    betAmount: 1,
    betMode: 'animal',
    drawHistory: [],
    drawCounter: 1
};

// Elementos DOM
const elements = {
    balance: document.getElementById('player-balance'),
    currentBet: document.getElementById('current-bet'),
    betAmount: document.getElementById('bet-amount'),
    betMode: document.getElementById('bet-mode'),
    animalsGrid: document.getElementById('animals-grid'),
    numberInput: document.getElementById('number-input'),
    chosenNumber: document.getElementById('chosen-number'),
    placeBetBtn: document.getElementById('place-bet'),
    drawNumbersBtn: document.getElementById('draw-numbers'),
    gameResult: document.getElementById('game-result'),
    historyList: document.getElementById('history-list'),
    resultMilhar: document.getElementById('result-milhar'),
    resultCentena: document.getElementById('result-centena'),
    resultDezena: document.getElementById('result-dezena'),
    resultAnimal: document.getElementById('result-animal'),
    winningAnimal: document.getElementById('winning-animal')
};

// Inicialização do jogo
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();
});

function initializeGame() {
    renderAnimalsGrid();
    renderAnimalsTable();
    updateDisplay();
    updateBetMode();
    loadGameHistory();
}

function setupEventListeners() {
    // Event listeners para os controles
    elements.betAmount.addEventListener('change', (e) => {
        gameState.betAmount = parseFloat(e.target.value);
        updateCurrentBet();
    });

    elements.betMode.addEventListener('change', (e) => {
        gameState.betMode = e.target.value;
        updateBetMode();
    });

    elements.chosenNumber.addEventListener('input', (e) => {
        gameState.selectedNumber = e.target.value;
        updateCurrentBet();
    });

    elements.placeBetBtn.addEventListener('click', placeBet);
    elements.drawNumbersBtn.addEventListener('click', drawNumbers);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            drawNumbers();
        }
        if (e.code === 'Enter' && gameState.currentBet) {
            e.preventDefault();
            placeBet();
        }
    });
}

function renderAnimalsGrid() {
    elements.animalsGrid.innerHTML = '';
    
    animals.forEach(animal => {
        const animalCard = document.createElement('div');
        animalCard.className = 'animal-card';
        animalCard.dataset.animalId = animal.id;
        
        animalCard.innerHTML = `
            <span class="animal-emoji">${animal.emoji}</span>
            <div class="animal-name">${animal.name}</div>
            <div class="animal-numbers">${animal.numbers.join(', ')}</div>
        `;
        
        animalCard.addEventListener('click', () => selectAnimal(animal));
        elements.animalsGrid.appendChild(animalCard);
    });
}

function renderAnimalsTable() {
    const tableGrid = document.querySelector('.table-grid');
    tableGrid.innerHTML = '';
    
    animals.forEach(animal => {
        const tableAnimal = document.createElement('div');
        tableAnimal.className = 'table-animal';
        
        tableAnimal.innerHTML = `
            <span class="emoji">${animal.emoji}</span>
            <div class="info">
                <div class="name">${String(animal.id).padStart(2, '0')} - ${animal.name}</div>
                <div class="numbers">${animal.numbers.join(', ')}</div>
            </div>
        `;
        
        tableGrid.appendChild(tableAnimal);
    });
}

function selectAnimal(animal) {
    // Remove seleção anterior
    document.querySelectorAll('.animal-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Adiciona nova seleção
    const selectedCard = document.querySelector(`[data-animal-id="${animal.id}"]`);
    selectedCard.classList.add('selected');
    
    gameState.selectedAnimal = animal;
    updateCurrentBet();
}

function updateBetMode() {
    const isAnimalMode = gameState.betMode === 'animal';
    
    elements.animalsGrid.style.display = isAnimalMode ? 'grid' : 'none';
    elements.numberInput.style.display = isAnimalMode ? 'none' : 'block';
    
    // Reset selections
    gameState.selectedAnimal = null;
    gameState.selectedNumber = null;
    elements.chosenNumber.value = '';
    
    // Update number input constraints
    const maxValues = {
        'dezena': 99,
        'centena': 999,
        'milhar': 9999
    };
    
    if (!isAnimalMode) {
        elements.chosenNumber.max = maxValues[gameState.betMode];
        elements.chosenNumber.placeholder = `Digite de 0 a ${maxValues[gameState.betMode]}`;
    }
    
    updateCurrentBet();
}

function updateCurrentBet() {
    let betText = 'Nenhuma';
    
    if (gameState.betMode === 'animal' && gameState.selectedAnimal) {
        betText = `${gameState.selectedAnimal.name} - R$ ${gameState.betAmount.toFixed(2)}`;
    } else if (gameState.betMode !== 'animal' && gameState.selectedNumber) {
        const modeNames = {
            'dezena': 'Dezena',
            'centena': 'Centena', 
            'milhar': 'Milhar'
        };
        betText = `${modeNames[gameState.betMode]} ${gameState.selectedNumber} - R$ ${gameState.betAmount.toFixed(2)}`;
    }
    
    elements.currentBet.textContent = betText;
    
    // Enable/disable bet button
    const canBet = (gameState.betMode === 'animal' && gameState.selectedAnimal) || 
                   (gameState.betMode !== 'animal' && gameState.selectedNumber);
    
    elements.placeBetBtn.disabled = !canBet || gameState.balance < gameState.betAmount;
}

function placeBet() {
    if (gameState.balance < gameState.betAmount) {
        showMessage('Saldo insuficiente!', 'lose');
        return;
    }
    
    let betInfo;
    
    if (gameState.betMode === 'animal' && gameState.selectedAnimal) {
        betInfo = {
            type: 'animal',
            animal: gameState.selectedAnimal,
            amount: gameState.betAmount
        };
    } else if (gameState.betMode !== 'animal' && gameState.selectedNumber) {
        betInfo = {
            type: gameState.betMode,
            number: gameState.selectedNumber,
            amount: gameState.betAmount
        };
    } else {
        showMessage('Selecione sua aposta primeiro!', 'lose');
        return;
    }
    
    gameState.currentBet = betInfo;
    gameState.balance -= gameState.betAmount;
    
    updateDisplay();
    showMessage(`Aposta realizada! R$ ${gameState.betAmount.toFixed(2)}`, 'win');
    
    // Enable draw button
    elements.drawNumbersBtn.disabled = false;
    elements.placeBetBtn.disabled = true;
}

function drawNumbers() {
    if (!gameState.currentBet) {
        showMessage('Faça uma aposta primeiro!', 'lose');
        return;
    }
    
    // Generate random 4-digit number
    const drawnNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Extract parts
    const milhar = drawnNumber;
    const centena = drawnNumber.slice(-3);
    const dezena = drawnNumber.slice(-2);
    const animalNumber = parseInt(dezena);
    
    // Find corresponding animal
    let winningAnimal = null;
    for (let animal of animals) {
        if (animal.numbers.includes(dezena)) {
            winningAnimal = animal;
            break;
        }
    }
    
    // If no animal found (should not happen), use remainder
    if (!winningAnimal) {
        const animalIndex = (animalNumber % 25);
        winningAnimal = animals[animalIndex];
    }
    
    // Display results
    elements.resultMilhar.textContent = milhar;
    elements.resultCentena.textContent = centena;
    elements.resultDezena.textContent = dezena;
    elements.resultAnimal.textContent = String(winningAnimal.id).padStart(2, '0');
    
    elements.winningAnimal.innerHTML = `
        <div class="animal-display">
            <div class="animal-icon">${winningAnimal.emoji}</div>
            <div class="animal-name">${winningAnimal.name}</div>
        </div>
    `;
    
    // Check if player won
    let won = false;
    let winnings = 0;
    
    if (gameState.currentBet.type === 'animal') {
        if (gameState.currentBet.animal.id === winningAnimal.id) {
            won = true;
            winnings = gameState.currentBet.amount * 18; // 18 for 1 payout
        }
    } else if (gameState.currentBet.type === 'dezena') {
        if (gameState.currentBet.number == dezena) {
            won = true;
            winnings = gameState.currentBet.amount * 5; // 5 for 1 payout
        }
    } else if (gameState.currentBet.type === 'centena') {
        if (gameState.currentBet.number == centena) {
            won = true;
            winnings = gameState.currentBet.amount * 600; // 600 for 1 payout
        }
    } else if (gameState.currentBet.type === 'milhar') {
        if (gameState.currentBet.number == milhar) {
            won = true;
            winnings = gameState.currentBet.amount * 4000; // 4000 for 1 payout
        }
    }
    
    // Update balance and show result
    if (won) {
        gameState.balance += winnings;
        showMessage(`🎉 Parabéns! Você ganhou R$ ${winnings.toFixed(2)}!`, 'win');
    } else {
        showMessage(`😔 Você perdeu R$ ${gameState.currentBet.amount.toFixed(2)}. Tente novamente!`, 'lose');
    }
    
    // Add to history
    addToHistory(drawnNumber, winningAnimal, won, winnings);
    
    // Reset game state
    gameState.currentBet = null;
    gameState.selectedAnimal = null;
    gameState.selectedNumber = null;
    elements.chosenNumber.value = '';
    
    // Remove animal selection
    document.querySelectorAll('.animal-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Update display
    updateDisplay();
    elements.drawNumbersBtn.disabled = true;
    elements.placeBetBtn.disabled = false;
    
    // Save game state
    saveGameState();
}

function addToHistory(number, animal, won, winnings) {
    const historyItem = {
        drawNumber: gameState.drawCounter,
        number: number,
        animal: animal,
        won: won,
        winnings: winnings,
        timestamp: new Date()
    };
    
    gameState.drawHistory.unshift(historyItem);
    gameState.drawCounter++;
    
    // Keep only last 10 draws
    if (gameState.drawHistory.length > 10) {
        gameState.drawHistory.pop();
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    elements.historyList.innerHTML = '';
    
    gameState.drawHistory.forEach(item => {
        const historyElement = document.createElement('div');
        historyElement.className = 'history-item';
        
        const resultClass = item.won ? 'win' : 'lose';
        const resultText = item.won ? ` (Ganhou R$ ${item.winnings.toFixed(2)})` : ' (Perdeu)';
        
        historyElement.innerHTML = `
            <span class="draw-number">Sorteio #${String(item.drawNumber).padStart(3, '0')}</span>
            <span class="draw-result ${resultClass}">${item.number} - ${item.animal.emoji} ${item.animal.name}${resultText}</span>
        `;
        
        elements.historyList.appendChild(historyElement);
    });
}

function showMessage(message, type) {
    elements.gameResult.textContent = message;
    elements.gameResult.className = `game-result ${type}`;
    elements.gameResult.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        elements.gameResult.style.display = 'none';
    }, 5000);
}

function updateDisplay() {
    elements.balance.textContent = `R$ ${gameState.balance.toFixed(2)}`;
    updateCurrentBet();
    
    // Check for game over
    if (gameState.balance < 1) {
        showMessage('Fim de jogo! Você ficou sem dinheiro. Recarregue a página para jogar novamente.', 'lose');
        elements.placeBetBtn.disabled = true;
        elements.drawNumbersBtn.disabled = true;
    }
}

function saveGameState() {
    try {
        localStorage.setItem('jogoBichoState', JSON.stringify({
            balance: gameState.balance,
            drawHistory: gameState.drawHistory,
            drawCounter: gameState.drawCounter
        }));
    } catch (e) {
        console.log('Could not save game state');
    }
}

function loadGameHistory() {
    try {
        const saved = localStorage.getItem('jogoBichoState');
        if (saved) {
            const savedState = JSON.parse(saved);
            gameState.balance = savedState.balance || 100;
            gameState.drawHistory = savedState.drawHistory || [];
            gameState.drawCounter = savedState.drawCounter || 1;
            updateHistoryDisplay();
        }
    } catch (e) {
        console.log('Could not load game state');
    }
}

// Add some fun animations
function addDrawAnimation() {
    const numbers = [elements.resultMilhar, elements.resultCentena, elements.resultDezena, elements.resultAnimal];
    
    numbers.forEach((element, index) => {
        setTimeout(() => {
            element.style.transform = 'scale(1.2)';
            element.style.transition = 'transform 0.3s ease';
            
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }, index * 200);
    });
}

// Initialize draw button as disabled
elements.drawNumbersBtn.disabled = true;
