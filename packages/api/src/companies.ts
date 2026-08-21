import { api } from './client';

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
  culture: string;
  benefits: string[];
  techStack: string[];
  rating: number;
  employeeCount: number;
  headquarters: string;
  location: string;
  logoUrl?: string;
  color: string;
  initials: string;
  openRolesCount: number;
  activeJobsCount: number;
  jobs?: any[];
}

export const companiesApi = {
  listCompanies: (params?: { query?: string; industry?: string; location?: string; page?: number; perPage?: number }) =>
    api.get<Company[]>('/companies/', { params }),

  getCompany: (id: string) =>
    api.get<Company>(`/companies/${id}`),

  createCompany: (data: Partial<Company>) =>
    api.post<Company>('/companies/', data),

  updateCompany: (id: string, data: Partial<Company>) =>
    api.put<Company>(`/companies/${id}`, data)
};
