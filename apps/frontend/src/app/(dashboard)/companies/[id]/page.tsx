"use client";

import React, { useState } from "react";
import { ExternalLink, MapPin, Users, Globe, Send, AtSign, Building2, Briefcase, Heart, Cpu } from "lucide-react";

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // MOCK DATA based on ID (simplified)
  const company = {
    name: "Stripe",
    initials: "S",
    color: "#635BFF",
    industry: "Financial Services",
    location: "San Francisco, CA (HQ)",
    size: "5,000+ employees",
    website: "stripe.com",
    rating: 4.8,
    description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.",
    techStack: ["React", "Ruby", "Go", "PostgreSQL", "Kafka", "AWS", "TypeScript"],
    benefits: ["100% Health Coverage", "Remote Work", "401(k) Match", "Unlimited PTO", "Wellness Stipend", "Learning Budget"],
    openJobs: [
      { id: 1, title: "Backend Engineer, Core", location: "Remote", type: "Full-time" },
      { id: 2, title: "Product Manager", location: "San Francisco", type: "Full-time" },
      { id: 3, title: "Data Scientist", location: "New York", type: "Full-time" }
    ]
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "jobs", label: "Open Positions", icon: Briefcase },
    { id: "tech", label: "Tech Stack", icon: Cpu },
    { id: "benefits", label: "Benefits", icon: Heart },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Hero Banner */}
      <div className="h-48 md:h-64 rounded-b-3xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${company.color}, #111)` }}>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
      
      {/* Profile Header */}
      <div className="px-4 sm:px-8 -mt-16 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-end mb-8">
        <div
          className="w-32 h-32 rounded-2xl flex items-center justify-center text-white font-bold text-5xl shadow-xl border-4 border-background flex-shrink-0"
          style={{ backgroundColor: company.color }}
        >
          {company.initials}
        </div>
        <div className="flex-1 pb-2">
          <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> {company.industry}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.location}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {company.size}</span>
            <span className="flex items-center gap-1 text-primary"><Globe className="w-4 h-4" /> {company.website}</span>
          </div>
        </div>
        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg">
          Follow Company
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-8 mb-8 border-b flex gap-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="px-4 sm:px-8">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-xl font-bold mb-4">About {company.name}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{company.description}</p>
              </section>
            </div>
            <div className="space-y-6">
              <div className="bg-secondary rounded-2xl p-6">
                <h4 className="font-semibold mb-4">Social Links</h4>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center cursor-pointer hover:text-primary"><Send className="w-5 h-5" /></div>
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center cursor-pointer hover:text-primary"><AtSign className="w-5 h-5" /></div>
                  <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center cursor-pointer hover:text-primary"><Globe className="w-5 h-5" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-4">
            {company.openJobs.map(job => (
              <div key={job.id} className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 transition-colors cursor-pointer">
                <div>
                  <h4 className="font-bold text-lg">{job.title}</h4>
                  <div className="text-sm text-muted-foreground flex gap-3 mt-1">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80">
                  View Job
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tech" && (
          <div className="flex flex-wrap gap-3">
            {company.techStack.map(tech => (
              <div key={tech} className="px-4 py-3 bg-secondary rounded-xl font-medium flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary" /> {tech}
              </div>
            ))}
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {company.benefits.map(benefit => (
              <div key={benefit} className="bg-card border rounded-xl p-5 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="font-medium">{benefit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
