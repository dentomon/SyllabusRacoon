/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DeliverableType =
  | 'exam'
  | 'midterm'
  | 'final'
  | 'quiz'
  | 'essay'
  | 'project'
  | 'homework'
  | 'lab'
  | 'presentation'
  | 'other';

export interface Deliverable {
  id: string;
  title: string;
  type: DeliverableType;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  weightPercent: number; // e.g. 25 for 25%
  description?: string;
  topics?: string[];
  isCompleted?: boolean;
}

export interface StudyPreferences {
  weeklyHours: number; // e.g. 6
  preferredDays: string[]; // ['Mon', 'Wed', 'Fri', 'Sat']
  studyTimeOfDay: 'morning' | 'afternoon' | 'evening';
  bufferDaysBeforeExam: number; // e.g. 10
  targetIntensity: 'balanced' | 'rigorous' | 'light';
}

export interface StudyBlock {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  courseColor: string;
  deliverableId?: string;
  deliverableTitle?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationHours: number;
  objective: string;
  isCompleted: boolean;
  wasRescheduled?: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  instructor?: string;
  term?: string;
  color: string;
  syllabusRawText?: string;
  syllabusFileName?: string;
  deliverables: Deliverable[];
  preferences: StudyPreferences;
  studyBlocks: StudyBlock[];
  createdAt: string;
}

export interface WorkloadWeek {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalStudyHours: number;
  deliverablesDue: Array<{
    courseCode: string;
    courseColor: string;
    title: string;
    type: DeliverableType;
    dueDate: string;
    weightPercent: number;
  }>;
  intensityScore: number; // 0 to 100
  hasClash: boolean;
  clashReason?: string;
}
