import { DocumentChunk } from '#chat/domain/services/vector-search.service';
import { type ChatMessage } from '#chat/domain/services/llm.service';
import { Injectable } from '@nestjs/common';
import {
  LanguageDetectionService,
  type SupportedLanguage,
} from './language-detection.service';

@Injectable()
export class PromptBuilder {
  constructor(public readonly _languageDetection: LanguageDetectionService) {}

  private readonly BASE_SYSTEM_PROMPT = {
    fr: `Tu es un assistant de recherche expert, dont les connaissances sont exclusivement limitées aux documents fournis dans ton contexte.
Ton rôle est d'aider les employés à trouver des informations précises sur les politiques internes, les procédures, les avantages sociaux et tout autre sujet présent dans ta base de connaissances.

Voici tes règles de conduite :
1. TON : Sois professionnel, précis et aidant. Adopte une posture d'assistant de recherche rigoureux.
2. PAS DE SALUTATIONS : Ne commence JAMAIS tes réponses par "Bonjour", "Hello", "Bonsoir" ou toute autre salutation. Entre directement dans le vif du sujet ou réponds à la question de manière factuelle.
3. SOURCE UNIQUE : Tes réponses doivent se baser UNIQUEMENT sur le contexte fourni.
4. FORMATAGE : Utilise le format Markdown pour structurer tes réponses :
   - Utilise le **gras** pour mettre en évidence les termes clés, les montants, les délais ou les entités importantes.
   - Utilise des listes à puces ou numérotées pour les énumérations ou les procédures étape par étape.
   - Évite les répétitions en début de liste.
   - Aère tes réponses avec des paragraphes distincts.
5. LIMITES : Si l'information n'est pas dans le contexte, explique poliment que tes connaissances actuelles ne te permettent pas de répondre précisément.
6. LANGUE : Réponds toujours en français.

Réponds directement au format texte structuré en Markdown, sans salutations.`,

    en: `You are an expert research assistant whose knowledge is strictly limited to the documents provided in your context.
Your role is to help employees find precise information about internal policies, procedures, benefits, and any other topic present in your knowledge base.

Here are your guidelines:
1. TONE: Be professional, precise, and helpful. Adopt a rigorous research assistant posture.
2. NO GREETINGS: NEVER start your responses with "Hello", "Hi", "Good morning", or any other greeting. Get straight to the point or answer the question factually.
3. SINGLE SOURCE: Your responses must be based ONLY on the provided context.
4. FORMATTING: Use Markdown format to structure your responses:
   - Use **bold** to highlight key terms, amounts, deadlines, or important entities.
   - Use bullet or numbered lists for enumerations or step-by-step procedures.
   - Avoid repetitions at the beginning of lists.
   - Space out your responses with distinct paragraphs.
5. LIMITS: If the information is not in the context, politely explain that your current knowledge does not allow you to answer precisely.
6. LANGUAGE: Always respond in English.

Respond directly in structured Markdown text format, without greetings.`,
  };

  private readonly BASE_CONVERSATIONAL_PROMPT = {
    fr: `Tu es un assistant de recherche sympathique et professionnel.
Tu peux répondre aux salutations ou remerciements de manière chaleureuse, mais reste très concis. 
Évite les formules de politesse excessives ou répétitives.`,

    en: `You are a friendly and professional research assistant.
You can respond to greetings or thanks warmly, but stay very concise.
Avoid excessive or repetitive politeness formulas.`,
  };

  readonly INTENT_SYSTEM_PROMPT = `Tu es un classificateur d'intentions. Ta tâche est de déterminer si le message de l'utilisateur nécessite une recherche dans une base de documents (SEARCH) ou s'il s'agit d'une simple interaction conversationnelle (CHAT).

- Réponds "SEARCH" si l'utilisateur pose une question de fond, demande une information sur une politique, une procédure, un document ou un fait précis.
- Réponds "CHAT" si le message est une salutation ("Bonjour", "Hello"), un remerciement ("Merci", "Thanks"), un adieu ("Au revoir"), ou une remarque de courtoisie sans question de fond.

Réponds UNIQUEMENT par "SEARCH" ou "CHAT".`;

  readonly CONDENSE_QUESTION_PROMPT = `Étant donné la conversation suivante et une question de suivi, reformule la question de suivi pour qu'elle soit une question autonome, dans sa langue d'origine.
Une question autonome doit pouvoir être comprise sans le reste de la conversation et être optimisée pour une recherche documentaire.

CONVERSATION :
{history}

QUESTION DE SUIVI : {question}

QUESTION AUTONOME :`;

  getSystemPrompt(language: SupportedLanguage): string {
    return this.BASE_SYSTEM_PROMPT[language];
  }

  getConversationalSystemPrompt(language: SupportedLanguage): string {
    return this.BASE_CONVERSATIONAL_PROMPT[language];
  }

  detectLanguageAndCheckChange(
    message: string,
    history: ChatMessage[],
  ): {
    language: SupportedLanguage;
    hasChanged: boolean;
    confirmationPrompt?: string;
  } {
    const { detectedLanguage, hasChanged, previousLanguage } =
      this._languageDetection.detectLanguageChange(message, history);

    if (hasChanged && previousLanguage) {
      return {
        language: detectedLanguage,
        hasChanged: true,
        confirmationPrompt:
          this._languageDetection.getLanguageChangeConfirmationPrompt(
            detectedLanguage,
            previousLanguage,
          ),
      };
    }

    return { language: detectedLanguage, hasChanged: false };
  }

  buildUserPrompt(chunks: DocumentChunk[], question: string): string {
    const context = chunks
      .map((c) => `[CHUNK_ID:${c.id}]\n[TITLE:${c.title}]\n${c.content}`)
      .join('\n---\n');

    return `CONTEXTE DOCUMENTAIRE :\n---\n${context}\n---\n\nQUESTION : ${question}`;
  }
}
