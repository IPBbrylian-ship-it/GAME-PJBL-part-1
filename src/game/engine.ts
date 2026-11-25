import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ControlMode,
  DifficultyMode,
  DialogueLine,
  EndingType,
  GamePhase,
  HudSnapshot,
  LAYER_METAS,
  LayerIndex,
} from '../types/game';
import { HorrorAudioEngine } from './audio';
import {
  ArticulatedCharacterRig,
  animateCharacterPose,
  createArticulatedShadow,
} from './characters';
import {
  AABB,
  CampusSceneResult,
  InteractableItem,
  LevelBuildResult,
  ShadowEnemy,
  buildCampusParkScene,
  buildLayer,
} from './levels';
import { createDroppedFlashlight } from './models';
import {
  CUTSCENE_FATAL_LINE,
  FRAGMENT_DIALOGUES,
  LAYER_INTRO_DIALOGUES,
  PROLOGUE_DIALOGUES,
  TRIGGER_DIALOGUES,
  getEpilogueDialogues,
} from './story';
import { ProceduralTextureBank, createProceduralTextureBank } from './textures';

// Pre-allocated scratch vectors to eliminate per-frame GC
const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export interface EngineCallbacks {
  onHudUpdate: (snapshot: HudSnapshot) => void;
  onDialogueRequested: (lines: DialogueLine[], onComplete: () => void) => void;
  onLayerCompleted: (completedLayer: LayerIndex) => void;
  onPauseRequested: () => void;
  onContextLossChange: (lost: boolean) => void;
  onGameOver: () => void;
  onCutsceneSubtitle: (text: string | null) => void;
}

export class SudutBekuEngine {
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private audio: HorrorAudioEngine;

  private isSoftwareGl: boolean;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private textures: ProceduralTextureBank;

  private fog: THREE.FogExp2;
  private bgColorNight = new THREE.Color(0x04080f);
  private bgColorDawn = new THREE.Color(0x1f2d42);
  private flashlight: THREE.SpotLight;
  private flashlightTarget: THREE.Object3D;
  private lanternLight: THREE.PointLight;
  private lanternRing: THREE.Mesh;

  private snowPoints: THREE.Points;
  private snowCount = 720;
  private snowSpeeds: Float32Array;
  private snowEnabled = true;

  private dustPoints: THREE.Points;
  private dustCount = 2400;
  private dustBaseOffsets: Float32Array;

  private levelData: LevelBuildResult | null = null;
  private campusScene: CampusSceneResult | null = null;
  private layerIndex: LayerIndex = 0;
  private phase: GamePhase = 'title';
  private difficulty: DifficultyMode = 'standard';
  private controlMode: ControlMode = 'pc';

  // Player & Stability state
  private playerPos = new THREE.Vector3(0, 1.65, 11);
  private yaw = 0;
  private pitch = 0;
  private headBobPhase = 0;
  private warmth = 100;
  private stamina = 100;
  private readonly maxStability = 5;
  private stability = 5;
  private jumpscareCount = 0;
  private graceTimer = 0;
  private hitstopTimer = 0;
  private shakeIntensity = 0;

  // Jumpscare transient state
  private jumpscareTimer = 0;
  private jumpscareDuration = 1.05;
  private jumpscareKind: 'entity' | 'wardrobe' | 'mannequins' | 'glitchPhone' | null = null;
  private activeJumpscareEnemy: ShadowEnemy | null = null;
  private jumpscareFocusPos = new THREE.Vector3();
  private strobePhase: 'none' | 'red' | 'blue' = 'none';
  private mannequinsAlerted = false;
  private wardrobeSlamFired = false;
  private buzzCooldown = 0;

  // 12-Second 4-Shot Fatal Cutscene state
  private cutsceneTime = 0;
  private cutsceneShot = 0;
  private cutsceneChordPlayed = false;
  private cutsceneSubtitleShown = false;
  private droppedFlashlight: {
    group: THREE.Group;
    beamLight: THREE.SpotLight;
    lensMat: THREE.MeshStandardMaterial;
  } | null = null;
  private cutsceneDomeLoaded = false;
  private cutsceneShadows: ArticulatedCharacterRig[] = [];

  // Lentera Konstitusi
  private lanternCooldownTimer = 0;
  private readonly lanternCooldownDuration = 8.0;
  private lanternPulseTimer = 0;

  // Hiding
  private isHiding = false;
  private savedPreHidePos = new THREE.Vector3();
  private savedPreHideYaw = 0;

  // Story & Frost
  private frostLevel = 0.38;
  private collectedCount = 0;
  private exitUnlocked = false;
  private collectedTotalFragments = 0;
  private currentEpilogueType: EndingType = 'true';

  // Input state
  private heldKeys: Record<string, boolean> = {};
  private justPressed: Record<string, boolean> = {};
  private isDraggingLook = false;
  private lastMouseX = 0;
  private lastMouseY = 0;
  private isPointerLocked = false;
  private virtualMoveX = 0;
  private virtualMoveY = 0;
  private mobileAutoSprint = false;
  private mobileSprintHeld = false;

  // Loop
  private clock = new THREE.Clock();
  private frameId = 0;
  private hudEmitAccum = 0;
  private disposed = false;
  private titleAngle = 0.4;
  private epilogueTime = 0;

