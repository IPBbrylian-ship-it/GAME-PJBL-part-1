import React from 'react';
import { MirrorOption, MirrorQuestion } from '../types/game';

interface MirrorModalProps {
  question: MirrorQuestion;
  currentFrostLevel: number;
  onSelect: (option: MirrorOption) => void;
}

export const MirrorModal: React.FC<MirrorModalProps> = ({
  question,
  currentFrostLevel,
  onSelect,
}) => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-6 bg-[#03060c]/95 overflow-y-auto touch-pan-y">
      {/* Cracked Mirror Background Lines */}
      <svg
        className="fixed inset-0 w-full h-full opacity-20 pointer-events-none"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <polyline points="600,0 565,240 620,410 540,620 595,800" fill="none" stroke="#78a9c4" strokeWidth="1.5" />
        <polyline points="565,240 310,165 120,210" fill="none" stroke="#78a9c4" strokeWidth="1" />
        <polyline points="620,410 910,335 1120,420" fill="none" stroke="#78a9c4" strokeWidth="1" />
        <polyline points="540,620 260,710" fill="none" stroke="#94a3b8" strokeWidth="0.9" />
      </svg>

      {/* Weathered Clinical Psychological Evaluation Dossier */}
      <div className="relative w-full max-w-2xl border border-[#475261] bg-[#0c1118] p-6 md:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 font-typewriter text-[11px] tracking-widest text-[#8aa4b8] border-b border-[#252e3a] pb-3">
          <span>{question.betweenLabel}</span>
          <span className="tabular-nums text-[#78a9c4]">
            Tingkat Kebekuan: {Math.round(currentFrostLevel * 100)}%
          </span>
        </div>

        <h2 className="font-serif-horror text-xl md:text-2xl font-bold text-[#e2e8f0] mt-5 tracking-wide">
          Lembar Evaluasi: Cermin Psikologis
        </h2>

        <p className="font-typewriter text-sm md:text-[15px] text-[#dce3ec] mt-3 leading-relaxed">
          {question.prompt}
        </p>

        <div className="mt-4 font-typewriter text-xs text-[#d4a353] border-y border-[#252e3a] py-2">
          {question.contextNote}
        </div>

        <div className="mt-5 space-y-3">
          {question.options.map((opt, idx) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt)}
              className="w-full min-h-[48px] text-left p-4 border border-[#2f3947] bg-[#080c12] hover:bg-[#111924] hover:border-[#d4a353] transition-colors cursor-pointer group"
            >
              <div className="font-serif-horror text-sm md:text-base font-semibold text-[#e2e8f0] group-hover:text-[#e6c07b]">
                {idx + 1}. {opt.label}
              </div>
              <p className="font-typewriter text-xs text-[#9aa8b8] mt-1.5 leading-relaxed">
                {opt.sublabel}
              </p>
            </button>
          ))}
        </div>

        <p className="font-typewriter text-[11px] text-[#758394] mt-5 text-center">
          Catatan klinis: Pilihan Anda mengubah ketebalan kabut, kecepatan bayangan, dan nasib Kubah Kaca.
        </p>
      </div>
    </div>
  );
};
