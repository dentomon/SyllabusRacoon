/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Course } from '../types';

export interface SampleSyllabus {
  id: string;
  name: string;
  code: string;
  instructor: string;
  term: string;
  color: string;
  description: string;
  rawText: string;
  defaultPreferences: {
    weeklyHours: number;
    preferredDays: string[];
    studyTimeOfDay: 'morning' | 'afternoon' | 'evening';
    bufferDaysBeforeExam: number;
    targetIntensity: 'balanced' | 'rigorous' | 'light';
  };
}

export const SAMPLE_SYLLABI: SampleSyllabus[] = [
  {
    id: 'bio-101',
    name: 'Principles of Cellular & Molecular Biology',
    code: 'BIO 101',
    instructor: 'Dr. Eleanor Vance',
    term: 'Fall Semester',
    color: '#059669', // Emerald
    description: 'Messy 12-page academic syllabus where midterm is buried on page 9',
    rawText: `UNIVERSITY BIOLOGICAL SCIENCES DEPARTMENT
COURSE SYLLABUS: BIO 101 - CELLULAR & MOLECULAR FOUNDATIONS
Section 02 | Hall 4B | Mon/Wed 10:00 - 11:30 AM
Instructor: Dr. Eleanor Vance (Office hours: Tues 2-4pm, Room 318)
Teaching Assistants: Marcus Brody, Sarah Chen

COURSE OVERVIEW:
An intensive introduction to biochemical macromolecules, membrane energetics, enzyme kinetics, Mendelian inheritance, and recombinant DNA protocols. Required text: Campbell Biology, 12th Ed.

ATTENDANCE & CONDUCT POLICY:
Regular attendance at all scheduled lecture sessions and laboratory blocks is strongly advised. Late assignments incur a 10% penalty per calendar day up to 3 days maximum. Academic dishonesty is reported directly to the Dean of Students.

LABORATORY PROTOCOL (Page 4):
Laboratory sections meet once per week in BioLab 204. You must bring OSHA-approved goggles and a bound carbon-copy notebook. Lab writeups are due 7 days following each practical module. All 5 lab modules combined constitute 20% of the final course grade.

[...Pages 5 to 8: Course Outcomes, Institutional Policies, Emergency Procedures...]

GRADING & EVALUATION METRICS (Page 9):
Grades will be computed on a standard 100-point percentile scale based on the following weighted benchmarks:
- Weekly Topic Quizzes: 10% (Best 8 out of 10 quizzes throughout the term)
- Comprehensive Laboratory Reports: 20% (Due periodically across the semester)
- Midterm Examination: 30% — Scheduled for Monday, November 18, 2026 (In-class, covers Chapters 1 through 8, brings Scantron form 882-E and No. 2 pencil).
- Scientific Literature Critical Essay: 20% — Due Wednesday, December 02, 2026 by 11:59 PM via portal submission. Topic: CRISPR-Cas9 therapeutic limitations.
- Final Capstone Examination: 20% — Friday, December 18, 2026, 9:00 AM - 12:00 PM in the Main Auditorium. Cumulative with emphasis on molecular genetics.

REQUIRED READING SCHEDULE:
Weeks 1-3: Water chemistry, amino acids, protein folding
Weeks 4-6: Cellular respiration, glycolysis, Krebs cycle
Weeks 7-8: Photosynthesis and membrane transport
Weeks 9-11: DNA replication and transcription
Weeks 12-14: Gene regulation and biotechnology`,
    defaultPreferences: {
      weeklyHours: 6,
      preferredDays: ['Mon', 'Wed', 'Sat'],
      studyTimeOfDay: 'evening',
      bufferDaysBeforeExam: 10,
      targetIntensity: 'balanced',
    },
  },
  {
    id: 'cs-200',
    name: 'Data Structures & Algorithmic Analysis',
    code: 'CS 200',
    instructor: 'Prof. Alexei Petrov',
    term: 'Fall Semester',
    color: '#0284C7', // Cerulean Blue
    description: 'Lecture slide notes with relative deadlines ("due week 11") and coding problem sets',
    rawText: `CS 200 - SLIDE DECK 01: SYLLABUS & EVALUATION BREAKDOWN
Department of Computer Science & Software Engineering

Instructors: Prof. Alexei Petrov (apetrov@university.edu)
Lectures: Tue / Thu 14:00 - 15:30 (Room CS-Auditorium)
Discussion Sections: Fridays

Deliverables breakdown (Total 100%):
1. Problem Set 1: Recursion & Big-O Complexity. Due Friday, September 25, 2026 at 5:00 PM. (Counts 10%)
2. Problem Set 2: Self-balancing BSTs and Red-Black Trees. Due Friday, October 16, 2026 at 5:00 PM. (Counts 10%)
3. Hands-on Midterm Coding Exam: Thursday, November 05, 2026 in lecture hall. (Counts 25%) - Dynamic Programming & Trees.
4. Team Project Milestone 1 (Design & Architecture): Monday, November 16, 2026. (Counts 10%)
5. Term Project Final Code & Demo Video: Thursday, December 03, 2026. (Counts 20%)
6. Final Comprehensive Exam: Tuesday, December 15, 2026 at 2:00 PM. (Counts 25%)

Collaboration policy: You may discuss concepts on Piazza, but all committed code must be your own original work. Git commit histories will be checked.`,
    defaultPreferences: {
      weeklyHours: 7,
      preferredDays: ['Tue', 'Thu', 'Sun'],
      studyTimeOfDay: 'afternoon',
      bufferDaysBeforeExam: 8,
      targetIntensity: 'rigorous',
    },
  },
  {
    id: 'lit-304',
    name: '20th Century Modernist Fiction & Poetry',
    code: 'LIT 304',
    instructor: 'Prof. Clara Higgins',
    term: 'Fall Semester',
    color: '#B45309', // Warm Amber / Bronze
    description: 'Email from professor with broken columns and pasted informal schedule',
    rawText: `From: Clara Higgins <c.higgins@faculty.lit.edu>
Subject: LIT 304 Welcome & Course Requirements / Important Dates!!
Date: September 02, 2026

Hi everyone, welcome to Modernist Fiction. Here is the schedule for our papers and grades, please note these down in your notebooks since Canvas is having synchronisation issues this week.

Deliverable                  When Due              Weight
---------------------------------------------------------
Diagnostic Close Reading     September 21, 2026    10%
Virginia Woolf Seminar Essay October 12, 2026      20%
Midterm Take-home Exam       November 02, 2026     20%
Term Research Essay Draft    November 23, 2026     15%
Final Research Paper         December 07, 2026     25%
Participation & Reading Log  December 11, 2026     10%

Papers should follow MLA 9th edition format. I do not accept late submissions unless arranged at least 48 hours in advance due to documented illness. Office hours Wednesdays 1-3 in Miller Hall.`,
    defaultPreferences: {
      weeklyHours: 4,
      preferredDays: ['Sun', 'Mon', 'Wed'],
      studyTimeOfDay: 'morning',
      bufferDaysBeforeExam: 7,
      targetIntensity: 'balanced',
    },
  },
];

