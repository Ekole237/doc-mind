import EjaraLogo from "@/assets/icons/Logo.svg?react"
import EjaraTextLogo from "@/assets/icons/ejara.svg?react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { BookOpen, Bot, History, LayoutDashboard, LogOut, Menu, MessageCircle, PlusCircle, Send, ShieldCheck, User, X, Zap } from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { FeedbackModal } from "../../components/chat/FeedbackModal"
import { MessageBubble } from "../../components/chat/MessageBubble"
import { SourceCitation } from "../../components/chat/SourceCitation"
import { useAuth } from "../../hooks/useAuth"
import type { ChatSession } from "../../types"
import { useChat } from "./useChat"

// --- PRESENTATIONAL COMPONENTS ---

const EXPERTISE_CATEGORIES = [
  {
    title: "RH & Carrière",
    icon: <User className="h-4 w-4 text-blue-500" />,
    questions: [
      "Quelle est la politique de télétravail ?",
      "Comment fonctionne l'évaluation annuelle ?",
      "Quelles sont les opportunités de formation ?"
    ]
  },
  {
    title: "Santé & Assurances",
    icon: <ShieldCheck className="h-4 w-4 text-green-500" />,
    questions: [
      "Détails de l'assurance médicale ?",
      "Comment demander un remboursement santé ?",
      "Couverture pour les soins dentaires ?"
    ]
  },
  {
    title: "Procédures Internes",
    icon: <BookOpen className="h-4 w-4 text-purple-500" />,
    questions: [
      "Procédure de demande de congé ?",
      "Comment déclarer ses notes de frais ?",
      "Convention collective applicable ?"
    ]
  }
]

function ChatSidebar({
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
}: {
  isOpen: boolean
  onClose: () => void
  onHistoryClick: () => void
  onLogout: () => void
  onNewChat: () => void
  onDashboardClick: () => void
  sessions: ChatSession[]
  currentSessionId: string | null
  onSessionClick: (id: string) => void
  isAdmin: boolean
}) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-border/50 px-4">
          <div className="flex items-center gap-2 font-semibold">
            <Bot className="h-5 w-5 text-primary" />
            <div className="flex flex-col leading-tight">
              <span className="font-display">Doc Mind</span>
              <span className="text-[10px] italic text-primary font-bold tracking-wide" style={{ fontFamily: "'Lucky Beauty', cursive" }}>by Ejara</span>
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
              onNewChat()
              if (window.innerWidth < 768) onClose()
            }}
          >
            <PlusCircle className="h-4 w-4" />
            Nouvelle discussion
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={onHistoryClick}
          >
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
                  className="w-full justify-start gap-3 text-left font-normal cursor-pointer"
                  onClick={() => {
                    onSessionClick(session.id)
                    if (window.innerWidth < 768) onClose()
                  }}
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate text-body">{session.title}</span>
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
  )
}

function ChatHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border/50 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <button
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex items-center justify-center gap-2">
        <EjaraLogo width={51} height={51} fill="currentColor" />
        <div className="pt-2">
          <EjaraTextLogo fill="currentColor" />
        </div>
      </div>
    </header>
  )
}

// --- MAIN CONTAINER ---

