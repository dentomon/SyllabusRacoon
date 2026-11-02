/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI client if API key is provided
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Fallback regex parser for when Gemini API key is unavailable or in offline testing
 */
function heuristicParseSyllabus(text: string) {
  // Split by newlines or sentence boundaries
  const rawSegments = text.split(/\r?\n|(?<=[.!?])\s+(?=[A-Z0-9])/);
  const segments = rawSegments.map(s => s.trim()).filter(s => s.length > 0);

  let courseName = 'Principles of Biology';
  let courseCode = 'BIO 101';
  let instructor = 'Faculty Instructor';
  let term = 'Fall 2026';

  // Detect code and name
  for (const seg of segments) {
    const codeMatch = seg.match(/\b([A-Z]{2,4}\s*\d{3})\b/);
    if (codeMatch) {
      courseCode = codeMatch[1];
      const remainder = seg.replace(codeMatch[0], '').replace(/syllabus|course:?/gi, '').trim();
      if (remainder.length > 3) {
        courseName = remainder.replace(/^[-:,\s]+/, '').trim();
      }
    }
    const profMatch = seg.match(/(?:Prof\.|Dr\.|Instructor:)\s*([A-Za-z\s]+)/i);
    if (profMatch) {
      instructor = profMatch[1].trim();
    }
  }

  // Look for deliverables
  const deliverables: Array<{
    id: string;
    title: string;
    type: string;
    dueDate: string;
    weightPercent: number;
    description: string;
  }> = [];

  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    january: '01', february: '02', march: '03', april: '04', june: '06',
    july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
  };

  segments.forEach((seg, idx) => {
    const percentMatch = seg.match(/(\d{1,2})%/);
    const dateMatch = seg.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*(\d{4}))?/i);
    const lower = seg.toLowerCase();

    if (percentMatch || dateMatch || lower.includes('exam') || lower.includes('essay') || lower.includes('due') || lower.includes('midterm') || lower.includes('final')) {
      let weight = percentMatch ? parseInt(percentMatch[1], 10) : 15;
      let dueDate = '2026-11-20';

      if (dateMatch) {
        const monKey = dateMatch[1].toLowerCase().slice(0, 3);
        const m = months[monKey] || '11';
        const d = String(dateMatch[2]).padStart(2, '0');
        const y = dateMatch[3] || '2026';
        dueDate = `${y}-${m}-${d}`;
      }

      let type = 'homework';
      if (lower.includes('midterm')) type = 'midterm';
      else if (lower.includes('final')) type = 'final';
      else if (lower.includes('exam')) type = 'exam';
      else if (lower.includes('essay') || lower.includes('paper')) type = 'essay';
      else if (lower.includes('project')) type = 'project';
      else if (lower.includes('quiz')) type = 'quiz';
      else if (lower.includes('lab')) type = 'lab';

      let cleanTitle = seg
        .replace(/^[0-9-.*•\s]+/, '')
        .replace(/(\d{1,2})%/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[-:]\s*$/, '')
        .replace(/\bcounts?\b/gi, '')
        .trim();

      if (cleanTitle.length > 50) {
        cleanTitle = cleanTitle.slice(0, 50).trim();
      }

      if (cleanTitle.length >= 3 && !cleanTitle.toLowerCase().includes('grading scale')) {
        deliverables.push({
          id: `deliv-${idx}-${Date.now().toString(36)}`,
          title: cleanTitle,
          type,
          dueDate,
          weightPercent: weight,
          description: seg.trim(),
        });
      }
    }
  });

  return {
    courseName,
    courseCode,
    instructor,
    term,
    deliverables: deliverables.slice(0, 10),
  };
}

/**
 * POST /api/parse-syllabus
 * Ingests a syllabus (raw text or base64 PDF/image) and uses Gemini structured output
 */
app.post('/api/parse-syllabus', async (req: Request, res: Response) => {
  try {
    const { text, fileData, referenceDate } = req.body;

    if (!text && !fileData) {
      return res.status(400).json({ error: 'Please provide syllabus text or an uploaded file.' });
    }

    // If Gemini client is not initialized or fails, use intelligent heuristic fallback
    if (!ai) {
      console.log('Gemini API key not found in environment, using heuristic fallback parser');
      const fallbackResult = heuristicParseSyllabus(text || 'Course Syllabus');
      return res.json({
        success: true,
        data: fallbackResult,
        source: 'heuristic',
      });
    }

    const todayDate = referenceDate || '2026-11-02';
    const systemPrompt = `You are SyllabusPilot, an expert academic agent that parses university and college course syllabi into structured, actionable study data.
Given an unstructured syllabus (which may be a 12-page PDF, messy pasted text, broken email columns, or lecture slide notes):
1. Identify the Course Name, Course Code (e.g. "BIO 101"), Instructor, and Term.
2. Extract EVERY graded deliverable (midterms, final exams, essays, problem sets, quizzes, lab reports, projects).
3. For each deliverable, extract:
   - title: concise title
   - type: one of "exam", "midterm", "final", "quiz", "essay", "project", "homework", "lab", "presentation", "other"
   - dueDate: ISO format "YYYY-MM-DD". If the year is omitted, assume current academic year 2026. If a relative date is given (e.g., "Week 11"), calculate a realistic date relative to the term.
   - weightPercent: numerical percentage value (e.g., 25 for 25%).
   - description: brief note about page/location or coverage
   - topics: array of 2-4 core topics or chapters covered.
Today's reference date is ${todayDate}. Ensure all due dates are realistic.`;

    const contents: any[] = [];

    if (fileData && fileData.base64 && fileData.mimeType) {
      contents.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.base64,
        },
      });
    }

    if (text) {
      contents.push({
        text: `Here is the syllabus text to extract graded items from:\n\n${text}`,
      });
    } else {
      contents.push({
        text: 'Extract all course details and graded deliverables from the attached syllabus document.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contents },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseName: { type: Type.STRING },
            courseCode: { type: Type.STRING },
            instructor: { type: Type.STRING },
            term: { type: Type.STRING },
            deliverables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: {
                    type: Type.STRING,
                    enum: [
                      'exam',
                      'midterm',
                      'final',
                      'quiz',
                      'essay',
                      'project',
                      'homework',
                      'lab',
                      'presentation',
                      'other',
                    ],
                  },
                  dueDate: { type: Type.STRING, description: 'YYYY-MM-DD' },
                  weightPercent: { type: Type.NUMBER, description: 'e.g. 25' },
                  description: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['title', 'type', 'dueDate', 'weightPercent'],
              },
            },
          },
          required: ['courseName', 'courseCode', 'deliverables'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    // Ensure ids are present
    if (Array.isArray(parsedJson.deliverables)) {
      parsedJson.deliverables = parsedJson.deliverables.map((d: any, idx: number) => ({
        ...d,
        id: `deliv-${Date.now().toString(36)}-${idx}`,
      }));
    }

    return res.json({
      success: true,
      data: parsedJson,
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Error in /api/parse-syllabus:', err);
    // Graceful fallback so app always functions smoothly
    const fallback = heuristicParseSyllabus(req.body.text || '');
    return res.json({
      success: true,
      data: fallback,
      source: 'heuristic_fallback',
      warning: err.message,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite dev server or static file serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`SyllabusPilot server running on http://localhost:${PORT}`);
  });
}

startServer();
