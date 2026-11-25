import * as THREE from 'three';
import { ProceduralTextureBank } from './textures';

export interface ArticulatedCharacterRig {
  root: THREE.Group;
  hips: THREE.Group;
  torso: THREE.Group;
  chestMesh: THREE.Mesh;
  shoulders: THREE.Group;
  head: THREE.Group;
  leftEyelid?: THREE.Mesh;
  rightEyelid?: THREE.Mesh;
  clothStrands: THREE.Object3D[];
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  maskAnchor?: THREE.Object3D;
  distortionCloud?: THREE.Points;
}

function addShadowDisc(parent: THREE.Group, tex: THREE.CanvasTexture, radius = 0.65): void {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 2, radius * 2),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
    })
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0.015;
  parent.add(plane);
}

export function createArticulatedPerson(
  textures: ProceduralTextureBank,
  opts: {
    role: 'rindi' | 'bima' | 'mannequin';
    jacketHex: number;
    pantsHex: number;
    skinHex: number;
    hairHex: number;
    withBackpack?: boolean;
    withHijab?: boolean;
    withPleatedSkirt?: boolean;
  }
): ArticulatedCharacterRig {
  const root = new THREE.Group();
  const clothStrands: THREE.Object3D[] = [];

  const skinMat = new THREE.MeshStandardMaterial({
    color: opts.skinHex,
    roughness: 0.58,
    metalness: 0.02,
  });
  const jacketMat = new THREE.MeshStandardMaterial({
    color: opts.jacketHex,
    map: textures.fabricWeave,
    bumpMap: textures.fabricBump,
    bumpScale: 0.012,
    roughnessMap: textures.fabricRough,
    roughness: 0.82,
    metalness: 0.04,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    map: textures.fabricWeave,
    roughness: 0.68,
    metalness: 0.04,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: opts.pantsHex,
    map: textures.fabricWeave,
    bumpMap: textures.fabricBump,
    bumpScale: 0.01,
    roughness: 0.85,
    metalness: 0.04,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: opts.hairHex,
    map: opts.withHijab ? textures.fabricWeave : undefined,
    bumpMap: opts.withHijab ? textures.fabricBump : undefined,
    bumpScale: 0.014,
    roughness: opts.withHijab ? 0.78 : 0.48,
    metalness: 0.06,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x0f1520,
    roughness: 0.34,
    metalness: 0.25,
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd4a353,
    roughness: 0.25,
    metalness: 0.88,
  });

  // Hips / Pelvis pivot
  const hips = new THREE.Group();
  hips.position.y = 0.88;
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.162, 0.17, 32), pantsMat);
  pelvis.castShadow = true;
  hips.add(pelvis);

  // Optional pleated skirt / jacket tail folds
  if (opts.withPleatedSkirt) {
    const skirtProfile = [
      new THREE.Vector2(0.15, 0.06),
      new THREE.Vector2(0.22, -0.14),
      new THREE.Vector2(0.27, -0.38),
    ];
    const skirt = new THREE.Mesh(new THREE.LatheGeometry(skirtProfile, 32), pantsMat);
    skirt.castShadow = true;
    hips.add(skirt);
    // Vertical pleats around skirt
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const pleat = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.38, 0.03), pantsMat);
      pleat.position.set(Math.cos(a) * 0.21, -0.18, Math.sin(a) * 0.21);
      pleat.rotation.y = -a;
      pleat.rotation.z = 0.14;
      hips.add(pleat);
    }
  }

  // Torso & Layered Almamater Jacket (Lathe profile with 36 radial segments)
  const torso = new THREE.Group();
  torso.position.y = 0.08;
  hips.add(torso);

  const torsoPts = [
    new THREE.Vector2(0.132, 0.0),
    new THREE.Vector2(0.128, 0.12),
    new THREE.Vector2(0.158, 0.28),
    new THREE.Vector2(0.168, 0.41),
    new THREE.Vector2(0.112, 0.47),
  ];
  const chestMesh = new THREE.Mesh(new THREE.LatheGeometry(torsoPts, 36), jacketMat);
  chestMesh.scale.set(1.06, 1.0, 0.82);
  chestMesh.castShadow = true;
  chestMesh.receiveShadow = true;
  torso.add(chestMesh);

  // Inner shirt V-placket + brass jacket buttons + lapels
  const shirtPanel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.03), shirtMat);
  shirtPanel.position.set(0, 0.31, 0.125);
  torso.add(shirtPanel);

  [-1, 1].forEach((side) => {
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.22, 0.025), jacketMat);
    lapel.position.set(side * 0.052, 0.33, 0.132);
    lapel.rotation.z = side * -0.22;
    torso.add(lapel);
  });

  for (let b = 0; b < 3; b++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 16), brassMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0.07 + b * 0.075, 0.14);
    torso.add(btn);
  }

  // Pocket crest on left chest
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.07, 0.015), shirtMat);
  pocket.position.set(-0.078, 0.29, 0.134);
  torso.add(pocket);

  // Shoulders Group (allows shivering micro-animation)
  const shoulders = new THREE.Group();
  shoulders.position.y = 0.41;
  torso.add(shoulders);

  // Collar fold around neck
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.024, 14, 32, Math.PI * 1.55), shirtMat);
  collar.rotation.x = Math.PI / 2;
  collar.rotation.z = -Math.PI * 0.27;
  collar.position.set(0, 0.045, 0.01);
  shoulders.add(collar);

  // Backpack / hugged bag
  if (opts.withBackpack) {
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a22,
      map: textures.fabricWeave,
      bumpMap: textures.fabricBump,
      bumpScale: 0.015,
      roughness: 0.72,
      metalness: 0.08,
    });
    const bag = new THREE.Group();
    bag.position.set(0, 0.22, 0.21);
    bag.name = 'rindiBag';
    const bagBody = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.14), bagMat);
    const bagFlap = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.09, 0.15), bagMat);
    bagFlap.position.y = 0.11;
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), brassMat);
    clasp.position.set(0, 0.06, 0.078);
    bag.add(bagBody, bagFlap, clasp);
    torso.add(bag);
  }

  // Head & Organic Facial Features (36 segments)
  const head = new THREE.Group();
  head.position.y = 0.065;
  shoulders.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.056, 0.1, 24), skinMat);
  neck.position.y = 0.035;
  head.add(neck);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.125, 36, 32), skinMat);
  cranium.scale.set(0.9, 1.07, 0.96);
  cranium.position.y = 0.17;
  cranium.castShadow = true;
  head.add(cranium);

  let leftEyelid: THREE.Mesh | undefined;
  let rightEyelid: THREE.Mesh | undefined;

  if (opts.role !== 'mannequin') {
    // Nose bridge + nostrils tip
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.048, 16), skinMat);
    nose.rotation.x = 0.35;
    nose.position.set(0, 0.16, 0.122);
    head.add(nose);

    // Subtle lips
    const lipMat = new THREE.MeshStandardMaterial({
      color: opts.role === 'rindi' ? 0x9b6668 : 0x8c5c56,
      roughness: 0.45,
    });
    const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.026, 6, 12), lipMat);
    lips.rotation.z = Math.PI / 2;
    lips.position.set(0, 0.115, 0.113);
    head.add(lips);

    // Eyebrows
    const browMat = new THREE.MeshStandardMaterial({ color: 0x181515, roughness: 0.8 });
    [-1, 1].forEach((side) => {
      const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.0045, 0.028, 4, 8), browMat);
      brow.rotation.z = Math.PI / 2 + side * 0.08;
      brow.position.set(side * 0.038, 0.205, 0.108);
      head.add(brow);
    });

    // Specular eyeballs + animatable eyelids
    const scleraMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.12 });
    const irisMat = new THREE.MeshStandardMaterial({
      color: 0x1e1815,
      roughness: 0.05,
      metalness: 0.15,
    });
    const speckMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const buildEye = (side: number) => {
      const eyeGrp = new THREE.Group();
      eyeGrp.position.set(side * 0.038, 0.18, 0.104);

      const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 14), scleraMat);
      sclera.scale.set(1.1, 0.9, 0.75);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.009, 14, 12), irisMat);
      iris.position.set(0, 0, 0.008);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 8, 8), speckMat);
      glint.position.set(0.003, 0.003, 0.0155);

      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(0.0175, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
        skinMat
      );
      lid.rotation.x = -0.2;
      lid.scale.set(1.15, 0.25, 0.82); // 0.25 open -> 1.05 closed
      lid.position.set(0, 0.004, 0.001);

      eyeGrp.add(sclera, iris, glint, lid);
      head.add(eyeGrp);
      return lid;
    };

    leftEyelid = buildEye(-1);
    rightEyelid = buildEye(1);
  }

  if (opts.withHijab) {
    // Layered soft hijab / kerudung with flowing shoulder folds
    const hood = new THREE.Mesh(
      new THREE.SphereGeometry(0.138, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.7),
      hairMat
    );
    hood.position.set(0, 0.175, -0.012);
    hood.rotation.x = -0.24;
    hood.castShadow = true;

    const drapePts = [
      new THREE.Vector2(0.115, 0.18),
      new THREE.Vector2(0.145, 0.08),
      new THREE.Vector2(0.195, -0.05),
      new THREE.Vector2(0.225, -0.18),
    ];
    const drape = new THREE.Mesh(new THREE.LatheGeometry(drapePts, 36), hairMat);
    drape.position.set(0, 0.03, -0.008);
    drape.castShadow = true;
    head.add(hood, drape);
    clothStrands.push(drape);

    // Side layered shawl tails that sway slightly
    [-1, 1].forEach((side) => {
      const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.24, 8, 14), hairMat);
      tail.position.set(side * 0.125, -0.04, 0.06);
      tail.rotation.z = side * -0.14;
      head.add(tail);
      clothStrands.push(tail);
    });
  } else {
    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.132, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hairCap.position.set(0, 0.184, -0.016);
    hairCap.rotation.x = -0.24;
    head.add(hairCap);
    for (let s = -2; s <= 2; s++) {
      const bang = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.055, 6, 10), hairMat);
      bang.position.set(s * 0.025, 0.245, 0.092);
      bang.rotation.x = 0.5;
      head.add(bang);
      clothStrands.push(bang);
    }
  }

  // Arms with folded cuffs & 5 separated fingers
  const buildArm = (side: number) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(side * 0.205, 0.0, 0);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.2, 10, 20), jacketMat);
    upper.position.y = -0.12;
    upper.castShadow = true;

    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.18, 10, 20), jacketMat);
    lower.position.set(0, -0.33, 0.02);
    lower.rotation.x = -0.16;
    lower.castShadow = true;

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.04, 20), shirtMat);
    cuff.position.set(0, -0.43, 0.035);
    cuff.rotation.x = -0.16;

    const palmGroup = new THREE.Group();
    palmGroup.position.set(0, -0.47, 0.045);
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.048, 0.042), skinMat);
    palmGroup.add(palm);

    // 4 fingers + opposable thumb
    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.0052, 0.03, 4, 8), skinMat);
      finger.position.set(0, -0.04, -0.014 + f * 0.01);
      palmGroup.add(finger);
    }
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.0055, 0.022, 4, 8), skinMat);
    thumb.position.set(-side * 0.016, -0.018, 0.02);
    thumb.rotation.x = 0.45;
    palmGroup.add(thumb);

    armPivot.add(upper, lower, cuff, palmGroup);
    shoulders.add(armPivot);
    return armPivot;
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Legs with laced shoes
  const buildLeg = (side: number) => {
    const legPivot = new THREE.Group();
    legPivot.position.set(side * 0.092, -0.04, 0);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 10, 24), pantsMat);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.3, 10, 24), pantsMat);
    shin.position.y = -0.54;
    shin.castShadow = true;

    const shoeGrp = new THREE.Group();
    shoeGrp.position.set(0, -0.78, 0.038);
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.098, 0.022, 0.205),
      new THREE.MeshStandardMaterial({ color: 0x262d38, roughness: 0.75 })
    );
    sole.position.y = -0.025;
    const upperShoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.11, 8, 16), shoeMat);
    upperShoe.rotation.x = Math.PI / 2;
    upperShoe.scale.set(1.0, 1.0, 0.72);
    shoeGrp.add(sole, upperShoe);
    for (let l = 0; l < 3; l++) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.008, 0.01), shirtMat);
      lace.position.set(0, 0.032, 0.015 + l * 0.022);
      shoeGrp.add(lace);
    }

    legPivot.add(thigh, shin, shoeGrp);
    hips.add(legPivot);
    return legPivot;
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  addShadowDisc(root, textures.contactShadow, 0.58);

  return {
    root,
    hips,
    torso,
    chestMesh,
    shoulders,
    head,
    leftEyelid,
    rightEyelid,
    clothStrands,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
  };
}

