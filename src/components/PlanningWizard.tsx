/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, StudyPreferences } from '../types';
import { generateStudyPlanForCourse } from '../utils/planner';
import {
  ArrowRight,
  Sun,
  Sunset,
  Moon,
} from 'lucide-react';

interface PlanningWizardProps {
  course: Course;
  onUpdateCourse: (updated: Course) => void;
  onPlanGenerated: () => void;
}

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const PlanningWizard: React.FC<PlanningWizardProps> = ({
  course,
  onUpdateCourse,
  onPlanGenerated,
}) => {
  const [weeklyHours, setWeeklyHours] = useState(course.preferences?.weeklyHours || 6);
  const [preferredDays, setPreferredDays] = useState<string[]>(
    course.preferences?.preferredDays || ['Mon', 'Wed', 'Sat']
  );
  const [studyTimeOfDay, setStudyTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>(
    course.preferences?.studyTimeOfDay || 'evening'
  );
  const [bufferDays, setBufferDays] = useState(course.preferences?.bufferDaysBeforeExam || 10);
  const [targetIntensity, setTargetIntensity] = useState<'balanced' | 'rigorous' | 'light'>(
    course.preferences?.targetIntensity || 'balanced'
  );

  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      if (preferredDays.length > 1) {
        setPreferredDays(preferredDays.filter((d) => d !== day));
      }
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };

  const handleGeneratePlan = () => {
    const preferences: StudyPreferences = {
      weeklyHours,
      preferredDays,
      studyTimeOfDay,
      bufferDaysBeforeExam: bufferDays,
      targetIntensity,
    };

    const newBlocks = generateStudyPlanForCourse(course, preferences);

    const updatedCourse: Course = {
      ...course,
      preferences,
      studyBlocks: newBlocks,
    };

    onUpdateCourse(updatedCourse);
    onPlanGenerated();
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Editorial Header */}
      <div className="space-y-2">
        <div className="text-[14px] text-[#979799]">
          Adaptive Planning Strategy
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#17191c] tracking-[-0.66px]">
          Configure your study roadmap for <em className="italic font-normal">{course.code}</em>
        </h1>
        <p className="text-[17px] text-[#777b86]">
          Answer 3 quick questions about your schedule. The agent distributes study sessions evenly before each deadline.
        </p>
      </div>

      {/* 3 Questions Container using Steep Neutral Cards (#f2f2f3, 24px radius, no shadow) */}
      <div className="space-y-6">
        {/* Question 1: Hours per week */}
        <div className="bg-[#f2f2f3] rounded-[24px] p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
                Question 01
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#17191c] mt-1">
                How many hours a week can you commit to {course.code}?
              </h2>
              <p className="text-[14px] text-[#777b86] mt-1">
                Study sessions are placed on your preferred days to prevent cramming.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-serif text-4xl font-normal text-[#17191c] tabular-nums">
                {weeklyHours}
              </span>
              <span className="text-[14px] text-[#777b86] ml-1.5">hrs/wk</span>
            </div>
          </div>

          <input
            type="range"
            min="2"
            max="16"
            step="1"
            value={weeklyHours}
            onChange={(e) => setWeeklyHours(Number(e.target.value))}
            className="w-full accent-[#17191c] cursor-pointer"
          />

          {/* Steep Preset Pill Buttons */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-[13px] text-[#777b86] mr-2">Presets:</span>
            {[
              { label: 'Light (4h)', val: 4 },
              { label: 'Balanced (6h)', val: 6 },
              { label: 'Intensive (8h)', val: 8 },
              { label: 'Deep Focus (12h)', val: 12 },
            ].map((p) => (
              <button
                key={p.val}
                onClick={() => setWeeklyHours(p.val)}
                className={`px-4 py-1.5 text-[14px] rounded-full transition-all cursor-pointer ${
                  weeklyHours === p.val
                    ? 'bg-[#17191c] text-white'
                    : 'bg-white text-[#17191c] hover:bg-[#e8e8ea]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2: Preferred Days and Time */}
        <div className="bg-[#f2f2f3] rounded-[24px] p-8 space-y-6">
          <div>
            <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
              Question 02
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#17191c] mt-1">
              Which days and times fit your study routine best?
            </h2>
            <p className="text-[14px] text-[#777b86] mt-1">
              Select your available study days. Sessions will automatically align to these slots.
            </p>
          </div>

          {/* Day Selector Pill Buttons */}
          <div>
            <label className="text-[14px] font-medium text-[#17191c] block mb-3">
              Preferred Study Days ({preferredDays.length} selected):
            </label>
            <div className="grid grid-cols-7 gap-2">
              {ALL_DAYS.map((day) => {
                const isSelected = preferredDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-1 text-[14px] rounded-full text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#17191c] text-white shadow-xs'
                        : 'bg-white text-[#17191c] hover:bg-[#e8e8ea]'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time of Day Floating White Cards */}
          <div>
            <label className="text-[14px] font-medium text-[#17191c] block mb-3">
              Preferred Study Window:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'morning', label: 'Mornings (9:00 AM)', icon: Sun, desc: 'Early deep work' },
                { id: 'afternoon', label: 'Afternoons (2:00 PM)', icon: Sunset, desc: 'Post-lecture focus' },
                { id: 'evening', label: 'Evenings (7:00 PM)', icon: Moon, desc: 'Quiet library hours' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = studyTimeOfDay === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setStudyTimeOfDay(t.id as any)}
                    className={`text-left p-4 rounded-[16px] transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-[#17191c] shadow-artifact'
                        : 'bg-white/60 text-[#777b86] hover:bg-white hover:text-[#17191c]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-[#17191c]" />
                      <span className="font-medium text-[15px] text-[#17191c]">{t.label}</span>
                    </div>
                    <p className="text-[13px] text-[#777b86]">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Question 3: Buffer Runway */}
        <div className="bg-[#f2f2f3] rounded-[24px] p-8 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
                Question 03
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#17191c] mt-1">
                How many days before major exams should prep begin?
              </h2>
              <p className="text-[14px] text-[#777b86] mt-1">
                Progressive milestones (flashcards, mock exams, review) begin inside this window.
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-serif text-4xl font-normal text-[#17191c] tabular-nums">
                {bufferDays}
              </span>
              <span className="text-[14px] text-[#777b86] ml-1.5">days</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 7, title: '7 Days Before', desc: 'Short sprint for weekly essays' },
              { val: 10, title: '10 Days Before', desc: 'Ideal for major midterms' },
              { val: 14, title: '14 Days Before', desc: 'Extended multi-stage final review' },
            ].map((b) => (
              <button
                key={b.val}
                onClick={() => setBufferDays(b.val)}
                className={`text-left p-4 rounded-[16px] transition-all cursor-pointer ${
                  bufferDays === b.val
                    ? 'bg-white text-[#17191c] shadow-artifact'
                    : 'bg-white/60 text-[#777b86] hover:bg-white hover:text-[#17191c]'
                }`}
              >
                <span className="font-medium text-[15px] text-[#17191c] block mb-0.5">
                  {b.title}
                </span>
                <span className="text-[13px] text-[#777b86]">{b.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Generation Summary & Steep Pill Button CTA */}
      <div className="p-8 bg-white rounded-[24px] shadow-artifact flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-[17px] font-medium text-[#17191c]">
            Ready to generate schedule
          </h3>
          <p className="text-[14px] text-[#777b86]">
            {course.deliverables.length} milestones · {weeklyHours}h/week · {preferredDays.join(', ')} · {bufferDays}-day runway
          </p>
        </div>

        <button
          onClick={handleGeneratePlan}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-[#17191c] hover:bg-[#2c3035] text-white text-[15px] font-normal rounded-full transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Generate study roadmap</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
