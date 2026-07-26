"use client";

import React from "react";
import { Building2, Users, Star, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

const COMPANIES = [
  { id: "c1", name: "Stripe", industry: "Fintech", size: "1000-5000", jobs: 45, rating: 4.8, color: "#635BFF", initials: "S", location: "San Francisco, CA" },
  { id: "c2", name: "Airbnb", industry: "Travel", size: "5000+", jobs: 32, rating: 4.6, color: "#FF5A5F", initials: "A", location: "San Francisco, CA" },
  { id: "c3", name: "Vercel", industry: "Developer Tools", size: "100-500", jobs: 18, rating: 4.9, color: "#000000", initials: "V", location: "Remote" },
  { id: "c4", name: "Linear", industry: "Productivity", size: "50-100", jobs: 8, rating: 4.9, color: "#5E6AD2", initials: "L", location: "Remote" },
  { id: "c5", name: "Spotify", industry: "Entertainment", size: "5000+", jobs: 124, rating: 4.5, color: "#1DB954", initials: "S", location: "New York, NY" },
  { id: "c6", name: "Notion", industry: "Productivity", size: "500-1000", jobs: 24, rating: 4.7, color: "#000000", initials: "N", location: "San Francisco, CA" }
];

export default function CompaniesPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Building2 className="w-8 h-8 text-primary" />
          Top Companies
        </h1>
        <p className="text-muted-foreground">Discover and follow companies that match your career goals.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {["All Industries", "Fintech", "AI & Data", "E-commerce", "Healthtech", "DevTools"].map(tag => (
          <button key={tag} className="px-4 py-2 bg-secondary rounded-full text-sm font-medium whitespace-nowrap hover:bg-secondary/80">
            {tag}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {COMPANIES.map(company => (
          <Link href={`/companies/${company.id}`} key={company.id}>
            <div className="bg-card border rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col h-full cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md"
                  style={{ backgroundColor: company.color }}
                >
                  {company.initials}
                </div>
                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" /> {company.rating}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">{company.name}</h3>
              <div className="text-sm text-muted-foreground mb-4">{company.industry}</div>
              
              <div className="space-y-2 mt-auto text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {company.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> {company.size} employees
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center text-sm">
                <span className="font-semibold text-primary">{company.jobs} open positions</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
