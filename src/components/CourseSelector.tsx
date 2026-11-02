/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course } from '../types';
import { Plus, Trash2, BookOpen } from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  activeCourseId: string;
  onSelectCourse: (id: string) => void;
  onAddNewCourse: () => void;
  onDeleteCourse: (id: string) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  onAddNewCourse,
  onDeleteCourse,
}) => {
  return (
    <div className="bg-white/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-12 py-2.5">
      <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-4 overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-mono mr-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Courses:</span>
          </div>

          {courses.map((c) => {
            const isActive = c.id === activeCourseId;
            const completedCount = c.deliverables.filter((d) => d.isCompleted).length;
            const totalCount = c.deliverables.length;

            return (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => onSelectCourse(c.id)}
              >
                {/* Visual course indicator dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: c.color }}
                  aria-hidden="true"
                />

                <span>{c.code}</span>

                <span
                  className={`text-[11px] tabular-nums font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {completedCount}/{totalCount}
                </span>

                {courses.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove course ${c.code}? This will remove its study schedule.`)) {
                        onDeleteCourse(c.id);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 p-0.5 transition-opacity ml-0.5 cursor-pointer rounded-full ${
                      isActive ? 'hover:bg-white/20 text-rose-300' : 'hover:bg-rose-100 text-rose-600'
                    }`}
                    title={`Delete ${c.code}`}
                    aria-label={`Delete ${c.code}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* Add Course Quick Button */}
          <button
            onClick={onAddNewCourse}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Course</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 shrink-0 font-mono">
          <span>Term: Fall 2026</span>
        </div>
      </div>
    </div>
  );
};
