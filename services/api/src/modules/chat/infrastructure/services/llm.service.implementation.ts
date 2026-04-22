import {
  type ChatMessage,
  type CompleteResponse,
  type LlmService,
} from '#chat/domain/services/llm.service';
import { type DocumentChunk } from '#chat/domain/services/vector-search.service';
import { PromptBuilder } from '#chat/infrastructure/services/prompt-builder';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

const SAFE_FORMAT_ERROR_ANSWER =
  'Je rencontre un problème temporaire pour formater la réponse. Merci de réessayer.';

@Injectable()
export class LlmServiceImplementation implements LlmService {
  private readonly _logger = new Logger(LlmServiceImplementation.name);

  constructor(
    private readonly _configService: ConfigService,
    private readonly _promptBuilder: PromptBuilder,
  ) {}

  async complete(
    chunks: DocumentChunk[],
    question: string,
    history?: ChatMessage[],
  ): Promise<CompleteResponse> {
    const provider = this._configService.get<string>('LLM_PROVIDER', 'openai');
    const userPrompt = this._promptBuilder.buildUserPrompt(chunks, question);
    const systemPrompt = this._promptBuilder.SYSTEM_PROMPT;

    let responseText = '';
    if (provider === 'anthropic') {
      responseText = await this._callAnthropic(
        systemPrompt,
        userPrompt,
        history,
      );
    } else if (provider === 'groq') {
      responseText = await this._callGroq(
        systemPrompt,
        userPrompt,
        false,
        history,
      );
    } else {
      responseText = await this._callOpenAi(
        systemPrompt,
        userPrompt,
        false,
        history,
      );
    }

    return this._parseJsonResponse(responseText);
  }

  async classifyIntent(message: string): Promise<'SEARCH' | 'CHAT'> {
    const provider = this._configService.get<string>('LLM_PROVIDER', 'openai');
    const systemPrompt = this._promptBuilder.INTENT_SYSTEM_PROMPT;

    let responseText = '';
    try {
      if (provider === 'anthropic') {
        responseText = await this._callAnthropic(systemPrompt, message);
      } else if (provider === 'groq') {
        responseText = await this._callGroq(systemPrompt, message);
      } else {
        responseText = await this._callOpenAi(systemPrompt, message);
      }

      const normalized = responseText.trim().toUpperCase();
      return normalized.includes('SEARCH') ? 'SEARCH' : 'CHAT';
    } catch (error) {
      this._logger.error(`Error classifying intent: ${error.message}`);
      return 'SEARCH'; // Default to search on error for safety
    }
  }

  async condenseQuestion(
    history: ChatMessage[],
    question: string,
  ): Promise<string> {
    if (history.length === 0) return question;

    const provider = this._configService.get<string>('LLM_PROVIDER', 'openai');
    const historyText = history
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const systemPrompt = 'Tu es un assistant qui reformule des questions.';
    const userPrompt = this._promptBuilder.CONDENSE_QUESTION_PROMPT.replace(
      '{history}',
      historyText,
    ).replace('{question}', question);

    try {
      if (provider === 'anthropic') {
        return await this._callAnthropic(systemPrompt, userPrompt);
      } else if (provider === 'groq') {
        return await this._callGroq(systemPrompt, userPrompt);
      } else {
        return await this._callOpenAi(systemPrompt, userPrompt);
      }
    } catch (error) {
      this._logger.error(`Error condensing question: ${error.message}`);
      return question;
    }
  }

  async completeConversational(
    message: string,
    history?: ChatMessage[],
  ): Promise<string> {
    const provider = this._configService.get<string>('LLM_PROVIDER', 'openai');
    const systemPrompt = this._promptBuilder.CONVERSATIONAL_SYSTEM_PROMPT;

    if (provider === 'anthropic') {
      return this._callAnthropic(systemPrompt, message, history);
    }

    if (provider === 'groq') {
      return this._callGroq(systemPrompt, message, false, history);
    }

    return this._callOpenAi(systemPrompt, message, false, history);
  }

  private _parseJsonResponse(text: string): CompleteResponse {
    const cleanedText = this._stripCodeFences(text);
    const parsedResponse =
      this._tryParseStructuredResponse(cleanedText) ??
      this._tryParseStructuredResponse(this._extractJsonObject(cleanedText));

    if (parsedResponse) {
      return parsedResponse;
    }

    const looksLikeStructuredOutput =
      cleanedText.startsWith('{') ||
      cleanedText.includes('"answer"') ||
      cleanedText.includes('"exact_quote"') ||
      cleanedText.includes('"source_chunk_id"');

    if (looksLikeStructuredOutput) {
      this._logger.warn('LLM returned invalid structured JSON response');
      return {
        answer: SAFE_FORMAT_ERROR_ANSWER,
        exactQuote: null,
        sourceChunkId: null,
      };
    }

    return {
      answer: cleanedText,
      exactQuote: null,
      sourceChunkId: null,
    };
  }

  private _tryParseStructuredResponse(
    candidate: string | null,
  ): CompleteResponse | null {
    if (!candidate) {
      return null;
    }

    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      const answer =
        typeof parsed.answer === 'string' ? parsed.answer.trim() : '';

      if (!answer) {
        return null;
      }

      return {
        answer,
        exactQuote:
          typeof parsed.exact_quote === 'string' && parsed.exact_quote.trim()
            ? parsed.exact_quote
            : null,
        sourceChunkId:
          typeof parsed.source_chunk_id === 'string' &&
          parsed.source_chunk_id.trim()
            ? parsed.source_chunk_id
            : null,
      };
    } catch {
      return null;
    }
  }

  private _stripCodeFences(text: string): string {
    return text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
  }

  private _extractJsonObject(text: string): string | null {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start === -1 || end <= start) {
      return null;
    }

    return text.slice(start, end + 1);
  }

  private async _callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    history: ChatMessage[] = [],
  ): Promise<string> {
    const client = new Anthropic({
      apiKey: this._configService.get<string>('ANTHROPIC_API_KEY'),
    });

    const messages: Anthropic.MessageParam[] = history.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    messages.push({ role: 'user', content: userPrompt });

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    });

    return (msg.content[0] as Anthropic.TextBlock).text;
  }

  private async _callOpenAi(
    systemPrompt: string,
    userPrompt: string,
    jsonMode = false,
    history: ChatMessage[] = [],
  ): Promise<string> {
    const client = new OpenAI({
      apiKey: this._configService.get<string>('OPENAI_API_KEY'),
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(
        (m) =>
          ({
            role: m.role,
            content: m.content,
          }) as OpenAI.Chat.ChatCompletionMessageParam,
      ),
      { role: 'user', content: userPrompt },
    ];

    const completion = await client.chat.completions.create({
      model: 'gpt-4o',
      response_format: jsonMode ? { type: 'json_object' } : undefined,
      messages,
    });

    return completion.choices[0].message.content ?? '';
  }

  private async _callGroq(
    systemPrompt: string,
    userPrompt: string,
    jsonMode = false,
    history: ChatMessage[] = [],
  ): Promise<string> {
    const client = new OpenAI({
      apiKey: this._configService.get<string>('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(
        (m) =>
          ({
            role: m.role,
            content: m.content,
          }) as OpenAI.Chat.ChatCompletionMessageParam,
      ),
      { role: 'user', content: userPrompt },
    ];

    const completion = await client.chat.completions.create({
      model: this._configService.get<string>(
        'GROQ_MODEL',
        'llama-3.3-70b-versatile',
      ),
      response_format: jsonMode ? { type: 'json_object' } : undefined,
      messages,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content ?? '';
  }
}
