# SyllabusPilot — Intelligent Academic Syllabus Agent & Study Calendar Generator

SyllabusPilot is a dedicated academic copilot that ingests unstructured course syllabi—whether messy multi-page PDFs, photos of lecture slides, or plain-text email announcements—extracts every graded milestone with exact percentage weights and due dates, asks at most 3 personalized study preference questions, balances workloads across multiple courses with heatmap conflict detection, and generates 1-click Google Calendar entries and downloadable `.ics` calendars.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions have been aligned based on your preferences:

- **Aesthetic Direction**: **Gentle Focus Paper** aesthetic with warm cream and parchment tones (`#FDFBF7`, `#F7F4EB`), warm slate borders (`#E5DFD3`), charcoal typography (`#292524`), and warm terracotta/amber study accents (`#D97706`, `#C2410C`), rendered with high-readability serif display headings (`Source Serif 4` / `Newsreader` style via font stack) and crisp clean body prose.
- **Multi-Course Management**: Full multi-course workspace supporting concurrent course tracking (e.g., BIO101, CS200, Literature), an aggregate semester workload heatmap, exam clash warnings, and adaptive rescheduling ("I was sick for 3 days" / "Fell behind").
- **Calendar & Export Integration**: Dual export offering direct 1-click **Add to Google Calendar** URL actions (pre-populated with title, description, time block, and course tags) and downloadable standard `.ics` (iCalendar) files compatible with Apple Calendar, Outlook, and Google Calendar.
- **Pre-Loaded Messy Sample Syllabi**: Includes 3 ready-to-test authentic messy syllabi (a 12-page Biology syllabus with buried midterm on page 9, a photo-slide computer science prompt with vague week milestones, and an unformatted copy-pasted email table) for immediate 1-click hackathon judging and demonstration.

---

## 1. Overview & Core Concept

- **What It Does**: SyllabusPilot frees university and college students from syllabus chaos. Users upload or paste any course syllabus in any format (PDF, image/photo, or raw text). The Gemini-powered agent parses all deliverables (assignments, quizzes, midterm exams, projects, final papers), organizes them into a clean graded item matrix, asks up to 3 quick planning questions (weekly study hours, preferred study days/times, target grade intensity), and computes a balanced week-by-week study plan with automatic milestone buffer blocks.
- **Target Audience / Persona**: College and university students juggling 4–6 simultaneous courses, student-athletes, working professionals in evening master's programs, and professors wanting to provide instant calendar subscriptions for their course schedules.
- **Key Value**: Eliminates the "midterm surprise" syndrome, prevents end-of-semester cramming bottlenecks through distributed study blocks, and turns static course PDF requirements into live calendar notifications in under 60 seconds.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Course Ingestion**:
   - The user selects an existing course or creates a new one.
   - User uploads a PDF document, captures/uploads an image of a lecture slide or textbook page, pastes raw syllabus text, or clicks one of the instant **Test Samples** (e.g. *BIO101 Messy PDF*, *CS200 Slide Photo*, *LIT304 Pasted Email*).
2. **AI Deliverables Extraction**:
   - The agent analyzes the syllabus, detecting course name, semester start/end, and all graded components: title, deadline/date, weight percentage, and milestone category.
   - Renders a clean **Deliverables Ledger** table where items can be verified, edited, or manually added.
3. **Interactive 3-Question Guided Planning**:
   - The agent prompts the student with 3 tailored planning questions:
     1. *Available Study Hours*: Slider or quick chips (e.g., 4h, 6h, 10h/week).
     2. *Study Schedule Preference*: Preferred study days (e.g., Weekday evenings vs. Weekend deep work).
     3. *Preparation Runway*: How many days prior to exams/major essays study blocks should ramp up.
4. **Adaptive Study Schedule & Workload Heatmap**:
   - View an interactive timeline broken down by week: study sprint blocks (e.g., "Review Ch. 1 & 2", "Draft Literature Outline", "Practice Exam Prep") synchronized with deliverables.
   - A multi-course **Workload Heatmap** highlights peak pressure weeks where multiple exams or heavy deadlines coincide, suggesting pre-emptive redistribution.
   - **Adaptive "Sick Day / Reschedule" Tool**: One-click prompt (e.g., *"I was sick for 3 days"* or *"Postpone project by 1 week"*) allows the agent to intelligently shift remaining study blocks without dropping deadlines.
