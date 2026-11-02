/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course, Deliverable, StudyBlock } from './types';
import { INITIAL_PREPOPULATED_COURSES } from './data/sampleSyllabi';
import { Navbar, ActiveTab } from './components/Navbar';
import { CourseSelector } from './components/CourseSelector';
import { StartPageView } from './components/StartPageView';
import { SyllabusUploader } from './components/SyllabusUploader';
import { DeliverablesLedger } from './components/DeliverablesLedger';
import { PlanningWizard } from './components/PlanningWizard';
import { StudyTimelineView } from './components/StudyTimelineView';
import { WorkloadHeatmap } from './components/WorkloadHeatmap';
import { FocusSprintView } from './components/FocusSprintView';
import { SickDayRescheduleModal } from './components/SickDayRescheduleModal';
import { NewCourseModal } from './components/NewCourseModal';
import { RaccoonMascot } from './components/RaccoonMascot';

const STORAGE_KEY = 'syllabuspilot_courses_v5';

export default function App() {
  const [isTaskActive, setIsTaskActive] = useState<boolean>(false);
  const [celebrationTrigger, setCelebrationTrigger] = useState<number>(0);

  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load courses from localStorage', e);
    }
    return INITIAL_PREPOPULATED_COURSES;
  });

  const [activeCourseId, setActiveCourseId] = useState<string>(
    courses[0]?.id || INITIAL_PREPOPULATED_COURSES[0].id
  );
  // Default to the new Overview Start Page!
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [isPlanningWizardMode, setIsPlanningWizardMode] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState<boolean>(false);
  const [isNewCourseModalOpen, setIsNewCourseModalOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses to localStorage', e);
    }
  }, [courses]);

  const activeCourse =
    courses.find((c) => c.id === activeCourseId) || courses[0] || INITIAL_PREPOPULATED_COURSES[0];

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === updatedCourse.id ? updatedCourse : c)));
  };

  const handleUpdateAllCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
  };

  const handleAddNewCourse = (newCourse: Course) => {
    setCourses((prev) => [...prev, newCourse]);
    setActiveCourseId(newCourse.id);
    setActiveTab('syllabus');
    setIsPlanningWizardMode(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    const remaining = courses.filter((c) => c.id !== courseId);
    if (remaining.length > 0) {
      setCourses(remaining);
      if (activeCourseId === courseId) {
        setActiveCourseId(remaining[0].id);
      }
    }
  };

  const handleUpdateDeliverables = (updatedDeliverables: Deliverable[]) => {
    // Check if user completed any deliverable
    const prevCompletedCount = activeCourse.deliverables.filter((d) => d.isCompleted).length;
    const newCompletedCount = updatedDeliverables.filter((d) => d.isCompleted).length;
    if (newCompletedCount > prevCompletedCount) {
      setCelebrationTrigger((c) => c + 1);
    }

    handleUpdateCourse({
      ...activeCourse,
      deliverables: updatedDeliverables,
    });
  };

  const handleToggleBlock = (block: StudyBlock) => {
    const parent = courses.find((c) => c.id === block.courseId);
    if (!parent) return;

    if (!block.isCompleted) {
      // User is checking this study session off as done!
      setCelebrationTrigger((c) => c + 1);
    }

    const updatedBlocks = parent.studyBlocks.map((b) =>
      b.id === block.id ? { ...b, isCompleted: !b.isCompleted } : b
    );
    handleUpdateCourse({
      ...parent,
      studyBlocks: updatedBlocks,
    });
  };

  const handleToggleDeliverable = (deliverableId: string, courseId: string) => {
    const parentCourse = courses.find((c) => c.id === courseId);
    if (!parentCourse) return;
    const target = parentCourse.deliverables.find((d) => d.id === deliverableId);
    if (!target) return;
    if (!target.isCompleted) {
      setCelebrationTrigger((c) => c + 1);
    }
    const updated = parentCourse.deliverables.map((d) =>
      d.id === deliverableId ? { ...d, isCompleted: !d.isCompleted } : d
    );
    handleUpdateCourse({
      ...parentCourse,
      deliverables: updated,
    });
  };

  const handleAddStudyBlock = (newBlock: StudyBlock) => {
    const parent = courses.find((c) => c.id === newBlock.courseId);
    if (!parent) return;
    handleUpdateCourse({
      ...parent,
      studyBlocks: [newBlock, ...parent.studyBlocks],
    });
  };

  const allDeliverables = courses.flatMap((c) => c.deliverables);
  const upcomingCount = allDeliverables.filter((d) => !d.isCompleted).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsPlanningWizardMode(false);
        }}
        onOpenImport={() => {
          setActiveTab('syllabus');
          setIsPlanningWizardMode(false);
        }}
        totalCoursesCount={courses.length}
        upcomingDeliverablesCount={upcomingCount}
        mascotState={isTaskActive ? 'awake' : 'sleeping'}
      />

      {/* Course Bar */}
      <CourseSelector
        courses={courses}
        activeCourseId={activeCourseId}
        onSelectCourse={(id) => {
          setActiveCourseId(id);
          setIsPlanningWizardMode(false);
        }}
        onAddNewCourse={() => setIsNewCourseModalOpen(true)}
        onDeleteCourse={handleDeleteCourse}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 space-y-8 pb-24 md:pb-12">
        {/* Tab 0: Start Page (Overview) */}
        {activeTab === 'overview' && (
          <StartPageView
            courses={courses}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setIsPlanningWizardMode(false);
            }}
            onSelectCourse={(id) => setActiveCourseId(id)}
            onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
            onToggleBlock={handleToggleBlock}
            onToggleDeliverable={handleToggleDeliverable}
            onAddStudyBlock={handleAddStudyBlock}
          />
        )}

        {/* Tab 1: Upload / Ingest Syllabus */}
        {activeTab === 'syllabus' && (
          <SyllabusUploader
            currentCourse={activeCourse}
            onUpdateCourse={handleUpdateCourse}
            onNavigateToDeliverables={() => setActiveTab('deliverables')}
            onParsingStateChange={(parsing) => setIsTaskActive(parsing)}
            onParseSuccess={() => setCelebrationTrigger((c) => c + 1)}
          />
        )}

        {/* Tab 2: Deadlines & Grades Ledger */}
        {activeTab === 'deliverables' && (
          <DeliverablesLedger
            course={activeCourse}
            onUpdateDeliverables={handleUpdateDeliverables}
            onProceedToPlanning={() => {
              setIsPlanningWizardMode(true);
              setActiveTab('timeline');
            }}
          />
        )}

        {/* Tab 3: Study Plan & Calendar Timeline */}
        {activeTab === 'timeline' && (
          <>
            {isPlanningWizardMode ? (
              <PlanningWizard
                course={activeCourse}
                onUpdateCourse={handleUpdateCourse}
                onPlanGenerated={() => setIsPlanningWizardMode(false)}
              />
            ) : (
              <StudyTimelineView
                courses={courses}
                activeCourseId={activeCourseId}
                onUpdateCourse={handleUpdateCourse}
                onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
                onNavigateToPlanning={() => setIsPlanningWizardMode(true)}
              />
            )}
          </>
        )}

        {/* Tab 4: Focus Sprint */}
        {activeTab === 'focus' && (
          <FocusSprintView
            courses={courses}
            onToggleBlock={handleToggleBlock}
            onTimerStateChange={(running) => setIsTaskActive(running)}
            onSessionComplete={() => setCelebrationTrigger((c) => c + 1)}
          />
        )}

        {/* Tab 5: Workload Heatmap */}
        {activeTab === 'heatmap' && (
          <WorkloadHeatmap
            courses={courses}
            onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-10 px-6 lg:px-12 bg-white">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[14px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-serif font-normal text-slate-900 text-base">SyllabusRacoon</span>
            <span aria-hidden="true">·</span>
            <span>Academic syllabus intelligence & calendar generator</span>
          </div>

          <div className="flex items-center gap-6 text-[13px] text-slate-400">
            <span>GDG Riga + RTU Hackathon</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => {
                if (confirm('Reset to initial sample courses? This will reload BIO 101 and CS 200.')) {
                  setCourses(INITIAL_PREPOPULATED_COURSES);
                  setActiveCourseId(INITIAL_PREPOPULATED_COURSES[0].id);
                  localStorage.removeItem(STORAGE_KEY);
                  setActiveTab('overview');
                }
              }}
              className="text-slate-500 hover:text-indigo-600 underline underline-offset-4 cursor-pointer"
            >
              Reset sample courses
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SickDayRescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        courses={courses}
        onUpdateAllCourses={handleUpdateAllCourses}
      />

      <NewCourseModal
        isOpen={isNewCourseModalOpen}
        onClose={() => setIsNewCourseModalOpen(false)}
        onAddCourse={handleAddNewCourse}
      />

      {/* Cute Animated Study Mascot */}
      <RaccoonMascot
        isTaskActive={isTaskActive}
        celebrationTrigger={celebrationTrigger}
      />
    </div>
  );
}
