export interface Example {
  russian: string;
  pronunciation: string;
  italian: string;
}

export interface GrammarModule {
  id: string;
  title: string;
  russianTitle: string;
  level: 'Base' | 'Intermedio' | 'Avanzato';
  description: string;
  explanation: string;
  examples: Example[];
}

export interface WordItem {
  russian: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
}

export interface VocabularyPack {
  id: string;
  category: string;
  russianCategory: string;
  description: string;
  icon: string;
  words: WordItem[];
}

export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'translation';
  question: string;
  russianContext?: string;
  options?: string[];
  correctAnswer: string;
  hint: string;
  moduleLink?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}