  constructor(container: HTMLElement, audio: HorrorAudioEngine, callbacks: EngineCallbacks) {
    this.container = container;
    this.audio = audio;
    this.callbacks = callbacks;

    this.isSoftwareGl = detectSoftwareGl();
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(
      container.clientWidth || window.innerWidth,
      container.clientHeight || window.innerHeight
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = this.bgColorNight.clone();
    this.fog = new THREE.FogExp2(0x04080f, 0.048);
    this.scene.fog = this.fog;

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(72, w / h, 0.08, 140);
    this.scene.add(this.camera);

    const hemi = new THREE.HemisphereLight(0x78a9c4, 0x0f172a, 0.46);
    this.scene.add(hemi);

    const keyDir = new THREE.DirectionalLight(0xffedd5, 0.36);
    keyDir.position.set(8, 16, 10);
    this.scene.add(keyDir);

    // Camera-attached Realistic Flashlight with Shadow Mapping
    this.flashlight = new THREE.SpotLight(0xfef3c7, 5.6, 26, Math.PI / 4.8, 0.55, 1.5);
    this.flashlight.position.set(0.14, -0.1, -0.1);
    this.flashlight.castShadow = !this.isSoftwareGl;
    this.flashlight.shadow.mapSize.set(1024, 1024);
    this.flashlight.shadow.camera.near = 0.2;
    this.flashlight.shadow.camera.far = 26;
    this.flashlight.shadow.bias = -0.0005;
    this.flashlightTarget = new THREE.Object3D();
    this.flashlightTarget.position.set(0, -0.08, -10);
    this.camera.add(this.flashlight);
    this.camera.add(this.flashlightTarget);
    this.flashlight.target = this.flashlightTarget;

    // Lentera pulse light & shockwave ring
    this.lanternLight = new THREE.PointLight(0xd4a353, 0, 22, 1.5);
    this.scene.add(this.lanternLight);

    const ringGeo = new THREE.TorusGeometry(1, 0.05, 8, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4a353,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    this.lanternRing = new THREE.Mesh(ringGeo, ringMat);
    this.lanternRing.rotation.x = Math.PI / 2;
    this.lanternRing.visible = false;
    this.scene.add(this.lanternRing);

    this.textures = createProceduralTextureBank(this.renderer);

    // Continuous Falling Snow
    const snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.snowCount * 3);
    this.snowSpeeds = new Float32Array(this.snowCount);
    for (let i = 0; i < this.snowCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 38;
      this.snowSpeeds[i] = 1.1 + Math.random() * 1.5;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      map: this.textures.snowParticle,
      size: 0.16,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.snowPoints = new THREE.Points(snowGeo, snowMat);
    this.snowPoints.frustumCulled = false;
    this.scene.add(this.snowPoints);

    // 2400 Floating Atmospheric Dust Motes illuminated near player / flashlight
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(this.dustCount * 3);
    this.dustBaseOffsets = new Float32Array(this.dustCount * 3);
    for (let i = 0; i < this.dustCount; i++) {
      const ox = (Math.random() - 0.5) * 20;
      const oy = 0.25 + Math.random() * 3.1;
      const oz = (Math.random() - 0.5) * 20;
      this.dustBaseOffsets[i * 3] = ox;
      this.dustBaseOffsets[i * 3 + 1] = oy;
      this.dustBaseOffsets[i * 3 + 2] = oz;
      dustPositions[i * 3] = ox;
      dustPositions[i * 3 + 1] = oy;
      dustPositions[i * 3 + 2] = oz;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xfef3c7,
      map: this.textures.dustMote,
      size: 0.052,
      transparent: true,
      opacity: 0.36,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    this.dustPoints = new THREE.Points(dustGeo, dustMat);
    this.dustPoints.frustumCulled = false;
    this.scene.add(this.dustPoints);

    // Load Campus Park Bench Scene for Title Screen live 3D camera
    this.loadCampusScene('title');

    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.bindEvents();
    this.clock.start();
    this.tick();
  }

  private clearActiveScenes(): void {
    if (this.droppedFlashlight) {
      this.scene.remove(this.droppedFlashlight.group);
      this.disposeObjectTree(this.droppedFlashlight.group);
      this.droppedFlashlight = null;
    }
    if (this.cutsceneShadows.length > 0) {
      this.cutsceneShadows.forEach((s) => {
        this.scene.remove(s.root);
        this.disposeObjectTree(s.root);
      });
      this.cutsceneShadows = [];
    }
    if (this.levelData) {
      this.scene.remove(this.levelData.root);
      this.disposeObjectTree(this.levelData.root);
      this.levelData = null;
    }
    if (this.campusScene) {
      this.scene.remove(this.campusScene.root);
      this.disposeObjectTree(this.campusScene.root);
      this.campusScene = null;
    }
  }

  private loadCampusScene(mode: 'title' | 'prologue' | EndingType): void {
    this.clearActiveScenes();
    this.campusScene = buildCampusParkScene(this.textures, mode);
    this.scene.add(this.campusScene.root);

    if (mode === 'true') {
      this.scene.background = this.bgColorDawn.clone();
      this.fog.color.copy(this.bgColorDawn);
      this.fog.density = 0.018;
      this.snowEnabled = false;
      this.snowPoints.visible = false;
    } else {
      this.scene.background = this.bgColorNight.clone();
      this.fog.color.copy(this.bgColorNight);
      this.fog.density = 0.046;
      this.snowEnabled = true;
      this.snowPoints.visible = true;
    }
  }

  public startPrologue(difficulty: DifficultyMode): void {
    this.audio.init();
    this.difficulty = difficulty;
    this.frostLevel = 0.38;
    this.warmth = 100;
    this.stamina = 100;
    this.stability = this.maxStability;
    this.jumpscareCount = 0;
    this.graceTimer = 0;
    this.jumpscareTimer = 0;
    this.jumpscareKind = null;
    this.activeJumpscareEnemy = null;
    this.strobePhase = 'none';
    this.lanternCooldownTimer = 0;
    this.collectedTotalFragments = 0;
    this.callbacks.onCutsceneSubtitle(null);

    this.loadCampusScene('prologue');
    this.phase = 'prologue';
    this.clearInputs();
    this.emitHud();

    this.callbacks.onDialogueRequested(PROLOGUE_DIALOGUES, () => {
      this.loadLayer(0);
      this.phase = 'playing';
      const intro = LAYER_INTRO_DIALOGUES[0];
      if (intro) {
        this.phase = 'dialogue';
        this.callbacks.onDialogueRequested(intro, () => {
          this.phase = 'playing';
          this.emitHud();
        });
      }
      this.emitHud();
    });
  }

  public advanceToLayer(layerIdx: LayerIndex, newFrostLevel: number): void {
    this.frostLevel = THREE.MathUtils.clamp(newFrostLevel, 0.15, 1.0);
    this.warmth = Math.min(100, this.warmth + 25);
    this.stamina = 100;
    this.loadLayer(layerIdx);
    this.phase = 'playing';

    const intro = LAYER_INTRO_DIALOGUES[layerIdx];
    if (intro) {
      this.phase = 'dialogue';
      this.clearInputs();
      this.callbacks.onDialogueRequested(intro, () => {
        this.phase = 'playing';
        this.emitHud();
      });
    }
    this.emitHud();
  }

  public startEpilogue(endingType: EndingType, onEpilogueDone: () => void): void {
    this.currentEpilogueType = endingType;
    this.epilogueTime = 0;
    this.loadCampusScene(endingType);
    this.phase = 'epilogue';
    this.clearInputs();
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.emitHud();

    const lines = getEpilogueDialogues(endingType);
    this.callbacks.onDialogueRequested(lines, () => {
      this.phase = 'ending';
      onEpilogueDone();
    });
  }

  public setPhase(phase: GamePhase): void {
    this.phase = phase;
    if (phase !== 'playing') {
      this.clearInputs();
      if (document.pointerLockElement === this.renderer.domElement) {
        document.exitPointerLock?.();
      }
    }
    if (phase === 'title') {
      this.callbacks.onCutsceneSubtitle(null);
      this.loadCampusScene('title');
    }
    this.emitHud();
  }

  public setControlMode(mode: ControlMode): void {
    this.controlMode = mode;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, mode === 'mobile' ? 1.5 : 2)
    );
    if (mode === 'mobile' && document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.clearInputs();
    this.emitHud();
  }

  public setVirtualJoystick(x: number, y: number, autoSprint: boolean): void {
    this.virtualMoveX = THREE.MathUtils.clamp(x, -1, 1);
    this.virtualMoveY = THREE.MathUtils.clamp(y, -1, 1);
    this.mobileAutoSprint = autoSprint;
  }

  public applyTouchLook(dx: number, dy: number): void {
    if (this.phase !== 'playing' || this.jumpscareTimer > 0) return;
    this.audio.init();
    this.yaw -= dx * 0.0052;
    this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0044, -1.25, 1.25);
  }

  public setMobileSprint(active: boolean): void {
    this.mobileSprintHeld = active;
  }

  public triggerMobileInteract(): void {
    this.audio.init();
    if (this.phase !== 'playing' || this.jumpscareTimer > 0) return;
    const closest = this.findClosestInteractable();
    this.handleInteract(closest.item, closest.hideSpotIdx);
    this.emitHud();
  }

  public triggerMobileLantern(): void {
    this.audio.init();
    if (this.phase !== 'playing' || this.jumpscareTimer > 0 || this.isHiding) return;
    this.triggerLenteraKonstitusi();
    this.emitHud();
  }

  public requestPointerLock(): void {
    if (this.controlMode === 'mobile') return;
    if (this.phase === 'playing' && document.pointerLockElement !== this.renderer.domElement) {
      try {
        this.renderer.domElement.requestPointerLock?.();
      } catch {
        // Drag fallback remains active
      }
    }
  }

  public getCollectedFragmentsCount(): number {
    return this.collectedTotalFragments;
  }

  public getFrostLevel(): number {
    return this.frostLevel;
  }

  public getJumpscareCount(): number {
    return this.jumpscareCount;
  }

  private loadLayer(layerIdx: LayerIndex): void {
    this.clearActiveScenes();

    this.layerIndex = layerIdx;
    this.isHiding = false;
    this.collectedCount = 0;
    this.exitUnlocked = false;
    this.graceTimer = 2.0;
    this.jumpscareTimer = 0;
    this.jumpscareKind = null;
    this.activeJumpscareEnemy = null;
    this.strobePhase = 'none';
    this.mannequinsAlerted = false;
    this.wardrobeSlamFired = false;

    this.scene.background = this.bgColorNight.clone();
    this.fog.color.copy(this.bgColorNight);
    this.snowEnabled = true;
    this.snowPoints.visible = true;

    this.levelData = buildLayer(
      layerIdx,
      this.textures,
      this.isSoftwareGl,
      this.frostLevel,
      this.difficulty
    );
    this.scene.add(this.levelData.root);

    this.playerPos.copy(this.levelData.playerSpawn);
    this.yaw = this.levelData.playerYaw;
    this.pitch = 0;

    this.fog.density = 0.04 + this.frostLevel * 0.05;
    this.updateDomeVisuals();
  }

  private updateDomeVisuals(): void {
    if (!this.levelData?.domeController) return;
    const { domeMesh, iceRibs, rindiRig, domeLight } = this.levelData.domeController;
    const progress = this.collectedCount / 4;
    const mat = domeMesh.material as THREE.MeshPhysicalMaterial;

    const iceFactor = THREE.MathUtils.clamp(0.45 + this.frostLevel * 0.55 - progress * 0.72, 0.12, 1.0);
    mat.opacity = this.isSoftwareGl ? 0.18 + iceFactor * 0.35 : 0.25 + iceFactor * 0.48;
    iceRibs.scale.setScalar(Math.max(0.08, 1.05 - progress * 0.85));
    iceRibs.visible = progress < 1 || this.frostLevel > 0.65;

    if (progress >= 1 && this.frostLevel < 0.6) {
      domeLight.color.setHex(0xd4a353);
      domeLight.intensity = 3.5;
    } else {
      domeLight.color.setHex(0x78a9c4);
      domeLight.intensity = 2.4 + progress * 0.8;
    }
    animateCharacterPose(rindiRig, 'seatedHug', this.clock.elapsedTime);
  }

  private clearInputs(): void {
    for (const k of Object.keys(this.heldKeys)) this.heldKeys[k] = false;
    for (const k of Object.keys(this.justPressed)) this.justPressed[k] = false;
    this.isDraggingLook = false;
    this.virtualMoveX = 0;
    this.virtualMoveY = 0;
    this.mobileAutoSprint = false;
    this.mobileSprintHeld = false;
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) &&
      this.phase === 'playing'
    ) {
      e.preventDefault();
    }
    if (!this.heldKeys[e.code]) {
      this.justPressed[e.code] = true;
    }
    this.heldKeys[e.code] = true;

