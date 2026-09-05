export interface GroundingSource {
  title?: string;
  url?: string;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64 string
  previewUrl: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  sources?: GroundingSource[];
  isStreaming?: boolean;
  error?: string;
  modelUsed?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  isPinned?: boolean;
}

export type ModelId = 'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-flash-thinking';

export interface ModelOption {
  id: ModelId;
  name: string;
  badge?: string;
  description: string;
  isPro?: boolean;
}
