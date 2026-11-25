import {
  CONSTITUTIONAL_MAPPINGS,
  ENDINGS,
  LAYER_METAS,
  MIRROR_QUESTIONS,
} from '../types/game';
import {
  CUTSCENE_FATAL_LINE,
  FRAGMENT_DIALOGUES,
  LAYER_INTRO_DIALOGUES,
  PROLOGUE_DIALOGUES,
  TRIGGER_DIALOGUES,
  getEpilogueDialogues,
} from './story';

function safeJsonForHtml(value: unknown): string {
  return JSON.stringify(value).replace(/<\//g, '<\\/');
}

export function buildStandaloneHtml(): string {
  const storyBundle = {
    layers: LAYER_METAS,
    mirrors: MIRROR_QUESTIONS,
    constitutionalMappings: CONSTITUTIONAL_MAPPINGS,
    endings: ENDINGS,
    prologue: PROLOGUE_DIALOGUES,
    layerIntros: LAYER_INTRO_DIALOGUES,
    fragments: FRAGMENT_DIALOGUES,
    triggers: TRIGGER_DIALOGUES,
    cutsceneFatalLine: CUTSCENE_FATAL_LINE,
    epilogues: {
      true: getEpilogueDialogues('true'),
      neutral: getEpilogueDialogues('neutral'),
      bad: getEpilogueDialogues('bad'),
    },
  };

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>SHATTERED MEMORIES: Sudut Beku Rindiani (Standalone 1-File)</title>
  <style>
    * { box-sizing: border-box; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
    html, body {
      margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden;
      background: #04080f; color: #d6dde6;
      font-family: Georgia, 'Times New Roman', serif;
      touch-action: none; overscroll-behavior: none;
    }
    input, textarea { user-select: text; -webkit-user-select: text; touch-action: manipulation; }
    .mono { font-family: 'Courier New', Courier, monospace; }
    .serif { font-family: Georgia, 'Times New Roman', serif; }
    .tabular { font-variant-numeric: tabular-nums; }
    #gl-wrap { position: fixed; inset: 0; }
    .scanlines {
      position: fixed; inset: 0; z-index: 4; pointer-events: none;
      background: repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(2,6,14,0.22) 3px, rgba(2,6,14,0.22) 4px);
    }
    .grain {
      position: fixed; inset: 0; z-index: 4; pointer-events: none; opacity: 0.06;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    #vignette, #strobe-fx, #crack-svg { position: fixed; inset: 0; pointer-events: none; }
    #vignette { z-index: 8; }
    #strobe-fx { z-index: 9; display: none; }
    #crack-svg { z-index: 9; width: 100%; height: 100%; }
    .screen { position: fixed; inset: 0; z-index: 20; display: none; }
    .screen.active { display: flex; }
    #title-screen {
      flex-direction: column; justify-content: space-between; padding: 22px 26px;
      overflow-y: auto; touch-action: pan-y;
      background: linear-gradient(to right, rgba(3,6,12,0.93) 0%, rgba(5,11,20,0.72) 55%, rgba(5,11,20,0.25) 100%);
    }
    .btn {
      min-height: 44px; border: 1px solid #3d4959; background: #09101a; color: #d6dde6;
      padding: 10px 14px; cursor: pointer; font-size: 12px; transition: border-color 140ms;
    }
    .btn:hover { border-color: #d4a353; }
    .btn-primary {
      min-height: 48px; border: 1px solid #d4a353; background: #d4a353; color: #090d14;
      padding: 12px 26px; font-weight: bold; letter-spacing: 0.14em; cursor: pointer; font-size: 14px;
    }
    .btn-primary:hover { background: #e0b467; }
    .input-box {
      min-height: 44px; width: 100%; padding: 8px 10px; border: 1px solid #323d4d;
      background: #070d16; color: #e2e8f0; font-size: 12px; outline: none;
    }
    .input-box:focus { border-color: #d4a353; }
    .ctrl-card {
      min-height: 52px; text-align: left; padding: 10px 12px; border: 1px solid #2f3947;
      background: rgba(7,12,20,0.9); color: #94a3b8; cursor: pointer; transition: border-color 140ms;
    }
    .ctrl-card.selected { border-color: #d4a353; background: rgba(19,28,40,0.95); color: #e2e8f0; }
    #hud-screen { pointer-events: none; z-index: 14; flex-direction: column; justify-content: space-between; padding: 14px 18px; }
    .stability-card {
      max-width: 310px; border: 1px solid rgba(71,85,105,0.85); background: rgba(8,13,22,0.9);
      padding: 9px 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.5); margin-bottom: 8px;
    }
    .crystal-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin-top: 6px; }
    .crystal-seg {
      height: 9px; border: 1px solid #334155; background: rgba(15,23,42,0.75);
      clip-path: polygon(10% 0%, 100% 0%, 90% 100%, 0% 100%);
    }
    .paper-note {
      max-width: 310px; border: 1px solid rgba(70,78,89,0.8); background: rgba(21,26,33,0.9);
      padding: 10px 12px; transform: rotate(-0.6deg); box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .bar-track { height: 3px; width: 100%; background: #1e2631; margin-top: 3px; }
    .bar-fill { height: 100%; transition: width 120ms; }
    #portrait-banner {
      display: none; position: fixed; top: 8px; left: 50%; transform: translateX(-50%); z-index: 26;
      max-width: 92vw; border: 1px solid rgba(120,169,196,0.55); background: rgba(7,13,23,0.92);
      padding: 6px 12px; font-size: 10px; color: #cbd5e1; align-items: center; gap: 8px; pointer-events: auto;
    }
    /* MULTI-TOUCH MOBILE CONTROLS */
    #touch-controls { position: fixed; inset: 0; z-index: 12; display: none; pointer-events: none; }
    #touch-controls.active { display: block; }
    #touch-cam-zone { position: absolute; inset: 0; pointer-events: auto; touch-action: none; }
    #touch-stick-zone {
      position: absolute; bottom: 14px; left: 14px; width: 154px; height: 154px;
      display: flex; align-items: center; justify-content: center; pointer-events: auto; touch-action: none;
    }
    #touch-stick-base {
      position: relative; width: 120px; height: 120px; border-radius: 50%;
      border: 1px solid rgba(120,169,196,0.45); background: rgba(6,11,19,0.34);
      display: flex; align-items: center; justify-content: center;
    }
    #touch-stick-knob {
      width: 48px; height: 48px; border-radius: 50%;
      border: 1px solid rgba(147,197,253,0.8); background: rgba(18,32,48,0.72); pointer-events: none;
    }
    #touch-actions {
      position: absolute; bottom: 18px; right: 16px; display: flex; align-items: flex-end;
      gap: 10px; pointer-events: auto; touch-action: none;
    }
    .touch-btn {
      border-radius: 50%; border: 1px solid rgba(120,169,196,0.48); background: rgba(7,12,20,0.58);
      color: #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center;
      cursor: pointer; position: relative; padding: 0;
    }
    #dialogue-screen {
      z-index: 30; align-items: flex-end; justify-content: center; padding: 18px; cursor: pointer; touch-action: manipulation;
    }
    .dialogue-box {
      width: 100%; max-width: 760px; border: 1px solid #4a5568; background: rgba(7,11,18,0.95);
      padding: 18px 22px; box-shadow: 0 20px 45px rgba(0,0,0,0.8); min-height: 48px;
    }
    #cutscene-screen {
      z-index: 25; pointer-events: none; flex-direction: column; justify-content: space-between;
    }
    #mirror-screen, #ending-screen, #pause-screen, #gameover-screen {
      z-index: 35; align-items: center; justify-content: center; padding: 18px;
      background: rgba(2,5,10,0.94); overflow-y: auto; touch-action: pan-y;
    }
    .dossier {
      width: 100%; max-width: 760px; border: 1px solid #475261; background: #0c1118;
      padding: 24px; margin: auto; box-shadow: 0 24px 60px rgba(0,0,0,0.85);
    }
    .choice-btn {
      min-height: 48px; width: 100%; text-align: left; border: 1px solid #2f3947; background: #080c12;
      padding: 14px; color: #e2e8f0; cursor: pointer; margin-top: 10px;
    }
    .choice-btn:hover { border-color: #d4a353; background: #111924; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }
    .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
    .stat-box { border: 1px solid #242e3b; background: #0b1018; padding: 10px 12px; }
  </style>
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.170.0/build/three.module.js"
      }
    }
  </script>
