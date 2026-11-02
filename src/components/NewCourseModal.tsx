/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course } from '../types';
import { X, BookPlus } from 'lucide-react';

interface NewCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (newCourse: Course) => void;
}

const PRESET_COLORS = [
  '#17191c', // Ink Black
  '#5d2a1a', // Sienna Brown
  '#059669', // Emerald
  '#0284C7', // Cerulean
  '#7C3AED', // Violet
  '#777b86', // Slate Gray
];

export const NewCourseModal: React.FC<NewCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [instructor, setInstructor] = useState('');
  const [term, setTerm] = useState('Fall 2026');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now().toString(36)}`,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      instructor: instructor.trim() || 'Instructor',
      term: term.trim() || 'Fall 2026',
      color,
      createdAt: new Date().toISOString(),
      deliverables: [],
      studyBlocks: [],
      preferences: {
        weeklyHours: 6,
        preferredDays: ['Mon', 'Wed', 'Fri'],
        studyTimeOfDay: 'evening',
        bufferDaysBeforeExam: 10,
        targetIntensity: 'balanced',
      },
    };

    onAddCourse(newCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full p-8 shadow-artifact space-y-6 animate-in fade-in zoom-in-95 duration-150 border border-[#ececec]">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-[13px] text-[#979799] uppercase tracking-wider font-mono">
              Course Setup
            </div>
            <h2 className="text-2xl font-serif font-normal text-[#17191c]">
              Add new course
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#979799] hover:text-[#17191c] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[13px] text-[#777b86] block mb-1.5">
              Course Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. MATH 240, PSYC 101"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[13px] text-[#777b86] block mb-1.5">
              Course Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multivariable Calculus & Linear Algebra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] text-[#777b86] block mb-1.5">
                Instructor
              </label>
              <input
                type="text"
                placeholder="Dr. Smith"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
              />
            </div>
            <div>
              <label className="text-[13px] text-[#777b86] block mb-1.5">
                Semester
              </label>
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full p-3 bg-[#f2f2f3] rounded-[16px] text-[14px] text-[#17191c] border-none focus:outline-hidden focus:ring-1 focus:ring-[#17191c]"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] text-[#777b86] block mb-2">
              Color Tag:
            </label>
            <div className="flex items-center gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#17191c] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f2f2f3]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-[15px] text-[#777b86] hover:text-[#17191c] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#17191c] hover:bg-[#2c3035] text-white text-[15px] font-normal rounded-full transition-all cursor-pointer"
            >
              Create Course
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
