import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Pause,
  EyeOff,
  ShieldAlert,
  Gamepad2,
  Monitor,
  Smartphone,
  RotateCw,
  X,
} from 'lucide-react';
import { ControlMode, HudSnapshot, LAYER_METAS } from '../types/game';

interface GameHUDProps {
  hud: HudSnapshot;
  muted: boolean;
  controlMode: ControlMode;
  onToggleControlMode: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  muted,
  controlMode,
  onToggleControlMode,
  onToggleMute,
  onPause,
}) => {
  const [isPortrait, setIsPortrait] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const [dismissedPortraitHint, setDismissedPortraitHint] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const meta = LAYER_METAS[hud.layerIndex];
  const dangerRatio = Math.max(0, Math.min(1, 1 - (hud.threatDistance - 2.0) / 11));
  const lanternReady = hud.lanternCooldown <= 0.01;
  const crackLevel = Math.max(0, hud.maxStability - hud.stability);
  const isMobile = controlMode === 'mobile';

  const statusBarsBlock = (
    <div className={`${isMobile ? 'w-44 sm:w-52 space-y-1.5' : 'w-56 space-y-2.5'}`}>
      <div>
        <div className="flex items-center justify-between font-typewriter text-[10px] tracking-widest text-[#9aa8b8] mb-0.5">
          <span>KEHANGATAN</span>
          <span className="tabular-nums">{hud.warmth}%</span>
        </div>
        <div className="h-[3px] w-full bg-[#1e2631]">
          <div
            className="h-full transition-[width] duration-150"
            style={{
              width: `${hud.warmth}%`,
              backgroundColor: hud.warmth > 50 ? '#78a9c4' : '#c25959',
            }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between font-typewriter text-[10px] tracking-widest text-[#9aa8b8] mb-0.5">
          <span>{isMobile ? 'NAPAS' : 'NAPAS [SHIFT]'}</span>
          <span className="tabular-nums">{hud.stamina}%</span>
        </div>
        <div className="h-[3px] w-full bg-[#1e2631]">
          <div
            className="h-full bg-[#9fb8cc] transition-[width] duration-100"
            style={{ width: `${hud.stamina}%` }}
          />
        </div>
      </div>

      {!isMobile && (
        <div>
          <div className="flex items-center justify-between font-typewriter text-[10px] tracking-widest mb-0.5">
            <span className={lanternReady ? 'text-[#d4a353]' : 'text-[#64748b]'}>LENTERA [F]</span>
            <span className="tabular-nums text-[#d4a353]">
              {lanternReady ? 'SIAP' : 'MENGISI'}
            </span>
          </div>
          <div className="h-[3px] w-full bg-[#1e2631]">
            <div
              className="h-full bg-[#d4a353] transition-[width] duration-100"
              style={{ width: `${Math.round((1 - hud.lanternCooldown) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[14] pointer-events-none select-none overflow-hidden">
      {/* Dynamic Freezing & Threat Vignette (pure radial gradient, no backdrop-filter) */}
      <div
        className="frost-vignette absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 46%, rgba(${
            dangerRatio > 0.35 ? '138, 28, 28' : '12, 54, 78'
          }, ${Math.min(0.75, 0.22 + hud.frostLevel * 0.28 + dangerRatio * 0.36)}) 100%)`,
        }}
      />

      {/* Jumpscare Red/Blue Strobe Overlay */}
      {hud.strobePhase !== 'none' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor:
              hud.strobePhase === 'red' ? 'rgba(220, 38, 38, 0.28)' : 'rgba(37, 99, 235, 0.28)',
          }}
        />
      )}

      {/* Permanent Progressive Screen-Edge Glass / Ice Cracks (1–4 hits) */}
      {crackLevel > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <g stroke="rgba(186, 230, 253, 0.65)" strokeWidth={1.6 + crackLevel * 0.35} fill="none">
            <polyline points="0,0 74,48 118,38 175,92 162,135" />
            <polyline points="74,48 52,102 96,144" />
            <polyline points="118,38 158,14 215,24" />
          </g>
          {crackLevel >= 2 && (
            <g stroke="rgba(186, 230, 253, 0.72)" strokeWidth={1.8 + crackLevel * 0.35} fill="none">
              <polyline points="1000,600 912,535 865,552 805,488 818,438" />
              <polyline points="912,535 942,468 896,422" />
              <polyline points="865,552 818,582 758,568" />
            </g>
          )}
          {crackLevel >= 3 && (
            <g stroke="rgba(224, 242, 254, 0.78)" strokeWidth={2.0 + crackLevel * 0.35} fill="none">
              <polyline points="1000,0 915,62 855,48 795,112 814,172" />
              <polyline points="915,62 948,132 895,184" />
              <polyline points="855,48 802,18 738,34" />
            </g>
          )}
          {crackLevel >= 4 && (
            <g stroke="rgba(248, 113, 113, 0.78)" strokeWidth="2.5" fill="none">
              <polyline points="0,600 95,522 148,540 218,475 204,412" />
              <polyline points="95,522 65,442 125,388" />
              <polyline points="175,92 248,142 292,126" />
              <polyline points="805,488 738,442 695,460" />
            </g>
          )}
        </svg>
      )}

      {/* Portrait Orientation Suggestion Banner (Mobile Mode Only) */}
      {isMobile && isPortrait && !dismissedPortraitHint && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] pointer-events-auto">
          <div className="flex items-center gap-2 border border-[#78a9c4]/55 bg-[#070d17]/92 px-3 py-1.5 text-[10px] font-typewriter text-[#cbd5e1] shadow-lg">
            <RotateCw className="w-3.5 h-3.5 text-[#d4a353] shrink-0" />
            <span>Putar perangkat ke posisi Landscape untuk pengalaman terbaik</span>
            <button
              type="button"
              onClick={() => setDismissedPortraitHint(true)}
              aria-label="Tutup saran landscape"
              className="p-1 text-[#8aa4b8] hover:text-[#e2e8f0] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Top Row: Stability Crystal + Archive Paper Note (Left) & Controls (Right) */}
      <div className="relative flex items-start justify-between p-3 sm:p-4 md:p-6 gap-3">
        <div className={`space-y-2 ${isMobile ? 'max-w-[205px] sm:max-w-xs' : 'max-w-xs md:max-w-sm'}`}>
          {/* 5-Segment Mirror/Crystal Inner Stability HUD */}
          <div className="border border-[#475569]/80 bg-[#080d16]/90 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-lg">
            <div className="flex items-center justify-between gap-2 font-typewriter text-[9px] sm:text-[10px] tracking-widest">
              <span className="text-[#cbd5e1] truncate">KESTABILAN BATIN</span>
              <span
                className="tabular-nums font-bold shrink-0"
                style={{ color: hud.stability <= 1 ? '#f87171' : '#78a9c4' }}
              >
                {hud.stability}/{hud.maxStability}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mt-1.5">
              {Array.from({ length: hud.maxStability }).map((_, i) => {
                const intact = i < hud.stability;
                return (
                  <div
                    key={i}
                    className="h-2 sm:h-2.5 border transition-colors duration-200"
                    style={{
                      borderColor: intact
                        ? hud.stability <= 1
                          ? '#f87171'
                          : '#78a9c4'
                        : '#334155',
                      backgroundColor: intact
                        ? hud.stability <= 1
                          ? '#dc2626'
                          : '#38bdf8'
                        : 'rgba(15, 23, 42, 0.7)',
                      clipPath: 'polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%)',
                    }}
                  />
                );
              })}
            </div>
            {hud.graceTimer > 0 && (
              <div className="flex items-center gap-1.5 font-typewriter text-[9px] sm:text-[10px] text-[#d4a353] mt-1.5">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                <span>JEDA AMAN · {hud.graceTimer.toFixed(1)}d</span>
              </div>
            )}
          </div>

          {/* Torn/Faded Campus Archive Paper Scrap */}
          <div
            className="border border-[#464e59]/75 bg-[#151a21]/88 px-3 py-2 sm:px-4 sm:py-3 text-[#d6dde6] shadow-lg"
            style={{ transform: 'rotate(-0.6deg)' }}
          >
            <div className="flex items-center justify-between gap-2 font-typewriter text-[10px] sm:text-[11px] text-[#8aa4b8] border-b border-[#2b3440] pb-1">
              <span className="truncate">{meta.roman} · {meta.era}</span>
              <span className="tabular-nums text-[#d4a353] font-semibold shrink-0">
                {hud.collectedCount}/{hud.totalTargets}
              </span>
            </div>
            <div className="font-serif-horror text-xs sm:text-sm font-bold text-[#e2e8f0] mt-1 tracking-wide">
              {meta.title}
            </div>
            <p className="font-typewriter text-[10px] sm:text-[11px] leading-snug sm:leading-relaxed mt-1 text-[#9fb0c2]">
              {hud.exitUnlocked
                ? `Segel terbuka — menuju ${meta.exitLabel} ${isMobile ? '[AKSI]' : '[E]'}`
                : meta.ambientHint}
            </p>
          </div>

          {/* Mobile Mode: Place compact warmth & stamina bars under left note so bottom-left analog stick is unobstructed */}
          {isMobile && (
            <div className="bg-[#060b13]/75 border border-[#24303e]/75 px-2.5 py-2">
              {statusBarsBlock}
            </div>
          )}
        </div>

        {/* Top-Right: Control Mode Switcher + Speaker Mute/Unmute & Pause */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleControlMode();
              }}
              title={
                isMobile
                  ? 'Mode Kontrol: Mobile (Klik ganti ke PC)'
                  : 'Mode Kontrol: PC (Klik ganti ke Mobile)'
              }
              className="min-h-[42px] flex items-center gap-1.5 px-2.5 py-2 border border-[#3a4554] bg-[#070c14]/88 text-[#cbd5e1] text-[11px] font-typewriter hover:border-[#d4a353] cursor-pointer"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-[#d4a353]" />
              {isMobile ? (
                <Smartphone className="w-3.5 h-3.5 text-[#78a9c4]" />
              ) : (
                <Monitor className="w-3.5 h-3.5 text-[#78a9c4]" />
              )}
              <span className="hidden sm:inline">{isMobile ? 'Mobile' : 'PC'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              title={muted ? 'Aktifkan Suara' : 'Bisukan Suara'}
              className="min-h-[42px] min-w-[42px] flex items-center justify-center p-2 border border-[#3a4554] bg-[#070c14]/88 text-[#cbd5e1] hover:border-[#d4a353] cursor-pointer"
            >
              {muted ? (
                <VolumeX className="w-4 h-4 text-[#c25959]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#78a9c4]" />
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPause();
              }}
              title="Jeda (Esc)"
              className="min-h-[42px] flex items-center gap-1.5 px-3 py-2 border border-[#3a4554] bg-[#070c14]/88 text-[#cbd5e1] text-xs font-typewriter hover:border-[#d4a353] cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jeda</span>
            </button>
          </div>

          {!isMobile && (
            <div className="hidden sm:block font-typewriter text-[11px] text-[#8aa4b8] text-right leading-relaxed bg-[#050910]/65 px-2.5 py-1.5">
              <div>WASD Gerak · Shift Lari · F Lentera · E Aksi</div>
              <div className="text-[#64748b]">
                {hud.isPointerLocked
                  ? 'Mouse Terkunci · Esc Jeda'
                  : 'Klik layar / Geser mouse untuk menoleh'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Reticle & Diegetic Context Prompt */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
        {hud.isHiding ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 border border-[#4b5c6e] bg-[#050911]/90 text-[#9fc2db] text-xs font-typewriter">
            <EyeOff className="w-4 h-4" />
            <span>BERSEMBUNYI DALAM GELAP</span>
          </div>
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-[#dce3ec]/75" />
        )}

        {hud.promptText && (
          <div className="mt-6 px-4 py-2 border border-[#d4a353]/55 bg-[#060a12]/90 text-center max-w-xs sm:max-w-md">
            <div className="font-typewriter text-xs md:text-sm font-semibold text-[#e6c07b]">
              {isMobile ? hud.promptText.replace('[E]', '[Ketuk AKSI]') : hud.promptText}
            </div>
            {hud.promptSubtext && (
              <div className="font-typewriter text-[11px] text-[#9fb0c2] mt-0.5">
                {hud.promptSubtext}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom-Left (PC Mode Only): Thin Dimly Glowing Diegetic Indicators */}
      {!isMobile && <div className="absolute bottom-5 left-5 md:bottom-6 md:left-6">{statusBarsBlock}</div>}

      {/* Bottom-Right Subtle Frost Index (PC / Wide Tablet Only so Mobile thumb buttons stay clean) */}
      {!isMobile && (
        <div className="hidden md:flex absolute bottom-6 right-6 items-center gap-2 font-typewriter text-[11px] text-[#8aa4b8]">
          <span>TRAUMA BEKU</span>
          <span>·</span>
          <span className="tabular-nums text-[#cbd5e1]">{Math.round(hud.frostLevel * 100)}%</span>
        </div>
      )}
    </div>
  );
};
