import React, { useState, useEffect, useRef } from 'react';
import { 
  GRAMMAR_MODULES, 
  VOCABULARY_PACKS, 
  PRACTICAL_EXERCISES 
} from './data';
import { 
  GrammarModule, 
  VocabularyPack, 
  Exercise, 
  ChatMessage, 
  WordItem 
} from './types';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  Video, 
  MessageSquare, 
  Compass, 
  Users, 
  Check, 
  HelpCircle, 
  Send, 
  Volume2, 
  Star, 
  Trash2, 
  Plus, 
  Award, 
  Languages, 
  Flame, 
  ChevronRight, 
  Play, 
  ArrowRight,
  Search,
  BookMarked,
  Layers,
  Sparkle
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'grammar' | 'exercises' | 'vocabulary' | 'video' | 'progress'>('dashboard');
  
  // Lesson/Course State
  const [selectedGrammar, setSelectedGrammar] = useState<GrammarModule | null>(GRAMMAR_MODULES[0]);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyPack | null>(VOCABULARY_PACKS[0]);
  
  // Custom Starred/Personal Words
  const [starredWords, setStarredWords] = useState<WordItem[]>(() => {
    const saved = localStorage.getItem('starred_russian_words');
    return saved ? JSON.parse(saved) : [];
  });

  // Exercises interaction
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswer, setExerciseAnswer] = useState('');
  const [exerciseFeedback, setExerciseFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [exerciseScore, setExerciseScore] = useState<{ score: number; total: number }>({ score: 0, total: 0 });
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  // AI Assistant Drawer / Side Panel State
  const [assistantMode, setAssistantMode] = useState<'tutor' | 'translate' | 'grammar' | 'vocabulary' | 'exercise'>('tutor');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: 'Привет! Sono il tuo assistente virtuale e tutor di russo. Posso aiutarti a tradurre parole o frasi, spiegarti le desinenze dei casi, controllare una frase scritta da te o fare simulazioni di dialogo. Scegli una modalità in basso o chiedimi qualsiasi cosa!',
        timestamp: new Date()
      }
    ];
  });
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [customWordInput, setCustomWordInput] = useState({ russian: '', pronunciation: '', meaning: '' });
  const [showAddCustomWord, setShowAddCustomWord] = useState(false);
  const [isAssistantOpenOnMobile, setIsAssistantOpenOnMobile] = useState(false);

  // Vocabulary Flip Card State
  const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});

  // --- STATI PER VIDEO E DIALOGHI PERSONALIZZATI (GESTIONE CREATOR) ---
  const [customVideos, setCustomVideos] = useState<any[]>(() => {
    const saved = localStorage.getItem('russian_custom_videos');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'vid-1',
        title: 'Alfabeto Russo e Fonetica 🇷🇺',
        description: 'La prima fondamentale lezione del corso di russo: come leggere i caratteri cirillici e pronunciarli bene.',
        url: 'https://www.youtube.com/embed/pXyJgI4L_hM'
      },
      {
        id: 'vid-2',
        title: 'I Casi del Russo (Spiegazione Facile) 📐',
        description: 'Capire le declinazioni e il senso logico del sistema dei casi russi spiegati in modo semplice.',
        url: 'https://www.youtube.com/embed/F3w2yN2FjP8'
      }
    ];
  });

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  const [customDialogues, setCustomDialogues] = useState<any[]>(() => {
    const saved = localStorage.getItem('russian_custom_dialogues');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'diag-1',
        title: 'Incontro al Caffè ☕',
        description: 'Un dialogo semplice per salutarsi, ordinare una bevanda calde e chiedere il conto.',
        lines: [
          { speaker: 'Анна (Anna)', russian: 'Привет! Рада тебя видеть.', italian: 'Ciao! Sono felice di vederti.' },
          { speaker: 'Марко (Marco)', russian: 'Привет! Как дела?', italian: 'Ciao! Come va?' },
          { speaker: 'Анна (Anna)', russian: 'Хорошо. Что ты хочешь пить?', italian: 'Bene. Cosa vuoi bere?' },
          { speaker: 'Марко (Marco)', russian: 'Я буду кофе, пожалуйста.', italian: 'Prenderò del caffè, per favore.' },
          { speaker: 'Анна (Anna)', russian: 'Отлично. Один кофе, пожалуйста.', italian: 'Eccellente. Un caffè, per favore.' }
        ]
      }
    ];
  });

  const [newDialogueTitle, setNewDialogueTitle] = useState('');
  const [newDialogueDesc, setNewDialogueDesc] = useState('');
  const [newDialogueLines, setNewDialogueLines] = useState<{ speaker: string; russian: string; italian: string }[]>([
    { speaker: 'Narratore', russian: 'Здравствуйте! Inizia inserendo una battuta.', italian: 'Fai clic sul tasto "+" in basso per aggiungere righe!' }
  ]);
  const [selectedDialogue, setSelectedDialogue] = useState<any | null>(null);

  const [showCreatorPanel, setShowCreatorPanel] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync Starred Words to LocalStorage
  useEffect(() => {
    localStorage.setItem('starred_russian_words', JSON.stringify(starredWords));
  }, [starredWords]);

  // Sync Custom Videos and Dialogues to localStorage
  useEffect(() => {
    localStorage.setItem('russian_custom_videos', JSON.stringify(customVideos));
  }, [customVideos]);

  useEffect(() => {
    localStorage.setItem('russian_custom_dialogues', JSON.stringify(customDialogues));
  }, [customDialogues]);

  // Scroll Chat to Bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech Helper
  const speakRussian = (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop currently playing
      const cleanText = text.replace(/['’`ьъ]/g, ''); // strip stress accents for cleaner pronunciation
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8; // slightly slower for learners
      window.speechSynthesis.speak(utterance);
    } else {
      alert("La sintesi vocale non è supportata dal tuo browser attuale.");
    }
  };

  // Toggle Flip Vocab Card
  const toggleFlipCard = (index: number) => {
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Toggle Star / Favorite Word
  const toggleStarWord = (word: WordItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredWords(prev => {
      const exists = prev.some(w => w.russian === word.russian);
      if (exists) {
        return prev.filter(w => w.russian !== word.russian);
      } else {
        return [...prev, word];
      }
    });
  };

  // Core Assistant API Call
  const handleSendMessage = async (customText?: string, specificMode?: typeof assistantMode) => {
    const textToSend = customText || userInput;
    if (!textToSend.trim() && !customText) return;

    const currentMode = specificMode || assistantMode;

    // Create prompt structure with mode context
    let contextStr = '';
    if (activeTab === 'grammar' && selectedGrammar) {
      contextStr += `Modulo Grammatica corrente: "${selectedGrammar.title} / ${selectedGrammar.russianTitle}". `;
    }
    if (activeTab === 'vocabulary' && selectedVocab) {
      contextStr += `Categoria Vocabolario corrente: "${selectedVocab.category}". `;
    }
    if (activeTab === 'exercises') {
      const activeEx = PRACTICAL_EXERCISES[currentExerciseIndex];
      contextStr += `Esercizio attivo: "${activeEx.question}" con corretta soluzione attesa "${activeEx.correctAnswer}". `;
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    if (!customText) setUserInput('');
    setIsAssistantLoading(true);

    try {
      // Map message history to avoid circular structure and extract text content
      const historyLog = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mode: currentMode,
          userInput: textToSend,
          context: contextStr,
          history: historyLog
        }),
      });

      if (!response.ok) {
        throw new Error('Impossibile connettersi al server del Tutor.');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.text || "Scusa, ho avuto una risposta vuota. Puoi riprovare?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: `⚠️ Errore di connessione tutor: "${err.message || 'Manca connessione internet o API non configurata'}"\n\nPuoi comunque consultare i moduli del corso offline o riprovare tra un attimo!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // Ask help directly from Grammar Module
  const askGrammarHelp = (grammar: GrammarModule) => {
    setAssistantMode('grammar');
    const prompt = `Spiegami in parole semplici l'argomento "${grammar.title}" (${grammar.russianTitle}). Quali sono le desinenze più comuni da ricordare?`;
    handleSendMessage(prompt, 'grammar');
    setIsAssistantOpenOnMobile(true);
  };

  // Grade local exercise
  const handleCheckExercise = () => {
    const currentEx = PRACTICAL_EXERCISES[currentExerciseIndex];
    const isCorrect = exerciseAnswer.trim().toLowerCase() === currentEx.correctAnswer.trim().toLowerCase();
    
    if (isCorrect) {
      setExerciseFeedback({
        isCorrect: true,
        text: "Отлично! (Eccellente!) La risposta è assolutamente corretta. Prosegui al prossimo esercizio!"
      });
      if (!completedExercises.includes(currentEx.id)) {
        setCompletedExercises(prev => [...prev, currentEx.id]);
        setExerciseScore(prev => ({ score: prev.score + 1, total: prev.total + 1 }));
      }
    } else {
      setExerciseFeedback({
        isCorrect: false,
        text: `Accidenti! Non è proprio esatto. Risposta corretta attesa: "${currentEx.correctAnswer}". Controlla il suggerimento!`
      });
      if (!completedExercises.includes(currentEx.id)) {
        setExerciseScore(prev => ({ ...prev, total: prev.total + 1 }));
      }
    }
  };

  // Ask assistent directly about active exercise
  const askExerciseHelp = (exercise: Exercise) => {
    setAssistantMode('exercise');
    const prompt = `Puoi aiutarmi con questo problema: "${exercise.question}"? Ho inserito la risposta "${exerciseAnswer || 'vuota'}" ma vorrei capire meglio la regola grammaticale passo dopo passo.`;
    handleSendMessage(prompt, 'exercise');
    setIsAssistantOpenOnMobile(true);
  };

  // Add custom word to current vocabulary
  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customWordInput.russian.trim() || !customWordInput.meaning.trim()) return;

    const newWord: WordItem = {
      russian: customWordInput.russian,
      pronunciation: customWordInput.pronunciation || customWordInput.russian,
      meaning: customWordInput.meaning,
      example: "Parola personale registrata",
      exampleTranslation: "Parola aggiunta dall'utente studente"
    };

    setStarredWords(prev => [newWord, ...prev]);
    setCustomWordInput({ russian: '', pronunciation: '', meaning: '' });
    setShowAddCustomWord(false);
  };

  // Next exercise
  const handleNextExercise = () => {
    setExerciseAnswer('');
    setExerciseFeedback(null);
    setCurrentExerciseIndex(prev => (prev + 1) % PRACTICAL_EXERCISES.length);
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF0] font-sans text-slate-900 border-t-8 border-indigo-600 flex flex-col md:flex-row shadow-sm">
      
      {/* LEFT SIDEBAR NAVIGATION - Neobrutalist design */}
      <aside className="w-full md:w-72 bg-white border-b-4 md:border-b-0 md:border-r-4 border-slate-900 flex flex-col relative z-20">
        <div className="p-6 border-b-4 border-slate-900 bg-amber-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-2xl bungee-font">Я</span>
            </div>
            <div>
              <h1 className="text-xl font-black leading-none text-slate-900 tracking-tight">CORSORUSSO</h1>
              <span className="text-xs bg-indigo-600 text-white font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                Русский Язык
              </span>
            </div>
          </div>
          
          {/* Day Streak badge */}
          <div className="flex items-center justify-between bg-orange-100 p-3 rounded-xl border-2 border-slate-900 mt-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 text-xl animate-bounce">🔥</span>
              <span className="font-bold text-sm text-slate-800">Studio Continuo</span>
            </div>
            <span className="font-extrabold text-sm text-orange-700 bg-white px-2 py-0.5 rounded border border-slate-900 font-mono">12 Giorni</span>
          </div>
        </div>

        {/* Tab Selection */}
        <nav className="flex-1 p-4 space-y-2 font-black text-slate-800">
          <button 
            id="nav-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-yellow-400 text-slate-950 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span>Studio Desk</span>
          </button>

          <button 
            id="nav-grammar"
            onClick={() => {
              setActiveTab('grammar');
              if (GRAMMAR_MODULES.length > 0 && !selectedGrammar) {
                setSelectedGrammar(GRAMMAR_MODULES[0]);
              }
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'grammar' 
                ? 'bg-sky-450 text-slate-950 bg-sky-300 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">📖</span>
            <span>Moduli Grammatica</span>
          </button>

          <button 
            id="nav-exercises"
            onClick={() => setActiveTab('exercises')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'exercises' 
                ? 'bg-emerald-300 text-slate-950 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">✏️</span>
            <span>Esercizi Pratici</span>
          </button>

          <button 
            id="nav-vocabulary"
            onClick={() => setActiveTab('vocabulary')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'vocabulary' 
                ? 'bg-pink-300 text-slate-950 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">🗂️</span>
            <span>Vocabolario</span>
          </button>

          <button 
            id="nav-video"
            onClick={() => setActiveTab('video')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'video' 
                ? 'bg-violet-300 text-slate-950 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">🎥</span>
            <span>Video & Dialoghi</span>
          </button>

          <button 
            id="nav-progress"
            onClick={() => setActiveTab('progress')}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
              activeTab === 'progress' 
                ? 'bg-red-300 text-slate-950 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1 outline-none' 
                : 'border-transparent hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span className="text-xl">📈</span>
            <span>I Miei Progressi</span>
          </button>
        </nav>

        {/* Level Stats Block */}
        <div className="p-4 border-t-2 border-slate-200 bg-slate-50">
          <div className="bg-indigo-100 p-4 rounded-xl border-2 border-slate-900">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-700">Livello Attuale</p>
            <p className="font-extrabold text-slate-900 text-base">Principiante A1</p>
            <div className="w-full bg-white h-3 rounded-full mt-2 border border-slate-900 overflow-hidden relative">
              <div 
                className="bg-green-400 h-full border-r border-slate-900 transition-all duration-500 shadow-inner"
                style={{ width: `${Math.min(100, Math.floor(((completedExercises.length + starredWords.length * 0.5) / 10) * 100))}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex justify-between">
              <span>Raggiunto {completedExercises.length} esercizi</span>
              <span>{Math.floor(((completedExercises.length + starredWords.length * 0.5) / 10) * 100)}%</span>
            </p>
          </div>
        </div>

        {/* Mobile quick-button to open ChatGPT-style Sidebar */}
        <div className="md:hidden p-4 bg-indigo-600 border-t border-indigo-700">
          <button 
            id="mobile-tutor-trigger"
            onClick={() => setIsAssistantOpenOnMobile(true)}
            className="w-full bg-yellow-300 text-black py-2.5 px-4 rounded-xl border-2 border-slate-950 font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>🤖</span>
            <span>Apri Assistente Tutor Virtuale ({messages.length})</span>
          </button>
        </div>
      </aside>

      {/* CENTER WORKSPACE - dynamically rendered based on tab */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-panel">
        
        {/* UPPER STATUS HEADER */}
        <header className="h-20 bg-white border-b-4 border-slate-900 flex items-center justify-between px-6 md:px-8 shrink-0 relative z-10">
          <div>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-black">Il tuo percorso</span>
            <h2 className="text-lg md:text-xl font-black text-slate-900">
              {activeTab === 'dashboard' && "Bentornato, Studente! 👋"}
              {activeTab === 'grammar' && "Esposizione e Regole di Russo 📖"}
              {activeTab === 'exercises' && "Esercitazione e Autocorrezione ✏_"}
              {activeTab === 'vocabulary' && "Lessico Cirillico & Flashcards 🗂_"}
              {activeTab === 'video' && "Integrazioni Video & Conversazione 🎥"}
              {activeTab === 'progress' && "Statistiche & Registro Personale 📈"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-pink-100 text-pink-700 font-extrabold text-sm px-3 py-1.5 rounded-full border-2 border-slate-900">
              <span>⭐ Preferiti</span>
              <span className="bg-white border border-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs ml-0.5">
                {starredWords.length}
              </span>
            </div>
            
            <button 
              id="header-quick-tutor"
              onClick={() => {
                setAssistantMode('tutor');
                setIsAssistantOpenOnMobile(true);
              }}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-2 border-slate-900 p-2 rounded-xl transition-all"
              title="Chiedi aiuto rapido"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </button>
          </div>
        </header>

        {/* WORKSPACE SCROLLER CONTAINER */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto" id="workspace-scroller">
          
          {/* TAB 1: STUDIO DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn" id="tab-dashboard">
              
              {/* Giant Promo Hero */}
              <div className="bg-[#fffdf5] rounded-3xl border-4 border-slate-900 p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(3,54,255,1)] relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-red-400 text-white font-extrabold text-xs px-3 py-1 rotate-6 border border-slate-900 rounded uppercase">
                  Let's start!
                </div>
                <h3 className="text-2xl md:text-4xl font-black mb-2 bungee-font tracking-tight">Поехали! (Partiamo!)</h3>
                <p className="max-w-xl text-slate-700 text-sm md:text-base leading-relaxed font-semibold">
                  Benvenuto nel tuo hub interattivo per dominare la lingua russa. Esegui esercizi intelligenti con correzione istantanea dei casi e chiedi spiegazioni strutturate al tuo tutor AI in tempo reale!
                </p>

                <div className="flex flex-wrap gap-3 mt-6">
                  <button 
                    onClick={() => {
                      setActiveTab('grammar');
                      setSelectedGrammar(GRAMMAR_MODULES[0]);
                    }}
                    className="bg-yellow-400 px-5 py-2.5 rounded-xl border-2 border-slate-900 font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-0.5 transition-all text-sm flex items-center gap-2"
                  >
                    <span>📖 Inizia dall'Alfabeto</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('exercises')}
                    className="bg-emerald-300 px-5 py-2.5 rounded-xl border-2 border-slate-900 font-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] active:translate-y-0.5 transition-all text-sm"
                  >
                    ✏️ Mettiti alla Prova
                  </button>
                </div>
              </div>

              {/* Bento Grid Info items */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Grammar Progress widget */}
                <div className="bg-sky-100 p-6 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase bg-white border border-slate-900 font-extrabold px-2 py-0.5 rounded-md inline-block mb-3">
                      Moduli Grammatica
                    </span>
                    <h4 className="font-black text-xl mb-2">Sezione Grammatica</h4>
                    <p className="text-xs text-slate-600 font-semibold mb-4">
                      Composta da {GRAMMAR_MODULES.length} moduli interattivi con esempi dotati di lettura audio vocale.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('grammar')}
                    className="w-full bg-white hover:bg-slate-50 text-slate-900 py-2 border-2 border-slate-900 rounded-xl font-black text-xs text-center"
                  >
                    Esplora Schede Regole
                  </button>
                </div>

                {/* Starred words widget */}
                <div className="bg-pink-100 p-6 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase bg-white border border-slate-900 font-extrabold px-2 py-0.5 rounded-md inline-block mb-3">
                      Scatola della memoria
                    </span>
                    <h4 className="font-black text-xl mb-2">Vocabolario Stellato</h4>
                    <p className="text-xs text-slate-600 font-semibold mb-3">
                      Hai memorizzato <strong className="text-pink-600">{starredWords.length} parole</strong> raddoppiando l’efficacia dello studio.
                    </p>
                    
                    {/* Visual miniature list */}
                    {starredWords.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 max-h-12 overflow-hidden mb-2">
                        {starredWords.slice(0, 3).map((w, i) => (
                          <span key={i} className="text-[10px] bg-white border border-slate-450 border-slate-300 font-bold px-1.5 py-0.5 rounded">
                            {w.russian}
                          </span>
                        ))}
                        {starredWords.length > 3 && <span className="text-[10px] font-black">+{starredWords.length - 3}</span>}
                      </div>
                    ) : (
                      <p className="text-[10px] italic text-slate-500 mb-2">Nessuna parola preferita. Salvale durante la memorizzazione!</p>
                    )}
                  </div>
                  <button 
                    onClick={() => setActiveTab('vocabulary')}
                    className="w-full bg-white hover:bg-slate-50 text-slate-900 py-2 border-2 border-slate-900 rounded-xl font-black text-xs text-center"
                  >
                    Apri Memorizzazione
                  </button>
                </div>

                {/* Instant Assistant Help */}
                <div className="bg-violet-100 p-6 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase bg-white border border-slate-900 font-extrabold px-2 py-0.5 rounded-md inline-block mb-3">
                      Pronto Soccorso
                    </span>
                    <h4 className="font-black text-xl mb-2">Tutor Gemini</h4>
                    <p className="text-xs text-slate-600 font-semibold mb-4">
                      Ottieni risposte immediate a traduzioni, verbi di moto e accenti russi con l'assistenza virtuale avanzata.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setAssistantMode('tutor');
                      setIsAssistantOpenOnMobile(true);
                      handleSendMessage("Ciao, vorrei fare un rapido test dei saluti base");
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 border-2 border-slate-900 rounded-xl font-black text-xs text-center shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  >
                    Avvia Chat Veloce
                  </button>
                </div>
              </div>

              {/* Course Highlights & Interactive Advice */}
              <div className="bg-emerald-50 rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-100 rounded-xl border border-slate-900 text-2xl">💡</div>
                  <div>
                    <h4 className="font-black text-lg text-slate-900 mb-1">Consiglio Estemporaneo del Giorno</h4>
                    <p className="text-sm text-slate-700 leading-relaxed font-semibold">
                      In russo non ci sono articoli (un, il, degli). Quindi per tradurre sia <span className="underline decoration-indigo-400">“la casa”</span> che <span className="underline decoration-indigo-400">“una casa”</span> useremo solo la parola <strong className="font-mono text-indigo-600">дом</strong>. Il contesto della frase risolverà ogni dubbio naturale!
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Placeholders Section - Unaltered Future Session Areas as requested */}
              <div className="border-t-2 border-slate-200 pt-6">
                <h4 className="font-black text-xl mb-4 text-slate-800">Sezioni Video e Dialogo Interattivo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-dashed border-slate-400 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-md">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-slate-900 text-2xl shadow-md mb-2">📹</div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Spazio Video Lezioni</span>
                    <span className="text-xs text-slate-500 font-bold max-w-xs mt-1">Stai lavorando sul codice? Quest'area è predisposta per accogliere i tuoi video player personalizzati, YouTube embeds o dialoghi multimediali.</span>
                  </div>

                  <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-dashed border-slate-400 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-md">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-slate-900 text-2xl shadow-md mb-2">💬</div>
                    <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Laboratorio Dialoghi Reali</span>
                    <span className="text-xs text-slate-500 font-bold max-w-xs mt-1">Area di predisposizione per dialoghi a bivio, registrazioni vocali personalizzate e file audio avanzati.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GRAMMAR MODULES */}
          {activeTab === 'grammar' && (
            <div className="space-y-6 animate-fadeIn" id="tab-grammar">
              <div className="bg-sky-100 rounded-xl border-2 border-slate-900 p-4 font-bold text-slate-800">
                🚀 Seleziona uno dei moduli grammaticali organizzati per studiare le regole ed esercitarti con accenti e pronuncia sonora.
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Modules Switcher */}
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-500">Moduli Disponibili</h3>
                  {GRAMMAR_MODULES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedGrammar(g)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex flex-col justify-between items-start gap-1 cursor-pointer ${
                        selectedGrammar?.id === g.id
                          ? 'bg-white border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] ring-2 ring-sky-300'
                          : 'bg-white/60 border-slate-200 hover:border-slate-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex justify-between w-full items-center">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border border-slate-900 ${
                          g.level === 'Base' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {g.level}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{g.russianTitle}</span>
                      </div>
                      <h4 className="font-black text-base text-slate-900 mt-1">{g.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">{g.description}</p>
                    </button>
                  ))}
                </div>

                {/* Selected Module Detail */}
                <div className="lg:col-span-8">
                  {selectedGrammar ? (
                    <div className="bg-white rounded-3xl border-4 border-slate-900 p-6 md:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6">
                      
                      {/* Title block */}
                      <div className="border-b-2 border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md border border-slate-900 font-extrabold">{selectedGrammar.level}</span>
                          <h3 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{selectedGrammar.title}</h3>
                          <p className="font-mono text-slate-500 mt-0.5 font-bold italic">{selectedGrammar.russianTitle}</p>
                        </div>
                        
                        <button 
                          onClick={() => askGrammarHelp(selectedGrammar)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] self-start md:self-center"
                        >
                          💬 Spiega al Tutor AI
                        </button>
                      </div>

                      {/* Explanation Body */}
                      <div className="text-slate-700 text-sm md:text-base leading-relaxed space-y-4 whitespace-pre-line font-medium">
                        {selectedGrammar.explanation}
                      </div>

                      {/* Interactive Pronunciations / Examples */}
                      <div className="pt-4 border-t-2 border-slate-100">
                        <h4 className="font-black text-sm uppercase text-slate-400 tracking-wider mb-3">Esempi Pratici e Audio Vocale</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedGrammar.examples.map((item, index) => (
                            <div 
                              key={index}
                              onClick={() => speakRussian(item.russian)}
                              className="p-4 rounded-xl border-2 border-slate-900 bg-amber-50/50 hover:bg-amber-50 cursor-pointer transition-all flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
                              title="Ascolta la pronuncia"
                            >
                              <div>
                                <p className="font-black text-lg text-slate-900 flex items-center gap-1.5">
                                  {item.russian}
                                  <span className="text-[11px] text-slate-400 font-normal">[{item.pronunciation}]</span>
                                </p>
                                <p className="text-xs text-slate-600 font-bold mt-1">🇮🇹 {item.italian}</p>
                              </div>

                              <button 
                                onClick={(e) => speakRussian(item.russian, e)}
                                className="p-2 bg-white rounded-lg border border-slate-300 hover:bg-blue-100 text-indigo-600"
                              >
                                <Volume2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Call to quiz */}
                      <div className="bg-yellow-100 p-4 rounded-xl border-2 border-slate-900 flex items-center justify-between flex-wrap gap-2 mt-4 shadow-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎯</span>
                          <span className="text-xs font-black text-slate-800">Sei pronto ad esercitarti su questo modulo?</span>
                        </div>
                        <button 
                          onClick={() => {
                            setActiveTab('exercises');
                            // Find matching exercise
                            const matchedExIdx = PRACTICAL_EXERCISES.findIndex(ex => ex.moduleLink === selectedGrammar.id);
                            if (matchedExIdx !== -1) {
                              setCurrentExerciseIndex(matchedExIdx);
                            }
                          }}
                          className="bg-white hover:bg-slate-50 text-slate-900 py-1.5 px-3 rounded-lg border-2 border-slate-900 text-xs font-black"
                        >
                          Vai all'Esercizio →
                        </button>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white p-12 text-center rounded-3xl border-2 border-slate-200">
                      Seleziona un modulo a sinistra per renderizzare il suo manuale didattico.
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: PRACTICAL EXERCISES */}
          {activeTab === 'exercises' && (
            <div className="space-y-6 animate-fadeIn" id="tab-exercises">
              
              {/* Score Counter Header */}
              <div className="bg-emerald-100 border-2 border-slate-900 p-4 rounded-xl flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 font-black text-emerald-800">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="text-base leading-none">Esercizi Giornalieri</h4>
                    <p className="text-[11px] font-bold text-emerald-700 mt-1">Risposte corrette in questa sessione</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white border-2 border-slate-900 px-4 py-1.5 rounded-lg font-mono font-black text-slate-800 text-sm">
                    Punteggio: {exerciseScore.score} / {exerciseScore.total} Correct
                  </div>
                  <button 
                    onClick={() => {
                      setExerciseScore({ score: 0, total: 0 });
                      setCompletedExercises([]);
                      setExerciseAnswer('');
                      setExerciseFeedback(null);
                    }}
                    className="text-xs font-bold text-red-600 underline hover:text-red-700"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Main Quiz Render */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8">
                  {PRACTICAL_EXERCISES.length > 0 ? (
                    (() => {
                      const exercise = PRACTICAL_EXERCISES[currentExerciseIndex];
                      return (
                        <div className="bg-white rounded-3xl border-4 border-slate-900 p-6 md:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)] space-y-6">
                          
                          {/* Top Meta info */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded border border-slate-900 uppercase">
                              Domanda {currentExerciseIndex + 1} di {PRACTICAL_EXERCISES.length}
                            </span>
                            
                            {exercise.moduleLink && (
                              <button 
                                onClick={() => {
                                  const mod = GRAMMAR_MODULES.find(m => m.id === exercise.moduleLink);
                                  if (mod) {
                                    setSelectedGrammar(mod);
                                    setActiveTab('grammar');
                                  }
                                }}
                                className="text-xs text-indigo-600 hover:underline font-bold"
                              >
                               Leggi Modulo Grammatica relativo 🔍
                              </button>
                            )}
                          </div>

                          {/* Question Area */}
                          <div className="space-y-3">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-snug">
                              {exercise.question}
                            </h3>
                            {exercise.russianContext && (
                              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2 flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-slate-400 font-bold uppercase">Contesto Russo</p>
                                  <p className="font-mono text-xl font-bold text-slate-800 mt-1">{exercise.russianContext}</p>
                                </div>
                                <button
                                  onClick={() => speakRussian(exercise.russianContext || '')}
                                  className="p-2.5 bg-indigo-50 border border-slate-200 hover:bg-indigo-100 text-indigo-600 rounded-lg"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Answer Area depending on Type */}
                          <div className="pt-2">
                            {exercise.type === 'multiple-choice' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="exercise-options">
                                {exercise.options?.map((option, keyIdx) => (
                                  <button
                                    key={keyIdx}
                                    onClick={() => setExerciseAnswer(option)}
                                    className={`w-full p-4 rounded-xl border-2 font-bold text-left text-sm transition-all shadow-sm ${
                                      exerciseAnswer === option 
                                        ? 'bg-amber-100 border-slate-900 ring-2 ring-amber-300' 
                                        : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="bg-slate-900 text-white w-5 h-5 inline-flex items-center justify-center rounded-full text-xs font-bold mr-3">
                                      {String.fromCharCode(65 + keyIdx)}
                                    </span>
                                    {option}
                                  </button>
                                ))}
                              </div>
                            )}

                            {exercise.type === 'fill-in-blank' && (
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase block">La tua Risposta:</label>
                                <input
                                  type="text"
                                  value={exerciseAnswer}
                                  onChange={(e) => setExerciseAnswer(e.target.value)}
                                  placeholder="Inserisci il pronome o la parola cirillica mancante..."
                                  className="w-full p-4 rounded-xl border-2 border-slate-900 placeholder-slate-400 outline-none font-bold font-mono text-lg focus:ring-2 ring-emerald-300 bg-slate-50"
                                />
                              </div>
                            )}

                            {exercise.type === 'translation' && (
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase block font-black">Traduzione Italiana:</label>
                                <input
                                  type="text"
                                  value={exerciseAnswer}
                                  onChange={(e) => setExerciseAnswer(e.target.value)}
                                  placeholder="Inserisci la traduzione italiana corretta..."
                                  className="w-full p-4 rounded-xl border-2 border-slate-900 placeholder-slate-400 outline-none font-bold text-base focus:ring-2 ring-emerald-300 bg-slate-50"
                                />
                              </div>
                            )}
                          </div>

                          {/* Interactive Hints Drawer */}
                          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                            <p className="text-xs text-orange-800 font-bold leading-relaxed flex items-center gap-1.5">
                              <span className="text-base">💡</span>
                              <span><strong>Suggerimento didattico:</strong> {exercise.hint}</span>
                            </p>
                          </div>

                          {/* Output Feedback */}
                          {exerciseFeedback && (
                            <div className={`p-4 rounded-xl border-2 ${
                              exerciseFeedback.isCorrect 
                                ? 'bg-green-100 border-green-800 text-green-900' 
                                : 'bg-red-100 border-red-800 text-red-950'
                            }`}>
                              <p className="font-extrabold text-sm flex items-center gap-2">
                                <span>{exerciseFeedback.isCorrect ? "✅ " : "❌ "}</span>
                                <span>{exerciseFeedback.text}</span>
                              </p>
                            </div>
                          )}

                          {/* Quick Actions buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            
                            <div className="flex gap-2">
                              <button
                                onClick={handleCheckExercise}
                                disabled={!exerciseAnswer.trim()}
                                className="bg-emerald-400 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl border-2 border-slate-900 font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-sm h-11"
                              >
                                Invia Risposta_
                              </button>

                              <button
                                onClick={() => askExerciseHelp(exercise)}
                                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold h-11"
                              >
                                🤖 Chiedi Correzione AI
                              </button>
                            </div>

                            <button
                              onClick={handleNextExercise}
                              className="bg-yellow-100 hover:bg-yellow-200 px-5 py-2.5 rounded-xl border-2 border-slate-900 font-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 transition-all text-sm h-11 flex items-center gap-1.5"
                            >
                              <span>Salta / Successivo</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>

                          </div>

                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center font-bold">
                      Nessun esercizio pratico caricato.
                    </div>
                  )}
                </div>

                {/* Additional Sidebar helper */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-amber-100 rounded-3xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <h4 className="font-black text-lg mb-2">💡 Cos'è l'autocorrezione?</h4>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      Scrivi liberamente la tua risposta! Se un esercizio è troppo complesso o se vuoi testare varianti alternative della traduzione russa, premi il tasto <strong>"Chiedi Correzione AI"</strong>. 
                    </p>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed mt-2 border-l-2 border-amber-400 pl-2 italic">
                      L'assistente virtuale controllerà grammatica, casi e ortografia cirillica usando Gemini.
                    </p>
                  </div>

                  <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
                    <h5 className="font-black text-xs text-slate-500 uppercase mb-2">Compiti Completati</h5>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {PRACTICAL_EXERCISES.map((ex, i) => (
                        <div key={ex.id} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <span className={completedExercises.includes(ex.id) ? 'text-green-600 font-bold' : 'text-slate-400'}>
                            {completedExercises.includes(ex.id) ? '●' : '○'}
                          </span>
                          <span className="font-mono">Esercizio {i + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: VOCABULARY PACKS & FLASHCARDS */}
          {activeTab === 'vocabulary' && (
            <div className="space-y-6 animate-fadeIn" id="tab-vocabulary">
              
              <div className="bg-pink-100 p-4 rounded-xl border-2 border-slate-900 font-bold text-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span>⚡ Esplora le flashcards interattive. Clicca sulla carta per scoprire la traduzione, l'esempio ed ascoltare la pronuncia autentica!</span>
                <button 
                  onClick={() => setShowAddCustomWord(!showAddCustomWord)}
                  className="bg-white hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-900 font-black text-xs shrink-0 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nuova Parola</span>
                </button>
              </div>

              {/* Add Custom Word Form */}
              {showAddCustomWord && (
                <form 
                  onSubmit={handleAddCustomWord}
                  className="bg-[#fffdf5] rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] max-w-xl animate-fadeIn"
                >
                  <h4 className="font-black text-base mb-4 flex items-center justify-between">
                    <span>Aggiungi Parola Personalizzata</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddCustomWord(false)} 
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Annulla
                    </button>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Russo (Cirillico)*</label>
                      <input 
                        type="text" 
                        required
                        value={customWordInput.russian}
                        onChange={(e) => setCustomWordInput(prev => ({ ...prev, russian: e.target.value }))}
                        className="w-full p-2 border-2 border-slate-900 rounded-lg text-sm bg-white font-mono font-bold" 
                        placeholder="es. Кошка" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Pronuncia figurata</label>
                      <input 
                        type="text" 
                        value={customWordInput.pronunciation}
                        onChange={(e) => setCustomWordInput(prev => ({ ...prev, pronunciation: e.target.value }))}
                        className="w-full p-2 border-2 border-slate-900 rounded-lg text-sm bg-white" 
                        placeholder="es. kòshka" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Significato Italiano*</label>
                      <input 
                        type="text" 
                        required
                        value={customWordInput.meaning}
                        onChange={(e) => setCustomWordInput(prev => ({ ...prev, meaning: e.target.value }))}
                        className="w-full p-2 border-2 border-slate-900 rounded-lg text-sm bg-white font-medium" 
                        placeholder="es. Gatto (femmina)" 
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="mt-4 bg-emerald-300 hover:bg-emerald-400 border border-slate-900 px-4 py-2 rounded-lg font-black text-xs"
                  >
                    Salva nel Mio Dizionario 💾
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Vocabulary Categories index */}
                <div className="lg:col-span-3 space-y-3">
                  <h3 className="font-black text-sm uppercase tracking-wider text-slate-500">Mazzi delle Categorie</h3>
                  {VOCABULARY_PACKS.map((pack) => (
                    <button
                      key={pack.id}
                      onClick={() => setSelectedVocab(pack)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                        selectedVocab?.id === pack.id
                          ? 'bg-white border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] ring-2 ring-pink-300'
                          : 'bg-white/60 border-slate-200 hover:border-slate-400 hover:bg-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">
                          {pack.russianCategory}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">{pack.category}</h4>
                        <span className="text-[10px] text-pink-600 font-bold mt-1 inline-block">
                          {pack.words.length} vocaboli
                        </span>
                      </div>
                      <span className="text-xl shrink-0">📁</span>
                    </button>
                  ))}

                  {/* Starred words index shortcut */}
                  <button
                    onClick={() => {
                      setSelectedVocab(null);
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      selectedVocab === null
                        ? 'bg-white border-slate-900 shadow-[4px_4px_0px_rgba(0,0,0,1)] ring-2 ring-pink-300'
                        : 'bg-white/60 border-slate-200 hover:border-slate-400 hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-pink-600 font-extrabold block">
                        Dizionario Personale
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate mt-0.5">⭐ Parole Preferite</h4>
                      <span className="text-[10px] text-slate-500 font-bold mt-1 inline-block">
                        {starredWords.length} vocaboli speciali
                      </span>
                    </div>
                    <span className="text-xl shrink-0 text-pink-500">★</span>
                  </button>
                </div>

                {/* Selected Pack Words Grid */}
                <div className="lg:col-span-9 space-y-6">
                  
                  {/* Category description */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h3 className="font-black text-lg md:text-xl text-slate-900">
                        {selectedVocab ? selectedVocab.category : "Mazzo delle Parole Preferite (Dizionario Personale)"}
                      </h3>
                      <p className="text-xs text-slate-500 font-bold">
                        {selectedVocab 
                          ? selectedVocab.description 
                          : "Qui risiedono tutti i vocaboli che hai contrassegnato con la stella e quelli inseriti manualmente da te. Perfetto per il ripasso mirato!"}
                      </p>
                    </div>

                    {selectedVocab && (
                      <button 
                        onClick={() => {
                          setAssistantMode('vocabulary');
                          const names = selectedVocab.words.map(w => w.russian).slice(0, 5).join(', ');
                          handleSendMessage(`Dammi altre 5 parole pertinenti sul tema "${selectedVocab.category}" oltre a ${names}, indicandone la traduzione e un esempio`, 'vocabulary');
                          setIsAssistantOpenOnMobile(true);
                        }}
                        className="bg-indigo-600 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-lg border border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      >
                        🤖 Richiedi Altre Parole AI
                      </button>
                    )}
                  </div>

                  {/* Flashcards rendering */}
                  {(() => {
                    const activeWordsList = selectedVocab ? selectedVocab.words : starredWords;
                    if (activeWordsList.length === 0) {
                      return (
                        <div className="bg-white/80 p-12 text-center rounded-2xl border-2 border-dashed border-slate-300">
                          <p className="font-extrabold text-slate-600">Nessuna parola presente in questo elenco.</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                            {selectedVocab 
                              ? "Nessun vocabolo caricato." 
                              : "Premi la stella ★ accanto alle parole delle categorie ufficiali per raccoglierle qui, oppure aggiungi una parola nuova premendo il tasto in alto!"}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" id="vocabulary-cards">
                        {activeWordsList.map((word, cardIdx) => {
                          const isFlipped = !!flippedCards[cardIdx];
                          return (
                            <div 
                              key={cardIdx}
                              onClick={() => toggleFlipCard(cardIdx)}
                              className="w-full h-52 relative perspective cursor-pointer"
                              title="Clicca per girare"
                            >
                              {/* INNER FLIP CARD BOX */}
                              <div className={`w-full h-full relative duration-500 preserve-3d transition-transform ${
                                isFlipped ? 'rotate-y-180' : ''
                              }`}>
                                
                                {/* FRONT FACE: Russian Text */}
                                <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                  <div className="flex justify-between items-start">
                                    <button
                                      onClick={(e) => speakRussian(word.russian, e)}
                                      className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-indigo-600 hover:bg-slate-100"
                                      title="Ascolta sintesi"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      onClick={(e) => toggleStarWord(word, e)}
                                      className="p-1.5 hover:bg-slate-100 rounded-full"
                                      title="Aggiungi ai preferiti"
                                    >
                                      <span className={`text-xl ${starredWords.some(w => w.russian === word.russian) ? 'text-amber-500' : 'text-slate-300'}`}>
                                        ★
                                      </span>
                                    </button>
                                  </div>

                                  <div className="text-center my-auto">
                                    <p className="bungee-font text-2xl font-black text-indigo-600 leading-tight">
                                      {word.russian}
                                    </p>
                                    <p className="text-xs font-bold text-slate-400 mt-1">
                                      /{word.pronunciation}/
                                    </p>
                                  </div>

                                  <div className="text-right text-[10px] text-slate-400 font-bold uppercase select-none">
                                    Svela traduzione ↻
                                  </div>
                                </div>

                                {/* BACK FACE: Italian Text */}
                                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-pink-50 border-2 border-slate-900 rounded-xl p-4 flex flex-col justify-between shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                                  <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-extrabold uppercase bg-white px-2 py-0.5 rounded border border-slate-900">
                                      Significato
                                    </span>
                                    <button
                                      onClick={(e) => speakRussian(word.russian, e)}
                                      className="p-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600"
                                    >
                                      <Volume2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="text-center mt-2 -mb-2">
                                    <p className="font-sans font-black text-lg text-slate-900 leading-tight">
                                      {word.meaning}
                                    </p>
                                  </div>

                                  {word.example && word.example !== "Parola personale registrata" ? (
                                    <div className="bg-white/70 p-1.5 rounded text-[10px] border border-slate-200 text-left mt-2 overflow-hidden max-h-16 overflow-y-auto">
                                      <p className="font-bold text-slate-800">{word.example}</p>
                                      <p className="italic text-slate-500 font-medium ">{word.exampleTranslation}</p>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] italic text-center p-1.5 text-slate-400">
                                      Nessuna frase memorizzata
                                    </div>
                                  )}

                                  <div className="text-right text-[10px] text-slate-400 font-bold uppercase select-none">
                                    Regredisci ↺
                                  </div>
                                </div>

                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                </div>

              </div>

            </div>
          )}
                                           {/* TAB 5: VIDEO & DIALOGUES - Hub Interattivo e Pannello Creatore Autonomo */}
          {activeTab === 'video' && (
            <div className="space-y-6 animate-fadeIn" id="tab-video">
              
              {/* Header con spiegazione */}
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-6 rounded-3xl border-4 border-slate-900 shadow-[6px_6px_0px_rgba(3,54,255,1)] relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-yellow-300 text-slate-950 font-extrabold text-[10px] px-3 py-1 rotate-3 border border-slate-900 rounded uppercase">
                  Libertà Totale
                </div>
                <h3 className="bungee-font text-xl md:text-3xl font-black mb-1.5 text-slate-900">🎬 Hub Multimediale & Dialoghi</h3>
                <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed max-w-3xl">
                  Sei completamente libera di arricchire l'app! Puoi inserire i tuoi video (collegando video YouTube o file MP4) e strutturare i tuoi dialoghi interattivi dal vivo. Usa il <strong>Pannello Creatore</strong> in basso per aggiungere istantaneamente i tuoi contenuti!
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowCreatorPanel(!showCreatorPanel)}
                    className="bg-yellow-300 hover:bg-yellow-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-[1px_1px_0px_rgba(0,0,0,1)] transition-all flex items-center gap-1.5"
                  >
                    <span>{showCreatorPanel ? '✕ Chiudi Pannello Creatore' : '⚙️ Apri Pannello Creatore'}</span>
                  </button>
                </div>
              </div>

              {/* PANNELLO CREATORE INTERATTIVO DI CONTENUTI */}
              {showCreatorPanel && (
                <div className="bg-[#fffdf5] rounded-3xl border-4 border-slate-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6 animate-fadeIn">
                  <div className="border-b-2 border-slate-200 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-indigo-600 uppercase tracking-wider">Pannello Creatore Locale</h4>
                      <h3 className="font-black text-lg md:text-xl text-slate-900">Aggiungi i tuoi Video e Dialoghi 📝</h3>
                    </div>
                    <span className="text-[10px] bg-slate-100 border border-slate-900 px-2 py-0.5 rounded font-bold">Stato: Attivo in LocalStorage</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* MODULO 1: AGGIUNGI VIDEO */}
                    <div className="bg-sky-50 rounded-2xl border-2 border-slate-900 p-4 space-y-3">
                      <h5 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <span>🎥</span> Aggiungi un Video Lezione
                      </h5>
                      <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                        Incolla un URL di un video. Puoi usare file MP4 diretti o video YouTube nel formato embed (es: <code className="bg-sky-100 text-sky-850 px-1 py-0.5 rounded">https://www.youtube.com/embed/CODICE</code>) per vederlo riprodotto direttamente.
                      </p>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-black text-slate-700 mb-1">Titolo Video:</label>
                          <input 
                            type="text" 
                            placeholder="Es: Alfabeto Russo ed Esercizi di Pronuncia" 
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 font-bold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-black text-slate-700 mb-1">Descrizione:</label>
                          <input 
                            type="text" 
                            placeholder="Frase riassuntiva sul contenuto del video..." 
                            value={newVideoDesc}
                            onChange={(e) => setNewVideoDesc(e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 font-bold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-black text-slate-700 mb-1">URL (YouTube Embed o MP4):</label>
                          <input 
                            type="text" 
                            placeholder="Es: https://www.youtube.com/embed/g6jcoL8mIic" 
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 font-mono font-bold outline-none text-[11px]"
                          />
                        </div>

                        <button
                          onClick={() => {
                            if (!newVideoTitle.trim() || !newVideoUrl.trim()) {
                              alert("Inserisci almeno un titolo e un URL valido per il video.");
                              return;
                            }
                            const newVideo = {
                              id: 'vid-custom-' + Date.now(),
                              title: newVideoTitle,
                              description: newVideoDesc || 'Nessuna descrizione specificata.',
                              url: newVideoUrl
                            };
                            setCustomVideos([...customVideos, newVideo]);
                            setNewVideoTitle('');
                            setNewVideoDesc('');
                            setNewVideoUrl('');
                            setSelectedVideo(newVideo);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold p-2 rounded-lg border border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-[11px]"
                        >
                          Salva e Aggiungi Video ➕
                        </button>
                      </div>
                    </div>

                    {/* MODULO 2: AGGIUNGI DIALOGO */}
                    <div className="bg-pink-50 rounded-2xl border-2 border-slate-900 p-4 space-y-3">
                      <h5 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <span>🗣️</span> Crea un Dialogo Interattivo
                      </h5>
                      <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                        Definisci i personaggi e le battute in russo e italiano. Ogni battuta potrà essere riprodotta con la sintesi vocale!
                      </p>

                      <div className="space-y-2 text-xs">
                        <div>
                          <label className="block font-black text-slate-700 mb-1">Titolo Dialogo:</label>
                          <input 
                            type="text" 
                            placeholder="Es: Al Negozio di Souvenir" 
                            value={newDialogueTitle}
                            onChange={(e) => setNewDialogueTitle(e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 font-bold outline-none"
                          />
                        </div>

                        <div>
                          <label className="block font-black text-slate-700 mb-1">Descrizione:</label>
                          <input 
                            type="text" 
                            placeholder="Es: Chiedere il prezzo di una Matrioska..." 
                            value={newDialogueDesc}
                            onChange={(e) => setNewDialogueDesc(e.target.value)}
                            className="w-full bg-white border-2 border-slate-900 rounded-lg p-2 font-bold outline-none"
                          />
                        </div>

                        {/* Lines Editor */}
                        <div className="space-y-2 border-t border-slate-200 pt-2 max-h-36 overflow-y-auto pr-1">
                          <label className="block font-black text-slate-700 text-[10px] uppercase">Battute ({newDialogueLines.length}):</label>
                          {newDialogueLines.map((line, idx) => (
                            <div key={idx} className="bg-white p-2 rounded-lg border border-slate-300 space-y-1.5 relative">
                              <button 
                                onClick={() => {
                                  if (newDialogueLines.length <= 1) return;
                                  setNewDialogueLines(newDialogueLines.filter((_, i) => i !== idx));
                                }}
                                className="absolute right-1 top-1 text-red-500 font-bold hover:text-red-700 text-[10px] px-1"
                                title="Rimuovi riga"
                              >
                                ✕
                              </button>
                              
                              <div className="grid grid-cols-3 gap-1">
                                <input 
                                  type="text" 
                                  placeholder="Chi parla?" 
                                  value={line.speaker}
                                  onChange={(e) => {
                                    const next = [...newDialogueLines];
                                    next[idx].speaker = e.target.value;
                                    setNewDialogueLines(next);
                                  }}
                                  className="border border-slate-300 p-1 rounded font-bold text-[10px]"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Russo (Es: Как дела?)" 
                                  value={line.russian}
                                  onChange={(e) => {
                                    const next = [...newDialogueLines];
                                    next[idx].russian = e.target.value;
                                    setNewDialogueLines(next);
                                  }}
                                  className="border border-slate-300 p-1 rounded font-mono text-[10px] col-span-2"
                                />
                              </div>
                              <input 
                                type="text" 
                                placeholder="Traduzione Italiana (Es: Come va?)" 
                                value={line.italian}
                                onChange={(e) => {
                                  const next = [...newDialogueLines];
                                  next[idx].italian = e.target.value;
                                  setNewDialogueLines(next);
                                }}
                                className="w-full border border-slate-300 p-1 rounded text-[10px]"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewDialogueLines([...newDialogueLines, { speaker: '', russian: '', italian: '' }]);
                            }}
                            className="bg-white hover:bg-slate-50 border border-slate-900 border-dashed text-slate-800 p-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 flex-1"
                          >
                            <span>➕ Aggiungi battuta</span>
                          </button>

                          <button
                            onClick={() => {
                              if (!newDialogueTitle.trim() || newDialogueLines.some(l => !l.russian.trim())) {
                                alert("Inserisci un titolo e definisci il russo per tutte le battute.");
                                return;
                              }
                              const newDiag = {
                                id: 'diag-custom-' + Date.now(),
                                title: newDialogueTitle,
                                description: newDialogueDesc || 'Nessuna descrizione.',
                                lines: newDialogueLines
                              };
                              setCustomDialogues([...customDialogues, newDiag]);
                              setNewDialogueTitle('');
                              setNewDialogueDesc('');
                              setNewDialogueLines([{ speaker: 'Masha', russian: 'Привет!', italian: 'Ciao!' }]);
                              setSelectedDialogue(newDiag);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-3 py-1.5 rounded-lg border border-slate-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] text-[10px]"
                          >
                            Salva Dialogo 💾
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Informazioni educative sull'allungamento definitivo delle lezioni */}
                  <div className="bg-yellow-50 p-4 rounded-xl border-2 border-slate-900 text-xs font-semibold leading-relaxed text-slate-800 space-y-2">
                    <p className="font-extrabold flex items-center gap-1.5">
                      <span>💡</span> Come rendere permanenti i tuoi video e dialoghi nel codice sorgente:
                    </p>
                    <p>
                      I dati aggiunti sopra si salvano istantaneamente nel tuo browser attuale (grazie al <code className="bg-yellow-150 p-0.5 rounded">localStorage</code>). Se vuoi memorizzarli in modo che chiunque usi l'app veda i tuoi video/dialoghi di default, ti basta semplicemente modificare il file <strong className="font-mono text-indigo-700">src/data.ts</strong>!
                    </p>
                    <p className="text-[10px] bg-white border border-slate-200 p-2 rounded-lg font-mono text-slate-500 overflow-x-auto select-all">
                      {`// Esempio per inserire un dialogo reale in data.ts:
export const CUSTOM_DIALOGUES = [
  {
    id: "diag-mio",
    title: "Mio Dialogo personalizzato",
    lines: [
      { speaker: "Prof", russian: "Как вас зовут?", italian: "Come vi chiamate?" }
    ]
  }
];`}
                    </p>
                  </div>
                </div>
              )}

              {/* AREA PRINCIPALE: PLAYER VIDEO E SELETTORE MULTIMEDIALE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLONNA SINISTRA: SELETTORE VIDEO E RIPRODUTTORE */}
                <div className="lg:col-span-6 space-y-6">
                  
                  <div className="bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[5px_5px_0px_rgba(0,0,0,1)] space-y-4">
                    <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
                      <h4 className="font-black text-lg flex items-center gap-1.5">
                        <span>🎥</span> Video Lezioni {customVideos.length > 0 && `(${customVideos.length})`}
                      </h4>
                      <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded border border-slate-900 font-extrabold">FONETICA & CASI</span>
                    </div>

                    <p className="text-xs text-slate-500 font-bold">
                      Riproduci i video educativi sull'alfabeto, le regole degli accenti russi o aggiungi i tuoi video personali per studiare al meglio!
                    </p>

                    {/* Elenco dei video disponibili */}
                    <div className="space-y-2.5 max-h-55 overflow-y-auto pr-1">
                      {customVideos.map((video) => (
                        <div 
                          key={video.id}
                          onClick={() => setSelectedVideo(video)}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            selectedVideo?.id === video.id 
                              ? 'bg-amber-50 border-slate-900 ring-2 ring-amber-300 shadow-sm' 
                              : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 hover:border-slate-450'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-black text-sm text-slate-800 block truncate">{video.title}</span>
                            <span className="text-[11px] text-slate-500 font-bold line-clamp-1 mt-0.5">{video.description}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {/* Delete custom videos button */}
                            {video.id.startsWith('vid-custom-') && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCustomVideos(customVideos.filter(v => v.id !== video.id));
                                  if (selectedVideo?.id === video.id) setSelectedVideo(null);
                                }}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                title="Rimuovi video"
                              >
                                ✕
                              </button>
                            )}
                            <span className="text-indigo-600 bg-white border border-slate-200 p-1.5 rounded-lg border-2 border-slate-900 shadow">
                              <Play className="w-3 h-3 fill-current" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Player Video Dinamico */}
                    <div className="pt-2">
                      {selectedVideo || customVideos.length > 0 ? (
                        (() => {
                          const activeVideo = selectedVideo || customVideos[0];
                          const isYoutube = activeVideo.url.includes('youtube.com') || activeVideo.url.includes('youtu.be');
                          
                          return (
                            <div className="space-y-2">
                              <div className="aspect-video bg-black rounded-2xl border-2 border-slate-900 overflow-hidden relative shadow-md">
                                {isYoutube ? (
                                  <iframe 
                                    className="w-full h-full"
                                    src={activeVideo.url}
                                    title={activeVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                    allowFullScreen
                                  ></iframe>
                                ) : (
                                  <video 
                                    className="w-full h-full object-cover" 
                                    src={activeVideo.url} 
                                    controls
                                    referrerPolicy="no-referrer"
                                  >
                                    Il tuo browser non supporta la riproduzione video diretta.
                                  </video>
                                )}
                              </div>
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <span className="text-[10px] font-black uppercase text-slate-400">In Riproduzione:</span>
                                <h5 className="font-extrabold text-sm text-slate-800 leading-tight mt-0.5">{activeVideo.title}</h5>
                                <p className="text-xs text-slate-600 mt-1">{activeVideo.description}</p>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-350 flex items-center justify-center text-center p-4">
                          <p className="text-xs text-slate-400 font-bold">Nessun video registrato nell'hub. Creane uno tramite il Pannello Creatore in alto!</p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

                {/* COLONNA DESTRA: SELETTORE DIALOGHI E LETTORE RIGHE INTERATTIVO */}
                <div className="lg:col-span-6 space-y-6">
                  
                  <div className="bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-[5px_5px_0px_rgba(0,0,0,1)] space-y-4">
                    <div className="flex justify-between items-center border-b-2 border-slate-100 pb-2">
                      <h4 className="font-black text-lg flex items-center gap-1.5">
                        <span>🗣️</span> Dialoghi Interattivi At1 {customDialogues.length > 0 && `(${customDialogues.length})`}
                      </h4>
                      <span className="text-[10px] bg-pink-100 text-pink-800 px-2 py-0.5 rounded border border-slate-900 font-extrabold">PRONUNCIA CLICCABILE</span>
                    </div>

                    <p className="text-xs text-slate-500 font-bold">
                      Fai clic su un dialogo per aprirlo. All'interno, potrai cliccare su ogni singola battuta per ascoltarne la sintesi vocale ed apprendere l'intonazione corretta dei saluti e delle richieste!
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {customDialogues.map((dialogue) => (
                        <button
                          key={dialogue.id}
                          onClick={() => setSelectedDialogue(dialogue)}
                          className={`text-xs px-3.5 py-2 rounded-xl border-2 font-black transition-all ${
                            (selectedDialogue?.id === dialogue.id || (!selectedDialogue && customDialogues[0]?.id === dialogue.id))
                              ? 'bg-pink-100 text-pink-900 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {dialogue.title}
                        </button>
                      ))}
                    </div>

                    {/* Lettore di Dialoghi Attivo */}
                    <div className="border-t-2 border-slate-100 pt-4">
                      {(() => {
                        const activeDialogue = selectedDialogue || customDialogues[0];
                        if (!activeDialogue) {
                          return (
                            <p className="text-xs text-slate-400 italic text-center">Nessun dialogo disponibile. Creane uno per iniziare a fare pratica!</p>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h5 className="font-extrabold text-slate-900 text-base">{activeDialogue.title}</h5>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">{activeDialogue.description}</p>
                              </div>

                              {activeDialogue.id.startsWith('diag-custom-') && (
                                <button
                                  onClick={() => {
                                    setCustomDialogues(customDialogues.filter(d => d.id !== activeDialogue.id));
                                    setSelectedDialogue(null);
                                  }}
                                  className="text-xs bg-red-100 text-red-600 border border-slate-350 font-bold px-2 py-1 rounded hover:bg-red-200"
                                >
                                  Elimina Dialogo ✕
                                </button>
                              )}
                            </div>

                            {/* Spazio battute */}
                            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border-2 border-slate-900 max-h-80 overflow-y-auto" id="dialogue-lines-container">
                              <p className="text-[10px] text-indigo-600 font-bold uppercase select-none text-center mb-2">👇 Fai clic sulle battute per ascoltare la pronuncia della voce russa</p>
                              
                              {activeDialogue.lines.map((line: any, idx: number) => (
                                <div 
                                  key={idx}
                                  onClick={() => speakRussian(line.russian)}
                                  className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer transition-all shadow-sm flex items-start gap-3 relative group"
                                >
                                  <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-xs font-black text-indigo-700 flex items-center justify-center border border-indigo-200 uppercase">
                                    {line.speaker.slice(0, 2)}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-xs text-slate-500 uppercase">{line.speaker}</span>
                                      <span className="font-mono text-[9px] bg-slate-100 px-1 py-0.2 rounded text-slate-300">Clicca per audio 🔊</span>
                                    </div>
                                    <p className="font-sans font-extrabold text-slate-900 mt-1 leading-snug break-words pr-2 text-sm">
                                      {line.russian}
                                    </p>
                                    <p className="text-xs italic text-slate-500 font-medium mt-0.5">🇮🇹 {line.italian}</p>
                                  </div>

                                  <button 
                                    className="opacity-40 group-hover:opacity-100 text-indigo-600 p-1 self-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speakRussian(line.russian);
                                    }}
                                  >
                                    <Volume2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="bg-yellow-50 p-3.5 rounded-xl border border-slate-200 text-xs text-amber-800 leading-relaxed font-bold">
                              📖 <strong>Allenamento Consigliato:</strong> Seleziona una battuta del dialogo, ascolta attentamente, poi ripetila ad alta voce registrandoti o prova a scriverla nella chat con il tutor AI a destra impostando la modalità <strong>Conversazione</strong> per scoprirne le sfumature!
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {/* TAB 6: STATS & PROGRESS RECORD */}
          {activeTab === 'progress' && (
            <div className="space-y-6 animate-fadeIn" id="tab-progress">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center">
                  <p className="text-2xl">🔥</p>
                  <h4 className="font-black text-2xl mt-2">12</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Giorni di Studio</p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center">
                  <p className="text-2xl font-black text-indigo-600">Я</p>
                  <h4 className="font-black text-2xl mt-1">{completedExercises.length}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Esercizi Risolti</p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-center">
                  <p className="text-2xl">⭐</p>
                  <h4 className="font-black text-2xl mt-1">{starredWords.length}</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">Parole Salvate</p>
                </div>

              </div>

              {/* Graphical simulation of study status */}
              <div className="bg-white rounded-3xl border-4 border-slate-900 p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-4">
                <h4 className="font-black text-lg">📊 Panoramica Didattica</h4>
                <p className="text-xs text-slate-500 font-bold">
                  La tua costanza determina la velocità di sblocco delle certificazioni provvisorie del corso A1-A2.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Riconoscimento suoni & Alfabeto Cirillico</span>
                      <span>100% Sbloccato</span>
                    </div>
                    <div className="bg-slate-100 h-3 rounded-full border border-slate-900 overflow-hidden">
                      <div className="bg-green-400 h-full w-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Generi dei Sostantivi</span>
                      <span>80% Studio terminato</span>
                    </div>
                    <div className="bg-slate-100 h-3 rounded-full border border-slate-900 overflow-hidden">
                      <div className="bg-emerald-350 bg-green-300 h-full w-4/5"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Caso Prepositivo e Declinazioni</span>
                      <span>{completedExercises.includes('ex-prepositivo-1') ? '100%' : '20% Iniziato'}</span>
                    </div>
                    <div className="bg-slate-100 h-3 rounded-full border border-slate-900 overflow-hidden">
                      <div className="bg-emerald-300 h-full transition-all" style={{ width: completedExercises.includes('ex-prepositivo-1') ? '100%' : '20%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-950 mt-4 leading-relaxed">
                  🏆 Continua così! Per completare la base grammaticale ti basta completare i moduli grammaticali restanti e sottoporli ed esercitarli con l'assistenza virtuale del tutor.
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* AI VIRTUAL ASSISTANT SIDEBAR - Neobrutalist design */}
      <aside className={`w-full md:w-[350px] lg:w-[400px] bg-indigo-600 border-t-4 md:border-t-0 md:border-l-4 border-slate-900 flex flex-col text-white shadow-[-10px_0px_30px_rgba(0,0,0,0.15)] relative z-30 shrink-0 ${
        isAssistantOpenOnMobile ? 'fixed inset-0 min-h-screen z-50 md:relative md:inset-auto md:min-h-0' : 'hidden md:flex'
      }`}>
        
        {/* Tutor Header */}
        <div className="p-4 md:p-6 border-b-4 border-slate-900 bg-indigo-700 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-2xl shrink-0">
                🤖
              </div>
              <div>
                <h3 className="font-black text-base text-white leading-tight">Tutor Virtuale</h3>
                <span className="text-[10px] text-indigo-200 font-extrabold uppercase tracking-widest">Alimentato da Gemini</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
              {/* Close button on mobile overlay */}
              <button 
                id="close-tutor-mobile"
                onClick={() => setIsAssistantOpenOnMobile(false)}
                className="md:hidden bg-indigo-800 text-white p-1 rounded-lg border border-indigo-400 text-xs font-bold"
              >
                Chiudi ✕
              </button>
            </div>
          </div>

          <p className="text-[11px] text-indigo-150 text-indigo-200 mt-3 font-semibold leading-normal">
            Traduci frasi, comprendi verbi ed accenti ed ottieni spiegazioni grammaticali precise con tabelle comparative.
          </p>
        </div>

        {/* Mode Selector Panel for chatbot */}
        <div className="bg-indigo-850 p-3 bg-indigo-900 border-b-2 border-slate-900 flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setAssistantMode('tutor')}
            className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
              assistantMode === 'tutor' 
                ? 'bg-yellow-300 text-black border-slate-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] font-black' 
                : 'bg-indigo-800 text-indigo-200 border-indigo-700 hover:bg-indigo-755'
            }`}
          >
            💬 Dialogo / Spensierato
          </button>
          
          <button
            onClick={() => setAssistantMode('translate')}
            className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
              assistantMode === 'translate' 
                ? 'bg-yellow-300 text-black border-slate-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] font-black' 
                : 'bg-indigo-800 text-indigo-200 border-indigo-700 hover:bg-indigo-755'
            }`}
          >
            🇮🇹 Traduttore / Casi
          </button>

          <button
            onClick={() => setAssistantMode('grammar')}
            className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
              assistantMode === 'grammar' 
                ? 'bg-yellow-300 text-black border-slate-900 shadow-[1px_1px_0px_rgba(0,0,0,1)] font-black' 
                : 'bg-indigo-800 text-indigo-200 border-indigo-700 hover:bg-indigo-755'
            }`}
          >
            📖 Regole / Focus
          </button>
        </div>

        {/* CHAT MESSAGES DISPLAY */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-indigo-950 font-medium text-sm leading-relaxed" id="tutor-chat-box">
          
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Sender Indicator */}
              <span className="text-[9px] text-indigo-300 font-extrabold uppercase mb-1">
                {msg.role === 'user' ? 'Studente' : 'Tutor Russo'}
              </span>

              {/* Message Bubble */}
              <div className={`p-3.5 rounded-2xl border ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-900 rounded-br-none border-slate-900 shadow-[3px_3px_0px_rgba(0,0,0,0.15)]' 
                  : 'bg-indigo-800 text-white rounded-bl-none border-indigo-500 shadow-md'
              }`}>
                {/* Support speaker for Russian output in assistant answers */}
                {msg.role === 'assistant' && (
                  <div className="flex justify-between items-start gap-2 mb-2 pb-1.5 border-b border-indigo-700">
                    <span className="text-[10px] font-black uppercase text-indigo-300">
                      {assistantMode === 'translate' ? 'Traduzione & Spiegazione' : 'Tutor Risponde'}
                    </span>
                    <button
                      onClick={() => speakRussian(msg.text)}
                      className="bg-indigo-705 p-1 bg-indigo-700 rounded text-yellow-300 hover:bg-indigo-650"
                      title="Leggi ad alta voce l'intera risposta"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {/* Render content with raw spacing/newlines safely */}
                <span className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm font-semibold select-text">
                  {msg.text}
                </span>
              </div>
            </div>
          ))}

          {/* Loader bubble */}
          {isAssistantLoading && (
            <div className="flex flex-col items-start max-w-[80%] mr-auto">
              <span className="text-[9px] text-indigo-300 font-extrabold uppercase mb-1">Tutor Russo sta scrivendo...</span>
              <div className="bg-indigo-800 border border-indigo-500 rounded-2xl rounded-bl-none p-3 shadow-md text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-yellow-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs font-bold">Un attimo, compongo la spiegazione...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Help Prompts Shortcuts */}
        <div className="p-3 bg-indigo-900 border-t border-indigo-800 shrink-0 select-none">
          <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1.5 px-1.5">Suggerimenti di Domanda:</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setAssistantMode('translate');
                handleSendMessage("Come si traduce la frase 'Il treno parte adesso' in cirillico?", 'translate');
              }}
              className="text-[9px] bg-indigo-800 hover:bg-indigo-755 border border-indigo-600 px-2 py-1.5 rounded font-black text-white hover:text-yellow-300 transition-colors"
            >
              Traduzione Frase
            </button>

            <button
              onClick={() => {
                setAssistantMode('grammar');
                handleSendMessage("Spiegami brevemente la differenza tra l'uso della preposizione 'В' e 'НА' con il caso prepositivo", 'grammar');
              }}
              className="text-[9px] bg-indigo-800 hover:bg-indigo-755 border border-indigo-600 px-2 py-1.5 rounded font-black text-white hover:text-yellow-300 transition-colors"
            >
              Differenza В / НА
            </button>

            <button
              onClick={() => {
                setAssistantMode('tutor');
                handleSendMessage("Come posso memorizzare facilmente le lettere 'false amiche' come B, P, C?", 'tutor');
              }}
              className="text-[9px] bg-indigo-800 hover:bg-indigo-755 border border-indigo-600 px-2 py-1.5 rounded font-black text-white hover:text-yellow-300 transition-colors"
            >
              Falsi amici Cirillici
            </button>
          </div>
        </div>

        {/* CHAT INPUT FORM */}
        <div className="p-4 bg-indigo-800 border-t-4 border-slate-900 shrink-0">
          <div className="relative">
            <input 
              type="text" 
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={`Chiedi al tutor (Modalità: ${assistantMode})...`}
              className="w-full bg-indigo-950 border-2 border-slate-900 rounded-xl p-3.5 pr-11 text-xs text-white placeholder-indigo-300 font-extrabold outline-none focus:ring-2 ring-yellow-300 shadow-inner"
            />
            
            <button 
              onClick={() => handleSendMessage()}
              disabled={isAssistantLoading || !userInput.trim()}
              className="absolute right-2 top-2 p-2 rounded-lg bg-yellow-300 text-slate-950 border border-slate-900 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed duration-150 shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-2 items-center justify-between mt-3 text-[10px] text-indigo-200">
            <span className="font-bold">Modalità attiva:</span>
            <span className="font-extrabold text-white text-[10px] bg-indigo-900 px-2.5 py-1 rounded-full uppercase border border-indigo-700">
              {assistantMode === 'tutor' && 'Tutor e Conversazione'}
              {assistantMode === 'translate' && 'Traduttore & Casi'}
              {assistantMode === 'grammar' && 'Spiegazione Grammatica'}
              {assistantMode === 'vocabulary' && 'Lessico & Dizionario'}
              {assistantMode === 'exercise' && 'Valutatore Esercizio'}
            </span>
          </div>
        </div>

      </aside>

    </div>
  );
}
