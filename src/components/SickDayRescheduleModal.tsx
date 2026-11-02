/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course } from '../types';
import { rebalanceScheduleForMissedDays } from '../utils/planner';
import { RefreshCw, X, CheckCircle2 } from 'lucide-react';

interface SickDayRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  onUpdateAllCourses: (courses: Course[]) => void;
}

export const SickDayRescheduleModal: React.FC<SickDayRescheduleModalProps> = ({
  isOpen,
  onClose,
  courses,
  onUpdateAllCourses,
}) => {
  const [startDate, setStartDate] = useState('2026-11-04');
  const [endDate, setEndDate] = useState('2026-11-06');
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (days: number) => {
    const today = new Date('2026-11-02');
    const start = new Date(today);
    start.setDate(today.getDate() + 2);

    const end = new Date(start);
    end.setDate(start.getDate() + (days - 1));

    const toStr = (d: Date) => d.toISOString().split('T')[0];
    setStartDate(toStr(start));
    setEndDate(toStr(end));
    setResultMessage(null);
  };

  const handleRebalance = () => {
    const result = rebalanceScheduleForMissedDays(courses, startDate, endDate);
    onUpdateAllCourses(result.updatedCourses);
    setResultMessage(result.message);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-8 shadow-artifact space-y-6 animate-in fade-in zoom-in-95 duration-150 border border-[#ececec]">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
              Adaptive Rebalancing
            </div>
            <h2 className="text-2xl font-serif font-normal text-[#17191c]">
              Reschedule for illness or delay
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#979799] hover:text-[#17191c] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[15px] text-[#777b86] leading-[1.5]">
          When illness or unexpected events interrupt your week, the agent recalibrates and shifts uncompleted prep blocks forward into upcoming open study days — without changing actual exam deadlines.
        </p>

        {/* Quick Presets (Steep Pill Buttons) */}
        <div className="space-y-2">
          <label className="text-[14px] font-medium text-[#17191c]">Quick Presets:</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Sick 2 Days', days: 2 },
              { label: 'Sick 3 Days', days: 3 },
              { label: 'Sick 5 Days', days: 5 },
            ].map((p) => (
              <button
                key={p.days}
                onClick={() => handleApplyPreset(p.days)}
                className="px-4 py-2 bg-[#f2f2f3] hover:bg-[#e8e8ea] text-[14px] text-[#17191c] rounded-full text-center transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Inputs (Steep 16px Radius Inputs) */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-[13px] text-[#777b86] block mb-1.5">
              Missed Window Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setResultMessage(null);
              }}
              className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] font-mono text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
            />
          </div>

          <div>
            <label className="text-[13px] text-[#777b86] block mb-1.5">
              Missed Window End
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setResultMessage(null);
              }}
              className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] font-mono text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
            />
          </div>
        </div>

        {/* Result Message (Accent Peach Highlight) */}
        {resultMessage && (
          <div className="p-4 bg-[#fbe1d1] text-[#5d2a1a] text-[14px] rounded-[16px] flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#5d2a1a] mt-0.5 shrink-0" />
            <span className="leading-relaxed">{resultMessage}</span>
          </div>
        )}

        {/* Modal Actions (Pill Buttons) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f2f2f3]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-[15px] text-[#777b86] hover:text-[#17191c] cursor-pointer"
          >
            {resultMessage ? 'Close' : 'Cancel'}
          </button>

          <button
            onClick={handleRebalance}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#17191c] hover:bg-[#2c3035] text-white text-[15px] rounded-full transition-all cursor-pointer font-normal"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rebalance schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