    if (e.code === 'Escape' && this.phase === 'playing') {
      this.callbacks.onPauseRequested();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.heldKeys[e.code] = false;
  };

  private onBlur = (): void => {
    this.clearInputs();
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.controlMode === 'mobile' || this.phase !== 'playing' || this.jumpscareTimer > 0) return;
    if (this.isPointerLocked) {
      this.yaw -= e.movementX * 0.0022;
      this.pitch = THREE.MathUtils.clamp(this.pitch - e.movementY * 0.0022, -1.25, 1.25);
    } else if (this.isDraggingLook) {
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.yaw -= dx * 0.0045;
      this.pitch = THREE.MathUtils.clamp(this.pitch - dy * 0.0045, -1.25, 1.25);
    }
  };

  private onMouseDown = (e: MouseEvent): void => {
    if (this.controlMode === 'mobile' || this.phase !== 'playing') return;
    this.audio.init();
    this.isDraggingLook = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    if (e.target === this.renderer.domElement) {
      this.requestPointerLock();
    }
  };

  private onMouseUp = (): void => {
    this.isDraggingLook = false;
  };

  private onPointerLockChange = (): void => {
    this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
    this.emitHud();
  };

  private onResize = (): void => {
    if (this.disposed) return;
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, this.controlMode === 'mobile' ? 1.5 : 2)
    );
  };

  private onContextLost = (e: Event): void => {
    e.preventDefault();
    this.callbacks.onContextLossChange(true);
  };

  private onContextRestored = (): void => {
    this.callbacks.onContextLossChange(false);
  };

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('resize', this.onResize);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored);
  }

  private unbindEvents(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    this.renderer.domElement.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored', this.onContextRestored);
  }

  private collidesAt(x: number, z: number, radius = 0.42): boolean {
    if (!this.levelData) return false;
    const b = this.levelData.bounds;
    if (x < b.minX + radius || x > b.maxX - radius || z < b.minZ + radius || z > b.maxZ - radius) {
      return true;
    }
    const cols: AABB[] = this.levelData.colliders;
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i];
      if (x + radius > c.minX && x - radius < c.maxX && z + radius > c.minZ && z - radius < c.maxZ) {
        return true;
      }
    }
    return false;
  }

  private findClosestInteractable(): { item: InteractableItem | null; hideSpotIdx: number } {
    if (!this.levelData) return { item: null, hideSpotIdx: -1 };
    let bestItem: InteractableItem | null = null;
    let bestDist = Infinity;

    for (const item of this.levelData.interactables) {
      if (item.collected) continue;
      const dist = Math.hypot(this.playerPos.x - item.position.x, this.playerPos.z - item.position.z);
      if (dist <= item.radius && dist < bestDist) {
        bestDist = dist;
        bestItem = item;
      }
    }
    if (bestItem) return { item: bestItem, hideSpotIdx: -1 };

    let bestHideIdx = -1;
    let bestHideDist = 2.25;
    this.levelData.hidingSpots.forEach((spot, idx) => {
      const dist = Math.hypot(this.playerPos.x - spot.position.x, this.playerPos.z - spot.position.z);
      if (dist < bestHideDist) {
        bestHideDist = dist;
        bestHideIdx = idx;
      }
    });

    return { item: null, hideSpotIdx: bestHideIdx };
  }

  private triggerLenteraKonstitusi(): void {
    if (this.lanternCooldownTimer > 0 || !this.levelData) return;
    this.lanternCooldownTimer = this.lanternCooldownDuration;
    this.lanternPulseTimer = 1.1;
    this.audio.playLanternPulse();

    this.lanternLight.position.set(this.playerPos.x, 1.5, this.playerPos.z);
    this.lanternLight.intensity = 10;

    this.lanternRing.position.set(this.playerPos.x, 0.25, this.playerPos.z);
    this.lanternRing.scale.setScalar(0.5);
    this.lanternRing.visible = true;

    for (const enemy of this.levelData.enemies) {
      const d = Math.hypot(
        enemy.rig.root.position.x - this.playerPos.x,
        enemy.rig.root.position.z - this.playerPos.z
      );
      if (d <= 12.5) {
        enemy.frozenTimer = 4.8;
        enemy.chasing = false;
      }
    }
  }

  private triggerDialoguePause(lines: DialogueLine[], onAfter: () => void): void {
    this.phase = 'dialogue';
    this.clearInputs();
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.callbacks.onDialogueRequested(lines, onAfter);
  }

  private handleInteract(item: InteractableItem | null, hideSpotIdx: number): void {
    if (this.isHiding) {
      this.isHiding = false;
      this.playerPos.copy(this.savedPreHidePos);
      this.yaw = this.savedPreHideYaw;
      this.audio.playHideToggle(false);
      return;
    }

    if (item) {
      if (item.kind === 'fragment' || item.kind === 'pillar') {
        item.collected = true;
        this.collectedCount += 1;
        if (item.kind === 'fragment') {
          this.collectedTotalFragments += 1;
          item.mesh.visible = false;
          this.audio.playMemoryChime();
        } else {
          const core = item.mesh.getObjectByName('pillarCore') as THREE.Mesh | undefined;
          const pLight = item.mesh.getObjectByName('pillarLight') as THREE.PointLight | undefined;
          if (core) {
            const m = core.material as THREE.MeshStandardMaterial;
            m.color.setHex(0xfef08a);
            m.emissive.setHex(0xd4a353);
            m.emissiveIntensity = 2.4;
          }
          if (pLight) {
            pLight.color.setHex(0xd4a353);
            pLight.intensity = 3.5;
          }
          this.audio.playPillarActivate(this.collectedCount);
          this.updateDomeVisuals();
          if (this.collectedCount >= 4) {
            this.audio.playIceShatter();
          }
        }

        const totalNeeded = LAYER_METAS[this.layerIndex].totalTargets;
        if (this.collectedCount >= totalNeeded) {
          this.exitUnlocked = true;
        }

        const lines = FRAGMENT_DIALOGUES[item.id];
        if (lines) {
          this.triggerDialoguePause(lines, () => {
            this.phase = 'playing';
            this.emitHud();
          });
        }
        return;
      }

      if (item.kind === 'exit') {
        if (!this.exitUnlocked) {
          if (this.layerIndex === 1) {
            this.audio.playChainRattle();
          }
          const needed = LAYER_METAS[this.layerIndex].totalTargets;
          this.triggerDialoguePause(
            [
              {
                speaker: 'Bima',
                emotion: 'Memeriksa segel',
                text: `Segel ini masih terkunci rapat. Aku masih perlu mengumpulkan ${
                  needed - this.collectedCount
                } ${LAYER_METAS[this.layerIndex].objectiveLabel.toLowerCase()} lagi di area ini.`,
              },
            ],
            () => {
              this.phase = 'playing';
              this.emitHud();
            }
          );
          return;
        }

        this.audio.playSealBreak();
        const exitLines = FRAGMENT_DIALOGUES[item.id];
        const finishLayer = () => {
          this.phase = 'mirror';
          this.clearInputs();
          if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock?.();
          }
          this.callbacks.onLayerCompleted(this.layerIndex);
        };

        if (exitLines && this.layerIndex < 3) {
          this.triggerDialoguePause(exitLines, finishLayer);
        } else {
          finishLayer();
        }
        return;
      }
    }

    if (hideSpotIdx >= 0 && this.levelData) {
      const spot = this.levelData.hidingSpots[hideSpotIdx];
      this.savedPreHidePos.copy(this.playerPos);
      this.savedPreHideYaw = this.yaw;
      this.isHiding = true;
      this.playerPos.set(spot.position.x, 1.48, spot.position.z);
      this.yaw = spot.lookOutYaw;
      this.pitch = 0;
      this.audio.playHideToggle(true);
    }
  }

  private triggerEntityAmbush(enemy: ShadowEnemy): void {
    this.jumpscareCount += 1;
    this.stability = Math.max(0, this.stability - 1);
    this.warmth = Math.max(15, this.warmth - (this.difficulty === 'story' ? 10 : 20));
    this.audio.playJumpscareShriek();
    this.audio.playGlassShatterMassive();

    if (this.stability <= 0) {
      this.startFatalCutscene();
      return;
    }

    this.jumpscareKind = 'entity';
    this.jumpscareDuration = 1.05;
    this.jumpscareTimer = this.jumpscareDuration;
    this.activeJumpscareEnemy = enemy;
    this.shakeIntensity = 0.42;
    this.strobePhase = 'red';

    // Snap enemy cleanly directly in front of player's line of sight for face ambush
    const dirX = -Math.sin(this.yaw);
    const dirZ = -Math.cos(this.yaw);
    enemy.rig.root.position.set(
      this.playerPos.x + dirX * 0.92,
      0,
      this.playerPos.z + dirZ * 0.92
    );
    enemy.rig.root.lookAt(this.playerPos.x, 0, this.playerPos.z);
    enemy.frozenTimer = 5.2;
    enemy.chasing = false;
    this.emitHud(0.9);
  }

  private finishJumpscare(): void {
    const kind = this.jumpscareKind;
    this.jumpscareKind = null;
    this.strobePhase = 'none';
    this.flashlight.color.setHex(0xfef3c7);

    if (kind === 'entity') {
      // Knock Bima slightly back safely & grant 4-second grace period
      const backX = this.playerPos.x + Math.sin(this.yaw) * 1.4;
      const backZ = this.playerPos.z + Math.cos(this.yaw) * 1.4;
      if (!this.collidesAt(backX, this.playerPos.z)) this.playerPos.x = backX;
      if (!this.collidesAt(this.playerPos.x, backZ)) this.playerPos.z = backZ;

      this.graceTimer = 4.0;
      if (this.activeJumpscareEnemy) {
        // Push entity back to far waypoint so Bima has clear breathing room
        const wp = this.activeJumpscareEnemy.waypoints[0];
        this.activeJumpscareEnemy.rig.root.position.copy(wp);
        this.activeJumpscareEnemy.frozenTimer = 4.2;
        this.activeJumpscareEnemy = null;
      }
    }
    this.emitHud();
  }

  private startFatalCutscene(): void {
    this.phase = 'cutscene';
    this.cutsceneTime = 0;
    this.cutsceneShot = 1;
    this.cutsceneDomeLoaded = false;
    this.cutsceneChordPlayed = false;
    this.cutsceneSubtitleShown = false;
    this.jumpscareTimer = 0;
    this.jumpscareKind = null;
    this.strobePhase = 'none';
    this.clearInputs();
    if (document.pointerLockElement === this.renderer.domElement) {
      document.exitPointerLock?.();
    }
    this.callbacks.onCutsceneSubtitle(null);
    this.audio.playGlassShatterMassive();
    this.audio.playJumpscareShriek();

    // Shot 1 setup: drop flashlight on floor right in front of Bima
    this.flashlight.intensity = 0;
    this.droppedFlashlight = createDroppedFlashlight();
    const fx = -Math.sin(this.yaw);
    const fz = -Math.cos(this.yaw);
    this.droppedFlashlight.group.position.set(
      this.playerPos.x + fx * 1.1,
      0.055,
      this.playerPos.z + fz * 1.1
    );
    this.droppedFlashlight.group.rotation.y = this.yaw + 0.4;
    this.scene.add(this.droppedFlashlight.group);
    this.emitHud(0.5);
  }

  private updateCutscene(dt: number, elapsed: number): void {
    this.cutsceneTime += dt;
    const t = this.cutsceneTime;
    this.updateSnow(dt, elapsed);

    // Shot 1 (0 - 3s): Camera collapses on floor tilted 75°, watching dropped flashlight roll & flicker 3x
    if (t < 3.0) {
      this.cutsceneShot = 1;
      if (this.droppedFlashlight) {
        const roll = Math.min(0.65, t * 0.28);
        this.droppedFlashlight.group.position.z -= dt * 0.14;
        this.droppedFlashlight.group.rotation.x = roll;

        // 3 distinct flickers before dying dark
        let power = 1.0;
        if ((t > 0.7 && t < 0.88) || (t > 1.35 && t < 1.54) || (t > 2.05 && t < 2.26)) {
          power = 0.08;
        } else if (t >= 2.55) {
          power = 0;
        }
        this.droppedFlashlight.beamLight.intensity = power * 6.5;
        this.droppedFlashlight.lensMat.emissiveIntensity = power * 2.2;
      }

      const dPos = this.droppedFlashlight ? this.droppedFlashlight.group.position : this.playerPos;
      this.camera.position.set(
        this.playerPos.x + Math.sin(this.yaw) * 0.35,
        THREE.MathUtils.lerp(1.3, 0.22, Math.min(1, t * 1.8)),
        this.playerPos.z + Math.cos(this.yaw) * 0.35
      );
      this.camera.lookAt(dPos.x, 0.06, dPos.z);
      // Tilt 75 degrees (approx 1.31 rad)
      this.camera.rotation.z = THREE.MathUtils.lerp(0, 1.31, Math.min(1, t * 2.2));
      this.audio.updateAmbience(dt, 0.95, 3, false, this.layerIndex, false);
      return;
    }

    // Load Glass Dome dimension once at t >= 3.0s
    if (!this.cutsceneDomeLoaded) {
      this.cutsceneDomeLoaded = true;
      this.loadLayer(3);
      this.phase = 'cutscene';
      this.flashlight.intensity = 0;
      this.camera.rotation.z = 0;
      this.fog.density = 0.065;

      // Remove normal patrol enemies so we place 5 bowing shadow figures cleanly around the dome
      if (this.levelData) {
        this.levelData.enemies.forEach((e) => {
          this.scene.remove(e.rig.root);
        });
        this.levelData.enemies = [];
        if (this.levelData.domeController) {
          this.levelData.domeController.tendrilGroup.visible = true;
          this.levelData.domeController.domeLight.color.setHex(0x3b82f6);
          this.levelData.domeController.domeLight.intensity = 3.2;
        }
      }

      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.25;
        const sh = createArticulatedShadow(this.textures, i % 2 === 0);
        sh.root.position.set(Math.cos(a) * 3.85, 0, Math.sin(a) * 3.85);
        sh.root.lookAt(0, 0, 0);
        this.scene.add(sh.root);
        this.cutsceneShadows.push(sh);
      }
      this.audio.playIceShatter();
    }

    const domeCtrl = this.levelData?.domeController;

    // Shot 2 (3 - 6s): Dark tendrils & ice spikes erupt; 5 shadows stand outside bowing toward Rindi
    if (t < 6.0) {
      this.cutsceneShot = 2;
      const localT = (t - 3.0) / 3.0;
      if (domeCtrl) {
        domeCtrl.tendrilGroup.scale.set(1, THREE.MathUtils.lerp(0.05, 1.18, Math.min(1, localT * 1.4)), 1);
        animateCharacterPose(domeCtrl.rindiRig, 'seatedHug', elapsed);
      }
      this.cutsceneShadows.forEach((sh, idx) => {
        animateCharacterPose(sh, 'shadowStalk', elapsed + idx);
        sh.torso.rotation.x = 0.35 + Math.sin(elapsed * 1.6 + idx) * 0.06;
      });
      const orbitA = 0.3 + localT * 0.7;
      this.camera.position.set(Math.sin(orbitA) * 5.6, 1.85, Math.cos(orbitA) * 5.6);
      this.camera.lookAt(0, 1.05, 0);
      this.camera.rotation.z = 0;
      this.audio.updateAmbience(dt, 1.0, 2.5, false, this.layerIndex, false);
      return;
    }

    // Shot 3 (6 - 9s): Close-up on Rindiani's face, fatal subtitle, eyelids close tightly, frost seals dome opaque
    if (t < 9.0) {
      this.cutsceneShot = 3;
      const localT = (t - 6.0) / 3.0;
      if (!this.cutsceneSubtitleShown) {
        this.cutsceneSubtitleShown = true;
        this.callbacks.onCutsceneSubtitle(CUTSCENE_FATAL_LINE);
      }
      if (domeCtrl) {
        const eyesClosed = localT > 0.42;
        animateCharacterPose(domeCtrl.rindiRig, 'seatedHug', elapsed, 1, eyesClosed);
        const domeMat = domeCtrl.domeMesh.material as THREE.MeshPhysicalMaterial;
        domeMat.transmission = 0;
        domeMat.opacity = THREE.MathUtils.lerp(0.45, 0.97, Math.max(0, (localT - 0.3) / 0.7));
        domeMat.color.setHex(0x0c1b2e);
        domeCtrl.iceRibs.scale.setScalar(1.0 + localT * 0.25);
        domeCtrl.domeLight.intensity = Math.max(0.2, 3.0 - localT * 2.7);
        if (localT > 0.92) {
          domeCtrl.rindiRig.root.visible = false;
        }
      }
      this.camera.position.set(0.18, 1.05, 1.62 + localT * 0.75);
      this.camera.lookAt(0, 0.92, 0.05);
      this.audio.updateAmbience(dt, 1.0, 2.0, false, this.layerIndex, false);
      return;
    }

    // Shot 4 (9 - 12s): Crane shot rising high into thickening blizzard + final minor chord
    if (t < 12.0) {
      this.cutsceneShot = 4;
      if (this.cutsceneSubtitleShown) {
        this.cutsceneSubtitleShown = false;
        this.callbacks.onCutsceneSubtitle(null);
      }
      if (!this.cutsceneChordPlayed) {
        this.cutsceneChordPlayed = true;
        this.audio.playCutsceneFinalChord();
      }
      const localT = (t - 9.0) / 3.0;
      this.fog.density = 0.065 + localT * 0.035;
      this.camera.position.set(
        0,
        THREE.MathUtils.lerp(2.4, 10.5, localT),
        THREE.MathUtils.lerp(4.2, 13.5, localT)
      );
      this.camera.lookAt(0, 0.8, 0);
      this.audio.updateAmbience(dt, 1.0, 99, false, this.layerIndex, false);
      return;
    }

    // End of 12s Cutscene -> Dedicated Game Over screen
    this.callbacks.onCutsceneSubtitle(null);
    this.phase = 'gameover';
    this.emitHud();
    this.callbacks.onGameOver();
  }

  private updateSnow(dt: number, elapsed: number): void {
    if (!this.snowEnabled) return;
    const snowArr = this.snowPoints.geometry.attributes.position.array as Float32Array;
    const center = this.campusScene ? 0 : this.playerPos.x;
    const centerZ = this.campusScene ? 0 : this.playerPos.z;
    const speedMult = this.phase === 'cutscene' ? 2.4 : 1.0;

    for (let i = 0; i < this.snowCount; i++) {
      const idx = i * 3;
      snowArr[idx + 1] -= this.snowSpeeds[i] * speedMult * dt;
      snowArr[idx] += Math.sin(elapsed * 0.8 + i) * 0.3 * speedMult * dt;
      if (snowArr[idx + 1] < 0) {
        snowArr[idx + 1] = 11.5;
        snowArr[idx] = center + (Math.random() - 0.5) * 34;
        snowArr[idx + 2] = centerZ + (Math.random() - 0.5) * 34;
      }
    }
    this.snowPoints.geometry.attributes.position.needsUpdate = true;
  }

  private updateDustMotes(elapsed: number): void {
    this.dustPoints.visible = !this.campusScene && this.phase === 'playing';
    if (!this.dustPoints.visible) return;
    const arr = this.dustPoints.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < this.dustCount; i++) {
      const idx = i * 3;
      arr[idx] = this.playerPos.x + this.dustBaseOffsets[idx] + Math.sin(elapsed * 0.45 + i) * 0.16;
      arr[idx + 1] = this.dustBaseOffsets[idx + 1] + Math.cos(elapsed * 0.35 + i * 0.7) * 0.12;
      arr[idx + 2] = this.playerPos.z + this.dustBaseOffsets[idx + 2] + Math.cos(elapsed * 0.42 + i) * 0.16;
    }
    this.dustPoints.geometry.attributes.position.needsUpdate = true;
  }

  private updateLivingEnvironment(dt: number, elapsed: number): void {
    if (!this.levelData) return;

    for (const anim of this.levelData.animatedObjects) {
      if (anim.mode === 'pencil') {
        anim.mesh.rotation.y += dt * 0.72;
      } else if (anim.mode === 'spinY') {
        anim.mesh.rotation.y += dt * 1.4;
      } else if (anim.mode === 'bob') {
        anim.mesh.rotation.y += dt * 0.9;
        anim.mesh.position.y += Math.sin(elapsed * 2.4) * 0.0018;
      }
    }

    // Swaying night curtains
    for (let i = 0; i < this.levelData.curtainMeshes.length; i++) {
      const c = this.levelData.curtainMeshes[i];
      c.rotation.z = Math.sin(elapsed * 1.6 + i * 1.2) * 0.055;
      c.rotation.x = Math.cos(elapsed * 1.1 + i) * 0.04;
    }

    // Erratically spinning wall clock hands
    for (const ch of this.levelData.clockHands) {
      const jitter = Math.sin(elapsed * 7.5) > 0.35 ? 1.8 : -0.4;
      if (ch.minute) ch.minute.rotation.z -= dt * (2.6 + jitter);
      if (ch.hour) ch.hour.rotation.z -= dt * 0.45;
    }

    // Flickering fluorescent tubes
    if (this.buzzCooldown > 0) this.buzzCooldown -= dt;
    for (const fl of this.levelData.flickerLights) {
      const wave = Math.sin(elapsed * 19.0 + fl.seed) * Math.sin(elapsed * 7.3 + fl.seed * 2);
      const on = wave > -0.58;
      fl.light.intensity = on ? 2.1 : 0.12;
      fl.tubeMat.emissiveIntensity = on ? 1.6 : 0.08;
      if (!on && this.buzzCooldown <= 0 && this.phase === 'playing') {
        this.buzzCooldown = 2.6;
        this.audio.playElectricBuzz();
      }
    }

    // Share-Loc floor light ripples
    for (const rip of this.levelData.beaconRipples) {
      const phase = (elapsed * 0.85) % 1;
      const sc = 0.75 + phase * 2.2;
      rip.scale.set(sc, sc, 1);
      const m = (rip as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.opacity = (1 - phase) * 0.72;
    }

    // Classroom mannequins (snap heads toward player after environmental scare triggers)
    for (const man of this.levelData.mannequins) {
      animateCharacterPose(man, 'idle', elapsed);
      if (this.mannequinsAlerted) {
        man.head.lookAt(this.playerPos.x, 1.55, this.playerPos.z);
      }
    }

    if (this.levelData.domeController) {
      animateCharacterPose(this.levelData.domeController.rindiRig, 'seatedHug', elapsed);
    }
  }

  private updateSimulation(dt: number, elapsed: number): number {
    this.updateSnow(dt, elapsed);
    this.updateDustMotes(elapsed);

    if (this.phase === 'cutscene') {
      this.updateCutscene(dt, elapsed);
      return 1;
    }

    // Campus Park Bench Scenes (Title / Prologue / Epilogue)
    if (this.campusScene) {
      this.flashlight.intensity = 0;
      if (this.phase === 'title') {
        this.titleAngle += dt * 0.14;
        const camX = Math.sin(this.titleAngle) * 4.8;
        const camZ = 1.6 + Math.cos(this.titleAngle) * 2.8;
        this.camera.position.set(camX, 1.85, camZ);
        this.camera.lookAt(0, 0.95, -1.0);
        this.camera.rotation.z = 0;
        animateCharacterPose(this.campusScene.rindiRig, 'seatedHug', elapsed);
      } else if (this.phase === 'prologue') {
        this.camera.position.set(2.55, 1.72, 2.35);
        this.camera.lookAt(0.35, 1.05, -0.5);
        this.camera.rotation.z = 0;
        animateCharacterPose(this.campusScene.rindiRig, 'seatedHug', elapsed);
        animateCharacterPose(this.campusScene.bimaRig, 'idle', elapsed);
      } else if (this.phase === 'epilogue' || this.phase === 'ending') {
        this.epilogueTime += dt;
        if (this.currentEpilogueType === 'true') {
          this.camera.position.set(0.2, 1.78, 4.4);
          this.camera.lookAt(0, 1.15, -1.5);
          const walkDist = Math.min(2.4, this.epilogueTime * 0.35);
          this.campusScene.rindiRig.root.position.z = 0.4 - walkDist;
          this.campusScene.bimaRig.root.position.z = 0.55 - walkDist;
          const pose = walkDist < 2.35 ? 'walk' : 'idle';
          animateCharacterPose(this.campusScene.rindiRig, pose, elapsed, 0.7);
          animateCharacterPose(this.campusScene.bimaRig, pose, elapsed, 0.7);
        } else {
          this.camera.position.set(2.4, 1.75, 2.4);
          this.camera.lookAt(0.1, 1.0, -0.9);
          animateCharacterPose(this.campusScene.rindiRig, 'seatedHug', elapsed);
          animateCharacterPose(this.campusScene.bimaRig, 'idle', elapsed);
        }
      }
      this.audio.updateAmbience(dt, this.frostLevel, 99, false, 0, false);
      return 99;
    }

    if (!this.levelData) return 99;

    this.updateLivingEnvironment(dt, elapsed);

    if (
      this.phase === 'dialogue' ||
      this.phase === 'paused' ||
      this.phase === 'mirror' ||
      this.phase === 'gameover'
    ) {
      this.audio.updateAmbience(dt, this.frostLevel, 99, this.isHiding, this.layerIndex, false);
      return 99;
    }

    if (this.phase !== 'playing') return 99;

    // Active Jumpscare Lock Sequence (Entity Ambush or Environmental Scare)
    if (this.jumpscareTimer > 0) {
      this.jumpscareTimer -= dt;
      const strobeTick = Math.floor(elapsed * 22) % 2;
      this.strobePhase = strobeTick === 0 ? 'red' : 'blue';
      this.flashlight.color.setHex(strobeTick === 0 ? 0xff3b3b : 0x3b82f6);
      this.flashlight.intensity = 9.0;

      if (this.jumpscareKind === 'entity' && this.activeJumpscareEnemy?.rig.maskAnchor) {
        this.activeJumpscareEnemy.rig.maskAnchor.getWorldPosition(this.jumpscareFocusPos);
      }

      const sx = (Math.random() - 0.5) * 0.14;
      const sy = (Math.random() - 0.5) * 0.14;
      this.camera.position.set(this.playerPos.x + sx, this.playerPos.y + sy, this.playerPos.z);
      this.camera.lookAt(this.jumpscareFocusPos);
      this.camera.rotation.z = (Math.random() - 0.5) * 0.12;

      if (this.jumpscareTimer <= 0) {
        this.camera.rotation.z = 0;
        this.finishJumpscare();
      }
      return 0.9;
    }

    this.flashlight.color.setHex(0xfef3c7);
    this.flashlight.intensity = 5.6;

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return 2.0;
    }

    if (this.graceTimer > 0) this.graceTimer = Math.max(0, this.graceTimer - dt);
    if (this.lanternCooldownTimer > 0) this.lanternCooldownTimer = Math.max(0, this.lanternCooldownTimer - dt);

    if (this.lanternPulseTimer > 0) {
      this.lanternPulseTimer = Math.max(0, this.lanternPulseTimer - dt);
      const t = 1 - this.lanternPulseTimer / 1.1;
      this.lanternLight.intensity = (1 - t) * 10;
      const ringMat = this.lanternRing.material as THREE.MeshBasicMaterial;
      ringMat.opacity = (1 - t) * 0.85;
      this.lanternRing.scale.setScalar(0.5 + t * 12.5);
      if (this.lanternPulseTimer <= 0) this.lanternRing.visible = false;
    }

    // Edge-triggered actions
    const pressedE = Boolean(this.justPressed['KeyE']);
    const pressedF = Boolean(this.justPressed['KeyF']);
    this.justPressed['KeyE'] = false;
    this.justPressed['KeyF'] = false;

    const closest = this.findClosestInteractable();
    if (pressedE) {
      this.handleInteract(closest.item, closest.hideSpotIdx);
    }
    if (pressedF && !this.isHiding) {
      this.triggerLenteraKonstitusi();
    }

    // Movement (Keyboard + Virtual Dual-Stick Analog)
    let moving = false;
    let sprinting = false;
    if (!this.isHiding) {
      const keyZ =
        (this.heldKeys['KeyW'] || this.heldKeys['ArrowUp'] ? 1 : 0) -
        (this.heldKeys['KeyS'] || this.heldKeys['ArrowDown'] ? 1 : 0);
      const keyX =
        (this.heldKeys['KeyD'] || this.heldKeys['ArrowRight'] ? 1 : 0) -
        (this.heldKeys['KeyA'] || this.heldKeys['ArrowLeft'] ? 1 : 0);

      let moveZ = keyZ + this.virtualMoveY;
      let moveX = keyX + this.virtualMoveX;
      const rawMag = Math.hypot(moveX, moveZ);

      if (rawMag > 0.08) {
        moving = true;
        const clampedMag = Math.min(1, rawMag);
        moveX /= rawMag;
        moveZ /= rawMag;

        const wantSprint = Boolean(
          this.heldKeys['ShiftLeft'] ||
            this.heldKeys['ShiftRight'] ||
            this.mobileAutoSprint ||
            this.mobileSprintHeld
        );
        if (wantSprint && this.stamina > 6) {
          sprinting = true;
          this.stamina = Math.max(0, this.stamina - 28 * dt);
        } else {
          this.stamina = Math.min(100, this.stamina + 12 * dt);
        }

        const speed = (sprinting ? 6.2 : 3.85) * clampedMag;
        _forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        _right.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

        _vecA.set(0, 0, 0).addScaledVector(_forward, moveZ).addScaledVector(_right, moveX);
        const nextX = this.playerPos.x + _vecA.x * speed * dt;
        const nextZ = this.playerPos.z + _vecA.z * speed * dt;

        if (!this.collidesAt(nextX, this.playerPos.z)) this.playerPos.x = nextX;
        if (!this.collidesAt(this.playerPos.x, nextZ)) this.playerPos.z = nextZ;

        this.headBobPhase += dt * (sprinting ? 13 : 8.5) * clampedMag;
      } else {
        this.stamina = Math.min(100, this.stamina + 20 * dt);
      }
    } else {
      this.stamina = Math.min(100, this.stamina + 24 * dt);
    }

    // Hinged Slamming Doors (Babak III)
    for (const ad of this.levelData.autoDoors) {
      if (!ad.triggered && this.playerPos.z < ad.triggerZ) {
        ad.triggered = true;
        this.audio.playDoorSlam();
        this.audio.playWhisperStatic();
        this.shakeIntensity = Math.max(this.shakeIntensity, 0.18);
      }
      if (ad.triggered) {
        ad.pivot.rotation.y = THREE.MathUtils.damp(ad.pivot.rotation.y, ad.targetYaw, 15, dt);
      }
    }

    // Environmental Jumpscare Triggers (Wardrobe / Mannequins / Glitch Phone)
    for (const scare of this.levelData.envScares) {
      if (!scare.fired && !this.isHiding) {
        const d = Math.hypot(this.playerPos.x - scare.position.x, this.playerPos.z - scare.position.z);
        if (d <= scare.radius) {
          scare.fired = true;
          this.jumpscareKind = scare.kind;
          this.jumpscareDuration = 0.72;
          this.jumpscareTimer = this.jumpscareDuration;
          this.jumpscareFocusPos.copy(scare.focusTarget);
          this.shakeIntensity = 0.3;

          if (scare.kind === 'wardrobe') {
            this.wardrobeSlamFired = true;
            this.audio.playDoorSlam();
            this.audio.playJumpscareShriek();
          } else if (scare.kind === 'mannequins') {
            this.mannequinsAlerted = true;
            this.audio.playMetalBang();
          } else if (scare.kind === 'glitchPhone') {
            if (scare.glitchScreenGroup) {
              scare.glitchScreenGroup.visible = true;
              scare.glitchScreenGroup.lookAt(this.playerPos.x, 1.75, this.playerPos.z);
            }
            this.audio.playNotificationGlitch();
            this.audio.playJumpscareShriek();
          }
          break;
        }
      }
      if (scare.fired && scare.kind === 'wardrobe' && this.wardrobeSlamFired) {
        if (scare.doorLeftPivot) {
          scare.doorLeftPivot.rotation.y = THREE.MathUtils.damp(scare.doorLeftPivot.rotation.y, -1.9, 16, dt);
        }
        if (scare.doorRightPivot) {
          scare.doorRightPivot.rotation.y = THREE.MathUtils.damp(scare.doorRightPivot.rotation.y, 1.9, 16, dt);
        }
      }
    }

    // Contextual Story Trigger Zones
    for (const trig of this.levelData.storyTriggers) {
      if (!trig.fired) {
        const d = Math.hypot(this.playerPos.x - trig.position.x, this.playerPos.z - trig.position.z);
        if (d <= trig.radius) {
          trig.fired = true;
          const lines = TRIGGER_DIALOGUES[trig.id];
          if (lines) {
            this.triggerDialoguePause(lines, () => {
              this.phase = 'playing';
              this.emitHud();
            });
            return 99;
          }
        }
      }
    }

    // Articulated Shadow Enemies AI
    let nearestThreat = 99;
    for (const enemy of this.levelData.enemies) {
      const ePos = enemy.rig.root.position;
      const dist = Math.hypot(ePos.x - this.playerPos.x, ePos.z - this.playerPos.z);
      if (dist < nearestThreat) nearestThreat = dist;

      const sA = enemy.rig.root.getObjectByName('orbitShardA');
      const sB = enemy.rig.root.getObjectByName('orbitShardB');
      if (sA) sA.position.y = 1.25 + Math.sin(elapsed * 3.2) * 0.16;
      if (sB) sB.position.y = 1.5 + Math.cos(elapsed * 2.8) * 0.16;

      if (enemy.frozenTimer > 0) {
        enemy.frozenTimer = Math.max(0, enemy.frozenTimer - dt);
        continue;
      }

      animateCharacterPose(enemy.rig, 'shadowStalk', elapsed);

      const detectRange = this.difficulty === 'story' ? 6.0 : 9.5 + this.frostLevel * 4.0;
      enemy.chasing = !this.isHiding && this.graceTimer <= 0 && dist < detectRange;

      const target = enemy.chasing ? this.playerPos : enemy.waypoints[enemy.currentWaypoint];
      _vecB.set(target.x - ePos.x, 0, target.z - ePos.z);
      const targetDist = _vecB.length();

      if (!enemy.chasing && targetDist < 0.65) {
        enemy.currentWaypoint = (enemy.currentWaypoint + 1) % enemy.waypoints.length;
      } else if (targetDist > 0.05) {
        _vecB.normalize();
        const moveSpd = enemy.chasing ? enemy.baseSpeed * 1.15 : enemy.baseSpeed * 0.72;
        ePos.x += _vecB.x * moveSpd * dt;
        ePos.z += _vecB.z * moveSpd * dt;
        enemy.rig.root.rotation.y = Math.atan2(_vecB.x, _vecB.z);
      }

      if (dist < 6.5 && elapsed - enemy.lastWhisperTime > 7.0) {
        enemy.lastWhisperTime = elapsed;
        this.audio.playWhisperStatic();
      }

      if (!this.isHiding && dist < 1.22 && this.graceTimer <= 0) {
        this.triggerEntityAmbush(enemy);
        return 0.9;
      }
    }

    if (nearestThreat < 5.5) {
      this.flashlight.intensity = Math.random() > 0.25 ? 5.6 : 1.5;
    }

    if (nearestThreat > 10 || this.isHiding) {
      this.warmth = Math.min(100, this.warmth + 3.0 * dt);
    }

    const bobOffset = moving && !this.isHiding ? Math.sin(this.headBobPhase) * 0.045 : 0;
    this.shakeIntensity = THREE.MathUtils.damp(this.shakeIntensity, 0, 9, dt);
    const sx = (Math.random() - 0.5) * this.shakeIntensity;
    const sy = (Math.random() - 0.5) * this.shakeIntensity;

    this.camera.position.set(this.playerPos.x + sx, this.playerPos.y + bobOffset + sy, this.playerPos.z);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = 0;

    const surface = LAYER_METAS[this.layerIndex].surface;
    this.audio.updateAmbience(dt, this.frostLevel, nearestThreat, this.isHiding, this.layerIndex, true);
    this.audio.updateFootsteps(dt, moving, sprinting, this.isHiding, surface);
    this.audio.updateHeartbeat(dt, nearestThreat, this.isHiding);

    return nearestThreat;
  }

  private emitHud(threatDistance = 99): void {
    const closest =
      this.phase === 'playing' ? this.findClosestInteractable() : { item: null, hideSpotIdx: -1 };
    let promptText: string | null = null;
    let promptSubtext: string | null = null;

    if (this.phase === 'playing') {
      if (this.isHiding) {
        promptText = '[E] Keluar dari Tempat Persembunyian';
        promptSubtext = 'Tahan napas, bayangan tidak dapat melihatmu.';
      } else if (closest.item) {
        promptText = `[E] ${closest.item.label}`;
        if (closest.item.kind === 'exit' && !this.exitUnlocked) {
          const remaining = LAYER_METAS[this.layerIndex].totalTargets - this.collectedCount;
          promptSubtext = `Masih terkunci (${remaining} ${LAYER_METAS[this.layerIndex].objectiveLabel} lagi).`;
        }
      } else if (closest.hideSpotIdx >= 0 && this.levelData) {
        promptText = `[E] Sembunyi di ${this.levelData.hidingSpots[closest.hideSpotIdx].label}`;
        promptSubtext = 'Berlindung sementara dari kejaran.';
      }
    }

    this.callbacks.onHudUpdate({
      layerIndex: this.layerIndex,
      stability: this.stability,
      maxStability: this.maxStability,
      jumpscareCount: this.jumpscareCount,
      graceTimer: this.graceTimer,
      strobePhase: this.strobePhase,
      warmth: Math.round(this.warmth),
      stamina: Math.round(this.stamina),
      lanternCooldown: this.lanternCooldownTimer / this.lanternCooldownDuration,
      lanternActive: this.lanternPulseTimer > 0,
      isHiding: this.isHiding,
      isPointerLocked: this.isPointerLocked,
      collectedCount: this.collectedCount,
      totalTargets: LAYER_METAS[this.layerIndex].totalTargets,
      exitUnlocked: this.exitUnlocked,
      frostLevel: this.frostLevel,
      threatDistance,
      promptText,
      promptSubtext,
    });
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl.fenceSync) {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private tick = (): void => {
    if (this.disposed) return;

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05);
    const elapsed = this.clock.elapsedTime;

    const threatDist = this.updateSimulation(dt, elapsed);
    this.renderer.render(this.scene, this.camera);

    this.hudEmitAccum += dt;
    if (this.hudEmitAccum >= 0.08) {
      this.hudEmitAccum = 0;
      this.emitHud(threatDist);
    }

    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private disposeObjectTree(obj: THREE.Object3D): void {
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const m = child as THREE.Mesh;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else if (m.material) {
          m.material.dispose();
        }
      }
    });
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.unbindEvents();
    this.clearActiveScenes();
    this.snowPoints.geometry.dispose();
    (this.snowPoints.material as THREE.Material).dispose();
    this.dustPoints.geometry.dispose();
    (this.dustPoints.material as THREE.Material).dispose();
    this.lanternRing.geometry.dispose();
    (this.lanternRing.material as THREE.Material).dispose();
    this.textures.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
