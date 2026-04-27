import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AdminMetrics,
  AdminMetricsRepository,
} from '#admin/domain/repositories/admin-metrics.repository';

@Injectable()
export class AdminMetricsRepositoryImplementation
  implements AdminMetricsRepository
{
  constructor(private readonly _prismaService: PrismaService) {}

  async getUsageMetrics(): Promise<AdminMetrics> {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    const [totalRegisteredUsers, totalGuestTokens] = await Promise.all([
      this._prismaService.user.count(),
      this._prismaService.guestToken.count(),
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

    return {
      totalUsers: totalRegisteredUsers + totalGuestTokens,
      activeUsersMonth: activeUsersCount,
      averageSessionsPerUser: parseFloat(averageSessionsPerUser.toFixed(2)),
    };
  }
}
