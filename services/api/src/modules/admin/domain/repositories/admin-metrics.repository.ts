export const ADMIN_METRICS_REPOSITORY = Symbol('AdminMetricsRepository');

export interface AdminMetrics {
  totalUsers: number;
  activeUsersMonth: number;
  averageSessionsPerUser: number;
}

export interface AdminMetricsRepository {
  getUsageMetrics(): Promise<AdminMetrics>;
}
