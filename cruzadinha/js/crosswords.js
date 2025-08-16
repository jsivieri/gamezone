// Cruzadinhas Temáticas - Modo Fácil
const crosswordData = {
    animais: {
        name: "Animais",
        icon: "🐾",
        description: "Nossos amigos do reino animal",
        grid: [
            ["G", "A", "T", "O", "", "", ""],
            ["", "", "", "R", "", "", ""],
            ["", "", "", "O", "", "", ""],
            ["C", "A", "C", "H", "O", "R", "R"],
            ["", "", "", "", "", "", "O"],
            ["", "", "", "", "", "", ""],
            ["", "", "P", "E", "I", "X", "E"]
        ],
        words: [
            {
                word: "GATO",
                clue: "Felino doméstico que mia",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "OURO",
                clue: "Metal precioso amarelo",
                startRow: 0,
                startCol: 3,
                direction: "down",
                number: 2
            },
            {
                word: "CACHORRO",
                clue: "Melhor amigo do homem",
                startRow: 3,
                startCol: 0,
                direction: "across",
                number: 3
            },
            {
                word: "PEIXE",
                clue: "Animal aquático com escamas",
                startRow: 6,
                startCol: 2,
                direction: "across",
                number: 4
            }
        ]
    },

    cores: {
        name: "Cores",
        icon: "🌈",
        description: "O mundo colorido ao nosso redor",
        grid: [
            ["A", "Z", "U", "L", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["V", "E", "R", "D", "E", "", ""],
            ["E", "", "", "", "", "", ""],
            ["R", "", "", "", "", "", ""],
            ["M", "", "", "", "", "", ""],
            ["E", "L", "A", "R", "A", "N", "J"]
        ],
        words: [
            {
                word: "AZUL",
                clue: "Cor do céu e do mar",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "VERDE",
                clue: "Cor da grama e das folhas",
                startRow: 2,
                startCol: 0,
                direction: "across",
                number: 2
            },
            {
                word: "VERMELHO",
                clue: "Cor do sangue e do amor",
                startRow: 0,
                startCol: 0,
                direction: "down",
                number: 3
            },
            {
                word: "LARANJA",
                clue: "Cor da fruta cítrica",
                startRow: 6,
                startCol: 1,
                direction: "across",
                number: 4
            }
        ]
    },

    frutas: {
        name: "Frutas",
        icon: "🍎",
        description: "Deliciosas frutas da natureza",
        grid: [
            ["M", "A", "C", "A", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["U", "V", "A", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["B", "A", "N", "A", "N", "A", ""],
            ["", "", "", "", "", "", ""],
            ["L", "I", "M", "A", "O", "", ""]
        ],
        words: [
            {
                word: "MACA",
                clue: "Fruta vermelha que Newton descobriu",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "UVA",
                clue: "Fruta pequena que cresce em cachos",
                startRow: 2,
                startCol: 0,
                direction: "across",
                number: 2
            },
            {
                word: "BANANA",
                clue: "Fruta amarela alongada",
                startRow: 4,
                startCol: 0,
                direction: "across",
                number: 3
            },
            {
                word: "LIMAO",
                clue: "Fruta cítrica azeda e amarela",
                startRow: 6,
                startCol: 0,
                direction: "across",
                number: 4
            }
        ]
    },

    profissoes: {
        name: "Profissões",
        icon: "👨‍💼",
        description: "Diferentes trabalhos e carreiras",
        grid: [
            ["M", "E", "D", "I", "C", "O", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["P", "R", "O", "F", "E", "S", "S"],
            ["", "", "", "", "", "", "O"],
            ["", "", "", "", "", "", "R"],
            ["", "", "", "", "", "", ""]
        ],
        words: [
            {
                word: "MEDICO",
                clue: "Profissional que cuida da saúde",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "PROFESSOR",
                clue: "Quem ensina nas escolas",
                startRow: 3,
                startCol: 0,
                direction: "across",
                number: 2
            }
        ]
    },

    esportes: {
        name: "Esportes",
        icon: "⚽",
        description: "Modalidades esportivas populares",
        grid: [
            ["F", "U", "T", "E", "B", "O", "L"],
            ["", "", "", "", "", "", ""],
            ["", "", "T", "", "", "", ""],
            ["", "", "E", "", "", "", ""],
            ["", "", "N", "", "", "", ""],
            ["", "", "I", "", "", "", ""],
            ["", "", "S", "", "", "", ""]
        ],
        words: [
            {
                word: "FUTEBOL",
                clue: "Esporte mais popular do Brasil",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "TENIS",
                clue: "Esporte com raquete e bolinha",
                startRow: 2,
                startCol: 2,
                direction: "down",
                number: 2
            }
        ]
    },

    objetos: {
        name: "Objetos",
        icon: "🔧",
        description: "Coisas úteis do dia a dia",
        grid: [
            ["M", "E", "S", "A", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["C", "A", "D", "E", "I", "R", "A"],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""]
        ],
        words: [
            {
                word: "MESA",
                clue: "Móvel onde comemos",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "CADEIRA",
                clue: "Móvel para sentar",
                startRow: 2,
                startCol: 0,
                direction: "across",
                number: 2
            }
        ]
    },

    paises: {
        name: "Países",
        icon: "🌍",
        description: "Nações ao redor do mundo",
        grid: [
            ["B", "R", "A", "S", "I", "L", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["C", "H", "I", "L", "E", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""]
        ],
        words: [
            {
                word: "BRASIL",
                clue: "País onde moramos",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "CHILE",
                clue: "País vizinho longo e estreito",
                startRow: 3,
                startCol: 0,
                direction: "across",
                number: 2
            }
        ]
    },

    natureza: {
        name: "Natureza",
        icon: "🌿",
        description: "Elementos da natureza",
        grid: [
            ["A", "R", "V", "O", "R", "E", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["F", "L", "O", "R", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""],
            ["", "", "", "", "", "", ""]
        ],
        words: [
            {
                word: "ARVORE",
                clue: "Planta grande com tronco",
                startRow: 0,
                startCol: 0,
                direction: "across",
                number: 1
            },
            {
                word: "FLOR",
                clue: "Parte colorida da planta",
                startRow: 3,
                startCol: 0,
                direction: "across",
                number: 2
            }
        ]
    }
};

// Categorias disponíveis no modo fácil
const availableCategories = Object.keys(crosswordData);
