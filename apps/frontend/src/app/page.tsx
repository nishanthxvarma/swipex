'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { 
  Sparkles, Sun, Moon, Menu, X, 
  Layers, FileSearch, Brain, Zap, BarChart3, TrendingUp,
  Globe, Send, ExternalLink, ChevronRight, Star,
  MapPin, Briefcase, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Shared Animations ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// --- Components ---

function NavBar() {
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
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent",
      isScrolled ? "bg-background/80 backdrop-blur-md border-border shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-1.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">SwipeX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Sign In
          </Link>
          <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:from-indigo-600 hover:to-purple-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Get Started Free
          </Link>
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
            className="md:hidden border-b border-border bg-background/95 backdrop-blur-md"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Features</Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">How It Works</Link>
              <Link href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Testimonials</Link>
              <div className="h-px bg-border my-2" />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Theme</span>
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="p-2 rounded-full bg-muted text-foreground"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium py-2">Sign In</Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow">
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dot-pattern opacity-50 dark:opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[10%] right-[10%] w-[35rem] h-[35rem] bg-purple-500/20 rounded-full blur-[100px]"
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="flex flex-col items-start text-left"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-6 relative overflow-hidden group">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              ✨ AI-Powered Career Discovery
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Discover Your Dream Job <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500">
                  With a Single Swipe
                </span>
              </h1>
            </motion.div>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
              SwipeX uses AI to match you with personalized job opportunities, analyze your resume for ATS compatibility, and maximize your chances of getting hired.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/register" className="inline-flex h-12 md:h-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 text-base font-semibold text-white shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:shadow-[0_0_60px_-15px_rgba(99,102,241,0.7)] hover:scale-[1.02]">
                Start Swiping Free
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <button className="inline-flex h-12 md:h-14 items-center justify-center rounded-full border-2 border-border bg-transparent px-8 text-base font-medium text-foreground hover:bg-muted transition-colors">
                Watch Demo
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-12 pt-8 border-t border-border flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-sm text-muted-foreground font-medium">Jobs</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">95%</p>
                <p className="text-sm text-muted-foreground font-medium">Match Rate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground font-medium">Companies</p>
              </div>
              <div>
                <p className="text-2xl font-bold flex items-center gap-1">
                  4.9 <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-sm text-muted-foreground font-medium">Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Swipe Card Demo */}
          <motion.div 
            style={{ y: y1, opacity }}
            className="relative hidden lg:flex justify-center items-center h-[600px] perspective-1000"
          >
            {/* Card 3 (Bottom) */}
            <motion.div 
              className="absolute w-[340px] h-[480px] bg-card border border-border rounded-3xl shadow-xl z-10 glass"
              style={{ top: 80, scale: 0.9, rotate: -4 }}
            />
            {/* Card 2 (Middle) */}
            <motion.div 
              className="absolute w-[340px] h-[480px] bg-card border border-border rounded-3xl shadow-xl z-20 glass"
              style={{ top: 40, scale: 0.95, rotate: 2 }}
            />
            {/* Card 1 (Top) */}
            <motion.div 
              animate={{ 
                rotate: [-2, 2, -2],
                y: [0, -10, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 w-[340px] h-[480px] bg-card border border-border rounded-3xl shadow-2xl z-30 overflow-hidden flex flex-col"
            >
              <div className="p-6 pb-4 border-b border-border">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                    S
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-green-500/10 text-green-600 text-xs font-semibold rounded-md">98% Match</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-1">Senior Frontend Engineer</h3>
                <p className="text-muted-foreground font-medium flex items-center gap-1 text-sm">
                  Stripe <MapPin className="w-3 h-3 ml-1" /> San Francisco, CA
                </p>
              </div>
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Briefcase className="w-4 h-4 text-muted-foreground" /> Full-time • Remote Flexible
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <DollarSign className="w-4 h-4 text-muted-foreground" /> $150k - $220k
                </div>
                <div className="mt-auto">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Next.js', 'Framer Motion'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3 bg-muted/50 border-t border-border">
                <div className="h-12 rounded-xl bg-card border border-border shadow-sm flex items-center justify-center font-semibold text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer">
                  Pass
                </div>
                <div className="h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md flex items-center justify-center font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                  Apply
                </div>
              </div>
            </motion.div>
            
            {/* Swipe UI Indicators */}
            <motion.div 
               animate={{ x: [-10, -30, -10], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="absolute left-[-2rem] top-1/2 -translate-y-1/2 hidden xl:block"
            >
              <div className="w-12 h-12 rounded-full bg-card border border-border shadow-lg flex items-center justify-center text-muted-foreground">
                <X className="w-5 h-5" />
              </div>
            </motion.div>
            
             <motion.div 
               animate={{ x: [10, 30, 10], opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
               className="absolute right-[-2rem] top-1/2 -translate-y-1/2 hidden xl:block"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center text-white">
                <Zap className="w-5 h-5" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const companies = ['Google', 'Meta', 'Apple', 'Amazon', 'Microsoft', 'Stripe', 'Netflix', 'Uber'];

function TrustSection() {
  return (
    <section className="py-10 border-y border-border bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-6">
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Trusted by teams at</p>
      </div>
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex gap-16 px-8 items-center justify-center">
          {[...companies, ...companies].map((company, i) => (
            <span key={i} className="text-2xl font-bold text-muted-foreground/40 hover:text-muted-foreground transition-colors cursor-default">
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Layers, title: "Swipe to Discover", desc: "Browse jobs with an intuitive swipe interface. Fast, engaging, and addictive career discovery." },
  { icon: FileSearch, title: "AI Resume Analysis", desc: "Get instant ATS compatibility scores and actionable feedback to improve your resume." },
  { icon: Brain, title: "Smart Matching", desc: "Our AI learns from your preferences and skills to deliver highly relevant job matches." },
  { icon: Zap, title: "One-Tap Apply", desc: "Apply to jobs instantly with your saved profile. No more filling out endless forms." },
  { icon: BarChart3, title: "Real-Time Insights", desc: "Track your applications, interviews, and success rates with comprehensive analytics." },
  { icon: TrendingUp, title: "Career Growth", desc: "Identify skill gaps and get personalized recommendations to advance your career." },
];

function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Everything you need to land your dream job</h2>
          <p className="text-lg text-muted-foreground">Stop searching, start swiping. SwipeX provides a complete toolkit to supercharge your job hunt.</p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 md:p-8 rounded-3xl border border-border bg-card shadow-sm hover-lift relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { num: "01", title: "Upload Resume", desc: "Upload your resume and let our AI analyze your skills, experience, and career goals." },
  { num: "02", title: "Swipe & Discover", desc: "Browse personalized job recommendations with our intuitive swipe interface." },
  { num: "03", title: "Land Your Dream Job", desc: "Apply with one tap and track your progress with real-time analytics." },
];

function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How SwipeX Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A seamless experience designed to get you hired faster.</p>
        </div>

        <div ref={ref} className="max-w-5xl mx-auto relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 -translate-y-1/2 z-0" />
          
          <div className="grid md:grid-cols-3 gap-10 md:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="flex flex-col items-center text-center bg-background p-8 rounded-3xl border border-border shadow-sm hover:border-primary/50 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { label: "Active Users", value: "50K+" },
    { label: "Jobs Posted", value: "10K+" },
    { label: "Match Accuracy", value: "95%" },
    { label: "Faster Hiring", value: "2.5x" },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary text-primary-foreground" />
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-primary-foreground/80 font-medium text-sm md:text-base uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  { 
    quote: "SwipeX completely changed how I search for jobs. Found my dream role in 2 weeks!",
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Google",
    initials: "SC",
    color: "bg-blue-500"
  },
  { 
    quote: "The AI resume analysis helped me increase my ATS score from 45% to 92%. Game changer!",
    name: "Marcus Williams",
    role: "Data Scientist",
    company: "Meta",
    initials: "MW",
    color: "bg-purple-500"
  },
  { 
    quote: "As a recruiter, SwipeX saves me hours. The quality of applicants is significantly better.",
    name: "Priya Sharma",
    role: "Talent Lead",
    company: "Stripe",
    initials: "PS",
    color: "bg-indigo-500"
  }
];

function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="testimonials" className="py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Loved by job seekers worldwide</h2>
          <p className="text-lg text-muted-foreground">Don't just take our word for it.</p>
        </div>

        <div ref={ref} className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="bg-card p-8 rounded-3xl border border-border shadow-sm flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg font-medium mb-8 flex-1 italic text-foreground">"{t.quote}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className={`w-12 h-12 rounded-full ${t.color} text-white flex items-center justify-center font-bold text-lg`}>
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role} at {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          ref={ref}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Ready to find your perfect role?</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals who are already discovering better opportunities with SwipeX.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="h-14 px-6 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 backdrop-blur-sm"
            />
            <button className="h-14 px-8 rounded-full bg-white text-indigo-600 font-bold text-lg hover:bg-white/90 transition-colors shadow-xl">
              Get Started Free
            </button>
          </div>
          <p className="mt-6 text-sm text-white/60">No credit card required. Free forever for job seekers.</p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">SwipeX</span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The AI-powered career discovery platform that helps you land your dream job with a single swipe.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Send className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><ExternalLink className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">API</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Press</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2024 SwipeX. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Main Page Component ---
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-background selection:bg-primary/20 selection:text-primary">
      {/* Global CSS required for animations that cannot be done with inline Tailwind classes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-image: linear-gradient(to right, #6366f1, #a855f7, #06b6d4);
        }
        .bg-gradient-mesh {
          background-color: #6366f1;
          background-image: 
            radial-gradient(at 40% 20%, hsla(280,100%,74%,1) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%),
            radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%),
            radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%);
        }
        .bg-dot-pattern {
          background-image: radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .dark .bg-dot-pattern {
          background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px);
        }
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .dark .glass {
          background: rgba(0, 0, 0, 0.2);
        }
      `}} />
      
      <NavBar />
      
      <main className="flex-grow">
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
}
