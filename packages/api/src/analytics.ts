import { ApiClient } from './client';
import {
  CandidateAnalyticsSummary,
  RecruiterAnalyticsSummary,
} from '@swipex/types';

export class AnalyticsApi {
  constructor(private client: ApiClient) {}

  public async getCandidateAnalytics(
    timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<CandidateAnalyticsSummary> {
    return this.client.get<CandidateAnalyticsSummary>(
      `/analytics/candidate?timeRange=${timeRange}`
    );
  }

  public async getRecruiterAnalytics(
    timeRange: '7d' | '30d' | '90d' | 'all' = '30d'
  ): Promise<RecruiterAnalyticsSummary> {
    return this.client.get<RecruiterAnalyticsSummary>(
      `/analytics/recruiter?timeRange=${timeRange}`
    );
  }
}
