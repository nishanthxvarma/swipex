"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Building2, Users, Star, ExternalLink, MapPin, Search, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { companiesApi, Company } from "@swipex/api";

const INDUSTRIES = ["All Industries", "Technology", "Fintech", "Developer Tools", "AI / ML", "Productivity", "Travel", "Entertainment"];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await companiesApi.listCompanies({
        query: search || undefined,
        industry: selectedIndustry !== "All Industries" ? selectedIndustry : undefined
      });
      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setError("Failed to load company directory from database.");
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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 tracking-tight">
            <Building2 className="w-8 h-8 text-primary" />
            Top Companies
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Discover and follow top hiring companies aligned with your career vision.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {INDUSTRIES.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedIndustry(tag)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border",
              selectedIndustry === tag
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card hover:bg-muted text-muted-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 bg-card border rounded-2xl p-8 space-y-3 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Loading verified company directory...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-2">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No companies found</h3>
          <p className="text-muted-foreground text-xs">Try clearing your search query or selecting another industry tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {companies.map(company => (
            <Link href={`/companies/${company.id}`} key={company.id}>
              <div className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer hover:border-primary/50 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: company.color || "#635BFF" }}
                  >
                    {company.initials || company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {company.rating || 4.8}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{company.name}</h3>
                <div className="text-xs font-semibold text-muted-foreground mb-4">{company.industry}</div>
                
                <div className="space-y-2 mt-auto text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {company.location || company.headquarters || "Remote"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> {company.size || `${company.employeeCount} employees`}
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-between items-center text-xs">
                  <span className="font-bold text-primary">{company.openRolesCount || company.activeJobsCount || (company.jobs?.length) || 0} open positions</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
