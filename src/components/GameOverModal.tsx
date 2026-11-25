import React, { useState } from 'react';
import { ClipboardCheck, Copy, RotateCcw, Home, ShieldOff } from 'lucide-react';
import {
  CONSTITUTIONAL_MAPPINGS,
  LAYER_METAS,
  LayerIndex,
  MirrorResponseRecord,
} from '../types/game';

interface GameOverModalProps {
  respondentName: string;
  layerIndex: LayerIndex;
  awarenessScore: number;
  frostLevel: number;
  collectedFragments: number;
  jumpscareCount: number;
  responses: MirrorResponseRecord[];
  onRestart: () => void;
  onReturnToTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  respondentName,
  layerIndex,
  awarenessScore,
  frostLevel,
  collectedFragments,
  jumpscareCount,
  responses,
  onRestart,
  onReturnToTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const currentMeta = LAYER_METAS[layerIndex];

  const handleCopyEvaluation = async () => {
    const lines = [
      '=== DATA EVALUASI PjBL KEWARGANEGARAAN (GAME OVER) ===',
      'Judul Karya: SHATTERED MEMORIES: SUDUT BEKU RINDIANI',
      `Responden: ${respondentName.trim() || 'Anonim'}`,
      'Status Akhir: GAME OVER — BATIN RINDIANI TAK LAGI DAPAT DISELAMATKAN (Kestabilan 0/5)',
      `Terhenti Pada: ${currentMeta.roman} - ${currentMeta.title}`,
      `Total Hantaman Trauma (Jumpscare): ${jumpscareCount}/5`,
      `Indeks Kesadaran Terkumpul: ${Math.round(awarenessScore)}%`,
      `Tingkat Kebekuan Trauma: ${Math.round(frostLevel * 100)}%`,
      `Fragmen Memori Ditemukan: ${collectedFragments}/6`,
      '',
      'Rekam Refleksi Cermin Psikologis:',
      ...(responses.length > 0
        ? responses.map((r, i) => `  ${i + 1}. ${r.betweenLabel} -> [${r.tag}] (${r.chosenLabel})`)
        : ['  (Belum mencapai interlude Cermin Psikologis)']),
      '',
      'Kerangka Konstitusional PjBL:',
      ...CONSTITUTIONAL_MAPPINGS.map(
        (m) => `  - ${m.pillar} | ${m.pancasilaRef} | ${m.uudRef}`
      ),
      '======================================================',
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
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 md:p-6 bg-[#020409]/96 overflow-y-auto touch-pan-y">
      <div className="w-full max-w-2xl border border-[#7f1d1d] bg-[#0a0d14] p-6 md:p-8 shadow-2xl my-auto space-y-6">
        <div className="space-y-2 border-b border-[#2c191d] pb-4">
          <div className="flex items-center gap-2 font-typewriter text-xs tracking-widest text-[#f87171]">
            <ShieldOff className="w-4 h-4" />
            <span>KESTABILAN BATIN 0/5 · KEHANCURAN TOTAL</span>
          </div>
          <h1 className="font-serif-horror text-2xl md:text-3xl font-bold text-[#e2e8f0] leading-tight">
            GAME OVER: BATIN RINDIANI TAK LAGI DAPAT DISELAMATKAN
          </h1>
          <p className="font-typewriter text-xs md:text-sm text-[#cbd5e1] leading-relaxed">
            Kubah kaca membeku gelap dan menutup rapat suara Rindiani selamanya. Akumulasi trauma yang dibiarkan
            tanpa perlindungan, cemoohan sekitar, dan keterlambatan menjemput ruang aman menghancurkan sisa
            kepercayaan yang dimilikinya.
          </p>
        </div>

        {/* Impact Summary */}
        <div className="border border-[#2b3440] bg-[#070a10] p-4 space-y-3 font-typewriter text-xs">
          <div className="text-[#d4a353] font-semibold">
            RINGKASAN EVALUASI PjBL · {respondentName.trim() || 'ANONIM'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="border border-[#1f2937] bg-[#0b1018] p-2.5">
              <div className="text-[10px] text-[#8aa4b8]">LOKASI TERAKHIR</div>
              <div className="text-[#e2e8f0] font-semibold mt-0.5">{currentMeta.roman}</div>
            </div>
            <div className="border border-[#1f2937] bg-[#0b1018] p-2.5">
              <div className="text-[10px] text-[#8aa4b8]">KESTABILAN</div>
              <div className="text-[#f87171] font-bold mt-0.5 tabular-nums">0 / 5</div>
            </div>
            <div className="border border-[#1f2937] bg-[#0b1018] p-2.5">
              <div className="text-[10px] text-[#8aa4b8]">FRAGMEN</div>
              <div className="text-[#78a9c4] font-bold mt-0.5 tabular-nums">{collectedFragments}/6</div>
            </div>
            <div className="border border-[#1f2937] bg-[#0b1018] p-2.5">
              <div className="text-[10px] text-[#8aa4b8]">KESADARAN</div>
              <div className="text-[#d4a353] font-bold mt-0.5 tabular-nums">{Math.round(awarenessScore)}%</div>
            </div>
          </div>
          <p className="text-[11px] text-[#9aa8b8] leading-relaxed">
            Refleksi Kewarganegaraan: Saat lingkungan memilih bungkam dan membiarkan bayangan intimidasi terus
            mengejar korban, amanat kemanusiaan (Sila ke-2 Pancasila) dan hak atas rasa aman (Pasal 28G ayat (1)
            UUD NRI 1945) runtuh di hadapan pembiaran.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 font-typewriter">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onRestart}
              className="min-h-[48px] flex items-center gap-2 px-5 py-3 bg-[#d4a353] hover:bg-[#e0b467] text-[#090d14] font-bold text-xs md:text-sm cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI PERJALANAN</span>
            </button>

            <button
              type="button"
              onClick={handleCopyEvaluation}
              className="min-h-[48px] flex items-center gap-2 px-4 py-3 border border-[#475261] bg-[#0f1620] hover:border-[#78a9c4] text-[#9fc2db] text-xs cursor-pointer transition-colors"
            >
              {copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Data Evaluasi Tersalin!' : 'SALIN DATA EVALUASI PjBL'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onReturnToTitle}
            className="min-h-[48px] flex items-center gap-1.5 px-4 py-3 border border-[#334155] bg-[#0b1017] hover:border-[#d4a353] text-[#cbd5e1] text-xs cursor-pointer transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Layar Judul</span>
          </button>
        </div>
      </div>
    </div>
  );
};
