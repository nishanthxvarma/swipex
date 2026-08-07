import { ApiClient } from './client';
import {
  ActiveResumeResponse,
  ATSScoreResult,
  HealthReport,
  AiSuggestion,
  JobMatchResult,
  SkillGapAnalysis,
  JobRecommendation,
  ResumeVersion,
  ResumeAnalytics,
} from '@swipex/types';

export class ResumeApi {
  constructor(private client: ApiClient) {}

  public async uploadResume(file: File): Promise<ActiveResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.post<ActiveResumeResponse>('/resumes/uploadResume', formData);
  }

  public async getActiveResume(): Promise<ActiveResumeResponse> {
    return this.client.get<ActiveResumeResponse>('/resumes/active');
  }

  public async getResumeVersions(): Promise<ResumeVersion[]> {
    return this.client.get<ResumeVersion[]>('/resumes/versions');
  }

  public async getResumeById(id: string): Promise<ActiveResumeResponse> {
    return this.client.get<ActiveResumeResponse>(`/resumes/${id}`);
  }

  public async deleteResume(id: string): Promise<{ success: boolean; message: string }> {
    return this.client.delete<{ success: boolean; message: string }>(`/resumes/${id}`);
  }

  public async setActiveResume(id: string): Promise<ActiveResumeResponse> {
    return this.client.post<ActiveResumeResponse>(`/resumes/setActive/${id}`);
  }

  public async analyzeResume(id?: string): Promise<{ healthReport: HealthReport; suggestions: AiSuggestion[] }> {
    return this.client.post<{ healthReport: HealthReport; suggestions: AiSuggestion[] }>('/resumes/analyzeResume', {
      resumeId: id,
    });
  }

  public async calculateATS(id?: string): Promise<ATSScoreResult> {
    return this.client.post<ATSScoreResult>('/resumes/calculateATS', {
      resumeId: id,
    });
  }

  public async matchJob(payload: { jobId?: string; jobDescription?: string; resumeId?: string }): Promise<{
    matchResult: JobMatchResult;
    skillGap: SkillGapAnalysis;
  }> {
    return this.client.post<{
      matchResult: JobMatchResult;
      skillGap: SkillGapAnalysis;
    }>('/resumes/matchJob', payload);
  }

  public async getRecommendJobs(resumeId?: string): Promise<JobRecommendation[]> {
    return this.client.get<JobRecommendation[]>('/resumes/recommendJobs', {
      params: { resumeId },
    });
  }

  public async getResumeAnalytics(): Promise<ResumeAnalytics> {
    return this.client.get<ResumeAnalytics>('/resumes/resumeAnalytics');
  }
}
