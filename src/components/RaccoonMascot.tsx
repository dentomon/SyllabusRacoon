/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, X, MessageSquareHeart } from 'lucide-react';

export type MascotState = 'sleeping' | 'awake' | 'celebrating';

interface RaccoonMascotProps {
  isTaskActive?: boolean;
  celebrationTrigger?: number; // Increment this number to trigger celebration
}

const MOTIVATIONAL_MESSAGES = [
  "You've got this! One study sprint at a time.",
  "Spaced repetition beats cramming!",
  "25 minutes of deep focus = maximum retention.",
  "Your future self will thank you for studying today!",
  "Midterms don't stand a chance!",
];

export const RaccoonMascot: React.FC<RaccoonMascotProps> = ({
  isTaskActive = false,
  celebrationTrigger = 0,
}) => {
  const [state, setState] = useState<MascotState>('sleeping');
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [celebrateTimeout, setCelebrateTimeout] = useState<any>(null);

  // React to task active changes
  useEffect(() => {
    if (state === 'celebrating') return; // Don't interrupt celebration

    if (isTaskActive) {
      setState('awake');
      showBriefMessage("Task in progress! Let's lock in.");
    } else {
      setState('sleeping');
    }
  }, [isTaskActive]);

  // React to celebration trigger (e.g. task completed)
  useEffect(() => {
    if (celebrationTrigger > 0) {
      setState('celebrating');
      showBriefMessage("Awesome job! Milestone completed! 🎉");

      if (celebrateTimeout) clearTimeout(celebrateTimeout);
      const t = setTimeout(() => {
        setState(isTaskActive ? 'awake' : 'sleeping');
      }, 4000);
      setCelebrateTimeout(t);
    }
  }, [celebrationTrigger]);

  const showBriefMessage = (msg: string) => {
    setBubbleText(msg);
    setTimeout(() => {
      setBubbleText((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleMascotClick = () => {
    if (state === 'sleeping') {
      setState('awake');
      const randomMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      showBriefMessage(randomMsg);
      setTimeout(() => {
        if (!isTaskActive) setState('sleeping');
      }, 4000);
    } else if (state === 'awake') {
      setState('celebrating');
      showBriefMessage("Keep crushing your goals!");
      setTimeout(() => {
        setState(isTaskActive ? 'awake' : 'sleeping');
      }, 3000);
    } else {
      showBriefMessage("Party mode activated! 🚀");
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-white/95 hover:bg-white border border-slate-200/90 shadow-md hover:shadow-lg rounded-full px-3 py-2 transition-all text-slate-700 flex items-center gap-2 text-xs font-medium cursor-pointer"
        title="Show Bandit Study Companion"
      >
        <span className="text-base">🦝</span>
        <span className="text-xs text-slate-700 font-semibold pr-0.5">Bandit</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
      {/* Speech Bubble */}
      {bubbleText && (
        <div className="mb-2 max-w-[220px] bg-white text-slate-900 border border-slate-200 shadow-lg rounded-2xl rounded-br-xs px-3.5 py-2.5 text-xs font-medium leading-relaxed pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs text-slate-800 leading-snug">{bubbleText}</p>
        </div>
      )}

      {/* Main Mascot Container */}
      <div className="relative pointer-events-auto group">
        {/* Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-xs cursor-pointer"
          title="Minimize mascot"
          aria-label="Minimize mascot"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Mascot Card / Bubble */}
        <div
          onClick={handleMascotClick}
          className={`cursor-pointer transition-all duration-300 rounded-full p-2 shadow-lg backdrop-blur-xs flex items-center justify-center ${
            state === 'celebrating'
              ? 'bg-gradient-to-tr from-amber-100 via-rose-100 to-indigo-100 border-2 border-amber-300 scale-105 shadow-amber-200/50'
              : state === 'awake'
              ? 'bg-white border-2 border-indigo-200 hover:border-indigo-400'
              : 'bg-white/95 border border-slate-200/80 hover:border-slate-300'
          }`}
          title={`Bandit the Study Raccoon (${state}) · Click to interact!`}
        >
          {/* Animated SVG Raccoon Artwork */}
          <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px]">
            {/* Celebration Confetti Particles */}
            {state === 'celebrating' && (
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute -top-2 left-1 text-[11px] animate-bounce">✨</span>
                <span className="absolute -top-2.5 right-2 text-[12px] animate-pulse">🎉</span>
                <span className="absolute bottom-1 -left-2 text-[10px] animate-ping">⭐</span>
                <span className="absolute top-4 -right-2 text-[11px] animate-bounce">🎊</span>
              </div>
            )}

            {/* Sleeping Floating Z's */}
            {state === 'sleeping' && (
              <div className="absolute -top-2 right-0 flex flex-col items-end pointer-events-none text-indigo-400 font-mono font-bold leading-none">
                <span className="text-[10px] animate-pulse opacity-80" style={{ animationDuration: '2s' }}>Z</span>
                <span className="text-[8px] animate-pulse opacity-60 mr-1" style={{ animationDuration: '2.5s' }}>z</span>
              </div>
            )}

            <svg
              viewBox="0 0 100 100"
              className={`w-full h-full transition-transform duration-300 ${
                state === 'celebrating'
                  ? 'animate-bounce'
                  : state === 'awake'
                  ? 'hover:rotate-3'
                  : 'hover:scale-95'
              }`}
            >
              <defs>
                <radialGradient id="raccoonFur" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#78716C" />
                  <stop offset="85%" stopColor="#57534E" />
                  <stop offset="100%" stopColor="#44403C" />
                </radialGradient>
                <linearGradient id="banditMask" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#292524" />
                  <stop offset="50%" stopColor="#1C1917" />
                  <stop offset="100%" stopColor="#292524" />
                </linearGradient>
              </defs>

              {/* Raccoon Tail (Peeking out behind) */}
              <g className={state === 'celebrating' ? 'animate-pulse' : ''}>
                <path
                  d="M 22 72 C 10 70, 4 82, 10 92 C 16 98, 28 92, 28 80 Z"
                  fill="#57534E"
                />
                {/* Ring stripes on tail */}
                <path d="M 12 75 C 10 79, 13 83, 17 84" stroke="#292524" strokeWidth="3" fill="none" />
                <path d="M 10 86 C 12 90, 18 92, 22 90" stroke="#292524" strokeWidth="3" fill="none" />
              </g>

              {/* Ears */}
              {/* Left Ear */}
              <polygon points="26,38 34,14 48,28" fill="#57534E" />
              <polygon points="29,34 35,19 44,28" fill="#E7E5E4" />
              <polygon points="32,32 36,22 41,28" fill="#F43F5E" opacity="0.3" />

              {/* Right Ear */}
              <polygon points="74,38 66,14 52,28" fill="#57534E" />
              <polygon points="71,34 65,19 56,28" fill="#E7E5E4" />
              <polygon points="68,32 64,22 59,28" fill="#F43F5E" opacity="0.3" />

              {/* Head Base */}
              <ellipse cx="50" cy="52" rx="33" ry="29" fill="url(#raccoonFur)" />

              {/* White Cheek Tufts */}
              <path
                d="M 17 56 C 14 50, 24 45, 27 48 C 22 56, 28 64, 34 66 C 24 67, 18 62, 17 56 Z"
                fill="#FAFAF9"
              />
              <path
                d="M 83 56 C 86 50, 76 45, 73 48 C 78 56, 72 64, 66 66 C 76 67, 82 62, 83 56 Z"
                fill="#FAFAF9"
              />

              {/* Characteristic Raccoon Dark Mask */}
              <path
                d="M 23 48 C 28 42, 42 42, 50 47 C 58 42, 72 42, 77 48 C 80 54, 74 61, 62 61 C 56 61, 52 56, 50 56 C 48 56, 44 61, 38 61 C 26 61, 20 54, 23 48 Z"
                fill="url(#banditMask)"
              />

              {/* White forehead blaze / eyebrow patches */}
              <ellipse cx="37" cy="42" rx="3.5" ry="2" fill="#E7E5E4" opacity="0.8" />
              <ellipse cx="63" cy="42" rx="3.5" ry="2" fill="#E7E5E4" opacity="0.8" />
              <path d="M 49 32 L 51 32 L 50.5 44 L 49.5 44 Z" fill="#E7E5E4" opacity="0.6" />

              {/* Snout */}
              <ellipse cx="50" cy="62" rx="12" ry="9" fill="#FAFAF9" />

              {/* Nose */}
              <ellipse cx="50" cy="58.5" rx="3.5" ry="2.5" fill="#1C1917" />
              <circle cx="49" cy="57.8" r="0.8" fill="#FFFFFF" />

              {/* Mouth & Whiskers */}
              {state === 'celebrating' ? (
                // Happy open smiling mouth
                <path d="M 46 63 Q 50 69 54 63" stroke="#1C1917" strokeWidth="1.5" fill="#F43F5E" />
              ) : state === 'awake' ? (
                // Gentle content smile
                <path d="M 47 62.5 Q 50 65 53 62.5" stroke="#1C1917" strokeWidth="1.2" fill="none" />
              ) : (
                // Sleeping peaceful line
                <path d="M 47.5 62 Q 50 63.5 52.5 62" stroke="#44403C" strokeWidth="1.2" fill="none" />
              )}

              {/* Whiskers */}
              <line x1="34" y1="62" x2="22" y2="60" stroke="#E7E5E4" strokeWidth="1" opacity="0.7" />
              <line x1="34" y1="64" x2="21" y2="65" stroke="#E7E5E4" strokeWidth="1" opacity="0.7" />
              <line x1="66" y1="62" x2="78" y2="60" stroke="#E7E5E4" strokeWidth="1" opacity="0.7" />
              <line x1="66" y1="64" x2="79" y2="65" stroke="#E7E5E4" strokeWidth="1" opacity="0.7" />

              {/* Eyes by State */}
              {state === 'sleeping' ? (
                // Closed sleeping crescent eyes: ◠ ◠
                <g stroke="#E7E5E4" strokeWidth="2.2" strokeLinecap="round" fill="none">
                  <path d="M 33 50 Q 37 46 41 50" />
                  <path d="M 59 50 Q 63 46 67 50" />
                </g>
              ) : state === 'awake' ? (
                // Awake, attentive sparkly eyes
                <g>
                  {/* Left Eye */}
                  <ellipse cx="37" cy="49" rx="4.5" ry="5.5" fill="#1C1917" />
                  <circle cx="36" cy="47.5" r="1.6" fill="#FFFFFF" />
                  <circle cx="39" cy="51" r="0.8" fill="#FFFFFF" />
                  {/* Right Eye */}
                  <ellipse cx="63" cy="49" rx="4.5" ry="5.5" fill="#1C1917" />
                  <circle cx="62" cy="47.5" r="1.6" fill="#FFFFFF" />
                  <circle cx="65" cy="51" r="0.8" fill="#FFFFFF" />
                </g>
              ) : (
                // Celebrating happy arched eyes: ^ ^
                <g stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" fill="none">
                  <path d="M 33 51 L 37 47 L 41 51" />
                  <path d="M 59 51 L 63 47 L 67 51" />
                  {/* Rosy blush cheeks */}
                  <ellipse cx="30" cy="57" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
                  <ellipse cx="70" cy="57" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
                </g>
              )}

              {/* Cute Paws */}
              {state === 'celebrating' ? (
                // Paws up in the air!
                <g fill="#292524">
                  <ellipse cx="22" cy="38" rx="4.5" ry="6" transform="rotate(-20 22 38)" />
                  <ellipse cx="78" cy="38" rx="4.5" ry="6" transform="rotate(20 78 38)" />
                </g>
              ) : state === 'awake' ? (
                // Paws holding a small yellow study pencil
                <g>
                  <rect x="36" y="73" width="28" height="5" rx="2" fill="#F59E0B" transform="rotate(-8 50 75)" />
                  <polygon points="63,71 67,73 63,75" fill="#F87171" transform="rotate(-8 50 75)" />
                  <ellipse cx="40" cy="74" rx="4" ry="4" fill="#292524" />
                  <ellipse cx="60" cy="74" rx="4" ry="4" fill="#292524" />
                </g>
              ) : (
                // Sleeping paws resting peacefully
                <g fill="#292524">
                  <ellipse cx="42" cy="76" rx="5" ry="4" />
                  <ellipse cx="58" cy="76" rx="5" ry="4" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Mascot Name Badge & Status Pill */}
        <div className="flex items-center justify-center gap-1.5 mt-1 bg-white/90 border border-slate-200/90 shadow-xs px-2.5 py-0.5 rounded-full text-[11px] font-medium text-slate-700">
          <span className="font-semibold text-slate-900">Bandit</span>
          <span className="text-slate-300">·</span>
          <span className="capitalize text-slate-500 font-mono text-[10px]">
            {state === 'sleeping' ? 'sleeping 💤' : state === 'awake' ? 'studying 📖' : 'celebrating 🎉'}
          </span>
        </div>
      </div>
    </div>
  );
};
