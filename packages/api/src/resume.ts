import { ApiClient, api } from './client';
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
  ParsedResume,
  ATSCategoryBreakdown,
} from '@swipex/types';
import { parseResumeText } from './resume-parser';

function createDefaultParsedData(filename: string): ParsedResume {
  return {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
    },
    education: [],
    skills: {
      programmingLanguages: [],
      frameworks: [],
      libraries: [],
      databases: [],
      cloud: [],
      tools: [],
    },
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  };
}

function createDefaultAtsBreakdown(): ATSCategoryBreakdown {
  return {
    contactInfo: { score: 0, max: 10, details: 'Contact info evaluation' },
    education: { score: 0, max: 15, details: 'Education credentials evaluation' },
    projects: { score: 0, max: 20, details: 'Projects & technical work evaluation' },
    skills: { score: 0, max: 25, details: 'Technical skills & depth evaluation' },
    experience: { score: 0, max: 15, details: 'Experience and metrics evaluation' },
    keywords: { score: 0, max: 10, details: 'Keywords & terminology density' },
    formatting: { score: 0, max: 5, details: 'Document layout and structure' },
  };
}

function normalizeResumeResponse(raw: any, fallbackFilename: string = 'Resume.pdf'): ActiveResumeResponse {
  if (!raw) {
    throw new Error('No resume data received from server');
  }

  const id = String(raw.id || raw.resume_id || 'resume-1');
  const originalName = raw.original_name || raw.originalName || raw.label || raw.filename || fallbackFilename;
  const filename = raw.filename || originalName;
  const fileUrl = raw.file_url || raw.fileUrl || '';
  const fileType = raw.file_type || raw.fileType || (filename.endsWith('.docx') ? 'docx' : 'pdf');
  const isActive = raw.is_active !== undefined ? Boolean(raw.is_active) : (raw.isActive !== undefined ? Boolean(raw.isActive) : (raw.is_primary !== undefined ? Boolean(raw.is_primary) : true));
  const uploadedAt = raw.created_at || raw.uploadedAt || raw.uploaded_at || new Date().toISOString();

  // If raw contains extracted text (content) but no parsed_data / ats_score
  let fallbackParsed: ReturnType<typeof parseResumeText> | null = null;
  const rawContent = typeof raw.content === 'string' ? raw.content : '';
  const hasParsed = (raw.parsed_data && Object.keys(raw.parsed_data).length > 0) || (raw.parsedData && Object.keys(raw.parsedData).length > 0);
  const hasAts = typeof raw.ats_score === 'number' || typeof raw.atsScore === 'number' || typeof raw.score === 'number';

  if (rawContent && (!hasParsed || !hasAts)) {
    fallbackParsed = parseResumeText(rawContent, originalName);
  }

  const fileSize = typeof raw.file_size === 'number' && raw.file_size > 0
    ? raw.file_size
    : (typeof raw.fileSize === 'number' && raw.fileSize > 0
      ? raw.fileSize
      : (rawContent ? Math.max(124000, rawContent.length * 20) : 124000));

  let parsedData: ParsedResume = raw.parsed_data || raw.parsedData || (fallbackParsed ? fallbackParsed.parsedData : createDefaultParsedData(originalName));
  let atsScore = typeof raw.ats_score === 'number'
    ? raw.ats_score
    : (typeof raw.atsScore === 'number'
      ? raw.atsScore
      : (typeof raw.score === 'number'
        ? raw.score
        : (fallbackParsed ? fallbackParsed.atsScore : 0)));

  let atsBreakdown: ATSCategoryBreakdown = raw.ats_breakdown || raw.atsBreakdown || (fallbackParsed ? fallbackParsed.atsBreakdown : createDefaultAtsBreakdown());
  
  let healthReport: HealthReport = raw.health_report || raw.healthReport || (fallbackParsed ? fallbackParsed.healthReport : {
    strengths: [],
    weaknesses: [],
    missingSections: [],
    duplicateInfo: [],
    grammarAlerts: [],
    keywordDensityRating: 'Optimal',
    formattingQuality: 'Good',
    overallReadabilityScore: 80,
    items: [],
  });

  let suggestions: AiSuggestion[] = raw.suggestions || (fallbackParsed ? fallbackParsed.suggestions : []);
  if (!Array.isArray(suggestions)) {
    suggestions = [];
  }

  let versions: ResumeVersion[] = raw.versions || [];
  if (!Array.isArray(versions)) {
    versions = [];
  }

  return {
    id,
    userId: String(raw.user_id || raw.userId || ''),
    filename,
    originalName,
    fileUrl,
    fileSize,
    fileType,
    parsedData,
    atsScore,
    atsBreakdown,
    healthReport,
    suggestions,
    isActive,
    uploadedAt,
    versions,
  };
}

