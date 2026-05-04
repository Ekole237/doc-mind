import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@workspace/ui/components/data-table"
import { useEffect, useMemo, useState } from "react"
import { admin } from "@/api/client.ts"
import { MetricCard } from "../../components/admin/MetricCard"
import { AdminLayout } from "../../components/layout/AdminLayout"
import type { DashboardMetrics } from "@/types"

interface DashboardMetricRow {
  id: string
  indicator: string
  category: string
  value: number
}

function formatMetricValue(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value)
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  useEffect(() => {
    admin
      .getDashboard()
      .then(setMetrics)
      .catch(() => setError("Erreur lors du chargement du tableau de bord"))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [search])

  const metricRows = useMemo<DashboardMetricRow[]>(() => {
    if (!metrics) return []

    return [
      {
        id: "documents_indexed",
        indicator: "Documents indexés",
        category: "Documents",
        value: metrics.documentsIndexed,
      },
      {
        id: "documents_pending",
        indicator: "En attente d'indexation",
        category: "Documents",
        value: metrics.documentsPending,
      },
      {
        id: "feedbacks_pending",
        indicator: "Signalements en attente",
        category: "Qualité",
        value: metrics.feedbacksPending,
      },
      {
        id: "queries_this_month",
        indicator: "Requêtes ce mois",
        category: "Usage",
        value: metrics.queriesThisMonth,
      },
      {
        id: "total_users",
        indicator: "Utilisateurs totaux",
        category: "Utilisateurs",
        value: metrics.totalUsers,
      },
      {
        id: "active_users_month",
        indicator: "Utilisateurs actifs (Mois)",
        category: "Utilisateurs",
        value: metrics.activeUsersMonth,
      },
      {
        id: "average_sessions_per_user",
        indicator: "Moy. Sessions/Utilisateur",
        category: "Utilisateurs",
        value: metrics.averageSessionsPerUser,
      },
    ]
  }, [metrics])

  const filteredMetricRows = useMemo(() => {
    const trimmedSearch = search.trim().toLowerCase()
    if (!trimmedSearch) return metricRows

    return metricRows.filter(
      (row) =>
        row.indicator.toLowerCase().includes(trimmedSearch) ||
        row.category.toLowerCase().includes(trimmedSearch)
    )
  }, [metricRows, search])

  const paginatedMetricRows = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return filteredMetricRows.slice(start, end)
  }, [filteredMetricRows, pagination.pageIndex, pagination.pageSize])

  const columns: ColumnDef<DashboardMetricRow>[] = [
    {
      accessorKey: "indicator",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Indicateur" />,
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Catégorie" />,
      cell: (info) => <span className="text-xs text-muted-foreground">{info.getValue() as string}</span>,
    },
    {
      accessorKey: "value",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Valeur" />,
      cell: (info) => (
        <span className="font-semibold tabular-nums">
          {formatMetricValue(info.getValue() as number)}
        </span>
      ),
    },
  ]

  return (
    <AdminLayout currentPage="dashboard">
      <div className="p-6">
        <h1 className="mb-6 title-lg">Tableau de bord</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 p-4 text-destructive">{error}</div>
        )}

        {isLoading && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isLoading && metrics && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Documents indexés" value={metrics.documentsIndexed} />
              <MetricCard
                label="En attente d'indexation"
                value={metrics.documentsPending}
                variant="warning"
              />
              <MetricCard
                label="Signalements en attente"
                value={metrics.feedbacksPending}
                variant="danger"
              />
              <MetricCard label="Requêtes ce mois" value={metrics.queriesThisMonth} />

              <MetricCard label="Utilisateurs totaux" value={metrics.totalUsers} />
              <MetricCard label="Utilisateurs actifs (Mois)" value={metrics.activeUsersMonth} />
              <MetricCard label="Moy. Sessions/Utilisateur" value={metrics.averageSessionsPerUser} />
            </div>

            <div className="mt-6">
              <DataTable
                columns={columns}
                data={paginatedMetricRows}
                totalCount={filteredMetricRows.length}
                pagination={pagination}
                onPaginationChange={setPagination}
                withSearch
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Rechercher une métrique..."
                emptyMessage="Aucune métrique"
              />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
