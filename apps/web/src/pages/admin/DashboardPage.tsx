import { Eye, Users, MessageSquareWarning } from "lucide-react"
import { useEffect, useState } from "react"
import { admin } from "@/api/client.ts"
import { MetricCard } from "../../components/admin/MetricCard"
import { AdminLayout } from "../../components/layout/AdminLayout"
import { 
  QueryVolumeChart, 
  DailyActivityChart, 
  DocumentStatusDistributionChart 
} from "../../components/admin/DashboardCharts"
import { RecentFeedbacksTable } from "../../components/admin/IntegrationsTable"
import type { DashboardMetrics, AdminFeedback } from "@/types"

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [feedbacks, setFeedbacks] = useState<AdminFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      admin.getDashboard(),
      admin.listFeedbacks("PENDING", 1)
    ])
      .then(([metricsData, feedbacksData]) => {
        setMetrics(metricsData)
        setFeedbacks(feedbacksData.feedbacks)
      })
      .catch(() => setError("Erreur lors du chargement des données"))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !metrics) {
    return (
      <AdminLayout currentPage="dashboard">
        <div className="p-8 text-center text-destructive">{error || "Une erreur est survenue"}</div>
      </AdminLayout>
    )
  }

  const ignoranceRate = metrics.queriesThisMonth > 0 
    ? ((metrics.queriesIgnoranceCount / metrics.queriesThisMonth) * 100).toFixed(1)
    : "0.0"

  return (
    <AdminLayout currentPage="dashboard">
      <div className="gaps-2 mb-6 flex flex-col">
        <h1 className="title-lg text-3xl">Administration</h1>
        <span className="text-sm text-muted-foreground">
          Gérez votre administration.
        </span>
      </div>
      {/* Top Row: Metric Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          label="Requêtes (mois)"
          value={metrics.queriesThisMonth.toLocaleString()}
          trend={{ value: 12.5, isPositive: true }}
          icon={<Eye className="h-4 w-4" />}
        />
        <MetricCard
          label="Nombre total d'utilisateurs"
          value={metrics.totalUsers.toLocaleString()}
          trend={{ value: 5.2, isPositive: true }}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          label="Taux d'ignorance"
          value={`${ignoranceRate}%`}
          trend={{ value: 2.1, isPositive: false }}
          icon={<MessageSquareWarning className="h-4 w-4" />}
        />
      </div>

      {/* Middle Row: Activity Overview & Daily Queries */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <QueryVolumeChart data={metrics.dailyQueryStats} />
        <DailyActivityChart data={metrics.dailyQueryStats} />
      </div>

      {/* Bottom Row: Document Distribution & Recent Feedbacks */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <DocumentStatusDistributionChart
          data={metrics.documentStatusDistribution}
        />
        <RecentFeedbacksTable feedbacks={feedbacks} />
      </div>
    </AdminLayout>
  )
}
