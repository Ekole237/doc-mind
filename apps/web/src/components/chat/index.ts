import ChatHeader, { type ChatHeaderProps } from "./ChatHeader";
import ChatMessagesList, {  type ChatMessagesListProps } from "./ChatMessagesList";
import ChatInput, { type ChatInputProps } from "./ChatInput";
import ChatSidebar, { type ChatSidebarProps } from "./ChatSidebar";
import ChatLayout, { type ChatLayoutProps} from "./ChatLayout"
import ExpertisePillars from "@/components/chat/ExpertisePillars";
import { FeedbackModal } from "@/components/chat/FeedbackModal";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SourceCitation } from "@/components/chat/SourceCitation";
import ChatEmptyState from "@/components/chat/ChatEmptyState"
import MessageGroup from "@/components/chat/MessageGroup";
import ChatLoadingMessage from "@/components/chat/ChatLoadingMessage";


export const Chat = {
  Layout: ChatLayout,
  Sidebar: ChatSidebar,
  Header: ChatHeader,
  Messages: ChatMessagesList,
  Input: ChatInput,
  ChatPillars: ExpertisePillars,
  FeedbackModal,
  MessageBubble,
  SourceCitation,
  ChatEmptyState,
  MessageGroup,
  ChatLoadingMessage
};

export type { ChatHeaderProps, ChatMessagesListProps, ChatInputProps, ChatSidebarProps, ChatLayoutProps }
