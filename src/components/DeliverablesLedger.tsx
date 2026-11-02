/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Deliverable, DeliverableType } from '../types';
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Percent,
  CheckSquare,
  Sparkles,
  FileText,
  Filter,
  Layers,
  GraduationCap,
  Clock,
  Edit2,
  Check,
  X,
} from 'lucide-react';

interface DeliverablesLedgerProps {
  course: Course;
  onUpdateDeliverables: (deliverables: Deliverable[]) => void;
  onProceedToPlanning: () => void;
}

const DELIVERABLE_TYPE_META: Record<
  DeliverableType,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  exam: { label: 'Exam', icon: '🎯', color: '#e11d48', bg: 'bg-rose-50 text-rose-700', border: 'border-rose-200' },
  midterm: { label: 'Midterm', icon: '📝', color: '#e11d48', bg: 'bg-rose-50 text-rose-700', border: 'border-rose-200' },
  final: { label: 'Final Exam', icon: '🎓', color: '#be123c', bg: 'bg-rose-100 text-rose-800', border: 'border-rose-300' },
  essay: { label: 'Essay / Paper', icon: '📄', color: '#6366f1', bg: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' },
  project: { label: 'Project', icon: '💻', color: '#2563eb', bg: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
  homework: { label: 'Problem Set', icon: '📚', color: '#059669', bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
  quiz: { label: 'Quiz', icon: '⚡', color: '#d97706', bg: 'bg-amber-50 text-amber-800', border: 'border-amber-200' },
  lab: { label: 'Lab Report', icon: '🧪', color: '#0d9488', bg: 'bg-teal-50 text-teal-700', border: 'border-teal-200' },
  presentation: { label: 'Presentation', icon: '🎤', color: '#7c3aed', bg: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
  other: { label: 'Assignment', icon: '📌', color: '#475569', bg: 'bg-slate-50 text-slate-700', border: 'border-slate-200' },
};

export const DeliverablesLedger: React.FC<DeliverablesLedgerProps> = ({
  course,
  onUpdateDeliverables,
  onProceedToPlanning,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [newItem, setNewItem] = useState<Partial<Deliverable>>({
    title: '',
    type: 'homework',
    dueDate: '2026-11-20',
    weightPercent: 15,
    description: '',
  });
  const [showAddRow, setShowAddRow] = useState(false);

  const deliverables = course.deliverables;
  const totalWeight = deliverables.reduce((sum, d) => sum + (Number(d.weightPercent) || 0), 0);
  const completedCount = deliverables.filter((d) => d.isCompleted).length;

  const handleToggleComplete = (id: string) => {
    const updated = deliverables.map((d) =>
      d.id === id ? { ...d, isCompleted: !d.isCompleted } : d
    );
    onUpdateDeliverables(updated);
  };

  const handleDelete = (id: string) => {
    const updated = deliverables.filter((d) => d.id !== id);
    onUpdateDeliverables(updated);
  };

  const handleUpdateItem = (id: string, updates: Partial<Deliverable>) => {
    const updated = deliverables.map((d) => (d.id === id ? { ...d, ...updates } : d));
    onUpdateDeliverables(updated);
  };

  const handleAddNewDeliverable = () => {
    if (!newItem.title?.trim()) return;

    const created: Deliverable = {
      id: `deliv-${Date.now().toString(36)}`,
      title: newItem.title.trim(),
      type: (newItem.type as DeliverableType) || 'homework',
      dueDate: newItem.dueDate || '2026-11-20',
      weightPercent: Number(newItem.weightPercent) || 10,
      description: newItem.description || '',
      isCompleted: false,
    };

    onUpdateDeliverables([...deliverables, created]);
    setNewItem({
      title: '',
      type: 'homework',
      dueDate: '2026-11-20',
      weightPercent: 15,
      description: '',
    });
    setShowAddRow(false);
  };

  // Filtered deliverables
  const filteredDeliverables =
    activeCategoryFilter === 'all'
      ? deliverables
      : deliverables.filter((d) => d.type === activeCategoryFilter);

  // Group weights by category for visual distribution bar
  const weightsByCategory: Record<string, number> = {};
  deliverables.forEach((d) => {
    const type = d.type || 'other';
    weightsByCategory[type] = (weightsByCategory[type] || 0) + Number(d.weightPercent || 0);
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Navigation Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-slate-500">
            <span
              className="w-2.5 h-2.5 rounded-full shadow-xs"
              style={{ backgroundColor: course.color }}
            />
            <span className="font-bold text-slate-900">{course.code}</span>
            <span>·</span>
            <span>{course.term}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-normal text-slate-900 tracking-tight">
            Deadlines & <em className="italic text-indigo-600 font-normal">Grades</em>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            Audit weights, track upcoming submissions, and ensure 100% grade coverage.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowAddRow(!showAddRow)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Add Item</span>
          </button>

          <button
            onClick={onProceedToPlanning}
            className="flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-full transition-all cursor-pointer shadow-xs"
          >
            <span>Next: Plan Study Schedule</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Grade Weight Breakdown Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Visual Grade Weight Distribution
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {totalWeight}% accounted for · {totalWeight === 100 ? '✅ Balanced 100%' : `${100 - totalWeight}% unaccounted`}
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {completedCount} of {deliverables.length} submitted
          </div>
        </div>

        {/* Multi-Colored Segmented Bar */}
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {Object.entries(weightsByCategory).map(([cat, weight]) => {
            const meta = DELIVERABLE_TYPE_META[cat as DeliverableType] || DELIVERABLE_TYPE_META.other;
            const pct = Math.min(100, (weight / Math.max(100, totalWeight)) * 100);

            return (
              <div
                key={cat}
                style={{ width: `${pct}%`, backgroundColor: meta.color }}
                className="h-full transition-all duration-500 hover:opacity-85 cursor-pointer relative group"
                title={`${meta.label}: ${weight}%`}
              />
            );
          })}
        </div>

        {/* Legend Chips with Icons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {Object.entries(weightsByCategory).map(([cat, weight]) => {
            const meta = DELIVERABLE_TYPE_META[cat as DeliverableType] || DELIVERABLE_TYPE_META.other;
            return (
              <div
                key={cat}
                className="flex items-center gap-1.5 text-xs text-slate-700 font-medium"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <span>{meta.label}:</span>
                <span className="font-mono font-bold text-slate-900">{weight}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs by Category */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            activeCategoryFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items ({deliverables.length})
        </button>

        {Object.entries(weightsByCategory).map(([cat, weight]) => {
          const meta = DELIVERABLE_TYPE_META[cat as DeliverableType] || DELIVERABLE_TYPE_META.other;
          const isSelected = activeCategoryFilter === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="font-mono text-[11px] opacity-80">({weight}%)</span>
            </button>
          );
        })}
      </div>

      {/* Deliverables Interactive Cards Table Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs">
                <th className="py-3.5 px-5 w-12 text-center">Status</th>
                <th className="py-3.5 px-5 font-semibold">Deliverable & Notes</th>
                <th className="py-3.5 px-5 font-semibold w-36">Category</th>
                <th className="py-3.5 px-5 font-semibold w-40">Due Date</th>
                <th className="py-3.5 px-5 font-semibold w-28 text-right">Weight</th>
                <th className="py-3.5 px-5 w-24 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeliverables.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No deliverables match this filter.
                  </td>
                </tr>
              ) : (
                filteredDeliverables.map((item) => {
                  const isEditing = editingId === item.id;
                  const meta = DELIVERABLE_TYPE_META[item.type] || DELIVERABLE_TYPE_META.other;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        item.isCompleted ? 'bg-slate-50/40 text-slate-400' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleToggleComplete(item.id)}
                          className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                          title={item.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                        >
                          {item.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Title & Description */}
                      <td className="py-4 px-5">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium"
                            />
                            <input
                              type="text"
                              value={item.description || ''}
                              onChange={(e) =>
                                handleUpdateItem(item.id, { description: e.target.value })
                              }
                              placeholder="Notes / topics"
                              className="w-full px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600"
                            />
                          </div>
                        ) : (
                          <div>
                            <span
                              className={`text-sm font-semibold text-slate-900 ${
                                item.isCompleted ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {item.title}
                            </span>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                            {item.topics && item.topics.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400 font-mono">
                                <span>{item.topics.join(' · ')}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5">
                        {isEditing ? (
                          <select
                            value={item.type}
                            onChange={(e) =>
                              handleUpdateItem(item.id, {
                                type: e.target.value as DeliverableType,
                              })
                            }
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded-xl text-xs"
                          >
                            {Object.entries(DELIVERABLE_TYPE_META).map(([k, v]) => (
                              <option key={k} value={k}>
                                {v.icon} {v.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.bg} ${meta.border}`}
                          >
                            <span>{meta.icon}</span>
                            <span>{meta.label}</span>
                          </span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-5 font-mono text-xs tabular-nums text-slate-800">
                        {isEditing ? (
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) => handleUpdateItem(item.id, { dueDate: e.target.value })}
                            className="px-2 py-1 bg-white border border-slate-300 rounded-xl text-xs"
                          />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.dueDate}</span>
                          </div>
                        )}
                      </td>

                      {/* Weight */}
                      <td className="py-4 px-5 text-right font-mono text-sm tabular-nums font-bold text-slate-900">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.weightPercent}
                              onChange={(e) =>
                                handleUpdateItem(item.id, {
                                  weightPercent: Number(e.target.value),
                                })
                              }
                              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-xl text-right text-xs"
                            />
                            <span>%</span>
                          </div>
                        ) : (
                          <span>{item.weightPercent}%</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingId(isEditing ? null : item.id)}
                            className="p-1 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            title={isEditing ? 'Save' : 'Edit'}
                          >
                            {isEditing ? <Check className="w-4 h-4 text-emerald-600" /> : <Edit2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Inline Add Row */}
              {showAddRow && (
                <tr className="bg-indigo-50/40">
                  <td className="py-4 px-5 text-center text-indigo-500 font-bold">+</td>
                  <td className="py-4 px-5">
                    <input
                      type="text"
                      placeholder="e.g. Midterm 2 / Lab Report 3"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                    />
                  </td>
                  <td className="py-4 px-5">
                    <select
                      value={newItem.type}
                      onChange={(e) =>
                        setNewItem({ ...newItem, type: e.target.value as DeliverableType })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs"
                    >
                      {Object.entries(DELIVERABLE_TYPE_META).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v.icon} {v.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4 px-5">
                    <input
                      type="date"
                      value={newItem.dueDate}
                      onChange={(e) => setNewItem({ ...newItem, dueDate: e.target.value })}
                      className="px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                    />
                  </td>
                  <td className="py-4 px-5 text-right">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newItem.weightPercent}
                      onChange={(e) =>
                        setNewItem({ ...newItem, weightPercent: Number(e.target.value) })
                      }
                      className="w-16 px-2 py-1.5 bg-white border border-slate-300 rounded-xl text-right font-mono text-xs"
                    />
                    <span className="ml-1 font-mono text-xs">%</span>
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={handleAddNewDeliverable}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-full shadow-xs cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowAddRow(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
