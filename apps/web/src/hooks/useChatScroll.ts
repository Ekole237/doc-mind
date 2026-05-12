import { createContext, useContext, type RefObject } from "react";

type ChatContextType = {
  scrollRef: RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  shouldAutoScroll: () => boolean;
};

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChatScroll = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChatScroll must be used within ChatContainer");
  return context;
};
