import { useMemo, useRef } from "react"
import { useParams } from "react-router-dom"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { useAuth } from "@/hooks/useAuth"
import { useChat } from "./useChat"
import { Chat } from "@/components/chat";
import { ChatContainer } from "@/components/chat/chatContainer";


export function ChatPage() {
  const { user } = useAuth();
  const { id } = useParams()

  const {
    messages,
    inputValue,
    setInputValue,
    inputError,
    setInputError,
    isLoading,
    rateLimited,
    setFeedbackModal,
    handleSubmit,
    sendMessage,
    retryLastMessage,
    MAX_LENGTH,
  } = useChat(id)

  const firstName = useMemo(() => {
    if (!user?.email) return ""
    const namePart = user.email.split("@")[0]
    const dotIndex = namePart.indexOf(".")
    const firstPart = dotIndex !== -1 ? namePart.split(".")[0] : namePart
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
  }, [user])

  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (messages.length === 0 && !isLoading) {
      const tl = gsap.timeline()
      
      tl.from(".gsap-hero", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      })
      .from(".gsap-expertise", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.4")
      .from(".gsap-tips", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out"
      }, "-=0.3")

      // Infinite float animation for bot icon
      gsap.to(".gsap-bot-icon", {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    }
  }, { scope: containerRef, dependencies: [messages.length, isLoading] })

  return (
    <Chat.Layout user={user} id={id}>
      {/* Messages Area */}
      <ChatContainer>
        <Chat.Messages
          messages={messages}
          isLoading={isLoading}
          sendMessage={sendMessage}
          retryLastMessage={retryLastMessage}
          setFeedbackModal={setFeedbackModal}
          containerRef={containerRef}
          firstName={firstName}
        />

        {/* Input Area */}
        <Chat.Input
          inputError={inputError}
          inputValue={inputValue}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          setInputError={setInputError}
          setInputValue={setInputValue}
          maxLength={MAX_LENGTH}
          rateLimited={rateLimited}
        />
      </ChatContainer>
    </Chat.Layout>
  );
}
