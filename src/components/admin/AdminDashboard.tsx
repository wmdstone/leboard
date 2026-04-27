import React, { useState } from 'react';
// Tooltip extracted locally? Or just removed because we didn't add the lib
import { LogOut, CheckSquare, Target, FolderTree, Palette, Settings, Database, Server, Info, LayoutDashboard, Loader2, MoreHorizontal, ShieldCheck, Search, Users } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch, removeLocalToken } from '../../lib/api';
import { trackEvent } from '../../lib/analytics';
import { AdminStudentsTab } from './AdminStudentsTab';
import { AdminGoalsTab } from './AdminGoalsTab';
import { AdminAppearanceTab } from './AdminAppearanceTab';
import { AdminStatisticsTab } from './AdminStatisticsTab';
import { AdminImportExportTab } from '../AdminImportExportTab';
import { AdminBackendTab } from '../AdminBackendTab';
import CacheHealthTab from '../CacheHealthTab';
import type { Category, MasterGoal, AssignedGoal, Student } from '../../lib/types';

// --- ADMIN DASHBOARD ---
export function AdminDashboard({ students, refreshData, masterGoals, categories, calculateTotalPoints, appSettings, setAppSettings, navigateTo }: {
  students: Student[];
  refreshData: () => void;
  masterGoals: MasterGoal[];
  categories: Category[];
  calculateTotalPoints: (goals: AssignedGoal[]) => number;
  appSettings: any;
  setAppSettings: any; navigateTo: (path: string, params?: any) => void;
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('students');
  const [isRefreshing, setIsRefreshing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-main">Admin Control</h1>
          <p className="text-text-muted font-medium">Manage students, learning goals, and tracks.</p>
        </div>
                <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              setIsRefreshing(true);
              await refreshData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className="bg-base-100 border border-base-200 px-4 py-2 rounded-xl text-sm font-bold text-text-muted hover:bg-base-200 flex items-center gap-2 active:scale-95 transition-all"
          >
            {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreHorizontal className="w-4 h-4" />}
            Force Sync
          </button>

          <button 
            onClick={async () => {
              await apiFetch('/api/logout', { method: 'POST' });
              removeLocalToken();
              queryClient.setQueryData(['auth'], { authenticated: false });
              trackEvent('admin_logout', { isAdmin: true });
              navigateTo('/');
            }}
            className="bg-base-100 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 flex items-center justify-center active:scale-95 transition-all md:hidden"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Scrollable Horizontal Tabs */}
        <div className="sticky top-0 md:top-16 z-30 bg-base-100/95 backdrop-blur-sm rounded-2xl border border-base-200 overflow-x-auto no-scrollbar scrollbar-hide snap-x px-2 py-1 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4 border-b border-base-200 min-w-max px-4 sm:px-0">
            {[
              { id: 'students', label: 'Students', icon: Users },
              { id: 'goals', label: 'Tracks & Goals', icon: Target },
              { id: 'appearance', label: 'Appearance', icon: Palette },
              { id: 'statistics', label: 'Statistics', icon: Search },
              { id: 'import-export', label: 'Import / Export', icon: Database },
              { id: 'backend', label: 'Backend & DB', icon: Server },
              { id: 'cache', label: 'PWA Management', icon: ShieldCheck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(50);
                  setActiveTab(tab.id);
                }}
                className={`group flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 min-h-11 font-bold text-base sm:text-lg transition-all whitespace-nowrap active:scale-95 border-b-[3px] snap-start ${
                  activeTab === tab.id 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-text-muted hover:text-text-main'
                }`}
              >
                <tab.icon className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 transition-colors ${activeTab === tab.id ? 'text-primary-600' : 'text-text-light group-hover:text-text-muted'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-base-100 rounded-3xl md:rounded-[2.5rem] border border-base-200 shadow-sm overflow-hidden min-h-[600px]">
          {activeTab === 'students' && (
            <AdminStudentsTab 
              students={students} refreshData={refreshData}
              masterGoals={masterGoals} categories={categories}
              calculateTotalPoints={calculateTotalPoints}
            />
          )}
          {activeTab === 'goals' && (
            <AdminGoalsTab 
              masterGoals={masterGoals} refreshData={refreshData}
              categories={categories} 
            />
          )}
          {activeTab === 'appearance' && (
            <AdminAppearanceTab refreshData={refreshData} appSettings={appSettings} setAppSettings={() => queryClient.invalidateQueries({ queryKey: ['app-data'] })} />
          )}
          {activeTab === 'statistics' && (
            <AdminStatisticsTab />
          )}
          {activeTab === 'import-export' && (
            <AdminImportExportTab
              apiFetch={apiFetch}
              students={students}
              masterGoals={masterGoals}
              categories={categories}
              refreshData={refreshData}
            />
          )}
          {activeTab === 'backend' && (
            <AdminBackendTab refreshData={refreshData} />
          )}
          {activeTab === 'cache' && (
            <CacheHealthTab />
          )}
        </div>
      </div>
    </div>
  );
}

