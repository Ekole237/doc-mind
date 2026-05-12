import React from "react";
import { Chat } from "@/components/chat/index";
import { type MessageGroupProps } from "@/components/chat/MessageGroup";
import type { ChatMessage } from "@/types";
import type { ChatEmptyStateProps } from "@/components/chat/ChatEmptyState";
import { useChatScroll } from "@/hooks/useChatScroll";

export type ChatMessagesListProps =
  ChatEmptyStateProps &
  Pick<MessageGroupProps, 'retryLastMessage' | 'setFeedbackModal'> &
  {
  messages: ChatMessage[]
 }

const ChatMessagesList: React.FC<ChatMessagesListProps> = ({
messages,
  isLoading,
  sendMessage,
  firstName,
  containerRef,
  retryLastMessage,
  setFeedbackModal
}) => {

  const { scrollRef } = useChatScroll()

  return (
    <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-32 sm:p-6 sm:pb-36">
        <Chat.ChatEmptyState
          messages={messages}
          isLoading={isLoading}
          sendMessage={sendMessage}
          firstName={firstName}
          containerRef={containerRef}
        />

        {messages.map((msg) => (
          <Chat.MessageGroup
            key={msg.id}
            msg={msg}
            retryLastMessage={retryLastMessage}
            setFeedbackModal={setFeedbackModal}
          />
        ))}

        {isLoading && <Chat.ChatLoadingMessage />}
      </div>
    </div>
  );
};

export default ChatMessagesList;
