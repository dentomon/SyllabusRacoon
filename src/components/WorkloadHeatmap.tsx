/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course } from '../types';
import { computeWorkloadHeatmap } from '../utils/planner';
import {
  AlertTriangle,
  Clock,
  Calendar,
  BarChart3,
  Flame,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface WorkloadHeatmapProps {
  courses: Course[];
  onOpenRescheduleModal: () => void;
}

export const WorkloadHeatmap: React.FC<WorkloadHeatmapProps> = ({
  courses,
  onOpenRescheduleModal,
}) => {
  const weeks = computeWorkloadHeatmap(courses);
  const totalDeliverables = courses.reduce((sum, c) => sum + c.deliverables.length, 0);
  const clashWeeks = weeks.filter((w) => w.hasClash);
  const totalPlannedHours = weeks.reduce((sum, w) => sum + w.totalStudyHours, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-medium">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bottleneck & Clash Detector</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
            Workload <em className="italic text-indigo-600 font-normal">Heatmap</em>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Cross-course pressure analysis across {courses.length} courses · {totalDeliverables} graded milestones
          </p>
        </div>

        {clashWeeks.length > 0 ? (
          <button
            onClick={onOpenRescheduleModal}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-full text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start md:self-auto"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{clashWeeks.length} exam clash {clashWeeks.length === 1 ? 'week' : 'weeks'} · Rebalance</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>No exam clashes detected</span>
          </div>
        )}
      </div>

      {/* 3 Metric Insight Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
            📊
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Active Weeks
            </div>
            <div className="text-xl font-bold font-mono text-slate-900">
              {weeks.length} weeks
            </div>
            <p className="text-[11px] text-slate-500">
              {totalPlannedHours.toFixed(0)}h total study hours
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
            🚨
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Peak Stress Weeks
            </div>
            <div className="text-xl font-bold font-mono text-rose-700">
              {clashWeeks.length} weeks
            </div>
            <p className="text-[11px] text-slate-500">
              {clashWeeks.length > 0 ? 'Exams within 48h of each other' : 'Workload well distributed'}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
            ⚡
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
              Adaptive Rebalancing
            </div>
            <div className="text-xl font-bold font-mono text-amber-900">
              1-Click
            </div>
            <button
              onClick={onOpenRescheduleModal}
              className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              Simulate sick days →
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Cards */}
      <div className="space-y-3.5">
        {weeks.map((week) => {
          // Color based on intensity
          const isHigh = week.hasClash || week.intensityScore >= 70;
          const isModerate = !isHigh && week.intensityScore >= 35;

          const barColor = isHigh
            ? 'bg-rose-500'
            : isModerate
            ? 'bg-amber-500'
            : 'bg-indigo-500';

          return (
            <div
              key={week.startDate}
              className={`p-5 bg-white rounded-2xl border transition-all shadow-xs ${
                week.hasClash
                  ? 'border-rose-300 ring-1 ring-rose-100 bg-rose-50/20'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-slate-900 w-20 shrink-0">
                    Week {week.weekNumber}
                  </span>

                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {week.startDate} → {week.endDate}
                  </span>

                  {week.hasClash ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full font-mono uppercase">
                      Exam Clash
                    </span>
                  ) : week.totalStudyHours > 0 ? (
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-full font-mono">
                      Nominal
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Light
                    </span>
                  )}
                </div>

                {/* Metrics in Tabular Numerals */}
                <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{week.totalStudyHours}h study</span>
                  </span>

                  <span>·</span>

                  <span className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{week.deliverablesDue.length} milestones</span>
                  </span>
                </div>
              </div>

              {/* Visual Load Intensity Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className={`h-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${Math.max(5, week.intensityScore)}%` }}
                />
              </div>

              {/* Clash Warning Box */}
              {week.hasClash && (
                <div className="mt-3 p-3 bg-rose-100/80 border border-rose-200 rounded-xl text-xs text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-medium">{week.clashReason}</span>
                  </div>
                  <button
                    onClick={onOpenRescheduleModal}
                    className="text-xs font-bold text-rose-800 hover:text-rose-950 underline cursor-pointer whitespace-nowrap"
                  >
                    Adjust study pace →
                  </button>
                </div>
              )}

              {/* Deliverables Due in this week */}
              {week.deliverablesDue.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-[11px] font-mono uppercase text-slate-400">Due:</span>
                  {week.deliverablesDue.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-full text-slate-800 font-medium"
                    >
                      <span className="font-bold text-slate-900">{d.courseCode}</span>
                      <span className="text-slate-300">·</span>
                      <span className="truncate max-w-[150px]">{d.title}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        ({d.dueDate.slice(5)} · {d.weightPercent}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
