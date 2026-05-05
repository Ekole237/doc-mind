import { QueryLogEntity } from 'src/core/domain/entities/query-log.entity';

export const QUERY_LOG_REPOSITORY = Symbol('QueryLogRepository');

export interface QueryLogRepository {
  save(log: QueryLogEntity): Promise<void>;
  findById(id: string): Promise<QueryLogEntity | null>;
  findBySessionId(sessionId: string, limit?: number): Promise<QueryLogEntity[]>;
  findByUserHash(
    userHash: string,
    page: number,
    limit: number,
  ): Promise<QueryLogEntity[]>;
  countByUserHash(userHash: string): Promise<number>;
  flagById(id: string): Promise<void>;
}
