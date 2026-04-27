import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { 
  X, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  HelpCircle, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MessageSquare,
  RefreshCw
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { admin } from "../../api/client"
import { AdminLayout } from "../../components/layout/AdminLayout"
import type { AdminQueryLog, ApiError } from "../../types"

const LIMIT = 15

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
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <div key={log._id} className="space-y-4">
              {/* User Message */}
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-primary px-4 py-3 text-sm text-primary-foreground shadow-sm">
                  {log._question}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Utilisateur</span>
                </div>
              </div>
              
              {/* Assistant Message */}
              <div className="flex flex-col items-start">
                <div className={`max-w-[85%] rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm ${
                  log._isIgnorance ? "bg-destructive/5 border border-destructive/20" : "bg-muted/50 border border-border/50"
                }`}>
                  {log._answer}
                  {log._isIgnorance && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2 py-1.5 text-[11px] font-medium text-destructive">
                      <HelpCircle className="h-3.5 w-3.5" />
                      L'IA n'a pas trouvé de réponse pertinente.
                    </div>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Assistant</span>
                  {log._responseTimeMs > 0 && (
                    <span className="text-[10px] text-muted-foreground/50">• {log._responseTimeMs}ms</span>
                  )}
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

  // Auto-load on mount
  useEffect(() => {
    fetchLogs(1)
  }, [])

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

  return (
    <AdminLayout currentPage="logs">
      <div className="flex flex-col h-full space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Logs d'activité</h1>
            <p className="text-muted-foreground">Surveillez et analysez les interactions avec l'IA.</p>
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
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="hidden text-xs font-medium uppercase tracking-wider sm:inline">Dates</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Input 
                  type="date" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)}
                  className="h-8 w-[115px] border-none bg-transparent p-0 text-[11px] focus-visible:ring-0 sm:w-32 sm:px-1 sm:text-xs" 
                />
                <span className="text-muted-foreground/30">—</span>
                <Input 
                  type="date" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)}
                  className="h-8 w-[115px] border-none bg-transparent p-0 text-[11px] focus-visible:ring-0 sm:w-32 sm:px-1 sm:text-xs" 
                />
              </div>
            </div>

            {/* Role Group */}
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-1">
              <div className="flex items-center gap-2 px-2 text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden text-xs font-medium uppercase tracking-wider sm:inline">Rôle</span>
              </div>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-8 bg-transparent px-2 text-[11px] font-medium focus:outline-none sm:text-xs"
              >
                <option value="">Tous</option>
                <option value="employee">Employé</option>
                <option value="admin">Admin</option>
                <option value="guest">Invité</option>
              </select>
            </div>

            {/* Toggles Group */}
            <div className="flex items-center gap-4 px-2">
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors hover:text-primary">
                <input
                  type="checkbox"
                  checked={flagged}
                  onChange={(e) => setFlagged(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
                Signalés
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium transition-colors hover:text-primary">
                <input
                  type="checkbox"
                  checked={ignorance}
                  onChange={(e) => setIgnorance(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                />
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
        <div className="flex-1 min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Aucun log trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">Essayez d'ajuster vos filtres pour voir plus de résultats.</p>
              <Button variant="link" onClick={handleReset} className="mt-2 text-primary">Effacer tous les filtres</Button>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Desktop View */}
              <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-4 text-left font-semibold text-muted-foreground">Moment</th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-foreground">Interaction</th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-foreground">Profil</th>
                      <th className="px-4 py-4 text-left font-semibold text-muted-foreground">Statut</th>
                      <th className="px-4 py-4 text-right font-semibold text-muted-foreground">Perf</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {logs.map((log) => (
                      <tr 
                        key={log._id} 
                        className="group cursor-pointer transition-colors hover:bg-primary/[0.02]"
                        onClick={() => log._chatSessionId && setSelectedSessionId(log._chatSessionId)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {new Date(log._timestamp).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {new Date(log._timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[400px] space-y-1">
                            <p className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{log._question}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{log._answer}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="outline" className="capitalize border-border/60 bg-muted/30 font-medium text-[11px]">
                            {log._role}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-1.5">
                            {log._isFlagged && (
                              <Badge variant="pending" className="px-1.5 py-0 text-[10px] h-5">Signalé</Badge>
                            )}
                            {log._isIgnorance && (
                              <Badge variant="destructive" className="px-1.5 py-0 text-[10px] h-5">Échec RAG</Badge>
                            )}
                            {!log._isFlagged && !log._isIgnorance && (
                              <Badge variant="success" className="px-1.5 py-0 text-[10px] h-5 opacity-70">OK</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right tabular-nums">
                          <span className={`text-xs font-medium ${
                            log._responseTimeMs > 2000 ? "text-orange-500" : "text-muted-foreground"
                          }`}>
                            {log._responseTimeMs}ms
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="space-y-3 md:hidden">
                {logs.map((log) => (
                  <div 
                    key={log._id} 
                    className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm active:scale-[0.98] transition-transform"
                    onClick={() => log._chatSessionId && setSelectedSessionId(log._chatSessionId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/40" />
                        <span className="text-xs font-bold text-foreground">
                          {new Date(log._timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        {log._isFlagged && <Badge variant="pending" className="text-[9px] px-1 h-4">Signalé</Badge>}
                        {log._isIgnorance && <Badge variant="destructive" className="text-[9px] px-1 h-4">Échec</Badge>}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{log._question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{log._answer}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] capitalize h-4 px-1.5">{log._role}</Badge>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{log._responseTimeMs}ms</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Bar */}
              <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-muted/30 p-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-medium"
                  onClick={() => fetchLogs(page - 1)} 
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-2 px-3">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Page</span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                    {page}
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1.5 h-8 text-xs font-medium"
                  onClick={() => fetchLogs(page + 1)} 
                  disabled={logs.length < LIMIT || isLoading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
