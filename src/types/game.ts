export type GamePhase =
  | 'title'
  | 'prologue'
  | 'playing'
  | 'dialogue'
  | 'paused'
  | 'mirror'
  | 'cutscene'
  | 'gameover'
  | 'epilogue'
  | 'ending';

export type LayerIndex = 0 | 1 | 2 | 3;

export type DifficultyMode = 'standard' | 'story';

export type ControlMode = 'pc' | 'mobile';

export type SurfaceType = 'snow' | 'wood' | 'tile';

export interface DialogueLine {
  speaker: string;
  emotion: string;
  text: string;
  cue?: 'clock' | 'whisper' | 'door' | 'ice' | 'chime';
}

export interface LayerMeta {
  index: LayerIndex;
  roman: string;
  title: string;
  era: string;
  surface: SurfaceType;
  objectiveLabel: string;
  totalTargets: number;
  exitLabel: string;
  ambientHint: string;
}

export interface MirrorOption {
  id: string;
  label: string;
  sublabel: string;
  awarenessDelta: number;
  frostDelta: number;
  tag: string;
}

export interface MirrorQuestion {
  id: string;
  betweenLabel: string;
  prompt: string;
  contextNote: string;
  options: MirrorOption[];
}

export interface MirrorResponseRecord {
  questionId: string;
  betweenLabel: string;
  chosenLabel: string;
  tag: string;
  awarenessDelta: number;
}

export interface HudSnapshot {
  layerIndex: LayerIndex;
  stability: number;
  maxStability: number;
  jumpscareCount: number;
  graceTimer: number;
  strobePhase: 'none' | 'red' | 'blue';
  warmth: number;
  stamina: number;
  lanternCooldown: number;
  lanternActive: boolean;
  isHiding: boolean;
  isPointerLocked: boolean;
  collectedCount: number;
  totalTargets: number;
  exitUnlocked: boolean;
  frostLevel: number;
  threatDistance: number;
  promptText: string | null;
  promptSubtext: string | null;
}

export type EndingType = 'true' | 'neutral' | 'bad';

export interface EndingInfo {
  type: EndingType;
  title: string;
  subtitle: string;
  narrative: string;
  constitutionalSynthesis: string;
  accentColor: string;
  badgeText: string;
}

export interface ConstitutionalMapping {
  pillar: string;
  pancasilaRef: string;
  uudRef: string;
  explanation: string;
}

export const LAYER_METAS: LayerMeta[] = [
  {
    index: 0,
    roman: 'BABAK I',
    title: 'Rumah Lantai Dua yang Membeku',
    era: 'Masa Kecil · Usia 6 Tahun',
    surface: 'wood',
    objectiveLabel: 'Fragmen Memori',
    totalTargets: 2,
    exitLabel: 'Tembok Es Keheningan',
    ambientHint: 'Telusuri lantai dua rumah kayu, temukan 2 Fragmen Memori, lalu hadapi Tembok Es Keheningan.',
  },
  {
    index: 1,
    roman: 'BABAK II',
    title: 'Kelas Putaran Pensil & Pintu BK Dirantai',
    era: 'Masa Sekolah',
    surface: 'tile',
    objectiveLabel: 'Fragmen Memori',
    totalTargets: 2,
    exitLabel: 'Pintu Ruang BK Dirantai',
    ambientHint: 'Hindari bayangan figur dominan, kumpulkan 2 Fragmen Memori, dan buka rantai Pintu Ruang BK.',
  },
  {
    index: 2,
    roman: 'BABAK III',
    title: 'Labirin Piksel, Pintu Terkunci & Bisikan Fitnah',
    era: 'Masa Remaja — Awal Kuliah',
    surface: 'tile',
    objectiveLabel: 'Fragmen & Suar',
    totalTargets: 2,
    exitLabel: 'Pintu Akhir Lorong Fitnah',
    ambientHint: 'Amankan bukti pesan malam hari & layar AI, lalu ikuti Suar Biru Share-Loc menembus lorong fitnah.',
  },
  {
    index: 3,
    roman: 'BABAK IV',
    title: 'Kubah Kaca di Sudut Kampus',
    era: 'Masa Kini & Pemulihan',
    surface: 'snow',
    objectiveLabel: 'Pilar Perlindungan',
    totalTargets: 4,
    exitLabel: 'Kubah Kaca Rindiani',
    ambientHint: 'Nyalakan 4 Pilar Perlindungan Korban di sekitar halaman kampus untuk mencairkan Kubah Kaca Rindi.',
  },
];

