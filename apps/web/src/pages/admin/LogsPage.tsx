import { admin } from "@/api/client"
import type { AdminQueryLog, ApiError } from "@/types"
import { Button } from "@workspace/ui/components/button"
import { Calendar as DateCalendar } from "@workspace/ui/components/calendar"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import type { FlexiFilterTableRow } from "@workspace/ui/components/flexi-filter-table"
import { FlexiFilterTable } from "@workspace/ui/components/flexi-filter-table"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import {
  AlertCircle,
  Bot,
  CalendarDays,
  Check,
  ChevronDown,
  Filter,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  User as UserIcon,
  X
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { AdminLayout } from "../../components/layout/AdminLayout"

const LIMIT = 15

const ROLE_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "employee", label: "Employé" },
  { value: "admin", label: "Admin" },
  { value: "guest", label: "Invité" },
] as const

function parseDateInput(value: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) {
    return undefined
  }

  return new Date(year, month - 1, day)
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getApiMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: ApiError } }
  return e.response?.data?.message ?? fallback
}

// ---- Conversation Modal ----
interface ConversationModalProps {
  sessionId: string
  onClose: () => void
}

function ConversationModal({ sessionId, onClose }: ConversationModalProps) {
  const [logs, setLogs] = useState<AdminQueryLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    admin
      .getSessionLogs(sessionId)
      .then(setLogs)
      .catch(() => setError("Impossible de charger l'historique"))
      .finally(() => setLoading(false))
  }, [sessionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="flex h-full max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-none">Conversation</h2>
              <p className="mt-1 text-xs text-muted-foreground">ID Session: {sessionId.substring(0, 8)}...</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-2 transition-colors hover:bg-muted"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading && (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary/40" />
              <p className="text-sm text-muted-foreground">Récupération des messages...</p>
            </div>
          )}
          
          {error && (
            <div className="flex h-64 flex-col items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          {!loading && !error && logs.map((log) => (
            <div key={log._id} className="space-y-6">
              {/* User Message */}
              <div className="flex flex-row-reverse items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm border border-primary">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-end max-w-[80%]">
                  <div className="rounded-2xl rounded-tr-none bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                    {log._question}
                  </div>
                  <span className="mt-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">Utilisateur</span>
                </div>
              </div>
              
              {/* Assistant Message */}
              <div className="flex flex-row items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border border-border shadow-sm">
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className={`rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm border ${
                    log._isIgnorance ? "bg-destructive/5 border-destructive/20 text-foreground" : "bg-muted/50 border-border/50 text-foreground"
                  }`}>
                    <div className="max-w-none prose prose-sm dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed whitespace-pre-wrap wrap-break-word">{children}</p>,
                          ul: ({ children }) => <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="marker:text-muted-foreground/60">{children}</li>,
                          strong: ({ children }) => <strong className="font-bold text-primary">{children}</strong>,
                        }}
                      >
                        {log._answer}
                      </ReactMarkdown>
                    </div>
                    {log._isIgnorance && (
                      <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2 py-1.5 text-[10px] font-medium text-destructive">
                        <HelpCircle className="h-3.5 w-3.5" />
                        Sans réponse pertinente trouvée.
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 px-1">
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Assistant</span>
                    {log._responseTimeMs > 0 && (
                      <span className="text-[10px] text-muted-foreground/40">• {log._responseTimeMs}ms</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Main Component ----
export function LogsPage() {
  const [logs, setLogs] = useState<AdminQueryLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)

  // Filters (staged — applied on button click)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [role, setRole] = useState("")
  const [flagged, setFlagged] = useState(false)
  const [ignorance, setIgnorance] = useState(false)

  const fetchLogs = useCallback((p: number) => {
    setIsLoading(true)
    setError("")
    admin
      .listLogs({
        from: from || undefined,
        to: to || undefined,
        role: role || undefined,
        flagged: flagged || undefined,
        ignorance: ignorance || undefined,
        page: p,
        limit: LIMIT,
      })
      .then((data) => {
        setLogs(data)
        setPage(p)
      })
      .catch((err) => setError(getApiMessage(err, "Erreur lors du chargement des logs")))
      .finally(() => setIsLoading(false))
  }, [from, to, role, flagged, ignorance])


  useEffect(() => {
    const fetch = async () => fetchLogs(1)
    void fetch()
  }, [fetchLogs])

  const handleApply = () => fetchLogs(1)

  const handleReset = () => {
    setFrom(""); setTo(""); setRole(""); setFlagged(false); setIgnorance(false)
    // We use a small timeout to let the state update before fetching, 
    // or better: manually pass empty values to fetchLogs.
    setIsLoading(true)
    admin.listLogs({ page: 1, limit: LIMIT })
      .then((data) => {
        setLogs(data)
        setPage(1)
      })
      .finally(() => setIsLoading(false))
  }

  const tableRows: FlexiFilterTableRow[] = logs.map((log) => ({
    id: log._id,
    sessionId: log._chatSessionId,
    question: log._question,
    role: log._role,
    flagged: log._isFlagged,
    ignorance: log._isIgnorance,
    responseTimeMs: log._responseTimeMs,
    timestamp: log._timestamp,
  }))

  return (
    <AdminLayout currentPage="logs">
      <div className="flex flex-col h-full space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logs d'activité</h1>
            <p className="text-muted-foreground text-sm">Surveillez et analysez les interactions avec l'IA.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-fit gap-2" 
            onClick={() => fetchLogs(page)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Rafraîchir
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Filters Toolbar */}
        <div className="rounded-xl border border-border bg-card p-2 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Group */}
            <div className="flex flex-wrap items-center gap-1 rounded-lg bg-muted/50 p-1 sm:flex-nowrap sm:gap-2">
              <div className="flex items-center gap-2 px-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="hidden text-xs font-medium uppercase tracking-wider sm:inline">Dates</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-28.75 justify-start px-2 text-[11px] font-medium sm:w-32 sm:text-xs"
                    >
                      {from || "Début"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <DateCalendar
                      mode="single"
                      selected={parseDateInput(from)}
                      onSelect={(date) => setFrom(date ? formatDateInput(date) : "")}
                    />
                  </PopoverContent>
                </Popover>
                <span className="text-muted-foreground/30">—</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-28.75 justify-start px-2 text-[11px] font-medium sm:w-32 sm:text-xs"
                    >
                      {to || "Fin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2" align="start">
                    <DateCalendar
                      mode="single"
                      selected={parseDateInput(to)}
                      onSelect={(date) => setTo(date ? formatDateInput(date) : "")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Role Group */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1">
              <div className="flex items-center gap-2 px-2 text-muted-foreground">
                <UserIcon className="h-4 w-4 shrink-0" />
                <span className="hidden text-xs font-medium uppercase tracking-wider sm:inline">Rôle</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 px-2 text-[11px] font-medium sm:text-xs"
                  >
                    {ROLE_OPTIONS.find((option) => option.value === role)?.label ?? "Tous"}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {ROLE_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value || "all"}
                      onClick={() => setRole(option.value)}
                      className="flex items-center justify-between gap-2"
                    >
                      {option.label}
                      {role === option.value && <Check className="h-3.5 w-3.5" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Toggles Group */}
            <div className="flex items-center gap-4 px-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors hover:text-primary">
                <Checkbox checked={flagged} onCheckedChange={(checked) => setFlagged(checked === true)} />
                Signalés
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors hover:text-primary">
                <Checkbox checked={ignorance} onCheckedChange={(checked) => setIgnorance(checked === true)} />
                Sans réponse
              </label>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset} 
                disabled={isLoading}
                className="h-8 text-xs text-muted-foreground"
              >
                Réinitialiser
              </Button>
              <Button 
                size="sm" 
                onClick={handleApply} 
                disabled={isLoading}
                className="h-8 gap-2 text-xs font-bold"
              >
                <Filter className="h-3.5 w-3.5" />
                Appliquer
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-100">
          <FlexiFilterTable
            data={tableRows}
            onViewSession={(sessionId) => setSelectedSessionId(sessionId)}
          />
        </div>

        {/* Conversation View Overlay */}
        {selectedSessionId && (
          <ConversationModal 
            sessionId={selectedSessionId} 
            onClose={() => setSelectedSessionId(null)} 
          />
        )}
      </div>
    </AdminLayout>
  )
}