</head>
<body>
  <div id="gl-wrap"></div>
  <div class="scanlines"></div>
  <div class="grain"></div>
  <div id="vignette"></div>
  <div id="strobe-fx"></div>

  <!-- PERMANENT PROGRESSIVE SCREEN-EDGE CRACKS (1-4 JUMPSCARE HITS) -->
  <svg id="crack-svg" viewBox="0 0 1000 600" preserveAspectRatio="none">
    <g id="crack-t1" style="display:none;" stroke="rgba(186,230,253,0.68)" stroke-width="2" fill="none">
      <polyline points="0,0 74,48 118,38 175,92 162,135" />
      <polyline points="74,48 52,102 96,144" />
      <polyline points="118,38 158,14 215,24" />
    </g>
    <g id="crack-t2" style="display:none;" stroke="rgba(186,230,253,0.74)" stroke-width="2.2" fill="none">
      <polyline points="1000,600 912,535 865,552 805,488 818,438" />
      <polyline points="912,535 942,468 896,422" />
      <polyline points="865,552 818,582 758,568" />
    </g>
    <g id="crack-t3" style="display:none;" stroke="rgba(224,242,254,0.82)" stroke-width="2.4" fill="none">
      <polyline points="1000,0 915,62 855,48 795,112 814,172" />
      <polyline points="915,62 948,132 895,184" />
      <polyline points="855,48 802,18 738,34" />
    </g>
    <g id="crack-t4" style="display:none;" stroke="rgba(248,113,113,0.82)" stroke-width="2.8" fill="none">
      <polyline points="0,600 95,522 148,540 218,475 204,412" />
      <polyline points="95,522 65,442 125,388" />
      <polyline points="175,92 248,142 292,126" />
      <polyline points="805,488 738,442 695,460" />
    </g>
  </svg>

  <!-- TITLE SCREEN -->
  <div id="title-screen" class="screen active">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div class="mono" style="font-size:11px;letter-spacing:0.18em;color:#8aa4b8;">ARSIP MEMORI · KEWARGANEGARAAN PjBL</div>
      <button id="btn-mute-title" class="btn mono">Suara Aktif</button>
    </div>

    <div style="max-width:560px;margin:auto 0;">
      <div class="mono" style="font-size:11px;letter-spacing:0.25em;color:#8aa4b8;">DOKUMEN PSIKOLOGIS · EMPAT BABAK INGATAN</div>
      <h1 class="serif" style="font-size:36px;margin:8px 0 4px 0;color:#cbd5e1;letter-spacing:2px;">SHATTERED MEMORIES</h1>
      <div class="serif" style="font-size:22px;color:#d4a353;letter-spacing:3px;margin-bottom:14px;">SUDUT BEKU RINDIANI</div>
      <p class="mono" style="font-size:12px;line-height:1.65;color:#b6c2d1;margin-bottom:18px;">
        Di sudut taman kampus yang membeku, Bima mencoba menembus tembok diam Rindiani.
        Jaga Kestabilan Batin Rindiani (5/5) dari sergapan bayangan trauma sembari menyelamatkan ingatan yang terkunci.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div>
          <label class="mono" style="display:block;font-size:11px;color:#8aa4b8;margin-bottom:4px;">Inisial / Nama Responden</label>
          <input id="resp-input" class="input-box mono" type="text" placeholder="Misal: Mahasiswa A / NIM" />
        </div>
        <div>
          <label class="mono" style="display:block;font-size:11px;color:#8aa4b8;margin-bottom:4px;">Intensitas Eksplorasi</label>
          <div style="display:grid;grid-template-columns:1fr 1fr;">
            <button id="mode-std" class="btn mono" style="border-color:#d4a353;color:#d4a353;">Standar</button>
            <button id="mode-story" class="btn mono" style="color:#94a3b8;">Cerita Aman</button>
          </div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div class="mono" style="display:flex;justify-content:space-between;font-size:11px;color:#8aa4b8;margin-bottom:5px;">
          <span>MODE PERANGKAT KONTROL</span>
          <span id="ctrl-status-lbl" style="color:#78a9c4;">Keyboard &amp; Mouse</span>
        </div>
        <div class="grid-2">
          <button id="ctrl-pc" class="ctrl-card selected mono">
            <div style="font-size:12px;font-weight:bold;">[MODE PC / LAPTOP]</div>
            <div style="font-size:10px;color:#8aa4b8;margin-top:3px;">WASD/Panah, Mouse, Shift, E &amp; F</div>
          </button>
          <button id="ctrl-mobile" class="ctrl-card mono">
            <div style="font-size:12px;font-weight:bold;">[MODE MOBILE / TOUCHSCREEN]</div>
            <div style="font-size:10px;color:#8aa4b8;margin-top:3px;">Virtual Dual-Stick &amp; Tombol Sentuh</div>
          </button>
        </div>
      </div>

      <button id="btn-start" class="btn-primary serif">MULAI SELAM BATIN</button>
      <div class="mono" style="display:flex;gap:18px;margin-top:12px;font-size:12px;">
        <span id="toggle-ctrl" style="color:#9aa8b8;cursor:pointer;text-decoration:underline;">Panduan Kontrol</span>
        <span id="toggle-about" style="color:#9aa8b8;cursor:pointer;text-decoration:underline;">Tentang Riset PjBL</span>
      </div>
      <div id="subpanel-box" class="mono" style="display:none;margin-top:12px;border:1px solid #334155;background:rgba(7,13,22,0.94);padding:12px;font-size:11px;line-height:1.6;color:#cbd5e1;"></div>
    </div>

    <div id="title-hint-line" class="mono" style="font-size:11px;color:#8aa4b8;border-top:1px solid #232d3b;padding-top:10px;">
      WASD Bergerak · Mouse / Geser Lihat · Shift Lari · F Lentera · E Aksi / Sembunyi · Esc Jeda
    </div>
  </div>

  <!-- PORTRAIT ORIENTATION WARNING BANNER (MOBILE) -->
  <div id="portrait-banner" class="mono">
    <span>Putar perangkat ke posisi Landscape untuk pengalaman terbaik</span>
    <button id="btn-close-portrait" style="background:none;border:none;color:#d4a353;font-weight:bold;cursor:pointer;padding:2px 6px;">✕</button>
  </div>

  <!-- MULTI-TOUCH MOBILE CONTROLS OVERLAY -->
  <div id="touch-controls">
    <div id="touch-cam-zone"></div>
    <div id="touch-stick-zone">
      <div id="touch-stick-base">
        <div id="touch-stick-lbl" class="mono" style="position:absolute;top:-16px;font-size:9px;letter-spacing:0.12em;color:rgba(138,164,184,0.8);pointer-events:none;">GERAK</div>
        <div id="touch-stick-knob"></div>
      </div>
    </div>
    <div id="touch-actions">
      <button id="touch-sprint" class="touch-btn mono" style="width:54px;height:54px;font-size:9px;">LARI</button>
      <button id="touch-lantern" class="touch-btn mono" style="width:62px;height:62px;font-size:8.5px;border:none;">
        <svg viewBox="0 0 62 62" style="position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);pointer-events:none;">
          <circle cx="31" cy="31" r="26" fill="none" stroke="rgba(51,65,85,0.65)" stroke-width="2.5"></circle>
          <circle id="lantern-ring-progress" cx="31" cy="31" r="26" fill="none" stroke="#d4a353" stroke-width="2.8" stroke-dasharray="163.36" stroke-dashoffset="0" stroke-linecap="round"></circle>
        </svg>
        <span style="position:relative;z-index:2;font-weight:bold;">LENTERA</span>
      </button>
      <button id="touch-interact" class="touch-btn mono" style="width:68px;height:68px;font-size:10px;font-weight:bold;">AKSI</button>
    </div>
  </div>

  <!-- GAME HUD -->
  <div id="hud-screen" class="screen">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
      <div>
        <div class="stability-card">
          <div class="mono" style="display:flex;justify-content:space-between;font-size:10px;letter-spacing:0.12em;">
            <span style="color:#cbd5e1;">KESTABILAN BATIN</span>
            <span id="hud-stab-txt" class="tabular" style="color:#78a9c4;font-weight:bold;">5/5</span>
          </div>
          <div class="crystal-row" id="hud-stab-bars">
            <div class="crystal-seg"></div><div class="crystal-seg"></div><div class="crystal-seg"></div><div class="crystal-seg"></div><div class="crystal-seg"></div>
          </div>
          <div id="hud-grace" class="mono" style="display:none;font-size:10px;color:#d4a353;margin-top:6px;"></div>
        </div>

        <div class="paper-note">
          <div class="mono" style="display:flex;justify-content:space-between;font-size:11px;color:#8aa4b8;border-bottom:1px solid #2b3440;padding-bottom:6px;">
            <span id="hud-era">BABAK I</span>
            <span id="hud-progress" class="tabular" style="color:#d4a353;font-weight:bold;">0/2</span>
          </div>
          <div id="hud-title" class="serif" style="font-size:13px;font-weight:bold;color:#e2e8f0;margin-top:5px;"></div>
          <div id="hud-hint" class="mono" style="font-size:10px;line-height:1.45;color:#9fb0c2;margin-top:4px;"></div>
        </div>

        <div id="hud-mobile-bars-slot" style="margin-top:8px;"></div>
      </div>

      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;pointer-events:auto;">
        <div style="display:flex;gap:6px;">
          <button id="btn-ctrl-hud" class="btn mono" style="padding:8px 10px;">PC</button>
          <button id="btn-mute-hud" class="btn mono" style="padding:8px 10px;">Suara</button>
          <button id="btn-pause" class="btn mono" style="padding:8px 12px;">Jeda</button>
        </div>
        <div id="hud-pc-hint" class="mono" style="font-size:10px;color:#8aa4b8;background:rgba(5,9,16,0.7);padding:4px 8px;">
          WASD Gerak · Shift Lari · F Lentera · E Aksi
        </div>
      </div>
    </div>

    <div style="position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;padding:0 16px;">
      <div id="hud-reticle" style="width:6px;height:6px;border-radius:50%;background:rgba(220,227,236,0.78);"></div>
      <div id="hud-hiding" class="mono" style="display:none;padding:6px 14px;border:1px solid #4b5c6e;background:rgba(5,9,17,0.92);color:#9fc2db;font-size:12px;">BERSEMBUNYI DALAM GELAP</div>
      <div id="hud-prompt" class="mono" style="display:none;margin-top:22px;padding:8px 16px;border:1px solid rgba(212,163,83,0.6);background:rgba(6,10,18,0.92);text-align:center;">
        <div id="hud-prompt-main" style="font-size:13px;color:#e6c07b;font-weight:bold;"></div>
        <div id="hud-prompt-sub" style="font-size:11px;color:#9fb0c2;margin-top:2px;"></div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;align-items:flex-end;">
      <div id="hud-pc-bars-slot">
        <div id="hud-bars-wrap" class="mono" style="font-size:10px;color:#9aa8b8;display:flex;flex-direction:column;gap:6px;width:190px;background:rgba(6,11,19,0.65);padding:6px 8px;border:1px solid rgba(36,48,62,0.7);">
          <div>
            <div style="display:flex;justify-content:space-between;"><span>KEHANGATAN</span><span id="hud-warmth" class="tabular">100%</span></div>
            <div class="bar-track"><div id="bar-warmth" class="bar-fill" style="width:100%;background:#78a9c4;"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;"><span>NAPAS</span><span id="hud-stamina" class="tabular">100%</span></div>
            <div class="bar-track"><div id="bar-stamina" class="bar-fill" style="width:100%;background:#9fb8cc;"></div></div>
          </div>
          <div id="hud-lantern-row">
            <div style="display:flex;justify-content:space-between;"><span style="color:#d4a353;">LENTERA [F]</span><span id="hud-lantern" class="tabular" style="color:#d4a353;">SIAP</span></div>
            <div class="bar-track"><div id="bar-lantern" class="bar-fill" style="width:100%;background:#d4a353;"></div></div>
          </div>
        </div>
      </div>
      <div id="hud-frost-badge" class="mono tabular" style="font-size:11px;color:#8aa4b8;">TRAUMA BEKU · <span id="hud-frost" style="color:#cbd5e1;">38%</span></div>
    </div>
  </div>

  <!-- CUTSCENE SUBTITLE OVERLAY -->
  <div id="cutscene-screen" class="screen">
    <div style="height:48px;background:rgba(2,4,8,0.95);border-bottom:1px solid rgba(30,41,59,0.5);"></div>
    <div style="padding:0 24px 36px 24px;display:flex;justify-content:center;">
      <div id="cutscene-sub-box" style="display:none;max-width:680px;border:1px solid rgba(71,85,105,0.75);background:rgba(5,8,16,0.92);padding:16px 24px;text-align:center;">
        <div class="mono" style="font-size:11px;letter-spacing:0.15em;color:#78a9c4;margin-bottom:6px;">RINDIANI · SUARA MELEMAH</div>
        <p id="cutscene-sub-text" class="serif" style="margin:0;font-size:18px;font-style:italic;color:#e2e8f0;"></p>
      </div>
    </div>
  </div>

  <!-- DIALOGUE BOX -->
  <div id="dialogue-screen" class="screen">
    <div class="dialogue-box">
      <div style="display:flex;justify-content:space-between;border-bottom:1px solid #2d3748;padding-bottom:8px;margin-bottom:12px;">
        <div>
          <span id="dlg-speaker" class="serif" style="font-size:17px;font-weight:bold;color:#d4a353;"></span>
          <span style="color:#64748b;margin:0 8px;">·</span>
          <span id="dlg-emotion" class="mono" style="font-size:12px;color:#8aa4b8;"></span>
        </div>
        <span id="dlg-count" class="mono tabular" style="font-size:11px;color:#64748b;">1/1</span>
      </div>
      <p id="dlg-text" class="mono" style="font-size:14px;line-height:1.65;color:#dce3ec;min-height:52px;margin:0;"></p>
      <div class="mono" style="text-align:right;font-size:11px;color:#9aa8b8;margin-top:12px;" id="dlg-hint">[Spasi / Klik] Lanjutkan</div>
    </div>
  </div>

  <!-- PAUSE MODAL -->
  <div id="pause-screen" class="screen">
    <div class="dossier" style="max-width:440px;">
      <div class="mono" style="font-size:11px;color:#8aa4b8;">PENELUSURAN DIJEDA</div>
      <h2 class="serif" style="margin:6px 0 12px 0;color:#e2e8f0;" id="pause-title"></h2>
      <div id="pause-ctrl-hint" class="mono" style="border:1px solid #26303d;background:#070b11;padding:10px;font-size:11px;line-height:1.6;color:#cbd5e1;margin-bottom:16px;">
        WASD/Panah: Gerak · Mouse/Geser: Lihat · Shift: Lari · F: Lentera Bekukan Bayangan · E: Ambil/Sembunyi/Buka Segel
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button id="btn-resume" class="btn-primary serif">LANJUTKAN</button>
        <button id="btn-ctrl-pause" class="btn mono">Mode Kontrol: PC</button>
        <button id="btn-restart-pause" class="btn mono">Ulangi dari Awal</button>
        <button id="btn-title-pause" class="btn mono">Kembali ke Layar Judul</button>
      </div>
    </div>
  </div>

  <!-- MIRROR MODAL -->
  <div id="mirror-screen" class="screen">
    <div class="dossier">
      <div class="mono" style="display:flex;justify-content:space-between;font-size:11px;color:#8aa4b8;border-bottom:1px solid #252e3a;padding-bottom:10px;">
        <span id="mir-between"></span>
        <span id="mir-frost" class="tabular" style="color:#78a9c4;"></span>
      </div>
      <h2 class="serif" style="color:#e2e8f0;margin:14px 0 8px 0;">Lembar Evaluasi: Cermin Psikologis</h2>
      <p id="mir-prompt" class="mono" style="font-size:14px;line-height:1.65;color:#dce3ec;"></p>
      <div id="mir-context" class="mono" style="font-size:12px;color:#d4a353;border-top:1px solid #252e3a;border-bottom:1px solid #252e3a;padding:8px 0;margin:12px 0;"></div>
      <div id="mir-options"></div>
    </div>
  </div>

  <!-- SPECIAL GAME OVER MODAL -->
  <div id="gameover-screen" class="screen">
    <div class="dossier" style="border-color:#7f1d1d;background:#0a0d14;">
      <div class="mono" style="font-size:11px;letter-spacing:0.15em;color:#f87171;">KESTABILAN BATIN 0/5 · KEHANCURAN TOTAL</div>
      <h1 class="serif" style="color:#e2e8f0;margin:10px 0;font-size:26px;line-height:1.25;">GAME OVER: BATIN RINDIANI TAK LAGI DAPAT DISELAMATKAN</h1>
      <p class="mono" style="font-size:12px;line-height:1.65;color:#cbd5e1;margin-bottom:16px;">
        Kubah kaca membeku gelap dan menutup rapat suara Rindiani selamanya. Akumulasi trauma yang dibiarkan tanpa perlindungan, cemoohan sekitar, dan keterlambatan menjemput ruang aman menghancurkan sisa kepercayaan yang dimilikinya.
      </p>
      <div class="mono" style="border:1px solid #2b3440;background:#070a10;padding:14px;margin-bottom:16px;font-size:11px;">
        <div id="go-resp" style="color:#d4a353;font-weight:bold;margin-bottom:10px;"></div>
        <div class="grid-4" style="margin-bottom:10px;">
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">LOKASI</div><div id="go-layer" style="margin-top:4px;font-weight:bold;"></div></div>
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">KESTABILAN</div><div style="margin-top:4px;font-weight:bold;color:#f87171;">0 / 5</div></div>
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">FRAGMEN</div><div id="go-frags" style="margin-top:4px;font-weight:bold;color:#78a9c4;"></div></div>
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">KESADARAN</div><div id="go-score" style="margin-top:4px;font-weight:bold;color:#d4a353;"></div></div>
        </div>
        <div style="color:#9aa8b8;line-height:1.6;">
          Refleksi Kewarganegaraan: Saat lingkungan memilih bungkam dan membiarkan bayangan intimidasi mengejar korban, amanat kemanusiaan (Sila ke-2 Pancasila) serta hak atas rasa aman (Pasal 28G ayat (1) UUD NRI 1945) runtuh di hadapan pembiaran.
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button id="btn-go-restart" class="btn-primary mono" style="padding:10px 18px;font-size:12px;">ULANGI PERJALANAN</button>
          <button id="btn-go-copy" class="btn mono">SALIN DATA EVALUASI PjBL</button>
        </div>
        <button id="btn-go-title" class="btn mono">Layar Judul</button>
      </div>
    </div>
  </div>

  <!-- ENDING MODAL -->
  <div id="ending-screen" class="screen">
    <div class="dossier">
      <div class="mono" style="display:flex;justify-content:space-between;font-size:12px;border-bottom:1px solid #252e3a;padding-bottom:10px;">
        <span id="end-sub"></span>
        <span id="end-badge" style="color:#8aa4b8;"></span>
      </div>
      <h1 id="end-title" class="serif" style="color:#e2e8f0;margin:12px 0 8px 0;font-size:26px;"></h1>
      <p id="end-narr" class="mono" style="font-size:12px;line-height:1.65;color:#cbd5e1;margin-bottom:16px;"></p>

      <div class="serif" style="font-size:14px;font-weight:bold;color:#d4a353;margin-bottom:8px;">TINJAUAN PANCASILA & UUD NRI 1945</div>
      <p id="end-const" class="mono" style="font-size:12px;line-height:1.6;color:#dce3ec;border:1px solid #26303d;background:#070b11;padding:12px;margin-bottom:12px;"></p>
      <div id="end-mappings" class="grid-2" style="margin-bottom:16px;"></div>

      <div class="mono" style="border:1px solid #374151;background:#070b11;padding:14px;margin-bottom:16px;">
        <div id="end-resp" style="font-size:12px;color:#d4a353;margin-bottom:10px;"></div>
        <div class="grid-3">
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">KESADARAN & EMPATI</div><div id="end-score" class="tabular" style="font-size:26px;font-weight:bold;margin-top:4px;"></div></div>
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">KEBEKUAN AKHIR</div><div id="end-frost" class="tabular" style="font-size:26px;font-weight:bold;color:#78a9c4;margin-top:4px;"></div></div>
          <div class="stat-box"><div style="font-size:10px;color:#8aa4b8;">KLASIFIKASI</div><div id="end-cat" style="font-size:11px;color:#dce3ec;margin-top:6px;"></div></div>
        </div>
        <div id="end-log" style="margin-top:12px;font-size:11px;color:#cbd5e1;"></div>
      </div>

      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <button id="btn-copy" class="btn-primary mono" style="padding:10px 18px;font-size:12px;">Salin Data ke Clipboard</button>
        <button id="btn-restart-end" class="btn mono">Ulangi Selam Batin</button>
      </div>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'three';

    const STORY = ${safeJsonForHtml(storyBundle)};

    // --- PROCEDURAL WEB AUDIO ENGINE (SPATIAL REVERB & ADAPTIVE 3-LAYER HORROR) ---
    class AudioSys {
      constructor() {
        this.ctx = null; this.master = null; this.limiter = null; this.dryBus = null;
        this.reverb = null; this.reverbGain = null; this.echoDelay = null; this.echoSend = null;
        this.windGain = null; this.windFilterA = null; this.windFilterB = null;
        this.droneGain = null; this.droneFilter = null;
        this.scrapeGain = null; this.scrapeFilter = null;
        this.staticGain = null; this.staticFilter = null;
        this.whisperGain = null; this.whisperPanner = null;
        this.noise = null; this.whiteNoise = null; this.distCurve = null;
        this.muted = false; this.ready = false;
        this.bgmTimer = 0; this.bgmStep = 0; this.stepTimer = 0; this.stepPan = -1;
        this.hbTimer = 0; this.wPanTimer = 0; this.creakTimer = 4.5;
        this.notes = [
          440, null, 523.25, 493.88, 349.23, null, 329.63, null,
          415.30, null, 440, 349.23, 329.63, null, 246.94, null,
          440, null, 659.25, 587.33, 523.25, null, 415.30, null,
          349.23, 329.63, 293.66, null, 246.94, null, 220, null
        ];
      }
      init() {
        if (this.ready) { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        if (this.ctx.state === 'suspended') this.ctx.resume();

        this.limiter = this.ctx.createDynamicsCompressor();
        this.limiter.threshold.value = -10; this.limiter.knee.value = 12;
        this.limiter.ratio.value = 8; this.limiter.attack.value = 0.003; this.limiter.release.value = 0.18;
        this.limiter.connect(this.ctx.destination);

        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.78;
        this.master.connect(this.limiter);

        this.dryBus = this.ctx.createGain();
        this.dryBus.gain.value = 0.92;
        this.dryBus.connect(this.master);

        this.reverb = this.ctx.createConvolver();
        this.reverb.buffer = this.createIR(2.6);
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 0.54;
        this.reverb.connect(this.reverbGain);
        this.reverbGain.connect(this.master);

        this.echoDelay = this.ctx.createDelay(1.5);
        this.echoDelay.delayTime.value = 0.38;
        const echoFb = this.ctx.createGain(); echoFb.gain.value = 0.36;
        const echoLp = this.ctx.createBiquadFilter(); echoLp.type = 'lowpass'; echoLp.frequency.value = 1150;
        this.echoSend = this.ctx.createGain(); this.echoSend.gain.value = 0.32;
        this.echoDelay.connect(echoLp); echoLp.connect(echoFb); echoFb.connect(this.echoDelay);
        echoLp.connect(this.echoSend); this.echoSend.connect(this.dryBus); this.echoSend.connect(this.reverb);

        const sr = this.ctx.sampleRate;
        const pLen = sr * 4;
        this.noise = this.ctx.createBuffer(1, pLen, sr);
        const pd = this.noise.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < pLen; i++) {
          const w = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + w * 0.099046;
          b1 = 0.96300 * b1 + w * 0.2965164;
          b2 = 0.57000 * b2 + w * 1.0526913;
          pd[i] = Math.max(-1, Math.min(1, (b0 + b1 + b2 + w * 0.1848) * 0.22));
        }

        this.whiteNoise = this.ctx.createBuffer(1, sr * 2, sr);
        const wd = this.whiteNoise.getChannelData(0);
        for (let i = 0; i < wd.length; i++) wd[i] = Math.random() * 2 - 1;

        this.distCurve = new Float32Array(256);
        const k = 18;
        for (let i = 0; i < 256; i++) {
          const x = (i * 2) / 256 - 1;
          this.distCurve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
        }

        this.startLayers();
        this.ready = true;
      }
      createIR(sec) {
        const sr = this.ctx.sampleRate, len = Math.floor(sr * sec);
        const ir = this.ctx.createBuffer(2, len, sr);
        const taps = [0.018, 0.031, 0.047, 0.066, 0.085];
        for (let ch = 0; ch < 2; ch++) {
          const d = ir.getChannelData(ch); let lp = 0;
          for (let i = 0; i < len; i++) {
            const raw = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.75);
            lp = lp * 0.72 + raw * 0.28; d[i] = lp * 0.78;
          }
          taps.forEach((ts, idx) => {
            const si = Math.min(len - 1, Math.floor((ts + ch * 0.004) * sr));
            d[si] += (ch === idx % 2 ? 0.42 : 0.24) / (idx + 1);
          });
        }
        return ir;
      }
      panner(pan) {
        if (!this.ctx || !this.ctx.createStereoPanner) return null;
        const p = this.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); return p;
      }
      spatial(node, pan, revMix = 0.42, echoMix = 0) {
        if (!this.ctx || !this.dryBus) return;
        const p = this.panner(pan), out = p || node;
        if (p) node.connect(p);
        out.connect(this.dryBus);
        if (revMix > 0 && this.reverb) {
          const w = this.ctx.createGain(); w.gain.value = revMix; out.connect(w); w.connect(this.reverb);
        }
        if (echoMix > 0 && this.echoDelay) {
          const e = this.ctx.createGain(); e.gain.value = echoMix; out.connect(e); e.connect(this.echoDelay);
        }
      }
      startLayers() {
        // 1. Dual-LFO Howling Blizzard Wind
        const wSrc = this.ctx.createBufferSource(); wSrc.buffer = this.noise; wSrc.loop = true;
        this.windFilterA = this.ctx.createBiquadFilter(); this.windFilterA.type = 'bandpass'; this.windFilterA.frequency.value = 260; this.windFilterA.Q.value = 3.1;
        this.windFilterB = this.ctx.createBiquadFilter(); this.windFilterB.type = 'bandpass'; this.windFilterB.frequency.value = 640; this.windFilterB.Q.value = 2.6;
        const lfoA = this.ctx.createOscillator(), lgA = this.ctx.createGain(); lfoA.frequency.value = 0.07; lgA.gain.value = 135; lfoA.connect(lgA); lgA.connect(this.windFilterA.frequency); lfoA.start();
        const lfoB = this.ctx.createOscillator(), lgB = this.ctx.createGain(); lfoB.frequency.value = 0.11; lgB.gain.value = 280; lfoB.connect(lgB); lgB.connect(this.windFilterB.frequency); lfoB.start();
        this.windGain = this.ctx.createGain(); this.windGain.gain.value = 0.12;
        const wpA = this.panner(-0.22), wpB = this.panner(0.24);
        wSrc.connect(this.windFilterA); wSrc.connect(this.windFilterB);
        if (wpA && wpB) { this.windFilterA.connect(wpA); this.windFilterB.connect(wpB); wpA.connect(this.windGain); wpB.connect(this.windGain); }
        else { this.windFilterA.connect(this.windGain); this.windFilterB.connect(this.windGain); }
        this.spatial(this.windGain, 0, 0.36, 0); wSrc.start();

        // 2. BGM Layer 1: Dark Industrial Drone (45Hz - 90Hz)
        this.droneGain = this.ctx.createGain(); this.droneGain.gain.value = 0.075;
        this.droneFilter = this.ctx.createBiquadFilter(); this.droneFilter.type = 'lowpass'; this.droneFilter.frequency.value = 185; this.droneFilter.Q.value = 2.2;
        const dLfo = this.ctx.createOscillator(), dLg = this.ctx.createGain(); dLfo.frequency.value = 0.13; dLg.gain.value = 75; dLfo.connect(dLg); dLg.connect(this.droneFilter.frequency); dLfo.start();
        const pDrift = this.ctx.createOscillator(), pDg = this.ctx.createGain(); pDrift.frequency.value = 0.08; pDg.gain.value = 14; pDrift.connect(pDg); pDrift.start();
        [[46.25,'sawtooth',0.42],[69.3,'triangle',0.48],[82.41,'sawtooth',0.25]].forEach(([f, tp, v]) => {
          const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = tp; o.frequency.value = f; g.gain.value = v;
          pDg.connect(o.detune); o.connect(g); g.connect(this.droneFilter); o.start();
        });
        this.droneFilter.connect(this.droneGain); this.spatial(this.droneGain, 0, 0.48, 0);

        // 3. BGM Layer 3A: FM Rusted Metallic Scrape
        this.scrapeGain = this.ctx.createGain(); this.scrapeGain.gain.value = 0;
        this.scrapeFilter = this.ctx.createBiquadFilter(); this.scrapeFilter.type = 'bandpass'; this.scrapeFilter.frequency.value = 920; this.scrapeFilter.Q.value = 4.2;
        const sLfo = this.ctx.createOscillator(), sLg = this.ctx.createGain(); sLfo.frequency.value = 0.23; sLg.gain.value = 420; sLfo.connect(sLg); sLg.connect(this.scrapeFilter.frequency); sLfo.start();
        const scCar = this.ctx.createOscillator(); scCar.type = 'sawtooth'; scCar.frequency.value = 186;
        const smA = this.ctx.createOscillator(), smAg = this.ctx.createGain(); smA.type = 'sine'; smA.frequency.value = 73; smAg.gain.value = 210; smA.connect(smAg); smAg.connect(scCar.frequency);
        const smB = this.ctx.createOscillator(), smBg = this.ctx.createGain(); smB.type = 'triangle'; smB.frequency.value = 293; smBg.gain.value = 135; smB.connect(smBg); smBg.connect(scCar.frequency);
        scCar.connect(this.scrapeFilter); this.scrapeFilter.connect(this.scrapeGain); this.spatial(this.scrapeGain, 0, 0.55, 0);
        scCar.start(); smA.start(); smB.start();

        // 4. BGM Layer 3B: Proximity Radio Static
        this.staticGain = this.ctx.createGain(); this.staticGain.gain.value = 0;
        this.staticFilter = this.ctx.createBiquadFilter(); this.staticFilter.type = 'bandpass'; this.staticFilter.frequency.value = 1480; this.staticFilter.Q.value = 2.6;
        const stSrc = this.ctx.createBufferSource(); stSrc.buffer = this.whiteNoise; stSrc.loop = true;
        stSrc.connect(this.staticFilter); this.staticFilter.connect(this.staticGain); this.spatial(this.staticGain, 0, 0.25, 0); stSrc.start();

        // 5. Ambient Stigma Formant Whispers (Babak II, III, IV)
        this.whisperGain = this.ctx.createGain(); this.whisperGain.gain.value = 0;
        this.whisperPanner = this.panner(0);
        const whSrc = this.ctx.createBufferSource(); whSrc.buffer = this.noise; whSrc.loop = true;
        const wbLfo = this.ctx.createOscillator(), wbg = this.ctx.createGain(); wbLfo.frequency.value = 0.29; wbg.gain.value = 0.35;
        wbLfo.connect(wbg); wbg.connect(this.whisperGain.gain); wbLfo.start();
        [680, 1380, 2450].forEach((ff, idx) => {
          const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = 7.5 + idx;
          const fl = this.ctx.createOscillator(), fg = this.ctx.createGain(); fl.frequency.value = 0.16 + idx * 0.07; fg.gain.value = 110 + idx * 60;
          fl.connect(fg); fg.connect(bp.frequency); fl.start();
          const outG = this.ctx.createGain(); outG.gain.value = 0.45 / (idx + 1);
          whSrc.connect(bp); bp.connect(outG); outG.connect(this.whisperGain);
        });
        if (this.whisperPanner) {
          this.whisperGain.connect(this.whisperPanner); this.whisperPanner.connect(this.dryBus);
          const ww = this.ctx.createGain(); ww.gain.value = 0.65; this.whisperPanner.connect(ww); ww.connect(this.reverb);
        } else this.spatial(this.whisperGain, 0, 0.65, 0);
        whSrc.start();
      }
      setMuted(m) { this.muted = m; if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 0.78, this.ctx.currentTime, 0.05); }
      tone(freq, dur, vol, type = 'triangle', startOffset = 0, pan = 0, revMix = 0.35, echoMix = 0) {
        if (!this.ctx || !this.dryBus || this.muted) return;
        const t = this.ctx.currentTime + startOffset;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); this.spatial(g, pan, revMix, echoMix); o.start(t); o.stop(t + dur + 0.05);
      }
      playBgmNote(freq, detune, vol, pan) {
        if (!this.ctx || !this.dryBus || this.muted) return;
        const now = this.ctx.currentTime;
        const o1 = this.ctx.createOscillator(), o2 = this.ctx.createOscillator(), o3 = this.ctx.createOscillator();
        const lp = this.ctx.createBiquadFilter(), g = this.ctx.createGain(), bg = this.ctx.createGain();
        o1.type = 'triangle'; o1.frequency.value = freq; o1.detune.value = detune;
        o2.type = 'sine'; o2.frequency.value = freq * 2; o2.detune.value = detune * 1.2;
        o3.type = 'sine'; o3.frequency.value = freq * 0.5; o3.detune.value = detune * 0.4;
        bg.gain.setValueAtTime(0.32, now); bg.gain.exponentialRampToValueAtTime(0.02, now + 0.65);
        lp.type = 'lowpass'; lp.frequency.setValueAtTime(2200, now); lp.frequency.exponentialRampToValueAtTime(480, now + 1.8);
        g.gain.setValueAtTime(0.001, now); g.gain.linearRampToValueAtTime(vol, now + 0.014); g.gain.exponentialRampToValueAtTime(0.0008, now + 2.35);
        o1.connect(lp); o3.connect(lp); o2.connect(bg); bg.connect(lp); lp.connect(g);
        this.spatial(g, pan, 0.58, 0.42);
        o1.start(now); o2.start(now); o3.start(now); o1.stop(now + 2.4); o2.stop(now + 2.4); o3.stop(now + 2.4);
      }
      noiseBurst(freq, q, dur, vol, filterType = 'bandpass', pan = 0, revMix = 0.3) {
        if (!this.ctx || !this.dryBus || !this.noise || this.muted) return;
        const t = this.ctx.currentTime;
        const s = this.ctx.createBufferSource(); s.buffer = this.noise;
        const f = this.ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; f.Q.value = q;
        const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        s.connect(f); f.connect(g); this.spatial(g, pan, revMix, 0); s.start(t, Math.random() * 0.8, dur + 0.02);
      }
      lanternPulse() {
        if (!this.ctx || !this.dryBus || this.muted) return;
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(110, now + 0.78);
        g.gain.setValueAtTime(0.24, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        o.connect(g); this.spatial(g, 0, 0.62, 0.2); o.start(now); o.stop(now + 0.95);
      }
      chainRattle() {
        if (!this.ctx || !this.dryBus || !this.noise || this.muted) return;
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
          const t = now + i * 0.085, pan = (Math.random() - 0.5) * 0.9;
          const car = this.ctx.createOscillator(), mod = this.ctx.createOscillator(), mg = this.ctx.createGain();
          const hp = this.ctx.createBiquadFilter(), g = this.ctx.createGain();
          car.type = 'square'; car.frequency.value = 1520 + i * 280;
          mod.type = 'sine'; mod.frequency.value = 537 + i * 70; mg.gain.value = 920;
          hp.type = 'highpass'; hp.frequency.value = 1800;
          g.gain.setValueAtTime(0.001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.008); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          mod.connect(mg); mg.connect(car.frequency); car.connect(hp); hp.connect(g);
          this.spatial(g, pan, 0.65, 0.12);
          car.start(t); mod.start(t); car.stop(t + 0.18); mod.stop(t + 0.18);
          this.noiseBurst(2400, 1.5, 0.11, 0.14, 'highpass', pan, 0.55);
        }
      }
      jumpscareShriek() {
        if (!this.ctx || !this.dryBus || !this.whiteNoise || this.muted) return;
        const now = this.ctx.currentTime;
        const sub = this.ctx.createOscillator(), sg = this.ctx.createGain();
        sub.type = 'sine'; sub.frequency.setValueAtTime(58, now); sub.frequency.exponentialRampToValueAtTime(35, now + 0.18); sub.frequency.exponentialRampToValueAtTime(26, now + 0.85);
        sg.gain.setValueAtTime(0.68, now); sg.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
        sub.connect(sg); sg.connect(this.dryBus); sub.start(now); sub.stop(now + 1.0);

        const car = this.ctx.createOscillator(), mod = this.ctx.createOscillator(), mg = this.ctx.createGain();
        const sh = this.ctx.createWaveShaper(), scG = this.ctx.createGain();
        car.type = 'sawtooth'; car.frequency.setValueAtTime(720, now); car.frequency.linearRampToValueAtTime(1520, now + 0.14); car.frequency.exponentialRampToValueAtTime(520, now + 1.15);
        mod.type = 'sine'; mod.frequency.setValueAtTime(237, now); mod.frequency.linearRampToValueAtTime(389, now + 0.32);
        mg.gain.setValueAtTime(950, now); mg.gain.exponentialRampToValueAtTime(280, now + 1.15);
        if (this.distCurve) sh.curve = this.distCurve;
        scG.gain.setValueAtTime(0.28, now); scG.gain.exponentialRampToValueAtTime(0.001, now + 1.18);
        mod.connect(mg); mg.connect(car.frequency); car.connect(sh); sh.connect(scG);
        this.spatial(scG, 0, 0.52, 0.18);
        car.start(now); mod.start(now); car.stop(now + 1.2); mod.stop(now + 1.2);

        const st = this.ctx.createBufferSource(); st.buffer = this.whiteNoise;
        const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(2300, now); bp.frequency.linearRampToValueAtTime(1450, now + 1.18); bp.Q.value = 1.15;
        const nSh = this.ctx.createWaveShaper(); if (this.distCurve) nSh.curve = this.distCurve;
        const ng = this.ctx.createGain(); ng.gain.setValueAtTime(0.46, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        st.connect(bp); bp.connect(nSh); nSh.connect(ng); this.spatial(ng, 0, 0.38, 0); st.start(now, 0, 1.22);
      }
      glassShatter() {
        if (!this.ctx || !this.dryBus || !this.whiteNoise || this.muted) return;
        const now = this.ctx.currentTime;
        const bm = this.ctx.createOscillator(), bg = this.ctx.createGain();
        bm.type = 'sawtooth'; bm.frequency.setValueAtTime(92, now); bm.frequency.exponentialRampToValueAtTime(28, now + 0.65);
        bg.gain.setValueAtTime(0.28, now); bg.gain.exponentialRampToValueAtTime(0.001, now + 0.72);
        bm.connect(bg); this.spatial(bg, 0, 0.52, 0); bm.start(now); bm.stop(now + 0.75);

        const src = this.ctx.createBufferSource(); src.buffer = this.whiteNoise;
        const hp = this.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2400;
        const ng = this.ctx.createGain(); ng.gain.setValueAtTime(0.36, now); ng.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
        src.connect(hp); hp.connect(ng); this.spatial(ng, 0, 0.64, 0); src.start(now, 0, 0.9);

        [2450, 3180, 3820, 4650, 2890, 5120].forEach((f, i) => {
          this.tone(f, 0.21, 0.15, i % 2 === 0 ? 'triangle' : 'sine', i * 0.042, (i % 2 === 0 ? -1 : 1) * (0.2 + i * 0.1), 0.65, 0.12);
        });
      }
      metalBang() {
        this.tone(150, 0.35, 0.38, 'triangle', 0, 0.2, 0.65, 0);
        this.noiseBurst(1480, 3.5, 0.28, 0.32, 'bandpass', -0.2, 0.6);
      }
      notifGlitch() {
        if (!this.ctx || !this.dryBus || this.muted) return;
        const now = this.ctx.currentTime;
        [1318.5, 1760, 1244.5, 2193].forEach((f, i) => {
          const t = now + i * 0.055;
          const o = this.ctx.createOscillator(), m = this.ctx.createOscillator(), mg = this.ctx.createGain();
          const sh = this.ctx.createWaveShaper(), g = this.ctx.createGain();
          o.type = 'square'; o.frequency.setValueAtTime(f, t); o.frequency.linearRampToValueAtTime(f * (i % 2 === 0 ? 0.84 : 1.14), t + 0.11);
          m.type = 'sawtooth'; m.frequency.value = 95 + i * 37; mg.gain.value = 260;
          if (this.distCurve) sh.curve = this.distCurve;
          g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          m.connect(mg); mg.connect(o.frequency); o.connect(sh); sh.connect(g);
          this.spatial(g, (i % 2 === 0 ? -1 : 1) * 0.4, 0.5, 0.32);
          o.start(t); m.start(t); o.stop(t + 0.18); m.stop(t + 0.18);
        });
      }
      electricBuzz() { this.tone(100, 0.14, 0.032, 'sawtooth', 0, (Math.random() - 0.5) * 0.8, 0.45, 0); }
      finalChord() { [220, 261.63, 329.63, 440].forEach((f, i) => this.tone(f, 3.4, 0.11, 'triangle', i * 0.18, (i - 1.5) * 0.24, 0.78, 0.35)); }
      heartBeat(vol) {
        if (!this.ctx || !this.dryBus) return;
        const now = this.ctx.currentTime;
        [[0, 68, vol], [0.16, 54, vol * 0.7]].forEach(([off, p, a]) => {
          const o = this.ctx.createOscillator(), g = this.ctx.createGain();
          o.type = 'sine'; o.frequency.setValueAtTime(p, now + off); o.frequency.exponentialRampToValueAtTime(28, now + off + 0.12);
          g.gain.setValueAtTime(0.001, now + off); g.gain.exponentialRampToValueAtTime(a, now + off + 0.016); g.gain.exponentialRampToValueAtTime(0.001, now + off + 0.15);
          o.connect(g); g.connect(this.dryBus); o.start(now + off); o.stop(now + off + 0.17);
        });
      }
      update(dt, frost, threat, hiding, moving, sprint, surface, layer = 0, inPlay = false) {
        if (!this.ctx || !this.ready) return;
        const now = this.ctx.currentTime;
        const danger = Math.max(0, Math.min(1, 1 - (threat - 2) / 13));
        if (this.windGain) {
          this.windGain.gain.setTargetAtTime(hiding ? 0.065 : 0.11 + frost * 0.14, now, 0.25);
          this.windFilterA.frequency.setTargetAtTime(hiding ? 185 : 230 + frost * 170, now, 0.25);
          this.windFilterB.frequency.setTargetAtTime(hiding ? 410 : 560 + frost * 320, now, 0.25);
        }
        if (this.droneGain) {
          this.droneGain.gain.setTargetAtTime(hiding ? 0.045 + danger * 0.03 : 0.068 + danger * 0.095, now, 0.22);
          this.droneFilter.frequency.setTargetAtTime(165 + danger * 220, now, 0.22);
        }
        if (this.scrapeGain) {
          this.scrapeGain.gain.setTargetAtTime(danger > 0.12 ? (danger - 0.12) * (hiding ? 0.03 : 0.095) : 0, now, 0.18);
          this.scrapeFilter.frequency.setTargetAtTime(750 + danger * 900, now, 0.2);
        }
        if (this.staticGain) {
          this.staticGain.gain.setTargetAtTime(danger > 0.16 ? (danger - 0.16) * (hiding ? 0.025 : 0.09) : 0, now, 0.16);
          this.staticFilter.frequency.setTargetAtTime(1250 + danger * 1100, now, 0.16);
        }
        if (this.whisperGain) {
          const wOn = inPlay && layer >= 1;
          this.whisperGain.gain.setTargetAtTime(wOn ? (hiding ? 0.02 : 0.055 + danger * 0.04) : 0, now, 0.35);
          if (wOn && this.whisperPanner) {
            this.wPanTimer -= dt;
            if (this.wPanTimer <= 0) { this.wPanTimer = 1.6 + Math.random() * 2.2; this.whisperPanner.pan.setTargetAtTime((Math.random() - 0.5) * 1.68, now, 0.65); }
          }
        }
        if (inPlay && !this.muted) {
          this.creakTimer -= dt;
          if (this.creakTimer <= 0) {
            this.creakTimer = 7.5 + Math.random() * 9.0;
            this.tone(160 + Math.random() * 90, 0.48, 0.024, 'sawtooth', 0, (Math.random() > 0.5 ? 1 : -1) * 0.72, 0.72, 0);
          }
        }
        if (!this.muted) {
          this.bgmTimer -= dt;
          if (this.bgmTimer <= 0) {
            this.bgmTimer = danger > 0.5 ? 0.6 : 0.72;
            const n = this.notes[this.bgmStep++ % this.notes.length];
            if (n) this.playBgmNote(n, -12 + Math.random() * 27, danger > 0.55 ? 0.052 : 0.082, Math.sin(this.bgmStep * 0.7) * 0.42);
          }
        }
        if (inPlay && moving && !hiding) {
          this.stepTimer -= dt;
          if (this.stepTimer <= 0) {
            this.stepTimer = sprint ? 0.31 : 0.48;
            this.stepPan *= -1;
            const p = this.stepPan * 0.18;
            this.noiseBurst(surface === 'wood' ? 430 : surface === 'tile' ? 1180 : 1720, surface === 'snow' ? 0.95 : 2.3, 0.11, sprint ? 0.2 : 0.12, 'bandpass', p, surface === 'tile' ? 0.45 : 0.26);
          }
        }
        if (inPlay && danger > 0.08) {
          this.hbTimer -= dt;
          if (this.hbTimer <= 0) { this.hbTimer = 60 / (58 + danger * (hiding ? 48 : 90)); this.heartBeat(0.13 + danger * 0.28); }
        }
      }
      cue(kind) {
        if (kind === 'clock') [130.8, 196, 261.6, 311.13].forEach((f, i) => this.tone(f, 2.8, 0.14 / (i + 1), i === 0 ? 'triangle' : 'sine', 0, (i - 1.5) * 0.18, 0.72, 0.22));
        else if (kind === 'chime') [523.25, 659.25, 784, 1046.5].forEach((f, i) => this.tone(f, 0.85, 0.14, 'triangle', i * 0.09, (i - 1.5) * 0.25, 0.65, 0.35));
        else if (kind === 'door') { this.tone(95, 0.34, 0.34, 'sawtooth', 0, (Math.random() - 0.5) * 0.7, 0.62, 0); this.noiseBurst(680, 1.0, 0.24, 0.26, 'lowpass', 0, 0.58); }
        else if (kind === 'ice') this.glassShatter();
        else if (kind === 'whisper') this.noiseBurst(1600, 6.0, 0.7, 0.16, 'bandpass', (Math.random() > 0.5 ? 1 : -1) * 0.7, 0.7);
      }
    }
    const audio = new AudioSys();
    const unlockAudioFirst = () => audio.init();
    window.addEventListener('pointerdown', unlockAudioFirst, { once: true, capture: true });
    window.addEventListener('touchstart', unlockAudioFirst, { once: true, capture: true });
    window.addEventListener('keydown', unlockAudioFirst, { once: true, capture: true });

    // --- PROCEDURAL PBR CANVAS TEXTURES (COLOR + BUMP + ROUGHNESS) ---
    function makeTexPair(size, drawFn, repX = 1, repY = 1) {
      const cc = document.createElement('canvas'); cc.width = size; cc.height = size;
      const bc = document.createElement('canvas'); bc.width = size; bc.height = size;
      const rc = document.createElement('canvas'); rc.width = size; rc.height = size;
      drawFn(cc.getContext('2d'), bc.getContext('2d'), rc.getContext('2d'), size);
      const wrap = (cv, isCol) => {
        const t = new THREE.CanvasTexture(cv);
        t.wrapS = t.wrapT = THREE.RepeatWrapping;
        t.repeat.set(repX, repY);
        t.colorSpace = isCol ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        return t;
      };
      return { map: wrap(cc, true), bump: wrap(bc, false), rough: wrap(rc, false) };
    }
    function makeSingleTex(w, h, drawFn, clamp = false) {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      drawFn(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      t.wrapS = t.wrapT = clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
      return t;
    }

    const WOOD = makeTexPair(256, (c, b, r, s) => {
      c.fillStyle = '#251e1a'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#909090'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#888888'; r.fillRect(0, 0, s, s);
      for (let y = 0; y < s; y += 32) {
        c.fillStyle = y % 64 === 0 ? '#312620' : '#211915'; c.fillRect(0, y, s, 30);
        c.fillStyle = '#0c0908'; c.fillRect(0, y + 30, s, 2);
        b.fillStyle = '#202020'; b.fillRect(0, y + 30, s, 2);
        for (let i = 0; i < 24; i++) {
          const rx = Math.random() * s, ry = y + Math.random() * 28, rw = 20 + Math.random() * 64, ice = i % 5 === 0;
          c.fillStyle = ice ? 'rgba(186,224,248,0.14)' : 'rgba(10,7,5,0.34)'; c.fillRect(rx, ry, rw, 1.5);
          b.fillStyle = ice ? '#d4d4d4' : '#555555'; b.fillRect(rx, ry, rw, 1.5);
          r.fillStyle = ice ? '#282828' : '#b8b8b8'; r.fillRect(rx, ry, rw, 3);
        }
      }
    }, 4, 4);

    const PLASTER = makeTexPair(256, (c, b, r, s) => {
      c.fillStyle = '#1b232f'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#888888'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#b0b0b0'; r.fillRect(0, 0, s, s);
      for (let i = 0; i < 180; i++) {
        const x = Math.random() * s, y = Math.random() * s, rad = 4 + Math.random() * 16;
        c.fillStyle = i % 3 === 0 ? 'rgba(11,16,23,0.35)' : 'rgba(130,155,178,0.08)';
        c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill();
        b.fillStyle = i % 2 === 0 ? 'rgba(100,100,100,0.3)' : 'rgba(165,165,165,0.25)';
        b.beginPath(); b.arc(x, y, rad * 0.8, 0, Math.PI * 2); b.fill();
      }
    }, 3, 2);

    const TILE = makeTexPair(256, (c, b, r, s) => {
      c.fillStyle = '#182029'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#303030'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#888888'; r.fillRect(0, 0, s, s);
      for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
        c.fillStyle = (x + y) % 2 === 0 ? '#27323f' : '#1b242e'; c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        b.fillStyle = '#a8a8a8'; b.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
        r.fillStyle = (x + y) % 2 === 0 ? '#505050' : '#686868'; r.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
      }
    }, 6, 6);

    const ICE = makeTexPair(256, (c, b, r, s) => {
      c.fillStyle = '#7db5d4'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#808080'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#2c2c2c'; r.fillRect(0, 0, s, s);
      for (let i = 0; i < 75; i++) {
        const x1 = Math.random() * s, y1 = Math.random() * s, x2 = x1 + (Math.random() - 0.5) * 90, y2 = y1 + (Math.random() - 0.5) * 90;
        c.strokeStyle = i % 2 === 0 ? 'rgba(235,248,255,0.48)' : 'rgba(20,62,96,0.36)'; c.lineWidth = 1.4;
        b.strokeStyle = i % 2 === 0 ? '#e8e8e8' : '#252525'; b.lineWidth = 1.5;
        r.strokeStyle = i % 2 === 0 ? '#909090' : '#1a1a1a'; r.lineWidth = 2;
        [c, b, r].forEach(ctx => { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); });
      }
    }, 2, 2);

    const FABRIC = makeTexPair(128, (c, b, r, s) => {
      c.fillStyle = '#d4dce6'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#707070'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#c8c8c8'; r.fillRect(0, 0, s, s);
      for (let i = 0; i < s; i += 3) {
        c.fillStyle = 'rgba(15,23,42,0.14)'; c.fillRect(0, i, s, 1); c.fillRect(i, 0, 1, s);
        b.fillStyle = i % 6 === 0 ? '#b8b8b8' : '#404040'; b.fillRect(0, i, s, 1); b.fillRect(i, 0, 1, s);
      }
    }, 4, 4);

    const SHADOW_TEX = makeTexPair(256, (c, b, r, s) => {
      c.fillStyle = '#06080e'; c.fillRect(0, 0, s, s);
      b.fillStyle = '#606060'; b.fillRect(0, 0, s, s);
      r.fillStyle = '#b0b0b0'; r.fillRect(0, 0, s, s);
      for (let i = 0; i < 36; i++) {
        let x = Math.random() * s, y = Math.random() * s;
        c.strokeStyle = i % 3 === 0 ? 'rgba(185,28,28,0.42)' : 'rgba(100,145,175,0.22)'; c.lineWidth = 1.5;
        b.strokeStyle = '#101010'; b.lineWidth = 2.6;
        c.beginPath(); b.beginPath(); c.moveTo(x, y); b.moveTo(x, y);
        for (let k = 0; k < 4; k++) { x += (Math.random() - 0.5) * 48; y += (Math.random() - 0.5) * 48; c.lineTo(x, y); b.lineTo(x, y); }
        c.stroke(); b.stroke();
      }
    }, 2, 2);

    const TEX = {
      mask: makeSingleTex(256, 256, (c) => {
        c.fillStyle = '#d9dfe6'; c.fillRect(0, 0, 256, 256);
        c.strokeStyle = '#1e293b'; c.lineWidth = 2.2;
        [[40,20,96,84,88,128,118,180],[210,35,165,92,182,145,148,210],[128,140,134,195,122,240]].forEach(p => {
          c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i+1]); c.stroke();
        });
        c.fillStyle = '#030508';
        c.beginPath(); c.ellipse(90, 110, 20, 14, -0.12, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(166, 110, 20, 14, 0.12, 0, Math.PI * 2); c.fill();
      }, true),
      snow: makeSingleTex(64, 64, (c) => {
        const g = c.createRadialGradient(32, 32, 2, 32, 32, 30);
        g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        c.fillStyle = g; c.fillRect(0, 0, 64, 64);
      }, true),
      dust: makeSingleTex(32, 32, (c) => {
        const g = c.createRadialGradient(16, 16, 1, 16, 16, 14);
        g.addColorStop(0, 'rgba(255,244,214,0.95)'); g.addColorStop(1, 'rgba(186,214,235,0)');
        c.fillStyle = g; c.fillRect(0, 0, 32, 32);
      }, true),
      bkSign: makeSingleTex(512, 192, (c) => {
        c.fillStyle = '#141920'; c.fillRect(0, 0, 512, 192);
        c.strokeStyle = '#94a3b8'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 176);
        c.fillStyle = '#e2e8f0'; c.font = 'bold 34px Georgia'; c.textAlign = 'center'; c.fillText('RUANG BK', 256, 76);
        c.fillStyle = '#fca5a5'; c.font = 'bold 24px Courier New'; c.fillText('"TAKUT DIHAKIMI"', 256, 134);
      }, true),
      bulletin: makeSingleTex(512, 256, (c) => {
        c.fillStyle = '#3b2b20'; c.fillRect(0, 0, 512, 256);
        [[24,20,'PENGUMUMAN'],[175,32,'RUANG AMAN?'],[336,24,'JANGAN BUNGKAM']].forEach(([x,y,txt]) => {
          c.fillStyle = '#cbd5e1'; c.fillRect(x, y, 135, 160);
          c.fillStyle = '#0f172a'; c.font = 'bold 14px Courier New'; c.fillText(txt, x + 10, y + 32);
        });
      }, true),
      clock: makeSingleTex(256, 256, (c) => {
        c.fillStyle = '#e2e8f0'; c.beginPath(); c.arc(128, 128, 120, 0, Math.PI * 2); c.fill();
        c.strokeStyle = '#0f172a'; c.lineWidth = 8; c.stroke();
      }, true),
      kbgo: makeSingleTex(512, 320, (c) => {
        c.fillStyle = '#0d0914'; c.fillRect(0, 0, 512, 320);
        c.strokeStyle = '#9b6eaf'; c.lineWidth = 5; c.strokeRect(18, 18, 476, 284);
        c.fillStyle = '#f1f5f9'; c.font = 'bold 26px Courier New'; c.fillText('KIRIM PAP SEKARANG', 95, 118);
        c.fillStyle = '#fca5a5'; c.font = 'bold 16px Courier New'; c.fillText('[!] REKAYASA FOTO AI / PEMAKSAAN', 95, 194);
      }, true),
      glitchFace: makeSingleTex(512, 320, (c) => {
        c.fillStyle = '#160409'; c.fillRect(0, 0, 512, 320);
        c.strokeStyle = '#dc2626'; c.lineWidth = 6; c.strokeRect(14, 14, 484, 292);
        c.fillStyle = '#e2e8f0'; c.beginPath(); c.ellipse(256, 142, 76, 98, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#020617'; c.beginPath(); c.ellipse(222, 126, 18, 13, -0.15, 0, Math.PI * 2); c.ellipse(290, 126, 18, 13, 0.15, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#dc2626'; c.fillRect(216, 124, 12, 4); c.fillRect(284, 124, 12, 4);
        c.fillStyle = '#e2e8f0'; c.font = 'bold 24px Courier New'; c.textAlign = 'center'; c.fillText('SUDAH TERSEBAR', 256, 282);
      }, true),
    };

    // --- THREE.JS SETUP WITH SHADOWS & DUST MOTES ---
    const wrap = document.getElementById('gl-wrap');
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04080f);
    const fog = new THREE.FogExp2(0x04080f, 0.046);
    scene.fog = fog;
    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.08, 140);
    scene.add(camera);

    scene.add(new THREE.HemisphereLight(0x78a9c4, 0x0f172a, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffedd5, 0.38);
    dirLight.position.set(8, 16, 10);
    scene.add(dirLight);

    const flashlight = new THREE.SpotLight(0xfef3c7, 5.6, 26, Math.PI / 4.8, 0.55, 1.5);
    flashlight.castShadow = true;
    flashlight.shadow.mapSize.set(1024, 1024);
    flashlight.shadow.bias = -0.0005;
    const flTarget = new THREE.Object3D(); flTarget.position.set(0, -0.08, -10);
    camera.add(flashlight); camera.add(flTarget); flashlight.target = flTarget;

    const lanternLight = new THREE.PointLight(0xd4a353, 0, 22, 1.5);
    scene.add(lanternLight);

    const snowGeo = new THREE.BufferGeometry();
    const snowPos = new Float32Array(700 * 3);
    for (let i = 0; i < 700; i++) {
      snowPos[i * 3] = (Math.random() - 0.5) * 36; snowPos[i * 3 + 1] = Math.random() * 11.5; snowPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
    }
    snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
    const snowPoints = new THREE.Points(snowGeo, new THREE.PointsMaterial({ color: 0xe0f2fe, map: TEX.snow, size: 0.16, transparent: true, opacity: 0.72, depthWrite: false }));
    scene.add(snowPoints);

    const dustCount = 2400;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    const dustBase = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustBase[i * 3] = (Math.random() - 0.5) * 20;
      dustBase[i * 3 + 1] = 0.25 + Math.random() * 3.1;
      dustBase[i * 3 + 2] = (Math.random() - 0.5) * 20;
      dustPos[i * 3] = dustBase[i * 3]; dustPos[i * 3 + 1] = dustBase[i * 3 + 1]; dustPos[i * 3 + 2] = dustBase[i * 3 + 2];
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustPoints = new THREE.Points(dustGeo, new THREE.PointsMaterial({
      color: 0xfef3c7, map: TEX.dust, size: 0.052, transparent: true, opacity: 0.36, depthWrite: false, blending: THREE.AdditiveBlending
    }));
    scene.add(dustPoints);

    // --- HIGH-SEGMENT ARTICULATED CHARACTERS (32-36 SEGMENTS) ---
    function createPerson(opts) {
      const root = new THREE.Group();
      const clothStrands = [];
      const skinMat = new THREE.MeshStandardMaterial({ color: opts.skin, roughness: 0.58 });
      const coatMat = new THREE.MeshStandardMaterial({ color: opts.coat, map: FABRIC.map, bumpMap: FABRIC.bump, bumpScale: 0.012, roughnessMap: FABRIC.rough, roughness: 0.82 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, map: FABRIC.map, roughness: 0.68 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: opts.pants || 0x121822, map: FABRIC.map, bumpMap: FABRIC.bump, bumpScale: 0.01, roughness: 0.85 });
      const hairMat = new THREE.MeshStandardMaterial({ color: opts.hair || 0x181515, map: opts.hijab ? FABRIC.map : undefined, roughness: opts.hijab ? 0.78 : 0.48 });

      const hips = new THREE.Group(); hips.position.y = 0.88; root.add(hips);
      const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.17, 32), pantsMat);
      pelvis.castShadow = true; hips.add(pelvis);

      if (opts.skirt) {
        const sk = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.15, 0.06), new THREE.Vector2(0.22, -0.14), new THREE.Vector2(0.27, -0.38)], 32), pantsMat);
        sk.castShadow = true; hips.add(sk);
      }

      const torso = new THREE.Group(); torso.position.y = 0.08; hips.add(torso);
      const chest = new THREE.Mesh(new THREE.LatheGeometry([
        new THREE.Vector2(0.132, 0), new THREE.Vector2(0.128, 0.12), new THREE.Vector2(0.158, 0.28), new THREE.Vector2(0.168, 0.41), new THREE.Vector2(0.112, 0.47)
      ], 36), coatMat);
      chest.scale.set(1.06, 1, 0.82); chest.castShadow = true; torso.add(chest);

      const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.03), shirtMat); shirtV.position.set(0, 0.31, 0.125); torso.add(shirtV);
      const shoulders = new THREE.Group(); shoulders.position.y = 0.41; torso.add(shoulders);
      const collar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.024, 14, 32, Math.PI * 1.55), shirtMat);
      collar.rotation.x = Math.PI / 2; collar.rotation.z = -Math.PI * 0.27; collar.position.set(0, 0.045, 0.01); shoulders.add(collar);

      const head = new THREE.Group(); head.position.y = 0.065; shoulders.add(head);
      const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.125, 36, 32), skinMat);
      cranium.scale.set(0.9, 1.07, 0.96); cranium.position.y = 0.17; cranium.castShadow = true; head.add(cranium);

      let leftEyelid = null, rightEyelid = null;
      if (!opts.mannequin) {
        const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.048, 16), skinMat);
        nose.rotation.x = 0.35; nose.position.set(0, 0.16, 0.122); head.add(nose);
        const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.026, 6, 12), new THREE.MeshStandardMaterial({ color: 0x9b6668, roughness: 0.45 }));
        lips.rotation.z = Math.PI / 2; lips.position.set(0, 0.115, 0.113); head.add(lips);
        const buildEye = (side) => {
          const eg = new THREE.Group(); eg.position.set(side * 0.038, 0.18, 0.104);
          const sc = new THREE.Mesh(new THREE.SphereGeometry(0.016, 16, 14), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.12 })); sc.scale.set(1.1, 0.9, 0.75);
          const ir = new THREE.Mesh(new THREE.SphereGeometry(0.009, 14, 12), new THREE.MeshStandardMaterial({ color: 0x1e1815, roughness: 0.05 })); ir.position.z = 0.008;
          const gl = new THREE.Mesh(new THREE.SphereGeometry(0.0028, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); gl.position.set(0.003, 0.003, 0.0155);
          const lid = new THREE.Mesh(new THREE.SphereGeometry(0.0175, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), skinMat);
          lid.rotation.x = -0.2; lid.scale.set(1.15, 0.25, 0.82); lid.position.set(0, 0.004, 0.001);
          eg.add(sc, ir, gl, lid); head.add(eg); return lid;
        };
        leftEyelid = buildEye(-1); rightEyelid = buildEye(1);
      }

      if (opts.hijab) {
        const hood = new THREE.Mesh(new THREE.SphereGeometry(0.138, 36, 28, 0, Math.PI * 2, 0, Math.PI * 0.7), hairMat);
        hood.position.set(0, 0.175, -0.012); hood.rotation.x = -0.24; head.add(hood);
        const drape = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.115, 0.18), new THREE.Vector2(0.15, 0.06), new THREE.Vector2(0.22, -0.18)], 36), hairMat);
        drape.position.set(0, 0.03, -0.008); head.add(drape); clothStrands.push(drape);
      } else {
        const cap = new THREE.Mesh(new THREE.SphereGeometry(0.132, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMat);
        cap.position.set(0, 0.184, -0.016); cap.rotation.x = -0.24; head.add(cap);
      }

      const buildArm = (side) => {
        const p = new THREE.Group(); p.position.set(side * 0.205, 0, 0);
        const u = new THREE.Mesh(new THREE.CapsuleGeometry(0.044, 0.2, 10, 20), coatMat); u.position.y = -0.12;
        const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.18, 10, 20), coatMat); l.position.set(0, -0.33, 0.02); l.rotation.x = -0.16;
        const cf = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.04, 0.04, 20), shirtMat); cf.position.set(0, -0.43, 0.035);
        p.add(u, l, cf);
        for (let f = 0; f < 5; f++) {
          const fin = new THREE.Mesh(new THREE.CapsuleGeometry(0.005, 0.028, 4, 8), skinMat);
          fin.position.set(f === 4 ? -side * 0.015 : 0, -0.49, f === 4 ? 0.05 : 0.025 + f * 0.01);
          p.add(fin);
        }
        shoulders.add(p); return p;
      };
      const armL = buildArm(-1), armR = buildArm(1);

      const buildLeg = (side) => {
        const p = new THREE.Group(); p.position.set(side * 0.092, -0.04, 0);
        const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 10, 24), pantsMat); th.position.y = -0.21;
        const sh = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.3, 10, 24), pantsMat); sh.position.y = -0.54;
        const shoe = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.11, 8, 16), new THREE.MeshStandardMaterial({ color: 0x0f1520, roughness: 0.35 }));
        shoe.rotation.x = Math.PI / 2; shoe.position.set(0, -0.78, 0.038);
        p.add(th, sh, shoe); hips.add(p); return p;
      };
      const legL = buildLeg(-1), legR = buildLeg(1);

      return { root, hips, torso, chest, shoulders, head, leftEyelid, rightEyelid, clothStrands, armL, armR, legL, legR };
    }

    function posePerson(rig, mode, t, forceEyesClosed = false) {
      for (let i = 0; i < rig.clothStrands.length; i++) rig.clothStrands[i].rotation.z = Math.sin(t * 2.1 + i) * 0.035;
      if (rig.leftEyelid && rig.rightEyelid) {
        const sc = forceEyesClosed ? 1.08 : (t % 4.3 > 4.12 ? 1.05 : 0.24);
        rig.leftEyelid.scale.y = sc; rig.rightEyelid.scale.y = sc;
      }
      const br = 1 + Math.sin(t * 2.2) * 0.022;
      rig.chest.scale.set(1.06 * br, 1, 0.82 * br);
      if (mode === 'seated') {
        rig.hips.position.y = 0.46; rig.torso.rotation.x = 0.24 + Math.sin(t * 2.2) * 0.028;
        rig.shoulders.position.x = Math.sin(t * 26) * 0.004; rig.shoulders.rotation.z = Math.sin(t * 18) * 0.012;
        rig.head.rotation.x = 0.3 + Math.sin(t * 1.4) * 0.03;
        rig.legL.rotation.x = -1.35; rig.legR.rotation.x = -1.35;
        rig.armL.rotation.x = -0.95; rig.armL.rotation.z = -0.36; rig.armR.rotation.x = -0.95; rig.armR.rotation.z = 0.36;
      } else if (mode === 'walk') {
        const p = t * 5.2;
        rig.hips.position.y = 0.88 + Math.abs(Math.sin(p)) * 0.03; rig.torso.rotation.x = 0.06;
        rig.legL.rotation.x = Math.sin(p) * 0.52; rig.legR.rotation.x = -Math.sin(p) * 0.52;
        rig.armL.rotation.x = -Math.sin(p) * 0.42; rig.armR.rotation.x = Math.sin(p) * 0.42;
      } else {
        rig.hips.position.y = 0.88; rig.torso.rotation.x = Math.sin(t * 1.8) * 0.022;
        rig.legL.rotation.x = 0; rig.legR.rotation.x = 0; rig.armL.rotation.x = 0.04; rig.armR.rotation.x = 0.04;
      }
    }

    function createShadow(tall = false) {
      const root = new THREE.Group();
      const sc = tall ? 1.24 : 1.06;
      const cloakMat = new THREE.MeshStandardMaterial({ map: SHADOW_TEX.map, bumpMap: SHADOW_TEX.bump, bumpScale: 0.035, color: 0x0a0d14, emissive: 0x140812, emissiveIntensity: 0.55, roughness: 0.88 });
      const maskMat = new THREE.MeshStandardMaterial({ map: TEX.mask, color: 0xe2e8f0, roughness: 0.22 });

      const hips = new THREE.Group(); hips.scale.setScalar(sc); root.add(hips);
      const robe = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.42, 0), new THREE.Vector2(0.28, 0.45), new THREE.Vector2(0.18, 0.92), new THREE.Vector2(0.14, 1.12)], 28), cloakMat);
      robe.castShadow = true; hips.add(robe);
      const torso = new THREE.Group(); torso.position.y = 1.06; hips.add(torso);
      const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.13, 0.58, 24), cloakMat); chest.position.y = 0.29; torso.add(chest);
      const head = new THREE.Group(); head.position.y = 0.62; torso.add(head);
      const skull = new THREE.Mesh(new THREE.SphereGeometry(0.148, 28, 24), cloakMat); skull.scale.set(0.84, 1.22, 0.9); skull.position.y = 0.17; head.add(skull);

      const maskPlate = new THREE.Mesh(new THREE.SphereGeometry(0.136, 28, 24, -Math.PI * 0.38, Math.PI * 0.76, Math.PI * 0.18, Math.PI * 0.66), maskMat);
      maskPlate.scale.set(0.92, 1.18, 0.98); maskPlate.position.set(0, 0.17, 0.028); head.add(maskPlate);
      const pinMat = new THREE.MeshBasicMaterial({ color: tall ? 0xef4444 : 0x7dd3fc });
      const pL = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), pinMat); pL.position.set(-0.042, 0.185, 0.138);
      const pR = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), pinMat); pR.position.set(0.042, 0.185, 0.138);
      head.add(pL, pR);

      const maskAnchor = new THREE.Object3D(); maskAnchor.position.set(0, 0.17, 0.16); head.add(maskAnchor);

      [-1, 1].forEach(side => {
        const arm = new THREE.Group(); arm.position.set(side * 0.24, 0.54, 0);
        const u = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.32, 8, 14), cloakMat); u.position.y = -0.18;
        const l = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.34, 8, 14), cloakMat); l.position.set(0, -0.5, 0.05); l.rotation.x = -0.25;
        arm.add(u, l);
        for (let c = 0; c < 5; c++) {
          const claw = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.14, 6), cloakMat);
          claw.position.set((c - 2) * 0.015, -0.73, 0.1); claw.rotation.x = Math.PI + 0.2; arm.add(claw);
        }
        torso.add(arm);
      });

      const cg = new THREE.BufferGeometry(); const cp = new Float32Array(80 * 3);
      for (let i = 0; i < 80; i++) { const a = Math.random() * Math.PI * 2, r = 0.35 + Math.random() * 0.45; cp[i*3] = Math.cos(a)*r; cp[i*3+1] = 0.2 + Math.random() * 1.9; cp[i*3+2] = Math.sin(a)*r; }
      cg.setAttribute('position', new THREE.BufferAttribute(cp, 3));
      const cloud = new THREE.Points(cg, new THREE.PointsMaterial({ color: 0x090d16, size: 0.09, transparent: true, opacity: 0.85, depthWrite: false }));
      root.add(cloud, new THREE.PointLight(tall ? 0xdc2626 : 0x78a9c4, 1.5, 6.5));
      return { root, torso, head, maskAnchor, cloud };
    }

    // --- LEVEL STATE & PROPS ---
    let worldRoot = new THREE.Group(); scene.add(worldRoot);
    let colliders = [], interactables = [], hidingSpots = [], enemies = [], mannequins = [];
    let autoDoors = [], storyTriggers = [], envScares = [], animated = [];
    let curtains = [], clockHands = [], flickerLights = [], beaconRipples = [];
    let campusRindi = null, campusBima = null, domeCtrl = null;
    let droppedLight = null, cutsceneShadows = [];

    function resetSceneGroup() {
      scene.remove(worldRoot); worldRoot = new THREE.Group(); scene.add(worldRoot);
      colliders = []; interactables = []; hidingSpots = []; enemies = []; mannequins = [];
      autoDoors = []; storyTriggers = []; envScares = []; animated = [];
      curtains = []; clockHands = []; flickerLights = []; beaconRipples = [];
      campusRindi = null; campusBima = null; domeCtrl = null;
      droppedLight = null; cutsceneShadows = [];
    }

    function addWall(x, y, z, w, h, d, mat, solid = true) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z); m.receiveShadow = true; m.castShadow = true; worldRoot.add(m);
      if (solid) colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
      return m;
    }

    function buildWinterTree(x, z) {
      const g = new THREE.Group(); g.position.set(x, 0, z);
      const bMat = new THREE.MeshStandardMaterial({ map: WOOD.map, bumpMap: WOOD.bump, bumpScale: 0.03, color: 0x2a201b, roughness: 0.9 });
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 3.0, 14), bMat); tr.position.y = 1.5; tr.castShadow = true; g.add(tr);
      [[-0.45, 2.7, 0.15, 0.22, 0.68], [0.48, 2.88, -0.2, -0.24, -0.62], [0.1, 3.15, 0.48, 0.58, 0.14], [-0.2, 3.35, -0.45, -0.55, -0.16]].forEach(([bx, by, bz, rx, rz]) => {
        const br = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.08, 1.85, 8), bMat);
        br.position.set(bx, by, bz); br.rotation.set(rx, 0, rz); g.add(br);
        const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.03, 0.9, 6), bMat);
        tw.position.set(bx * 1.6, by + 0.65, bz * 1.6); tw.rotation.z = rz * 1.3; g.add(tw);
      });
      worldRoot.add(g);
    }

    function buildDesk(x, z, ry) {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry;
      const wMat = new THREE.MeshStandardMaterial({ map: WOOD.map, bumpMap: WOOD.bump, bumpScale: 0.015, color: 0x614634, roughness: 0.72 });
      const sMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.8 });
      const top = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.045, 0.56), wMat); top.position.y = 0.74; top.castShadow = true; g.add(top);
      [[-0.36,-0.22],[0.36,-0.22],[-0.36,0.22],[0.36,0.22]].forEach(([lx,lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.72, 8), sMat); leg.position.set(lx, 0.36, lz); g.add(leg);
      });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.035, 0.42), wMat); seat.position.set(0, 0.44, 0.52);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.035), wMat); back.position.set(0, 0.72, 0.71);
      const nb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.016, 0.2), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })); nb.position.set(-0.12, 0.77, 0.04);
      g.add(seat, back, nb);
      worldRoot.add(g);
      colliders.push({ minX: x - 0.48, maxX: x + 0.48, minZ: z - 0.35, maxZ: z + 0.65 });
    }

    function buildCloset(x, z, yaw, label, style = 'wood') {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
      const bMat = new THREE.MeshStandardMaterial({ map: style === 'wood' ? WOOD.map : undefined, color: style === 'wood' ? 0x3b2a22 : 0x1e3240, roughness: 0.68 });
      const shell = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.25, 0.9), bMat); shell.position.y = 1.125; shell.castShadow = true;
      const pL = new THREE.Group(); pL.position.set(-0.53, 1.08, 0.46);
      const dL = new THREE.Mesh(new THREE.BoxGeometry(0.52, 2.08, 0.05), bMat); dL.position.x = 0.26; pL.add(dL);
      const pR = new THREE.Group(); pR.position.set(0.53, 1.08, 0.46);
      const dR = new THREE.Mesh(new THREE.BoxGeometry(0.52, 2.08, 0.05), bMat); dR.position.x = -0.26; pR.add(dR);
      g.add(shell, pL, pR); worldRoot.add(g);
      hidingSpots.push({ position: new THREE.Vector3(x, 1.48, z), lookOutYaw: yaw, label });
      return { group: g, pL, pR };
    }

    function buildCampus(mode) {
      resetSceneGroup();
      const dawn = mode === 'true';
      scene.background = new THREE.Color(dawn ? 0x1f2d42 : 0x04080f);
      fog.color.setHex(dawn ? 0x1f2d42 : 0x04080f);
      fog.density = dawn ? 0.018 : 0.045;
      snowPoints.visible = !dawn;

      const ground = new THREE.Mesh(new THREE.PlaneGeometry(70, 70), new THREE.MeshStandardMaterial({ color: dawn ? 0x475569 : 0x1e2c3a, roughness: 0.85 }));
      ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; worldRoot.add(ground);

      const bench = new THREE.Group();
      const bWood = new THREE.MeshStandardMaterial({ map: WOOD.map, bumpMap: WOOD.bump, color: 0x6b4b38, roughness: 0.72 });
      const iron = new THREE.MeshStandardMaterial({ color: 0x1a222d, metalness: 0.82, roughness: 0.35 });
      for (let i = 0; i < 4; i++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.048, 0.12), bWood); s.position.set(0, 0.45, -0.18 + i * 0.13); bench.add(s);
        if (i < 3) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.11, 0.045), bWood); b.position.set(0, 0.65 + i * 0.145, -0.27); bench.add(b); }
      }
      [-0.92, 0.92].forEach(lx => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.45, 12), iron); leg.position.set(lx, 0.225, 0.22); bench.add(leg); });
      bench.position.set(0, 0, -1.2); worldRoot.add(bench);

      const bulletin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.15, 0.1), bWood); bulletin.position.set(-3.2, 1.55, -4.6); bulletin.rotation.y = 0.42; worldRoot.add(bulletin);
      const flyers = new THREE.Mesh(new THREE.PlaneGeometry(1.92, 0.98), new THREE.MeshStandardMaterial({ map: TEX.bulletin })); flyers.position.set(-3.16, 1.55, -4.54); flyers.rotation.y = 0.42; worldRoot.add(flyers);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.072, 3.8, 12), iron); pole.position.set(-2.35, 1.9, -1.8); worldRoot.add(pole);
      const lamp = new THREE.PointLight(dawn ? 0xfde68a : 0x93c5fd, dawn ? 5 : 2.8, 14); lamp.position.set(-2.35, 3.8, -1.8); worldRoot.add(lamp);

      const fac = new THREE.Mesh(new THREE.BoxGeometry(22, 8.5, 6), new THREE.MeshStandardMaterial({ color: 0x16202c, roughness: 0.8 }));
      fac.position.set(0, 4.25, -18.5); worldRoot.add(fac);
      [[-5.5, -5.5], [5.8, -4.8], [-7.5, 3.2], [7.2, 4.0]].forEach(([tx, tz]) => buildWinterTree(tx, tz));

      campusRindi = createPerson({ coat: 0x1f3a5c, skin: 0xd6b094, hijab: true, skirt: true });
      campusRindi.root.position.set(mode === 'true' ? -0.65 : 0, mode === 'true' ? 0 : 0.05, mode === 'true' ? 0.4 : -0.95);
      worldRoot.add(campusRindi.root);

      if (mode !== 'title') {
        campusBima = createPerson({ coat: 0x263547, skin: 0xc9a182, hijab: false });
        campusBima.root.position.set(mode === 'true' ? 0.75 : 1.45, 0, mode === 'true' ? 0.55 : 0.65);
        campusBima.root.rotation.y = mode === 'true' ? -0.35 : -0.82;
        worldRoot.add(campusBima.root);
      }
    }

    function addFragMesh(id, label, x, y, z, color, hex) {
      const g = new THREE.Group(); g.position.set(x, y, z);
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color, emissive: hex, emissiveIntensity: 1.5 }));
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.68, 14), new THREE.MeshStandardMaterial({ map: WOOD.map, color: 0x3b2c22 })); ped.position.y = -0.5;
      const light = new THREE.PointLight(hex, 2.3, 6);
      g.add(orb, ped, light); worldRoot.add(g);
      animated.push({ mesh: orb, mode: 'bob' });
      interactables.push({ id, label, kind: 'fragment', position: new THREE.Vector3(x, y, z), radius: 2.3, mesh: g, collected: false });
    }

    function buildGameplayLayer(idx, frost, diff) {
      resetSceneGroup();
      scene.background = new THREE.Color(0x04080f);
      fog.color.setHex(0x04080f);
      fog.density = 0.04 + frost * 0.05;
      snowPoints.visible = true;
      const spdScale = (diff === 'story' ? 0.58 : 1.0) * (1 + frost * 0.35);

      if (idx === 0) {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 30), new THREE.MeshStandardMaterial({ map: WOOD.map, bumpMap: WOOD.bump, bumpScale: 0.025, roughnessMap: WOOD.rough, color: 0xa4bdd4 }));
        floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldRoot.add(floor);
        const wallM = new THREE.MeshStandardMaterial({ map: PLASTER.map, bumpMap: PLASTER.bump, bumpScale: 0.03, color: 0x3b4858, roughness: 0.85 });
        addWall(0, 1.68, 12.8, 13.8, 3.36, 0.45, wallM); addWall(0, 1.68, -13.8, 13.8, 3.36, 0.45, wallM);
        addWall(-6.7, 1.68, -0.5, 0.45, 3.36, 26.8, wallM); addWall(6.7, 1.68, -0.5, 0.45, 3.36, 26.8, wallM);
        addWall(-2.0, 1.68, 5.8, 0.35, 3.36, 6.2, wallM); addWall(-2.0, 1.68, -3.5, 0.35, 3.36, 6.5, wallM); addWall(2.0, 1.68, -2.5, 0.35, 3.36, 7.5, wallM);

        // Downstairs warm syukuran staircase glow + swaying curtain window + detailed bed
        const stairLight = new THREE.PointLight(0xd4a353, 4.2, 12); stairLight.position.set(4.5, -0.4, 5.5); worldRoot.add(stairLight);
        const bed = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.45, 2.35), new THREE.MeshStandardMaterial({ map: FABRIC.map, bumpMap: FABRIC.bump, color: 0x3f5e78 }));
        bed.position.set(-4.8, 0.25, 4.0); bed.rotation.y = Math.PI / 2; bed.castShadow = true; worldRoot.add(bed);
        colliders.push({ minX: -6.1, maxX: -3.5, minZ: 3.0, maxZ: 5.0 });

        const curt = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.9), new THREE.MeshStandardMaterial({ map: FABRIC.map, color: 0x64748b, side: THREE.DoubleSide }));
        curt.position.set(-6.35, 1.85, 3.8); curt.rotation.y = Math.PI / 2; worldRoot.add(curt); curtains.push(curt);

        buildCloset(-1.35, 7.2, Math.PI / 2, 'Lemari Pakaian Kayu', 'wood');
        const cNorth = buildCloset(1.35, -5.2, -Math.PI / 2, 'Lemari Lorong Utara', 'wood');
        envScares.push({ id: 'env_wardrobe', kind: 'wardrobe', position: new THREE.Vector3(0.4, 0, -5.2), radius: 2.4, fired: false, focus: new THREE.Vector3(1.35, 1.4, -5.2), pL: cNorth.pL, pR: cNorth.pR });

        addFragMesh('frag_1_phone', 'Periksa Ponsel di Atas Meja Nakas', -4.8, 0.85, 1.1, 0x38bdf8, 0x0284c7);
        addFragMesh('frag_1_music', 'Ambil Kotak Musik Panggilan Ibu', 4.5, 0.85, -5.8, 0xfbbf24, 0xd97706);

        const wallIce = addWall(0, 1.7, -12.8, 3.6, 3.4, 0.45, new THREE.MeshPhysicalMaterial({ map: ICE.map, bumpMap: ICE.bump, color: 0x99cbe8, transparent: true, opacity: 0.8 }), true);
        interactables.push({ id: 'exit_1', label: 'Hadapi Tembok Es Keheningan', kind: 'exit', position: new THREE.Vector3(0, 1.4, -12.4), radius: 2.8, mesh: wallIce, collected: false });
        storyTriggers.push({ id: 'stair_warmth', position: new THREE.Vector3(1.2, 0, 5.0), radius: 2.3, fired: false });

        const sh = createShadow(false); sh.root.position.set(-4.5, 0, -9.5); worldRoot.add(sh.root);
        enemies.push({ rig: sh, waypoints: [new THREE.Vector3(-4.5,0,-9.5), new THREE.Vector3(4.5,0,-9.5), new THREE.Vector3(0,0,-1.5), new THREE.Vector3(-4.5,0,-1.5)], wp: 1, speed: 2.2 * spdScale, frozen: 0, chase: false });
        return { bounds: { minX: -6.2, maxX: 6.2, minZ: -13.2, maxZ: 12.2 }, spawn: new THREE.Vector3(0, 1.65, 10.8), yaw: 0 };
      }

      if (idx === 1) {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 40), new THREE.MeshStandardMaterial({ map: TILE.map, bumpMap: TILE.bump, roughnessMap: TILE.rough, color: 0xa4bed4 }));
        floor.rotation.x = -Math.PI / 2; floor.position.z = -5; floor.receiveShadow = true; worldRoot.add(floor);
        const wallM = new THREE.MeshStandardMaterial({ map: PLASTER.map, bumpMap: PLASTER.bump, color: 0x314050, roughness: 0.84 });
        addWall(0, 1.78, 12.2, 14.5, 3.56, 0.45, wallM);
        addWall(-6.9, 1.78, 3.0, 0.45, 3.56, 18.8, wallM); addWall(6.9, 1.78, 3.0, 0.45, 3.56, 18.8, wallM);
        addWall(-4.4, 1.78, -6.2, 5.2, 3.56, 0.45, wallM); addWall(4.4, 1.78, -6.2, 5.2, 3.56, 0.45, wallM);
        addWall(-2.35, 1.78, -15.2, 0.45, 3.56, 18.4, wallM); addWall(2.35, 1.78, -15.2, 0.45, 3.56, 18.4, wallM);
        addWall(0, 1.78, -24.2, 5.2, 3.56, 0.45, wallM);

        // 12 Desks + Erratic Clock + Flickering Fluorescents + Giant Pencil + 5 Mannequins
        [[-5.1,8.2],[-5.1,5.6],[-5.1,3.0],[-5.1,0.4],[-5.1,-2.2],[-5.1,-4.2],[5.1,8.2],[5.1,5.6],[5.1,3.0],[5.1,0.4],[5.1,-2.2],[5.1,-4.2]].forEach(([dx,dz]) => buildDesk(dx, dz, dx < 0 ? 0.14 : -0.14));

        const cFace = new THREE.Mesh(new THREE.CircleGeometry(0.3, 20), new THREE.MeshStandardMaterial({ map: TEX.clock }));
        cFace.position.set(6.58, 2.55, 2.5); cFace.rotation.y = -Math.PI / 2; worldRoot.add(cFace);
        const minH = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.22, 0.01), new THREE.MeshBasicMaterial({ color: 0x991b1b }));
        minH.position.set(6.54, 2.55, 2.5); worldRoot.add(minH); clockHands.push(minH);

        [[0,3.4,5.5],[0,3.4,-2.0],[0,3.4,-12.5],[0,3.4,-20.5]].forEach(([fx,fy,fz], i) => {
          const tubeMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0xbae6fd, emissiveIntensity: 1.5 });
          const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.4, 10), tubeMat);
          tube.rotation.z = Math.PI / 2; tube.position.set(fx, fy, fz);
          const fl = new THREE.PointLight(0xdbeafe, 2.1, 11, 2); fl.position.set(fx, fy - 0.2, fz);
          worldRoot.add(tube, fl); flickerLights.push({ light: fl, mat: tubeMat, seed: i * 3.7 + 1.1 });
        });

        const pencil = new THREE.Group(); pencil.position.set(0, 1.5, 2.5);
        const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0xb8860b })); pBody.rotation.z = Math.PI / 2 - 0.14; pencil.add(pBody);
        const pTip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0xdeb887 })); pTip.rotation.z = -Math.PI / 2 - 0.14; pTip.position.set(1.9, 0.26, 0); pencil.add(pTip);
        worldRoot.add(pencil); animated.push({ mesh: pencil, mode: 'pencil' });

        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.35;
          const man = createPerson({ coat: 0x94a3b8, skin: 0xcbd5e1, mannequin: true, skirt: i % 2 === 0 });
          man.root.position.set(Math.cos(a) * 3.1, 0, 2.5 + Math.sin(a) * 3.1);
          man.root.lookAt(0, 0, 2.5); worldRoot.add(man.root); mannequins.push(man);
        }
        envScares.push({ id: 'env_mannequins', kind: 'mannequins', position: new THREE.Vector3(0, 0, -4.6), radius: 2.2, fired: false, focus: new THREE.Vector3(0, 1.55, 2.5) });

        buildCloset(3.2, -4.8, -Math.PI, 'Loker Besi Kelas', 'locker');
        buildCloset(-1.65, -14.0, Math.PI / 2, 'Loker Lorong BK', 'locker');

        addFragMesh('frag_2_note', 'Ambil Catatan Undian Putaran Pensil', -3.2, 0.9, -2.5, 0x38bdf8, 0x0284c7);
        addFragMesh('frag_2_badge', 'Periksa Berkas Laporan Sekolah Membeku', 1.4, 0.9, -18.5, 0xfbbf24, 0xd97706);

        const bkDoor = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.8, 0.2), new THREE.MeshStandardMaterial({ map: TEX.bkSign }));
        bkDoor.position.set(0, 1.4, -23.6); worldRoot.add(bkDoor);
        interactables.push({ id: 'exit_2', label: 'Buka Rantai Pintu Ruang BK', kind: 'exit', position: new THREE.Vector3(0, 1.4, -23.2), radius: 2.8, mesh: bkDoor, collected: false });
        storyTriggers.push({ id: 'bk_hallway', position: new THREE.Vector3(0, 0, -11.5), radius: 2.4, fired: false });

        const sh = createShadow(true); sh.root.position.set(0, 0, -19.5); worldRoot.add(sh.root);
        enemies.push({ rig: sh, waypoints: [new THREE.Vector3(0,0,-21), new THREE.Vector3(0,0,-9.5), new THREE.Vector3(-3.5,0,-2.5), new THREE.Vector3(3.5,0,-2.5)], wp: 1, speed: 2.3 * spdScale, frozen: 0, chase: false });
        return { bounds: { minX: -6.3, maxX: 6.3, minZ: -23.5, maxZ: 11.6 }, spawn: new THREE.Vector3(0, 1.65, 10.2), yaw: 0 };
      }

      if (idx === 2) {
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 44), new THREE.MeshStandardMaterial({ map: TILE.map, bumpMap: TILE.bump, color: 0x475569, roughness: 0.25, metalness: 0.4 }));
        floor.rotation.x = -Math.PI / 2; floor.position.z = -7; floor.receiveShadow = true; worldRoot.add(floor);
        const glassM = new THREE.MeshPhysicalMaterial({ map: PLASTER.map, bumpMap: PLASTER.bump, color: 0x1e293b, emissive: 0x1a152e, emissiveIntensity: 0.35, roughness: 0.16, metalness: 0.65 });
        addWall(0, 1.78, 12.8, 16, 3.56, 0.45, glassM); addWall(-7.8, 1.78, -6.5, 0.45, 3.56, 39, glassM);
        addWall(7.8, 1.78, -6.5, 0.45, 3.56, 39, glassM); addWall(0, 1.78, -25.8, 16, 3.56, 0.45, glassM);
        addWall(-3.0, 1.78, 6.2, 6.8, 3.56, 0.38, glassM); addWall(3.2, 1.78, 0.8, 6.8, 3.56, 0.38, glassM);
        addWall(-2.2, 1.78, -5.0, 7.8, 3.56, 0.38, glassM); addWall(3.0, 1.78, -11.0, 6.8, 3.56, 0.38, glassM);

        [[-4.2,3.6,0.45],[4.2,-7.6,-0.5],[-3.8,-20.5,Math.PI/2],[4.4,4.8,-0.6]].forEach(([kx,kz,kry]) => {
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.62, 1.0), new THREE.MeshStandardMaterial({ map: TEX.kbgo, emissive: 0x581c87, emissiveMap: TEX.kbgo, emissiveIntensity: 1.05 }));
          scr.position.set(kx, 1.75, kz); scr.rotation.y = kry; worldRoot.add(scr); animated.push({ mesh: scr, mode: 'bob' });
        });

        const ambushScr = new THREE.Mesh(new THREE.PlaneGeometry(2.35, 1.45), new THREE.MeshStandardMaterial({ map: TEX.glitchFace, emissive: 0x991b1b, emissiveMap: TEX.glitchFace, emissiveIntensity: 1.55 }));
        ambushScr.position.set(-2.5, 1.75, -2.5); ambushScr.visible = false; worldRoot.add(ambushScr);
        envScares.push({ id: 'env_glitchphone', kind: 'glitchPhone', position: new THREE.Vector3(-1.4, 0, -0.8), radius: 2.3, fired: false, focus: new THREE.Vector3(-2.5, 1.75, -2.5), glitchGroup: ambushScr });

        const pivot = new THREE.Group(); pivot.position.set(-1.9, 0, -16.2);
        const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(2.1, 3.2, 0.16), new THREE.MeshStandardMaterial({ map: WOOD.map, color: 0x3f2a22 }));
        doorLeaf.position.set(1.05, 1.6, 0); pivot.add(doorLeaf); worldRoot.add(pivot);
        autoDoors.push({ pivot, triggerZ: -17.2, targetYaw: 0.12, triggered: false }); pivot.rotation.y = 1.1;

        buildCloset(6.7, 5.2, -Math.PI / 2, 'Sekat Kaca Selatan', 'locker');
        buildCloset(-6.7, -11.5, Math.PI / 2, 'Sekat Kaca Utara', 'locker');

        addFragMesh('frag_3_kbgo', 'Amankan Bukti Pesan PAP & Rekayasa AI', -5.6, 0.9, 2.2, 0xa855f7, 0x9333ea);
        addFragMesh('frag_3_shareloc', 'Aktifkan Suar Biru Share-Loc Penyelamatan', 5.2, 0.9, -8.2, 0x38bdf8, 0x0284c7);

        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 4.8, 12), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.4 }));
        beacon.position.set(0, 2.4, -24.5); worldRoot.add(beacon);
        const rip = new THREE.Mesh(new THREE.RingGeometry(0.65, 0.82, 28), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false }));
        rip.rotation.x = -Math.PI / 2; rip.position.set(0, 0.04, -24.5); worldRoot.add(rip); beaconRipples.push(rip);

        interactables.push({ id: 'exit_3', label: 'Tembus Lorong Fitnah Menuju Sudut Kampus', kind: 'exit', position: new THREE.Vector3(0, 1.4, -24.0), radius: 2.8, mesh: beacon, collected: false });
        storyTriggers.push({ id: 'slam_house', position: new THREE.Vector3(0, 0, -17.5), radius: 2.5, fired: false });
        storyTriggers.push({ id: 'whisper_corridor', position: new THREE.Vector3(0, 0, -21.5), radius: 2.5, fired: false });

        const sh1 = createShadow(false); sh1.root.position.set(4.5, 0, 3.2); worldRoot.add(sh1.root);
        enemies.push({ rig: sh1, waypoints: [new THREE.Vector3(4.5,0,3.2), new THREE.Vector3(-4.5,0,-1.5), new THREE.Vector3(4.5,0,-7.0)], wp: 1, speed: 2.35 * spdScale, frozen: 0, chase: false });
        return { bounds: { minX: -7.2, maxX: 7.2, minZ: -25.1, maxZ: 12.2 }, spawn: new THREE.Vector3(0, 1.65, 10.8), yaw: 0 };
      }

      // BABAK IV: Glass Dome + Thorn Tendrils + 4 Pillars
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ color: 0x1e2c3a, roughness: 0.82 }));
      floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; worldRoot.add(floor);
      [[-14,-14],[14,-14],[-14,14],[14,14]].forEach(([tx, tz]) => buildWinterTree(tx, tz));

      const domeMesh = new THREE.Mesh(
        new THREE.SphereGeometry(2.28, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.56),
        new THREE.MeshPhysicalMaterial({ map: ICE.map, bumpMap: ICE.bump, color: 0xb8d8eb, transparent: true, opacity: 0.52, clearcoat: 1, side: THREE.DoubleSide })
      );
      domeMesh.position.y = 0.28; worldRoot.add(domeMesh);

      const tendrilGroup = new THREE.Group(); tendrilGroup.position.y = 0.28; tendrilGroup.scale.set(1, 0.01, 1); tendrilGroup.visible = false;
      const thornM = new THREE.MeshStandardMaterial({ map: SHADOW_TEX.map, bumpMap: SHADOW_TEX.bump, color: 0x0b0f17, roughness: 0.55 });
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2, r = 0.65 + (i % 3) * 0.2;
        const sp = new THREE.Mesh(new THREE.ConeGeometry(0.11, 1.9, 7), thornM);
        sp.position.set(Math.cos(a) * r, 0.72, Math.sin(a) * r); sp.lookAt(0, 1.15, 0); sp.rotateX(Math.PI * 0.35);
        tendrilGroup.add(sp);
      }
      worldRoot.add(tendrilGroup);

      const rindi = createPerson({ coat: 0x1e3a5f, skin: 0xd6b094, hijab: true, skirt: true });
      rindi.root.position.y = 0.28; worldRoot.add(rindi.root);
      const domeLight = new THREE.PointLight(0x78a9c4, 2.8, 12); domeLight.position.set(0, 1.85, 0); worldRoot.add(domeLight);
      domeCtrl = { domeMesh, domeLight, rindi, tendrilGroup };
      colliders.push({ minX: -2.4, maxX: 2.4, minZ: -2.4, maxZ: 2.4 });

      [[-9.5,9.5,'pillar_1','Nyalakan Pilar I: Keberanian Bersuara'], [9.5,9.5,'pillar_2','Nyalakan Pilar II: Ruang Aman & Satgas Proaktif'], [9.5,-9.5,'pillar_3','Nyalakan Pilar III: Sanksi Tanpa Kompromi'], [-9.5,-9.5,'pillar_4','Nyalakan Pilar IV: Pemulihan & Martabat']].forEach(([px, pz, id, label]) => {
        const pg = new THREE.Group(); pg.position.set(px, 0, pz);
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.34, 1.65, 14), new THREE.MeshStandardMaterial({ color: 0x1e293b })); base.position.y = 0.825; pg.add(base);
        const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), new THREE.MeshStandardMaterial({ color: 0x78a9c4, emissive: 0x38bdf8, emissiveIntensity: 0.9 })); core.position.y = 2.08; core.name = 'core'; pg.add(core);
        const pl = new THREE.PointLight(0x38bdf8, 1.8, 7.5); pl.position.y = 2.15; pl.name = 'pl'; pg.add(pl);
        worldRoot.add(pg);
        interactables.push({ id, label, kind: 'pillar', position: new THREE.Vector3(px, 1.4, pz), radius: 2.6, mesh: pg, collected: false });
      });

      interactables.push({ id: 'exit_4', label: 'Sentuh Kubah Kaca untuk Membebaskan Rindi', kind: 'exit', position: new THREE.Vector3(0, 0, 0), radius: 4.1, mesh: domeMesh, collected: false });

      const sh = createShadow(true); sh.root.position.set(-12, 0, -12); worldRoot.add(sh.root);
      enemies.push({ rig: sh, waypoints: [new THREE.Vector3(-12,0,-12), new THREE.Vector3(12,0,-12), new THREE.Vector3(12,0,12), new THREE.Vector3(-12,0,12)], wp: 1, speed: 2.35 * spdScale, frozen: 0, chase: false });
      return { bounds: { minX: -18.2, maxX: 18.2, minZ: -18.2, maxZ: 18.2 }, spawn: new THREE.Vector3(0, 1.65, 16.2), yaw: 0 };
    }

    // --- GAME STATE, CONTROL MODE, STABILITY, JUMPSCARE & 12-SECOND 4-SHOT CUTSCENE ---
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let controlMode = isTouchDevice ? 'mobile' : 'pc';
    let dismissedPortrait = false;
    let virtX = 0, virtY = 0, virtAutoSprint = false, mobileSprintHeld = false;
    let phase = 'title', difficulty = 'standard', layerIdx = 0, frost = 0.38, score = 0;
    let responses = [], totalFrags = 0, collected = 0, exitOpen = false;
    let warmth = 100, stamina = 100, stability = 5, jumpscareCount = 0, graceTimer = 0;
    let jumpscareTimer = 0, jumpscareKind = null, activeEnemy = null, scareFocus = new THREE.Vector3();
    let mannequinsAlerted = false, wardrobeSlamFired = false;
    let lanternCd = 0, lanternActive = 0, hiding = false, savedPos = new THREE.Vector3();
    let playerPos = new THREE.Vector3(0, 1.65, 11), yaw = 0, pitch = 0, bounds = { minX: -6, maxX: 6, minZ: -13, maxZ: 12 };
    let keys = {}, dragLook = false, lx = 0, ly = 0, endingType = 'true';
    let cutsceneTime = 0, cutsceneDomeLoaded = false, cutsceneChordPlayed = false;

    const showScreen = (id) => {
      document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      if (id) document.getElementById(id).classList.add('active');
      document.getElementById('touch-controls').classList.toggle('active', id === 'hud-screen' && controlMode === 'mobile');
      updatePortraitBanner();
    };

    function updatePortraitBanner() {
      const b = document.getElementById('portrait-banner');
      const show = controlMode === 'mobile' && phase === 'playing' && !dismissedPortrait && window.innerHeight > window.innerWidth;
      b.style.display = show ? 'flex' : 'none';
    }

    function applyControlMode(mode) {
      controlMode = mode;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mode === 'mobile' ? 1.5 : 2));
      if (mode === 'mobile' && document.pointerLockElement === renderer.domElement) {
        document.exitPointerLock?.();
      }
      virtX = 0; virtY = 0; virtAutoSprint = false; mobileSprintHeld = false; dragLook = false;
      document.getElementById('ctrl-pc').classList.toggle('selected', mode === 'pc');
      document.getElementById('ctrl-mobile').classList.toggle('selected', mode === 'mobile');
      document.getElementById('ctrl-status-lbl').textContent = mode === 'mobile' ? 'Touchscreen Aktif' : 'Keyboard & Mouse Aktif';
      document.getElementById('btn-ctrl-hud').textContent = mode === 'mobile' ? 'HP' : 'PC';
      document.getElementById('btn-ctrl-pause').textContent = mode === 'mobile' ? 'Mode Kontrol: Mobile' : 'Mode Kontrol: PC';
      document.getElementById('hud-pc-hint').style.display = mode === 'mobile' ? 'none' : 'block';
      document.getElementById('hud-frost-badge').style.display = mode === 'mobile' ? 'none' : 'block';
      document.getElementById('hud-lantern-row').style.display = mode === 'mobile' ? 'none' : 'block';
      document.getElementById('title-hint-line').textContent = mode === 'mobile'
        ? 'Analog Kiri Gerak · Geser Kanan Kamera · Tombol AKSI / LENTERA / LARI · Ketuk Dialog'
        : 'WASD Bergerak · Mouse / Geser Lihat · Shift Lari · F Lentera · E Aksi / Sembunyi · Esc Jeda';
      document.getElementById('pause-ctrl-hint').textContent = mode === 'mobile'
        ? 'Analog Kiri: Gerak (>85% Lari) · Geser Kanan: Kamera · LARI / LENTERA / AKSI: Tombol Kanan Bawah'
        : 'WASD/Panah: Gerak · Mouse/Geser: Lihat · Shift: Lari · F: Lentera Bekukan Bayangan · E: Ambil/Sembunyi/Buka Segel';

      const barsEl = document.getElementById('hud-bars-wrap');
      const slot = document.getElementById(mode === 'mobile' ? 'hud-mobile-bars-slot' : 'hud-pc-bars-slot');
      if (barsEl && slot && barsEl.parentElement !== slot) slot.appendChild(barsEl);

      document.getElementById('touch-controls').classList.toggle('active', phase === 'playing' && mode === 'mobile');
      updatePortraitBanner();
    }

    function updateStabilityUI() {
      const cracks = 5 - stability;
      document.getElementById('hud-stab-txt').textContent = stability + '/5';
      document.getElementById('hud-stab-txt').style.color = stability <= 1 ? '#f87171' : '#78a9c4';
      const bars = document.getElementById('hud-stab-bars').children;
      for (let i = 0; i < 5; i++) {
        const intact = i < stability;
        bars[i].style.borderColor = intact ? (stability <= 1 ? '#f87171' : '#78a9c4') : '#334155';
        bars[i].style.background = intact ? (stability <= 1 ? '#dc2626' : '#38bdf8') : 'rgba(15,23,42,0.75)';
      }
      document.getElementById('crack-t1').style.display = cracks >= 1 ? 'inline' : 'none';
      document.getElementById('crack-t2').style.display = cracks >= 2 ? 'inline' : 'none';
      document.getElementById('crack-t3').style.display = cracks >= 3 ? 'inline' : 'none';
      document.getElementById('crack-t4').style.display = cracks >= 4 ? 'inline' : 'none';
    }

    function startCutscene() {
      phase = 'cutscene'; cutsceneTime = 0; cutsceneDomeLoaded = false; cutsceneChordPlayed = false;
      jumpscareTimer = 0; document.getElementById('strobe-fx').style.display = 'none';
      document.exitPointerLock?.();
      showScreen('cutscene-screen');
      document.getElementById('cutscene-sub-box').style.display = 'none';
      audio.glassShatter(); audio.jumpscareShriek();

      const flGroup = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.24, 14), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85 }));
      body.rotation.z = Math.PI / 2;
      const lensMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, emissive: 0xfef3c7, emissiveIntensity: 2.0 });
      const beam = new THREE.SpotLight(0xfef3c7, 6.0, 14, Math.PI / 4, 0.5, 1.4);
      const tgt = new THREE.Object3D(); tgt.position.set(4.5, -0.2, 0); beam.target = tgt;
      flGroup.add(body, beam, tgt);
      flGroup.position.set(playerPos.x - Math.sin(yaw) * 1.1, 0.055, playerPos.z - Math.cos(yaw) * 1.1);
      worldRoot.add(flGroup);
      droppedLight = { group: flGroup, beam, lensMat };
    }

    function showGameOver() {
      phase = 'gameover';
      document.getElementById('cutscene-sub-box').style.display = 'none';
      const resp = document.getElementById('resp-input').value.trim() || 'Anonim';
      document.getElementById('go-resp').textContent = 'RINGKASAN EVALUASI PjBL · ' + resp.toUpperCase();
      document.getElementById('go-layer').textContent = STORY.layers[layerIdx].roman;
      document.getElementById('go-frags').textContent = totalFrags + '/6';
      document.getElementById('go-score').textContent = Math.round(score) + '%';
      showScreen('gameover-screen');
    }

    // Dialogue Engine
    let dlgLines = [], dlgIdx = 0, dlgChars = 0, dlgTimer = null, dlgCb = null;
    function openDialogue(lines, cb) {
      phase = 'dialogue'; dlgLines = lines; dlgIdx = 0; dlgCb = cb;
      showScreen('dialogue-screen'); renderLine();
    }
    function renderLine() {
      clearInterval(dlgTimer);
      const line = dlgLines[dlgIdx];
      if (!line) { showScreen(null); if (dlgCb) dlgCb(); return; }
      if (line.cue) audio.cue(line.cue);
      document.getElementById('dlg-speaker').textContent = line.speaker;
      document.getElementById('dlg-emotion').textContent = line.emotion;
      document.getElementById('dlg-count').textContent = (dlgIdx + 1) + ' / ' + dlgLines.length;
      const textEl = document.getElementById('dlg-text'), hintEl = document.getElementById('dlg-hint');
      dlgChars = 0; textEl.textContent = '';
      const tapTxt = controlMode === 'mobile' ? '[Ketuk Layar]' : '[Spasi / Klik]';
      hintEl.textContent = tapTxt + ' Tampilkan penuh';
      dlgTimer = setInterval(() => {
        dlgChars++; textEl.textContent = line.text.slice(0, dlgChars);
        if (dlgChars % 3 === 1) audio.tone(540, 0.03, 0.025, 'sine');
        if (dlgChars >= line.text.length) { clearInterval(dlgTimer); hintEl.textContent = tapTxt + ' Lanjutkan'; }
      }, 22);
    }
    function advanceDialogue() {
      const line = dlgLines[dlgIdx]; if (!line) return;
      const tapTxt = controlMode === 'mobile' ? '[Ketuk Layar]' : '[Spasi / Klik]';
      if (dlgChars < line.text.length) { clearInterval(dlgTimer); dlgChars = line.text.length; document.getElementById('dlg-text').textContent = line.text; document.getElementById('dlg-hint').textContent = tapTxt + ' Lanjutkan'; return; }
      dlgIdx++; if (dlgIdx < dlgLines.length) renderLine(); else { showScreen(null); if (dlgCb) dlgCb(); }
    }
    document.getElementById('dialogue-screen').onclick = advanceDialogue;

    function enterLayer(idx) {
      layerIdx = idx; collected = 0; exitOpen = false; hiding = false; warmth = Math.min(100, warmth + 25); stamina = 100;
      graceTimer = 2.0; jumpscareTimer = 0; mannequinsAlerted = false; wardrobeSlamFired = false;
      const info = buildGameplayLayer(idx, frost, difficulty);
      bounds = info.bounds; playerPos.copy(info.spawn); yaw = info.yaw; pitch = 0;
      const meta = STORY.layers[idx];
      document.getElementById('hud-era').textContent = meta.roman + ' · ' + meta.era;
      document.getElementById('hud-title').textContent = meta.title;
      document.getElementById('hud-hint').textContent = meta.ambientHint;
      updateStabilityUI();
      const intro = STORY.layerIntros[idx];
      if (intro) openDialogue(intro, () => { phase = 'playing'; showScreen('hud-screen'); });
      else { phase = 'playing'; showScreen('hud-screen'); }
    }

    function openMirror(mIdx) {
      phase = 'mirror'; document.exitPointerLock?.();
      const q = STORY.mirrors[mIdx];
      document.getElementById('mir-between').textContent = q.betweenLabel;
      document.getElementById('mir-frost').textContent = 'Tingkat Kebekuan: ' + Math.round(frost * 100) + '%';
      document.getElementById('mir-prompt').textContent = q.prompt;
      document.getElementById('mir-context').textContent = q.contextNote;
      const box = document.getElementById('mir-options'); box.innerHTML = '';
      q.options.forEach((opt, i) => {
        const b = document.createElement('button'); b.className = 'choice-btn';
        b.innerHTML = '<div class="serif" style="font-size:15px;font-weight:bold;">' + (i + 1) + '. ' + opt.label + '</div><div class="mono" style="font-size:12px;color:#9aa8b8;margin-top:4px;">' + opt.sublabel + '</div>';
        b.onclick = () => {
          score += opt.awarenessDelta; frost = Math.max(0.15, Math.min(1.0, frost + opt.frostDelta));
          responses.push({ betweenLabel: q.betweenLabel, chosenLabel: opt.label, tag: opt.tag });
          enterLayer(mIdx + 1);
        };
        box.appendChild(b);
      });
      showScreen('mirror-screen');
    }

    function showEnding() {
      phase = 'ending';
      const clamped = Math.max(0, Math.min(100, Math.round(score)));
      endingType = clamped >= 75 ? 'true' : clamped >= 45 ? 'neutral' : 'bad';
      const end = STORY.endings[endingType];
      buildCampus(endingType);
      openDialogue(STORY.epilogues[endingType], () => {
        document.getElementById('end-sub').textContent = end.subtitle;
        document.getElementById('end-sub').style.color = end.accentColor;
        document.getElementById('end-badge').textContent = end.badgeText;
        document.getElementById('end-title').textContent = end.title;
        document.getElementById('end-narr').textContent = end.narrative;
        document.getElementById('end-const').textContent = end.constitutionalSynthesis;
        const mapBox = document.getElementById('end-mappings'); mapBox.innerHTML = '';
        STORY.constitutionalMappings.forEach(m => {
          const d = document.createElement('div');
          d.style.cssText = 'border:1px solid #26303d;background:#080c13;padding:10px;font-size:11px;';
          d.innerHTML = '<div class="mono" style="color:#e2e8f0;font-weight:bold;">' + m.pillar + '</div><div class="mono" style="color:#d4a353;margin-top:3px;">' + m.pancasilaRef + '</div><div class="mono" style="color:#78a9c4;">' + m.uudRef + '</div><div class="mono" style="color:#9aa8b8;margin-top:4px;">' + m.explanation + '</div>';
          mapBox.appendChild(d);
        });
        const resp = document.getElementById('resp-input').value.trim() || 'Anonim';
        document.getElementById('end-resp').textContent = 'REKAP DATA RISET PjBL · RESPONDEN: ' + resp + ' · Fragmen: ' + totalFrags + '/6 · Pilar: 4/4';
        document.getElementById('end-score').textContent = clamped + '%';
        document.getElementById('end-score').style.color = end.accentColor;
        document.getElementById('end-frost').textContent = Math.round(frost * 100) + '%';
        document.getElementById('end-cat').textContent = clamped >= 75 ? 'Tinggi (Sadar Konstitusi & Berpihak pada Korban)' : clamped >= 45 ? 'Sedang (Parsial / Seremonial)' : 'Rendah (Normalisasi Pembiaran)';
        document.getElementById('end-log').innerHTML = responses.map((r, i) => '<div>Cermin ' + (i + 1) + ': ' + r.chosenLabel + ' -> <span style="color:#d4a353;">[' + r.tag + ']</span></div>').join('');
        showScreen('ending-screen');
      });
    }

    // Buttons & Events
    document.getElementById('ctrl-pc').onclick = () => applyControlMode('pc');
    document.getElementById('ctrl-mobile').onclick = () => applyControlMode('mobile');
    document.getElementById('btn-ctrl-hud').onclick = (e) => { e.stopPropagation(); applyControlMode(controlMode === 'pc' ? 'mobile' : 'pc'); };
    document.getElementById('btn-ctrl-pause').onclick = () => applyControlMode(controlMode === 'pc' ? 'mobile' : 'pc');
    document.getElementById('btn-close-portrait').onclick = () => { dismissedPortrait = true; updatePortraitBanner(); };
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    document.getElementById('mode-std').onclick = () => { difficulty = 'standard'; document.getElementById('mode-std').style.cssText = 'border-color:#d4a353;color:#d4a353;'; document.getElementById('mode-story').style.cssText = 'border-color:#3d4959;color:#94a3b8;'; };
    document.getElementById('mode-story').onclick = () => { difficulty = 'story'; document.getElementById('mode-story').style.cssText = 'border-color:#78a9c4;color:#78a9c4;'; document.getElementById('mode-std').style.cssText = 'border-color:#3d4959;color:#94a3b8;'; };
    document.getElementById('toggle-ctrl').onclick = () => {
      const b = document.getElementById('subpanel-box'); b.style.display = b.style.display === 'block' ? 'none' : 'block';
      b.innerHTML = controlMode === 'mobile'
        ? '<b>KONTROL MOBILE:</b> Analog Kiri (Gerak, tarik &gt;85% untuk Lari) · Geser Layar Kanan (Kamera) · [AKSI] (Ambil/Sembunyi/Segel) · [LENTERA] (Bekukan Bayangan) · [LARI] (Toggle Sprint).'
        : '<b>KONTROL PC:</b> WASD/Panah (Gerak) · Mouse/Geser (Lihat) · Shift (Lari) · F (Lentera Bekukan Bayangan) · E (Ambil/Sembunyi/Buka Segel) · Spasi/Klik (Lanjutkan Dialog).';
    };
    document.getElementById('toggle-about').onclick = () => {
      const b = document.getElementById('subpanel-box'); b.style.display = b.style.display === 'block' ? 'none' : 'block';
      b.innerHTML = '<b>RISET PjBL KEWARGANEGARAAN:</b> Media analisis kesadaran mahasiswa terhadap normalisasi budaya pembiaran kekerasan seksual (rape culture). Tinjauan Pancasila &amp; UUD NRI 1945 disajikan pada arsip akhir.';
    };

    const toggleMute = () => {
      audio.init(); audio.setMuted(!audio.muted);
      document.getElementById('btn-mute-title').textContent = audio.muted ? 'Suara Mati' : 'Suara Aktif';
      document.getElementById('btn-mute-hud').textContent = audio.muted ? 'Mati' : 'Suara';
    };
    document.getElementById('btn-mute-title').onclick = toggleMute;
    document.getElementById('btn-mute-hud').onclick = toggleMute;

    function triggerLanternAction() {
      audio.init();
      if (phase !== 'playing' || jumpscareTimer > 0 || hiding || lanternCd > 0) return;
      lanternCd = 8; lanternActive = 1.0; lanternLight.position.set(playerPos.x, 1.5, playerPos.z); lanternLight.intensity = 9;
      audio.lanternPulse();
      enemies.forEach(en => { if (Math.hypot(en.rig.root.position.x - playerPos.x, en.rig.root.position.z - playerPos.z) < 12.5) en.frozen = 4.8; });
    }

    function startNew() {
      audio.init(); score = 0; frost = 0.38; responses = []; totalFrags = 0; warmth = 100; stamina = 100;
      stability = 5; jumpscareCount = 0; graceTimer = 0; jumpscareTimer = 0;
      virtX = 0; virtY = 0; virtAutoSprint = false; mobileSprintHeld = false;
      document.getElementById('strobe-fx').style.display = 'none';
      updateStabilityUI();
      buildCampus('prologue'); phase = 'prologue';
      openDialogue(STORY.prologue, () => enterLayer(0));
    }
    document.getElementById('btn-start').onclick = startNew;
    document.getElementById('btn-restart-pause').onclick = startNew;
    document.getElementById('btn-restart-end').onclick = startNew;
    document.getElementById('btn-go-restart').onclick = startNew;
    document.getElementById('btn-title-pause').onclick = () => { phase = 'title'; buildCampus('title'); showScreen('title-screen'); };
    document.getElementById('btn-go-title').onclick = () => { phase = 'title'; buildCampus('title'); showScreen('title-screen'); };
    document.getElementById('btn-pause').onclick = () => { phase = 'paused'; document.exitPointerLock?.(); document.getElementById('pause-title').textContent = STORY.layers[layerIdx].title; showScreen('pause-screen'); };
    document.getElementById('btn-resume').onclick = () => { phase = 'playing'; showScreen('hud-screen'); if (controlMode === 'pc') renderer.domElement.requestPointerLock?.(); };
    document.getElementById('btn-copy').onclick = () => {
      const txt = document.getElementById('end-resp').textContent + '\\nEnding: ' + document.getElementById('end-title').textContent + '\\nSkor: ' + document.getElementById('end-score').textContent + '\\n' + document.getElementById('end-log').innerText;
      navigator.clipboard?.writeText(txt); document.getElementById('btn-copy').textContent = 'Tersalin ke Clipboard!';
    };
    document.getElementById('btn-go-copy').onclick = () => {
      const txt = document.getElementById('go-resp').textContent + '\\nStatus: GAME OVER (0/5 Kestabilan)\\nLokasi: ' + STORY.layers[layerIdx].roman + '\\nFragmen: ' + totalFrags + '/6\\nKesadaran: ' + Math.round(score) + '%';
      navigator.clipboard?.writeText(txt); document.getElementById('btn-go-copy').textContent = 'DATA EVALUASI TERSALIN!';
    };

    window.addEventListener('keydown', (e) => {
      if (phase === 'dialogue' && (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE')) { e.preventDefault(); advanceDialogue(); return; }
      if (e.code === 'Escape' && phase === 'playing') { document.getElementById('btn-pause').click(); return; }
      if (phase !== 'playing' || jumpscareTimer > 0) return;
      if (!keys[e.code]) {
        if (e.code === 'KeyE') interactAction();
        if (e.code === 'KeyF') triggerLanternAction();
      }
      keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });
    renderer.domElement.addEventListener('mousedown', (e) => {
      if (controlMode === 'mobile' || phase !== 'playing') return;
      audio.init(); dragLook = true; lx = e.clientX; ly = e.clientY;
      renderer.domElement.requestPointerLock?.();
    });
    window.addEventListener('mouseup', () => { dragLook = false; });
    window.addEventListener('mousemove', (e) => {
      if (controlMode === 'mobile' || phase !== 'playing' || jumpscareTimer > 0) return;
      if (document.pointerLockElement === renderer.domElement) {
        yaw -= e.movementX * 0.0022; pitch = Math.max(-1.2, Math.min(1.2, pitch - e.movementY * 0.0022));
      } else if (dragLook) {
        yaw -= (e.clientX - lx) * 0.0045; pitch = Math.max(-1.2, Math.min(1.2, pitch - (e.clientY - ly) * 0.0045));
        lx = e.clientX; ly = e.clientY;
      }
    });
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, controlMode === 'mobile' ? 1.5 : 2));
      updatePortraitBanner();
    });
    window.addEventListener('orientationchange', updatePortraitBanner);

    // Multi-Touch Virtual Stick & Camera Zone Handlers
    (function setupTouchControls() {
      const stickZone = document.getElementById('touch-stick-zone');
      const stickBase = document.getElementById('touch-stick-base');
      const stickKnob = document.getElementById('touch-stick-knob');
      const stickLbl = document.getElementById('touch-stick-lbl');
      const camZone = document.getElementById('touch-cam-zone');
      const btnSprint = document.getElementById('touch-sprint');
      const btnLantern = document.getElementById('touch-lantern');
      const btnInteract = document.getElementById('touch-interact');
      const STICK_R = 60;
      let leftId = null, camId = null, camLx = 0, camLy = 0;

      function moveStick(t) {
        const rect = stickBase.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const dx = t.clientX - cx, dy = t.clientY - cy;
        const dist = Math.hypot(dx, dy), cDist = Math.min(STICK_R, dist), ang = Math.atan2(dy, dx);
        const kx = dist > 0.001 ? Math.cos(ang) * cDist : 0, ky = dist > 0.001 ? Math.sin(ang) * cDist : 0;
        stickKnob.style.transform = 'translate(' + kx + 'px,' + ky + 'px)';
        virtX = kx / STICK_R; virtY = -ky / STICK_R;
        virtAutoSprint = (cDist / STICK_R) > 0.85;
        stickBase.style.borderColor = virtAutoSprint ? 'rgba(212,163,83,0.85)' : 'rgba(120,169,196,0.45)';
        stickLbl.textContent = virtAutoSprint ? 'LARI OTOMATIS' : 'GERAK';
        stickLbl.style.color = virtAutoSprint ? '#d4a353' : 'rgba(138,164,184,0.8)';
      }
      function resetStick() {
        leftId = null; virtX = 0; virtY = 0; virtAutoSprint = false;
        stickKnob.style.transform = 'translate(0px,0px)';
        stickBase.style.borderColor = 'rgba(120,169,196,0.45)';
        stickLbl.textContent = 'GERAK'; stickLbl.style.color = 'rgba(138,164,184,0.8)';
      }

      stickZone.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (leftId !== null || !e.changedTouches[0]) return;
        leftId = e.changedTouches[0].identifier; audio.init(); moveStick(e.changedTouches[0]);
      }, { passive: false });

      camZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (camId !== null) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier !== leftId) { camId = t.identifier; camLx = t.clientX; camLy = t.clientY; audio.init(); break; }
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (controlMode !== 'mobile' || phase !== 'playing') return;
        for (let i = 0; i < e.changedTouches.length; i++) {
          const t = e.changedTouches[i];
          if (t.identifier === leftId) { e.preventDefault(); moveStick(t); }
          else if (t.identifier === camId && jumpscareTimer <= 0) {
            e.preventDefault();
            yaw -= (t.clientX - camLx) * 0.0052;
            pitch = Math.max(-1.25, Math.min(1.25, pitch - (t.clientY - camLy) * 0.0044));
            camLx = t.clientX; camLy = t.clientY;
          }
        }
      }, { passive: false });

      const endTouch = (e) => {
        for (let i = 0; i < e.changedTouches.length; i++) {
          const id = e.changedTouches[i].identifier;
          if (id === leftId) resetStick();
          if (id === camId) camId = null;
        }
      };
      window.addEventListener('touchend', endTouch, { passive: false });
      window.addEventListener('touchcancel', endTouch, { passive: false });

      btnSprint.addEventListener('touchstart', (e) => {
        e.preventDefault(); e.stopPropagation();
        mobileSprintHeld = !mobileSprintHeld;
        btnSprint.style.borderColor = mobileSprintHeld ? '#d4a353' : 'rgba(120,169,196,0.48)';
        btnSprint.style.color = mobileSprintHeld ? '#f3d28f' : '#cbd5e1';
      }, { passive: false });
      btnLantern.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); triggerLanternAction(); }, { passive: false });
      btnInteract.addEventListener('touchstart', (e) => { e.preventDefault(); e.stopPropagation(); audio.init(); if (phase === 'playing' && jumpscareTimer <= 0) interactAction(); }, { passive: false });
    })();

    applyControlMode(controlMode);

    function findClosest() {
      let best = null, bd = Infinity;
      for (const it of interactables) {
        if (it.collected) continue;
        const d = Math.hypot(playerPos.x - it.position.x, playerPos.z - it.position.z);
        if (d <= it.radius && d < bd) { bd = d; best = it; }
      }
      if (best) return { item: best, hide: -1 };
      let hi = -1, hd = 2.3;
      hidingSpots.forEach((h, i) => { const d = Math.hypot(playerPos.x - h.position.x, playerPos.z - h.position.z); if (d < hd) { hd = d; hi = i; } });
      return { item: null, hide: hi };
    }

    function interactAction() {
      if (hiding) { hiding = false; playerPos.copy(savedPos); return; }
      const { item, hide } = findClosest();
      if (item) {
        if (item.kind === 'fragment' || item.kind === 'pillar') {
          item.collected = true; collected++;
          if (item.kind === 'fragment') { totalFrags++; item.mesh.visible = false; audio.cue('chime'); }
          else {
            const c = item.mesh.getObjectByName('core'), l = item.mesh.getObjectByName('pl');
            if (c) c.material.emissive.setHex(0xd4a353);
            if (l) l.color.setHex(0xd4a353);
            audio.cue('chime');
            if (domeCtrl) domeCtrl.domeLight.color.setHex(collected >= 4 ? 0xd4a353 : 0x78a9c4);
          }
          if (collected >= STORY.layers[layerIdx].totalTargets) exitOpen = true;
          const lines = STORY.fragments[item.id];
          if (lines) openDialogue(lines, () => { phase = 'playing'; showScreen('hud-screen'); });
          return;
        }
        if (item.kind === 'exit') {
          if (!exitOpen) {
            if (layerIdx === 1) audio.chainRattle();
            openDialogue([{ speaker: 'Bima', emotion: 'Memeriksa segel', text: 'Segel masih terkunci. Aku masih perlu mengumpulkan target di area ini.' }], () => { phase = 'playing'; showScreen('hud-screen'); });
            return;
          }
          audio.cue('ice');
          const finish = () => { if (layerIdx < 3) openMirror(layerIdx); else showEnding(); };
          const lines = STORY.fragments[item.id];
          if (lines && layerIdx < 3) openDialogue(lines, finish); else finish();
          return;
        }
      }
      if (hide >= 0) {
        savedPos.copy(playerPos); hiding = true;
        playerPos.copy(hidingSpots[hide].position); yaw = hidingSpots[hide].lookOutYaw; pitch = 0;
      }
    }

    function collides(x, z) {
      const r = 0.42;
      if (x < bounds.minX + r || x > bounds.maxX - r || z < bounds.minZ + r || z > bounds.maxZ - r) return true;
      return colliders.some(c => x + r > c.minX && x - r < c.maxX && z + r > c.minZ && z - r < c.maxZ);
    }

    buildCampus('title');
    const clock = new THREE.Clock();
    let titleAng = 0.4, buzzCd = 0;
    const _scareWorld = new THREE.Vector3();

    function animate() {
      requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      if (snowPoints.visible) {
        const arr = snowPoints.geometry.attributes.position.array;
        const mult = phase === 'cutscene' ? 2.4 : 1.0;
        for (let i = 0; i < 700; i++) {
          arr[i * 3 + 1] -= 1.6 * mult * dt;
          if (arr[i * 3 + 1] < 0) arr[i * 3 + 1] = 11.5;
        }
        snowPoints.geometry.attributes.position.needsUpdate = true;
      }

      dustPoints.visible = phase === 'playing';
      if (dustPoints.visible) {
        const dArr = dustPoints.geometry.attributes.position.array;
        for (let i = 0; i < dustCount; i++) {
          const idx = i * 3;
          dArr[idx] = playerPos.x + dustBase[idx] + Math.sin(t * 0.45 + i) * 0.16;
          dArr[idx + 1] = dustBase[idx + 1] + Math.cos(t * 0.35 + i) * 0.12;
          dArr[idx + 2] = playerPos.z + dustBase[idx + 2] + Math.cos(t * 0.42 + i) * 0.16;
        }
        dustPoints.geometry.attributes.position.needsUpdate = true;
      }

      if (phase === 'cutscene') {
        cutsceneTime += dt;
        flashlight.intensity = 0;
        if (cutsceneTime < 3.0) {
          if (droppedLight) {
            droppedLight.group.position.z -= dt * 0.14;
            droppedLight.group.rotation.x = Math.min(0.65, cutsceneTime * 0.28);
            const flk = (cutsceneTime > 0.7 && cutsceneTime < 0.88) || (cutsceneTime > 1.35 && cutsceneTime < 1.54) || (cutsceneTime > 2.05 && cutsceneTime < 2.26);
            droppedLight.beam.intensity = cutsceneTime >= 2.55 ? 0 : (flk ? 0.4 : 6.2);
          }
          const dp = droppedLight ? droppedLight.group.position : playerPos;
          camera.position.set(playerPos.x + Math.sin(yaw) * 0.35, THREE.MathUtils.lerp(1.3, 0.22, Math.min(1, cutsceneTime * 1.8)), playerPos.z + Math.cos(yaw) * 0.35);
          camera.lookAt(dp.x, 0.06, dp.z);
          camera.rotation.z = THREE.MathUtils.lerp(0, 1.31, Math.min(1, cutsceneTime * 2.2));
        } else {
          if (!cutsceneDomeLoaded) {
            cutsceneDomeLoaded = true;
            buildGameplayLayer(3, 0.9, difficulty);
            enemies = [];
            if (domeCtrl) domeCtrl.tendrilGroup.visible = true;
            for (let i = 0; i < 5; i++) {
              const a = (i / 5) * Math.PI * 2 + 0.25;
              const sh = createShadow(i % 2 === 0);
              sh.root.position.set(Math.cos(a) * 3.85, 0, Math.sin(a) * 3.85);
              sh.root.lookAt(0, 0, 0); worldRoot.add(sh.root); cutsceneShadows.push(sh);
            }
            audio.glassShatter();
          }
          if (cutsceneTime < 6.0) {
            const lt = (cutsceneTime - 3.0) / 3.0;
            if (domeCtrl) {
              domeCtrl.tendrilGroup.scale.set(1, THREE.MathUtils.lerp(0.05, 1.18, Math.min(1, lt * 1.4)), 1);
              posePerson(domeCtrl.rindi, 'seated', t);
            }
            cutsceneShadows.forEach((sh, i) => { sh.torso.rotation.x = 0.35 + Math.sin(t * 1.6 + i) * 0.06; });
            const oa = 0.3 + lt * 0.7;
            camera.position.set(Math.sin(oa) * 5.6, 1.85, Math.cos(oa) * 5.6);
            camera.lookAt(0, 1.05, 0); camera.rotation.z = 0;
          } else if (cutsceneTime < 9.0) {
            const lt = (cutsceneTime - 6.0) / 3.0;
            document.getElementById('cutscene-sub-box').style.display = 'block';
            document.getElementById('cutscene-sub-text').textContent = '“' + STORY.cutsceneFatalLine + '”';
            if (domeCtrl) {
              posePerson(domeCtrl.rindi, 'seated', t, lt > 0.42);
              domeCtrl.domeMesh.material.opacity = THREE.MathUtils.lerp(0.5, 0.97, Math.max(0, (lt - 0.3) / 0.7));
              domeCtrl.domeMesh.material.color.setHex(0x0c1b2e);
              if (lt > 0.92) domeCtrl.rindi.root.visible = false;
            }
            camera.position.set(0.18, 1.05, 1.62 + lt * 0.75); camera.lookAt(0, 0.92, 0.05);
          } else if (cutsceneTime < 12.0) {
            document.getElementById('cutscene-sub-box').style.display = 'none';
            if (!cutsceneChordPlayed) { cutsceneChordPlayed = true; audio.finalChord(); }
            const lt = (cutsceneTime - 9.0) / 3.0;
            camera.position.set(0, THREE.MathUtils.lerp(2.4, 10.5, lt), THREE.MathUtils.lerp(4.2, 13.5, lt));
            camera.lookAt(0, 0.8, 0);
          } else {
            showGameOver();
          }
        }
        audio.update(dt, 1.0, 2.5, false, false, false, 'snow', layerIdx, false);
        renderer.render(scene, camera);
        return;
      }

      if (phase === 'title') {
        flashlight.intensity = 0; titleAng += dt * 0.14;
        camera.position.set(Math.sin(titleAng) * 4.8, 1.85, 1.6 + Math.cos(titleAng) * 2.8);
        camera.lookAt(0, 0.95, -1.0); camera.rotation.z = 0;
        if (campusRindi) posePerson(campusRindi, 'seated', t);
        audio.update(dt, frost, 99, false, false, false, 'snow', 0, false);
      } else if (phase === 'prologue' || phase === 'ending' || (phase === 'dialogue' && campusRindi)) {
        flashlight.intensity = 0;
        if (endingType === 'true' && phase !== 'prologue') {
          camera.position.set(0.2, 1.78, 4.4); camera.lookAt(0, 1.15, -1.5);
          if (campusRindi) posePerson(campusRindi, 'idle', t);
          if (campusBima) posePerson(campusBima, 'idle', t);
        } else {
          camera.position.set(2.55, 1.72, 2.35); camera.lookAt(0.35, 1.05, -0.5);
          if (campusRindi) posePerson(campusRindi, 'seated', t);
          if (campusBima) posePerson(campusBima, 'idle', t);
        }
        audio.update(dt, frost, 99, false, false, false, 'snow', 0, false);
      } else if (phase !== 'playing') {
        audio.update(dt, frost, 99, hiding, false, false, 'snow', layerIdx, false);
      } else if (phase === 'playing') {
        animated.forEach(a => {
          if (a.mode === 'pencil') a.mesh.rotation.y += dt * 0.72;
          else { a.mesh.rotation.y += dt * 1.1; a.mesh.position.y += Math.sin(t * 2.4) * 0.0018; }
        });
        curtains.forEach((c, i) => { c.rotation.z = Math.sin(t * 1.6 + i) * 0.05; });
        clockHands.forEach(h => { h.rotation.z -= dt * (2.6 + (Math.sin(t * 7.5) > 0.35 ? 1.8 : -0.4)); });
        if (buzzCd > 0) buzzCd -= dt;
        flickerLights.forEach(fl => {
          const on = Math.sin(t * 19 + fl.seed) * Math.sin(t * 7.3 + fl.seed) > -0.58;
          fl.light.intensity = on ? 2.1 : 0.12; fl.mat.emissiveIntensity = on ? 1.6 : 0.08;
          if (!on && buzzCd <= 0) { buzzCd = 2.6; audio.electricBuzz(); }
        });
        beaconRipples.forEach(r => {
          const p = (t * 0.85) % 1; r.scale.set(0.75 + p * 2.2, 0.75 + p * 2.2, 1); r.material.opacity = (1 - p) * 0.72;
        });
        mannequins.forEach(m => { posePerson(m, 'idle', t); if (mannequinsAlerted) m.head.lookAt(playerPos.x, 1.55, playerPos.z); });
        if (domeCtrl) posePerson(domeCtrl.rindi, 'seated', t);

        if (jumpscareTimer > 0) {
          jumpscareTimer -= dt;
          const st = Math.floor(t * 22) % 2;
          const sEl = document.getElementById('strobe-fx');
          sEl.style.display = 'block';
          sEl.style.background = st === 0 ? 'rgba(220,38,38,0.28)' : 'rgba(37,99,235,0.28)';
          flashlight.color.setHex(st === 0 ? 0xff3b3b : 0x3b82f6); flashlight.intensity = 9.0;
          if (jumpscareKind === 'entity' && activeEnemy) { activeEnemy.rig.maskAnchor.getWorldPosition(_scareWorld); scareFocus.copy(_scareWorld); }
          camera.position.set(playerPos.x + (Math.random() - 0.5) * 0.14, playerPos.y + (Math.random() - 0.5) * 0.14, playerPos.z);
          camera.lookAt(scareFocus); camera.rotation.z = (Math.random() - 0.5) * 0.12;
          if (jumpscareTimer <= 0) {
            sEl.style.display = 'none'; flashlight.color.setHex(0xfef3c7); camera.rotation.z = 0;
            if (jumpscareKind === 'entity') {
              const bx = playerPos.x + Math.sin(yaw) * 1.4, bz = playerPos.z + Math.cos(yaw) * 1.4;
              if (!collides(bx, playerPos.z)) playerPos.x = bx; if (!collides(playerPos.x, bz)) playerPos.z = bz;
              graceTimer = 4.0;
              if (activeEnemy) { activeEnemy.rig.root.position.copy(activeEnemy.waypoints[0]); activeEnemy.frozen = 4.2; activeEnemy = null; }
            }
            jumpscareKind = null;
          }
          renderer.render(scene, camera);
          return;
        }

        flashlight.color.setHex(0xfef3c7);
        if (graceTimer > 0) graceTimer = Math.max(0, graceTimer - dt);
        if (lanternCd > 0) lanternCd = Math.max(0, lanternCd - dt);
        if (lanternActive > 0) { lanternActive = Math.max(0, lanternActive - dt); lanternLight.intensity = lanternActive * 10; }

        let moving = false, sprint = false;
        if (!hiding) {
          const kz = (keys['KeyW'] || keys['ArrowUp'] ? 1 : 0) - (keys['KeyS'] || keys['ArrowDown'] ? 1 : 0);
          const kx = (keys['KeyD'] || keys['ArrowRight'] ? 1 : 0) - (keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0);
          let mz = kz + virtY, mx = kx + virtX;
          const rawMag = Math.hypot(mx, mz);
          if (rawMag > 0.08) {
            moving = true;
            const cMag = Math.min(1, rawMag);
            mx /= rawMag; mz /= rawMag;
            if ((keys['ShiftLeft'] || keys['ShiftRight'] || virtAutoSprint || mobileSprintHeld) && stamina > 5) { sprint = true; stamina = Math.max(0, stamina - 28 * dt); }
            else stamina = Math.min(100, stamina + 12 * dt);
            const spd = (sprint ? 6.2 : 3.85) * cMag;
            const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
            const vx = fx * mz + rx * mx, vz = fz * mz + rz * mx;
            const nx = playerPos.x + vx * spd * dt, nz = playerPos.z + vz * spd * dt;
            if (!collides(nx, playerPos.z)) playerPos.x = nx;
            if (!collides(playerPos.x, nz)) playerPos.z = nz;
          } else stamina = Math.min(100, stamina + 20 * dt);
        } else stamina = Math.min(100, stamina + 24 * dt);

        autoDoors.forEach(d => {
          if (!d.triggered && playerPos.z < d.triggerZ) { d.triggered = true; audio.cue('door'); audio.cue('whisper'); }
          if (d.triggered) d.pivot.rotation.y += (d.targetYaw - d.pivot.rotation.y) * Math.min(1, dt * 14);
        });

        envScares.forEach(sc => {
          if (!sc.fired && !hiding && Math.hypot(playerPos.x - sc.position.x, playerPos.z - sc.position.z) <= sc.radius) {
            sc.fired = true; jumpscareKind = sc.kind; jumpscareTimer = 0.72; scareFocus.copy(sc.focus);
            if (sc.kind === 'wardrobe') { wardrobeSlamFired = true; audio.cue('door'); audio.jumpscareShriek(); }
            else if (sc.kind === 'mannequins') { mannequinsAlerted = true; audio.metalBang(); }
            else if (sc.kind === 'glitchPhone') { if (sc.glitchGroup) { sc.glitchGroup.visible = true; sc.glitchGroup.lookAt(playerPos.x, 1.75, playerPos.z); } audio.notifGlitch(); audio.jumpscareShriek(); }
          }
          if (sc.fired && sc.kind === 'wardrobe' && wardrobeSlamFired) {
            if (sc.pL) sc.pL.rotation.y += (-1.9 - sc.pL.rotation.y) * Math.min(1, dt * 15);
            if (sc.pR) sc.pR.rotation.y += (1.9 - sc.pR.rotation.y) * Math.min(1, dt * 15);
          }
        });

        storyTriggers.forEach(tr => {
          if (!tr.fired && Math.hypot(playerPos.x - tr.position.x, playerPos.z - tr.position.z) <= tr.radius) {
            tr.fired = true; const lines = STORY.triggers[tr.id];
            if (lines) openDialogue(lines, () => { phase = 'playing'; showScreen('hud-screen'); });
          }
        });

        let near = 99;
        enemies.forEach(en => {
          const ep = en.rig.root.position;
          const dist = Math.hypot(ep.x - playerPos.x, ep.z - playerPos.z);
          if (dist < near) near = dist;
          if (en.frozen > 0) { en.frozen -= dt; return; }
          en.rig.cloud.rotation.y += 0.025;
          const det = difficulty === 'story' ? 6.0 : 9.5 + frost * 4;
          en.chase = !hiding && graceTimer <= 0 && dist < det;
          const tgt = en.chase ? playerPos : en.waypoints[en.wp];
          const dx = tgt.x - ep.x, dz = tgt.z - ep.z, td = Math.hypot(dx, dz);
          if (!en.chase && td < 0.65) en.wp = (en.wp + 1) % en.waypoints.length;
          else if (td > 0.05) {
            const ms = en.chase ? en.speed * 1.15 : en.speed * 0.72;
            ep.x += (dx / td) * ms * dt; ep.z += (dz / td) * ms * dt;
            en.rig.root.rotation.y = Math.atan2(dx, dz);
          }
          if (!hiding && dist < 1.22 && graceTimer <= 0 && jumpscareTimer <= 0) {
            jumpscareCount++; stability = Math.max(0, stability - 1); updateStabilityUI();
            warmth = Math.max(15, warmth - (difficulty === 'story' ? 10 : 20));
            audio.jumpscareShriek(); audio.glassShatter();
            if (stability <= 0) { startCutscene(); return; }
            jumpscareKind = 'entity'; jumpscareTimer = 1.05; activeEnemy = en;
            en.rig.root.position.set(playerPos.x - Math.sin(yaw) * 0.92, 0, playerPos.z - Math.cos(yaw) * 0.92);
            en.rig.root.lookAt(playerPos.x, 0, playerPos.z); en.frozen = 5.2;
          }
        });

        if (near > 10 || hiding) warmth = Math.min(100, warmth + 3 * dt);
        flashlight.intensity = near < 5.5 && Math.random() < 0.25 ? 1.5 : 5.6;
        camera.position.set(playerPos.x, playerPos.y + (moving && !hiding ? Math.sin(t * 9) * 0.04 : 0), playerPos.z);
        camera.rotation.order = 'YXZ'; camera.rotation.y = yaw; camera.rotation.x = pitch; camera.rotation.z = 0;

        const cl = findClosest();
        const pBox = document.getElementById('hud-prompt');
        const touchAct = document.getElementById('touch-interact');
        const actPrefix = controlMode === 'mobile' ? '[Ketuk AKSI] ' : '[E] ';
        const hasNearby = hiding || Boolean(cl.item) || cl.hide >= 0;
        if (touchAct) {
          touchAct.textContent = hiding ? 'KELUAR' : 'AKSI';
          touchAct.style.borderColor = hasNearby ? '#d4a353' : 'rgba(120,169,196,0.48)';
          touchAct.style.background = hasNearby ? 'rgba(212,163,83,0.28)' : 'rgba(7,12,20,0.6)';
          touchAct.style.color = hasNearby ? '#fef08a' : '#cbd5e1';
        }
        const ringEl = document.getElementById('lantern-ring-progress');
        if (ringEl) {
          const lProg = Math.max(0, Math.min(1, 1 - lanternCd / 8));
          ringEl.setAttribute('stroke-dashoffset', String(163.36 * (1 - lProg)));
          ringEl.setAttribute('stroke', lanternCd <= 0 && !hiding ? '#d4a353' : '#78a9c4');
        }
        if (hiding) { document.getElementById('hud-hiding').style.display = 'block'; pBox.style.display = 'block'; document.getElementById('hud-prompt-main').textContent = actPrefix + 'Keluar dari Persembunyian'; document.getElementById('hud-prompt-sub').textContent = ''; }
        else {
          document.getElementById('hud-hiding').style.display = 'none';
          if (cl.item) { pBox.style.display = 'block'; document.getElementById('hud-prompt-main').textContent = actPrefix + cl.item.label; document.getElementById('hud-prompt-sub').textContent = cl.item.kind === 'exit' && !exitOpen ? 'Masih terkunci, lengkapi target dulu.' : ''; }
          else if (cl.hide >= 0) { pBox.style.display = 'block'; document.getElementById('hud-prompt-main').textContent = actPrefix + 'Sembunyi di ' + hidingSpots[cl.hide].label; document.getElementById('hud-prompt-sub').textContent = 'Berlindung dari kejaran.'; }
          else pBox.style.display = 'none';
        }
        const gEl = document.getElementById('hud-grace');
        if (graceTimer > 0) { gEl.style.display = 'block'; gEl.textContent = 'JEDA PEMULIHAN AMAN · ' + graceTimer.toFixed(1) + 'd'; } else gEl.style.display = 'none';

        document.getElementById('hud-progress').textContent = collected + '/' + STORY.layers[layerIdx].totalTargets;
        document.getElementById('hud-warmth').textContent = Math.round(warmth) + '%';
        document.getElementById('bar-warmth').style.width = warmth + '%';
        document.getElementById('bar-warmth').style.background = warmth > 50 ? '#78a9c4' : '#c25959';
        document.getElementById('hud-stamina').textContent = Math.round(stamina) + '%';
        document.getElementById('bar-stamina').style.width = stamina + '%';
        document.getElementById('hud-lantern').textContent = lanternCd <= 0 ? 'SIAP' : 'MENGISI';
        document.getElementById('bar-lantern').style.width = Math.round((1 - lanternCd / 8) * 100) + '%';
        document.getElementById('hud-frost').textContent = Math.round(frost * 100) + '%';
        const dng = Math.max(0, Math.min(1, 1 - (near - 2) / 11));
        document.getElementById('vignette').style.background = 'radial-gradient(circle at center, transparent 46%, rgba(' + (dng > 0.35 ? '138,28,28' : '12,54,78') + ',' + Math.min(0.75, 0.22 + frost * 0.28 + dng * 0.36) + ') 100%)';

        audio.update(dt, frost, near, hiding, moving, sprint, STORY.layers[layerIdx].surface, layerIdx, true);
      }
      renderer.render(scene, camera);
    }
    animate();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtml(): void {
  const html = buildStandaloneHtml();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ShatteredMemories_SudutBekuRindiani.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