export function createArticulatedShadow(
  textures: ProceduralTextureBank,
  authorityTall: boolean
): ArticulatedCharacterRig {
  const root = new THREE.Group();
  const cloakMat = new THREE.MeshStandardMaterial({
    map: textures.shadowAsphalt,
    bumpMap: textures.shadowAsphaltBump,
    bumpScale: 0.035,
    color: 0x0a0d14,
    emissive: 0x140812,
    emissiveIntensity: 0.55,
    roughness: 0.88,
    metalness: 0.1,
  });
  const maskMat = new THREE.MeshStandardMaterial({
    map: textures.porcelainMask,
    color: 0xe2e8f0,
    roughness: 0.22,
    metalness: 0.08,
  });
  const shardMat = new THREE.MeshStandardMaterial({
    color: 0x78a9c4,
    emissive: authorityTall ? 0x991b1b : 0x1d4ed8,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.65,
  });

  const scale = authorityTall ? 1.24 : 1.06;

  // Gaunt Lathe tattered base
  const lathePts = [
    new THREE.Vector2(0.42, 0),
    new THREE.Vector2(0.28, 0.45),
    new THREE.Vector2(0.18, 0.92),
    new THREE.Vector2(0.14, 1.12),
  ];
  const hips = new THREE.Group();
  hips.position.y = 0.04;
  hips.scale.setScalar(scale);
  root.add(hips);

  const cloak = new THREE.Mesh(new THREE.LatheGeometry(lathePts, 28), cloakMat);
  cloak.castShadow = true;
  hips.add(cloak);

  const torso = new THREE.Group();
  torso.position.y = 1.06;
  hips.add(torso);

  const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.58, 24), cloakMat);
  chestMesh.position.y = 0.29;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  const shoulders = new THREE.Group();
  shoulders.position.y = 0.54;
  torso.add(shoulders);

  const head = new THREE.Group();
  head.position.y = 0.05;
  shoulders.add(head);

  // Dark gaunt skull + Mouthless Cracked Porcelain Mask
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.148, 28, 24), cloakMat);
  skull.scale.set(0.84, 1.22, 0.9);
  skull.position.y = 0.17;
  head.add(skull);

  const maskPlate = new THREE.Mesh(
    new THREE.SphereGeometry(0.136, 28, 24, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.18, Math.PI * 0.66),
    maskMat
  );
  maskPlate.scale.set(0.92, 1.18, 0.98);
  maskPlate.position.set(0, 0.17, 0.028);
  maskPlate.rotation.y = Math.PI / 2 - Math.PI * 0.38;
  // Orient front of partial sphere toward +Z
  maskPlate.rotation.y = 0;
  head.add(maskPlate);

  // Add subtle eerie pinpoint red glint inside hollow eye sockets
  const eyePinMat = new THREE.MeshBasicMaterial({ color: authorityTall ? 0xef4444 : 0x7dd3fc });
  const pinL = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), eyePinMat);
  pinL.position.set(-0.042, 0.185, 0.138);
  const pinR = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), eyePinMat);
  pinR.position.set(0.042, 0.185, 0.138);
  head.add(pinL, pinR);

  // Mask camera anchor for close-up Jumpscare ambush
  const maskAnchor = new THREE.Object3D();
  maskAnchor.position.set(0, 0.17, 0.16);
  head.add(maskAnchor);

  // Long gaunt clawed arms with 5 separated razor claws
  const makeClawArm = (side: number) => {
    const p = new THREE.Group();
    p.position.set(side * 0.24, 0, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.32, 8, 14), cloakMat);
    upper.position.y = -0.18;
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.34, 8, 14), cloakMat);
    lower.position.set(0, -0.5, 0.05);
    lower.rotation.x = -0.25;
    p.add(upper, lower);

    for (let c = 0; c < 5; c++) {
      const claw = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.14, 6), cloakMat);
      claw.position.set((c - 2) * 0.015, -0.73, 0.1);
      claw.rotation.x = Math.PI + 0.2;
      p.add(claw);
    }
    shoulders.add(p);
    return p;
  };
  const leftArm = makeClawArm(-1);
  const rightArm = makeClawArm(1);

  const leftLeg = new THREE.Group();
  const rightLeg = new THREE.Group();

  // Orbiting distortion dark particle cloud around entity
  const cloudGeo = new THREE.BufferGeometry();
  const cloudCount = 90;
  const cloudPos = new Float32Array(cloudCount * 3);
  for (let i = 0; i < cloudCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.35 + Math.random() * 0.45;
    cloudPos[i * 3] = Math.cos(a) * r;
    cloudPos[i * 3 + 1] = 0.2 + Math.random() * 1.9;
    cloudPos[i * 3 + 2] = Math.sin(a) * r;
  }
  cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
  const distortionCloud = new THREE.Points(
    cloudGeo,
    new THREE.PointsMaterial({
      color: 0x090d16,
      size: 0.09,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    })
  );
  root.add(distortionCloud);

  const shardA = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), shardMat);
  shardA.position.set(-0.48, 1.25 * scale, 0);
  shardA.name = 'orbitShardA';
  const shardB = new THREE.Mesh(new THREE.OctahedronGeometry(0.09, 0), shardMat);
  shardB.position.set(0.48, 1.5 * scale, 0);
  shardB.name = 'orbitShardB';
  root.add(shardA, shardB);

  const auraLight = new THREE.PointLight(authorityTall ? 0xdc2626 : 0x78a9c4, 1.5, 6.5, 2);
  auraLight.position.y = 1.5 * scale;
  root.add(auraLight);

  addShadowDisc(root, textures.contactShadow, 0.82);

  return {
    root,
    hips,
    torso,
    chestMesh,
    shoulders,
    head,
    clothStrands: [],
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    maskAnchor,
    distortionCloud,
  };
}

