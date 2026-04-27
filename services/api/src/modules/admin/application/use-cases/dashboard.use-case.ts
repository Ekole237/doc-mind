import { DocumentStatus } from '#admin/domain/enums/document-status';
import {
  ADMIN_METRICS_REPOSITORY,
  type AdminMetricsRepository,
} from '#admin/domain/repositories/admin-metrics.repository';
import {
  DOCUMENT_REPOSITORY,
  type DocumentRepository,
} from '#admin/domain/repositories/document.repository';
import {
  FEEDBACK_REPOSITORY,
  type FeedbackRepository,
} from '#admin/domain/repositories/feedback.repository';
import {
  QUERY_LOGS_REPOSITORY,
  type QueryLogsRepository,
} from '#admin/domain/repositories/query-logs.repository';
import { Inject, Injectable } from '@nestjs/common';
import { FeedbackStatus } from 'src/core/domain/enums/feedback-status';

@Injectable()
export class DashboardUseCase {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly _documentRepository: DocumentRepository,
    @Inject(FEEDBACK_REPOSITORY)
    private readonly _feedbackRepository: FeedbackRepository,
    @Inject(QUERY_LOGS_REPOSITORY)
    private readonly _queryLogsRepository: QueryLogsRepository,
    @Inject(ADMIN_METRICS_REPOSITORY)
    private readonly _adminMetricsRepository: AdminMetricsRepository,
  ) {}

  async execute() {
    const [
      docsIndexed,
      docsPending,
      feedbacksPending,
      queriesCount,
      usageMetrics,
    ] = await Promise.all([
      this._documentRepository.countByStatus(DocumentStatus.INDEXED),
      this._documentRepository.countByStatus(DocumentStatus.PENDING),
      this._feedbackRepository.countByStatus(FeedbackStatus.PENDING),
      this._queryLogsRepository.requestCount({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        to: new Date(),
        page: 1,
        limit: 10,
      }),
      this._adminMetricsRepository.getUsageMetrics(),
    ]);

    return {
      documentsIndexed: docsIndexed,
      documentsPending: docsPending,
      feedbacksPending: feedbacksPending,
      queriesThisMonth: queriesCount,
      ...usageMetrics,
    };
  }
}
