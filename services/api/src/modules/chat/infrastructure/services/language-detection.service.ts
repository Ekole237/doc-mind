import { Injectable, Logger } from '@nestjs/common';
import { type ChatMessage } from '#chat/domain/services/llm.service';

export type SupportedLanguage = 'fr' | 'en';

@Injectable()
export class LanguageDetectionService {
  private readonly logger = new Logger(LanguageDetectionService.name);

  detectLanguage(text: string): SupportedLanguage {
    // Simple detection based on common words and patterns
    const frenchIndicators = [
      'le',
      'la',
      'les',
      'de',
      'du',
      'des',
      'et',
      'est',
      'que',
      'pour',
      'dans',
      'avec',
      'une',
      'sur',
      'il',
      'elle',
      'nous',
      'vous',
      'ils',
      'bonjour',
      'merci',
      'au',
      'aux',
      'pas',
      'plus',
      'bien',
      'très',
    ];

    const englishIndicators = [
      'the',
      'and',
      'is',
      'in',
      'to',
      'of',
      'a',
      'that',
      'it',
      'with',
      'for',
      'as',
      'on',
      'be',
      'at',
      'by',
      'this',
      'have',
      'from',
      'or',
      'hello',
      'thanks',
      'thank',
      'please',
      'yes',
      'no',
      'not',
      'very',
    ];

    const words = text.toLowerCase().split(/\s+/);
    let frenchScore = 0;
    let englishScore = 0;

    words.forEach((word) => {
      if (frenchIndicators.includes(word)) frenchScore++;
      if (englishIndicators.includes(word)) englishScore++;
    });

    // If no clear indicators, default to French
    if (frenchScore === 0 && englishScore === 0) {
      return 'fr';
    }

    return frenchScore >= englishScore ? 'fr' : 'en';
  }

  detectLanguageChange(
    currentMessage: string,
    history: ChatMessage[],
  ): {
    detectedLanguage: SupportedLanguage;
    hasChanged: boolean;
    previousLanguage?: SupportedLanguage;
  } {
    const detectedLanguage = this.detectLanguage(currentMessage);

    // Find the last user message to determine previous language
    const lastUserMessage = history.filter((msg) => msg.role === 'user').pop();

    if (!lastUserMessage) {
      return { detectedLanguage, hasChanged: false };
    }

    const previousLanguage = this.detectLanguage(lastUserMessage.content);
    const hasChanged = previousLanguage !== detectedLanguage;

    this.logger.debug(
      `Language detection: ${previousLanguage} -> ${detectedLanguage} (changed: ${hasChanged})`,
    );

    return { detectedLanguage, hasChanged, previousLanguage };
  }

  getLanguagePrompt(language: SupportedLanguage): string {
    const prompts = {
      fr: 'Réponds en français.',
      en: 'Respond in English.',
    };
    return prompts[language];
  }

  getLanguageChangeConfirmationPrompt(
    newLanguage: SupportedLanguage,
    previousLanguage: SupportedLanguage,
  ): string {
    const messages = {
      'en->fr':
        'I notice you switched to French. Would you like me to continue responding in French from now on? (Please answer yes/no)',
      'fr->en':
        "Je remarque que vous êtes passé à l'anglais. Souhaitez-vous que je continue à répondre en anglais désormais ? (Répondez oui/non)",
    };

    const key = `${previousLanguage}->${newLanguage}`;
    return messages[key as keyof typeof messages] || messages['fr->en'];
  }

  detectDocumentLanguage(documentContent: string): SupportedLanguage {
    // Extract text content from document chunks for language detection
    const textSample = documentContent
      .replace(/\[CHUNK_ID:[^\]]+\]/g, '')
      .replace(/\[TITLE:[^\]]+\]/g, '')
      .replace(/---/g, '')
      .substring(0, 1000); // Use first 1000 chars for detection

    return this.detectLanguage(textSample);
  }

  getMultilingualSystemPrompt(
    documentLanguage: SupportedLanguage,
    questionLanguage: SupportedLanguage,
    responseLanguage: SupportedLanguage,
  ): string {
    const prompts = {
      'fr-fr-fr': `Tu es un assistant de recherche expert travaillant avec des documents en français.
L'utilisateur pose une question en français. Réponds en français en te basant UNIQUEMENT sur les documents fournis.`,

      'fr-fr-en': `Tu es un assistant de recherche expert travaillant avec des documents en français.
L'utilisateur pose une question en anglais. Réponds en anglais en te basant UNIQUEMENT sur les documents français fournis.
Traduis l'information des documents français en anglais dans ta réponse.`,

      'en-en-en': `You are an expert research assistant working with English documents.
The user is asking in English. Respond in English based ONLY on the provided documents.`,

      'en-en-fr': `You are an expert research assistant working with English documents.
The user is asking in French. Respond in French based ONLY on the provided English documents.
Translate the information from the English documents in your response.`,
    };

    const key = `${documentLanguage}-${questionLanguage}-${responseLanguage}`;
    return prompts[key as keyof typeof prompts] || prompts['fr-fr-fr'];
  }
}
