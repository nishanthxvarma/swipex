import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: '404 - Page Not Found | SwipeX',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16 text-center">
      <div className="relative mb-12 flex h-64 w-full max-w-sm items-center justify-center">
        {/* CSS Art / Floating shapes for 404 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h1 className="text-[12rem] font-black tracking-tighter text-transparent opacity-10 bg-clip-text bg-gradient-to-br from-primary to-primary-foreground">
            404
          </h1>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 h-16 w-16 animate-bounce rounded-2xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-10 right-10 h-20 w-20 rounded-full bg-purple-500/20 backdrop-blur-xl border border-purple-500/30 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-20 right-20 h-12 w-12 rounded-lg bg-amber-500/20 backdrop-blur-xl border border-amber-500/30 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      </div>

      <div className="z-10 max-w-md space-y-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h2>
        <p className="text-lg text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/dashboard">
              Dashboard
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <nav className="flex justify-center pt-8">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="font-medium text-foreground">404</li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
