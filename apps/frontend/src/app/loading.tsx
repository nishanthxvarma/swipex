import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="relative flex flex-col items-center">
        {/* Animated outer ring */}
        <div className="absolute inset-0 -m-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" style={{ animationDuration: '3s' }} />
        
        {/* Logo container with pulse */}
        <div className="relative flex h-16 w-16 animate-pulse items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
          <Sparkles className="h-8 w-8" />
        </div>
        
        {/* Loading text */}
        <div className="mt-8 flex items-center space-x-2">
          <span className="text-lg font-medium text-foreground tracking-tight">Loading SwipeX</span>
          <span className="flex space-x-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
          </span>
        </div>
      </div>
    </div>
  );
}