export function ChatPage() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const {
    messages,
    inputValue,
    setInputValue,
    inputError,
    setInputError,
    isLoading,
    rateLimited,
    feedbackModal,
    setFeedbackModal,
    scrollRef,
    handleSubmit,
    sendMessage,
    retryLastMessage,
    handleFeedback,
    clearSession,
    sessions,
    sessionId,
    MAX_LENGTH,
  } = useChat(id)

  const firstName = useMemo(() => {
    if (!user?.email) return ""
    const namePart = user.email.split("@")[0]
    const dotIndex = namePart.indexOf(".")
    const firstPart = dotIndex !== -1 ? namePart.split(".")[0] : namePart
    return firstPart.charAt(0).toUpperCase() + firstPart.slice(1)
  }, [user])

  return (
    <div className="flex h-screen bg-background font-sans text-foreground selection:bg-primary/20">
      <ChatSidebar
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
        <ChatHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef}>
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-32 sm:p-6 sm:pb-36">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col space-y-12 py-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {/* Hero section */}
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20 shadow-inner">
                    <Bot className="h-8 w-8" />
                  </div>
                  <h1 className="title-lg tracking-tight">
                    Bonjour{firstName ? `, ${firstName}` : ""} !
                  </h1>
                  <p className="mx-auto max-w-md text-body text-muted-foreground">
                    Je suis votre assistant documentaire intelligent. J'analyse nos ressources internes pour répondre à vos questions en un instant.
                  </p>
                </div>

                {/* Expertise Pillars */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EXPERTISE_CATEGORIES.map((cat, i) => (
                    <div key={i} className="flex flex-col space-y-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                          {cat.icon}
                        </div>
                        {cat.title}
                      </div>
                      <div className="flex flex-col gap-2">
                        {cat.questions.map((q, j) => (
                          <button
                            key={j}
                            onClick={() => sendMessage(q)}
                            className="text-left text-xs text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Proactive Tips & Privacy */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex items-start gap-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 p-4 border border-blue-100/50 dark:border-blue-900/20">
                    <Zap className="h-4 w-4 text-primary mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-primary dark:text-primary">Conseil d'utilisation</p>
                      <p className="text-[11px] text-primary/80 dark:text-primary/70 leading-relaxed">
                        Je garde le contexte en mémoire. Vous pouvez poser des questions de suivi comme : "Est-ce applicable à ma famille ?"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-start gap-3 rounded-xl bg-muted/30 p-4 border border-border/50">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Sécurité & Confidentialité</p>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
                        Vos échanges sont privés et sécurisés. Les réponses sont générées exclusivement à partir de nos documents internes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="group relative flex flex-col gap-2">
                <MessageBubble
                  role={msg.role}
                  content={msg.content}
                  responseTimeMs={msg.role === "assistant" ? msg.responseTimeMs : undefined}
                  isError={msg.isError}
                  errorType={msg.errorType}
                  onRetry={msg.isError ? retryLastMessage : undefined}
                />

                {msg.role === "assistant" && !msg.isError && msg.source && (
                  <div className="pl-12">
                    <SourceCitation source={msg.source} />
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
                        !msg.hasFeedback &&
                        setFeedbackModal({ isOpen: true, queryLogId: msg.queryLogId! })
                      }
                    >
                      {msg.hasFeedback ? "✓ Feedback envoyé" : "Signaler une erreur"}
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex flex-col gap-2">
                <MessageBubble role="assistant" content="" isLoading />
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
            <form
              onSubmit={handleSubmit}
              className={`relative flex items-end gap-2 rounded-2xl border bg-card p-1 shadow-sm transition-shadow focus-within:ring-1 focus-within:ring-ring ${
                inputError ? "border-destructive" : "border-input"
              }`}
            >
              <Input
                placeholder="Posez votre question..."
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (inputError) setInputError(null)
                }}
                disabled={isLoading || rateLimited}
                className="min-h-[44px] border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0 resize-none flex-1"
                autoFocus
                maxLength={MAX_LENGTH}
                autoComplete="off"
              />
              
              <div className="flex h-[44px] items-center pr-2">
                <Button
                  type="submit"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-xl"
                  disabled={isLoading || rateLimited || !inputValue.trim()}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Envoyer</span>
                </Button>
              </div>
            </form>
            
            {/* Footer / Error text */}
            <div className="mt-2 flex items-center justify-between px-2 text-[10px] text-muted-foreground">
              <span>
                {inputError ? (
                  <span className="text-destructive font-medium">{inputError}</span>
                ) : (
                  "L'assistant documentaire analyse les ressources internes pour vous répondre."
                )}
              </span>
              <span className={inputValue.length > MAX_LENGTH * 0.9 ? "text-destructive font-medium" : ""}>
                {inputValue.length} / {MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </main>

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        queryLogId={feedbackModal.queryLogId}
        onClose={() => setFeedbackModal({ isOpen: false, queryLogId: "" })}
        onSubmit={handleFeedback}
      />
    </div>
  )
}