export function animateCharacterPose(
  rig: ArticulatedCharacterRig,
  mode: 'idle' | 'walk' | 'seatedHug' | 'shadowStalk',
  time: number,
  speed = 1,
  forceEyesClosed = false
): void {
  // Subtle cloth/hair wind sway
  for (let i = 0; i < rig.clothStrands.length; i++) {
    rig.clothStrands[i].rotation.z = Math.sin(time * 2.1 + i * 0.9) * 0.035;
  }

  // Natural blinking micro-animation (or forced closed during Cutscene Shot 3)
  if (rig.leftEyelid && rig.rightEyelid) {
    let lidScale = 0.24;
    if (forceEyesClosed) {
      lidScale = 1.08;
    } else {
      const blinkCycle = time % 4.3;
      if (blinkCycle > 4.12) {
        lidScale = 1.05;
      }
    }
    rig.leftEyelid.scale.y = lidScale;
    rig.rightEyelid.scale.y = lidScale;
  }

  // Chest breathing micro-animation
  const breath = 1 + Math.sin(time * 2.2) * 0.022;
  rig.chestMesh.scale.set(1.06 * breath, 1.0, 0.82 * breath);

  if (mode === 'seatedHug') {
    rig.hips.position.y = 0.46;
    rig.torso.rotation.x = 0.24 + Math.sin(time * 2.2) * 0.028;
    // Trembling cold shoulders
    rig.shoulders.position.x = Math.sin(time * 26.0) * 0.004;
    rig.shoulders.rotation.z = Math.sin(time * 18.0) * 0.012;
    rig.head.rotation.x = 0.3 + Math.sin(time * 1.4) * 0.035;
    rig.head.rotation.z = Math.sin(time * 0.7) * 0.04;
    rig.leftLeg.rotation.x = -1.35;
    rig.rightLeg.rotation.x = -1.35;
    rig.leftArm.rotation.x = -0.95;
    rig.leftArm.rotation.z = -0.36;
    rig.rightArm.rotation.x = -0.95;
    rig.rightArm.rotation.z = 0.36;
    return;
  }

  if (mode === 'walk') {
    const phase = time * 6.5 * speed;
    rig.hips.position.y = 0.88 + Math.abs(Math.sin(phase)) * 0.032;
    rig.torso.rotation.x = 0.06;
    rig.shoulders.position.x = 0;
    rig.shoulders.rotation.z = Math.sin(phase) * 0.03;
    rig.head.rotation.x = -0.02;
    rig.leftLeg.rotation.x = Math.sin(phase) * 0.55;
    rig.rightLeg.rotation.x = -Math.sin(phase) * 0.55;
    rig.leftArm.rotation.x = -Math.sin(phase) * 0.45;
    rig.rightArm.rotation.x = Math.sin(phase) * 0.45;
    rig.leftArm.rotation.z = 0.05;
    rig.rightArm.rotation.z = -0.05;
    return;
  }

  if (mode === 'shadowStalk') {
    rig.torso.rotation.x = 0.16 + Math.sin(time * 2.5) * 0.04;
    rig.head.rotation.z = Math.sin(time * 2.1) * 0.28;
    rig.leftArm.rotation.x = -0.68 + Math.sin(time * 3.1) * 0.22;
    rig.rightArm.rotation.x = -0.68 - Math.sin(time * 3.1) * 0.22;
    if (rig.distortionCloud) {
      rig.distortionCloud.rotation.y += 0.025;
    }
    return;
  }

  // Idle breathing
  rig.hips.position.y = 0.88;
  rig.torso.rotation.x = Math.sin(time * 1.8) * 0.022;
  rig.shoulders.position.x = 0;
  rig.shoulders.rotation.z = 0;
  rig.head.rotation.x = Math.sin(time * 1.8 - 0.5) * 0.025;
  rig.leftLeg.rotation.x = 0;
  rig.rightLeg.rotation.x = 0;
  rig.leftArm.rotation.x = 0.04;
  rig.rightArm.rotation.x = 0.04;
  rig.leftArm.rotation.z = 0.06;
  rig.rightArm.rotation.z = -0.06;
}
