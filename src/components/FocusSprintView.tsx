/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, StudyBlock } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Sparkles,
  Coffee,
  BookOpen,
  Timer,
  Volume2,
  Check,
} from 'lucide-react';

interface FocusSprintViewProps {
  courses: Course[];
  onToggleBlock: (block: StudyBlock) => void;
  onTimerStateChange?: (isRunning: boolean) => void;
  onSessionComplete?: () => void;
}

const MOTIVATION_TIPS = [
  "Spaced repetition beats cramming: 3 sessions of 90 minutes yield 40% higher retention than one 5-hour marathon.",
  "Active recall: Close your notes and write down everything you remember about the lecture from memory first.",
  "The Feynman Technique: Explain the concept simply in your own words as if teaching it to someone else.",
  "Protect the 48 hours before an exam for light formula review, not learning brand-new material.",
];

export const FocusSprintView: React.FC<FocusSprintViewProps> = ({
  courses,
  onToggleBlock,
  onTimerStateChange,
  onSessionComplete,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [duration, setDuration] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [completedSessionsCount, setCompletedSessionsCount] = useState(2);
  const [customTasks, setCustomTasks] = useState<Array<{ id: string; text: string; done: boolean }>>([
    { id: 'ct-1', text: 'Review lecture notes & highlight key formulas', done: false },
    { id: 'ct-2', text: 'Complete practice problem set questions 1 to 5', done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [tipIndex, setTipIndex] = useState(0);

  // Notify parent of timer state
  useEffect(() => {
    onTimerStateChange?.(isRunning);
  }, [isRunning, onTimerStateChange]);

  // Countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
      onSessionComplete?.();
      setCompletedSessionsCount((c) => c + 1);

      if (mode === 'study') {
        setMode('break');
        setDuration(5 * 60);
        setTimerSeconds(5 * 60);
      } else {
        setMode('study');
        setDuration(25 * 60);
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, mode, onSessionComplete]);

  const selectTimerPreset = (minutes: number, sessionMode: 'study' | 'break') => {
    setIsRunning(false);
    setMode(sessionMode);
    setDuration(minutes * 60);
    setTimerSeconds(minutes * 60);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(duration);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressRatio = (duration - timerSeconds) / duration;
  const progressPercent = Math.max(0, Math.min(100, Math.round(progressRatio * 100)));

  // SVG Circular Ring calculation
  const ringSize = 220;
  const strokeWidth = 10;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timerSeconds / duration) * circumference;

  // Collect scheduled sessions
  const allBlocks: StudyBlock[] = [];
  courses.forEach((c) => allBlocks.push(...c.studyBlocks));
  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  const todayDateStr = '2026-11-02';
  const upcomingBlocks = allBlocks.filter((b) => b.date >= todayDateStr).slice(0, 5);

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setCustomTasks([
      ...customTasks,
      { id: `task-${Date.now()}`, text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  const handleToggleCustomTask = (id: string) => {
    setCustomTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          if (!t.done) onSessionComplete?.();
          return { ...t, done: !t.done };
        }
        return t;
      })
    );
  };

  const handleDeleteCustomTask = (id: string) => {
    setCustomTasks(customTasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header with Visual Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-mono font-medium">
            <Timer className="w-3.5 h-3.5 text-amber-600" />
            <span>Pomodoro Deep Work Desk</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
            Focus <em className="italic text-indigo-600 font-normal">Sprint</em>
          </h1>
          <p className="text-sm text-slate-600">
            Distraction-free focus timer backed by your course syllabus timeline.
          </p>
        </div>

        {/* Streak / Sessions completed pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-xs self-start sm:self-auto">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              Today's Sprints
            </div>
            <div className="text-sm font-bold text-slate-900 font-mono">
              {completedSessionsCount} sessions completed
            </div>
          </div>
        </div>
      </div>

      {/* Main Focus Showcase Card with Visual Circular Ring */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        {/* Soft Background Radial Light */}
        <div
          className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
            isRunning
              ? 'bg-gradient-to-b from-indigo-50/50 via-transparent to-transparent opacity-100'
              : 'opacity-0'
          }`}
        />

        {/* Preset Selector Chips with Icons */}
        <div className="flex items-center justify-center gap-2 flex-wrap relative z-10">
          <button
            onClick={() => selectTimerPreset(25, 'study')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              duration === 25 * 60 && mode === 'study'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>25m Focus</span>
          </button>

          <button
            onClick={() => selectTimerPreset(50, 'study')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              duration === 50 * 60 && mode === 'study'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>50m Deep Work</span>
          </button>

          <button
            onClick={() => selectTimerPreset(5, 'break')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              duration === 5 * 60 && mode === 'break'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>5m Rest</span>
          </button>

          <button
            onClick={() => selectTimerPreset(15, 'break')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer ${
              duration === 15 * 60 && mode === 'break'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>15m Long Break</span>
          </button>
        </div>

        {/* Visual Circular Countdown Ring */}
        <div className="relative flex items-center justify-center my-2 select-none">
          <svg width={ringSize} height={ringSize} className="rotate-[-90deg]">
            {/* Background Ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Active Countdown Ring */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              stroke={mode === 'study' ? (isRunning ? '#4f46e5' : '#6366f1') : '#10b981'}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Centered Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
              {mode === 'study' ? (isRunning ? '● In Focus' : 'Ready') : '☕ Break Time'}
            </span>
            <div className="text-5xl font-mono font-bold text-slate-900 tracking-tight tabular-nums">
              {timeFormatted}
            </div>
            <span className="text-xs text-slate-500 font-mono mt-1">
              {progressPercent}% elapsed
            </span>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-3 pt-1 relative z-10">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-full shadow-md transition-all active:scale-95 cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus Sprint</span>
              </>
            )}
          </button>

          <button
            onClick={handleResetTimer}
            className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors cursor-pointer"
            title="Reset Timer"
            aria-label="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Mascot Mini Voice */}
        <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 flex items-center gap-2 max-w-md">
          <span className="text-base">🦝</span>
          <span className="font-semibold text-slate-800">Bandit:</span>
          <span className="italic truncate">
            {isRunning
              ? 'Stay locked in! No tab switching until the bell rings.'
              : 'Pick a task below and hit Start to begin.'}
          </span>
        </div>
      </div>

      {/* Two Column Grid: Scheduled Syllabus Sessions vs. Sprint Scratchpad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left: Scheduled Course Sessions */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Scheduled Sessions
                </h2>
                <p className="text-xs text-slate-500">
                  Derived from your syllabi
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {upcomingBlocks.filter((b) => b.isCompleted).length}/{upcomingBlocks.length}
            </span>
          </div>

          {upcomingBlocks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No sessions scheduled. Go to Study Plan to generate sessions.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingBlocks.map((b) => (
                <div
                  key={b.id}
                  className={`p-3 rounded-2xl transition-all border flex items-start gap-3 ${
                    b.isCompleted
                      ? 'bg-slate-50 border-slate-200 text-slate-400'
                      : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800 shadow-xs'
                  }`}
                >
                  <button
                    onClick={() => onToggleBlock(b)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                  >
                    {b.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs">{b.courseCode}</span>
                      <span className="text-slate-300">·</span>
                      <span className={`text-xs truncate ${b.isCompleted ? 'line-through text-slate-400' : 'font-medium'}`}>
                        {b.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      {b.date} · {b.startTime} ({b.durationHours}h)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Checklist for This Sprint */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Sprint Tasks
                </h2>
                <p className="text-xs text-slate-500">
                  Immediate checklist for this session
                </p>
              </div>
            </div>
          </div>

          {/* Add quick task form */}
          <form onSubmit={handleAddCustomTask} className="flex gap-2">
            <input
              type="text"
              placeholder="What are you working on right now?..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              Add
            </button>
          </form>

          {/* Custom Tasks List */}
          <div className="space-y-2">
            {customTasks.map((t) => (
              <div
                key={t.id}
                className="group flex items-center justify-between gap-3 p-2.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/60 rounded-xl text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => handleToggleCustomTask(t.id)}
                    className="text-slate-400 hover:text-emerald-600 cursor-pointer shrink-0"
                  >
                    {t.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </button>
                  <span className={`truncate ${t.done ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
                    {t.text}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteCustomTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                  title="Remove task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Study strategy tip */}
          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between gap-3">
            <span className="italic">“{MOTIVATION_TIPS[tipIndex]}”</span>
            <button
              onClick={() => setTipIndex((prev) => (prev + 1) % MOTIVATION_TIPS.length)}
              className="text-indigo-600 hover:underline shrink-0 text-[11px] font-semibold cursor-pointer"
            >
              Next tip →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
