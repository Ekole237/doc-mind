import { Chat } from "@/components/chat/index";

const ChatLoadingMessage = () => {
  return (
    <div className="flex flex-col gap-2">
      <Chat.MessageBubble role="assistant" content="" isLoading />
    </div>
  );
};

export default ChatLoadingMessage;
