import React, { useState } from "react";
import { Chat } from "@/components/chat/index";
import { ProfileDrawer } from "@/components/layout/ProfileDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useChat } from "@/pages/chat/useChat";
import type { JwtUser } from "@/types";

export interface ChatLayoutProps extends React.PropsWithChildren {
  id: string | undefined
  user: JwtUser | null
}


const ChatLayout: React.FC<ChatLayoutProps> = ({ children, id, user }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const {
    feedbackModal,
    setFeedbackModal,
    handleFeedback,
    clearSession,
    sessions,
    sessionId,
  } = useChat(id);

  return (
    <div className="flex h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      <Chat.Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHistoryClick={() => navigate("/history")}
        onLogout={logout}
        onNewChat={clearSession}
        onDashboardClick={() => navigate("/admin/dashboard")}
        sessions={sessions}
        currentSessionId={sessionId}
        onSessionClick={(sessionId) => navigate(`/chat/${sessionId}`)}
        isAdmin={user?.role === "admin"}
      />

      <main className="flex flex-1 flex-col overflow-hidden relative">
        <Chat.Header
          onMenuClick={() => setSidebarOpen(true)}
          onProfileClick={() => setProfileOpen(true)}
          userEmail={user?.email}
        />
        {children}
      </main>

      <Chat.FeedbackModal
        isOpen={feedbackModal.isOpen}
        queryLogId={feedbackModal.queryLogId}
        onClose={() => setFeedbackModal({ isOpen: false, queryLogId: "" })}
        onSubmit={handleFeedback}
      />

      <ProfileDrawer isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
};

export default ChatLayout;
