/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, StudyBlock } from '../types';
import { Play, Pause, RotateCcw, CheckCircle2, Circle } from 'lucide-react';

interface DailyFocusCardProps {
  courses: Course[];
  onToggleBlock: (block: StudyBlock) => void;
}

const STUDY_TIPS = [
  "Spaced repetition beats cramming: 3 sessions of 90 minutes yield 40% higher retention than one 5-hour marathon.",
  "Active recall rule: Close the notes and write down everything you remember about the chapter from memory first.",
  "The Feynman Technique: Explain the concept simply in your own words as if teaching it to an introductory student.",
  "Buffer days are sacred: Keep the 48 hours before an exam for light formula review, not learning new material.",
];

export const DailyFocusCard: React.FC<DailyFocusCardProps> = ({
  courses,
  onToggleBlock,
}) => {
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'break'>('study');
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsRunning(false);
      if (sessionType === 'study') {
        setSessionType('break');
        setTimerSeconds(5 * 60);
      } else {
        setSessionType('study');
        setTimerSeconds(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timerSeconds, sessionType]);

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimerSeconds(sessionType === 'study' ? 25 * 60 : 5 * 60);
  };

  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const allBlocks: StudyBlock[] = [];
  courses.forEach((c) => allBlocks.push(...c.studyBlocks));
  allBlocks.sort((a, b) => a.date.localeCompare(b.date));

  const todayDateStr = '2026-11-02';
  const upcomingBlocks = allBlocks
    .filter((b) => b.date >= todayDateStr && !b.isCompleted)
    .slice(0, 3);

  return (
    <div className="bg-white rounded-[24px] p-6 lg:p-8 shadow-artifact space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f2f2f3] pb-4">
        <div>
          <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
            Focus Sprint
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#17191c]">
            Today's study desk & focus timer
          </h2>
        </div>

        <div className="text-[13px] text-[#979799] font-mono tabular-nums">
          Mon, Nov 02, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left: Pomodoro Timer (Steep Mist Gray card) */}
        <div className="md:col-span-5 bg-[#f2f2f3] rounded-[20px] p-6 flex flex-col items-center justify-center text-center">
          <div className="text-[12px] text-[#777b86] uppercase font-mono tracking-wider mb-1">
            {sessionType === 'study' ? 'Deep Work (25m)' : 'Rest Interval (5m)'}
          </div>

          <div className="text-5xl font-serif font-normal text-[#17191c] tabular-nums my-2 tracking-[-1px]">
            {timeFormatted}
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex items-center gap-2 px-5 py-2 bg-[#17191c] hover:bg-[#2c3035] text-white text-[14px] font-normal rounded-full transition-colors cursor-pointer"
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isRunning ? 'Pause' : 'Start sprint'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="p-2 text-[#777b86] hover:text-[#17191c] transition-colors cursor-pointer"
              title="Reset Timer"
              aria-label="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Upcoming Sessions */}
        <div className="md:col-span-7 space-y-3">
          <div className="text-[14px] font-medium text-[#17191c]">
            Immediate Upcoming Sessions:
          </div>

          {upcomingBlocks.length === 0 ? (
            <p className="text-[14px] text-[#979799] italic">
              All scheduled sessions completed! You are ahead of schedule.
            </p>
          ) : (
            <div className="space-y-2">
              {upcomingBlocks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 p-3 bg-[#fafafb] hover:bg-[#f2f2f3] rounded-[16px] text-[14px] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => onToggleBlock(b)}
                      className="text-[#979799] hover:text-[#17191c] cursor-pointer"
                    >
                      <Circle className="w-4 h-4 text-[#d0d0d4]" />
                    </button>
                    <span className="font-medium text-[#17191c]">{b.courseCode}</span>
                    <span className="text-[#777b86] truncate">{b.title}</span>
                  </div>

                  <span className="text-[13px] font-mono tabular-nums text-[#979799] shrink-0">
                    {b.date.slice(5)} · {b.startTime}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-[#f2f2f3] text-[13px] text-[#777b86] flex items-center justify-between gap-3">
            <span>“{STUDY_TIPS[tipIndex]}”</span>
            <button
              onClick={() => setTipIndex((prev) => (prev + 1) % STUDY_TIPS.length)}
              className="text-[#17191c] hover:underline shrink-0 text-[12px] cursor-pointer"
            >
              Next insight →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
