'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  BarChart3,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Heart,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  User,
  X,
  CheckCircle2,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { SearchModal } from '@/components/search/search-modal';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Job Feed', href: '/jobs', icon: Layers },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Saved Jobs', href: '/saved', icon: Heart },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const bottomNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const initialNotifications = [
  {
    id: 1,
    title: 'New 95% Job Match!',
    description: 'Vercel posted Senior Frontend Engineer in Remote.',
    time: '10m ago',
    read: false,
    icon: Sparkles,
    color: 'text-amber-500',
  },
  {
    id: 2,
    title: 'Interview Confirmed',
    description: 'Google technical interview scheduled for Thursday 2:00 PM.',
    time: '2h ago',
    read: false,
    icon: Calendar,
    color: 'text-purple-500',
  },
  {
    id: 3,
    title: 'Application Viewed',
    description: 'Stripe talent acquisition team viewed your resume.',
    time: '5h ago',
    read: true,
    icon: Briefcase,
    color: 'text-blue-500',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isSidebarOpen, toggleSidebar, isSearchOpen, setSearchOpen, toggleSearch } = useUIStore();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Global Cmd+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getUserInitials = (name?: string) => {
    if (!name) return 'NV';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const userName = user?.fullName || 'Nishanth Varma';
  const userEmail = user?.email || 'nishvarma2007@gmail.com';
  const userInitials = getUserInitials(userName);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 256 : 80,
          x: isMobileMenuOpen ? 0 : -256,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card md:static md:translate-x-0 transition-all duration-300",
          !isSidebarOpen && "md:w-20"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-bold text-foreground"
              >
                SwipeX
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-1">
            {bottomNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all relative group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                  title={!isSidebarOpen ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isSidebarOpen && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t p-4">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center")}>
            <Link
              href="/profile"
              className="h-10 w-10 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary hover:scale-105 transition-transform"
              title="View Profile"
            >
              {userInitials}
            </Link>
            {isSidebarOpen && (
              <div className="flex flex-1 flex-col overflow-hidden cursor-pointer" onClick={() => router.push('/profile')}>
                <span className="truncate text-sm font-semibold hover:text-primary transition-colors">{userName}</span>
                <span className="truncate text-xs text-muted-foreground">{userEmail}</span>
              </div>
            )}
            {isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Sign Out"
                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute -right-4 top-20 hidden h-8 w-8 rounded-full border shadow-sm md:flex hover:scale-110 transition-transform"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </motion.aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden -ml-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden sm:flex items-center text-sm font-medium text-muted-foreground">
              <Link href="/dashboard" className="hover:text-foreground transition-colors">Pages</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground capitalize font-semibold">
                {pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Button */}
            <div className="relative hidden md:block">
              <Button
                variant="outline"
                onClick={() => setSearchOpen(true)}
                className="w-64 justify-start text-muted-foreground hover:border-primary/50 transition-all rounded-xl"
              >
                <Search className="mr-2 h-4 w-4 text-primary" />
                Search jobs, skills...
                <kbd className="pointer-events-none absolute right-2 top-2.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘K
                </kbd>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5 text-primary" />
            </Button>

            {/* Notifications Popover */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                )}
              </Button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsNotificationsOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 z-50 w-80 sm:w-96 rounded-2xl border bg-card p-4 shadow-2xl space-y-4"
                    >
                      <div className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={markAllRead}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {notifications.map((n) => {
                          const Icon = n.icon;
                          return (
                            <div
                              key={n.id}
                              className={cn(
                                "flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer",
                                n.read ? "hover:bg-secondary/50 opacity-75" : "bg-primary/5 hover:bg-primary/10"
                              )}
                            >
                              <div className={cn("p-2 rounded-lg bg-background shadow-xs", n.color)}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-foreground">{n.title}</p>
                                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          router.push('/dashboard');
                        }}
                      >
                        View All Activity
                      </Button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
      
      {/* Global Cmd+K Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background flex justify-around p-3 z-40 pb-safe shadow-lg">
        {navigation.slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary font-bold" : "text-muted-foreground")} />
              <span className={cn("text-[10px]", isActive ? "text-primary font-bold" : "text-muted-foreground")}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1">
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">More</span>
        </button>
      </div>
    </div>
  );
}
