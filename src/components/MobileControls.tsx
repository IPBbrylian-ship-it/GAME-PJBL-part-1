import React, { useEffect, useRef, useState } from 'react';
import { EyeOff, Flame, Footprints, Hand } from 'lucide-react';
import { HudSnapshot } from '../types/game';

interface MobileControlsProps {
  hud: HudSnapshot;
  onJoystickMove: (x: number, y: number, autoSprint: boolean) => void;
  onTouchLook: (dx: number, dy: number) => void;
  onSprintChange: (active: boolean) => void;
  onInteract: () => void;
  onLantern: () => void;
}

const STICK_RADIUS = 60;
const AUTO_SPRINT_THRESHOLD = 0.85;
const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const MobileControls: React.FC<MobileControlsProps> = ({
  hud,
  onJoystickMove,
  onTouchLook,
  onSprintChange,
  onInteract,
  onLantern,
}) => {
  const stickZoneRef = useRef<HTMLDivElement | null>(null);
  const stickBaseRef = useRef<HTMLDivElement | null>(null);
  const camZoneRef = useRef<HTMLDivElement | null>(null);

  const leftTouchIdRef = useRef<number | null>(null);
  const camTouchIdRef = useRef<number | null>(null);
  const camLastPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [autoSprintActive, setAutoSprintActive] = useState(false);
  const [sprintToggled, setSprintToggled] = useState(false);

  const callbacksRef = useRef({
    onJoystickMove,
    onTouchLook,
    onSprintChange,
    onInteract,
    onLantern,
  });
  callbacksRef.current = {
    onJoystickMove,
    onTouchLook,
    onSprintChange,
    onInteract,
    onLantern,
  };

  // Multi-touch Left Virtual Analog Stick (with non-passive listeners)
  useEffect(() => {
    const zone = stickZoneRef.current;
    const base = stickBaseRef.current;
    if (!zone || !base) return;

    const updateFromTouch = (touch: Touch) => {
      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rawDx = touch.clientX - cx;
      const rawDy = touch.clientY - cy;
      const dist = Math.hypot(rawDx, rawDy);
      const clampedDist = Math.min(STICK_RADIUS, dist);
      const angle = Math.atan2(rawDy, rawDx);

      const kx = dist > 0.001 ? Math.cos(angle) * clampedDist : 0;
      const ky = dist > 0.001 ? Math.sin(angle) * clampedDist : 0;
      const normX = kx / STICK_RADIUS;
      const normY = -ky / STICK_RADIUS;
      const ratio = clampedDist / STICK_RADIUS;
      const autoSprint = ratio > AUTO_SPRINT_THRESHOLD;

      setKnobOffset({ x: kx, y: ky });
      setAutoSprintActive(autoSprint);
      callbacksRef.current.onJoystickMove(normX, normY, autoSprint);
    };

    const resetStick = () => {
      leftTouchIdRef.current = null;
      setKnobOffset({ x: 0, y: 0 });
      setAutoSprintActive(false);
      callbacksRef.current.onJoystickMove(0, 0, false);
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (leftTouchIdRef.current !== null) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      leftTouchIdRef.current = touch.identifier;
      updateFromTouch(touch);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (leftTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === leftTouchIdRef.current) {
          e.preventDefault();
          e.stopPropagation();
          updateFromTouch(t);
          break;
        }
      }
    };

    const onTouchEndOrCancel = (e: TouchEvent) => {
      if (leftTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === leftTouchIdRef.current) {
          e.preventDefault();
          e.stopPropagation();
          resetStick();
          break;
        }
      }
    };

    zone.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEndOrCancel, { passive: false });
    window.addEventListener('touchcancel', onTouchEndOrCancel, { passive: false });

    return () => {
      zone.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEndOrCancel);
      window.removeEventListener('touchcancel', onTouchEndOrCancel);
      resetStick();
    };
  }, []);

  // Multi-touch Camera Swipe Zone (independent touch identifier)
  useEffect(() => {
    const camZone = camZoneRef.current;
    if (!camZone) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (camTouchIdRef.current !== null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier !== leftTouchIdRef.current) {
          camTouchIdRef.current = t.identifier;
          camLastPosRef.current = { x: t.clientX, y: t.clientY };
          break;
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (camTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === camTouchIdRef.current) {
          e.preventDefault();
          const dx = t.clientX - camLastPosRef.current.x;
          const dy = t.clientY - camLastPosRef.current.y;
          camLastPosRef.current = { x: t.clientX, y: t.clientY };
          callbacksRef.current.onTouchLook(dx, dy);
          break;
        }
      }
    };

    const onTouchEndOrCancel = (e: TouchEvent) => {
      if (camTouchIdRef.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === camTouchIdRef.current) {
          e.preventDefault();
          camTouchIdRef.current = null;
          break;
        }
      }
    };

    camZone.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEndOrCancel, { passive: false });
    window.addEventListener('touchcancel', onTouchEndOrCancel, { passive: false });

    return () => {
      camZone.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEndOrCancel);
      window.removeEventListener('touchcancel', onTouchEndOrCancel);
    };
  }, []);

  const hasNearbyAction = Boolean(hud.promptText);
  const lanternReady = hud.lanternCooldown <= 0.01 && !hud.isHiding;
  const lanternProgress = Math.max(0, Math.min(1, 1 - hud.lanternCooldown));
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - lanternProgress);

  const handleToggleSprint = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();
    setSprintToggled((prev) => {
      const next = !prev;
      callbacksRef.current.onSprintChange(next);
      return next;
    });
  };

  const handleInteractTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();
    callbacksRef.current.onInteract();
  };

  const handleLanternTap = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
    if ('touches' in e) e.preventDefault();
    callbacksRef.current.onLantern();
  };

  const sprintingVisual = sprintToggled || autoSprintActive;

  return (
    <div className="fixed inset-0 z-[12] pointer-events-none select-none overflow-hidden">
      {/* Right & Open-Screen Touch Camera Drag Surface */}
      <div
        ref={camZoneRef}
        aria-label="Touch Camera Look Zone"
        className="absolute inset-0 pointer-events-auto"
        style={{ touchAction: 'none' }}
      />

      {/* Bottom-Left: Ergonomic Virtual Analog Stick (Outer Radius 60px, >85% Auto-Sprint) */}
      <div
        ref={stickZoneRef}
        className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 w-[156px] h-[156px] flex items-center justify-center pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <div
          ref={stickBaseRef}
          className="relative w-[120px] h-[120px] rounded-full border transition-colors duration-150 flex items-center justify-center"
          style={{
            borderColor: autoSprintActive
              ? 'rgba(212, 163, 83, 0.85)'
              : 'rgba(120, 169, 196, 0.42)',
            backgroundColor: 'rgba(6, 11, 19, 0.34)',
            boxShadow: autoSprintActive
              ? '0 0 18px rgba(212, 163, 83, 0.25) inset'
              : '0 0 14px rgba(120, 169, 196, 0.14) inset',
          }}
        >
          {/* Subtle analog crosshairs */}
          <div className="absolute w-px h-full bg-[#78a9c4]/15 pointer-events-none" />
          <div className="absolute h-px w-full bg-[#78a9c4]/15 pointer-events-none" />
          <div
            className="absolute -top-4 font-typewriter text-[9px] tracking-widest pointer-events-none"
            style={{ color: autoSprintActive ? '#d4a353' : 'rgba(138, 164, 184, 0.72)' }}
          >
            {autoSprintActive ? 'LARI OTOMATIS' : 'GERAK'}
          </div>

          {/* Inner Thumb Knob */}
          <div
            className="w-12 h-12 rounded-full border pointer-events-none transition-colors duration-100"
            style={{
              transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`,
              borderColor: autoSprintActive ? '#d4a353' : 'rgba(147, 197, 253, 0.78)',
              backgroundColor: autoSprintActive
                ? 'rgba(212, 163, 83, 0.32)'
                : 'rgba(18, 32, 48, 0.72)',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.22)',
            }}
          />
        </div>
      </div>

      {/* Bottom-Right: Thumb Action Buttons Cluster */}
      <div
        className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-end gap-3 pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        {/* [LARI / SPRINT] Toggle Button */}
        <button
          type="button"
          onTouchStart={handleToggleSprint}
          onClick={(e) => e.stopPropagation()}
          aria-label="Lari / Sprint"
          className="min-w-[52px] min-h-[52px] w-[54px] h-[54px] rounded-full border flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer"
          style={{
            borderColor: sprintingVisual ? '#d4a353' : 'rgba(120, 169, 196, 0.45)',
            backgroundColor: sprintingVisual ? 'rgba(212, 163, 83, 0.22)' : 'rgba(7, 12, 20, 0.58)',
            color: sprintingVisual ? '#f3d28f' : '#9fb8cc',
          }}
        >
          <Footprints className="w-4 h-4" />
          <span className="font-typewriter text-[9px] tracking-wider leading-none">LARI</span>
        </button>

        {/* [LENTERA KONSTITUSI] Button with Circular SVG Cooldown Ring */}
        <button
          type="button"
          onTouchStart={handleLanternTap}
          onClick={(e) => e.stopPropagation()}
          aria-label="Lentera Pembeku Bayangan"
          className="relative min-w-[60px] min-h-[60px] w-[62px] h-[62px] rounded-full flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 cursor-pointer"
          style={{
            backgroundColor: lanternReady ? 'rgba(28, 22, 10, 0.7)' : 'rgba(7, 12, 20, 0.55)',
            color: lanternReady ? '#e6c07b' : '#64748b',
            boxShadow: lanternReady ? '0 0 16px rgba(212, 163, 83, 0.35)' : 'none',
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
            viewBox="0 0 62 62"
          >
            <circle
              cx="31"
              cy="31"
              r={RING_RADIUS}
              fill="none"
              stroke="rgba(51, 65, 85, 0.65)"
              strokeWidth="2.5"
            />
            <circle
              cx="31"
              cy="31"
              r={RING_RADIUS}
              fill="none"
              stroke={lanternReady ? '#d4a353' : '#78a9c4'}
              strokeWidth="2.8"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <Flame className="w-4 h-4 relative z-10" />
          <span className="font-typewriter text-[8.5px] tracking-wider leading-none relative z-10">
            LENTERA
          </span>
        </button>

        {/* [INTERAKSI / SEMBUNYI] Button */}
        <button
          type="button"
          onTouchStart={handleInteractTap}
          onClick={(e) => e.stopPropagation()}
          aria-label="Interaksi atau Sembunyi"
          className="min-w-[68px] min-h-[68px] w-[70px] h-[70px] rounded-full border flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
          style={{
            borderColor:
              hasNearbyAction || hud.isHiding ? '#d4a353' : 'rgba(120, 169, 196, 0.45)',
            backgroundColor:
              hasNearbyAction || hud.isHiding ? 'rgba(212, 163, 83, 0.28)' : 'rgba(7, 12, 20, 0.6)',
            color: hasNearbyAction || hud.isHiding ? '#fef08a' : '#cbd5e1',
            boxShadow:
              hasNearbyAction || hud.isHiding
                ? '0 0 22px rgba(212, 163, 83, 0.48)'
                : '0 0 10px rgba(15, 23, 42, 0.5)',
          }}
        >
          {hud.isHiding ? <EyeOff className="w-5 h-5" /> : <Hand className="w-5 h-5" />}
          <span className="font-typewriter text-[9px] font-bold tracking-wider leading-none">
            {hud.isHiding ? 'KELUAR' : 'AKSI'}
          </span>
        </button>
      </div>
    </div>
  );
};