5. **Calendar Export & Daily Focus**:
   - **One-Click Add to Google Calendar**: Generates direct Google Calendar event creation links for each scheduled study block and deadline.
   - **Download `plan.ics`**: Exports the entire study roadmap into a standard calendar file that imports seamlessly into any calendar client.
   - **Daily Study Focus Card**: Generates today's study checklist with a motivational study prompt and timer.

### Visual Identity & Theme

- **Aesthetic Direction**: Gentle Focus Paper — evoking calm, tactile study desks, clean notebooks, and warm library lighting.
- **Color Palette**:
  - Dominant Canvas (60%): Warm paper cream (`#FAF7EE` / `bg-amber-50/40`), subtle parchment borders (`#E6DFCE`).
  - Structural Surfaces (30%): Natural card stock (`#FFFFFF`), muted charcoal headers (`#292524`), stone secondary typography (`#78716C`), and hairline dividers (`#ECE7DC`).
  - Semantic Accent Budget (10%): Warm terracotta (`#C2410C`), amber study highlights (`#D97706`), forest green for completed milestones (`#15803D`), and deep ink navy for primary actions (`#1E293B`).
- **Typography & Hierarchy**:
  - Display & Section Titles: Elegant editorial serif styling with `font-serif tracking-tight text-stone-900`.
  - Body & UI Controls: Balanced modern sans-serif (`font-sans text-stone-700`) with generous reading line-height.
  - Deliverables & Dates: Tabular figures (`tabular-nums font-mono text-xs`) for date stamps, percentages, and duration calculations.
