import React, { useState } from 'react';
import { ClipboardCheck, Copy, RotateCcw, Download } from 'lucide-react';
import {
  CONSTITUTIONAL_MAPPINGS,
  ENDINGS,
  EndingType,
  MirrorResponseRecord,
} from '../types/game';

interface EndingModalProps {
  respondentName: string;
  awarenessScore: number;
  frostLevel: number;
  collectedFragments: number;
  responses: MirrorResponseRecord[];
  onRestart: () => void;
  onDownloadStandalone: () => void;
}

export const EndingModal: React.FC<EndingModalProps> = ({
  respondentName,
  awarenessScore,
  frostLevel,
  collectedFragments,
  responses,
  onRestart,
  onDownloadStandalone,
}) => {
  const [copied, setCopied] = useState(false);

  const clampedScore = Math.max(0, Math.min(100, Math.round(awarenessScore)));
  const endingType: EndingType = clampedScore >= 75 ? 'true' : clampedScore >= 45 ? 'neutral' : 'bad';
  const ending = ENDINGS[endingType];

  const categoryLabel =
    clampedScore >= 75
      ? 'Tinggi (Sadar Konstitusi & Berpihak pada Korban)'
      : clampedScore >= 45
        ? 'Sedang (Parsial / Masih Rentan Pendekatan Seremonial)'
        : 'Rendah (Normalisasi Pembiaran & Menyalahkan Korban)';

  const handleCopyClipboard = async () => {
    const lines = [
      '=== ARSIP EVALUASI RISET PjBL KEWARGANEGARAAN ===',
      'Judul Karya: SHATTERED MEMORIES: SUDUT BEKU RINDIANI',
      `Responden: ${respondentName.trim() || 'Anonim'}`,
      `Ending Tercapai: ${ending.title} (${ending.type.toUpperCase()})`,
      `Indeks Kesadaran Konstitusional & Empati: ${clampedScore}%`,
      `Kategori Kesadaran: ${categoryLabel}`,
      `Tingkat Kebekuan Trauma Akhir: ${Math.round(frostLevel * 100)}%`,
      `Fragmen Memori Terkumpul: ${collectedFragments}/6`,
      'Pilar Perlindungan Babak IV: 4/4 Aktif',
      '',
      'Rekam Jawaban Cermin Psikologis:',
      ...responses.map(
        (r, i) => `  ${i + 1}. ${r.betweenLabel} -> [${r.tag}] (${r.chosenLabel})`
      ),
      '',
      'Pemetaan Pancasila & UUD NRI 1945:',
      ...CONSTITUTIONAL_MAPPINGS.map(
        (m) => `  - ${m.pillar} | ${m.pancasilaRef} | ${m.uudRef}`
      ),
      '================================================',
    ].join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = lines;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 md:p-6 bg-[#02050a]/95 overflow-y-auto touch-pan-y">
      <div className="w-full max-w-3xl border border-[#475261] bg-[#0b1017] p-6 md:p-8 shadow-2xl my-auto space-y-6">
        {/* Archive Header */}
        <div className="space-y-2 border-b border-[#252e3a] pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-typewriter text-xs">
            <span style={{ color: ending.accentColor }}>{ending.subtitle}</span>
            <span className="text-[#8aa4b8]">{ending.badgeText}</span>
          </div>

          <h1 className="font-serif-horror text-2xl md:text-3xl font-bold text-[#e2e8f0] leading-tight pt-1">
            {ending.title}
          </h1>

          <p className="font-typewriter text-xs md:text-sm text-[#cbd5e1] leading-relaxed">
            {ending.narrative}
          </p>
        </div>

        {/* Explicit Pancasila & UUD NRI 1945 Constitutional Synthesis (Reserved for Ending) */}
        <div className="space-y-3 border-b border-[#252e3a] pb-5">
          <div className="font-serif-horror text-sm md:text-base font-bold text-[#d4a353] tracking-wider">
            TINJAUAN PANCASILA &amp; UUD NRI 1945
          </div>
          <p className="font-typewriter text-xs text-[#dce3ec] leading-relaxed bg-[#070b11] border border-[#26303d] p-3.5">
            {ending.constitutionalSynthesis}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-typewriter">
            {CONSTITUTIONAL_MAPPINGS.map((m) => (
              <div key={m.pillar} className="border border-[#26303d] bg-[#080c13] p-3 space-y-1">
                <div className="text-[#e2e8f0] font-semibold">{m.pillar}</div>
                <div className="text-[#d4a353] text-[11px]">{m.pancasilaRef}</div>
                <div className="text-[#78a9c4] text-[11px]">{m.uudRef}</div>
                <p className="text-[#9aa8b8] text-[11px] leading-snug pt-0.5">{m.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Investigation Archive Quantitative Data Recap */}
        <div className="border border-[#374151] bg-[#070b11] p-4 md:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 font-typewriter text-xs border-b border-[#222b36] pb-2">
            <span className="text-[#d4a353] font-semibold">
              REKAP DATA RISET PjBL · RESPONDEN: {respondentName.trim() || 'ANONIM'}
            </span>
            <span className="text-[#8aa4b8] tabular-nums">
              Fragmen: {collectedFragments}/6 · Pilar: 4/4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-typewriter">
            <div className="border border-[#242e3b] bg-[#0b1018] p-3">
              <div className="text-[10px] text-[#8aa4b8]">INDEKS KESADARAN &amp; EMPATI</div>
              <div
                className="text-3xl font-bold tabular-nums mt-1"
                style={{ color: ending.accentColor }}
              >
                {clampedScore}%
              </div>
            </div>

            <div className="border border-[#242e3b] bg-[#0b1018] p-3">
              <div className="text-[10px] text-[#8aa4b8]">KEBEKUAN TRAUMA AKHIR</div>
              <div className="text-3xl font-bold tabular-nums text-[#78a9c4] mt-1">
                {Math.round(frostLevel * 100)}%
              </div>
            </div>

            <div className="border border-[#242e3b] bg-[#0b1018] p-3">
              <div className="text-[10px] text-[#8aa4b8]">KLASIFIKASI</div>
              <div className="text-xs text-[#dce3ec] mt-1.5 leading-snug">{categoryLabel}</div>
            </div>
          </div>

          <div className="space-y-1.5 font-typewriter text-xs">
            {responses.map((r, i) => (
              <div
                key={r.questionId}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2430] py-1.5"
              >
                <span className="text-[#cbd5e1]">
                  Cermin {i + 1}: {r.chosenLabel}
                </span>
                <span className="text-[11px] text-[#d4a353]">{r.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-typewriter">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="min-h-[48px] flex items-center gap-2 px-5 py-3 bg-[#d4a353] hover:bg-[#e0b467] text-[#090d14] font-bold text-xs md:text-sm cursor-pointer transition-colors"
            >
              {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Data Tersalin ke Clipboard!' : 'Salin Data ke Clipboard'}</span>
            </button>

            <button
              type="button"
              onClick={onDownloadStandalone}
              className="min-h-[48px] flex items-center gap-2 px-4 py-3 border border-[#475261] bg-[#0f1620] hover:border-[#78a9c4] text-[#9fc2db] text-xs cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh 1-File HTML</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="min-h-[48px] flex items-center gap-2 px-5 py-3 border border-[#475261] bg-[#0f1620] hover:border-[#d4a353] text-[#e2e8f0] text-xs md:text-sm cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulangi Selam Batin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
