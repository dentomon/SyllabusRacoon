/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, StudyBlock, Deliverable } from '../types';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  ExternalLink,
  Timer,
  CheckSquare,
  ChevronRight,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  CalendarCheck2,
  CalendarPlus,
  Download,
  AlertCircle,
} from 'lucide-react';
import { createGoogleCalendarUrl, downloadIcsFile, make_ics, buildCalendarEventsFromCourse } from '../utils/calendar';

interface StartPageViewProps {
  courses: Course[];
  onNavigateTab: (tab: 'syllabus' | 'deliverables' | 'timeline' | 'focus' | 'heatmap') => void;
  onSelectCourse: (courseId: string) => void;
  onOpenRescheduleModal: () => void;
  onToggleBlock: (block: StudyBlock) => void;
  onToggleDeliverable?: (deliverableId: string, courseId: string) => void;
  onAddStudyBlock?: (newBlock: StudyBlock) => void;
}

// Reusable SVG Donut / Pie Progress Ring
interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  strokeColor: string;
  bgColor?: string;
  centerPrimaryText: string;
  centerSubText: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 110,
  strokeWidth = 10,
  strokeColor,
  bgColor = '#e2e8f0',
  centerPrimaryText,
  centerSubText,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
        <span className="text-[17px] font-bold font-mono tracking-tight text-slate-900 leading-none">
          {centerPrimaryText}
        </span>
        <span className="text-[10px] text-slate-500 font-medium tracking-tight mt-1 truncate max-w-[80px]">
          {centerSubText}
        </span>
      </div>
    </div>
  );
};

// Multi-slice SVG Pie Chart for Workload Distribution
interface PieSlice {
  label: string;
  value: number;
  color: string;
  courseCode: string;
}

