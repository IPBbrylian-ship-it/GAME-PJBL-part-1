import * as THREE from 'three';

export interface ProceduralTextureBank {
  frostedWood: THREE.CanvasTexture;
  frostedWoodBump: THREE.CanvasTexture;
  frostedWoodRough: THREE.CanvasTexture;

  plasterWall: THREE.CanvasTexture;
  plasterWallBump: THREE.CanvasTexture;

  schoolTile: THREE.CanvasTexture;
  schoolTileBump: THREE.CanvasTexture;
  schoolTileRough: THREE.CanvasTexture;

  frostIce: THREE.CanvasTexture;
  frostIceBump: THREE.CanvasTexture;
  frostIceRough: THREE.CanvasTexture;

  fabricWeave: THREE.CanvasTexture;
  fabricBump: THREE.CanvasTexture;
  fabricRough: THREE.CanvasTexture;

  shadowAsphalt: THREE.CanvasTexture;
  shadowAsphaltBump: THREE.CanvasTexture;
  porcelainMask: THREE.CanvasTexture;

  mirrorGrid: THREE.CanvasTexture;
  campusStone: THREE.CanvasTexture;
  campusStoneBump: THREE.CanvasTexture;
  facultyFacade: THREE.CanvasTexture;
  chalkboard: THREE.CanvasTexture;
  bulletinBoard: THREE.CanvasTexture;
  clockFace: THREE.CanvasTexture;

  snowParticle: THREE.CanvasTexture;
  dustMote: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  bkSign: THREE.CanvasTexture;
  kbgoScreenA: THREE.CanvasTexture;
  kbgoScreenB: THREE.CanvasTexture;
  glitchFaceScreen: THREE.CanvasTexture;
  dispose: () => void;
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  repeatX = 1,
  repeatY = 1,
  isColor = true
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

function createPairedCanvas(size = 256): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return [c, c.getContext('2d')!];
}

