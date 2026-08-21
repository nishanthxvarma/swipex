'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, CheckCircle2, XCircle, Search, ShieldCheck, 
  ExternalLink, Briefcase, Plus, AlertCircle, Loader2, AlertTriangle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usersApi } from '@swipex/api';

interface RecruiterRecord {
  id: string;
  company: string;
  email: string;
  status: 'VERIFIED' | 'PENDING' | 'SUSPENDED';
  isVerified: boolean;
  isActive: boolean;
  postsQuota: number;
  activeJobs: number;
}

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<RecruiterRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecruiters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAdminRecruiters();
      setRecruiters(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load recruiters:', err);
      setError('Failed to fetch recruiter accreditation directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const toggleVerification = async (id: string) => {
    const prev = [...recruiters];
    setRecruiters(prevList => prevList.map(r => {
      if (r.id === id) {
        const nextStatus = r.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED';
        return { ...r, status: nextStatus, isVerified: nextStatus === 'VERIFIED' };
      }
      return r;
    }));

    try {
      await usersApi.verifyRecruiter(id);
    } catch (err) {
      console.error('Failed to update verification status:', err);
      setRecruiters(prev);
      setError('Failed to update recruiter accreditation.');
    }
  };

  const verifiedCount = recruiters.filter(r => r.status === 'VERIFIED').length;
  const pendingCount = recruiters.filter(r => r.status === 'PENDING').length;
  const suspendedCount = recruiters.filter(r => r.status === 'SUSPENDED').length;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter & Employer Accreditation</h1>
          <p className="text-[#66788A] text-sm mt-1">
            Review company verification requests, adjust job posting quotas, and monitor recruiter status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-1 border">
          <p className="text-xs font-bold text-[#66788A] uppercase">Verified Employers</p>
          <h3 className="text-3xl font-black mt-2 text-emerald-600">{verifiedCount}</h3>
        </div>
        <div className="p-5 rounded-3xl glass-1 border">
          <p className="text-xs font-bold text-[#66788A] uppercase">Pending Applications</p>
          <h3 className="text-3xl font-black mt-2 text-[#7DD3FC]">{pendingCount}</h3>
        </div>
        <div className="p-5 rounded-3xl glass-1 border">
          <p className="text-xs font-bold text-[#66788A] uppercase">Total Registered Recruiters</p>
          <h3 className="text-3xl font-black mt-2">{recruiters.length}</h3>
        </div>
        <div className="p-5 rounded-3xl glass-1 border">
          <p className="text-xs font-bold text-[#66788A] uppercase">Suspended Accounts</p>
          <h3 className="text-3xl font-black mt-2 text-rose-600">{suspendedCount}</h3>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchRecruiters} className="text-xs h-7">Retry</Button>
        </div>
      )}

      {/* Recruiter List */}
      <div className="glass-1 border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-base">Registered Employer Companies</h3>
          {isLoading && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
        </div>
        <div className="divide-y">
          {recruiters.length === 0 && !isLoading ? (
            <div className="p-8 text-center text-xs text-[#66788A]">No recruiters registered yet.</div>
          ) : (
            recruiters.map((rec) => (
              <div key={rec.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:glass-1/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-[#BFE8FF]/10 text-[#7DD3FC] font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base flex items-center gap-2">
                      {rec.company}
                      {rec.status === 'VERIFIED' && (
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      )}
                    </h4>
                    <p className="text-xs text-[#66788A]">{rec.email} • Quota: {rec.postsQuota} postings</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    rec.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-600' :
                    rec.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {rec.status}
                  </span>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleVerification(rec.id)}
                    className="rounded-xl text-xs font-semibold"
                  >
                    {rec.status === 'VERIFIED' ? 'Revoke Verification' : 'Verify Company'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
