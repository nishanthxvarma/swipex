"use client";

import React, { useState } from "react";
import { User, Mail, MapPin, Briefcase, Code, FileText, Link as LinkIcon, Edit2, Download, ExternalLink, Plus, Check, Save, Upload, Sparkles, X, Linkedin, Github } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "Nishanth Varma");
  const [headline, setHeadline] = useState("Senior Full Stack & AI Engineer");
  const [location, setLocation] = useState("San Francisco, CA");
  const [bio, setBio] = useState(
    "Passionate Full Stack Engineer with 6+ years of experience building scalable web applications. Specializing in React 19, Next.js 15, FastAPI, and cloud architecture. I love building intuitive, gesture-driven user experiences."
  );
  
  const [skills, setSkills] = useState([
    "React", "TypeScript", "Node.js", "Next.js", "FastAPI", "PostgreSQL", "AWS", "GraphQL", "Tailwind CSS", "Docker", "Python"
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

  const [experiences, setExperiences] = useState([
    {
      id: 1,
      title: "Senior Software & AI Engineer",
      company: "SwipeX Tech Inc.",
      date: "Jan 2023 - Present • Full-time",
      description: "Architected Next.js 15 App Router frontend and FastAPI microservices. Integrated spaCy and Sentence Transformers for real-time ATS match scoring and recommendation feeds.",
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "InnovateX Labs",
      date: "Mar 2020 - Dec 2022 • 2 yrs 10 mos",
      description: "Developed core features for SaaS platforms using React, TypeScript, and PostgreSQL. Built automated payment pipelines and CI/CD workflows.",
    }
  ]);

  const [socialLinks, setSocialLinks] = useState([
    { id: 1, name: "LinkedIn", url: "https://linkedin.com", handle: "linkedin.com/in/nishanthvarma", colorClass: "bg-blue-500/10 text-blue-500" },
    { id: 2, name: "GitHub", url: "https://github.com/nishanthxvarma", handle: "github.com/nishanthxvarma", colorClass: "bg-foreground/10 text-foreground" },
  ]);

  // Resume Upload Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [resumeFileName, setResumeFileName] = useState("Nishanth_Varma_Resume.pdf");
  const [atsScore, setAtsScore] = useState(87);

  const getUserInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    if (user) {
      setUser({ ...user, fullName });
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput("");
      setShowAddSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setResumeFileName(file.name);
      
      // Simulate AI Parsing Delay
      setTimeout(() => {
        setIsUploading(false);
        setAtsScore(98); // High score for new resume
        
        // Update profile fields based on simulated resume parsing
        setHeadline("Lead AI Software Engineer");
        setLocation("New York, NY (Remote)");
        setBio("Visionary Lead Software Engineer with 8+ years experience scaling high-traffic AI products. Expert in Next.js, Python microservices, and LLM integrations. Proven track record of reducing latency by 40% and leading cross-functional engineering teams.");
        
        setSkills([
          "React 19", "Next.js 15", "Python", "FastAPI", "PyTorch", "LLMs", "LangChain", 
          "PostgreSQL", "Redis", "AWS", "Docker", "Kubernetes", "System Design"
        ]);
        
        setExperiences([
          {
            id: 1,
            title: "Lead AI Software Engineer",
            company: "TechNova Solutions",
            date: "Feb 2024 - Present • Full-time",
            description: "Led the migration to a microservices architecture. Integrated custom LLM pipelines for automated data extraction, improving processing speed by 3x. Managed a team of 4 engineers.",
          },
          {
            id: 2,
            title: "Senior Software & AI Engineer",
            company: "SwipeX Tech Inc.",
            date: "Jan 2023 - Feb 2024 • 1 yr 2 mos",
            description: "Architected Next.js 15 App Router frontend and FastAPI microservices. Integrated spaCy and Sentence Transformers for real-time ATS match scoring and recommendation feeds.",
          },
          {
            id: 3,
            title: "Full Stack Developer",
            company: "InnovateX Labs",
            date: "Mar 2020 - Dec 2022 • 2 yrs 10 mos",
            description: "Developed core features for SaaS platforms using React, TypeScript, and PostgreSQL. Built automated payment pipelines and CI/CD workflows.",
          }
        ]);
        
        setSocialLinks([
          { id: 1, name: "LinkedIn", url: "https://linkedin.com", handle: "linkedin.com/in/new-profile", colorClass: "bg-blue-500/10 text-blue-500" },
          { id: 2, name: "GitHub", url: "https://github.com/new-profile", handle: "github.com/new-profile", colorClass: "bg-foreground/10 text-foreground" },
          { id: 3, name: "Portfolio", url: "https://portfolio.com", handle: "portfolio.dev", colorClass: "bg-purple-500/10 text-purple-500" },
        ]);
        
        if (user) {
          setUser({ ...user, fullName: "Nishanth Varma (Updated)" });
          setFullName("Nishanth Varma (Updated)");
        }
      }, 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-background">
              {getUserInitials(fullName)}
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform"
              title="Edit Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-3">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-2xl font-bold bg-background border px-3 py-1.5 rounded-xl"
                  placeholder="Full Name"
                />
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full text-sm font-semibold bg-background border px-3 py-1.5 rounded-xl"
                  placeholder="Professional Headline"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-medium bg-background border px-3 py-1.5 rounded-xl"
                  placeholder="Location"
                />
                <Button size="sm" onClick={handleSaveProfile} className="rounded-xl">
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight">{fullName}</h1>
                <p className="text-lg font-semibold text-primary">{headline}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs font-semibold mt-2">
                  <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full"><MapPin className="w-3.5 h-3.5 text-primary" /> {location}</span>
                  <span className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full"><Mail className="w-3.5 h-3.5 text-primary" /> {user?.email || "nishvarma2007@gmail.com"}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="w-32 h-32 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * atsScore) / 100} className="text-emerald-500 transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-bold">
                {atsScore}%
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 font-semibold">ATS Match Score</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-8">
          {/* About */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-primary" /> About Me</h2>
              <button onClick={() => setIsEditing(!isEditing)} className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="bg-card border rounded-2xl p-6 text-muted-foreground leading-relaxed text-sm sm:text-base">
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full h-32 bg-background border p-3 rounded-xl text-foreground text-sm font-medium"
                />
              ) : (
                bio
              )}
            </div>
          </section>

          {/* Experience Timeline */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" /> Experience</h2>
            </div>
            <div className="bg-card border rounded-2xl p-6 space-y-6 shadow-xs">
              {experiences.map((exp, index) => (
                <div key={exp.id} className={cn("relative pl-6 border-l-2 border-primary/20", index !== experiences.length - 1 && "pb-6")}>
                  <div className="absolute w-3.5 h-3.5 bg-primary rounded-full -left-[8px] top-1.5 border-2 border-background" />
                  <h3 className="font-bold text-lg">{exp.title}</h3>
                  <div className="text-primary font-semibold text-sm mb-1">{exp.company}</div>
                  <div className="text-xs text-muted-foreground mb-3 font-medium">{exp.date}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skills Tag Cloud */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Skills ({skills.length})</h2>
              <button onClick={() => setShowAddSkill(!showAddSkill)} className="text-primary hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-card border rounded-2xl p-6 space-y-4 shadow-xs">
              {showAddSkill && (
                <form onSubmit={handleAddSkill} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add skill (e.g. GraphQL)"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-background border rounded-xl"
                  />
                  <Button type="submit" size="sm" className="rounded-xl text-xs">Add</Button>
                </form>
              )}

              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill} className="group bg-secondary hover:bg-primary/10 hover:text-primary transition-all px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* ATS Resume Analyzer & Upload */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Resume Analyzer</h2>
            <div className="bg-card border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-primary/50 transition-all shadow-xs relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                {isUploading ? <Sparkles className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <div className="font-bold text-sm">{isUploading ? "Parsing Resume with AI..." : resumeFileName}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Click or drag PDF to re-scan ATS Compatibility</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl text-xs font-semibold pointer-events-none">
                <Download className="w-3.5 h-3.5 mr-1" /> Re-Analyze Resume
              </Button>
            </div>
          </section>

          {/* Social Links */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-primary" /> Social Links</h2>
            <div className="bg-card border rounded-2xl p-4 space-y-2.5 shadow-xs">
              {socialLinks.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors text-xs font-semibold">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", link.colorClass)}>
                    {link.name === "LinkedIn" ? <Linkedin className="w-3.5 h-3.5" /> : link.name === "GitHub" ? <Github className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 truncate">{link.handle}</div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

