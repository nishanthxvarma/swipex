'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, MapPin, Users, Globe, Briefcase, 
  Cpu, Heart, ArrowLeft, Loader2, AlertCircle, Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { companiesApi, Company } from '@swipex/api';

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCompany() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await companiesApi.getCompany(unwrappedParams.id);
        setCompany(data);
      } catch (err) {
        console.error('Failed to load company:', err);
        setError('Company profile not found in database.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCompany();
  }, [unwrappedParams.id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-[#070A0F]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-slate-400 mt-2">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex-1 p-8 bg-[#070A0F] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="p-8 bg-[#0C1119] border border-slate-800 rounded-2xl max-w-md text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-100">Company Not Found</h3>
          <p className="text-xs text-slate-400">{error || 'Unable to locate employer profile.'}</p>
          <Button onClick={() => router.push('/companies')} className="h-9 px-4 rounded-xl bg-primary text-xs font-bold">
            Back to Companies
          </Button>
        </div>
      </div>
    );
  }

  const openJobs = company.jobs || [];

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => router.push('/companies')}
        className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors gap-1 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Companies</span>
      </button>

      {/* Hero Banner */}
      <div className="h-44 sm:h-52 rounded-2xl bg-gradient-to-r from-slate-900 via-primary/20 to-slate-900 border border-slate-800 flex items-end p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 w-full">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-2xl text-slate-100 shadow-xl">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">{company.name}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{company.industry || 'Technology'} • {company.location || 'San Francisco, CA'}</p>
            </div>
          </div>

          <Button
            onClick={() => setIsFollowing(!isFollowing)}
            className={cn(
              "h-9 px-4 rounded-xl text-xs font-bold shadow-sm transition-all",
              isFollowing
                ? "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isFollowing ? 'Following Company' : 'Follow Company'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'jobs', label: `Open Positions (${openJobs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              activeTab === tab.id
                ? "bg-slate-800 text-slate-100 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div className="p-6 rounded-2xl bg-[#0C1119] border border-slate-800/80 space-y-4">
          <h3 className="text-base font-bold text-slate-100">About {company.name}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {company.description || `${company.name} is a leading technology organization hiring engineering talent on SwipeX.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {openJobs.length === 0 ? (
            <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 text-xs text-slate-500">
              No open roles currently posted for {company.name}.
            </div>
          ) : (
            openJobs.map((job: any) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-[#0C1119] border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{job.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{job.location || 'Remote'} • {job.job_type || 'Full-time'}</p>
                </div>
                <Button
                  onClick={() => router.push('/jobs')}
                  className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold"
                >
                  View in Feed
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