// Gameplay Mirror questions focus on lived student ethics & empathy (no explicit legal article numbers)
export const MIRROR_QUESTIONS: MirrorQuestion[] = [
  {
    id: 'mirror_1',
    betweenLabel: 'CERMIN PSIKOLOGIS I · ANTARA BABAK I & II',
    prompt:
      'Ketika seorang anak atau korban memilih bungkam bertahun-tahun karena takut membongkar aib keluarga atau memicu konflik dengan orang tua pelaku, bagaimana sikap yang seharusnya diambil lingkar terdekat?',
    contextNote: 'Refleksi: Nilai Kemanusiaan & Hak Anak untuk Merasa Aman',
    options: [
      {
        id: 'm1_empathy',
        label: 'Mendampingi Korban & Memutus Budaya Diam',
        sublabel: 'Keharmonisan semu tidak boleh dibangun di atas luka korban; keselamatan dan ruang cerita yang aman jauh lebih utama daripada menjaga reputasi keluarga.',
        awarenessDelta: 34,
        frostDelta: -0.18,
        tag: 'Berpihak pada Korban & Memutus Diam',
      },
      {
        id: 'm1_neutral',
        label: 'Menyarankan Penyelesaian Kekeluargaan Tertutup',
        sublabel: 'Memberi ruang damai internal agar keluarga tidak terpecah, meski tanpa jaminan pemulihan mental bagi korban.',
        awarenessDelta: 16,
        frostDelta: 0.05,
        tag: 'Kompromi Sosial / Mediasi Pasif',
      },
      {
        id: 'm1_blame',
        label: 'Menjaga Nama Baik Keluarga Lebih Utama',
        sublabel: 'Korban sebaiknya menahan cerita lama agar tidak menimbulkan keributan dan rasa malu di tengah keluarga besar.',
        awarenessDelta: 0,
        frostDelta: 0.24,
        tag: 'Normalisasi Budaya Diam',
      },
    ],
  },
  {
    id: 'mirror_2',
    betweenLabel: 'CERMIN PSIKOLOGIS II · ANTARA BABAK II & III',
    prompt:
      'Saat pelecehan dianggap "candaan kelas" atau dilakukan oknum figur berkuasa di sekolah/kampus, apakah poster imbauan dan webinar edukasi saja sudah cukup untuk menciptakan ruang aman?',
    contextNote: 'Refleksi: Penegakan Sanksi Nyata & Tanpa Impunitas Otoritas',
    options: [
      {
        id: 'm2_justice',
        label: 'Tidak Cukup — Wajib Ada Ruang Lapor Aman & Sanksi Tegas',
        sublabel: 'Poster tanpa keberanian menindak pelaku berjabatan atau senior hanya melahirkan rasa takut melapor bagi korban berikutnya.',
        awarenessDelta: 33,
        frostDelta: -0.16,
        tag: 'Sanksi Tegas & Ruang Lapor Aman',
      },
      {
        id: 'm2_poster',
        label: 'Edukasi & Poster Sudah Memadai Sebagai Langkah Awal',
        sublabel: 'Perubahan sikap cukup diarahkan lewat sosialisasi persuasif dan imbauan moral tanpa sanksi keras.',
        awarenessDelta: 15,
        frostDelta: 0.08,
        tag: 'Pendekatan Seremonial / Poster',
      },
      {
        id: 'm2_ignore',
        label: 'Kasus Cukup Diredam Diam-Diam Demi Nama Baik Institusi',
        sublabel: 'Pelaporan terbuka hanya mencoreng citra sekolah atau kampus di mata publik.',
        awarenessDelta: 0,
        frostDelta: 0.25,
        tag: 'Pembiaran & Impunitas Otoritas',
      },
    ],
  },
  {
    id: 'mirror_3',
    betweenLabel: 'CERMIN PSIKOLOGIS III · ANTARA BABAK III & IV',
    prompt:
      'Ketika beredar rekayasa foto sensitif berbasis AI (KBGO) dan gosip keji yang menyalahkan cara bergaul mahasiswi, sikap apa yang mencerminkan kepedulian nyata?',
    contextNote: 'Refleksi: Menolak Stigma Slut-Shaming & Melindungi Martabat Korban',
    options: [
      {
        id: 'm3_solidarity',
        label: 'Tolak Stigma, Hentikan Penyebaran & Dampingi Pemulihan',
        sublabel: 'Korban manipulasi digital dan kekerasan relasi tidak pernah bersalah atas kejahatan pelaku; ia berhak mendapat perlindungan penuh.',
        awarenessDelta: 33,
        frostDelta: -0.18,
        tag: 'Anti-Stigma & Pendampingan Aktif',
      },
      {
        id: 'm3_caution',
        label: 'Menasihati Korban Agar Lebih Berhati-Hati di Dunia Maya',
        sublabel: 'Menyayangkan kejadiannya sambil mengingatkan bahwa risiko foto tersebar muncul karena kurang waspada dalam relasi.',
        awarenessDelta: 14,
        frostDelta: 0.1,
        tag: 'Bias Menyalahkan Korban Terselubung',
      },
      {
        id: 'm3_stigma',
        label: 'Menganggap Gosip Kampus Sebagai Konsekuensi Wajar Pergaulan',
        sublabel: 'Penilaian sosial adalah hal biasa yang harus diterima jika seseorang menjadi bahan perbincangan.',
        awarenessDelta: 0,
        frostDelta: 0.25,
        tag: 'Reproduksi Budaya Menyalahkan Korban',
      },
    ],
  },
];

