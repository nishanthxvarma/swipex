'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Building2, Users, MapPin, Search, Loader2, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { companiesApi, Company } from '@swipex/api';

const INDUSTRIES = ['All Industries', 'Technology', 'Fintech', 'Developer Tools', 'AI / ML', 'Productivity', 'Infrastructure'];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await companiesApi.listCompanies({
        query: search || undefined,
        industry: selectedIndustry !== 'All Industries' ? selectedIndustry : undefined,
      });
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Failed to load company directory from database.');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedIndustry]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCompanies]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#070A0F] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-primary" />
            <span>Company Catalog</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified tech companies and infrastructure teams hiring on SwipeX.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search companies by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0C1119] border border-slate-800 rounded-xl outline-none focus:border-primary text-xs font-medium text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Industry Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {INDUSTRIES.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedIndustry(tag)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border cursor-pointer",
              selectedIndustry === tag
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-[#0C1119] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-80 rounded-2xl bg-[#0C1119] border border-slate-800 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="p-12 text-center bg-[#0C1119] rounded-2xl border border-slate-800 max-w-md mx-auto space-y-2 my-8">
          <Building2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-200">No companies found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or industry filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link href={`/companies/${company.id}`} key={company.id}>
              <div className="bg-[#0C1119] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between h-full space-y-4 hover-lift">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-sm text-slate-200">
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/40">
                      {company.industry || 'Technology'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-100">{company.name}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{company.location || 'San Francisco, CA'}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {company.description || 'Technology company hiring engineering talent on SwipeX.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono">{company.activeJobsCount || 0} active roles</span>
                  <span className="text-primary font-semibold flex items-center gap-1">
                    Explore <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
