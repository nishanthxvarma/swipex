"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MapPin, Users, Globe, Send, AtSign, Building2, Briefcase, Heart, Cpu, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const COMPANY_DATABASE: Record<string, any> = {
  c1: {
    name: "Stripe",
    initials: "S",
    color: "#635BFF",
    industry: "Financial Services",
    location: "San Francisco, CA (HQ)",
    size: "5,000+ employees",
    website: "https://stripe.com",
    rating: 4.8,
    description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size—from new startups to public companies—use our software to accept payments and manage their businesses online.",
    techStack: ["React", "Ruby", "Go", "PostgreSQL", "Kafka", "AWS", "TypeScript"],
    benefits: ["100% Health Coverage", "Remote Work Flexibility", "401(k) Match", "Unlimited PTO", "Wellness Stipend", "$3,000 Learning Budget"],
    openJobs: [
      { id: "j1", title: "Backend Engineer, Core", location: "Remote", type: "Full-time", salary: "$160k - $200k" },
      { id: "j2", title: "Product Manager, Payments", location: "San Francisco, CA", type: "Full-time", salary: "$175k - $220k" },
      { id: "j3", title: "Staff Data Scientist", location: "New York, NY", type: "Full-time", salary: "$190k - $240k" }
    ]
  },
  c2: {
    name: "Airbnb",
    initials: "A",
    color: "#FF5A5F",
    industry: "Travel & Hospitality",
    location: "San Francisco, CA (HQ)",
    size: "5,000+ employees",
    website: "https://airbnb.com",
    rating: 4.6,
    description: "Airbnb is an online marketplace that connects people who want to rent out their homes with people who are looking for accommodations in specific locales.",
    techStack: ["React Native", "Java", "Kotlin", "Swift", "GraphQL", "MySQL"],
    benefits: ["$2,000 Annual Travel Credit", "Work From Anywhere Policy", "Parental Leave", "Health Benefits"],
    openJobs: [
      { id: "j4", title: "React Native Mobile Engineer", location: "Remote", type: "Full-time", salary: "$130k - $170k" },
      { id: "j5", title: "Staff Product Designer", location: "San Francisco, CA", type: "Full-time", salary: "$160k - $210k" }
    ]
  },
  c3: {
    name: "Vercel",
    initials: "V",
    color: "#000000",
    industry: "Developer Tools",
    location: "Remote",
    size: "100-500 employees",
    website: "https://vercel.com",
    rating: 4.9,
    description: "Vercel is the platform for frontend developers, providing the speed and reliability innovators need to create at the moment of inspiration.",
    techStack: ["Next.js", "React", "TypeScript", "Rust", "TailwindCSS", "Node.js"],
    benefits: ["Unlimited PTO", "Remote First Culture", "Top Tier Equipment Stipend", "Learning & Growth Fund"],
    openJobs: [
      { id: "j6", title: "Senior Frontend Engineer (Next.js)", location: "Remote", type: "Full-time", salary: "$140k - $180k" },
      { id: "j7", title: "Developer Advocate", location: "Remote", type: "Full-time", salary: "$130k - $165k" }
    ]
  }
};

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isFollowing, setIsFollowing] = useState(false);

  const company = COMPANY_DATABASE[params.id] || COMPANY_DATABASE["c1"];

  const tabs = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "jobs", label: "Open Positions (" + company.openJobs.length + ")", icon: Briefcase },
    { id: "tech", label: "Tech Stack", icon: Cpu },
    { id: "benefits", label: "Benefits", icon: Heart },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/companies")} className="mb-2 text-xs">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Companies
      </Button>

      {/* Hero Banner */}
      <div className="h-48 md:h-60 rounded-3xl relative overflow-hidden shadow-md" style={{ background: `linear-gradient(135deg, ${company.color}, #111)` }}>
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Profile Header */}
      <div className="px-4 sm:px-8 -mt-16 relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-end mb-6">
        <div
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-xl border-4 border-background shrink-0"
          style={{ backgroundColor: company.color }}
        >
          {company.initials}
        </div>
        <div className="flex-1 pb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><Building2 className="w-4 h-4 text-primary" /> {company.industry}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {company.location}</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {company.size}</span>
            <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline">
              <Globe className="w-4 h-4" /> {company.website.replace("https://", "")}
            </a>
          </div>
        </div>
        <Button
          onClick={() => setIsFollowing(!isFollowing)}
          variant={isFollowing ? "outline" : "default"}
          className="w-full md:w-auto rounded-xl px-6 font-semibold shadow-md transition-all"
        >
          {isFollowing ? (
            <>
              <Check className="w-4 h-4 mr-1.5 text-emerald-500" /> Following
            </>
          ) : (
            "Follow Company"
          )}
        </Button>
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-8 mb-6 border-b flex gap-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 border-b-2 text-sm font-bold transition-all whitespace-nowrap ${
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
              <section className="bg-card border rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="text-xl font-bold">About {company.name}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{company.description}</p>
              </section>
            </div>
            <div className="space-y-6">
              <div className="bg-card border rounded-2xl p-6 shadow-xs space-y-4">
                <h4 className="font-bold text-sm">Company Links</h4>
                <div className="flex gap-3">
                  <a href={company.website} target="_blank" rel="noreferrer" className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center hover:text-primary transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center hover:text-primary transition-colors">
                    <Send className="w-5 h-5" />
                  </a>
                  <a href="#" className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center hover:text-primary transition-colors">
                    <AtSign className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-4">
            {company.openJobs.map((job: any) => (
              <div key={job.id} className="bg-card border rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 transition-all shadow-xs group">
                <div>
                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{job.title}</h4>
                  <div className="text-xs text-muted-foreground flex gap-3 mt-1 font-medium">
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{job.type}</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{job.salary}</span>
                  </div>
                </div>
                <Button onClick={() => router.push("/jobs")} className="rounded-xl font-semibold shadow-xs">
                  Apply via Swipe
                </Button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "tech" && (
          <div className="flex flex-wrap gap-3">
            {company.techStack.map((tech: string) => (
              <div key={tech} className="px-4 py-3 bg-card border rounded-xl font-semibold text-sm flex items-center gap-2.5 shadow-xs">
                <Cpu className="w-4 h-4 text-primary" /> {tech}
              </div>
            ))}
          </div>
        )}

        {activeTab === "benefits" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {company.benefits.map((benefit: string) => (
              <div key={benefit} className="bg-card border rounded-2xl p-5 flex flex-col items-center text-center gap-3 shadow-xs">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="font-semibold text-sm">{benefit}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