export const INITIAL_PREPOPULATED_COURSES: Course[] = [
  {
    id: 'course-bio-101',
    name: 'Principles of Cellular & Molecular Biology',
    code: 'BIO 101',
    instructor: 'Dr. Eleanor Vance',
    term: 'Fall 2026',
    color: '#059669',
    syllabusRawText: SAMPLE_SYLLABI[0].rawText,
    syllabusFileName: 'BIO101_syllabus_FINAL_v3.pdf',
    createdAt: '2026-09-01T08:00:00Z',
    preferences: {
      weeklyHours: 6,
      preferredDays: ['Mon', 'Wed', 'Sat'],
      studyTimeOfDay: 'evening',
      bufferDaysBeforeExam: 10,
      targetIntensity: 'balanced',
    },
    deliverables: [
      {
        id: 'bio-d1',
        title: 'Weekly Topic Quizzes (Aggregate)',
        type: 'quiz',
        dueDate: '2026-10-30',
        weightPercent: 10,
        description: 'Bi-weekly quizzes testing Chapters 1-6',
        topics: ['Enzymes', 'Membranes', 'Glycolysis'],
        isCompleted: true,
      },
      {
        id: 'bio-d2',
        title: 'Comprehensive Laboratory Reports',
        type: 'lab',
        dueDate: '2026-11-10',
        weightPercent: 20,
        description: 'Combined 5 lab practical modules writeups',
        topics: ['Cell culture', 'Gel electrophoresis'],
        isCompleted: false,
      },
      {
        id: 'bio-d3',
        title: 'Midterm Examination',
        type: 'midterm',
        dueDate: '2026-11-18',
        weightPercent: 30,
        description: 'Chapters 1-8 comprehensive midterm exam in Hall 4B',
        topics: ['Enzyme kinetics', 'Cell respiration', 'Mitosis/Meiosis'],
        isCompleted: false,
      },
      {
        id: 'bio-d4',
        title: 'CRISPR Critical Literature Essay',
        type: 'essay',
        dueDate: '2026-12-02',
        weightPercent: 20,
        description: '5-page critique on CRISPR-Cas9 therapeutic limitations',
        topics: ['Gene editing', 'Off-target effects', 'Clinical trials'],
        isCompleted: false,
      },
      {
        id: 'bio-d5',
        title: 'Final Capstone Examination',
        type: 'final',
        dueDate: '2026-12-18',
        weightPercent: 20,
        description: 'Cumulative final in Main Auditorium',
        topics: ['Molecular genetics', 'Protein translation', 'Epigenetics'],
        isCompleted: false,
      },
    ],
    studyBlocks: [
      {
        id: 'sb-bio-today',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d2',
        deliverableTitle: 'Comprehensive Laboratory Reports',
        title: 'Electrophoresis Data & Graphing Prep',
        date: '2026-11-02',
        startTime: '16:30',
        durationHours: 1.5,
        objective: 'Plot standard curve and draft discussion for Lab 4 writeup',
        isCompleted: false,
      },
      {
        id: 'sb-bio-1',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d2',
        deliverableTitle: 'Comprehensive Laboratory Reports',
        title: 'Bio Lab Analysis & Electrophoresis Graphing',
        date: '2026-11-04',
        startTime: '19:00',
        durationHours: 2,
        objective: 'Analyze banding patterns and draft methodology section for Lab 4',
        isCompleted: true,
      },
      {
        id: 'sb-bio-2',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d2',
        deliverableTitle: 'Comprehensive Laboratory Reports',
        title: 'Lab Report Final Review & References',
        date: '2026-11-07',
        startTime: '19:00',
        durationHours: 2,
        objective: 'Compile standard error tables and finalize citations',
        isCompleted: false,
      },
      {
        id: 'sb-bio-3',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d3',
        deliverableTitle: 'Midterm Examination',
        title: 'Midterm Prep: Chapters 1-4 Cellular Energy',
        date: '2026-11-09',
        startTime: '18:30',
        durationHours: 2,
        objective: 'Flashcards on glycolysis, pyruvate oxidation, and ATP synthase steps',
        isCompleted: false,
      },
      {
        id: 'sb-bio-4',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d3',
        deliverableTitle: 'Midterm Examination',
        title: 'Midterm Prep: Chapters 5-8 Genetics & Practice Exam',
        date: '2026-11-11',
        startTime: '18:30',
        durationHours: 2,
        objective: 'Work through 2024 practice exam and clarify electron transport chain questions',
        isCompleted: false,
      },
      {
        id: 'sb-bio-5',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d3',
        deliverableTitle: 'Midterm Examination',
        title: 'Midterm Final Review Sprint',
        date: '2026-11-16',
        startTime: '18:00',
        durationHours: 2,
        objective: 'High-yield active recall of enzyme kinetics formulas and diagrams',
        isCompleted: false,
      },
      {
        id: 'sb-bio-6',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d4',
        deliverableTitle: 'CRISPR Critical Literature Essay',
        title: 'CRISPR Literature Search & Paper Outline',
        date: '2026-11-21',
        startTime: '19:00',
        durationHours: 2,
        objective: 'Select 3 peer-reviewed journal papers on Cas9 delivery mechanisms',
        isCompleted: false,
      },
      {
        id: 'sb-bio-7',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d4',
        deliverableTitle: 'CRISPR Critical Literature Essay',
        title: 'Drafting CRISPR Essay Arguments',
        date: '2026-11-25',
        startTime: '19:00',
        durationHours: 2,
        objective: 'Write sections on off-target indel generation and immunogenicity',
        isCompleted: false,
      },
      {
        id: 'sb-bio-8',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d4',
        deliverableTitle: 'CRISPR Critical Literature Essay',
        title: 'Essay Polishing & Formatting Check',
        date: '2026-11-30',
        startTime: '19:00',
        durationHours: 2,
        objective: 'Proofread against rubric, verify APA references, export PDF',
        isCompleted: false,
      },
      {
        id: 'sb-bio-9',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d5',
        deliverableTitle: 'Final Capstone Examination',
        title: 'Final Exam Review: DNA & Molecular Genetics',
        date: '2026-12-09',
        startTime: '18:30',
        durationHours: 2,
        objective: 'Deep review of transcription factors, lac operon, and PCR protocols',
        isCompleted: false,
      },
      {
        id: 'sb-bio-10',
        courseId: 'course-bio-101',
        courseName: 'Principles of Cellular & Molecular Biology',
        courseCode: 'BIO 101',
        courseColor: '#059669',
        deliverableId: 'bio-d5',
        deliverableTitle: 'Final Capstone Examination',
        title: 'Final Exam Simulation & Mock Test',
        date: '2026-12-14',
        startTime: '18:30',
        durationHours: 2,
        objective: 'Simulate full 3-hour cumulative paper under timed conditions',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'course-cs-200',
    name: 'Data Structures & Algorithmic Analysis',
    code: 'CS 200',
    instructor: 'Prof. Alexei Petrov',
    term: 'Fall 2026',
    color: '#0284C7',
    syllabusRawText: SAMPLE_SYLLABI[1].rawText,
    syllabusFileName: 'CS200_Lecture_Slide_Syllabus.png',
    createdAt: '2026-09-02T09:00:00Z',
    preferences: {
      weeklyHours: 7,
      preferredDays: ['Tue', 'Thu', 'Sun'],
      studyTimeOfDay: 'afternoon',
      bufferDaysBeforeExam: 8,
      targetIntensity: 'rigorous',
    },
    deliverables: [
      {
        id: 'cs-d1',
        title: 'Problem Set 1 (Recursion & Big-O)',
        type: 'homework',
        dueDate: '2026-09-25',
        weightPercent: 10,
        description: 'Asymptotic proofs and recursive equations',
        isCompleted: true,
      },
      {
        id: 'cs-d2',
        title: 'Problem Set 2 (Red-Black Trees)',
        type: 'homework',
        dueDate: '2026-10-16',
        weightPercent: 10,
        description: 'Implementing balance rotations and delete fixes',
        isCompleted: true,
      },
      {
        id: 'cs-d3',
        title: 'Hands-on Midterm Coding Exam',
        type: 'midterm',
        dueDate: '2026-11-05',
        weightPercent: 25,
        description: 'In-person programming exam on DP and tree algorithms',
        isCompleted: false,
      },
      {
        id: 'cs-d4',
        title: 'Team Project Milestone 1 (Design)',
        type: 'project',
        dueDate: '2026-11-16',
        weightPercent: 10,
        description: 'System architectural diagram and graph data models',
        isCompleted: false,
      },
      {
        id: 'cs-d5',
        title: 'Term Project Final Code & Demo Video',
        type: 'project',
        dueDate: '2026-12-03',
        weightPercent: 20,
        description: 'Tested graph engine + 3 minute demo recording',
        isCompleted: false,
      },
      {
        id: 'cs-d6',
        title: 'Final Comprehensive Exam',
        type: 'final',
        dueDate: '2026-12-15',
        weightPercent: 25,
        description: 'Covers Dijkstra, Bellman-Ford, NP-completeness',
        isCompleted: false,
      },
    ],
    studyBlocks: [
      {
        id: 'sb-cs-today',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d3',
        deliverableTitle: 'Hands-on Midterm Coding Exam',
        title: 'Dynamic Programming Memoization Drills',
        date: '2026-11-02',
        startTime: '19:00',
        durationHours: 2.0,
        objective: 'Solve 0/1 knapsack and longest common subsequence memoization patterns',
        isCompleted: false,
      },
      {
        id: 'sb-cs-1',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d3',
        deliverableTitle: 'Hands-on Midterm Coding Exam',
        title: 'Dynamic Programming Practice Sprint',
        date: '2026-11-03',
        startTime: '14:00',
        durationHours: 2.5,
        objective: 'Solve 0/1 knapsack and longest common subsequence on LeetCode',
        isCompleted: false,
      },
      {
        id: 'sb-cs-2',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d4',
        deliverableTitle: 'Team Project Milestone 1 (Design)',
        title: 'Graph Schema & Interface Design',
        date: '2026-11-08',
        startTime: '14:00',
        durationHours: 2,
        objective: 'Draft adjacency list data structures and async worker queues',
        isCompleted: false,
      },
      {
        id: 'sb-cs-3',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d4',
        deliverableTitle: 'Team Project Milestone 1 (Design)',
        title: 'Project Milestone 1 Writeup & Submission',
        date: '2026-11-13',
        startTime: '15:00',
        durationHours: 2,
        objective: 'Verify UML diagram and write requirements documentation',
        isCompleted: false,
      },
      {
        id: 'sb-cs-4',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d5',
        deliverableTitle: 'Term Project Final Code & Demo Video',
        title: 'Graph Traversal & Shortest Path Implementation',
        date: '2026-11-20',
        startTime: '14:00',
        durationHours: 2.5,
        objective: 'Implement A* search algorithm and benchmark latency',
        isCompleted: false,
      },
      {
        id: 'sb-cs-5',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d5',
        deliverableTitle: 'Term Project Final Code & Demo Video',
        title: 'Record Demo Screencast & README',
        date: '2026-11-29',
        startTime: '14:00',
        durationHours: 2,
        objective: 'Record 3-minute video showcase, test unit test suite on clean repo',
        isCompleted: false,
      },
      {
        id: 'sb-cs-6',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d6',
        deliverableTitle: 'Final Comprehensive Exam',
        title: 'Graph Algorithms & Complexity Review',
        date: '2026-12-06',
        startTime: '14:00',
        durationHours: 2.5,
        objective: 'Practice reduction proofs for 3-SAT to Vertex Cover',
        isCompleted: false,
      },
      {
        id: 'sb-cs-7',
        courseId: 'course-cs-200',
        courseName: 'Data Structures & Algorithmic Analysis',
        courseCode: 'CS 200',
        courseColor: '#0284C7',
        deliverableId: 'cs-d6',
        deliverableTitle: 'Final Comprehensive Exam',
        title: 'Past Exam Drills & Formula Sheet',
        date: '2026-12-11',
        startTime: '14:00',
        durationHours: 2.5,
        objective: 'Timed practice on 2025 final exam paper',
        isCompleted: false,
      },
    ],
  },
];