// Explicit Pancasila & UUD NRI 1945 mappings displayed ONLY at the final screen
export const CONSTITUTIONAL_MAPPINGS: ConstitutionalMapping[] = [
  {
    pillar: 'Pilar I: Keberanian Bersuara & Dukungan Lingkar Terdekat',
    pancasilaRef: 'Sila ke-2 Pancasila (Kemanusiaan yang Adil dan Beradab)',
    uudRef: 'Pasal 28G ayat (1) UUD NRI 1945',
    explanation:
      'Memanusiakan korban dan memutus budaya diam demi keutuhan semu, menjamin hak atas rasa aman serta perlindungan diri dan keluarga dari rasa takut.',
  },
  {
    pillar: 'Pilar II: Ruang Aman Kampus & Satgas PPKS Proaktif',
    pancasilaRef: 'Sila ke-5 Pancasila (Keadilan Sosial bagi Seluruh Rakyat Indonesia)',
    uudRef: 'Pasal 28I ayat (2) UUD NRI 1945',
    explanation:
      'Menghadirkan sistem pelaporan yang proaktif dan bebas dari perlakuan diskriminatif, stigma slut-shaming, maupun penghakiman di lingkungan pendidikan.',
  },
  {
    pillar: 'Pilar III: Sanksi Hukum Tegas Tanpa Kompromi',
    pancasilaRef: 'Sila ke-2 & ke-5 Pancasila',
    uudRef: 'Pasal 1 ayat (3) & Pasal 27 ayat (1) UUD NRI 1945',
    explanation:
      'Menegaskan prinsip negara hukum dan kesamaan kedudukan di muka hukum: tidak ada kekebalan bagi senior, pasangan, maupun oknum figur otoritas.',
  },
  {
    pillar: 'Pilar IV: Rehabilitasi Psikologis & Jaminan Martabat',
    pancasilaRef: 'Sila ke-2 Pancasila',
    uudRef: 'Pasal 28D ayat (1) & Pasal 28G ayat (1) UUD NRI 1945',
    explanation:
      'Menjamin kepastian hukum yang adil serta pemulihan mental dan kehormatan korban kekerasan seksual maupun KBGO berbasis AI.',
  },
];

