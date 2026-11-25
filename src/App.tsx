import { useCallback, useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, AlertTriangle, Gamepad2 } from 'lucide-react';
import {
  ControlMode,
  DifficultyMode,
  DialogueLine,
  EndingType,
  GamePhase,
  HudSnapshot,
  LAYER_METAS,
  LayerIndex,
  MIRROR_QUESTIONS,
  MirrorOption,
  MirrorResponseRecord,
} from './types/game';
import { HorrorAudioEngine } from './game/audio';
import { SudutBekuEngine } from './game/engine';
import { downloadStandaloneHtml } from './game/standaloneExporter';
import { TitleScreen } from './components/TitleScreen';
import { DialogueBox } from './components/DialogueBox';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { MirrorModal } from './components/MirrorModal';
import { EndingModal } from './components/EndingModal';
import { GameOverModal } from './components/GameOverModal';

function detectDefaultControlMode(): ControlMode {
  if (typeof window === 'undefined') return 'pc';
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  return hasTouch ? 'mobile' : 'pc';
}

interface ActiveDialogueState {
  lines: DialogueLine[];
  onComplete: () => void;
}

const INITIAL_HUD: HudSnapshot = {
  layerIndex: 0,
  stability: 5,
  maxStability: 5,
  jumpscareCount: 0,
  graceTimer: 0,
  strobePhase: 'none',
  warmth: 100,
  stamina: 100,
  lanternCooldown: 0,
  lanternActive: false,
  isHiding: false,
  isPointerLocked: false,
  collectedCount: 0,
  totalTargets: LAYER_METAS[0].totalTargets,
  exitUnlocked: false,
  frostLevel: 0.38,
  threatDistance: 99,
  promptText: null,
  promptSubtext: null,
};

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SudutBekuEngine | null>(null);
  const audioRef = useRef<HorrorAudioEngine | null>(null);

  const [phase, setPhase] = useState<GamePhase>('title');
  const [muted, setMuted] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('standard');
  const [controlMode, setControlMode] = useState<ControlMode>(detectDefaultControlMode);
  const [respondentName, setRespondentName] = useState('');
  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);

  const [mirrorIndex, setMirrorIndex] = useState<number>(0);
  const [awarenessScore, setAwarenessScore] = useState<number>(0);
  const [frostLevel, setFrostLevel] = useState<number>(0.38);
  const [responses, setResponses] = useState<MirrorResponseRecord[]>([]);
  const [collectedFragments, setCollectedFragments] = useState<number>(0);
  const [jumpscareCount, setJumpscareCount] = useState<number>(0);
  const [cutsceneSubtitle, setCutsceneSubtitle] = useState<string | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<ActiveDialogueState | null>(null);
  const [contextLost, setContextLost] = useState(false);

  // Refs for stable engine callbacks (prevents WebGL engine re-creation on state updates)
  const awarenessScoreRef = useRef<number>(0);
  const activeDialogueRef = useRef<ActiveDialogueState | null>(null);

  const handleDialogueRequested = useCallback((lines: DialogueLine[], onComplete: () => void) => {
    const nextState: ActiveDialogueState = { lines, onComplete };
    activeDialogueRef.current = nextState;
    setActiveDialogue(nextState);
    setPhase((prev) => (prev === 'prologue' || prev === 'epilogue' ? prev : 'dialogue'));
  }, []);

  const handleDialogueComplete = useCallback(() => {
    const current = activeDialogueRef.current;
    activeDialogueRef.current = null;
    setActiveDialogue(null);
    if (!current) return;
    setPhase('playing');
    current.onComplete();
  }, []);

  const handleTypeBlip = useCallback((index: number) => {
    audioRef.current?.playTypeBlip(index);
  }, []);

  const handleAudioCue = useCallback((cue: NonNullable<DialogueLine['cue']>) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (cue === 'clock') audio.playClockToll();
    else if (cue === 'whisper') audio.playWhisperStatic();
    else if (cue === 'door') audio.playDoorSlam();
    else if (cue === 'ice') audio.playIceShatter();
    else if (cue === 'chime') audio.playMemoryChime();
  }, []);

  const handleLayerCompleted = useCallback((completedLayer: LayerIndex) => {
    if (completedLayer < 3) {
      setMirrorIndex(completedLayer);
      setPhase('mirror');
    } else {
      const frags = engineRef.current?.getCollectedFragmentsCount() ?? 0;
      const frost = engineRef.current?.getFrostLevel() ?? 0.38;
      const finalScore = Math.max(0, Math.min(100, Math.round(awarenessScoreRef.current)));
      const endingType: EndingType =
        finalScore >= 75 ? 'true' : finalScore >= 45 ? 'neutral' : 'bad';

      setCollectedFragments(frags);
      setFrostLevel(frost);
      setPhase('epilogue');
      engineRef.current?.startEpilogue(endingType, () => {
        setPhase('ending');
      });
    }
  }, []);

  const handlePauseRequested = useCallback(() => {
    setPhase((prev) => {
      if (prev === 'playing') {
        engineRef.current?.setPhase('paused');
        return 'paused';
      }
      return prev;
    });
  }, []);

  const handleGameOver = useCallback(() => {
    setCollectedFragments(engineRef.current?.getCollectedFragmentsCount() ?? 0);
    setJumpscareCount(engineRef.current?.getJumpscareCount() ?? 5);
    setFrostLevel(engineRef.current?.getFrostLevel() ?? 0.38);
    setCutsceneSubtitle(null);
    setPhase('gameover');
  }, []);

  const handleCutsceneSubtitle = useCallback((text: string | null) => {
    setCutsceneSubtitle(text);
    if (text !== null) {
      setPhase('cutscene');
    }
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const audio = new HorrorAudioEngine();
    audioRef.current = audio;

    const engine = new SudutBekuEngine(container, audio, {
      onHudUpdate: (snapshot) => {
        setHud(snapshot);
        if (snapshot.stability <= 0 && snapshot.jumpscareCount >= 5) {
          setPhase((prev) => (prev === 'gameover' ? prev : 'cutscene'));
        }
      },
      onDialogueRequested: handleDialogueRequested,
      onLayerCompleted: handleLayerCompleted,
      onPauseRequested: handlePauseRequested,
      onContextLossChange: (lost) => setContextLost(lost),
      onGameOver: handleGameOver,
      onCutsceneSubtitle: handleCutsceneSubtitle,
    });
    engineRef.current = engine;
    engine.setControlMode(detectDefaultControlMode());

    return () => {
      engine.dispose();
      audio.dispose();
      engineRef.current = null;
      audioRef.current = null;
    };
  }, [handleDialogueRequested, handleLayerCompleted, handlePauseRequested, handleGameOver, handleCutsceneSubtitle]);

  useEffect(() => {
    const unlockAudio = () => {
      audioRef.current?.init();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
    window.addEventListener('touchstart', unlockAudio, { once: true, capture: true });
    window.addEventListener('keydown', unlockAudio, { once: true, capture: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('touchstart', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setControlMode(controlMode);
  }, [controlMode]);

  const handleToggleControlMode = useCallback(() => {
    setControlMode((prev) => (prev === 'pc' ? 'mobile' : 'pc'));
  }, []);

  const handleToggleMute = useCallback(() => {
    audioRef.current?.init();
    setMuted((prev) => {
      const next = !prev;
      audioRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleStartGame = useCallback(() => {
    awarenessScoreRef.current = 0;
    activeDialogueRef.current = null;
    setActiveDialogue(null);
    setAwarenessScore(0);
    setFrostLevel(0.38);
    setResponses([]);
    setCollectedFragments(0);
    setJumpscareCount(0);
    setCutsceneSubtitle(null);
    setMirrorIndex(0);
    setPhase('prologue');
    engineRef.current?.startPrologue(difficulty);
  }, [difficulty]);

  const handleResume = useCallback(() => {
    setPhase('playing');
    engineRef.current?.setPhase('playing');
    engineRef.current?.requestPointerLock();
  }, []);

  const handleReturnToTitle = useCallback(() => {
    activeDialogueRef.current = null;
    setActiveDialogue(null);
    setPhase('title');
    engineRef.current?.setPhase('title');
  }, []);

  const handleMirrorSelect = useCallback(
    (option: MirrorOption) => {
      const question = MIRROR_QUESTIONS[mirrorIndex];
      const nextScore = awarenessScore + option.awarenessDelta;
      const nextFrost = Math.max(0.15, Math.min(1.0, frostLevel + option.frostDelta));

      awarenessScoreRef.current = nextScore;
      setAwarenessScore(nextScore);
      setFrostLevel(nextFrost);
      setResponses((prev) => [
        ...prev,
        {
          questionId: question.id,
          betweenLabel: question.betweenLabel,
          chosenLabel: option.label,
          tag: option.tag,
          awarenessDelta: option.awarenessDelta,
        },
      ]);

      const nextLayer = (mirrorIndex + 1) as LayerIndex;
      setPhase('playing');
      engineRef.current?.advanceToLayer(nextLayer, nextFrost);
    },
    [awarenessScore, frostLevel, mirrorIndex]
  );

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-screen h-screen overflow-hidden bg-[#04080f] select-none"
    >
      {/* Isolated Three.js WebGL Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Subtle Analog Horror CRT Scanlines & Procedural Film Grain */}
      <div className="ps2-scanlines fixed inset-0 z-[5]" />
      <div className="film-grain fixed inset-0 z-[6]" />

      {/* WebGL Context Lost Banner */}
      {contextLost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#04080f]/95 p-6">
          <div className="max-w-md border border-[#c25959] bg-[#0b1017] p-6 text-center space-y-3 font-typewriter">
            <AlertTriangle className="w-8 h-8 text-[#c25959] mx-auto" />
            <div className="text-sm font-bold text-[#e2e8f0]">Konteks Grafis 3D Terhenti Sementara</div>
            <p className="text-xs text-[#9aa8b8]">
              Peramban sedang memulihkan memori grafis WebGL. Tunggu sejenak atau muat ulang halaman jika tidak pulih otomatis.
            </p>
          </div>
        </div>
      )}

      {/* Title Screen */}
      {phase === 'title' && (
        <TitleScreen
          muted={muted}
          difficulty={difficulty}
          controlMode={controlMode}
          respondentName={respondentName}
          onChangeDifficulty={setDifficulty}
          onChangeControlMode={setControlMode}
          onChangeRespondentName={setRespondentName}
          onToggleMute={handleToggleMute}
          onStart={handleStartGame}
          onDownloadStandalone={downloadStandaloneHtml}
        />
      )}

      {/* Mobile Multi-Touch Virtual Dual-Stick & Action Buttons */}
      {phase === 'playing' && !activeDialogue && controlMode === 'mobile' && (
        <MobileControls
          hud={hud}
          onJoystickMove={(x, y, autoSprint) =>
            engineRef.current?.setVirtualJoystick(x, y, autoSprint)
          }
          onTouchLook={(dx, dy) => engineRef.current?.applyTouchLook(dx, dy)}
          onSprintChange={(active) => engineRef.current?.setMobileSprint(active)}
          onInteract={() => engineRef.current?.triggerMobileInteract()}
          onLantern={() => engineRef.current?.triggerMobileLantern()}
        />
      )}

      {/* Active Gameplay HUD */}
      {phase === 'playing' && !activeDialogue && (
        <GameHUD
          hud={hud}
          muted={muted}
          controlMode={controlMode}
          onToggleControlMode={handleToggleControlMode}
          onToggleMute={handleToggleMute}
          onPause={handlePauseRequested}
        />
      )}

      {/* Cinematic Typewriter Dialogue Box (Prologue, Babak I-IV, Epilogue) */}
      {activeDialogue && (phase === 'prologue' || phase === 'dialogue' || phase === 'epilogue') && (
        <DialogueBox
          lines={activeDialogue.lines}
          controlMode={controlMode}
          onTypeBlip={handleTypeBlip}
          onAudioCue={handleAudioCue}
          onComplete={handleDialogueComplete}
        />
      )}

      {/* 12-Second Fatal Cutscene Subtitle & Letterbox */}
      {phase === 'cutscene' && (
        <div className="fixed inset-0 z-25 pointer-events-none flex flex-col justify-between">
          <div className="h-12 bg-[#020408]/95 border-b border-[#1e293b]/50" />
          <div className="pb-10 px-6 flex flex-col items-center">
            {cutsceneSubtitle && (
              <div className="max-w-2xl border border-[#475569]/70 bg-[#050810]/92 px-6 py-4 text-center shadow-2xl">
                <div className="font-typewriter text-[11px] tracking-widest text-[#78a9c4] mb-1">
                  RINDIANI · SUARA MELEMAH
                </div>
                <p className="font-serif-horror text-base md:text-lg text-[#e2e8f0] italic">
                  “{cutsceneSubtitle}”
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {phase === 'paused' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#03060c]/92 overflow-y-auto touch-pan-y">
          <div className="w-full max-w-md border border-[#475261] bg-[#0c1118] p-6 space-y-5 shadow-2xl my-auto">
            <div className="space-y-1 border-b border-[#252e3a] pb-3">
              <div className="text-xs font-typewriter tracking-widest text-[#8aa4b8]">
                {LAYER_METAS[hud.layerIndex].roman} · PENELUSURAN DIJEDA
              </div>
              <h2 className="font-serif-horror text-2xl font-bold text-[#e2e8f0]">
                {LAYER_METAS[hud.layerIndex].title}
              </h2>
              <p className="font-typewriter text-xs text-[#9aa8b8]">
                {LAYER_METAS[hud.layerIndex].ambientHint}
              </p>
            </div>

            <div className="border border-[#26303d] bg-[#070b11] p-3 text-xs font-typewriter text-[#cbd5e1] space-y-1">
              {controlMode === 'mobile' ? (
                <>
                  <div><span className="text-[#78a9c4]">Analog Kiri</span> : Bergerak (Tarik &gt;85% Lari)</div>
                  <div><span className="text-[#78a9c4]">Geser Kanan</span> : Arah Pandang &amp; Senter</div>
                  <div><span className="text-[#d4a353]">Tombol LARI</span> : Aktif/Nonaktif Berlari</div>
                  <div><span className="text-[#d4a353]">Tombol LENTERA</span> : Bekukan Bayangan Sementara</div>
                  <div><span className="text-[#d4a353]">Tombol AKSI</span> : Ambil Fragmen / Sembunyi / Segel</div>
                </>
              ) : (
                <>
                  <div><span className="text-[#78a9c4]">WASD / Panah</span> : Bergerak</div>
                  <div><span className="text-[#78a9c4]">Mouse / Geser</span> : Arah Pandang &amp; Senter</div>
                  <div><span className="text-[#78a9c4]">Shift</span> : Berlari (Stamina Napas)</div>
                  <div><span className="text-[#d4a353]">F</span> : Lentera (Bekukan Bayangan Sementara)</div>
                  <div><span className="text-[#d4a353]">E</span> : Ambil Fragmen / Sembunyi / Buka Segel</div>
                </>
              )}
            </div>

            <div className="space-y-2.5 font-typewriter">
              <button
                type="button"
                onClick={handleResume}
                className="w-full min-h-[48px] flex items-center justify-center gap-2 py-3 bg-[#d4a353] hover:bg-[#e0b467] text-[#090d14] font-bold text-sm cursor-pointer transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Lanjutkan Penelusuran</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleControlMode}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 px-2 border border-[#3a4554] bg-[#080c13] hover:border-[#d4a353] text-[#cbd5e1] text-xs cursor-pointer transition-colors"
                >
                  <Gamepad2 className="w-4 h-4 text-[#d4a353]" />
                  <span>{controlMode === 'mobile' ? 'Mode: Mobile' : 'Mode: PC'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 px-2 border border-[#3a4554] bg-[#080c13] hover:border-[#78a9c4] text-[#cbd5e1] text-xs cursor-pointer transition-colors"
                >
                  {muted ? <VolumeX className="w-4 h-4 text-[#c25959]" /> : <Volume2 className="w-4 h-4 text-[#78a9c4]" />}
                  <span>{muted ? 'Suara: Mati' : 'Suara: Aktif'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 border border-[#334155] bg-[#080c13] hover:border-[#d4a353] text-[#cbd5e1] text-xs cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Awal</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnToTitle}
                  className="min-h-[48px] flex items-center justify-center gap-1.5 py-2.5 border border-[#334155] bg-[#080c13] hover:border-[#78a9c4] text-[#cbd5e1] text-xs cursor-pointer transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Layar Judul</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Psychological Mirror Interlude */}
      {phase === 'mirror' && (
        <MirrorModal
          question={MIRROR_QUESTIONS[mirrorIndex]}
          currentFrostLevel={frostLevel}
          onSelect={handleMirrorSelect}
        />
      )}

      {/* Ending & PjBL Research Recap Card */}
      {phase === 'ending' && (
        <EndingModal
          respondentName={respondentName}
          awarenessScore={awarenessScore}
          frostLevel={frostLevel}
          collectedFragments={collectedFragments}
          responses={responses}
          onRestart={handleStartGame}
          onDownloadStandalone={downloadStandaloneHtml}
        />
      )}

      {/* Special Game Over Screen (After 5th Jumpscare 12s Cutscene) */}
      {phase === 'gameover' && (
        <GameOverModal
          respondentName={respondentName}
          layerIndex={hud.layerIndex}
          awarenessScore={awarenessScore}
          frostLevel={frostLevel}
          collectedFragments={collectedFragments}
          jumpscareCount={jumpscareCount}
          responses={responses}
          onRestart={handleStartGame}
          onReturnToTitle={handleReturnToTitle}
        />
      )}
    </div>
  );
}
