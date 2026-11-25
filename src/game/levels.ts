import * as THREE from 'three';
import { DifficultyMode, EndingType, LayerIndex } from '../types/game';
import {
  ArticulatedCharacterRig,
  createArticulatedPerson,
  createArticulatedShadow,
} from './characters';
import {
  createBadgeFragment,
  createBedWithBedding,
  createCampusBulletinBoard,
  createCampusTrashBin,
  createChainedBKDoor,
  createClassicStreetlamp,
  createCrackedMirrorFrame,
  createFacultyBuilding,
  createFluorescentFixture,
  createGiantPencil,
  createGlassDomeWithRindi,
  createHidingCloset,
  createIceWallSeal,
  createKbgoScreen,
  createMusicBoxFragment,
  createNightWindowCurtain,
  createPaperNoteFragment,
  createParkBench,
  createPhoneNakasFragment,
  createProtectionPillar,
  createSchoolDeskAndChair,
  createShareLocBeacon,
  createShatteredVanity,
  createSnowMoundsAndGrass,
  createWallClock,
  createWinterTree,
  createWoodenStaircase,
} from './models';
import { ProceduralTextureBank } from './textures';

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface InteractableItem {
  id: string;
  kind: 'fragment' | 'pillar' | 'exit';
  position: THREE.Vector3;
  radius: number;
  collected: boolean;
  label: string;
  mesh: THREE.Group;
}

export interface HidingSpot {
  id: string;
  position: THREE.Vector3;
  lookOutYaw: number;
  label: string;
  mesh: THREE.Group;
}

export interface ShadowEnemy {
  rig: ArticulatedCharacterRig;
  waypoints: THREE.Vector3[];
  currentWaypoint: number;
  baseSpeed: number;
  frozenTimer: number;
  chasing: boolean;
  lastWhisperTime: number;
}

export interface AutoDoorTrigger {
  triggerZ: number;
  triggered: boolean;
  pivot: THREE.Group;
  targetYaw: number;
}

export interface StoryTriggerZone {
  id: string;
  position: THREE.Vector3;
  radius: number;
  fired: boolean;
}

export interface EnvJumpscareZone {
  id: string;
  kind: 'wardrobe' | 'mannequins' | 'glitchPhone';
  position: THREE.Vector3;
  radius: number;
  fired: boolean;
  focusTarget: THREE.Vector3;
  doorLeftPivot?: THREE.Object3D;
  doorRightPivot?: THREE.Object3D;
  glitchScreenGroup?: THREE.Group;
}

export interface FlickerLightEntry {
  light: THREE.PointLight;
  tubeMat: THREE.MeshStandardMaterial;
  seed: number;
}

export interface CampusSceneResult {
  root: THREE.Group;
  rindiRig: ArticulatedCharacterRig;
  bimaRig: ArticulatedCharacterRig;
  sunLight: THREE.DirectionalLight;
  benchLamp: THREE.Group;
}

export interface LevelBuildResult {
  root: THREE.Group;
  playerSpawn: THREE.Vector3;
  playerYaw: number;
  colliders: AABB[];
  interactables: InteractableItem[];
  hidingSpots: HidingSpot[];
  enemies: ShadowEnemy[];
  mannequins: ArticulatedCharacterRig[];
  animatedObjects: { mesh: THREE.Object3D; mode: 'spinY' | 'bob' | 'pencil' }[];
  curtainMeshes: THREE.Object3D[];
  clockHands: { hour?: THREE.Object3D; minute?: THREE.Object3D }[];
  flickerLights: FlickerLightEntry[];
  beaconRipples: THREE.Object3D[];
  autoDoors: AutoDoorTrigger[];
  storyTriggers: StoryTriggerZone[];
  envScares: EnvJumpscareZone[];
  domeController?: {
    domeMesh: THREE.Mesh;
    iceRibs: THREE.Group;
    tendrilGroup: THREE.Group;
    rindiRig: ArticulatedCharacterRig;
    domeLight: THREE.PointLight;
  };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

function addBoxWall(
  parent: THREE.Group,
  colliders: AABB[],
  x: number,
  y: number,
  z: number,
  w: number,
  h: number,
  d: number,
  mat: THREE.Material
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  parent.add(mesh);
  colliders.push({
    minX: x - w / 2,
    maxX: x + w / 2,
    minZ: z - d / 2,
    maxZ: z + d / 2,
  });
  return mesh;
}

export function buildCampusParkScene(
  textures: ProceduralTextureBank,
  mode: 'title' | 'prologue' | EndingType
): CampusSceneResult {
  const root = new THREE.Group();

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({
      map: textures.campusStone,
      bumpMap: textures.campusStoneBump,
      bumpScale: 0.03,
      roughness: 0.82,
      color: mode === 'true' ? 0xdbeafe : 0xa3bdd4,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  root.add(ground);

  const walkway = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.04, 34),
    new THREE.MeshStandardMaterial({ color: 0x26313d, roughness: 0.72 })
  );
  walkway.position.set(0, 0.02, 2);
  walkway.receiveShadow = true;
  root.add(walkway);

  // Uneven snowbanks & wild grass along footpath
  root.add(
    createSnowMoundsAndGrass(textures, [
      [-2.8, 1.5],
      [2.9, 2.8],
      [-3.4, -3.5],
      [3.6, -4.2],
      [-4.8, 6.2],
      [4.5, 6.8],
    ])
  );

  // Park Bench, Trash Bin & Bulletin Board with torn posters
  const bench = createParkBench(textures);
  bench.position.set(0, 0, -1.2);
  root.add(bench);

  const trashBin = createCampusTrashBin(textures);
  trashBin.position.set(1.65, 0, -1.35);
  root.add(trashBin);

  const bulletin = createCampusBulletinBoard(textures);
  bulletin.position.set(-3.2, 0, -4.6);
  bulletin.rotation.y = 0.42;
  root.add(bulletin);

  // Classic Streetlamps
  const benchLamp = createClassicStreetlamp(textures, mode === 'true');
  benchLamp.position.set(-2.35, 0, -1.8);
  root.add(benchLamp);

  const farLamp = createClassicStreetlamp(textures, mode === 'true');
  farLamp.position.set(3.8, 0, 5.5);
  root.add(farLamp);

  // Multi-story Faculty building in background
  const faculty = createFacultyBuilding(textures);
  faculty.position.set(0, 0, -19.5);
  root.add(faculty);

  // Branched Winter Trees
  [
    [-5.5, -5.5],
    [5.8, -4.8],
    [-7.5, 3.2],
    [7.2, 4.0],
    [-11.0, -12.0],
    [11.5, -11.5],
  ].forEach(([tx, tz], idx) => {
    const tree = createWinterTree(textures);
    tree.position.set(tx, 0, tz);
    tree.rotation.y = idx * 0.9;
    root.add(tree);
  });

  // Campus wrought-iron fence
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x161e29, roughness: 0.4, metalness: 0.8 });
  const fenceBack = new THREE.Mesh(new THREE.BoxGeometry(36, 0.9, 0.12), fenceMat);
  fenceBack.position.set(0, 0.45, -11.5);
  root.add(fenceBack);

  const rindiRig = createArticulatedPerson(textures, {
    role: 'rindi',
    jacketHex: 0x1f3a5c,
    pantsHex: 0x121822,
    skinHex: 0xd6b094,
    hairHex: 0x1c1917,
    withBackpack: true,
    withHijab: true,
    withPleatedSkirt: true,
  });

  const bimaRig = createArticulatedPerson(textures, {
    role: 'bima',
    jacketHex: 0x263547,
    pantsHex: 0x141820,
    skinHex: 0xc9a182,
    hairHex: 0x151518,
    withBackpack: false,
    withHijab: false,
  });

  if (mode === 'true') {
    rindiRig.root.position.set(-0.65, 0, 0.4);
    rindiRig.root.rotation.y = 0.28;
    bimaRig.root.position.set(0.75, 0, 0.55);
    bimaRig.root.rotation.y = -0.35;
  } else {
    rindiRig.root.position.set(0, 0.05, -0.95);
    rindiRig.root.rotation.y = 0.08;
    if (mode === 'title') {
      bimaRig.root.visible = false;
    } else {
      bimaRig.root.position.set(1.45, 0, 0.65);
      bimaRig.root.rotation.y = -0.82;
    }
  }
  root.add(rindiRig.root, bimaRig.root);

  const sunLight = new THREE.DirectionalLight(
    mode === 'true' ? 0xfde68a : 0x93c5fd,
    mode === 'true' ? 1.55 : 0.35
  );
  sunLight.position.set(10, 14, 12);
  sunLight.castShadow = true;
  root.add(sunLight);

  return { root, rindiRig, bimaRig, sunLight, benchLamp };
}

