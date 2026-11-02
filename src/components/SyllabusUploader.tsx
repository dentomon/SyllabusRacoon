/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Course } from '../types';
import { SAMPLE_SYLLABI, SampleSyllabus } from '../data/sampleSyllabi';
import {
  UploadCloud,
  FileCheck,
  AlertCircle,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';

interface SyllabusUploaderProps {
  currentCourse: Course;
  onUpdateCourse: (updated: Course) => void;
  onNavigateToDeliverables: () => void;
  onParsingStateChange?: (isParsing: boolean) => void;
  onParseSuccess?: () => void;
}

export const SyllabusUploader: React.FC<SyllabusUploaderProps> = ({
  currentCourse,
  onUpdateCourse,
  onNavigateToDeliverables,
  onParsingStateChange,
  onParseSuccess,
}) => {
  const [syllabusText, setSyllabusText] = useState(currentCourse.syllabusRawText || '');
  const [fileName, setFileName] = useState(currentCourse.syllabusFileName || '');
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string | null>(null);
  const [showSamplesCard, setShowSamplesCard] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage(null);

    if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSyllabusText(text);
      };
      reader.readAsText(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Content = result.split(',')[1];
        setFileBase64(base64Content);
        setFileMimeType(file.type || 'application/pdf');
        setSyllabusText(`[Attached file: ${file.name} (${Math.round(file.size / 1024)} KB)]`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadSample = (sample: SampleSyllabus) => {
    setSyllabusText(sample.rawText);
    setFileName(`${sample.code}_syllabus.pdf`);
    setFileBase64(null);
    setFileMimeType(null);
    setErrorMessage(null);

    onUpdateCourse({
      ...currentCourse,
      name: sample.name,
      code: sample.code,
      instructor: sample.instructor,
      term: sample.term,
      color: sample.color,
      syllabusRawText: sample.rawText,
      syllabusFileName: `${sample.code}_syllabus.pdf`,
    });
  };

  const handleParseSyllabus = async () => {
    if (!syllabusText.trim() && !fileBase64) {
      setErrorMessage('Please paste your syllabus text or upload a PDF / slide photo.');
      return;
    }

    setIsParsing(true);
    onParsingStateChange?.(true);
    setErrorMessage(null);
    setParseStatus('Reading syllabus and extracting dates...');

    try {
      const payload: any = {
        text: syllabusText,
        referenceDate: '2026-11-02',
      };

      if (fileBase64 && fileMimeType) {
        payload.fileData = {
          base64: fileBase64,
          mimeType: fileMimeType,
        };
      }

      const res = await fetch('/api/parse-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error status ${res.status}`);
      }

      const result = await res.json();
      if (result.success && result.data) {
        const { courseName, courseCode, instructor, deliverables } = result.data;

        const updatedCourse: Course = {
          ...currentCourse,
          name: courseName || currentCourse.name,
          code: courseCode || currentCourse.code,
          instructor: instructor || currentCourse.instructor,
          syllabusRawText: syllabusText,
          syllabusFileName: fileName || 'Uploaded_Syllabus.pdf',
          deliverables: deliverables && deliverables.length > 0 ? deliverables : currentCourse.deliverables,
        };

        onUpdateCourse(updatedCourse);
        onParseSuccess?.();
        setParseStatus(`Found ${deliverables?.length || 0} deadlines! Opening deadlines...`);
        setTimeout(() => {
          setIsParsing(false);
          onParsingStateChange?.(false);
          onNavigateToDeliverables();
        }, 500);
      } else {
        throw new Error(result.error || 'Failed to extract syllabus data');
      }
    } catch (err: any) {
      console.error('Extraction failed:', err);
      setIsParsing(false);
      onParsingStateChange?.(false);
      setErrorMessage(
        err.message || 'Error communicating with parser. You can also view or add dates manually.'
      );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Friendly, Simple Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-5xl font-serif font-normal text-[#17191c] tracking-[-0.66px]">
          Upload or Paste <em className="italic font-normal text-indigo-600">Your Syllabus</em>
        </h1>
        <p className="text-[16px] text-slate-600">
          Upload any course syllabus (PDF, slide photo, or pasted email). SyllabusRacoon extracts all exam dates, essay deadlines, and percentage weights.
        </p>
      </div>

      {/* 3 Step Quick Guide Bar with Subtle Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200/80 rounded-[20px] text-[13px]">
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-full shadow-xs border border-indigo-100">
          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">1</span>
          <span className="font-medium text-slate-900">Upload syllabus file</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/70 rounded-full text-slate-600">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">2</span>
          <span>Review deadlines</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white/70 rounded-full text-slate-600">
          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">3</span>
          <span>Add to Google Cal</span>
        </div>
      </div>

      {/* 1-Click Samples Box with Cross (X) to Close */}
      {showSamplesCard ? (
        <div className="bg-gradient-to-br from-amber-50 via-orange-50/60 to-rose-50 border border-amber-200/90 rounded-[24px] p-6 sm:p-8 space-y-4 shadow-xs relative">
          {/* Close / Dismiss Cross (X) Button */}
          <button
            onClick={() => setShowSamplesCard(false)}
            className="absolute top-5 right-5 p-1.5 rounded-full text-amber-900/60 hover:text-amber-950 hover:bg-amber-200/50 transition-colors cursor-pointer"
            title="Dismiss test syllabi"
            aria-label="Close sample syllabi"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pr-8">
            <span className="text-[13px] text-amber-900 font-mono uppercase tracking-wider font-semibold">
              Quick 1-Click Test Syllabi
            </span>
            <span className="text-[13px] text-amber-800">
              Click any sample to load test data instantly
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_SYLLABI.map((sample) => {
              const borderAccent =
                sample.code === 'BIO 101'
                  ? 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50'
                  : sample.code === 'CS 200'
                  ? 'border-blue-300 hover:border-blue-500 hover:bg-blue-50/50'
                  : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50/50';

              return (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className={`text-left p-4 bg-white rounded-[16px] transition-all cursor-pointer group shadow-xs border ${borderAccent}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[15px] text-[#17191c]">
                      {sample.code}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sample.color }} />
                  </div>
                  <p className="text-[13px] text-slate-800 font-medium truncate mt-1">
                    {sample.name}
                  </p>
                  <p className="text-[12px] text-slate-500 line-clamp-1 mt-1">
                    {sample.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowSamplesCard(true)}
            className="text-[13px] text-amber-700 hover:text-amber-900 font-medium underline underline-offset-4 cursor-pointer"
          >
            + Show 1-click test syllabi (BIO 101, CS 200, LIT 304)
          </button>
        </div>
      )}

      {/* Main Ingestion Box (Upload or Paste) */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* File Upload Box */}
          <div className="md:col-span-5 space-y-3">
            <label className="text-[14px] font-medium text-[#17191c] block">
              File Upload (PDF or Slide Photo)
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-indigo-50/40 hover:bg-indigo-50/80 border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-[20px] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[200px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-xs mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-[14px] font-medium text-slate-900">
                Choose syllabus file
              </p>
              <p className="text-[12px] text-slate-500 mt-1">
                PDF, PNG, JPG, or TXT
              </p>
            </div>

            {fileName && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-full text-[13px] text-emerald-900">
                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate font-medium">{fileName}</span>
              </div>
            )}
          </div>

          {/* Paste Text Box */}
          <div className="md:col-span-7 space-y-3">
            <label htmlFor="syllabus-text" className="text-[14px] font-medium text-[#17191c] block">
              Or Paste Syllabus Text / Email
            </label>

            <textarea
              id="syllabus-text"
              rows={8}
              value={syllabusText}
              onChange={(e) => setSyllabusText(e.target.value)}
              placeholder="Paste schedule table, exam dates, grading breakdown here..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-[16px] text-[14px] text-slate-900 leading-relaxed resize-y focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-[14px] rounded-[16px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <span className="text-[13px] text-slate-500">
            Intelligent syllabus date & grade weight extractor
          </span>

          <button
            onClick={handleParseSyllabus}
            disabled={isParsing || (!syllabusText.trim() && !fileBase64)}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-[15px] font-medium rounded-full transition-all cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow-md"
          >
            <span>{isParsing ? parseStatus || 'Extracting...' : 'Find Dates & Deadlines'}</span>
            {!isParsing && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
