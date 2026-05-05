export const ADMIN_METRICS_REPOSITORY = Symbol('AdminMetricsRepository');

export interface DailyStat {
  date: string;
  count: number;
}

export interface DocumentDistribution {
  name: string;
  value: number;
}

export interface AdminMetrics {
  totalUsers: number;
  activeUsersMonth: number;
  averageSessionsPerUser: number;
  queriesIgnoranceCount: number;
  dailyQueryStats: DailyStat[];
  documentStatusDistribution: DocumentDistribution[];
}

export interface AdminMetricsRepository {
  getUsageMetrics(): Promise<AdminMetrics>;
}
