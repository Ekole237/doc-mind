"use client";

import { useRef, type ReactNode } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ChatContext } from "@/hooks/useChatScroll";

type ChatContainerProps = {
  children: ReactNode;
  className?: string;
};



export function ChatContainer({ children, className = "" }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hook d'auto-scroll
  const {scrollToBottom, shouldAutoScroll } = useAutoScroll({
    scrollRef,
    smooth: true,
    threshold: 120
  });

  return (
    <ChatContext.Provider
      value={{
        scrollRef,
        scrollToBottom, // Exposition utile pour les enfants
        shouldAutoScroll,
      }}
    >
      <div className={`flex h-full flex-col ${className}`}>{children}</div>
    </ChatContext.Provider>
  );
}
