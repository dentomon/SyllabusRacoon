/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, StudyBlock, Deliverable } from '../types';
import {
  make_ics,
  buildCalendarEventsFromCourse,
  downloadIcsFile,
  createGoogleCalendarUrl,
} from '../utils/calendar';
import {
  Download,
  ExternalLink,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  RefreshCw,
  Calendar,
  Sparkles,
  SlidersHorizontal,
  Flame,
} from 'lucide-react';

interface StudyTimelineViewProps {
  courses: Course[];
  activeCourseId: string;
  onUpdateCourse: (updated: Course) => void;
  onOpenRescheduleModal: () => void;
  onNavigateToPlanning: () => void;
}

export const StudyTimelineView: React.FC<StudyTimelineViewProps> = ({
  courses,
  activeCourseId,
  onUpdateCourse,
  onOpenRescheduleModal,
  onNavigateToPlanning,
}) => {
  const [filterCourseId, setFilterCourseId] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState<boolean>(true);

  const filteredCourses =
    filterCourseId === 'all'
      ? courses
      : courses.filter((c) => c.id === filterCourseId);

  const allBlocks: StudyBlock[] = [];
  const allDeliverables: Deliverable[] = [];

  filteredCourses.forEach((c) => {
    allBlocks.push(...c.studyBlocks);
    allDeliverables.push(...c.deliverables);
  });

  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  const handleToggleBlockCompletion = (block: StudyBlock) => {
    const parentCourse = courses.find((c) => c.id === block.courseId);
    if (!parentCourse) return;

    const updatedBlocks = parentCourse.studyBlocks.map((b) =>
      b.id === block.id ? { ...b, isCompleted: !b.isCompleted } : b
    );

    onUpdateCourse({
      ...parentCourse,
      studyBlocks: updatedBlocks,
    });
  };

  const handleExportIcs = () => {
    const events = buildCalendarEventsFromCourse(allBlocks, allDeliverables);
    const icsContent = make_ics(events);
    const filename =
      filterCourseId === 'all'
        ? 'SyllabusPilot_Study_Plan.ics'
        : `${courses.find((c) => c.id === filterCourseId)?.code || 'Course'}_Plan.ics`;
    downloadIcsFile(filename, icsContent);
  };

  interface WeekGroup {
    weekTitle: string;
    startDate: string;
    endDate: string;
    blocks: StudyBlock[];
    deliverables: Deliverable[];
    totalHours: number;
    completedBlocksCount: number;
  }

  const groupBlocksByWeek = (): WeekGroup[] => {
    if (allBlocks.length === 0) return [];

    const weeksMap = new Map<string, WeekGroup>();

    allBlocks.forEach((block) => {
      const [y, m, d] = block.date.split('-').map(Number);
      const date = new Date(y, m - 1, d, 12, 0, 0);

      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date);
      monday.setDate(diff);

      const sunday = new Date(monday);
      sunday.setDate(sunday.getDate() + 6);

      const monStr = monday.toISOString().split('T')[0];
      const sunStr = sunday.toISOString().split('T')[0];

      const key = monStr;
      if (!weeksMap.has(key)) {
        const monFormat = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const sunFormat = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        weeksMap.set(key, {
          weekTitle: `${monFormat} – ${sunFormat}`,
          startDate: monStr,
          endDate: sunStr,
          blocks: [],
          deliverables: [],
          totalHours: 0,
          completedBlocksCount: 0,
        });
      }

      const group = weeksMap.get(key)!;
      group.blocks.push(block);
      group.totalHours += block.durationHours || 2;
      if (block.isCompleted) group.completedBlocksCount += 1;
    });

    allDeliverables.forEach((deliv) => {
      for (const group of weeksMap.values()) {
        if (deliv.dueDate >= group.startDate && deliv.dueDate <= group.endDate) {
          if (!group.deliverables.some((d) => d.id === deliv.id)) {
            group.deliverables.push(deliv);
          }
        }
      }
    });

    return Array.from(weeksMap.values()).sort((a, b) => a.startDate.localeCompare(b.startDate));
  };

  const weekGroups = groupBlocksByWeek();
  const totalPlannedHours = allBlocks.reduce((acc, b) => acc + (b.durationHours || 2), 0);
  const totalCompletedHours = allBlocks
    .filter((b) => b.isCompleted)
    .reduce((acc, b) => acc + (b.durationHours || 2), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-mono font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Study Calendar & Export</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
            Week-by-Week <em className="italic text-indigo-600 font-normal">Study Plan</em>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {allBlocks.length} planned sessions · {totalPlannedHours.toFixed(1)} study hours · 1-click Google Calendar & .ics export
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onNavigateToPlanning}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-full transition-all cursor-pointer shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-plan Questions</span>
          </button>

          <button
            onClick={onOpenRescheduleModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full transition-colors cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>"I was sick" / Reschedule</span>
          </button>

          <button
            onClick={handleExportIcs}
            disabled={allBlocks.length === 0}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 active:scale-95 rounded-full transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export Calendar (.ics)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Scope:</span>
          <select
            value={filterCourseId}
            onChange={(e) => setFilterCourseId(e.target.value)}
            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-800"
          >
            <option value="all">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-slate-600">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="accent-indigo-600 rounded"
            />
            <span>Show completed sessions</span>
          </label>
        </div>
      </div>

      {/* Zero State */}
      {weekGroups.length === 0 && (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-xl">
            📅
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            No study blocks generated yet
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Answer the 3 planning questions to automatically generate study sessions for your deliverables.
          </p>
          <button
            onClick={onNavigateToPlanning}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-semibold rounded-full hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs"
          >
            <span>Configure 3-Question Plan</span>
          </button>
        </div>
      )}

      {/* Week by Week Visual Cards */}
      <div className="space-y-6">
        {weekGroups.map((week, wIdx) => {
          const visibleBlocks = showCompleted
            ? week.blocks
            : week.blocks.filter((b) => !b.isCompleted);

          if (visibleBlocks.length === 0 && week.deliverables.length === 0) return null;

          const weekPercent = week.blocks.length
            ? Math.round((week.completedBlocksCount / week.blocks.length) * 100)
            : 0;

          return (
            <div
              key={week.startDate}
              className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden"
            >
              {/* Week Header with Progress */}
              <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base text-slate-900">
                    Week {wIdx + 1}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">({week.weekTitle})</span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-slate-600">
                  <span>{week.completedBlocksCount}/{week.blocks.length} done ({weekPercent}%)</span>
                  <span>·</span>
                  <span>{week.totalHours.toFixed(1)} hrs</span>
                  {week.deliverables.length > 0 && (
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                      🚨 {week.deliverables.length} due
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full bg-slate-100 h-1">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500"
                  style={{ width: `${weekPercent}%` }}
                />
              </div>

              {/* Deliverables Due This Week Card */}
              {week.deliverables.length > 0 && (
                <div className="bg-gradient-to-r from-rose-50/90 to-amber-50/80 px-6 py-3.5 border-b border-rose-100 flex flex-wrap items-center gap-3">
                  <span className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono">
                    Due This Week:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {week.deliverables.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-xs border border-rose-200 shadow-xs"
                      >
                        <span className="font-bold text-rose-900">{d.title}</span>
                        <span className="text-rose-600 font-mono text-[11px]">
                          ({d.dueDate} · {d.weightPercent}%)
                        </span>
                        <a
                          href={createGoogleCalendarUrl({
                            title: `[DEADLINE] ${d.title}`,
                            description: `Deliverable: ${d.title} (${d.weightPercent}%). Description: ${d.description || ''}`,
                            dateStr: d.dueDate,
                            timeStr: d.dueTime || '23:59',
                            durationHours: 1,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-rose-700 hover:text-rose-950 p-0.5"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Blocks List */}
              <div className="divide-y divide-slate-100">
                {visibleBlocks.map((block) => {
                  const googleCalUrl = createGoogleCalendarUrl({
                    title: `[Study] ${block.courseCode}: ${block.title}`,
                    description: `Study Session: ${block.objective}\nCourse: ${block.courseName}`,
                    dateStr: block.date,
                    timeStr: block.startTime,
                    durationHours: block.durationHours,
                  });

                  return (
                    <div
                      key={block.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors ${
                        block.isCompleted ? 'bg-slate-50/50 opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleBlockCompletion(block)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0 cursor-pointer"
                          title={block.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {block.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: block.courseColor }}
                            />
                            <span className="text-xs font-bold font-mono text-slate-900">
                              {block.courseCode}
                            </span>
                            <span className="text-slate-300">·</span>
                            <span
                              className={`text-sm font-semibold text-slate-900 ${
                                block.isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {block.title}
                            </span>
                            {block.wasRescheduled && (
                              <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full font-mono font-bold">
                                Rescheduled
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                            {block.objective}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400 font-mono tabular-nums">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{block.date} at {block.startTime}</span>
                            <span>·</span>
                            <span>{block.durationHours} hrs</span>
                          </div>
                        </div>
                      </div>

                      {/* Google Cal Button */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <a
                          href={googleCalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-full text-xs font-medium transition-all cursor-pointer shadow-xs"
                          title="Add to Google Calendar"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-600" />
                          <span>Google Cal</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