export function buildLayer(
  layerIndex: LayerIndex,
  textures: ProceduralTextureBank,
  isSoftwareGl: boolean,
  frostLevel: number,
  difficulty: DifficultyMode
): LevelBuildResult {
  const root = new THREE.Group();
  const colliders: AABB[] = [];
  const interactables: InteractableItem[] = [];
  const hidingSpots: HidingSpot[] = [];
  const enemies: ShadowEnemy[] = [];
  const mannequins: ArticulatedCharacterRig[] = [];
  const animatedObjects: { mesh: THREE.Object3D; mode: 'spinY' | 'bob' | 'pencil' }[] = [];
  const curtainMeshes: THREE.Object3D[] = [];
  const clockHands: { hour?: THREE.Object3D; minute?: THREE.Object3D }[] = [];
  const flickerLights: FlickerLightEntry[] = [];
  const beaconRipples: THREE.Object3D[] = [];
  const autoDoors: AutoDoorTrigger[] = [];
  const storyTriggers: StoryTriggerZone[] = [];
  const envScares: EnvJumpscareZone[] = [];

  const speedFactor = difficulty === 'story' ? 0.58 : 1.0;

  if (layerIndex === 0) {
    // =========================================================================
    // BABAK I: Rumah Lantai Dua yang Membeku (Intimate & Detailed)
    // =========================================================================
    const floorMat = new THREE.MeshStandardMaterial({
      map: textures.frostedWood,
      bumpMap: textures.frostedWoodBump,
      bumpScale: 0.025,
      roughnessMap: textures.frostedWoodRough,
      roughness: 0.55,
      metalness: 0.08,
      color: 0xa4bdd4,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: textures.plasterWall,
      bumpMap: textures.plasterWallBump,
      bumpScale: 0.03,
      color: 0x3b4858,
      roughness: 0.85,
      metalness: 0.04,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      map: textures.frostedWood,
      bumpMap: textures.frostedWoodBump,
      bumpScale: 0.015,
      color: 0x4b3529,
      roughness: 0.68,
    });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 30), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    root.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 30),
      new THREE.MeshStandardMaterial({ color: 0x0b1018, roughness: 0.9 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 3.35;
    root.add(ceiling);

    // Narrower intimate house walls
    addBoxWall(root, colliders, 0, 1.68, 12.8, 13.8, 3.36, 0.45, wallMat);
    addBoxWall(root, colliders, 0, 1.68, -13.8, 13.8, 3.36, 0.45, wallMat);
    addBoxWall(root, colliders, -6.7, 1.68, -0.5, 0.45, 3.36, 26.8, wallMat);
    addBoxWall(root, colliders, 6.7, 1.68, -0.5, 0.45, 3.36, 26.8, wallMat);

    // Tight interior bedroom & corridor partitions
    addBoxWall(root, colliders, -2.0, 1.68, 5.8, 0.35, 3.36, 6.2, wallMat);
    addBoxWall(root, colliders, -2.0, 1.68, -3.5, 0.35, 3.36, 6.5, wallMat);
    addBoxWall(root, colliders, 2.0, 1.68, -2.5, 0.35, 3.36, 7.5, wallMat);

    // Wooden Staircase + Balustrade + Downstairs Warm Glow
    addBoxWall(root, colliders, 2.2, 0.55, 5.0, 0.22, 1.1, 5.6, trimMat);
    const stair = createWoodenStaircase(textures);
    stair.position.set(4.3, 0, 3.1);
    root.add(stair);
    const stairGlow = new THREE.PointLight(0xd4a353, 4.2, 12, 1.7);
    stairGlow.position.set(4.5, -0.6, 5.5);
    root.add(stairGlow);

    // Night windows with swaying curtains
    const win1 = createNightWindowCurtain(textures);
    win1.position.set(-6.44, 0, 3.8);
    win1.rotation.y = Math.PI / 2;
    root.add(win1);
    const cL1 = win1.getObjectByName('curtainLeft');
    const cR1 = win1.getObjectByName('curtainRight');
    if (cL1) curtainMeshes.push(cL1);
    if (cR1) curtainMeshes.push(cR1);

    const win2 = createNightWindowCurtain(textures);
    win2.position.set(6.44, 0, -6.5);
    win2.rotation.y = -Math.PI / 2;
    root.add(win2);
    const cL2 = win2.getObjectByName('curtainLeft');
    const cR2 = win2.getObjectByName('curtainRight');
    if (cL2) curtainMeshes.push(cL2);
    if (cR2) curtainMeshes.push(cR2);

    storyTriggers.push({
      id: 'stair_warmth',
      position: new THREE.Vector3(1.2, 0, 5.0),
      radius: 2.3,
      fired: false,
    });

    // Bed with carved headboard, dented pillow & rumpled fabric blanket
    const bed = createBedWithBedding(textures);
    bed.position.set(-4.8, 0, 4.0);
    bed.rotation.y = Math.PI / 2;
    root.add(bed);
    colliders.push({ minX: -6.1, maxX: -3.5, minZ: 3.0, maxZ: 5.0 });

    // Hiding Wardrobes (hinged doors)
    const closet1 = createHidingCloset(textures, 'wood');
    closet1.position.set(-1.35, 0, 7.2);
    closet1.rotation.y = Math.PI / 2;
    root.add(closet1);
    hidingSpots.push({
      id: 'hide_1_a',
      position: new THREE.Vector3(-1.35, 0, 7.2),
      lookOutYaw: -Math.PI / 2,
      label: 'Lemari Pakaian Kayu',
      mesh: closet1,
    });

    const closet2 = createHidingCloset(textures, 'wood');
    closet2.position.set(1.35, 0, -5.2);
    closet2.rotation.y = -Math.PI / 2;
    root.add(closet2);
    hidingSpots.push({
      id: 'hide_1_b',
      position: new THREE.Vector3(1.35, 0, -5.2),
      lookOutYaw: Math.PI / 2,
      label: 'Lemari Lorong Utara',
      mesh: closet2,
    });

    // Environmental Jumpscare: Wardrobe doors bang open violently as Bima approaches north hall!
    envScares.push({
      id: 'env_wardrobe',
      kind: 'wardrobe',
      position: new THREE.Vector3(0.4, 0, -5.2),
      radius: 2.4,
      fired: false,
      focusTarget: new THREE.Vector3(1.35, 1.4, -5.2),
      doorLeftPivot: closet2.getObjectByName('leftDoorPivot'),
      doorRightPivot: closet2.getObjectByName('rightDoorPivot'),
    });

    // Fragment 1: Nakas with water glass, thermometer, storybook, glowing smartphone
    const phoneMesh = createPhoneNakasFragment(textures);
    phoneMesh.position.set(-4.8, 0, 1.1);
    root.add(phoneMesh);
    const f1 = phoneMesh.getObjectByName('floatingArtifact');
    if (f1) animatedObjects.push({ mesh: f1, mode: 'bob' });
    interactables.push({
      id: 'frag_1_phone',
      kind: 'fragment',
      position: new THREE.Vector3(-4.8, 0, 1.1),
      radius: 2.3,
      collected: false,
      label: 'Periksa Ponsel di Atas Meja Nakas',
      mesh: phoneMesh,
    });

    // Fragment 2: Kotak Musik Panggilan Ibu
    const musicMesh = createMusicBoxFragment(textures);
    musicMesh.position.set(4.5, 0, -5.8);
    root.add(musicMesh);
    const f2 = musicMesh.getObjectByName('floatingArtifact');
    if (f2) animatedObjects.push({ mesh: f2, mode: 'bob' });
    interactables.push({
      id: 'frag_1_music',
      kind: 'fragment',
      position: new THREE.Vector3(4.5, 0, -5.8),
      radius: 2.3,
      collected: false,
      label: 'Ambil Kotak Musik Panggilan Ibu',
      mesh: musicMesh,
    });

    // Exit: Tembok Es Keheningan
    const iceSeal = createIceWallSeal(textures);
    iceSeal.position.set(0, 0, -12.8);
    root.add(iceSeal);
    interactables.push({
      id: 'exit_1',
      kind: 'exit',
      position: new THREE.Vector3(0, 0, -12.8),
      radius: 2.8,
      collected: false,
      label: 'Hadapi Tembok Es Keheningan',
      mesh: iceSeal,
    });

    const stalkerRig = createArticulatedShadow(textures, false);
    stalkerRig.root.position.set(-4.5, 0, -9.5);
    root.add(stalkerRig.root);
    enemies.push({
      rig: stalkerRig,
      waypoints: [
        new THREE.Vector3(-4.5, 0, -9.5),
        new THREE.Vector3(0, 0, -9.5),
        new THREE.Vector3(4.5, 0, -9.5),
        new THREE.Vector3(0, 0, -1.5),
        new THREE.Vector3(-4.5, 0, -1.5),
      ],
      currentWaypoint: 0,
      baseSpeed: (2.15 + frostLevel * 0.85) * speedFactor,
      frozenTimer: 0,
      chasing: false,
      lastWhisperTime: 0,
    });

    return {
      root,
      playerSpawn: new THREE.Vector3(0, 1.65, 10.8),
      playerYaw: 0,
      colliders,
      interactables,
      hidingSpots,
      enemies,
      mannequins,
      animatedObjects,
      curtainMeshes,
      clockHands,
      flickerLights,
      beaconRipples,
      autoDoors,
      storyTriggers,
      envScares,
      bounds: { minX: -6.2, maxX: 6.2, minZ: -13.2, maxZ: 12.2 },
    };
  }

  if (layerIndex === 1) {
    // =========================================================================
    // BABAK II: Kelas Putaran Pensil (12 Desk Sets) & Lorong Ruang BK Sempit
    // =========================================================================
    const floorMat = new THREE.MeshStandardMaterial({
      map: textures.schoolTile,
      bumpMap: textures.schoolTileBump,
      bumpScale: 0.025,
      roughnessMap: textures.schoolTileRough,
      roughness: 0.58,
      metalness: 0.1,
      color: 0xa4bed4,
    });
    const wallMat = new THREE.MeshStandardMaterial({
      map: textures.plasterWall,
      bumpMap: textures.plasterWallBump,
      bumpScale: 0.028,
      color: 0x314050,
      roughness: 0.84,
    });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 40), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -5;
    floor.receiveShadow = true;
    root.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 40),
      new THREE.MeshStandardMaterial({ color: 0x0a1017, roughness: 0.9 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.55, -5);
    root.add(ceiling);

    // Narrower intimate classroom & claustrophobic BK corridor
    addBoxWall(root, colliders, 0, 1.78, 12.2, 14.5, 3.56, 0.45, wallMat);
    addBoxWall(root, colliders, -6.9, 1.78, 3.0, 0.45, 3.56, 18.8, wallMat);
    addBoxWall(root, colliders, 6.9, 1.78, 3.0, 0.45, 3.56, 18.8, wallMat);
    addBoxWall(root, colliders, -4.4, 1.78, -6.2, 5.2, 3.56, 0.45, wallMat);
    addBoxWall(root, colliders, 4.4, 1.78, -6.2, 5.2, 3.56, 0.45, wallMat);
    addBoxWall(root, colliders, -2.35, 1.78, -15.2, 0.45, 3.56, 18.4, wallMat);
    addBoxWall(root, colliders, 2.35, 1.78, -15.2, 0.45, 3.56, 18.4, wallMat);
    addBoxWall(root, colliders, 0, 1.78, -24.2, 5.2, 3.56, 0.45, wallMat);

    // Chalkboard & Erratic Spinning Wall Clock
    const boardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 1.65, 4.4),
      new THREE.MeshStandardMaterial({ map: textures.chalkboard, roughness: 0.85 })
    );
    boardMesh.position.set(-6.58, 1.95, 2.5);
    boardMesh.rotation.y = Math.PI;
    boardMesh.rotation.x = 0.04;
    root.add(boardMesh);

    const clock = createWallClock(textures);
    clock.position.set(6.58, 2.55, 2.5);
    clock.rotation.y = -Math.PI / 2;
    root.add(clock);
    clockHands.push({
      hour: clock.getObjectByName('clockHour'),
      minute: clock.getObjectByName('clockMinute'),
    });

    // Flickering Fluorescent Tubes in classroom & narrow hallway
    [
      [0, 3.46, 5.5],
      [0, 3.46, -2.0],
      [0, 3.46, -12.5],
      [0, 3.46, -20.5],
    ].forEach(([fx, fy, fz], idx) => {
      const fl = createFluorescentFixture();
      fl.group.position.set(fx, fy, fz);
      root.add(fl.group);
      flickerLights.push({ light: fl.light, tubeMat: fl.tubeMat, seed: idx * 3.7 + 1.1 });
    });

    // 12 Sets of School Desks & Chairs with open notebooks, pencil cases, and school bags
    const deskCoords: [number, number][] = [
      [-5.1, 8.2],
      [-5.1, 5.6],
      [-5.1, 3.0],
      [-5.1, 0.4],
      [-5.1, -2.2],
      [-5.1, -4.2],
      [5.1, 8.2],
      [5.1, 5.6],
      [5.1, 3.0],
      [5.1, 0.4],
      [5.1, -2.2],
      [5.1, -4.2],
    ];
    deskCoords.forEach(([dx, dz], idx) => {
      const desk = createSchoolDeskAndChair(textures, idx % 2 === 0);
      desk.position.set(dx, 0, dz);
      desk.rotation.y = dx < 0 ? 0.14 : -0.14;
      root.add(desk);
      colliders.push({ minX: dx - 0.48, maxX: dx + 0.48, minZ: dz - 0.35, maxZ: dz + 0.65 });
    });

    // Giant Rotating Pointed Pencil at center
    const giantPencil = createGiantPencil(textures);
    giantPencil.position.set(0, 0, 2.5);
    root.add(giantPencil);
    colliders.push({ minX: -0.7, maxX: 0.7, minZ: 1.8, maxZ: 3.2 });
    const spinner = giantPencil.getObjectByName('giantPencilSpinner');
    if (spinner) animatedObjects.push({ mesh: spinner, mode: 'pencil' });

    const pencilLight = new THREE.PointLight(0xd4a353, 1.9, 8.5, 2);
    pencilLight.position.set(0, 3.0, 2.5);
    root.add(pencilLight);

    // 5 Articulated Classroom Mannequins in a circle
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2 + 0.35;
      const mx = Math.cos(ang) * 3.1;
      const mz = 2.5 + Math.sin(ang) * 3.1;
      const man = createArticulatedPerson(textures, {
        role: 'mannequin',
        jacketHex: 0x94a3b8,
        pantsHex: 0x475569,
        skinHex: 0xcbd5e1,
        hairHex: 0x64748b,
        withPleatedSkirt: i % 2 === 0,
      });
      man.root.position.set(mx, 0, mz);
      man.root.lookAt(0, 0, 2.5);
      man.head.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.22;
      root.add(man.root);
      mannequins.push(man);
      colliders.push({ minX: mx - 0.35, maxX: mx + 0.35, minZ: mz - 0.35, maxZ: mz + 0.35 });
    }

    // Environmental Jumpscare: Mannequin heads snap to stare at Bima near classroom exit
    envScares.push({
      id: 'env_mannequins',
      kind: 'mannequins',
      position: new THREE.Vector3(0, 0, -4.6),
      radius: 2.2,
      fired: false,
      focusTarget: new THREE.Vector3(0, 1.55, 2.5),
    });

    storyTriggers.push({
      id: 'bk_hallway',
      position: new THREE.Vector3(0, 0, -11.5),
      radius: 2.4,
      fired: false,
    });

    // Lockers along hallway & classroom
    const locker1 = createHidingCloset(textures, 'locker');
    locker1.position.set(3.2, 0, -4.8);
    locker1.rotation.y = -Math.PI;
    root.add(locker1);
    hidingSpots.push({
      id: 'hide_2_a',
      position: new THREE.Vector3(3.2, 0, -4.8),
      lookOutYaw: 0,
      label: 'Loker Besi Kelas',
      mesh: locker1,
    });

    const locker2 = createHidingCloset(textures, 'locker');
    locker2.position.set(-1.65, 0, -14.0);
    locker2.rotation.y = Math.PI / 2;
    root.add(locker2);
    hidingSpots.push({
      id: 'hide_2_b',
      position: new THREE.Vector3(-1.65, 0, -14.0),
      lookOutYaw: -Math.PI / 2,
      label: 'Loker Lorong BK',
      mesh: locker2,
    });

    // Decorative dented corridor lockers
    [-10.2, -17.4].forEach((lz) => {
      const decL = createHidingCloset(textures, 'locker');
      decL.position.set(1.65, 0, lz);
      decL.rotation.y = -Math.PI / 2;
      root.add(decL);
      colliders.push({ minX: 1.1, maxX: 2.2, minZ: lz - 0.65, maxZ: lz + 0.65 });
    });

    // Fragment 1 & 2
    const noteMesh = createPaperNoteFragment(textures);
    noteMesh.position.set(-3.2, 0, -2.5);
    root.add(noteMesh);
    const f1 = noteMesh.getObjectByName('floatingArtifact');
    if (f1) animatedObjects.push({ mesh: f1, mode: 'bob' });
    interactables.push({
      id: 'frag_2_note',
      kind: 'fragment',
      position: new THREE.Vector3(-3.2, 0, -2.5),
      radius: 2.3,
      collected: false,
      label: 'Ambil Catatan Undian Putaran Pensil',
      mesh: noteMesh,
    });

    const badgeMesh = createBadgeFragment(textures);
    badgeMesh.position.set(1.4, 0, -18.5);
    root.add(badgeMesh);
    const f2 = badgeMesh.getObjectByName('floatingArtifact');
    if (f2) animatedObjects.push({ mesh: f2, mode: 'bob' });
    interactables.push({
      id: 'frag_2_badge',
      kind: 'fragment',
      position: new THREE.Vector3(1.4, 0, -18.5),
      radius: 2.3,
      collected: false,
      label: 'Periksa Berkas Laporan Sekolah Membeku',
      mesh: badgeMesh,
    });

    // Exit: Double Wooden Ruang BK Door with Rusted 3D Chains & Padlock
    const chainedDoor = createChainedBKDoor(textures);
    chainedDoor.position.set(0, 0, -23.6);
    root.add(chainedDoor);
    interactables.push({
      id: 'exit_2',
      kind: 'exit',
      position: new THREE.Vector3(0, 0, -23.6),
      radius: 2.8,
      collected: false,
      label: 'Buka Rantai Pintu Ruang BK',
      mesh: chainedDoor,
    });

    const authRig = createArticulatedShadow(textures, true);
    authRig.root.position.set(0, 0, -19.5);
    root.add(authRig.root);
    enemies.push({
      rig: authRig,
      waypoints: [
        new THREE.Vector3(0, 0, -21.0),
        new THREE.Vector3(0, 0, -9.5),
        new THREE.Vector3(-3.5, 0, -2.5),
        new THREE.Vector3(3.5, 0, -2.5),
        new THREE.Vector3(0, 0, -9.5),
      ],
      currentWaypoint: 0,
      baseSpeed: (2.25 + frostLevel * 0.9) * speedFactor,
      frozenTimer: 0,
      chasing: false,
      lastWhisperTime: 0,
    });

    return {
      root,
      playerSpawn: new THREE.Vector3(0, 1.65, 10.2),
      playerYaw: 0,
      colliders,
      interactables,
      hidingSpots,
      enemies,
      mannequins,
      animatedObjects,
      curtainMeshes,
      clockHands,
      flickerLights,
      beaconRipples,
      autoDoors,
      storyTriggers,
      envScares,
      bounds: { minX: -6.3, maxX: 6.3, minZ: -23.5, maxZ: 11.6 },
    };
  }

  if (layerIndex === 2) {
    // =========================================================================
    // BABAK III: Labirin Piksel, Cermin Retak, Pintu Membanting & Suar Share-Loc
    // =========================================================================
    const floorMat = new THREE.MeshStandardMaterial({
      map: textures.mirrorGrid,
      bumpMap: textures.schoolTileBump,
      bumpScale: 0.018,
      roughness: 0.25,
      metalness: 0.45,
      color: 0x94a3b8,
    });
    const glassWallMat = new THREE.MeshPhysicalMaterial({
      map: textures.plasterWall,
      bumpMap: textures.plasterWallBump,
      bumpScale: 0.025,
      color: 0x1e293b,
      emissive: 0x1a152e,
      emissiveIntensity: 0.35,
      roughness: 0.16,
      metalness: 0.68,
      clearcoat: 0.85,
    });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 44), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -7;
    floor.receiveShadow = true;
    root.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 44),
      new THREE.MeshStandardMaterial({ color: 0x080710, roughness: 0.9 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 3.55, -7);
    root.add(ceiling);

    // Intimate narrow maze walls
    addBoxWall(root, colliders, 0, 1.78, 12.8, 16, 3.56, 0.45, glassWallMat);
    addBoxWall(root, colliders, -7.8, 1.78, -6.5, 0.45, 3.56, 39, glassWallMat);
    addBoxWall(root, colliders, 7.8, 1.78, -6.5, 0.45, 3.56, 39, glassWallMat);
    addBoxWall(root, colliders, 0, 1.78, -25.8, 16, 3.56, 0.45, glassWallMat);

    addBoxWall(root, colliders, -3.0, 1.78, 6.2, 6.8, 3.56, 0.38, glassWallMat);
    addBoxWall(root, colliders, 3.2, 1.78, 0.8, 6.8, 3.56, 0.38, glassWallMat);
    addBoxWall(root, colliders, -2.2, 1.78, -5.0, 7.8, 3.56, 0.38, glassWallMat);
    addBoxWall(root, colliders, 3.0, 1.78, -11.0, 6.8, 3.56, 0.38, glassWallMat);

    // Cracked Wall Mirror Frames & Shattered Dressing Vanity
    [
      [-7.4, 4.2, Math.PI / 2],
      [7.4, -2.8, -Math.PI / 2],
      [-7.4, -13.8, Math.PI / 2],
    ].forEach(([mx, mz, ry]) => {
      const mFrame = createCrackedMirrorFrame(textures);
      mFrame.position.set(mx, 0, mz);
      mFrame.rotation.y = ry;
      root.add(mFrame);
    });

    const vanity = createShatteredVanity(textures);
    vanity.position.set(5.8, 0, 8.2);
    vanity.rotation.y = -Math.PI / 2;
    root.add(vanity);
    colliders.push({ minX: 5.2, maxX: 6.4, minZ: 7.4, maxZ: 9.0 });

    // Hinged slamming wooden door hallway at Z = -16.2
    addBoxWall(root, colliders, -5.0, 1.78, -16.2, 6.2, 3.56, 0.45, glassWallMat);
    addBoxWall(root, colliders, 5.0, 1.78, -16.2, 6.2, 3.56, 0.45, glassWallMat);

    const doorPivot = new THREE.Group();
    doorPivot.position.set(-1.9, 0, -16.2);
    const woodDoor = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 3.2, 0.16),
      new THREE.MeshStandardMaterial({
        map: textures.frostedWood,
        bumpMap: textures.frostedWoodBump,
        bumpScale: 0.018,
        color: 0x3f2a22,
        roughness: 0.65,
      })
    );
    woodDoor.position.set(1.05, 1.6, 0);
    const handle = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xd4a353, metalness: 0.9, roughness: 0.2 })
    );
    handle.position.set(1.88, 1.08, 0.12);
    doorPivot.rotation.y = 1.1;
    doorPivot.add(woodDoor, handle);
    root.add(doorPivot);
    autoDoors.push({
      triggerZ: -17.2,
      triggered: false,
      pivot: doorPivot,
      targetYaw: 0.12,
    });

    storyTriggers.push({
      id: 'slam_house',
      position: new THREE.Vector3(0, 0, -17.5),
      radius: 2.5,
      fired: false,
    });
    storyTriggers.push({
      id: 'whisper_corridor',
      position: new THREE.Vector3(0, 0, -21.5),
      radius: 2.5,
      fired: false,
    });

    // Multiple Floating KBGO Glitch Smartphone Screens
    const screenCoords: { x: number; z: number; ry: number; m: 'A' | 'B' }[] = [
      { x: -4.2, z: 3.6, ry: 0.45, m: 'A' },
      { x: 4.2, z: -7.6, ry: -0.5, m: 'B' },
      { x: -3.8, z: -20.5, ry: Math.PI / 2, m: 'B' },
      { x: 4.4, z: 4.8, ry: -0.6, m: 'A' },
      { x: -4.4, z: -8.5, ry: 0.65, m: 'A' },
    ];
    screenCoords.forEach((sc) => {
      const scr = createKbgoScreen(textures, sc.m);
      scr.position.set(sc.x, 0, sc.z);
      scr.rotation.y = sc.ry;
      root.add(scr);
      animatedObjects.push({ mesh: scr, mode: 'bob' });
    });

    // Environmental Jumpscare: Giant Glitch Face Phone Screen Ambush near central intersection
    const ambushScreen = createKbgoScreen(textures, 'ambush');
    ambushScreen.position.set(-2.5, 0, -2.5);
    ambushScreen.rotation.y = 0.22;
    ambushScreen.visible = false;
    root.add(ambushScreen);
    envScares.push({
      id: 'env_glitchphone',
      kind: 'glitchPhone',
      position: new THREE.Vector3(-1.4, 0, -0.8),
      radius: 2.3,
      fired: false,
      focusTarget: new THREE.Vector3(-2.5, 1.75, -2.5),
      glitchScreenGroup: ambushScreen,
    });

    // Hiding Alcoves
    const hideA = createHidingCloset(textures, 'mirror');
    hideA.position.set(6.7, 0, 5.2);
    hideA.rotation.y = -Math.PI / 2;
    root.add(hideA);
    hidingSpots.push({
      id: 'hide_3_a',
      position: new THREE.Vector3(6.7, 0, 5.2),
      lookOutYaw: Math.PI / 2,
      label: 'Sekat Kaca Selatan',
      mesh: hideA,
    });

    const hideB = createHidingCloset(textures, 'mirror');
    hideB.position.set(-6.7, 0, -11.5);
    hideB.rotation.y = Math.PI / 2;
    root.add(hideB);
    hidingSpots.push({
      id: 'hide_3_b',
      position: new THREE.Vector3(-6.7, 0, -11.5),
      lookOutYaw: -Math.PI / 2,
      label: 'Sekat Kaca Utara',
      mesh: hideB,
    });

    const kbgoPhone = createPhoneNakasFragment(textures);
    kbgoPhone.position.set(-5.6, 0, 2.2);
    root.add(kbgoPhone);
    const f1 = kbgoPhone.getObjectByName('floatingArtifact');
    if (f1) animatedObjects.push({ mesh: f1, mode: 'bob' });
    interactables.push({
      id: 'frag_3_kbgo',
      kind: 'fragment',
      position: new THREE.Vector3(-5.6, 0, 2.2),
      radius: 2.3,
      collected: false,
      label: 'Amankan Bukti Pesan PAP & Rekayasa AI',
      mesh: kbgoPhone,
    });

    const shareBeacon = createShareLocBeacon(textures);
    shareBeacon.position.set(5.2, 0, -8.2);
    root.add(shareBeacon);
    const f2 = shareBeacon.getObjectByName('floatingArtifact');
    if (f2) animatedObjects.push({ mesh: f2, mode: 'spinY' });
    const rip2 = shareBeacon.getObjectByName('beaconRipple');
    if (rip2) beaconRipples.push(rip2);
    interactables.push({
      id: 'frag_3_shareloc',
      kind: 'fragment',
      position: new THREE.Vector3(5.2, 0, -8.2),
      radius: 2.4,
      collected: false,
      label: 'Aktifkan Suar Biru Share-Loc Penyelamatan',
      mesh: shareBeacon,
    });

    const exitBeacon = createShareLocBeacon(textures);
    exitBeacon.position.set(0, 0, -24.5);
    root.add(exitBeacon);
    const ripExit = exitBeacon.getObjectByName('beaconRipple');
    if (ripExit) beaconRipples.push(ripExit);
    interactables.push({
      id: 'exit_3',
      kind: 'exit',
      position: new THREE.Vector3(0, 0, -24.5),
      radius: 2.8,
      collected: false,
      label: 'Tembus Lorong Fitnah Menuju Sudut Kampus',
      mesh: exitBeacon,
    });

    const stalkerA = createArticulatedShadow(textures, false);
    stalkerA.root.position.set(4.5, 0, 3.2);
    root.add(stalkerA.root);
    enemies.push({
      rig: stalkerA,
      waypoints: [
        new THREE.Vector3(4.5, 0, 3.2),
        new THREE.Vector3(-4.5, 0, -1.5),
        new THREE.Vector3(4.5, 0, -7.0),
        new THREE.Vector3(0, 0, -2.0),
      ],
      currentWaypoint: 0,
      baseSpeed: (2.35 + frostLevel * 0.85) * speedFactor,
      frozenTimer: 0,
      chasing: false,
      lastWhisperTime: 0,
    });

    const stalkerB = createArticulatedShadow(textures, true);
    stalkerB.root.position.set(0, 0, -21.0);
    root.add(stalkerB.root);
    enemies.push({
      rig: stalkerB,
      waypoints: [
        new THREE.Vector3(-4.5, 0, -20.5),
        new THREE.Vector3(4.5, 0, -20.5),
        new THREE.Vector3(0, 0, -23.4),
      ],
      currentWaypoint: 0,
      baseSpeed: (2.2 + frostLevel * 0.85) * speedFactor,
      frozenTimer: 0,
      chasing: false,
      lastWhisperTime: 0,
    });

    return {
      root,
      playerSpawn: new THREE.Vector3(0, 1.65, 10.8),
      playerYaw: 0,
      colliders,
      interactables,
      hidingSpots,
      enemies,
      mannequins,
      animatedObjects,
      curtainMeshes,
      clockHands,
      flickerLights,
      beaconRipples,
      autoDoors,
      storyTriggers,
      envScares,
      bounds: { minX: -7.2, maxX: 7.2, minZ: -25.1, maxZ: 12.2 },
    };
  }

  // =========================================================================
  // BABAK IV: Kubah Kaca di Sudut Kampus (Masa Kini & Perlindungan Korban)
  // =========================================================================
  const groundMat = new THREE.MeshStandardMaterial({
    map: textures.campusStone,
    bumpMap: textures.campusStoneBump,
    bumpScale: 0.03,
    roughness: 0.78,
    metalness: 0.05,
    color: 0xa9c5df,
  });

  const campusGround = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), groundMat);
  campusGround.rotation.x = -Math.PI / 2;
  campusGround.receiveShadow = true;
  root.add(campusGround);

  const pathMat = new THREE.MeshStandardMaterial({ color: 0x243447, roughness: 0.68, metalness: 0.12 });
  const pathNS = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.04, 38), pathMat);
  pathNS.position.y = 0.025;
  const pathEW = new THREE.Mesh(new THREE.BoxGeometry(38, 0.04, 3.2), pathMat);
  pathEW.position.y = 0.025;
  root.add(pathNS, pathEW);

  root.add(
    createSnowMoundsAndGrass(textures, [
      [-6.5, 4.5],
      [6.5, 4.5],
      [-6.5, -4.5],
      [6.5, -4.5],
      [-15.5, 9.0],
      [15.5, -9.0],
    ])
  );

  const faculty = createFacultyBuilding(textures);
  faculty.position.set(0, 0, -29.0);
  root.add(faculty);

  const bulletin = createCampusBulletinBoard(textures);
  bulletin.position.set(3.2, 0, 12.8);
  bulletin.rotation.y = -0.35;
  root.add(bulletin);

  const trash = createCampusTrashBin(textures);
  trash.position.set(-2.2, 0, 12.5);
  root.add(trash);

  // Perimeter low wrought-iron fence & pillars
  const pillarStoneMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.7 });
  for (let i = -3; i <= 3; i++) {
    const offset = i * 6;
    [
      [offset, -19.2],
      [offset, 19.2],
      [-19.2, offset],
      [19.2, offset],
    ].forEach(([px, pz]) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.65), pillarStoneMat);
      col.position.set(px, 1.1, pz);
      root.add(col);
    });
  }
  const fenceN = new THREE.Mesh(new THREE.BoxGeometry(38, 0.9, 0.12), railMat);
  fenceN.position.set(0, 0.75, -19.2);
  const fenceS = fenceN.clone();
  fenceS.position.set(0, 0.75, 19.2);
  const fenceW = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9, 38), railMat);
  fenceW.position.set(-19.2, 0.75, 0);
  const fenceE = fenceW.clone();
  fenceE.position.set(19.2, 0.75, 0);
  root.add(fenceN, fenceS, fenceW, fenceE);

  [
    [-14, -14],
    [14, -14],
    [-14, 14],
    [14, 14],
    [-22, -6],
    [22, 6],
    [-23, 12],
    [23, -12],
  ].forEach(([tx, tz], idx) => {
    const tree = createWinterTree(textures);
    tree.position.set(tx, 0, tz);
    tree.rotation.y = idx * 1.1;
    root.add(tree);
  });

  [
    [-4.5, -14.5],
    [4.5, -14.5],
    [-14.5, 4.5],
    [14.5, -4.5],
  ].forEach(([lx, lz]) => {
    const lamp = createClassicStreetlamp(textures, false);
    lamp.position.set(lx, 0, lz);
    root.add(lamp);
  });

  const domeController = createGlassDomeWithRindi(textures, isSoftwareGl);
  domeController.group.position.set(0, 0, 0);
  root.add(domeController.group);
  colliders.push({ minX: -2.4, maxX: 2.4, minZ: -2.4, maxZ: 2.4 });

  const shelterW = createHidingCloset(textures, 'locker');
  shelterW.position.set(-14.0, 0, 0);
  shelterW.rotation.y = Math.PI / 2;
  root.add(shelterW);
  hidingSpots.push({
    id: 'hide_4_w',
    position: new THREE.Vector3(-14.0, 0, 0),
    lookOutYaw: -Math.PI / 2,
    label: 'Pos Perlindungan Barat',
    mesh: shelterW,
  });

  const shelterE = createHidingCloset(textures, 'locker');
  shelterE.position.set(14.0, 0, 0);
  shelterE.rotation.y = -Math.PI / 2;
  root.add(shelterE);
  hidingSpots.push({
    id: 'hide_4_e',
    position: new THREE.Vector3(14.0, 0, 0),
    lookOutYaw: Math.PI / 2,
    label: 'Pos Perlindungan Timur',
    mesh: shelterE,
  });

  const pillarConfigs = [
    {
      id: 'pillar_1',
      pos: new THREE.Vector3(-9.5, 0, 9.5),
      color: 0xd4a353,
      label: 'Nyalakan Pilar I: Keberanian Bersuara & Lingkar Terdekat',
    },
    {
      id: 'pillar_2',
      pos: new THREE.Vector3(9.5, 0, 9.5),
      color: 0x78a9c4,
      label: 'Nyalakan Pilar II: Ruang Aman & Satgas PPKS Proaktif',
    },
    {
      id: 'pillar_3',
      pos: new THREE.Vector3(9.5, 0, -9.5),
      color: 0xc26d43,
      label: 'Nyalakan Pilar III: Keadilan & Sanksi Tegas Tanpa Kompromi',
    },
    {
      id: 'pillar_4',
      pos: new THREE.Vector3(-9.5, 0, -9.5),
      color: 0x9b6eaf,
      label: 'Nyalakan Pilar IV: Pemulihan Psikologis & Martabat Korban',
    },
  ];

  pillarConfigs.forEach((cfg) => {
    const pMesh = createProtectionPillar(textures, cfg.color);
    pMesh.position.copy(cfg.pos);
    root.add(pMesh);
    const pFloat = pMesh.getObjectByName('floatingArtifact');
    if (pFloat) animatedObjects.push({ mesh: pFloat, mode: 'spinY' });
    interactables.push({
      id: cfg.id,
      kind: 'pillar',
      position: cfg.pos.clone(),
      radius: 2.6,
      collected: false,
      label: cfg.label,
      mesh: pMesh,
    });
  });

  interactables.push({
    id: 'exit_4_dome',
    kind: 'exit',
    position: new THREE.Vector3(0, 0, 0),
    radius: 4.1,
    collected: false,
    label: 'Sentuh Kubah Kaca untuk Membebaskan Rindi',
    mesh: domeController.group,
  });

  const shadow1 = createArticulatedShadow(textures, true);
  shadow1.root.position.set(-12, 0, -12);
  root.add(shadow1.root);
  enemies.push({
    rig: shadow1,
    waypoints: [
      new THREE.Vector3(-12, 0, -12),
      new THREE.Vector3(12, 0, -12),
      new THREE.Vector3(12, 0, 12),
      new THREE.Vector3(-12, 0, 12),
    ],
    currentWaypoint: 0,
    baseSpeed: (2.3 + frostLevel * 1.05) * speedFactor,
    frozenTimer: 0,
    chasing: false,
    lastWhisperTime: 0,
  });

  const shadow2 = createArticulatedShadow(textures, false);
  shadow2.root.position.set(12, 0, 12);
  root.add(shadow2.root);
  enemies.push({
    rig: shadow2,
    waypoints: [
      new THREE.Vector3(12, 0, 12),
      new THREE.Vector3(-12, 0, 12),
      new THREE.Vector3(-12, 0, -12),
      new THREE.Vector3(12, 0, -12),
    ],
    currentWaypoint: 0,
    baseSpeed: (2.2 + frostLevel * 0.95) * speedFactor,
    frozenTimer: 0,
    chasing: false,
    lastWhisperTime: 0,
  });

  return {
    root,
    playerSpawn: new THREE.Vector3(0, 1.65, 16.2),
    playerYaw: 0,
    colliders,
    interactables,
    hidingSpots,
    enemies,
    mannequins,
    animatedObjects,
    curtainMeshes,
    clockHands,
    flickerLights,
    beaconRipples,
    autoDoors,
    storyTriggers,
    envScares,
    domeController,
    bounds: { minX: -18.2, maxX: 18.2, minZ: -18.2, maxZ: 18.2 },
  };
}
