'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import {
  Sparkles, Sun, Moon, Menu, X,
  Layers, FileSearch, Brain, Zap, BarChart3, TrendingUp,
  ChevronRight, MapPin, DollarSign, CheckCircle2, Shield, ArrowRight, Building2, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground bg-atmospheric selection:bg-primary/20">
      {/* Navigation */}
      <header
        className={cn(
          'fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent',
          isScrolled ? 'glass-1 border-border shadow-xs' : 'bg-transparent'
        )}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="bg-primary/10 border border-primary/20 p-1.5 rounded-lg text-primary group-hover:scale-105 transition-transform shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">SwipeX</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link href="#workspaces" className="hover:text-foreground transition-colors">Workspaces</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="font-medium text-xs">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="primary" size="sm" className="font-bold text-xs rounded-xl shadow-md">
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-border glass-3"
            >
              <div className="px-4 py-6 flex flex-col gap-4">
                <Link href="#capabilities" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">Capabilities</Link>
                <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">How It Works</Link>
                <Link href="#workspaces" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-1">Workspaces</Link>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm font-medium">Theme</span>
                  {mounted && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="h-8 w-8"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                    </Button>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" className="flex-1 rounded-xl text-xs">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild variant="primary" className="flex-1 rounded-xl font-bold text-xs">
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Career Intelligence Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
            >
              Find Your Next Role <br className="hidden sm:inline" />
              With <span className="text-primary">AI Precision</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              SwipeX matches technical candidates with engineering teams using semantic resume analysis, interactive swipe discovery, and automated application tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3 pt-4 w-full sm:w-auto"
            >
              <Button asChild variant="primary" size="lg" className="w-full sm:w-auto rounded-xl font-bold shadow-lg text-sm px-8">
                <Link href="/signup">
                  Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-semibold text-sm px-6">
                <Link href="/login">
                  Live Demo Login
                </Link>
              </Button>
            </motion.div>
          </div>

          {/* Interactive Hero Showcase (Spatial Card Stack) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 max-w-md mx-auto relative"
          >
            {/* Ghost card 2 */}
            <div className="absolute inset-x-4 -top-3 bottom-3 rounded-3xl glass-1 border border-border/40 opacity-40 transform scale-[0.96] pointer-events-none -z-20" />
            {/* Ghost card 1 */}
            <div className="absolute inset-x-2 -top-1.5 bottom-1.5 rounded-3xl glass-1 border border-border/60 opacity-70 transform scale-[0.98] pointer-events-none -z-10" />

            {/* Showcase Card */}
            <div className="glass-3 border border-border rounded-3xl p-6 shadow-2xl space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-lg text-primary">
                    SX
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground">Senior Systems Architect</h3>
                    <p className="text-xs text-muted-foreground">Engineering • Remote</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">
                  96% Match
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Design, build, and deploy distributed real-time platforms with modern TypeScript and container architectures.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {['TypeScript', 'Distributed Systems', 'PostgreSQL', 'Docker'].map((tag) => (
                  <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-lg glass-2 border border-border text-foreground">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs font-bold text-primary">$160K - $200K / yr</span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Instant One-Tap Apply
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section id="capabilities" className="py-20 md:py-28 border-t border-border/60 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Core Platform Capabilities
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Engineered for high-signal recruitment and intelligent candidate matching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: 'Spatial Swipe Discovery',
                desc: 'Browse tailored job opportunities with an intuitive directional interface that adapts to your skills and preferences.',
              },
              {
                icon: FileSearch,
                title: 'Resume & ATS Intelligence',
                desc: 'Upload your resume for real-time ATS scoring, keyword gap analysis, and tailored recommendations to improve recruiter visibility.',
              },
              {
                icon: BarChart3,
                title: 'Full Pipeline Tracking',
                desc: 'Monitor your application statuses across Kanban and table views with automated stage progression and response metrics.',
              },
              {
                icon: Building2,
                title: 'Recruiter Requisitions',
                desc: 'Post job requirements, browse verified candidate matches, and manage candidate pipelines with integrated recruiter tooling.',
              },
              {
                icon: Shield,
                title: 'Role-Based Workspaces',
                desc: 'Dedicated interfaces and authorization controls for Candidates, Recruiters, and Platform Administrators.',
              },
              {
                icon: Zap,
                title: 'Direct Status Updates',
                desc: 'Real-time notifications for application views, interview requests, and new verified job matches.',
              },
            ].map((cap, idx) => (
              <div
                key={idx}
                className="glass-1 border border-border rounded-2xl p-6 shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">{cap.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 border-t border-border/60 glass-1/30 relative">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">How SwipeX Works</h2>
            <p className="text-sm sm:text-base text-muted-foreground">A clean, transparent three-step workflow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Build Profile & Resume',
                desc: 'Input your core engineering skills, experience, and target compensation to set your matching parameters.',
              },
              {
                step: '02',
                title: 'Swipe & Discover',
                desc: 'Review curated job cards with AI match percentage breakdowns. Swipe right to apply, left to skip, or bookmark for later.',
              },
              {
                step: '03',
                title: 'Track & Advance',
                desc: 'Manage scheduled interviews and offers in your candidate tracker as recruiters review your profile.',
              },
            ].map((item, idx) => (
              <div key={idx} className="glass-2 border border-border rounded-2xl p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-sm mx-auto flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/60 relative">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Start Your Job Search Today
          </h2>
          <p className="text-sm text-muted-foreground">
            Create an account in seconds and unlock AI-powered career discovery.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="lg" className="rounded-xl font-bold px-8">
              <Link href="/signup">
                Sign Up Free <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl font-semibold px-6">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">SwipeX</span>
            <span>— AI-Powered Job Discovery</span>
          </div>
          <p>© {new Date().getFullYear()} SwipeX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
