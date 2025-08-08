// Palavras por tema
const WORDS = {
    animais: [
        "CACHORRO", "GATO", "PASSARO", "ELEFANTE", "LEAO", "TIGRE", "GIRAFA", "ZEBRA", "MACACO", "COELHO",
        "VACA", "CAVALO", "OVELHA", "PORCO", "GALINHA", "PATO", "PERU", "RATO", "HAMSTER", "PEIXE"
    ],
    casa: [
        "MESA", "CADEIRA", "SOFA", "CAMA", "ARMARIO", "ESTANTE", "TELEVISAO", "GELADEIRA", "FOGAO", "MICROONDAS",
        "LAMPADA", "ABAJUR", "VASO", "QUADRO", "ESPELHO", "TAPETE", "CORTINA", "TRAVESSEIRO", "COBERTOR", "TOALHA"
    ],
    escola: [
        "PROFESSOR", "ALUNO", "LIVRO", "CADERNO", "LAPIS", "CANETA", "BORRACHA", "APONTADOR", "MOCHILA", "ESTOJO",
        "QUADRO", "GIZ", "MAPA", "GLOBO", "MESA", "CARTEIRA", "CADEIRA", "DIRETOR", "SECRETARIA", "BIBLIOTECA"
    ],
    frutas: [
        "MACA", "BANANA", "LARANJA", "UVA", "MORANGO", "MELANCIA", "ABACAXI", "MANGA", "PERA", "PESSEGO",
        "LIMAO", "ABACATE", "KIWI", "CEREJA", "AMORA", "FRAMBOESA", "LIMAO", "GOIABA", "MAMAO", "FIGO"
    ],
    profissoes: [
        "MEDICO", "PROFESSOR", "ENGENHEIRO", "ADVOGADO", "ARQUITETO", "ENFERMEIRO", "POLICIAL", "BOMBEIRO", "JORNALISTA", "ATOR",
        "CANTOR", "ESCRITOR", "PINTOR", "MUSICO", "COZINHEIRO", "GARCOM", "VENDEDOR", "MOTORISTA", "PILOTO", "ASTRONAUTA"
    ],
    nomes: [
        "MARIA", "JOSE", "ANTONIO", "JOAO", "FRANCISCO", "ANA", "CARLOS", "PAULO", "PEDRO", "LUCAS",
        "LUIZA", "MANOEL", "FRANCISCA", "MARCOS", "RAIMUNDO", "ADRIANA", "MARCIA", "JULIANA", "FERNANDA", "RAFAEL"
    ]
};

// Elementos do DOM
const themeButtons = document.querySelectorAll('.theme-buttons button');
const wordDisplay = document.getElementById('word-display');
const keyboard = document.getElementById('keyboard');
const hangmanImage = document.getElementById('hangman-image');
const messageElement = document.getElementById('message');
const body = document.querySelector('body');

// Elementos de áudio
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

// Variáveis do jogo
let selectedTheme = '';
let selectedWord = '';
let correctLetters = [];
let wrongLetters = [];
let gameOver = false;

// Inicializa o jogo
function initGame() {
    // Cria o teclado
    createKeyboard();
    
    // Adiciona eventos aos botões de tema
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            selectTheme(this.id);
        });
    });
}

// Cria o teclado
function createKeyboard() {
    keyboard.innerHTML = '';
    
    // Layout ABNT2
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
    ];
    
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'keyboard-row';
        
        row.forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'key';
            button.id = `key-${letter}`;
            
            // Adicionar eventos para desktop e mobile
            button.addEventListener('click', () => handleGuess(letter));
            button.addEventListener('touchstart', (e) => {
                e.preventDefault(); // Prevenir comportamentos indesejados
                handleGuess(letter);
            }, { passive: false });
            
            rowDiv.appendChild(button);
        });
        
        keyboard.appendChild(rowDiv);
    });
}

// Seleciona o tema
function selectTheme(theme) {
    // Verifica se o tema existe
    if (!WORDS[theme]) {
        console.error('Tema não existe:', theme);
        messageElement.textContent = 'Tema não encontrado!';
        return;
    }

    selectedTheme = theme;
    selectedWord = WORDS[theme][Math.floor(Math.random() * WORDS[theme].length)];
    correctLetters = [];
    wrongLetters = [];
    gameOver = false;
    
    // Atualiza o background
    const backgroundTheme = theme === 'nomes' ? 'familia' : theme;
    body.style.backgroundImage = `url('images/${backgroundTheme}.jpg')`;
    
    // Atualiza a exibição da palavra
    updateWordDisplay();
    
    // Mostra a forca inicial
    hangmanImage.style.backgroundImage = "url('images/forca1.png')";
    messageElement.textContent = '';
    messageElement.className = 'message';
    
    // Ativa todas as teclas
    document.querySelectorAll('.key').forEach(key => {
        key.disabled = false;
    });
}

// Atualiza a exibição da palavra
function updateWordDisplay() {
    wordDisplay.innerHTML = '';
    
    selectedWord.split('').forEach(letter => {
        const letterElement = document.createElement('span');
        if (letter === ' ') {
            letterElement.innerHTML = '&nbsp;';
        } else {
            letterElement.textContent = correctLetters.includes(letter) ? letter : '_';
        }
        letterElement.className = 'letter';
        wordDisplay.appendChild(letterElement);
    });
    
    // Verifica se o jogador ganhou
if (!wordDisplay.textContent.includes('_')) {
    gameOver = true;
    messageElement.textContent = 'Parabéns! Você ganhou!';
    messageElement.classList.remove('lose-message');
    messageElement.classList.add('win-message');
    winSound.play().catch(() => {}); // Ignora erros de áudio
}
}

// Processa o palpite do jogador
function handleGuess(letter) {
    if (gameOver) return;
    
    // Verifica se a tecla já foi pressionada
    const keyElement = document.getElementById(`key-${letter}`);
    if (!keyElement || keyElement.disabled) return;
    
    // Desabilita a tecla imediatamente para evitar cliques duplos
    keyElement.disabled = true;
    
    if (selectedWord.includes(letter)) {
        // Letra correta
        if (!correctLetters.includes(letter)) {
            correctLetters.push(letter);
            updateWordDisplay();
            correctSound.play().catch(() => {}); // Ignora erros de áudio
        }
    } else {
        // Letra incorreta
        if (!wrongLetters.includes(letter)) {
            wrongLetters.push(letter);
            updateHangmanImage();
            wrongSound.play().catch(() => {}); // Ignora erros de áudio
        }
    }
}

// Atualiza a imagem da forca
function updateHangmanImage() {
    const errors = wrongLetters.length;
    
    if (errors <= 6) {
        hangmanImage.style.backgroundImage = `url('images/forca${errors + 1}.png')`;
    }
    
    if (errors === 6) {
        gameOver = true;
        messageElement.textContent = 'Você perdeu!';
        messageElement.classList.add('lose-message');
        wordDisplay.textContent = selectedWord;
        loseSound.play().catch(() => {}); // Ignora erros de áudio
    }
}

// Inicia o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', initGame);

// Adiciona suporte ao teclado físico
document.addEventListener('keydown', function(event) {
    if (gameOver || !selectedWord) return;
    
    const key = event.key.toUpperCase();
    const validKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ç'];
    
    if (validKeys.includes(key)) {
        const keyElement = document.getElementById(`key-${key}`);
        if (keyElement && !keyElement.disabled) {
            handleGuess(key);
        }
    }
});