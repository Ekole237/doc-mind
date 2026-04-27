import {
  QUERY_LOG_REPOSITORY,
  type QueryLogRepository,
} from '#chat/domain/repositories/query-log.repository';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminGetSessionLogsUseCase {
  constructor(
    @Inject(QUERY_LOG_REPOSITORY)
    private readonly _queryLogRepository: QueryLogRepository,
  ) {}

  async execute(sessionId: string) {
    const logs = await this._queryLogRepository.findBySessionId(sessionId);

    if (!logs) {
      throw new NotFoundException('Session logs not found');
    }

    return logs;
  }
}
