import { GrammarModule, VocabularyPack, Exercise } from './types';

export const GRAMMAR_MODULES: GrammarModule[] = [
  {
    id: 'alfabeto',
    title: "L'Alfabeto Cirillico",
    russianTitle: "Русский Алфавит",
    level: 'Base',
    description: "Impara a leggere ed a scrivere le 33 lettere dell'alfabeto cirillico russo, distinguendo tra lettere simili e lettere ingannevoli.",
    explanation: "L'alfabeto cirillico russo è composto da 33 lettere: 10 vocali (А, Е, Ё, И, Й, О, У, Ы, Э, Ю, Я), 21 consonanti e 2 segni mutevoli (il segno dolce 'ь' ed il segno duro 'ъ'). Molti credono che sia difficile, ma molte lettere assomigliano perfettamente a quelle latine, mentre altre sono 'false amiche'.\n\n- Lettere identiche all'italiano: A, K, M, O, T.\n- Lettere false amiche (stessa forma, suono diverso!): В (suona V), Е (suona IE), Н (suona N), Р (suona R), С (suona S), Х (suona KH aspirato).\n- Lettere greche o nuove chiavi: Г (G dura), Д (D), L (Л), П (P), Ф (F).\n- Caratteristiche speciali: La lettera Ы esprime un suono vocalico profondo gutturale; la lettera Ь ammorbidisce la consonante precedente.",
    examples: [
      { russian: "Да", pronunciation: "da", italian: "Sì" },
      { russian: "Нет", pronunciation: "net", italian: "No" },
      { russian: "Мама", pronunciation: "mama", italian: "Mamma" },
      { russian: "Кот", pronunciation: "kot", italian: "Gatto" },
      { russian: "Метро", pronunciation: "metro", italian: "Metropolitana" }
    ]
  },
  {
    id: 'generi',
    title: "I Generi dei Sostantivi",
    russianTitle: "Род Существительных",
    level: 'Base',
    description: "Come riconoscere se un nome è Maschile, Femminile o Neutro semplicemente osservandone la consonante o la vocale finale.",
    explanation: "In russo ci sono tre generi: Maschile, Femminile e Neutro. Non ci sono articoli (il, la, un), quindi capiamo il genere dalla desinenza e lettera finale della parola ad uno stato singolare nominativo:\n\n1. MASCHILE: Finisce per consonante dura (es. стол), per consonante dolce/segno debole (-ь) o per -й (es. музей).\n2. FEMMINILE: Finisce con la vocale -А, -Я oppure con il segno debole (-ь) (es. книга, песня, дверь).\n3. NEUTRO: Finisce con la vocale -О, -Е, -МЯ (es. окно, море, время).\n\nAttenzione: Alcune parole che indicano persone di sesso maschile finiscono in -А (es. папа - papà, дядя - zio) ma rimangono grammaticalmente maschili nei loro significati!",
    examples: [
      { russian: "Брат", pronunciation: "brat (Maschile)", italian: "Fratello" },
      { russian: "Сестра", pronunciation: "sestra (Femminile)", italian: "Sorella" },
      { russian: "Письмо", pronunciation: "pis'mo (Neutro)", italian: "Lettera" },
      { russian: "Папа", pronunciation: "papa (Maschile)", italian: "Papà" }
    ]
  },
  {
    id: 'verbo-essere',
    title: "I Pronomi e l'Omissione del Presente",
    russianTitle: "Местоимения и Глагол 'Быть'",
    level: 'Base',
    description: "Impara i pronomi personali e scopri perché il verbo 'Essere' al presente indicativo non si usa quasi mai nelle frasi quotidiane.",
    explanation: "In russo i pronomi personali sono:\n- Я (io)\n- Ты (tu)\n- Он / Она / Оно (egli / ella / esso)\n- Мы (noi)\n- Вы (voi / palese cortesia)\n- Они (essi/esse)\n\nAl presente indicativo, il verbo 'быть' (essere) viene omesso! Una frase come 'Io sono un dottore' diviene letteralmente 'Io dottore' (Я врач), e 'Questo è un libro' diviene 'Questo libro' (Это книга). Al posto del verbo essere viene talvolta inserito un trattino (-) nello scritto per legare soggetto e predicato nominale, ma non è obbligatorio nel parlato comune.",
    examples: [
      { russian: "Я итальянец", pronunciation: "ya ital'yanets", italian: "Io sono italiano" },
      { russian: "Ты студент?", pronunciation: "ty studyent?", italian: "Tu sei uno studente?" },
      { russian: "Это книга", pronunciation: "eto kniga", italian: "Questa è una guida/libro" },
      { russian: "Они дома", pronunciation: "oni doma", italian: "Essi sono a casa" }
    ]
  },
  {
    id: 'prepositivo',
    title: "Il Caso Prepositivo (Locativo)",
    russianTitle: "Предложный падеж",
    level: 'Intermedio',
    description: "Il primo dei 6 casi russi. Scopri come esprimere lo stato in luogo (dove si trova qualcosa) usando le preposizioni В e НА.",
    explanation: "La lingua russa si basa sui casi (declinazioni). Ce ne sono 6. Il Caso Prepositivo risponde principalmente alla domanda 'Где?' (Dove?) per esprimere lo stato in luogo.\n\nSi forma aggiungendo la desinenza -Е alla maggior parte dei sostantivi singolari maschili, femminili e neutri, sostituendo la vocale finale:\n- Maschili: aggiungere -Е (парк -> в парке)\n- Femminili in -А/-Я: sostituire con -Е (Италия -> in Italia = в Италии, ma школа -> в школе)\n- Neutri in -О/-Е: sostituire o mantenere con -Е (окно -> на окне)\n\nPreposizioni chiave:\n- В: si usa per spazi chiusi, città, stati, contenitori (в Риме - a Roma, в комнате - nella stanza).\n- НА: si usa per superfici piane, eventi, punti cardinali e mezzi a cielo aperto (на столе - sul tavolo, на концерте - al concerto).",
    examples: [
      { russian: "Я живу в Риме", pronunciation: "ya zhivu v Rime", italian: "Io vivo a Roma" },
      { russian: "Книга на столе", pronunciation: "kniga na stale", italian: "Il libro è sul tavolo" },
      { russian: "Отец на работе", pronunciation: "atyets na rabotye", italian: "Papà è al lavoro" },
      { russian: "Мы в школе", pronunciation: "my v shkolye", italian: "Noi siamo a scuola" }
    ]
  }
];

