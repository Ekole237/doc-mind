import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AdminMetrics,
  AdminMetricsRepository,
} from '#admin/domain/repositories/admin-metrics.repository';

@Injectable()
export class AdminMetricsRepositoryImplementation implements AdminMetricsRepository {
  constructor(private readonly _prismaService: PrismaService) {}

  async getUsageMetrics(): Promise<AdminMetrics> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const [
      totalRegisteredUsers,
      totalGuestTokens,
      queriesIgnoranceCount,
      dailyQueries,
      documentStats,
    ] = await Promise.all([
      this._prismaService.user.count(),
      this._prismaService.guestToken.count(),
      this._prismaService.queryLog.count({
        where: {
          isIgnorance: true,
          timestamp: { gte: firstDayOfMonth },
        },
      }),
      this._prismaService.queryLog.groupBy({
        by: ['timestamp'],
        where: {
          timestamp: { gte: sevenDaysAgo },
        },
        _count: { id: true },
      }),
      this._prismaService.document.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const activeUsers = await this._prismaService.queryLog.groupBy({
      by: ['userIdHash'],
      where: {
        timestamp: {
          gte: firstDayOfMonth,
        },
      },
    });

    const activeUsersCount = activeUsers.length;

    const totalSessionsMonth = await this._prismaService.chatSession.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
        },
      },
    });

    const averageSessionsPerUser =
      activeUsersCount > 0 ? totalSessionsMonth / activeUsersCount : 0;

    // Process daily queries into DailyStat[]
    const dailyStatsMap = new Map<string, number>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      dailyStatsMap.set(d.toISOString().split('T')[0], 0);
    }

    dailyQueries.forEach((dq) => {
      const dateKey = dq.timestamp.toISOString().split('T')[0];
      if (dailyStatsMap.has(dateKey)) {
        dailyStatsMap.set(dateKey, dailyStatsMap.get(dateKey)! + dq._count.id);
      }
    });

    const dailyQueryStats = Array.from(dailyStatsMap.entries())
      .map(([date, count]) => ({ date, count }))
      .reverse();

    const documentStatusDistribution = documentStats.map((ds) => ({
      name: ds.status,
      value: ds._count.id,
    }));

    return {
      totalUsers: totalRegisteredUsers + totalGuestTokens,
      activeUsersMonth: activeUsersCount,
      averageSessionsPerUser: parseFloat(averageSessionsPerUser.toFixed(2)),
      queriesIgnoranceCount,
      dailyQueryStats,
      documentStatusDistribution,
    };
  }
}