const MultiSlicePieChart: React.FC<{
  slices: PieSlice[];
  size?: number;
}> = ({ slices, size = 110 }) => {
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const totalValue = slices.reduce((sum, s) => sum + s.value, 0);
  if (totalValue <= 0) {
    return (
      <div className="w-[110px] h-[110px] rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
        No hours
      </div>
    );
  }

  const center = size / 2;
  const radius = (size - 6) / 2;
  const innerRadius = radius * 0.52; // Donut style for modern clarity

  // Compute angles
  let currentAngle = -Math.PI / 2; // Start at top
  const paths: Array<{
    d: string;
    color: string;
    label: string;
    percent: number;
    value: number;
    courseCode: string;
  }> = [];

  slices.forEach((slice) => {
    if (slice.value <= 0) return;
    const sliceAngle = (slice.value / totalValue) * (2 * Math.PI);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    // Single item edge case
    if (slices.filter((s) => s.value > 0).length === 1) {
      paths.push({
        d: '',
        color: slice.color,
        label: slice.label,
        percent: 100,
        value: slice.value,
        courseCode: slice.courseCode,
      });
      return;
    }

    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const ix1 = center + innerRadius * Math.cos(endAngle);
    const iy1 = center + innerRadius * Math.sin(endAngle);
    const ix2 = center + innerRadius * Math.cos(startAngle);
    const iy2 = center + innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    const pathD = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z',
    ].join(' ');

    paths.push({
      d: pathD,
      color: slice.color,
      label: slice.label,
      percent: Math.round((slice.value / totalValue) * 100),
      value: slice.value,
      courseCode: slice.courseCode,
    });
  });

  const activeSlice = hoveredSlice !== null ? paths[hoveredSlice] : null;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="overflow-visible">
        {paths.length === 1 ? (
          <circle
            cx={center}
            cy={center}
            r={(radius + innerRadius) / 2}
            stroke={paths[0].color}
            strokeWidth={radius - innerRadius}
            fill="none"
          />
        ) : (
          paths.map((p, idx) => {
            const isHovered = hoveredSlice === idx;
            return (
              <path
                key={idx}
                d={p.d}
                fill={p.color}
                opacity={hoveredSlice === null || isHovered ? 1 : 0.45}
                className="transition-all duration-200 cursor-pointer hover:scale-[1.03]"
                style={{ transformOrigin: `${center}px ${center}px` }}
                onMouseEnter={() => setHoveredSlice(idx)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
        {activeSlice ? (
          <>
            <span className="text-[13px] font-bold font-mono text-slate-900 leading-tight">
              {activeSlice.percent}%
            </span>
            <span className="text-[9px] text-slate-500 font-medium truncate max-w-[70px]">
              {activeSlice.courseCode}
            </span>
          </>
        ) : (
          <>
            <span className="text-[15px] font-bold font-mono text-slate-900 leading-tight">
              {totalValue.toFixed(0)}h
            </span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">
              Total
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export const StartPageView: React.FC<StartPageViewProps> = ({
  courses,
  onNavigateTab,
  onSelectCourse,
  onOpenRescheduleModal,
  onToggleBlock,
  onToggleDeliverable,
  onAddStudyBlock,
}) => {
  const todayStr = '2026-11-02';

  // State for quick task adder for today
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCourseId, setNewTaskCourseId] = useState(courses[0]?.id || '');
  const [newTaskDuration, setNewTaskDuration] = useState('1.5');
  const [newTaskTime, setNewTaskTime] = useState('16:00');
  const [newTaskObjective, setNewTaskObjective] = useState('');

  // Collect all deliverables & blocks
  const allDeliverables: Array<Deliverable & { courseCode: string; courseColor: string; courseName: string; courseId: string }> = [];
  const allBlocks: StudyBlock[] = [];

  courses.forEach((c) => {
    c.deliverables.forEach((d) => {
      allDeliverables.push({
        ...d,
        courseCode: c.code,
        courseColor: c.color,
        courseName: c.name,
        courseId: c.id,
      });
    });
    allBlocks.push(...c.studyBlocks);
  });

  allDeliverables.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  // Today's Tasks
  const todayBlocks = allBlocks.filter((b) => b.date === todayStr);
  const todayDeliverables = allDeliverables.filter((d) => d.dueDate === todayStr);

  const completedTodayBlocks = todayBlocks.filter((b) => b.isCompleted).length;
  const completedTodayDeliverables = todayDeliverables.filter((d) => d.isCompleted).length;
  const totalTodayTasks = todayBlocks.length + todayDeliverables.length;
  const completedTodayCount = completedTodayBlocks + completedTodayDeliverables;
  const todayPercent = totalTodayTasks ? Math.round((completedTodayCount / totalTodayTasks) * 100) : 100;

  // Next upcoming sessions if user wants to pull ahead
  const upcomingBlocksFuture = allBlocks.filter((b) => b.date > todayStr && !b.isCompleted);
  const nextSession = upcomingBlocksFuture[0];

  // Overall Deliverables Metrics
  const totalDeliverablesCount = allDeliverables.length;
  const completedDeliverablesCount = allDeliverables.filter((d) => d.isCompleted).length;
  const deliverablesPercent = totalDeliverablesCount
    ? Math.round((completedDeliverablesCount / totalDeliverablesCount) * 100)
    : 0;

  // Overall Study Hours Metrics
  const totalHoursPlanned = allBlocks.reduce((sum, b) => sum + (b.durationHours || 2), 0);
  const totalHoursDone = allBlocks.filter((b) => b.isCompleted).reduce((sum, b) => sum + (b.durationHours || 2), 0);
  const hoursPercent = totalHoursPlanned ? Math.round((totalHoursDone / totalHoursPlanned) * 100) : 0;

  // Course Workload Slices for Pie Chart
  const courseWorkloadSlices: PieSlice[] = courses.map((c) => {
    const courseHours = c.studyBlocks.reduce((sum, b) => sum + (b.durationHours || 2), 0);
    return {
      label: c.name,
      value: courseHours,
      color: c.color,
      courseCode: c.code,
    };
  });

  const handleCreateTodayTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !onAddStudyBlock) return;

    const targetCourse = courses.find((c) => c.id === newTaskCourseId) || courses[0];
    if (!targetCourse) return;

    const newBlock: StudyBlock = {
      id: `task-today-${Date.now()}`,
      courseId: targetCourse.id,
      courseName: targetCourse.name,
      courseCode: targetCourse.code,
      courseColor: targetCourse.color,
      title: newTaskTitle.trim(),
      date: todayStr,
      startTime: newTaskTime || '16:00',
      durationHours: parseFloat(newTaskDuration) || 1.5,
      objective: newTaskObjective.trim() || 'Focus session for today',
      isCompleted: false,
    };

    onAddStudyBlock(newBlock);
    setNewTaskTitle('');
    setNewTaskObjective('');
    setIsAddingTask(false);
  };

  const handlePullNextSessionToToday = () => {
    if (!nextSession || !onAddStudyBlock) return;
    const pulledBlock: StudyBlock = {
      ...nextSession,
      id: `task-pulled-${Date.now()}`,
      date: todayStr,
      startTime: '17:00',
    };
    onAddStudyBlock(pulledBlock);
  };

  const handleExportAllCalendar = () => {
    const events = buildCalendarEventsFromCourse(allBlocks, allDeliverables);
    const ics = make_ics(events);
    downloadIcsFile('SyllabusRacoon_Full_Calendar.ics', ics);
  };

  return (
    <div className="space-y-7 pb-12">
      {/* 1. SIMPLE & ELEGANT TOP BAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            <CalendarCheck2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Monday, November 2, 2026 · Week 10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-slate-900 tracking-tight">
            Academic Study Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {courses.length} courses tracked · {totalDeliverablesCount - completedDeliverablesCount} upcoming deadlines · {todayBlocks.length} focus sessions scheduled for today.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateTab('focus')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5 text-amber-300" />
            <span>Launch Focus Sprint</span>
          </button>

          <button
            onClick={handleExportAllCalendar}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full shadow-2xs transition-colors cursor-pointer"
            title="Export .ics calendar"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export .ics</span>
          </button>
        </div>
      </div>

      {/* 2. CENTERPIECE: CLEARLY HIGHLIGHTED TODAY'S TASKS */}
      <section
        aria-label="Today's Tasks"
        className="relative overflow-hidden rounded-3xl border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/30 p-5 sm:p-7 shadow-sm transition-all"
      >
        {/* Decorative subtle background tint glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Strip with Date, Completion Ticker, and Quick Actions */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-4 mb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                Today's Focus
              </span>
              <span className="text-xs font-mono font-medium text-slate-600">
                Mon, Nov 02, 2026
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Today's Tasks & Study Schedule</span>
              <span className="text-sm font-normal text-slate-500 font-mono">
                ({completedTodayCount}/{totalTodayTasks} done)
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 border border-indigo-200 text-indigo-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingTask ? 'Cancel' : 'Add Task for Today'}</span>
            </button>

            {upcomingBlocksFuture.length > 0 && todayBlocks.length < 3 && (
              <button
                onClick={handlePullNextSessionToToday}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 transition-colors cursor-pointer"
                title="Pull next scheduled study session into today"
              >
                <span>Pull next session</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar for Today */}
        {totalTodayTasks > 0 && (
          <div className="relative z-10 mb-5">
            <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-1.5">
              <span>Today's Completion Pace</span>
              <span className="font-bold text-indigo-700">{todayPercent}%</span>
            </div>
            <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Inline Add Task Form */}
        {isAddingTask && (
          <form
            onSubmit={handleCreateTodayTask}
            className="relative z-10 mb-5 p-4 bg-white rounded-2xl border border-indigo-200 shadow-xs space-y-3"
          >
            <div className="text-xs font-bold text-slate-900">Add a Focus Session for Today</div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  placeholder="Task title (e.g. Chapter 4 Practice Problems)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={newTaskCourseId}
                  onChange={(e) => setNewTaskCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <input
                  type="time"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
                <select
                  value={newTaskDuration}
                  onChange={(e) => setNewTaskDuration(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="1">1.0h</option>
                  <option value="1.5">1.5h</option>
                  <option value="2">2.0h</option>
                  <option value="2.5">2.5h</option>
                </select>
              </div>

              <div className="sm:col-span-12">
                <input
                  type="text"
                  placeholder="Specific objective (e.g. Solve 5 dynamic programming recursion problems)"
                  value={newTaskObjective}
                  onChange={(e) => setNewTaskObjective(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </form>
        )}

        {/* Any Deliverables Due Today */}
        {todayDeliverables.length > 0 && (
          <div className="relative z-10 space-y-2 mb-4">
            {todayDeliverables.map((del) => (
              <div
                key={del.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  del.isCompleted
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => onToggleDeliverable && onToggleDeliverable(del.id, del.courseId)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer shrink-0"
                    title={del.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                  >
                    {del.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-rose-400 hover:text-rose-600" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-rose-600 text-white">
                        Due Today
                      </span>
                      <span className="font-bold text-xs">{del.courseCode}</span>
                      <span className="text-slate-400">·</span>
                      <span className={`text-sm font-semibold truncate ${del.isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {del.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {del.weightPercent}% of final grade · {del.description || 'Milestone submission'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectCourse(del.courseId);
                    onNavigateTab('deliverables');
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700 shrink-0 cursor-pointer"
                >
                  Details
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Study Blocks Scheduled for Today */}
        {todayBlocks.length === 0 && todayDeliverables.length === 0 ? (
          <div className="relative z-10 text-center py-10 px-4 bg-white/80 rounded-2xl border border-dashed border-indigo-200 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">No tasks scheduled for today!</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-0.5">
                You're all caught up for today. You can add a quick study session or pull forward tomorrow's next planned session.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-1">
              <button
                onClick={() => setIsAddingTask(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
              >
                + Schedule Session for Today
              </button>
              {nextSession && (
                <button
                  onClick={handlePullNextSessionToToday}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-full cursor-pointer"
                >
                  Pull Next Session ({nextSession.courseCode})
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative z-10 space-y-3">
            {todayBlocks.map((block) => {
              const googleCalUrl = createGoogleCalendarUrl({
                title: `[Study] ${block.courseCode}: ${block.title}`,
                description: `Objective: ${block.objective}\nCourse: ${block.courseName}`,
                dateStr: block.date,
                timeStr: block.startTime,
                durationHours: block.durationHours,
              });

              return (
                <div
                  key={block.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    block.isCompleted
                      ? 'bg-slate-100/70 border-slate-200 text-slate-500 opacity-80'
                      : 'bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-indigo-300 shadow-2xs'
                  }`}
                >
                  {/* Left: Checkbox + Course Info + Objective */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => onToggleBlock(block)}
                      className="mt-0.5 transition-colors cursor-pointer shrink-0"
                      title={block.isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {block.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-2xs"
                          style={{ backgroundColor: block.courseColor }}
                        >
                          {block.courseCode}
                        </span>

                        <span className="text-xs font-mono font-medium text-slate-500">
                          {block.startTime} · {block.durationHours}h
                        </span>

                        <span className="text-slate-300">·</span>

                        <h3
                          className={`text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors ${
                            block.isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {block.title}
                        </h3>
                      </div>

                      {block.objective && (
                        <p className={`text-xs text-slate-600 line-clamp-2 ${block.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          🎯 {block.objective}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Quick Action Controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onNavigateTab('focus')}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                      title="Launch Pomodoro timer for this session"
                    >
                      <Timer className="w-3.5 h-3.5 text-amber-300" />
                      <span>Start Timer</span>
                    </button>

                    <a
                      href={googleCalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-xs font-medium transition-colors cursor-pointer"
                      title="Add to Google Calendar"
                    >
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                      <span>Cal</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Encouraging completion banner if all are done */}
        {totalTodayTasks > 0 && completedTodayCount === totalTodayTasks && (
          <div className="relative z-10 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs">
            <span className="text-lg">🎉</span>
            <div>
              <strong className="font-semibold">All today's tasks completed!</strong> You crushed your focus plan. Bandit in the bottom right is celebrating!
            </div>
          </div>
        )}
      </section>

      {/* 3. THE PIE CHARTS: WORKLOAD & COMPLETION PROGRESS */}
      <section aria-label="Workload Analytics & Pie Charts" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Workload & Progress Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Semester deliverable milestones and study hour distributions
            </p>
          </div>

          <button
            onClick={onOpenRescheduleModal}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-200 transition-colors"
          >
            <span>Sick day? Rebalance schedule</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 3-Card Analytics Grid featuring Authentic SVG Pie & Donut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pie Chart 1: Course Workload Share */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
              <span>Course Workload Share</span>
              <span className="text-[11px] font-mono text-slate-400">Hours</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <MultiSlicePieChart slices={courseWorkloadSlices} size={110} />

              <div className="space-y-2 min-w-0 flex-1">
                {courseWorkloadSlices.map((slice, idx) => {
                  const pct = totalHoursPlanned > 0 ? Math.round((slice.value / totalHoursPlanned) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: slice.color }}
                        />
                        <span className="font-semibold text-slate-800 truncate">{slice.courseCode}</span>
                      </div>
                      <span className="font-mono text-slate-500 tabular-nums text-[11px] shrink-0">
                        {slice.value.toFixed(0)}h ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Proportional distribution of planned study blocks across active courses.
            </p>
          </div>

          {/* Pie Chart 2: Term Milestones Completed */}
          <div
            onClick={() => onNavigateTab('deliverables')}
            className="bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
              <span>Term Milestones</span>
              <span className="text-[11px] font-mono text-indigo-600 group-hover:underline">
                View All →
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <DonutChart
                percentage={deliverablesPercent}
                size={110}
                strokeWidth={11}
                strokeColor="#4f46e5"
                bgColor="#e0e7ff"
                centerPrimaryText={`${deliverablesPercent}%`}
                centerSubText="Milestones"
              />

              <div className="space-y-2 min-w-0 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    Completed
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {completedDeliverablesCount}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    Upcoming
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {totalDeliverablesCount - completedDeliverablesCount}
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                  Total {totalDeliverablesCount} graded items
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Includes exams, problem sets, and lab writeups extracted from syllabi.
            </p>
          </div>

          {/* Pie Chart 3: Study Hours Fulfilled */}
          <div
            onClick={() => onNavigateTab('timeline')}
            className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4 cursor-pointer group"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-b border-slate-100 pb-2.5">
              <span>Study Hours Fulfilled</span>
              <span className="text-[11px] font-mono text-emerald-600 group-hover:underline">
                Calendar →
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <DonutChart
                percentage={hoursPercent}
                size={110}
                strokeWidth={11}
                strokeColor="#10b981"
                bgColor="#d1fae5"
                centerPrimaryText={`${hoursPercent}%`}
                centerSubText="Completed"
              />

              <div className="space-y-2 min-w-0 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Logged
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {totalHoursDone.toFixed(1)}h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    Remaining
                  </span>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">
                    {(totalHoursPlanned - totalHoursDone).toFixed(1)}h
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-100 text-[11px] font-mono text-slate-500">
                  Total {totalHoursPlanned.toFixed(0)}h scheduled
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Adaptive pacing prevents marathon cram sessions before deadlines.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ACTIVE COURSES: SIMPLE & FOCUSED OVERVIEW */}
      <section aria-label="Enrolled Courses" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Active Courses ({courses.length})
            </h2>
          </div>

          <button
            onClick={() => onNavigateTab('syllabus')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>+ Ingest Syllabus</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((course) => {
            const courseDeliverables = course.deliverables;
            const completed = courseDeliverables.filter((d) => d.isCompleted).length;
            const nextItem = courseDeliverables.find((d) => !d.isCompleted);
            const progressPct = courseDeliverables.length
              ? Math.round((completed / courseDeliverables.length) * 100)
              : 0;

            return (
              <div
                key={course.id}
                className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden space-y-3"
              >
                {/* Course color top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: course.color }}
                />

                <div className="flex items-start justify-between gap-3 pt-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900">{course.code}</span>
                      <span className="text-xs text-slate-400 font-mono">{course.term}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{course.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{course.instructor}</p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700">
                    {progressPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: course.color,
                    }}
                  />
                </div>

                {/* Next Milestone preview */}
                {nextItem && (
                  <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate">
                      Next: {nextItem.title}
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] shrink-0 ml-2">
                      {nextItem.dueDate} ({nextItem.weightPercent}%)
                    </span>
                  </div>
                )}

                {/* Action links */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {course.studyBlocks.length} planned blocks
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onSelectCourse(course.id);
                        onNavigateTab('deliverables');
                      }}
                      className="font-medium text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Deadlines</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectCourse(course.id);
                        onNavigateTab('timeline');
                      }}
                      className="font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Plan</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
