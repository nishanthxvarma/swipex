"use client";

import React, { useState } from "react";
import { Building2, Users, Star, ExternalLink, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COMPANIES = [
  { id: "c1", name: "Stripe", industry: "Fintech", size: "1000-5000", jobs: 45, rating: 4.8, color: "#635BFF", initials: "S", location: "San Francisco, CA" },
  { id: "c2", name: "Airbnb", industry: "Travel", size: "5000+", jobs: 32, rating: 4.6, color: "#FF5A5F", initials: "A", location: "San Francisco, CA" },
  { id: "c3", name: "Vercel", industry: "Developer Tools", size: "100-500", jobs: 18, rating: 4.9, color: "#000000", initials: "V", location: "Remote" },
  { id: "c4", name: "Linear", industry: "Productivity", size: "50-100", jobs: 8, rating: 4.9, color: "#5E6AD2", initials: "L", location: "Remote" },
  { id: "c5", name: "Spotify", industry: "Entertainment", size: "5000+", jobs: 124, rating: 4.5, color: "#1DB954", initials: "S", location: "New York, NY" },
  { id: "c6", name: "Notion", industry: "Productivity", size: "500-1000", jobs: 24, rating: 4.7, color: "#000000", initials: "N", location: "San Francisco, CA" }
];

const INDUSTRIES = ["All Industries", "Fintech", "Developer Tools", "Productivity", "Travel", "Entertainment"];

export default function CompaniesPage() {
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");

  const filteredCompanies = COMPANIES.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesIndustry = selectedIndustry === "All Industries" || c.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

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
                : "bg-card hover:bg-secondary text-muted-foreground"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-2xl p-8 space-y-2">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-bold">No companies found</h3>
          <p className="text-muted-foreground text-xs">Try clearing your search query or selecting another industry tag.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {filteredCompanies.map(company => (
            <Link href={`/companies/${company.id}`} key={company.id}>
              <div className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer hover:border-primary/50 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: company.color }}
                  >
                    {company.initials}
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" /> {company.rating}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{company.name}</h3>
                <div className="text-xs font-semibold text-muted-foreground mb-4">{company.industry}</div>
                
                <div className="space-y-2 mt-auto text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" /> {company.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> {company.size} employees
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t flex justify-between items-center text-xs">
                  <span className="font-bold text-primary">{company.jobs} open positions</span>
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
