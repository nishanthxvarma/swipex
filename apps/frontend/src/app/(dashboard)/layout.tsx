'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Search,
  Settings,
  Sparkles,
  User,
  X,
  Briefcase,
  Calendar,
  Shield,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { SearchModal } from '@/components/search/search-modal';
import { useNotificationStore } from '@/stores/notification-store';
import { useTheme } from 'next-themes';

const candidateNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discover', href: '/jobs', icon: Layers },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Resume AI', href: '/resume', icon: Sparkles },
  { name: 'Saved Jobs', href: '/saved', icon: Heart },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Companies', href: '/companies', icon: Building2 },
];

const recruiterNavigation = [
  { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/recruiter/jobs', icon: Building2 },
  { name: 'Candidates', href: '/recruiter/candidates', icon: Layers },
  { name: 'Pipeline', href: '/recruiter/pipeline', icon: FileText },
  { name: 'Analytics', href: '/recruiter/analytics', icon: BarChart3 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Company Profile', href: '/recruiter/profile', icon: User },
];

const adminNavigation = [
  { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: User },
  { name: 'Recruiters', href: '/admin/recruiters', icon: Building2 },
  { name: 'Activity', href: '/admin/activity', icon: Layers },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

const getNavItems = (role?: string) => {
  const norm = (role || '').toUpperCase();
  if (norm === 'ADMIN') return adminNavigation;
  if (norm === 'RECRUITER') return recruiterNavigation;
  return candidateNavigation;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isSidebarOpen, toggleSidebar, isSearchOpen, setSearchOpen, toggleSearch } = useUIStore();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isRecruiter = user?.role?.toUpperCase() === 'RECRUITER';
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';
  const profileHref = isRecruiter ? '/recruiter/profile' : '/profile';

  // Role Protection & Workspace Separation
  useEffect(() => {
    if (!user) return;
    const normRole = (user.role || '').toUpperCase();
    if (normRole === 'RECRUITER') {
      const candidatePaths = ['/dashboard', '/jobs', '/applications', '/resume', '/saved', '/analytics'];
      if (candidatePaths.includes(pathname)) {
        if (pathname === '/analytics') {
          router.replace('/recruiter/analytics');
        } else {
          router.replace('/recruiter/dashboard');
        }
      }
    } else if (normRole === 'JOB_SEEKER') {
      if (pathname.startsWith('/recruiter')) {
        router.replace('/dashboard');
      }
    }
  }, [user, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const userName = user?.fullName || 'User';
  const userEmail = user?.email || '';
  const userInitials = getUserInitials(userName);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const notifications = useNotificationStore((s) => s.notifications);

  const sidebarW = isSidebarOpen ? 240 : 68;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground bg-atmospheric">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarW }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col',
          'backdrop-blur-2xl glass-1 border-r border-border',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'md:static md:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center justify-between px-4 border-b border-border/40">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary shadow-xs"
            >
              <Sparkles className="h-4 w-4" />
            </div>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="text-[15px] font-bold tracking-tight text-foreground"
              >
                SwipeX
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-7 w-7"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav items */}
        <div className="flex flex-1 flex-col overflow-y-auto px-2.5 py-3 gap-0.5">
          <nav className="flex flex-col gap-0.5">
            {getNavItems(user?.role).map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={true}
                  title={!isSidebarOpen ? item.name : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-150 relative group',
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-primary"
                    />
                  )}
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  {isSidebarOpen && (
                    <span className="font-medium text-[13px]">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User footer */}
        <div className="border-t border-border/60 p-3">
          <div className={cn('flex items-center gap-2.5', !isSidebarOpen && 'justify-center')}>
            <button
              onClick={() => router.push(profileHref)}
              className="h-8 w-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs bg-primary/10 border border-primary/25 text-primary transition-all hover:scale-105"
              title="View Profile"
            >
              {userInitials}
            </button>
            {isSidebarOpen && (
              <>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(profileHref)}>
                  <p className="truncate text-[13px] font-semibold text-foreground leading-none">{userName}</p>
                  <p className="truncate text-[11px] text-muted-foreground mt-0.5">
                    {user?.role === 'ADMIN' ? 'Admin' : user?.role === 'RECRUITER' ? 'Recruiter' : 'Job Seeker'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Log Out"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          className="absolute -right-3 top-16 hidden h-6 w-6 rounded-full md:flex items-center justify-center transition-all hover:scale-110 glass-2 border border-border shadow-md text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>
      </motion.aside>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header
          className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-border/60 glass-1"
        >
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 -ml-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>SwipeX</span>
              <span>/</span>
              <span className="text-foreground capitalize font-medium">
                {pathname.split('/').filter(Boolean).pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role badge */}
            {user && (
              <div
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary/10 border border-primary/20 text-primary"
              >
                {user.role === 'ADMIN' ? '🛡️ Admin' : user.role === 'RECRUITER' ? '🏢 Recruiter' : '👤 Candidate'}
              </div>
            )}

            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg text-[13px] text-muted-foreground hover:text-foreground glass-1 transition-all cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
              <kbd
                className="ml-2 rounded px-1 text-[10px] font-mono bg-secondary border border-border"
              >⌘K</kbd>
            </button>
            <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive"
                  />
                )}
              </Button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 z-50 w-80 rounded-xl p-4 space-y-3 glass-3 border border-border shadow-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-[13px] font-semibold text-foreground">Notifications</h4>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => useNotificationStore.getState().markAllAsRead()}
                            className="text-[11px] text-primary hover:underline transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="space-y-1 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-6">You&apos;re all caught up.</p>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => {
                                useNotificationStore.getState().markAsRead(n.id);
                                setIsNotificationsOpen(false);
                                router.push('/notifications');
                              }}
                              className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors hover:bg-secondary"
                            >
                              <div
                                className="h-7 w-7 shrink-0 rounded-md flex items-center justify-center mt-0.5 bg-primary/10 text-primary border border-primary/20"
                              >
                                <Bell className="h-3.5 w-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-foreground truncate">{n.title}</p>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                              </div>
                              {!n.isRead && (
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <button
                        onClick={() => { setIsNotificationsOpen(false); router.push('/notifications'); }}
                        className="w-full py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors text-center glass-1 border border-border cursor-pointer"
                      >
                        View all notifications
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle (Light / Dark / System) */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={`Current: ${theme} theme. Click to toggle.`}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-primary" />}
              </Button>
            )}

            {/* Profile menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-all hover:bg-secondary cursor-pointer"
              >
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center font-bold text-[11px] bg-primary/10 border border-primary/25 text-primary"
                >
                  {userInitials}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[12px] font-semibold text-foreground leading-none">{userName}</span>
                </div>
                <ChevronRight className={cn('w-3 h-3 text-muted-foreground hidden sm:block transition-transform', isProfileMenuOpen && 'rotate-90')} />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 mt-2 z-50 w-52 rounded-xl p-1.5 space-y-0.5 glass-3 border border-border shadow-2xl"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-[12px] font-semibold text-foreground truncate">{userName}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{userEmail}</p>
                      </div>
                      {[
                        { label: 'My Profile', href: profileHref, icon: User },
                        { label: 'Settings', href: '/settings', icon: Settings },
                      ].map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                        >
                          <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="h-px bg-border my-1" />
                      <button
                        onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Log Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Cmd+K search */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile bottom nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around px-2 py-2 z-40 glass-3 border-t border-border"
      >
        {getNavItems(user?.role).slice(0, 4).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 px-3 py-1.5">
              <item.icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[9px] font-medium', isActive ? 'text-primary font-bold' : 'text-muted-foreground')}>
                {item.name}
              </span>
            </Link>
          );
        })}
        <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 px-3 py-1.5">
          <Menu className="h-5 w-5 text-muted-foreground" />
          <span className="text-[9px] font-medium text-muted-foreground">More</span>
        </button>
      </div>
    </div>
  );
}