export const VOCABULARY_PACKS: VocabularyPack[] = [
  {
    id: 'saluti',
    category: "Saluti e Formule Comuni",
    russianCategory: "Приветствия и фразы",
    description: "Le espressioni indispensabili per iniziare una conversazione, salutare, ringraziare ed augurare una buona giornata in Russia.",
    icon: "MessageSquare",
    words: [
      { russian: "Привет", pronunciation: "pri-vyet", meaning: "Ciao (informale)", example: "Привет! Как дела?", exampleTranslation: "Ciao! Come vanno le cose?" },
      { russian: "Здравствуйте", pronunciation: "zdra-stvuy-tye", meaning: "Salve / Buongiorno (formale)", example: "Здравствуйте, профессор.", exampleTranslation: "Salve, professore." },
      { russian: "Спасибо", pronunciation: "spa-si-ba", meaning: "Grazie", example: "Большое спасибо!", exampleTranslation: "Grazie mille!" },
      { russian: "Пожалуйста", pronunciation: "pa-zha-luy-sta", meaning: "Prego / Per favore", example: "Чай, пожалуйста.", exampleTranslation: "Un tè, per favore." },
      { russian: "До свидания", pronunciation: "da svi-da-ni-ya", meaning: "Arrivederci", example: "До свидания! До завтра!", exampleTranslation: "Arrivederci! A domani!" },
      { russian: "Как дела?", pronunciation: "kak dy-la?", meaning: "Come stai? / Come va?", example: "Привет, как дела?", exampleTranslation: "Ehi, come stai?" },
      { russian: "Хорошо", pronunciation: "cha-ra-sho", meaning: "Bene", example: "У меня всё хорошо.", exampleTranslation: "A me va tutto bene." }
    ]
  },
  {
    id: 'famiglia',
    category: "La Famiglia",
    russianCategory: "Семья",
    description: "Impara i termini russi per definire i vari membri della cerchia familiare ed esprimere relazioni affettive.",
    icon: "Users",
    words: [
      { russian: "Отец", pronunciation: "a-tyets", meaning: "Padre", example: "Мой отец врач.", exampleTranslation: "Mio padre è un medico." },
      { russian: "Мать", pronunciation: "mat'", meaning: "Madre", example: "Его мать дома.", exampleTranslation: "Sua madre è a casa." },
      { russian: "Сын", pronunciation: "syn", meaning: "Figlio", example: "У них есть сын.", exampleTranslation: "Essi hanno un figlio." },
      { russian: "Дочь", pronunciation: "doch'", meaning: "Figlia", example: "Моя дочь студентка.", exampleTranslation: "Mia figlia è una studentessa." },
      { russian: "Брат", pronunciation: "brat", meaning: "Fratello", example: "У меня есть старший брат.", exampleTranslation: "Ho un fratello maggiore." },
      { russian: "Сестра", pronunciation: "sye-stra", meaning: "Sorella", example: "Твоя сестра очень умная.", exampleTranslation: "Tua sorella è molto intelligente." },
      { russian: "Семья", pronunciation: "sye-m'ya", meaning: "Famiglia", example: "Наша семья дружная.", exampleTranslation: "La nostra famiglia è unita." }
    ]
  },
  {
    id: 'citta',
    category: "In Città & Direzioni",
    russianCategory: "В городе и направления",
    description: "Trovare la strada, chiedere dov'è la metropolitana, ordinare indicazioni ed orientarsi in una metropoli russa.",
    icon: "Compass",
    words: [
      { russian: "Где...?", pronunciation: "gdye...?", meaning: "Dove...?", example: "Где здесь метро?", exampleTranslation: "Dove si trova la metropolitana qui?" },
      { russian: "Улица", pronunciation: "u-li-tsa", meaning: "Via / Strada", example: "Это тихая улица.", exampleTranslation: "Questa è una strada silenziosa." },
      { russian: "Площадь", pronunciation: "plo-shhad'", meaning: "Piazza", example: "Красная Площадь в Москве.", exampleTranslation: "La Piazza Rossa è a Mosca." },
      { russian: "Аптека", pronunciation: "ap-tye-ka", meaning: "Farmacia", example: "Где находится аптека?", exampleTranslation: "Dove si trova la farmacia?" },
      { russian: "Прямо", pronunciation: "pry-ma", meaning: "Dritto", example: "Идите прямо, потом направо.", exampleTranslation: "Andate dritto, poi a destra." },
      { russian: "Направо", pronunciation: "na-pra-va", meaning: "A destra", example: "Поверните направо.", exampleTranslation: "Giri a destra." },
      { russian: "Налево", pronunciation: "na-lye-va", meaning: "A sinistra", example: "Метро находится налево.", exampleTranslation: "La stazione è a sinistra." }
    ]
  }
];

