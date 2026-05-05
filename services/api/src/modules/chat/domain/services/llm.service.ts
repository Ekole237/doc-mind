import { DocumentChunk } from './vector-search.service';

export const LLM_SERVICE = Symbol('LlmService');

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CompleteResponse {
  answer: string;
  exactQuote: string | null;
  sourceChunkId: string | null;
}

export interface LlmService {
  classifyIntent(message: string): Promise<'SEARCH' | 'CHAT'>;
  condenseQuestion(history: ChatMessage[], question: string): Promise<string>;
  complete(
    chunks: DocumentChunk[],
    question: string,
    history?: ChatMessage[],
  ): Promise<CompleteResponse>;
  completeConversational(
    message: string,
    history?: ChatMessage[],
  ): Promise<string>;
}
