'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, CheckCircle2, XCircle, Search, ShieldCheck, 
  ExternalLink, Briefcase, Plus, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([
    { id: 'rec_101', company: 'TechCorp International', email: 'hr@techcorp.com', status: 'VERIFIED', postsQuota: 25, activeJobs: 12 },
    { id: 'rec_102', company: 'Starlight AI Labs', email: 'talent@starlight.ai', status: 'PENDING', postsQuota: 5, activeJobs: 2 },
    { id: 'rec_103', company: 'Quantum Global', email: 'recruit@quantum.io', status: 'VERIFIED', postsQuota: 50, activeJobs: 34 },
    { id: 'rec_104', company: 'Apex Ventures', email: 'careers@apex.com', status: 'SUSPENDED', postsQuota: 0, activeJobs: 0 },
  ]);

  const toggleVerification = (id: string) => {
    setRecruiters(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'VERIFIED' ? 'PENDING' : 'VERIFIED' };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recruiter & Employer Accreditation</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review company verification requests, adjust job posting quotas, and monitor recruiter status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Verified Employers</p>
          <h3 className="text-3xl font-black mt-2">1,420</h3>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Pending Applications</p>
          <h3 className="text-3xl font-black mt-2 text-purple-600">14</h3>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Total Active Postings</p>
          <h3 className="text-3xl font-black mt-2 text-emerald-600">5,890</h3>
        </div>
        <div className="p-5 rounded-3xl bg-card border">
          <p className="text-xs font-bold text-muted-foreground uppercase">Flagged Recruiter Alerts</p>
          <h3 className="text-3xl font-black mt-2 text-rose-600">2</h3>
        </div>
      </div>

      {/* Recruiter List */}
      <div className="bg-card border rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-bold text-base">Registered Employer Companies</h3>
        </div>
        <div className="divide-y">
          {recruiters.map((rec) => (
            <div key={rec.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2">
                    {rec.company}
                    {rec.status === 'VERIFIED' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">{rec.email} • Quota: {rec.postsQuota} postings</p>
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
          ))}
        </div>
      </div>
    </div>
  );
}
