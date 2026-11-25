import React, { useState } from 'react';
import { Volume2, VolumeX, Download, Monitor, Smartphone } from 'lucide-react';
import { ControlMode, DifficultyMode } from '../types/game';

interface TitleScreenProps {
  muted: boolean;
  difficulty: DifficultyMode;
  controlMode: ControlMode;
  respondentName: string;
  onChangeDifficulty: (mode: DifficultyMode) => void;
  onChangeControlMode: (mode: ControlMode) => void;
  onChangeRespondentName: (name: string) => void;
  onToggleMute: () => void;
  onStart: () => void;
  onDownloadStandalone: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  muted,
  difficulty,
  controlMode,
  respondentName,
  onChangeDifficulty,
  onChangeControlMode,
  onChangeRespondentName,
  onToggleMute,
  onStart,
  onDownloadStandalone,
}) => {
  const [activeSubPanel, setActiveSubPanel] = useState<'none' | 'controls' | 'about'>('none');

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-5 sm:p-6 md:p-10 overflow-y-auto touch-pan-y bg-gradient-to-r from-[#03060c]/92 via-[#050b14]/72 to-[#04080f]/35">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="font-typewriter text-[10px] sm:text-xs tracking-[0.16em] text-[#8aa4b8]">
          ARSIP MEMORI · KEWARGANEGARAAN PjBL
        </div>
        <button
          type="button"
          onClick={onToggleMute}
          className="min-h-[44px] flex items-center gap-2 px-3 py-2 border border-[#3d4959] bg-[#070d17]/90 text-[#cbd5e1] text-xs font-typewriter hover:border-[#d4a353] transition-colors cursor-pointer shrink-0"
        >
          {muted ? <VolumeX className="w-4 h-4 text-[#c25959]" /> : <Volume2 className="w-4 h-4 text-[#78a9c4]" />}
          <span>{muted ? 'Suara Mati' : 'Suara Aktif'}</span>
        </button>
      </div>

      {/* Main Title & Minimalist Analog Horror Menu */}
      <div className="max-w-xl my-auto py-4 space-y-5">
        <div className="space-y-2.5">
          {/* Cracked-Ice Serif Title SVG Lockup */}
          <svg
            viewBox="0 0 560 155"
            className="w-full max-w-[500px] h-auto overflow-visible"
            aria-label="Shattered Memories: Sudut Beku Rindiani"
          >
            <defs>
              <linearGradient id="frostTitle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="55%" stopColor="#93b4cc" />
                <stop offset="100%" stopColor="#5e7f99" />
              </linearGradient>
            </defs>

            <text
              x="2"
              y="24"
              fill="#8aa4b8"
              fontSize="12"
              letterSpacing="5"
              fontFamily="Courier New, monospace"
            >
              DOKUMEN PSIKOLOGIS · EMPAT BABAK INGATAN
            </text>

            <text
              x="0"
              y="72"
              fill="url(#frostTitle)"
              fontSize="38"
              fontWeight="700"
              letterSpacing="3"
              fontFamily="Cinzel, Georgia, serif"
            >
              SHATTERED MEMORIES
            </text>

            <polyline
              points="0,90 132,90 148,82 164,98 182,90 280,90 294,85 306,94 320,90 510,90"
              fill="none"
              stroke="#78a9c4"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />

            <text
              x="2"
              y="130"
              fill="#d4a353"
              fontSize="26"
              fontWeight="600"
              letterSpacing="4"
              fontFamily="Cinzel, Georgia, serif"
            >
              SUDUT BEKU RINDIANI
            </text>
          </svg>

          <p className="font-typewriter text-xs md:text-sm text-[#b6c2d1] leading-relaxed max-w-lg">
            Di sudut taman kampus yang membeku, Bima mencoba menembus tembok diam Rindiani.
            Setiap ingatan yang terkunci menyimpan luka yang terlalu lama dinormalisasi oleh lingkungan.
          </p>
        </div>

        {/* Optional Respondent Identity & Exploration Intensity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          <div className="space-y-1">
            <label htmlFor="respName" className="block font-typewriter text-[11px] text-[#8aa4b8]">
              Inisial / Nama Responden (Opsional)
            </label>
            <input
              id="respName"
              type="text"
              value={respondentName}
              onChange={(e) => onChangeRespondentName(e.target.value)}
              placeholder="Misal: Mahasiswa A / NIM"
              className="w-full min-h-[44px] px-3 py-2 border border-[#323d4d] bg-[#070d16]/90 text-xs font-typewriter text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#d4a353]"
            />
          </div>

          <div className="space-y-1">
            <span className="block font-typewriter text-[11px] text-[#8aa4b8]">
              Intensitas Eksplorasi
            </span>
            <div className="grid grid-cols-2 border border-[#323d4d] bg-[#070d16]/90">
              <button
                type="button"
                onClick={() => onChangeDifficulty('standard')}
                className={`min-h-[44px] py-2 text-xs font-typewriter cursor-pointer transition-colors ${
                  difficulty === 'standard'
                    ? 'bg-[#1a2636] text-[#d4a353] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standar
              </button>
              <button
                type="button"
                onClick={() => onChangeDifficulty('story')}
                className={`min-h-[44px] py-2 text-xs font-typewriter cursor-pointer transition-colors ${
                  difficulty === 'story'
                    ? 'bg-[#1a2636] text-[#78a9c4] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cerita Aman
              </button>
            </div>
          </div>
        </div>

        {/* Analog Horror Control Mode Selector */}
        <div className="max-w-lg space-y-1.5">
          <div className="flex items-center justify-between font-typewriter text-[11px] text-[#8aa4b8]">
            <span>MODE PERANGKAT KONTROL</span>
            <span className="text-[#78a9c4]">
              {controlMode === 'mobile' ? 'Touchscreen Aktif' : 'Keyboard & Mouse Aktif'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onChangeControlMode('pc')}
              className={`min-h-[54px] text-left px-3.5 py-2.5 border transition-colors cursor-pointer flex items-start gap-3 ${
                controlMode === 'pc'
                  ? 'border-[#d4a353] bg-[#131c28]/95 text-[#e2e8f0]'
                  : 'border-[#2f3947] bg-[#070c14]/88 text-[#94a3b8] hover:border-[#4b5c70]'
              }`}
            >
              <Monitor
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  controlMode === 'pc' ? 'text-[#d4a353]' : 'text-[#64748b]'
                }`}
              />
              <div className="font-typewriter">
                <div className="text-xs font-semibold tracking-wide">[MODE PC / LAPTOP]</div>
                <div className="text-[10px] text-[#8aa4b8] mt-0.5 leading-snug">
                  WASD/Panah, Mouse, Shift, E &amp; F
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onChangeControlMode('mobile')}
              className={`min-h-[54px] text-left px-3.5 py-2.5 border transition-colors cursor-pointer flex items-start gap-3 ${
                controlMode === 'mobile'
                  ? 'border-[#d4a353] bg-[#131c28]/95 text-[#e2e8f0]'
                  : 'border-[#2f3947] bg-[#070c14]/88 text-[#94a3b8] hover:border-[#4b5c70]'
              }`}
            >
              <Smartphone
                className={`w-4 h-4 mt-0.5 shrink-0 ${
                  controlMode === 'mobile' ? 'text-[#d4a353]' : 'text-[#64748b]'
                }`}
              />
              <div className="font-typewriter">
                <div className="text-xs font-semibold tracking-wide">[MODE MOBILE / SENTUH]</div>
                <div className="text-[10px] text-[#8aa4b8] mt-0.5 leading-snug">
                  Virtual Dual-Stick &amp; Tombol Layar Sentuh
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Primary Minimalist Menu */}
        <div className="flex flex-col items-start gap-2.5 pt-1">
          <button
            type="button"
            onClick={onStart}
            className="min-h-[48px] w-full sm:w-auto px-7 py-3 border border-[#d4a353] bg-[#d4a353] hover:bg-[#e0b467] text-[#090d14] font-serif-horror font-bold tracking-[0.15em] text-sm transition-colors cursor-pointer"
          >
            MULAI SELAM BATIN
          </button>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 font-typewriter text-xs">
            <button
              type="button"
              onClick={() =>
                setActiveSubPanel((prev) => (prev === 'controls' ? 'none' : 'controls'))
              }
              className={`min-h-[40px] hover:text-[#d4a353] cursor-pointer underline-offset-4 ${
                activeSubPanel === 'controls' ? 'text-[#d4a353] underline' : 'text-[#9aa8b8]'
              }`}
            >
              Panduan Kontrol
            </button>
            <button
              type="button"
              onClick={() =>
                setActiveSubPanel((prev) => (prev === 'about' ? 'none' : 'about'))
              }
              className={`min-h-[40px] hover:text-[#d4a353] cursor-pointer underline-offset-4 ${
                activeSubPanel === 'about' ? 'text-[#d4a353] underline' : 'text-[#9aa8b8]'
              }`}
            >
              Tentang Riset PjBL
            </button>
            <button
              type="button"
              onClick={onDownloadStandalone}
              className="min-h-[40px] flex items-center gap-1.5 text-[#78a9c4] hover:text-[#a6d0e8] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Versi 1-File HTML</span>
            </button>
          </div>
        </div>

        {/* Collapsible Sub-Panels */}
        {activeSubPanel === 'controls' && (
          <div className="border border-[#334155] bg-[#070d16]/94 p-4 font-typewriter text-xs text-[#cbd5e1] space-y-1.5 max-w-lg">
            <div className="text-[#d4a353] font-semibold">
              PANDUAN KONTROL ({controlMode === 'mobile' ? 'MOBILE / TOUCHSCREEN' : 'PC / LAPTOP'})
            </div>
            {controlMode === 'mobile' ? (
              <>
                <div>Analog Kiri : Bergerak (tarik penuh &gt;85% untuk lari otomatis)</div>
                <div>Area Layar Kanan : Geser jari untuk menoleh &amp; arahkan senter</div>
                <div>Tombol [AKSI] : Ambil Fragmen / Pilar / Sembunyi di Lemari</div>
                <div>Tombol [LENTERA] : Nyalakan Lentera pembeku bayangan sementara</div>
                <div>Tombol [LARI] : Aktif/nonaktifkan mode lari cepat</div>
                <div>Ketuk Layar : Lanjutkan percakapan pada Dialogue Box</div>
              </>
            ) : (
              <>
                <div>WASD / Panah : Bergerak menyusuri memori</div>
                <div>Mouse / Klik-Geser : Mengarahkan senter &amp; pandangan</div>
                <div>Shift : Berlari cepat (menggunakan stamina napas)</div>
                <div>F : Nyalakan Lentera untuk membekukan bayangan ancaman sementara</div>
                <div>E : Ambil Fragmen Memori / Aktifkan Pilar / Sembunyi di Lemari &amp; Loker</div>
                <div>Spasi / Klik : Lanjutkan percakapan pada Dialogue Box</div>
              </>
            )}
          </div>
        )}

        {activeSubPanel === 'about' && (
          <div className="border border-[#334155] bg-[#070d16]/94 p-4 font-typewriter text-xs text-[#cbd5e1] space-y-2 max-w-lg leading-relaxed">
            <div className="text-[#78a9c4] font-semibold">TENTANG RISET PjBL KEWARGANEGARAAN</div>
            <p>
              Permainan interaktif ini merupakan media analisis tingkat kesadaran mahasiswa terhadap
              normalisasi budaya pembiaran kekerasan seksual (<em>rape culture</em>) yang ditinjau
              dari nilai kemanusiaan dan keadilan konstitusional.
            </p>
            <p className="text-[#8aa4b8]">
              Di akhir perjalanan, jawaban Anda pada Cermin Psikologis akan dirangkum bersama
              pemetaan nilai Pancasila dan UUD NRI 1945 untuk disalin ke laporan penelitian.
            </p>
          </div>
        )}
      </div>

      {/* Quiet Bottom Control Hint Line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-typewriter text-[11px] text-[#8aa4b8] border-t border-[#232d3b] pt-3 shrink-0">
        {controlMode === 'mobile' ? (
          <>
            <span>Analog Kiri Gerak</span>
            <span>·</span>
            <span>Geser Kanan Kamera</span>
            <span>·</span>
            <span>Tombol AKSI / LENTERA / LARI</span>
            <span>·</span>
            <span>Ketuk Dialog</span>
          </>
        ) : (
          <>
            <span>WASD Bergerak</span>
            <span>·</span>
            <span>Mouse / Geser Lihat</span>
            <span>·</span>
            <span>Shift Lari</span>
            <span>·</span>
            <span>F Lentera</span>
            <span>·</span>
            <span>E Aksi / Sembunyi</span>
            <span>·</span>
            <span>Esc Jeda</span>
          </>
        )}
      </div>
    </div>
  );
};
