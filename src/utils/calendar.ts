/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyBlock, Deliverable } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  durationHours: number;
  category: string;
}

/**
 * Formats a date and time string into iCalendar format: YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
 */
function toIcsDateTime(dateStr: string, timeStr: string, addHours: number = 0): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const d = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  if (addHours > 0) {
    d.setMinutes(d.getMinutes() + Math.round(addHours * 60));
  }

  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dt = String(d.getUTCDate()).padStart(2, '0');
  const h = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const s = '00';

  return `${y}${m}${dt}T${h}${min}${s}Z`;
}

/**
 * Generates an RFC 5545 compliant .ics string (the make_ics tool function)
 */
export function make_ics(events: CalendarEvent[]): string {
  const timestamp = toIcsDateTime(
    new Date().toISOString().split('T')[0],
    '12:00'
  );

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SyllabusRacoon//Academic Study Copilot//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SyllabusRacoon Study Plan',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const ev of events) {
    const dtStart = toIcsDateTime(ev.startDate, ev.startTime);
    const dtEnd = toIcsDateTime(ev.startDate, ev.startTime, ev.durationHours);
    const safeSummary = ev.title.replace(/[,;\\]/g, ' ');
    const safeDescription = ev.description.replace(/\n/g, '\\n').replace(/[,;\\]/g, ' ');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${ev.id}@syllabusracoon.app`);
    lines.push(`DTSTAMP:${timestamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${safeSummary}`);
    lines.push(`DESCRIPTION:${safeDescription}`);
    lines.push(`CATEGORIES:${ev.category.toUpperCase()}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT30M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Upcoming: ${safeSummary}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Converts StudyBlocks and Deliverables into uniform CalendarEvents
 */
export function buildCalendarEventsFromCourse(
  studyBlocks: StudyBlock[],
  deliverables: Deliverable[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Add study sessions
  for (const block of studyBlocks) {
    events.push({
      id: block.id,
      title: `[Study] ${block.courseCode}: ${block.title}`,
      description: `Objective: ${block.objective}\nCourse: ${block.courseName}\nTarget: ${block.deliverableTitle || 'Regular Prep'}`,
      startDate: block.date,
      startTime: block.startTime || '18:00',
      durationHours: block.durationHours || 2,
      category: 'STUDY_SESSION',
    });
  }

  // Add hard deadlines and exams
  for (const d of deliverables) {
    events.push({
      id: `deadline-${d.id}`,
      title: `[DUE] ${d.title} (${d.weightPercent}%)`,
      description: `Course Deliverable Deadline: ${d.title}\nWeight: ${d.weightPercent}%\nType: ${d.type.toUpperCase()}\nDetails: ${d.description || 'Deliverable due today'}`,
      startDate: d.dueDate,
      startTime: d.dueTime || '23:59',
      durationHours: 1,
      category: 'DEADLINE',
    });
  }

  return events;
}

/**
 * Downloads a string content as an .ics file in the browser
 */
export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Creates a direct 1-click URL to create an event in Google Calendar web
 */
export function createGoogleCalendarUrl(event: {
  title: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  durationHours: number;
}): string {
  const dtStart = toIcsDateTime(event.dateStr, event.timeStr);
  const dtEnd = toIcsDateTime(event.dateStr, event.timeStr, event.durationHours);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dtStart}/${dtEnd}`,
    details: event.description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
