import { ActionMenu } from './components/ui/ActionMenu';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { RankMovement } from './components/ui/RankMovement';
import { StatCard } from './components/ui/StatCard';
import { LoginPage } from './components/pages/LoginPage';
import { LeaderboardPage } from './components/pages/LeaderboardPage';
import { StudentProfilePage } from './components/pages/StudentProfilePage';
import { applyThemeColors } from './components/admin/AdminAppearanceTab';
import { AdminDashboard } from './components/admin/AdminDashboard';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthQuery, useAppDataQuery, useAdminStatsQuery, useAppEventsQuery } from './hooks/useAppQueries';
import { apiFetch, getLocalToken, setLocalToken, removeLocalToken } from './lib/api';
import type { Category, MasterGoal, AssignedGoal, Student } from './lib/types';
import { trackEvent, setAnalyticsAdminFlag } from './lib/analytics';
import { supabase } from './integrations/supabase/client';
import {
  TIME_RANGE,
  TIME_RANGE_OPTIONS,
  POINTS_CAPTION,
  STATS_CAPTION,
  type TimeRange,
} from './lib/timeRanges';
import { isWithinRange, type DateRange } from './lib/timeRanges';
import { TimeRangeFilter, createDefaultTimeRangeValue, type TimeRangeValue } from './components/TimeRangeFilter';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import {
  StudentSearchFilter,
  applyStudentSearchFilter,
  emptyStudentSearchFilter,
  type StudentSearchFilterValue,
} from './components/StudentSearchFilter';
import { StudentSortDropdown, sortStudents, type SortKey } from './components/StudentSortDropdown';
import { StudentSearchAdvanced } from './components/StudentSearchAdvanced';
import { AdminImportExportTab } from './components/AdminImportExportTab';
import { AdminBackendTab } from './components/AdminBackendTab';
import { ImageFallback, dicebearAvatar } from './components/ImageFallback';
import { CacheHealthTab } from './components/CacheHealthTab';
import { 
  Trophy, ArrowLeft, Plus, CheckCircle2, Circle, Medal, Award, Flame, 
  Settings, Search, Edit, Trash2, X, ChevronDown, ChevronUp, Users, 
  Target, FolderTree, Info, CheckSquare, Square, LogIn, LogOut, Loader2,
  Home, User as UserIcon, LayoutDashboard, MoreHorizontal, ArrowUp, ArrowDown,
  Palette, Save, Image as ImageIcon, TrendingUp, Crown, ZoomIn, ZoomOut,
  Database, Server, ShieldCheck, Sun, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Cropper from 'react-easy-crop';

// --- APP COMPONENT ---
export default function App() {
  const queryClient = useQueryClient();
  
  const { data: authData, isLoading: isAuthLoading } = useAuthQuery();

  const { data: appData, isLoading: isAppDataLoading } = useAppDataQuery();

  const categories = appData?.categories || [];
  const masterGoals = appData?.masterGoals || [];
  const students = appData?.students || [];
  const appSettings = appData?.appSettings || {};
  const isAdmin = !!authData?.authenticated;
  const isLoading = isAppDataLoading && !appData;

  useEffect(() => {
    if (appSettings && Object.keys(appSettings).length > 0) {
      applyThemeColors(appSettings);
    }
  }, [appSettings]);
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme-mode') as 'light' | 'dark') || 'light');

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [currentRoute, setCurrentRoute] = useState<{ path: string; params: { id?: string } }>({ path: '/', params: {} });

  // Navigation Helper
  const navigateTo = (path: string, params = {}) => {
    setCurrentRoute({ path, params });
    window.scrollTo(0, 0);
  };

  // Auth Check & Tracking
  useEffect(() => {
    const handleAuthExpired = () => {
      queryClient.setQueryData(['auth'], { authenticated: false });
      navigateTo('/login');
    };
    window.addEventListener('auth-expired', handleAuthExpired);

    setAnalyticsAdminFlag(isAdmin);
    
    apiFetch('/api/track-visit', { method: 'POST' }).catch(() => {});
    trackEvent('page_view');

    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [isAdmin, queryClient]);

  const refreshData = useCallback(async () => {
     await queryClient.invalidateQueries({ queryKey: ['app-data'] });
  }, [queryClient]);

  useEffect(() => {
    let t: any = null;
    const handler = () => {
      clearTimeout(t);
      t = setTimeout(() => refreshData(), 150);
    };
    window.addEventListener('db-connection-changed', handler);
    return () => {
      window.removeEventListener('db-connection-changed', handler);
      clearTimeout(t);
    };
  }, [refreshData]);

  const calculateTotalPoints = useCallback((assignedGoals: AssignedGoal[]) => {
    if (!assignedGoals || !masterGoals) return 0;
    return assignedGoals.reduce((total, assigned) => {
      if (assigned.completed) {
        const goalData = masterGoals.find(mg => String(mg.id) === String(assigned.goalId));
        if (goalData) {
          const pts = goalData.points !== undefined ? goalData.points : (goalData as any).pointValue || (goalData as any).pts || 0;
          const numPts = typeof pts === 'number' ? pts : parseInt(String(pts), 10);
          return total + (isNaN(numPts) ? 0 : numPts);
        }
      }
      return total;
    }, 0);
  }, [masterGoals]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-primary font-bold tracking-widest uppercase text-xs">Loading Application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col pb-20 md:pb-0">
      {/* Navbar Global */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-40 shadow-soft hidden md:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigateTo('/')}
            >
              {appSettings.logoUrl ? (
                <ImageFallback src={appSettings.logoUrl} alt="Logo" variant="logo" className="h-10 w-10 object-contain rounded-xl" wrapperClassName="h-10 w-10" />
              ) : (
                <div className="bg-primary p-2 rounded-xl group-hover:rotate-6 transition-transform">
                  <Trophy className="h-6 w-6 text-primary-foreground" />
                </div>
              )}
              <span className="font-bold text-xl tracking-tight text-foreground">
                {appSettings.appName || 'Tiny Tree'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary rounded-xl">
                {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => navigateTo('/')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${currentRoute.path === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'}`}
              >
                Leaderboard
              </button>
              
              {isAdmin ? (
                <>
                  <button 
                    onClick={() => navigateTo('/admin')}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${currentRoute.path === '/admin' ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    <Settings className="h-4 w-4" /> Admin Panel
                  </button>
                  <button 
                    onClick={async () => {
                      await apiFetch('/api/logout', { method: 'POST' });
                      removeLocalToken();
                      queryClient.setQueryData(['auth'], { authenticated: false });
                      trackEvent('admin_logout', { isAdmin: true });
                      navigateTo('/');
                    }}
                    className="p-2 text-muted-foreground/60 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => navigateTo('/login')}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-primary hover:bg-primary/10 border border-primary/20 transition-all"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 overflow-x-hidden">
        <ErrorBoundary>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute.path + (currentRoute.params.id || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {currentRoute.path === '/' && (
              <ErrorBoundary><LeaderboardPage students={students} masterGoals={masterGoals} calculateTotalPoints={calculateTotalPoints} navigateTo={navigateTo} isLoading={isLoading} appSettings={appSettings} /></ErrorBoundary>
            )}
            {currentRoute.path === '/student' && (
              <ErrorBoundary>
                <StudentProfilePage 
                studentId={currentRoute.params.id || ''} 
                students={students} 
                masterGoals={masterGoals}
                categories={categories}
                calculateTotalPoints={calculateTotalPoints}
                navigateTo={navigateTo}
                />
              </ErrorBoundary>
            )}
            {currentRoute.path === '/login' && <LoginPage onLogin={() => {
              queryClient.invalidateQueries({ queryKey: ['auth'] });
              trackEvent('admin_login', { isAdmin: true });
              navigateTo('/admin');
            }} appSettings={appSettings} />}
            {currentRoute.path === '/admin' && (
              isAdmin ? (
                <ErrorBoundary>
                  <AdminDashboard 
                  students={students} refreshData={refreshData}
                  masterGoals={masterGoals} 
                  categories={categories} 
                  calculateTotalPoints={calculateTotalPoints}
                  appSettings={appSettings}
                  setAppSettings={() => queryClient.invalidateQueries({ queryKey: ['app-data'] })} navigateTo={navigateTo}
                  />
                </ErrorBoundary>
              ) : <LoginPage onLogin={() => {
                queryClient.invalidateQueries({ queryKey: ['auth'] });
                trackEvent('admin_login', { isAdmin: true });
              }} appSettings={appSettings} />
            )}
          </motion.div>
        </AnimatePresence>
        </ErrorBoundary>
      </main>

      <button onClick={toggleTheme} className="fixed bottom-24 right-4 md:hidden p-3 bg-secondary border border-border text-foreground transition-colors shadow-soft rounded-full z-50">
        {themeMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Bottom Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-8 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-between items-center md:hidden z-50">
        <button 
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(50);
            navigateTo('/');
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentRoute.path === '/' || currentRoute.path === '/student' ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </button>

        {appSettings?.logoUrl ? (
          <div className="w-16 h-16 -mt-8 rounded-full border-4 border-border bg-card shadow-soft flex items-center justify-center overflow-hidden z-10 cursor-pointer active:scale-95 transition-transform" onClick={() => navigateTo('/')}>
             <ImageFallback src={appSettings.logoUrl} alt="Logo" variant="logo" className="w-full h-full object-cover" wrapperClassName="w-full h-full" />
          </div>
        ) : (
          <div className="w-16 h-16 -mt-8 rounded-full border-4 border-border bg-card shadow-soft flex items-center justify-center z-10 text-primary cursor-pointer active:scale-95 transition-transform" onClick={() => navigateTo('/')}>
             <Trophy className="w-8 h-8" />
          </div>
        )}

        <button 
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(50);
            if (isAdmin) navigateTo('/admin'); else navigateTo('/login');
          }}
          className={`flex flex-col items-center gap-1.5 transition-colors ${currentRoute.path === '/admin' || currentRoute.path === '/login' ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}
        >
          {isAdmin ? <LayoutDashboard className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">{isAdmin ? 'Admin' : 'Login'}</span>
        </button>
      </nav>
    </div>
  );
}




