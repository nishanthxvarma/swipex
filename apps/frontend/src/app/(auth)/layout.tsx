import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Sparkles, Star } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Left Sidebar (Branding & Info) */}
      <div className="relative hidden w-full flex-col justify-between bg-primary md:flex md:w-1/2 lg:w-5/12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>

        <div className="relative z-10 p-8 flex flex-col h-full text-primary-foreground">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            SwipeX
          </div>

          <div className="mt-auto space-y-6 max-w-sm pb-12">
            <h1 className="text-4xl font-bold leading-tight">
              Discover your next career move with a swipe.
            </h1>
            <p className="text-primary-foreground/80 text-lg">
              The AI-powered job discovery platform that connects talent with top companies instantly.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-primary bg-primary-foreground/20 flex items-center justify-center text-xs font-medium"
                  >
                    U{i}
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                Joined by 10,000+ professionals
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 xl:px-24">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-center gap-2 font-bold text-2xl mb-8 text-primary">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          SwipeX
        </div>
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