- **Anti-Slop Discipline**:
  - Zero pill badges on metadata: unboxed textual timestamps with typographic bullet separators (`Oct 24 · 30% · Midterm Exam`).
  - No decorative pulsing dots, no fake telemetry, and no mechanical snake-case prefixes.
  - Strict Top Bar Contract: Brand title (`SyllabusPilot`), 4-link navigation (`Courses`, `Deliverables`, `Study Timeline`, `Workload Heatmap`), and 1 primary CTA button (`+ Import Syllabus`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Server-Side Gemini API Proxy**:
  - *Chosen Approach*: Implement an Express server proxy route (`/api/parse-syllabus` and `/api/plan-study`) utilizing `@google/genai` with model `gemini-3.8-flash` and structured JSON schema enforcement (`responseSchema`), keeping API credentials strictly server-side.
  - *Why*: Ensures robust multimodal file parsing (accepting base64 PDF and image payloads as well as text), strict JSON extraction of deliverables, and zero client-side key leakage.
  - *Alternatives Considered*: Client-side calls (prohibited by security guidelines) or static regex parsers (too brittle for irregular university syllabi).
- **Decision 2: Dual Storage (Local Persistence + Session)**:
  - *Chosen Approach*: Keep course data, syllabus files, and generated study schedules persisted in browser `localStorage` with reactive state synchronization.
  - *Why*: Gives students instant offline access to their syllabi and study plans without mandatory login barriers during hackathon evaluation, while allowing multi-course management and immediate reloads.
- **Decision 3: Universal RFC 5545 iCalendar (`.ics`) Generator**:
  - *Chosen Approach*: Write a zero-dependency, standard-compliant `.ics` serialization utility that formats `VEVENT` blocks with `UID`, `DTSTART`, `DTEND`, `SUMMARY`, `DESCRIPTION`, and reminder alarms (`VALARM`), paired with Google Calendar URL templates (`https://calendar.google.com/calendar/render?action=TEMPLATE&...`).
  - *Why*: Works across all operating systems (macOS, iOS, Android, Windows) and third-party apps without requiring complex external OAuth provisioning for read-only calendar creation, while still providing seamless 1-click Google Calendar integration.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SyllabusPilot Web App                           │
├────────────────────────────────────────────────────────────────────────┤
│ Top Navigation: [SyllabusPilot] ── [Courses · Matrix · Plan · Heatmap] ─ [Export] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐    ┌──────────────────────────────────────┐ │
│  │ Multi-Course Sidebar  │    │ Active Viewport                      │ │
│  │ ───────────────────── │    │ ──────────────────────────────────── │ │
│  │ • BIO 101 (Cell Bio)  │    │ [Tab 1: Syllabus Ingestion & Matrix] │ │
│  │ • CS 200 (Algorithms) │    │   - PDF / Image / Text Dropzone      │ │
│  │ • LIT 304 (Modernism) │    │   - Quick Test Syllabi Picker        │ │
│  │                       │    │   - Graded Deliverables Table        │ │
│  │ + Add Course          │    │ ──────────────────────────────────── │ │
│  │                       │    │ [Tab 2: Interactive Planning Deck]   │ │
│  │ Workload Summary:     │    │   - 3-Question Guided Strategy       │ │
│  │ • Total: 24 Graded    │    │   - Generated Weekly Study Blocks    │ │
│  │ • Next Due: 3 Days    │    │ ──────────────────────────────────── │ │
│  │                       │    │ [Tab 3: Workload Heatmap & Sick Tool]│ │
│  │                       │    │   - Conflict & Exam Clashes          │ │
│  │                       │    │   - "I was sick" Plan Rebalance      │ │
│  │                       │    │ ──────────────────────────────────── │ │
│  │                       │    │ [Tab 4: Calendar & Daily Focus]      │ │
│  │                       │    │   - 1-Click Google Calendar Links    │ │
│  │                       │    │   - Download plan.ics                │ │
│  └───────────────────────┘    └──────────────────────────────────────┘ │
│                                                                        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       HTTP /api/parse-syllabus
                       HTTP /api/rebalance-plan
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               Express Server (server.ts / Vite Middleware)             │
│   - @google/genai (model: gemini-3.8-flash, structured responseSchema) │
│   - Multimodal PDF / Image / Text Syllabus Extractor                   │
│   - Intelligent Study Hour & Milestone Allocator                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Model & Key Types

- **`Course`**: `id`, `name`, `code`, `instructor`, `term`, `color`, `rawSyllabusText`, `syllabusFileName`, `deliverables: Deliverable[]`, `studyPlan: StudyPlan | null`.
- **`Deliverable`**: `id`, `title`, `type` (`"exam" | "midterm" | "quiz" | "essay" | "project" | "homework"`), `dueDate` (`YYYY-MM-DD`), `weightPercent` (`number`), `description`, `topics: string[]`, `isCompleted: boolean`.
- **`StudyBlock`**: `id`, `courseId`, `deliverableId`, `title`, `date` (`YYYY-MM-DD`), `durationHours`, `objective`, `status` (`"scheduled" | "completed" | "shifted"`), `timeOfDay` (`"morning" | "afternoon" | "evening"`).
- **`PlanningPreferences`**: `weeklyHours`, `preferredDays: string[]`, `bufferDaysBeforeExams`, `targetGradeIntensity`.

### Interactive Component & State Mapping

- **Syllabus Dropzone & Parser**: Supports drag-and-drop file upload (`.pdf`, `.png`, `.jpg`, `.txt`) and text paste. When triggered, makes a POST request to `/api/parse-syllabus` with base64 data.
- **Deliverables Table Editor**: Interactive table with inline cell editing, item addition/deletion, type badge styling, and automatic percentage weight sum validation (with notice if totals do not equal 100%).
- **Interactive Planner Deck**: Questions rendered as responsive cards. Changing answers recalculates study sprint blocks in real time with smooth animations.
- **Adaptive Reschedule ("Sick Day" Rebalancer)**: An interactive prompt where students can input days missed (e.g. 3 days), select the affected dates, and click "Rebalance Schedule" to redistribute uncompleted hours into future open slots.
- **Calendar & Export Deck**:
  - `make_ics()` utility compiles all study blocks and deliverables into RFC 5545 `.ics` format and triggers instant browser download as `SyllabusPilot_Schedule.ics`.
  - Individual and bulk "Add to Google Calendar" buttons generate direct `calendar.google.com` links.

---

## 5. Verification & Testing Plan

1. **Build & Lint Verification**:
   - Verify TypeScript compilation via `npm run lint` (`tsc --noEmit`) and successful applet build via `compile_applet`.
2. **Multimodal Syllabus Extraction Test**:
   - Test PDF parsing, photo slide parsing, and messy plain text parsing via server API endpoints.
3. **Multi-Course Workload Heatmap Verification**:
   - Verify that adding multiple courses accurately detects overlapping exam weeks and displays high-density warnings.
4. **Reschedule & Rebalance Test**:
   - Verify that triggering the "I was sick for 3 days" handler shifts study blocks without deleting deliverables or breaking calendar dates.
5. **Calendar Export Accuracy**:
   - Verify the generated `.ics` syntax (valid `BEGIN:VCALENDAR`, `BEGIN:VEVENT`, RFC date formats `YYYYMMDDTHHMMSSZ`) and test Google Calendar web link URLs.