export function createProceduralTextureBank(renderer: THREE.WebGLRenderer): ProceduralTextureBank {
  const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const allTextures: THREE.CanvasTexture[] = [];
  const reg = (t: THREE.CanvasTexture) => {
    allTextures.push(t);
    return t;
  };

  // 1. Frosted Dark Wood Grain (Color + Bump + Roughness)
  const [woodC, wCtx] = createPairedCanvas(256);
  const [woodBC, wbCtx] = createPairedCanvas(256);
  const [woodRC, wrCtx] = createPairedCanvas(256);
  wCtx.fillStyle = '#251e1a';
  wCtx.fillRect(0, 0, 256, 256);
  wbCtx.fillStyle = '#909090';
  wbCtx.fillRect(0, 0, 256, 256);
  wrCtx.fillStyle = '#888888'; // medium roughness wood
  wrCtx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 32) {
    wCtx.fillStyle = y % 64 === 0 ? '#312620' : '#211915';
    wCtx.fillRect(0, y, 256, 30);
    wCtx.fillStyle = '#0c0908';
    wCtx.fillRect(0, y + 30, 256, 2);

    wbCtx.fillStyle = '#202020';
    wbCtx.fillRect(0, y + 30, 256, 2);

    for (let i = 0; i < 28; i++) {
      const rx = Math.random() * 256;
      const ry = y + Math.random() * 28;
      const rw = 22 + Math.random() * 68;
      const isIce = i % 5 === 0;
      wCtx.fillStyle = isIce ? 'rgba(186, 224, 248, 0.14)' : 'rgba(10, 7, 5, 0.34)';
      wCtx.fillRect(rx, ry, rw, 1.5);

      wbCtx.fillStyle = isIce ? '#d4d4d4' : '#585858';
      wbCtx.fillRect(rx, ry, rw, 1.5);

      wrCtx.fillStyle = isIce ? '#282828' : '#b8b8b8'; // ice patches glossy, grain matte
      wrCtx.fillRect(rx, ry, rw, 3);
    }
  }
  const frostedWood = reg(finalizeTexture(woodC, maxAniso, 4, 4, true));
  const frostedWoodBump = reg(finalizeTexture(woodBC, maxAniso, 4, 4, false));
  const frostedWoodRough = reg(finalizeTexture(woodRC, maxAniso, 4, 4, false));

  // 2. Cracked Damp Wall Plaster (Color + Bump)
  const [plasterC, pCtx] = createPairedCanvas(256);
  const [plasterBC, pbCtx] = createPairedCanvas(256);
  pCtx.fillStyle = '#1b232f';
  pCtx.fillRect(0, 0, 256, 256);
  pbCtx.fillStyle = '#888888';
  pbCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 4 + Math.random() * 18;
    pCtx.fillStyle = i % 3 === 0 ? 'rgba(11, 16, 23, 0.35)' : 'rgba(130, 155, 178, 0.08)';
    pCtx.beginPath();
    pCtx.arc(x, y, r, 0, Math.PI * 2);
    pCtx.fill();
    pbCtx.fillStyle = i % 2 === 0 ? 'rgba(100,100,100,0.3)' : 'rgba(165,165,165,0.25)';
    pbCtx.beginPath();
    pbCtx.arc(x, y, r * 0.8, 0, Math.PI * 2);
    pbCtx.fill();
  }
  for (let c = 0; c < 18; c++) {
    let cx = Math.random() * 256;
    let cy = Math.random() * 256;
    pCtx.strokeStyle = 'rgba(7, 10, 15, 0.65)';
    pbCtx.strokeStyle = '#141414';
    pCtx.lineWidth = 1.2;
    pbCtx.lineWidth = 1.8;
    pCtx.beginPath();
    pbCtx.beginPath();
    pCtx.moveTo(cx, cy);
    pbCtx.moveTo(cx, cy);
    for (let s = 0; s < 5; s++) {
      cx += (Math.random() - 0.5) * 44;
      cy += (Math.random() - 0.5) * 44;
      pCtx.lineTo(cx, cy);
      pbCtx.lineTo(cx, cy);
    }
    pCtx.stroke();
    pbCtx.stroke();
  }
  const plasterWall = reg(finalizeTexture(plasterC, maxAniso, 3, 2, true));
  const plasterWallBump = reg(finalizeTexture(plasterBC, maxAniso, 3, 2, false));

  // 3. Cracked School Tiles (Color + Bump + Roughness)
  const [tileC, tCtx] = createPairedCanvas(256);
  const [tileBC, tbCtx] = createPairedCanvas(256);
  const [tileRC, trCtx] = createPairedCanvas(256);
  tCtx.fillStyle = '#182029';
  tCtx.fillRect(0, 0, 256, 256);
  tbCtx.fillStyle = '#303030';
  tbCtx.fillRect(0, 0, 256, 256);
  trCtx.fillStyle = '#909090';
  trCtx.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      tCtx.fillStyle = (r + c) % 2 === 0 ? '#27323f' : '#1b242e';
      tCtx.fillRect(c * 64 + 2, r * 64 + 2, 60, 60);
      tbCtx.fillStyle = '#a8a8a8';
      tbCtx.fillRect(c * 64 + 2, r * 64 + 2, 60, 60);
      trCtx.fillStyle = (r + c) % 2 === 0 ? '#505050' : '#686868';
      trCtx.fillRect(c * 64 + 2, r * 64 + 2, 60, 60);
      if ((r + c * 3) % 2 === 0) {
        tCtx.strokeStyle = 'rgba(148, 194, 224, 0.28)';
        tbCtx.strokeStyle = '#181818';
        tCtx.lineWidth = 1.4;
        tbCtx.lineWidth = 2.0;
        tCtx.beginPath();
        tbCtx.beginPath();
        tCtx.moveTo(c * 64 + 10, r * 64 + 8);
        tbCtx.moveTo(c * 64 + 10, r * 64 + 8);
        tCtx.lineTo(c * 64 + 38, r * 64 + 35);
        tbCtx.lineTo(c * 64 + 38, r * 64 + 35);
        tCtx.lineTo(c * 64 + 56, r * 64 + 28);
        tbCtx.lineTo(c * 64 + 56, r * 64 + 28);
        tCtx.stroke();
        tbCtx.stroke();
      }
    }
  }
  const schoolTile = reg(finalizeTexture(tileC, maxAniso, 6, 6, true));
  const schoolTileBump = reg(finalizeTexture(tileBC, maxAniso, 6, 6, false));
  const schoolTileRough = reg(finalizeTexture(tileRC, maxAniso, 6, 6, false));

  // 4. Scratched Crystalline Frost Ice (Color + Bump + Roughness)
  const [iceC, iCtx] = createPairedCanvas(256);
  const [iceBC, ibCtx] = createPairedCanvas(256);
  const [iceRC, irCtx] = createPairedCanvas(256);
  iCtx.fillStyle = '#7db5d4';
  iCtx.fillRect(0, 0, 256, 256);
  ibCtx.fillStyle = '#808080';
  ibCtx.fillRect(0, 0, 256, 256);
  irCtx.fillStyle = '#2c2c2c';
  irCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 85; i++) {
    const x1 = Math.random() * 256;
    const y1 = Math.random() * 256;
    const x2 = x1 + (Math.random() - 0.5) * 95;
    const y2 = y1 + (Math.random() - 0.5) * 95;
    iCtx.strokeStyle = i % 2 === 0 ? 'rgba(235, 248, 255, 0.48)' : 'rgba(20, 62, 96, 0.36)';
    ibCtx.strokeStyle = i % 2 === 0 ? '#e8e8e8' : '#252525';
    irCtx.strokeStyle = i % 2 === 0 ? '#909090' : '#1a1a1a';
    iCtx.lineWidth = 1 + Math.random() * 1.6;
    ibCtx.lineWidth = 1.4;
    irCtx.lineWidth = 2.0;
    [iCtx, ibCtx, irCtx].forEach((ctx) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });
  }
  const frostIce = reg(finalizeTexture(iceC, maxAniso, 2, 2, true));
  const frostIceBump = reg(finalizeTexture(iceBC, maxAniso, 2, 2, false));
  const frostIceRough = reg(finalizeTexture(iceRC, maxAniso, 2, 2, false));

  // 5. Woven Fabric Pores & Folds (Color + Bump + Roughness)
  const [fabC, fCtx] = createPairedCanvas(128);
  const [fabBC, fbCtx] = createPairedCanvas(128);
  const [fabRC, frCtx] = createPairedCanvas(128);
  fCtx.fillStyle = '#d4dce6';
  fCtx.fillRect(0, 0, 128, 128);
  fbCtx.fillStyle = '#707070';
  fbCtx.fillRect(0, 0, 128, 128);
  frCtx.fillStyle = '#c8c8c8';
  frCtx.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 3) {
    fCtx.fillStyle = 'rgba(15, 23, 42, 0.14)';
    fCtx.fillRect(0, y, 128, 1);
    fbCtx.fillStyle = y % 6 === 0 ? '#c0c0c0' : '#404040';
    fbCtx.fillRect(0, y, 128, 1);
  }
  for (let x = 0; x < 128; x += 3) {
    fCtx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    fCtx.fillRect(x, 0, 1, 128);
    fbCtx.fillStyle = x % 6 === 0 ? '#b0b0b0' : '#484848';
    fbCtx.fillRect(x, 0, 1, 128);
  }
  const fabricWeave = reg(finalizeTexture(fabC, maxAniso, 4, 4, true));
  const fabricBump = reg(finalizeTexture(fabBC, maxAniso, 4, 4, false));
  const fabricRough = reg(finalizeTexture(fabRC, maxAniso, 4, 4, false));

  // 6. Shadow Entity Cracked Smoke/Asphalt + Mouthless Cracked Porcelain Mask
  const [ashC, aCtx] = createPairedCanvas(256);
  const [ashBC, abCtx] = createPairedCanvas(256);
  aCtx.fillStyle = '#06080e';
  aCtx.fillRect(0, 0, 256, 256);
  abCtx.fillStyle = '#606060';
  abCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 42; i++) {
    let x = Math.random() * 256;
    let y = Math.random() * 256;
    aCtx.strokeStyle = i % 3 === 0 ? 'rgba(185, 28, 28, 0.45)' : 'rgba(100, 145, 175, 0.25)';
    abCtx.strokeStyle = '#101010';
    aCtx.lineWidth = 1.5;
    abCtx.lineWidth = 2.6;
    aCtx.beginPath();
    abCtx.beginPath();
    aCtx.moveTo(x, y);
    abCtx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (Math.random() - 0.5) * 52;
      y += (Math.random() - 0.5) * 52;
      aCtx.lineTo(x, y);
      abCtx.lineTo(x, y);
    }
    aCtx.stroke();
    abCtx.stroke();
  }
  const shadowAsphalt = reg(finalizeTexture(ashC, maxAniso, 2, 2, true));
  const shadowAsphaltBump = reg(finalizeTexture(ashBC, maxAniso, 2, 2, false));

  const [maskC, pmCtx] = createPairedCanvas(256);
  pmCtx.fillStyle = '#d9dfe6';
  pmCtx.fillRect(0, 0, 256, 256);
  // Subtle grime & hairline porcelain fractures (NO MOUTH)
  for (let i = 0; i < 60; i++) {
    pmCtx.fillStyle = 'rgba(30, 41, 59, 0.08)';
    pmCtx.beginPath();
    pmCtx.arc(Math.random() * 256, Math.random() * 256, 4 + Math.random() * 14, 0, Math.PI * 2);
    pmCtx.fill();
  }
  pmCtx.strokeStyle = '#1e293b';
  pmCtx.lineWidth = 2.2;
  [
    [40, 20, 96, 84, 88, 128, 118, 180],
    [210, 35, 165, 92, 182, 145, 148, 210],
    [128, 140, 134, 195, 122, 240],
  ].forEach((pts) => {
    pmCtx.beginPath();
    pmCtx.moveTo(pts[0], pts[1]);
    for (let k = 2; k < pts.length; k += 2) {
      pmCtx.lineTo(pts[k], pts[k + 1]);
    }
    pmCtx.stroke();
  });
  // Hollow black eyeholes on mask
  pmCtx.fillStyle = '#030508';
  pmCtx.beginPath();
  pmCtx.ellipse(90, 110, 20, 14, -0.12, 0, Math.PI * 2);
  pmCtx.fill();
  pmCtx.beginPath();
  pmCtx.ellipse(166, 110, 20, 14, 0.12, 0, Math.PI * 2);
  pmCtx.fill();
  const porcelainMask = reg(finalizeTexture(maskC, maxAniso, 1, 1, true));
  porcelainMask.wrapS = THREE.ClampToEdgeWrapping;
  porcelainMask.wrapT = THREE.ClampToEdgeWrapping;

  // 7. Mirror / Digital Pixel Grid (Babak III)
  const [mirC, mCtx] = createPairedCanvas(256);
  mCtx.fillStyle = '#0e1420';
  mCtx.fillRect(0, 0, 256, 256);
  mCtx.strokeStyle = 'rgba(120, 169, 196, 0.24)';
  mCtx.lineWidth = 1;
  for (let i = 0; i <= 256; i += 32) {
    mCtx.beginPath();
    mCtx.moveTo(i, 0);
    mCtx.lineTo(i, 256);
    mCtx.stroke();
    mCtx.beginPath();
    mCtx.moveTo(0, i);
    mCtx.lineTo(256, i);
    mCtx.stroke();
  }
  for (let i = 0; i < 48; i++) {
    mCtx.fillStyle = i % 2 === 0 ? 'rgba(120, 169, 196, 0.14)' : 'rgba(139, 92, 166, 0.16)';
    mCtx.fillRect(Math.floor(Math.random() * 16) * 16, Math.floor(Math.random() * 16) * 16, 14, 14);
  }
  const mirrorGrid = reg(finalizeTexture(mirC, maxAniso, 4, 4, true));

  // 8. Snowy Campus Ground (Color + Bump)
  const [stC, sCtx] = createPairedCanvas(256);
  const [stBC, sbCtx] = createPairedCanvas(256);
  sCtx.fillStyle = '#182330';
  sCtx.fillRect(0, 0, 256, 256);
  sbCtx.fillStyle = '#707070';
  sbCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 420; i++) {
    const shade = 26 + Math.floor(Math.random() * 34);
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const w = 8 + Math.random() * 18;
    sCtx.fillStyle = `rgba(${shade}, ${shade + 14}, ${shade + 28}, 0.48)`;
    sCtx.fillRect(x, y, w, w);
    sbCtx.fillStyle = i % 2 === 0 ? '#a2a2a2' : '#555555';
    sbCtx.fillRect(x, y, w * 0.8, w * 0.8);
  }
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 13;
    sCtx.fillStyle = 'rgba(218, 232, 245, 0.18)';
    sCtx.beginPath();
    sCtx.arc(x, y, r, 0, Math.PI * 2);
    sCtx.fill();
  }
  const campusStone = reg(finalizeTexture(stC, maxAniso, 16, 16, true));
  const campusStoneBump = reg(finalizeTexture(stBC, maxAniso, 16, 16, false));

  // 9. Faculty Facade
  const facCanvas = document.createElement('canvas');
  facCanvas.width = 512;
  facCanvas.height = 256;
  const faCtx = facCanvas.getContext('2d')!;
  faCtx.fillStyle = '#121923';
  faCtx.fillRect(0, 0, 512, 256);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      const lit = (row * 7 + col * 3) % 5 === 0;
      faCtx.fillStyle = lit ? 'rgba(212, 163, 83, 0.5)' : '#090e16';
      faCtx.fillRect(26 + col * 60, 28 + row * 72, 34, 46);
      faCtx.strokeStyle = '#334155';
      faCtx.lineWidth = 2;
      faCtx.strokeRect(26 + col * 60, 28 + row * 72, 34, 46);
    }
  }
  const facultyFacade = reg(finalizeTexture(facCanvas, maxAniso, 2, 1, true));

  // 10. Chalkboard
  const cbCanvas = document.createElement('canvas');
  cbCanvas.width = 512;
  cbCanvas.height = 256;
  const cbCtx = cbCanvas.getContext('2d')!;
  cbCtx.fillStyle = '#10201a';
  cbCtx.fillRect(0, 0, 512, 256);
  cbCtx.fillStyle = 'rgba(226, 232, 240, 0.25)';
  for (let i = 0; i < 45; i++) {
    cbCtx.fillRect(Math.random() * 512, Math.random() * 256, 24 + Math.random() * 60, 2);
  }
  cbCtx.fillStyle = 'rgba(226, 232, 240, 0.56)';
  cbCtx.font = 'italic 26px Georgia, serif';
  cbCtx.fillText('“Cuma bercanda...”', 42, 92);
  cbCtx.font = '20px Courier New, monospace';
  cbCtx.fillStyle = 'rgba(248, 113, 113, 0.6)';
  cbCtx.fillText('PUTAR PENSILNYA -> SIAPA SASARAN HARI INI?', 42, 164);
  const chalkboard = reg(finalizeTexture(cbCanvas, maxAniso, 1, 1, true));
  chalkboard.wrapS = THREE.ClampToEdgeWrapping;
  chalkboard.wrapT = THREE.ClampToEdgeWrapping;

  // 11. Campus Bulletin Board with Torn Posters
  const bbCanvas = document.createElement('canvas');
  bbCanvas.width = 512;
  bbCanvas.height = 256;
  const bbCtx = bbCanvas.getContext('2d')!;
  bbCtx.fillStyle = '#3b2b20';
  bbCtx.fillRect(0, 0, 512, 256);
  const flyers = [
    { x: 24, y: 20, w: 120, h: 150, col: '#cbd5e1', txt: 'PENGUMUMAN' },
    { x: 170, y: 34, w: 135, h: 170, col: '#e2d7c5', txt: 'RUANG AMAN?' },
    { x: 332, y: 24, w: 145, h: 145, col: '#94a3b8', txt: 'JANGAN BUNGKAM' },
  ];
  flyers.forEach((f) => {
    bbCtx.fillStyle = f.col;
    bbCtx.fillRect(f.x, f.y, f.w, f.h);
    bbCtx.fillStyle = '#0f172a';
    bbCtx.font = 'bold 14px Courier New, monospace';
    bbCtx.fillText(f.txt, f.x + 10, f.y + 32);
    // torn bottom edge
    bbCtx.fillStyle = '#3b2b20';
    bbCtx.beginPath();
    bbCtx.moveTo(f.x, f.y + f.h);
    bbCtx.lineTo(f.x + f.w * 0.45, f.y + f.h - 22);
    bbCtx.lineTo(f.x + f.w, f.y + f.h);
    bbCtx.fill();
  });
  const bulletinBoard = reg(finalizeTexture(bbCanvas, maxAniso, 1, 1, true));
  bulletinBoard.wrapS = THREE.ClampToEdgeWrapping;
  bulletinBoard.wrapT = THREE.ClampToEdgeWrapping;

  // 12. Classroom Wall Clock Face
  const [clkC, ckCtx] = createPairedCanvas(256);
  ckCtx.fillStyle = '#e2e8f0';
  ckCtx.beginPath();
  ckCtx.arc(128, 128, 122, 0, Math.PI * 2);
  ckCtx.fill();
  ckCtx.strokeStyle = '#0f172a';
  ckCtx.lineWidth = 8;
  ckCtx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ckCtx.beginPath();
    ckCtx.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92);
    ckCtx.lineTo(128 + Math.cos(a) * 108, 128 + Math.sin(a) * 108);
    ckCtx.lineWidth = 4;
    ckCtx.stroke();
  }
  const clockFace = reg(finalizeTexture(clkC, maxAniso, 1, 1, true));
  clockFace.wrapS = THREE.ClampToEdgeWrapping;
  clockFace.wrapT = THREE.ClampToEdgeWrapping;

  // 13. Snow & Dust Mote Sprites
  const [snowC, snCtx] = createPairedCanvas(64);
  const snGrad = snCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
  snGrad.addColorStop(0, 'rgba(235, 248, 255, 1)');
  snGrad.addColorStop(0.45, 'rgba(186, 230, 253, 0.6)');
  snGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
  snCtx.fillStyle = snGrad;
  snCtx.fillRect(0, 0, 64, 64);
  const snowParticle = reg(finalizeTexture(snowC, 1, 1, 1, true));
  snowParticle.wrapS = THREE.ClampToEdgeWrapping;
  snowParticle.wrapT = THREE.ClampToEdgeWrapping;

  const [dustC, duCtx] = createPairedCanvas(32);
  const duGrad = duCtx.createRadialGradient(16, 16, 1, 16, 16, 14);
  duGrad.addColorStop(0, 'rgba(255, 244, 214, 0.95)');
  duGrad.addColorStop(0.5, 'rgba(186, 214, 235, 0.4)');
  duGrad.addColorStop(1, 'rgba(186, 214, 235, 0)');
  duCtx.fillStyle = duGrad;
  duCtx.fillRect(0, 0, 32, 32);
  const dustMote = reg(finalizeTexture(dustC, 1, 1, 1, true));
  dustMote.wrapS = THREE.ClampToEdgeWrapping;
  dustMote.wrapT = THREE.ClampToEdgeWrapping;

  // 14. Contact Shadow Radial Texture
  const [shC, shCtx] = createPairedCanvas(128);
  const shGrad = shCtx.createRadialGradient(64, 64, 8, 64, 64, 62);
  shGrad.addColorStop(0, 'rgba(2, 6, 14, 0.82)');
  shGrad.addColorStop(0.6, 'rgba(2, 6, 14, 0.38)');
  shGrad.addColorStop(1, 'rgba(2, 6, 14, 0)');
  shCtx.fillStyle = shGrad;
  shCtx.fillRect(0, 0, 128, 128);
  const contactShadow = reg(finalizeTexture(shC, 1, 1, 1, true));
  contactShadow.wrapS = THREE.ClampToEdgeWrapping;
  contactShadow.wrapT = THREE.ClampToEdgeWrapping;

  // 15. Ruang BK Sign
  const bkCanvas = document.createElement('canvas');
  bkCanvas.width = 512;
  bkCanvas.height = 192;
  const bCtx = bkCanvas.getContext('2d')!;
  bCtx.fillStyle = '#141920';
  bCtx.fillRect(0, 0, 512, 192);
  bCtx.strokeStyle = '#94a3b8';
  bCtx.lineWidth = 6;
  bCtx.strokeRect(8, 8, 496, 176);
  bCtx.fillStyle = '#e2e8f0';
  bCtx.font = 'bold 34px Georgia, serif';
  bCtx.textAlign = 'center';
  bCtx.fillText('RUANG BK', 256, 76);
  bCtx.fillStyle = '#fca5a5';
  bCtx.font = 'bold 24px Courier New, monospace';
  bCtx.fillText('"TAKUT DIHAKIMI"', 256, 134);
  const bkSign = reg(finalizeTexture(bkCanvas, maxAniso, 1, 1, true));
  bkSign.wrapS = THREE.ClampToEdgeWrapping;
  bkSign.wrapT = THREE.ClampToEdgeWrapping;

  // 16. KBGO & Glitch Face Ambush Screens
  const makeKbgoCanvas = (headline: string, subline: string, accent: string, isAmbush = false) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 320;
    const g = c.getContext('2d')!;
    g.fillStyle = isAmbush ? '#160409' : '#0d0914';
    g.fillRect(0, 0, 512, 320);
    for (let i = 0; i < 28; i++) {
      g.fillStyle = isAmbush ? 'rgba(220, 38, 38, 0.25)' : 'rgba(155, 110, 175, 0.16)';
      g.fillRect(0, Math.random() * 320, 512, 4 + Math.random() * 12);
    }
    g.strokeStyle = accent;
    g.lineWidth = 5;
    g.strokeRect(18, 18, 476, 284);
    if (isAmbush) {
      // Uncanny glitched distorted face silhouette for giant phone jumpscare
      g.fillStyle = '#e2e8f0';
      g.beginPath();
      g.ellipse(256, 145, 78, 102, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#020617';
      g.beginPath();
      g.ellipse(222, 128, 18, 13, -0.15, 0, Math.PI * 2);
      g.ellipse(290, 128, 18, 13, 0.15, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#dc2626';
      g.fillRect(216, 126, 12, 4);
      g.fillRect(284, 126, 12, 4);
      g.fillStyle = '#090d14';
      g.font = 'bold 24px Courier New, monospace';
      g.textAlign = 'center';
      g.fillText('SUDAH TERSEBAR', 256, 282);
    } else {
      g.fillStyle = 'rgba(196, 181, 253, 0.35)';
      g.beginPath();
      g.arc(96, 130, 32, 0, Math.PI * 2);
      g.fill();
      g.fillRect(58, 170, 76, 86);
      g.fillStyle = '#f1f5f9';
      g.font = 'bold 26px Courier New, monospace';
      g.fillText(headline, 160, 118);
      g.fillStyle = '#cbd5e1';
      g.font = '18px Georgia, serif';
      g.fillText(subline, 160, 162);
      g.fillStyle = '#fca5a5';
      g.font = 'bold 16px Courier New, monospace';
      g.fillText('[!] REKAYASA FOTO AI / PEMAKSAAN', 160, 224);
    }
    const tex = reg(finalizeTexture(c, maxAniso, 1, 1, true));
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  const kbgoScreenA = makeKbgoCanvas('KIRIM PAP SEKARANG', 'Jika menolak, foto disebar...', '#9b6eaf');
  const kbgoScreenB = makeKbgoCanvas('BISIKAN FITNAH', 'Slut-shaming di grup kampus', '#78a9c4');
  const glitchFaceScreen = makeKbgoCanvas('ERROR', '', '#dc2626', true);

  return {
    frostedWood,
    frostedWoodBump,
    frostedWoodRough,
    plasterWall,
    plasterWallBump,
    schoolTile,
    schoolTileBump,
    schoolTileRough,
    frostIce,
    frostIceBump,
    frostIceRough,
    fabricWeave,
    fabricBump,
    fabricRough,
    shadowAsphalt,
    shadowAsphaltBump,
    porcelainMask,
    mirrorGrid,
    campusStone,
    campusStoneBump,
    facultyFacade,
    chalkboard,
    bulletinBoard,
    clockFace,
    snowParticle,
    dustMote,
    contactShadow,
    bkSign,
    kbgoScreenA,
    kbgoScreenB,
    glitchFaceScreen,
    dispose: () => {
      allTextures.forEach((t) => t.dispose());
    },
  };
}
