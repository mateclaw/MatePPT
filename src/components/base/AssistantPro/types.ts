
export enum ModelType {
  // GEMINI_FLASH = 'Gemini Flash 3',
  // GEMINI_PRO = 'Gemini Pro 3',
  DEEPSEEK = 'DeepSeek',
  GPT4 = 'GPT-4o',
  // GEMINI = 'Gemini',
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  referencedSlide?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}