export const ENDINGS: Record<EndingType, EndingInfo> = {
  true: {
    type: 'true',
    title: 'Mencairnya Kubah Kaca: Ruang Aman & Pemulihan Martabat',
    subtitle: 'TRUE ENDING · KESADARAN KONSTITUSIONAL TINGGI',
    badgeText: 'KUBAH ES MENCAIR SEMPURNA',
    accentColor: '#d4a353',
    narrative:
      'Keempat Pilar Perlindungan meruntuhkan kubah beku di sudut kampus. Kembali di bangku taman di bawah cahaya pagi keemasan, salju telah berhenti turun. Rindiani menghela napas lega—untuk pertama kalinya ia tidak lagi sendirian, dan melangkah mantap bersama Bima menuju gedung layanan Satgas PPKS kampus.',
    constitutionalSynthesis:
      'Pemulihan ini mencerminkan pengamalan nyata Sila ke-2 & Sila ke-5 Pancasila serta Pasal 1 ayat (3), Pasal 27 ayat (1), Pasal 28D ayat (1), Pasal 28G ayat (1), dan Pasal 28I ayat (2) UUD NRI 1945: negara hukum wajib menjamin ruang aman yang bebas dari kekerasan, stigma diskriminatif, dan impunitas pelaku.',
  },
  neutral: {
    type: 'neutral',
    title: 'Poster di Atas Retakan',
    subtitle: 'NEUTRAL ENDING · KESADARAN PARSIAL',
    badgeText: 'KUBAH HANYA RETAK SEBAGIAN',
    accentColor: '#78a9c4',
    narrative:
      'Retakan di Kubah Kaca mulai melebar, tetapi dinginnya malam belum benar-benar pergi. Di bangku taman kampus, Rindi menatap poster-poster kampanye anti-kekerasan yang tertempel di papan pengumuman. Edukasi memang terdengar lantang, namun keraguan dalam menindak tegas pelaku membuat langkah Rindi menuju ruang pelaporan masih terhenti di tengah jalan.',
    constitutionalSynthesis:
      'Amanat Pasal 28D ayat (1) dan Pasal 28G ayat (1) UUD NRI 1945 menuntut kepastian hukum serta perlindungan nyata—bukan sekadar poster seremonial tanpa keberanian menegakkan sanksi.',
  },
  bad: {
    type: 'bad',
    title: 'Musim Dingin Abadi',
    subtitle: 'BAD ENDING · BUDAYA PEMBIARAN',
    badgeText: 'KUBAH MEMBEKU TOTAL',
    accentColor: '#c25959',
    narrative:
      'Salju semakin deras mengubur bangku taman kampus. Rindiani kembali memeluk tasnya dalam diam, sementara bayangan pembiaran, gosip stigma, dan ketakutan melapor mengunci kubah es lebih rapat dari sebelumnya. Budaya memaklumi kekerasan membungkam suara yang seharusnya dilindungi.',
    constitutionalSynthesis:
      'Pembiaran terhadap kekerasan dan stigma menyalahi kemanusiaan yang adil dan beradab (Sila ke-2 Pancasila) serta hak setiap warga negara untuk bebas dari perlakuan diskriminatif dan rasa takut (Pasal 28G ayat (1) & Pasal 28I ayat (2) UUD NRI 1945).',
  },
};