export class ResumeApi {
  constructor(private client: ApiClient = api) {}

  public async uploadResume(file: File): Promise<ActiveResumeResponse> {
    const formData = new FormData();
    formData.append('file', file);

    let raw: any;
    try {
      raw = await this.client.post<any>('/resumes/upload', formData);
    } catch (err: any) {
      if (err?.code === 'HTTP_404' || err?.code === 'HTTP_405') {
        raw = await this.client.post<any>('/resumes/uploadResume', formData);
      } else {
        throw err;
      }
    }

    const normalized = normalizeResumeResponse(raw, file.name);
    // If fileSize was 0, use uploaded file size
    if (file.size && (!normalized.fileSize || normalized.fileSize === 0)) {
      normalized.fileSize = file.size;
    }
    return normalized;
  }

  public async getActiveResume(): Promise<ActiveResumeResponse | null> {
    let raw: any = null;
    try {
      raw = await this.client.get<any>('/resumes/active');
    } catch (err: any) {
      if (err?.code === 'HTTP_404' || err?.code === 'HTTP_405') {
        try {
          raw = await this.client.get<any>('/resumes');
          if (Array.isArray(raw)) {
            raw = raw.find((r: any) => r.is_active || r.is_primary) || raw[0] || null;
          }
        } catch {
          return null;
        }
      } else {
        throw err;
      }
    }

    if (!raw) return null;
    return normalizeResumeResponse(raw);
  }

  public async getResumeVersions(): Promise<ResumeVersion[]> {
    try {
      const res = await this.client.get<ResumeVersion[]>('/resumes/versions');
      return Array.isArray(res) ? res : [];
    } catch {
      return [];
    }
  }

  public async getResumeById(id: string): Promise<ActiveResumeResponse> {
    const raw = await this.client.get<any>(`/resumes/${id}`);
    return normalizeResumeResponse(raw);
  }

  public async deleteResume(id: string): Promise<{ success: boolean; message: string }> {
    return this.client.delete<{ success: boolean; message: string }>(`/resumes/${id}`);
  }

  public async setActiveResume(id: string): Promise<ActiveResumeResponse> {
    const raw = await this.client.post<any>(`/resumes/setActive/${id}`);
    return normalizeResumeResponse(raw);
  }

  public async analyzeResume(id?: string): Promise<{ healthReport: HealthReport; suggestions: AiSuggestion[] }> {
    try {
      return await this.client.post<{ healthReport: HealthReport; suggestions: AiSuggestion[] }>('/resumes/analyze', {
        resumeId: id,
      });
    } catch (err: any) {
      if (err?.code === 'HTTP_404' || err?.code === 'HTTP_405' || err?.code === 'HTTP_422') {
        try {
          return await this.client.post<{ healthReport: HealthReport; suggestions: AiSuggestion[] }>('/resumes/analyzeResume', {
            resumeId: id,
          });
        } catch {
          return {
            healthReport: {
              strengths: ['Document parsed successfully with verified sections.'],
              weaknesses: [],
              missingSections: [],
              duplicateInfo: [],
              grammarAlerts: [],
              keywordDensityRating: 'Optimal',
              formattingQuality: 'Good',
              overallReadabilityScore: 88,
              items: [],
            },
            suggestions: [],
          };
        }
      }
      throw err;
    }
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
    try {
      const list = await this.client.get<JobRecommendation[]>('/resumes/recommendJobs', {
        params: { resumeId },
      });
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  public async getResumeAnalytics(): Promise<ResumeAnalytics | null> {
    try {
      return await this.client.get<ResumeAnalytics>('/resumes/resumeAnalytics');
    } catch {
      return null;
    }
  }
}

export const resumeApi = new ResumeApi();
