/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  CheckSquare,
  Calendar,
  Timer,
  BarChart3,
  Plus,
} from 'lucide-react';

export type ActiveTab = 'overview' | 'syllabus' | 'deliverables' | 'timeline' | 'focus' | 'heatmap';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenImport: () => void;
  totalCoursesCount: number;
  upcomingDeliverablesCount: number;
  mascotState?: 'sleeping' | 'awake' | 'celebrating';
}

const NAV_ITEMS: Array<{
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}> = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'syllabus', label: 'Upload', icon: UploadCloud },
  { id: 'deliverables', label: 'Deadlines', icon: CheckSquare },
  { id: 'timeline', label: 'Study Plan', icon: Calendar },
  { id: 'focus', label: 'Focus Sprint', icon: Timer },
  { id: 'heatmap', label: 'Workload', icon: BarChart3 },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenImport,
  totalCoursesCount,
  upcomingDeliverablesCount,
  mascotState = 'sleeping',
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-12 py-3 transition-colors">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4">
          {/* Brand Wordmark & Mascot status */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('overview')}
              className="flex items-center gap-2 text-xl sm:text-2xl font-serif tracking-[-0.5px] text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer text-left"
              title="Return to Dashboard"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center text-sm font-sans font-bold shadow-xs">
                SR
              </span>
              <span>SyllabusRacoon</span>
            </button>

            {/* Micro status indicator */}
            <div className="hidden sm:flex items-center gap-2 pl-3 py-0.5 border-l border-slate-200 text-xs text-slate-500">
              <span className="font-mono tabular-nums font-medium text-slate-700">
                {totalCoursesCount} {totalCoursesCount === 1 ? 'course' : 'courses'}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono tabular-nums text-rose-600 font-medium">
                {upcomingDeliverablesCount} due
              </span>
            </div>
          </div>

          {/* Desktop Icon-Based Segmented Navigation */}
          <nav
            className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/60"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isDeadlines = item.id === 'deliverables' && upcomingDeliverablesCount > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs shadow-slate-200/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform ${
                      isActive ? 'text-indigo-600 scale-105' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isDeadlines && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {upcomingDeliverablesCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Quick Import & Mascot Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mascot Companion Mini Pill */}
            <button
              onClick={() => onTabChange('focus')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 rounded-full text-xs font-medium text-amber-900 transition-colors cursor-pointer"
              title="Bandit AI Study Companion - Click to open Focus Sprint"
            >
              <span className="text-sm">🦝</span>
              <span className="font-semibold text-slate-800">Bandit</span>
              <span className="text-amber-700 font-mono text-[10px]">
                {mascotState === 'awake' ? '● studying' : mascotState === 'celebrating' ? '🎉 done' : '💤 idle'}
              </span>
            </button>

            {/* Primary CTA Button */}
            <button
              onClick={onOpenImport}
              className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer font-medium shadow-xs"
              title="Import course syllabus via text or PDF"
            >
              <Plus className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Import Syllabus</span>
              <span className="sm:hidden">Import</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Icon-Based Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isDeadlines = item.id === 'deliverables' && upcomingDeliverablesCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 min-w-[50px] rounded-xl transition-all relative cursor-pointer ${
                isActive
                  ? 'text-indigo-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-indigo-600 scale-110' : 'text-slate-500'
                  }`}
                />
                {isDeadlines && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
                    {upcomingDeliverablesCount > 9 ? '9+' : upcomingDeliverablesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
