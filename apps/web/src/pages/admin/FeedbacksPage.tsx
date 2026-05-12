import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { DataTable, DataTableColumnHeader } from "@workspace/ui/components/data-table"
import { CheckCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { admin } from "@/api/client"
import { AdminLayout } from "../../components/layout/AdminLayout"
import type { AdminFeedback, ApiError } from "@/types"

type StatusFilter = "all" | "PENDING" | "RESOLVED"

const LIMIT = 10
type FeedbackRow = AdminFeedback & { _title: string }

function getApiMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: ApiError } }
  return e.response?.data?.message ?? fallback
}

export function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: LIMIT })
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError("")
    admin
      .listFeedbacks(statusFilter, pagination.pageIndex + 1)
      .then((data) => {
        setFeedbacks(data.feedbacks ?? [])
        setTotal(data.total ?? 0)
      })
      .catch((err) => setError(getApiMessage(err, "Erreur lors du chargement")))
      .finally(() => setIsLoading(false))
  }, [pagination.pageIndex, statusFilter])

  const handleResolve = async (id: string) => {
    setActionLoading(id)
    try {
      await admin.resolveFeedback(id)
      if (statusFilter === "PENDING") {
        setFeedbacks((prev) => prev.filter((f) => f.id !== id))
        setTotal((prev) => Math.max(0, prev - 1))
      } else {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === id ? { ...f, status: "RESOLVED" as const } : f))
        )
      }
    } catch (err) {
      setError(getApiMessage(err, "Erreur lors de la résolution"))
    } finally {
      setActionLoading(null)
    }
  }

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: "PENDING", label: "En attente" },
    { id: "RESOLVED", label: "Résolus" },
    { id: "all", label: "Tous" },
  ]

  const feedbackRows = useMemo<FeedbackRow[]>(
    () =>
      feedbacks.map((fb) => ({
        ...fb,
        _title: fb.comment?.trim() || `Signalement ${fb.id.slice(0, 8)}`,
      })),
    [feedbacks]
  )

  const columns: ColumnDef<FeedbackRow>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: (info) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {new Date(info.getValue() as string).toLocaleDateString("fr-FR")}
        </span>
      ),
    },
    {
      accessorKey: "comment",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Commentaire" />,
      cell: (info) => (
        <span className="line-clamp-2 text-xs">
          {(info.getValue() as string | null) ?? (
            <em className="text-muted-foreground">—</em>
          )}
        </span>
      ),
    },
    {
      accessorKey: "queryLogId",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Log ID" />,
      cell: (info) => {
        const queryLogId = info.getValue() as string
        return <span className="font-mono text-xs text-muted-foreground">{queryLogId.slice(0, 8)}…</span>
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Statut" />,
      cell: (info) => {
        const status = info.getValue() as AdminFeedback["status"]
        return (
          <Badge variant={status === "PENDING" ? "pending" : "success"}>
            {status === "PENDING" ? "En attente" : "Résolu"}
          </Badge>
        )
      },
    },
    {
      id: "action",
      header: "Action",
      enableSorting: false,
      cell: (info) => {
        const feedback = info.row.original
        if (feedback.status !== "PENDING") {
          return <span className="text-xs text-muted-foreground">—</span>
        }

        return (
          <Button
            size="sm"
            className="gap-1"
            disabled={actionLoading === feedback.id}
            onClick={() => void handleResolve(feedback.id)}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Résoudre
          </Button>
        )
      },
    },
  ]

  return (
    <AdminLayout currentPage="feedbacks">
      <div className="p-6">
        <div className="flex flex-col mb-6">
          <h1 className="text-3xl title-lg tracking-tighter">Signalements</h1>
          <span className="text-muted-foreground text-sm">Gérez et supervisez vos signalements.</span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
        )}

        {/* Tab-like filter */}
        <div className="mb-4 flex gap-2 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
              className={`rounded-t px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === tab.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <DataTable
          columns={columns}
          data={feedbackRows}
          totalCount={total}
          pagination={pagination}
          onPaginationChange={setPagination}
          isLoading={isLoading}
          emptyMessage="Aucun signalement"
        />
      </div>
    </AdminLayout>
  )
}
