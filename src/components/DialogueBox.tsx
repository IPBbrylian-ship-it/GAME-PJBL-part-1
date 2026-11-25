import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ControlMode, DialogueLine } from '../types/game';

interface DialogueBoxProps {
  lines: DialogueLine[];
  controlMode?: ControlMode;
  onTypeBlip: (index: number) => void;
  onAudioCue: (cue: NonNullable<DialogueLine['cue']>) => void;
  onComplete: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  lines,
  controlMode = 'pc',
  onTypeBlip,
  onAudioCue,
  onComplete,
}) => {
  const [lineIdx, setLineIdx] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const firedCueRef = useRef<number>(-1);

  const currentLine = lines[lineIdx];
  const fullText = currentLine?.text ?? '';
  const isTyping = charCount < fullText.length;

  useEffect(() => {
    setLineIdx(0);
    setCharCount(0);
    firedCueRef.current = -1;
  }, [lines]);

  useEffect(() => {
    if (!currentLine) return;
    if (currentLine.cue && firedCueRef.current !== lineIdx) {
      firedCueRef.current = lineIdx;
      onAudioCue(currentLine.cue);
    }
  }, [currentLine, lineIdx, onAudioCue]);

  useEffect(() => {
    if (!isTyping) return;
    const timer = window.setTimeout(() => {
      setCharCount((prev) => {
        const next = prev + 1;
        if (next % 2 === 1) {
          onTypeBlip(next);
        }
        return next;
      });
    }, 24);
    return () => window.clearTimeout(timer);
  }, [charCount, isTyping, onTypeBlip]);

  const handleAdvance = useCallback(() => {
    if (!currentLine) {
      onComplete();
      return;
    }
    if (isTyping) {
      setCharCount(fullText.length);
      return;
    }
    if (lineIdx + 1 < lines.length) {
      setLineIdx((prev) => prev + 1);
      setCharCount(0);
    } else {
      onComplete();
    }
  }, [currentLine, fullText.length, isTyping, lineIdx, lines.length, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        handleAdvance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleAdvance]);

  if (!currentLine) return null;

  const tapHint = controlMode === 'mobile' ? '[Ketuk Layar]' : '[Spasi / Klik]';

  return (
    <div
      onClick={handleAdvance}
      style={{ touchAction: 'manipulation' }}
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:p-4 md:p-7 cursor-pointer"
    >
      <div className="w-full max-w-3xl border border-[#4a5568]/80 bg-[#070b12]/94 px-5 py-4 sm:px-6 sm:py-5 shadow-2xl min-h-[48px]">
        {/* Speaker & Emotion Header (unboxed typographic separator, zero pills) */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#2d3748] pb-2 mb-3">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="font-serif-horror text-base md:text-lg font-bold tracking-wider text-[#d4a353]">
              {currentLine.speaker}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="font-typewriter text-xs text-[#8aa4b8]">
              {currentLine.emotion}
            </span>
          </div>
          <span className="font-typewriter text-[11px] tabular-nums text-slate-500">
            {lineIdx + 1} / {lines.length}
          </span>
        </div>

        {/* Typewriter Body */}
        <p className="font-typewriter text-sm md:text-base text-[#dce3ec] leading-relaxed min-h-[3.2rem]">
          {fullText.slice(0, charCount)}
          {isTyping && <span className="inline-block w-2 h-4 ml-1 bg-[#d4a353] align-middle" />}
        </p>

        {/* Prompt Hint */}
        <div className="mt-3 flex justify-end">
          <span className="font-typewriter text-[11px] tracking-wider text-[#9aa8b8]">
            {isTyping ? `${tapHint} Tampilkan penuh` : `${tapHint} Lanjutkan`}
          </span>
        </div>
      </div>
    </div>
  );
};
