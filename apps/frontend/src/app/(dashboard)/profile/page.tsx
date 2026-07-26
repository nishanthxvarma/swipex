"use client";

import React from "react";
import { User, Mail, MapPin, Briefcase, GraduationCap, Code, FileText, Link as LinkIcon, Edit2, Download, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-20 space-y-8">
      {/* Profile Header */}
      <div className="bg-card border rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-background">
              JD
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-bold">John Doe</h1>
            <p className="text-xl text-muted-foreground">Senior Full Stack Engineer</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-medium mt-2">
              <span className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
              <span className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full"><Mail className="w-4 h-4" /> john.doe@example.com</span>
            </div>
          </div>
          
          <div className="w-32 h-32 flex flex-col items-center justify-center">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="226" strokeDashoffset={226 - (226 * 85) / 100} className="text-green-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-lg font-bold">
                85%
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2 font-medium">Profile Complete</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column (Main Info) */}
        <div className="md:col-span-2 space-y-8">
          {/* About */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><User className="w-6 h-6 text-primary" /> About Me</h2>
              <button className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="bg-card border rounded-2xl p-6 text-muted-foreground leading-relaxed">
              Passionate Full Stack Engineer with 6+ years of experience building scalable web applications. Specializing in React, Node.js, and cloud architecture. I love solving complex problems and building intuitive user experiences.
            </div>
          </section>

          {/* Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Briefcase className="w-6 h-6 text-primary" /> Experience</h2>
              <button className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="bg-card border rounded-2xl p-6 space-y-6">
              <div className="relative pl-6 border-l-2 border-primary/20 pb-6">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5"></div>
                <h3 className="font-bold text-lg">Senior Software Engineer</h3>
                <div className="text-primary font-medium mb-1">TechCorp Inc.</div>
                <div className="text-sm text-muted-foreground mb-3">Jan 2021 - Present • 2 yrs 10 mos</div>
                <p className="text-sm text-muted-foreground">Led the frontend architecture migration to Next.js, improving page load speeds by 40%. Mentored junior developers and established CI/CD best practices.</p>
              </div>
              <div className="relative pl-6 border-l-2 border-primary/20">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5"></div>
                <h3 className="font-bold text-lg">Full Stack Developer</h3>
                <div className="text-primary font-medium mb-1">StartupX</div>
                <div className="text-sm text-muted-foreground mb-3">Mar 2018 - Dec 2020 • 2 yrs 10 mos</div>
                <p className="text-sm text-muted-foreground">Developed core features for the main SaaS product using React and Python/Django. Built integrations with Stripe and Salesforce.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (Skills & Extra) */}
        <div className="space-y-8">
          {/* Skills */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Skills</h2>
              <button className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
            </div>
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex flex-wrap gap-2">
                {["React", "TypeScript", "Node.js", "Next.js", "PostgreSQL", "AWS", "GraphQL", "Tailwind CSS", "Docker"].map(skill => (
                  <span key={skill} className="bg-secondary px-3 py-1.5 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Resume */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-primary" /> Resume</h2>
            <div className="bg-card border rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/50 transition-colors cursor-pointer border-dashed border-2">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold">JohnDoe_Resume.pdf</div>
                <div className="text-xs text-muted-foreground">Updated 2 days ago</div>
              </div>
              <button className="flex items-center gap-2 text-primary font-medium text-sm mt-2">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </section>

          {/* Links */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><LinkIcon className="w-5 h-5 text-primary" /> Links</h2>
            <div className="bg-card border rounded-2xl p-4 space-y-3">
              <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"><ExternalLink className="w-4 h-4" /></div>
                <div className="flex-1 font-medium text-sm">linkedin.com/in/johndoe</div>
              </a>
              <a href="#" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center"><Code className="w-4 h-4" /></div>
                <div className="flex-1 font-medium text-sm">github.com/johndoe</div>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
