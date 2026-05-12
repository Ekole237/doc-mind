import React from "react";
import { Bot, ShieldCheck, Zap } from "lucide-react";
import { Chat } from "@/components/chat/index";
import type { ChatMessage } from "@/types";

export interface ChatEmptyStateProps {
  messages: ChatMessage[];
  isLoading: boolean;
  firstName?: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
  sendMessage: (message: string) => void;
}

const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  messages,
  isLoading,
  firstName,
  containerRef,
  sendMessage
}) => {
  return messages.length === 0 && !isLoading && (
      <div ref={containerRef} className="flex flex-col space-y-12 py-8">
        {/* Hero section */}
        <div className="text-center space-y-4 gsap-hero">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner gsap-bot-icon">
            <Bot className="h-8 w-8" />
          </div>
          <h1 className="title-lg tracking-tight">
            Bonjour{firstName ? `, ${firstName}` : ""} !
          </h1>
          <p className="mx-auto max-w-md text-body text-muted-foreground">
            Je suis votre assistant documentaire intelligent. J'analyse nos ressources
            internes pour répondre à vos questions en un instant.
          </p>
        </div>

        {/* Expertise Pillars */}
        <Chat.ChatPillars sendMessage={sendMessage} />

        {/* Proactive Tips & Privacy */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-start gap-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-900/20 hover:shadow-md transition-shadow gsap-tips">
            <Zap className="h-4 w-4 text-primary mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-primary dark:text-primary">
                Conseil d'utilisation
              </p>
              <p className="text-[11px] text-primary/80 dark:text-primary/70 leading-relaxed">
                Je garde le contexte en mémoire. Vous pouvez poser des questions de suivi
                comme : "Est-ce applicable à ma famille ?"
              </p>
            </div>
          </div>

          <div className="flex-1 flex items-start gap-3 rounded-xl bg-muted/30 p-4 border border-border/50 hover:shadow-md transition-shadow gsap-tips">
            <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Sécurité & Confidentialité
              </p>
              <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                Vos échanges sont privés et sécurisés. Les réponses sont générées
                exclusivement à partir de nos documents internes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ChatEmptyState;
