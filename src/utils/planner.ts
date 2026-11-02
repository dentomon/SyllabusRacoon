/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course, Deliverable, StudyBlock, StudyPreferences, WorkloadWeek } from '../types';

const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function getTimeForSlot(slot: 'morning' | 'afternoon' | 'evening'): string {
  switch (slot) {
    case 'morning':
      return '09:00';
    case 'afternoon':
      return '14:00';
    case 'evening':
    default:
      return '19:00';
  }
}

/**
 * Generates an optimized week-by-week study plan for a course
 */
export function generateStudyPlanForCourse(
  course: Course,
  customPreferences?: StudyPreferences,
  referenceDateStr: string = '2026-11-02'
): StudyBlock[] {
  const prefs = customPreferences || course.preferences;
  const deliverables = [...course.deliverables].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  if (deliverables.length === 0) return [];

  const studyBlocks: StudyBlock[] = [];
  const preferredDayNumbers = (prefs.preferredDays.length > 0
    ? prefs.preferredDays
    : ['Mon', 'Wed', 'Sat']
  ).map((day) => DAY_MAP[day] ?? 1);

  const startTime = getTimeForSlot(prefs.studyTimeOfDay);
  const blockDuration = Math.min(2.5, Math.max(1.5, Math.round((prefs.weeklyHours / preferredDayNumbers.length) * 10) / 10));

  const refDate = parseDate(referenceDateStr);

  for (const deliv of deliverables) {
    const dueDate = parseDate(deliv.dueDate);
    // Don't plan past items if already past
    if (dueDate.getTime() < refDate.getTime() && deliv.isCompleted) {
      continue;
    }

    // Number of sessions based on deliverable type & weight
    let sessionCount = 2;
    if (deliv.type === 'final') sessionCount = 4;
    else if (deliv.type === 'midterm' || deliv.type === 'exam') sessionCount = 3;
    else if (deliv.type === 'essay' || deliv.type === 'project') sessionCount = 3;
    else if (deliv.weightPercent >= 25) sessionCount = 4;
    else if (deliv.weightPercent >= 15) sessionCount = 3;
    else sessionCount = 2;

    // Buffer runway: how many days before due date we start
    const runwayDays = Math.max(deliv.type === 'exam' || deliv.type === 'final' ? 12 : 7, prefs.bufferDaysBeforeExam);
    const windowStart = new Date(dueDate);
    windowStart.setDate(windowStart.getDate() - runwayDays);

    // Keep windowStart at or after refDate if possible
    const effectiveStart = windowStart.getTime() < refDate.getTime() ? new Date(refDate) : windowStart;

    // Collect available study days in this window
    const availableDates: Date[] = [];
    const cur = new Date(effectiveStart);
    while (cur.getTime() <= dueDate.getTime()) {
      if (preferredDayNumbers.includes(cur.getDay()) && cur.getTime() < dueDate.getTime()) {
        availableDates.push(new Date(cur));
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Pick evenly spaced dates
    const chosenDates: Date[] = [];
    if (availableDates.length <= sessionCount) {
      chosenDates.push(...availableDates);
    } else {
      const step = (availableDates.length - 1) / (sessionCount - 1);
      for (let i = 0; i < sessionCount; i++) {
        const idx = Math.min(availableDates.length - 1, Math.round(i * step));
        if (!chosenDates.some((d) => formatDate(d) === formatDate(availableDates[idx]))) {
          chosenDates.push(availableDates[idx]);
        }
      }
    }

    // Assign tailored titles and objectives
    chosenDates.forEach((targetDate, idx) => {
      let title = `Study: ${deliv.title}`;
      let objective = `Prepare topics for ${deliv.title}`;

      if (deliv.type === 'exam' || deliv.type === 'midterm' || deliv.type === 'final') {
        const phases = [
          { title: `${deliv.title} — Topic Mapping & High-Yield Flashcards`, obj: 'Review foundational lecture slides, summarize formulas and key definitions' },
          { title: `${deliv.title} — Deep Problem Solving & Practice Exam`, obj: 'Work through past exam papers, identify weak retention points' },
          { title: `${deliv.title} — Targeted Q&A Drill & Concept Clarification`, obj: 'Focus specifically on challenging topics and verify understanding' },
          { title: `${deliv.title} — Final Timed Simulation & Mental Readiness`, obj: 'Simulate realistic exam constraints and consolidate cheat-sheet summary' },
        ];
        const phase = phases[Math.min(idx, phases.length - 1)];
        title = phase.title;
        objective = phase.obj;
      } else if (deliv.type === 'essay') {
        const phases = [
          { title: `${deliv.title} — Source Gathering & Thesis Formulation`, obj: 'Read and annotate 3-5 core reference texts and draft thesis statement' },
          { title: `${deliv.title} — Drafting Core Argument Sections`, obj: 'Draft body paragraphs, incorporate textual evidence, and organize topic transitions' },
          { title: `${deliv.title} — Proofreading, Citations & MLA/APA Check`, obj: 'Refine syntax, verify bibliography formatting, and export finalized document' },
        ];
        const phase = phases[Math.min(idx, phases.length - 1)];
        title = phase.title;
        objective = phase.obj;
      } else if (deliv.type === 'project') {
        const phases = [
          { title: `${deliv.title} — System Architecture & Component Design`, obj: 'Draft data schemas, identify API contracts, and establish milestone tasks' },
          { title: `${deliv.title} — Core Implementation Sprint`, obj: 'Build primary application logic and write unit tests' },
          { title: `${deliv.title} — Integration Polish, Screencast & README`, obj: 'Test edge cases, prepare submission documentation, and verify deliverables' },
        ];
        const phase = phases[Math.min(idx, phases.length - 1)];
        title = phase.title;
        objective = phase.obj;
      } else {
        title = `${deliv.title} Prep (Part ${idx + 1})`;
        objective = `Complete exercises and verify requirements before deadline`;
      }

      studyBlocks.push({
        id: `sb-${course.id}-${deliv.id}-${idx}`,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        courseColor: course.color,
        deliverableId: deliv.id,
        deliverableTitle: deliv.title,
        title,
        date: formatDate(targetDate),
        startTime,
        durationHours: blockDuration,
        objective,
        isCompleted: false,
      });
    });
  }

  // Sort chronologically
  return studyBlocks.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Rebalances schedule when a student is sick or falls behind for N days
 * Shifts uncompleted sessions forward into future available slots
 */
export function rebalanceScheduleForMissedDays(
  allCourses: Course[],
  missedStartDate: string,
  missedEndDate: string
): { updatedCourses: Course[]; shiftedCount: number; message: string } {
  const start = parseDate(missedStartDate);
  const end = parseDate(missedEndDate);
  let totalShifted = 0;

  const updatedCourses = allCourses.map((course) => {
    const updatedBlocks = course.studyBlocks.map((block) => {
      const blockDate = parseDate(block.date);
      // If block falls in the sick window and is not completed, we need to push it
      if (!block.isCompleted && blockDate.getTime() >= start.getTime() && blockDate.getTime() <= end.getTime()) {
        const daysToShift = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const newDate = new Date(blockDate);
        newDate.setDate(newDate.getDate() + daysToShift);

        // Find deliverable deadline to ensure we don't push past the actual exam!
        const deliverable = course.deliverables.find((d) => d.id === block.deliverableId);
        if (deliverable) {
          const due = parseDate(deliverable.dueDate);
          if (newDate.getTime() >= due.getTime()) {
            // Cap it to the day before the exam
            const dayBefore = new Date(due);
            dayBefore.setDate(dayBefore.getDate() - 1);
            if (dayBefore.getTime() > end.getTime()) {
              newDate.setTime(dayBefore.getTime());
            }
          }
        }

        totalShifted++;
        return {
          ...block,
          date: formatDate(newDate),
          wasRescheduled: true,
          objective: `${block.objective} (Rescheduled recovery session)`,
        };
      }
      return block;
    });

    return {
      ...course,
      studyBlocks: updatedBlocks.sort((a, b) => a.date.localeCompare(b.date)),
    };
  });

  const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const message = totalShifted > 0
    ? `Successfully rescheduled ${totalShifted} study session(s) across the ${durationDays}-day recovery window without impacting course deadlines.`
    : `No pending study sessions were scheduled between ${missedStartDate} and ${missedEndDate}. Your schedule is already up to date.`;

  return { updatedCourses, shiftedCount: totalShifted, message };
}

/**
 * Computes multi-course workload heatmap and identifies exam/deadline clashes
 */
export function computeWorkloadHeatmap(courses: Course[]): WorkloadWeek[] {
  // Find overall start and end dates
  const allDates: string[] = [];
  courses.forEach((c) => {
    c.deliverables.forEach((d) => allDates.push(d.dueDate));
    c.studyBlocks.forEach((b) => allDates.push(b.date));
  });

  if (allDates.length === 0) return [];
  allDates.sort();

  const minDate = parseDate(allDates[0]);
  const maxDate = parseDate(allDates[allDates.length - 1]);

  // Align minDate to preceding Monday
  const startMonday = new Date(minDate);
  const day = startMonday.getDay();
  const diff = startMonday.getDate() - day + (day === 0 ? -6 : 1);
  startMonday.setDate(diff);

  const weeks: WorkloadWeek[] = [];
  let weekIdx = 1;
  const curMonday = new Date(startMonday);

  while (curMonday.getTime() <= maxDate.getTime() + 7 * 24 * 60 * 60 * 1000) {
    const weekStart = new Date(curMonday);
    const weekEnd = new Date(curMonday);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = formatDate(weekStart);
    const weekEndStr = formatDate(weekEnd);

    // Sum study hours for this week across all courses
    let totalStudyHours = 0;
    courses.forEach((c) => {
      c.studyBlocks.forEach((b) => {
        if (b.date >= weekStartStr && b.date <= weekEndStr) {
          totalStudyHours += b.durationHours || 2;
        }
      });
    });

    // Collect deliverables due this week
    const deliverablesDue: WorkloadWeek['deliverablesDue'] = [];
    courses.forEach((c) => {
      c.deliverables.forEach((d) => {
        if (d.dueDate >= weekStartStr && d.dueDate <= weekEndStr) {
          deliverablesDue.push({
            courseCode: c.code,
            courseColor: c.color,
            title: d.title,
            type: d.type,
            dueDate: d.dueDate,
            weightPercent: d.weightPercent,
          });
        }
      });
    });

    // Check for high pressure clashes (e.g., multiple exams or > 40% grade weight in 1 week)
    const examCount = deliverablesDue.filter(
      (d) => d.type === 'exam' || d.type === 'midterm' || d.type === 'final'
    ).length;
    const totalWeightDue = deliverablesDue.reduce((sum, d) => sum + d.weightPercent, 0);

    let hasClash = false;
    let clashReason: string | undefined;

    if (examCount >= 2) {
      hasClash = true;
      clashReason = `Exam Clash: ${examCount} major exams fall in this same week!`;
    } else if (totalWeightDue >= 40) {
      hasClash = true;
      clashReason = `Heavy Deadline Load: ${totalWeightDue}% of your term grade is due this week.`;
    } else if (totalStudyHours > 16) {
      hasClash = true;
      clashReason = `High Study Volume: ${totalStudyHours.toFixed(1)} hours required. Spread sessions earlier.`;
    }

    // Intensity score 0 to 100
    const intensityScore = Math.min(
      100,
      Math.round(totalStudyHours * 3 + totalWeightDue * 0.8 + (examCount > 1 ? 30 : 0))
    );

    weeks.push({
      weekNumber: weekIdx,
      startDate: weekStartStr,
      endDate: weekEndStr,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      deliverablesDue,
      intensityScore,
      hasClash,
      clashReason,
    });

    weekIdx++;
    curMonday.setDate(curMonday.getDate() + 7);
  }

  return weeks;
}
