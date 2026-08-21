import { api } from './client';

export interface SearchResultJob {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  location: string;
  isRemote: boolean;
  salary: string;
  type: string;
  skills: string[];
  matchPercentage: number;
}

export interface SearchResultCompany {
  id: string;
  name: string;
  industry: string;
  size: string;
  location: string;
  rating: number;
  color: string;
  initials: string;
  description?: string;
}

export interface SearchResultCandidate {
  id: string;
  name: string;
  headline: string;
  location: string;
  skills: string[];
  experienceYears: number;
  profileCompletion: string;
}

export interface GlobalSearchResponse {
  query: string;
  jobs: SearchResultJob[];
  companies: SearchResultCompany[];
  candidates: SearchResultCandidate[];
  totalResults: number;
}

export const searchApi = {
  globalSearch: async (params: { q: string; category?: string; location?: string; remote?: boolean; page?: number; limit?: number }) => {
    return api.get<GlobalSearchResponse>('/search/', { params });
  },
  getSuggestions: async (q: string) => {
    return api.get<string[]>('/search/suggestions', { params: { q } });
  }
};
