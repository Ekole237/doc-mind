import React from "react";
import type { ChatSession } from "@/types";
import { Bot, History, LayoutDashboard, LogOut, MessageCircle, PlusCircle, X } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

export interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onHistoryClick: () => void;
  onLogout: () => void;
  onNewChat: () => void;
  onDashboardClick: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSessionClick: (id: string) => void;
  isAdmin: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  onHistoryClick,
  onLogout,
  onNewChat,
  onDashboardClick,
  sessions,
  currentSessionId,
  onSessionClick,
  isAdmin,
}: ChatSidebarProps) => {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-border/50 px-4">
          <div className="flex items-center gap-2 w-full font-semibold border-2 border-gray-200 rounded-lg px-4 py-2">
            <Bot className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display">Doc Mind</span>
              <span
                className="text-[10px] italic text-primary font-bold tracking-wide"
                style={{ fontFamily: "'Lucky Beauty', cursive" }}
              >
                by Ejara
              </span>
            </div>
          </div>
          <button className="md:hidden" onClick={onClose} aria-label="Fermer le menu">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <Button
            variant="default"
            className="w-full justify-start gap-3 mb-4"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle discussion
          </Button>

          <Button variant="ghost" className="w-full justify-start gap-3" onClick={onHistoryClick}>
            <History className="h-4 w-4" />
            Historique complet
          </Button>

          <div className="mt-6">
            <h3 className="mb-2 px-4 text-xs font-display text-muted-foreground uppercase tracking-wider">
              Discussions récentes
            </h3>
            <div className="space-y-1">
              {sessions.map((session) => (
                <Button
                  key={session.id}
                  variant={currentSessionId === session.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 text-left font-normal cursor-pointer hover:bg-primary/20 hover:text-foreground",
                    currentSessionId === session.id ? "bg-primary/20" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    onSessionClick(session.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate ">{session.title}</span>
                </Button>
              ))}
              {sessions.length === 0 && (
                <p className="px-4 text-xs text-muted-foreground italic">
                  Aucune discussion récente.
                </p>
              )}
            </div>
          </div>
        </nav>

        <div className="border-t border-border/50 p-4 space-y-1">
          {isAdmin && (
            <Button
              variant="ghost"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground px-2 py-1 rounded-lg"
              onClick={onDashboardClick}
            >
              <LayoutDashboard className="h-4 w-4" />
              Panneau d'administration
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};

export default ChatSidebar;
