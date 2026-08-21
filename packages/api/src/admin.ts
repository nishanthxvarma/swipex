import { ApiClient, api } from './client';

export class AdminApi {
  constructor(private client: ApiClient) {}

  public async getRecruiters(): Promise<any[]> {
    return this.client.get<any[]>('/admin/recruiters');
  }

  public async toggleRecruiterVerification(recruiterId: string): Promise<any> {
    return this.client.put<any>(`/admin/recruiters/${recruiterId}/verify`);
  }

  public async toggleRecruiterStatus(recruiterId: string, status: string): Promise<any> {
    return this.client.put<any>(`/admin/recruiters/${recruiterId}/status`, { status });
  }

  public async getActivityLogs(limit: number = 50): Promise<any[]> {
    return this.client.get<any[]>(`/admin/activity?limit=${limit}`);
  }

  public async getUsers(): Promise<any[]> {
    return this.client.get<any[]>('/admin/users');
  }
}

export const adminApi = new AdminApi(api);
