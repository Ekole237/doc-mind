import React, { type SetStateAction } from "react";
import { Chat } from "@/components/chat/index";
import type { ChatMessage } from "@/types";
import { Button } from "@workspace/ui/components/button";

export interface MessageGroupProps {
  msg: ChatMessage;
  retryLastMessage: () => Promise<void>;
  setFeedbackModal: React.Dispatch<SetStateAction<{ isOpen: boolean; queryLogId: string }>>;
}

const MessageGroup: React.FC<MessageGroupProps> = ({ msg, retryLastMessage, setFeedbackModal }) => {
  return (
    <div className="group relative flex flex-col gap-2">
      <Chat.MessageBubble
        role={msg.role}
        content={msg.content}
        responseTimeMs={msg.role === "assistant" ? msg.responseTimeMs : undefined}
        isError={msg.isError}
        errorType={msg.errorType}
        onRetry={msg.isError ? retryLastMessage : undefined}
      />

      {msg.role === "assistant" && !msg.isError && msg.source && (
        <div className="pl-12">
          <Chat.SourceCitation source={msg.source} />
        </div>
      )}

      {msg.role === "assistant" && !msg.isError && msg.queryLogId && !msg.isIgnorance && (
        <div className="pl-12 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-muted-foreground hover:text-foreground"
            disabled={msg.hasFeedback}
            onClick={() =>
              !msg.hasFeedback && setFeedbackModal({ isOpen: true, queryLogId: msg.queryLogId! })
            }
          >
            {msg.hasFeedback ? "✓ Feedback envoyé" : "Signaler une erreur"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageGroup;