export const PRACTICAL_EXERCISES: Exercise[] = [
  {
    id: 'ex-alfabeto-1',
    type: 'multiple-choice',
    question: "Come si legge la parola russa 'Да'?",
    options: ["Za", "Da", "Net", "Pa"],
    correctAnswer: "Da",
    hint: "La prima lettera è una Д (D) cirillica, e la seconda è una A semplice.",
    moduleLink: "alfabeto"
  },
  {
    id: 'ex-generi-1',
    type: 'multiple-choice',
    question: "Di quale genere è il sostantivo 'Письмо' (Lettera)?",
    options: ["Maschile", "Femminile", "Neutro"],
    correctAnswer: "Neutro",
    hint: "Guarda l'ultima lettera della parola. Finisce in -O.",
    moduleLink: "generi"
  },
  {
    id: 'ex-essere-1',
    type: 'fill-in-blank',
    question: "Completa la frase con il pronome corretto per dire 'Io sono italiano': '... итальянец'",
    correctAnswer: "Я",
    hint: "Ricorda la prima persona singolare in cirillico. È l'ultima lettera dell'alfabeto, a forma di R invertita.",
    moduleLink: "verbo-essere"
  },
  {
    id: 'ex-prepositivo-1',
    type: 'multiple-choice',
    question: "Qual è la forma corretta per dire 'A Roma' (Stato in luogo) sapendo che Roma si dice Рим?",
    options: ["В Рим", "В Риме", "На Риме", "В Риму"],
    correctAnswer: "В Риме",
    hint: "Il caso prepositivo richiede la preposizione 'В' per le città e la desinenza -Е.",
    moduleLink: "prepositivo"
  },
  {
    id: 'ex-saluti-1',
    type: 'translation',
    question: "Traduci la frase: 'Grazie mille!'",
    russianContext: "Большое спасибо!",
    correctAnswer: "Grazie mille",
    hint: "Большое significa 'grande', e спасибо significa 'grazie'.",
    moduleLink: "saluti"
  }
];
