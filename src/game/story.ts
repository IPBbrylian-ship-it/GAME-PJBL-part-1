import { DialogueLine, EndingType } from '../types/game';

export const PROLOGUE_DIALOGUES: DialogueLine[] = [
  {
    speaker: 'Bima',
    emotion: 'Pelan, cemas',
    text: 'Rindi... anginnya sudah sedingin ini. Kenapa kamu masih duduk sendirian di bangku taman belakang gedung?',
  },
  {
    speaker: 'Rindiani',
    emotion: 'Menatap kosong, memeluk tas',
    text: 'Semua orang di kampus ini cuma menganggapnya candaan, Bim... percuma cerita. Sekali bicara, malah aku yang dibilang cari perhatian.',
  },
  {
    speaker: 'Bima',
    emotion: 'Tegas tapi lembut',
    text: 'Aku di sini bukan untuk menghakimi atau menertawakanmu, Rindi. Kamu tidak harus terus menelan semuanya sendirian.',
  },
  {
    speaker: 'Rindiani',
    emotion: 'Suara bergetar',
    text: 'Kamu tidak akan sanggup mendengar semuanya... Rasanya terlalu dingin untuk diingat kembali.',
    cue: 'clock',
  },
  {
    speaker: 'Narator (Batin Bima)',
    emotion: 'Terseret kabut beku',
    text: 'Jam menara kampus berdentang berat. Udara tiba-tiba membekukan napas—dunia di sekelilingku runtuh menjadi lorong ingatan Rindi yang terkunci.',
    cue: 'ice',
  },
];

export const LAYER_INTRO_DIALOGUES: Record<number, DialogueLine[]> = {
  0: [
    {
      speaker: 'Bima',
      emotion: 'Terengah, dingin',
      text: 'Ini lantai dua rumah kayu tua... Dari bawah tangga terdengar samar suara ramai acara syukuran keluarga, tapi di atas sini membeku total.',
    },
    {
      speaker: 'Gema Memori',
      emotion: 'Samar di lorong',
      text: '“Rindi masih lemas habis DBD... biar main sebentar di kamar atas, di bawah terlalu berisik...”',
      cue: 'whisper',
    },
  ],
  1: [
    {
      speaker: 'Bima',
      emotion: 'Waspada',
      text: 'Ruang kelas SD yang miring... Kenapa ada pensil raksasa berputar di tengah meja dan manekin-manekin yang membisu?',
    },
  ],
  2: [
    {
      speaker: 'Bima',
      emotion: 'Tegang',
      text: 'Dinding-dinding kaca penuh piksel ungu... dan suara notifikasi ponsel yang terus mendesak di tengah malam.',
    },
  ],
  3: [
    {
      speaker: 'Bima',
      emotion: 'Terkejut',
      text: 'Itu Rindi... terkurung di dalam kubah kaca raksasa di tengah halaman kampus bersalju. Aku harus menyalakan keempat pilar pelindung untuk mencairkan esnya.',
    },
  ],
};

export const FRAGMENT_DIALOGUES: Record<string, DialogueLine[]> = {
  // BABAK I
  frag_1_phone: [
    {
      speaker: 'Bima',
      emotion: 'Mengamati ponsel di nakas',
      text: 'Layar ponsel pintar ini masih menyala dingin... Seseorang memakainya untuk membujuk anak berusia enam tahun yang sedang lemah pemulihan DBD.',
      cue: 'chime',
    },
    {
      speaker: 'Suara Rindi Kecil',
      emotion: 'Ketakutan',
      text: '“Katanya cuma sebentar pinjam HP di kamar atas... tapi pintunya ditutup, dan aku tidak berani teriak karena takut dimarahi...”',
    },
  ],
  frag_1_music: [
    {
      speaker: 'Suara Ibu (Gema)',
      emotion: 'Panik memanggil dari bawah',
      text: '“Rindi! Rindi di mana, Nak?! Turun sebentar, Nak!”',
      cue: 'chime',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Menahan tangis',
      text: 'Panggilan Ibu menyelamatkanku malam itu... Tapi saat dewasa aku tetap diam. Aku takut keluarga besar pecah dan bertengkar dengan orang tua pelaku.',
    },
  ],
  exit_1: [
    {
      speaker: 'Rindiani',
      emotion: 'Lirih di balik Tembok Es',
      text: 'Bertahun-tahun aku membungkam diri supaya tidak ada keributan keluarga... Sampai keheningan itu membeku menjadi tembok ini.',
      cue: 'ice',
    },
    {
      speaker: 'Bima',
      emotion: 'Tegas',
      text: 'Keutuhan keluarga yang palsu tidak boleh dibayar dengan luka seumur hidupmu, Rindi. Tembok ini harus runtuh.',
    },
  ],

  // BABAK II
  frag_2_note: [
    {
      speaker: 'Gema Tawa Kelas',
      emotion: 'Intimidatif',
      text: '“Putar lagi pensilnya! Ujungnya nunjuk siapa hari ini?! Jangan lebay ah, cuma bercanda!”',
      cue: 'whisper',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Tertekan',
      text: 'Mereka mengundi siapa siswi yang jadi sasaran sentuhan paksa. Teman-teman lain cuma diam atau ikut tertawa karena takut pada anak yang paling dominan.',
    },
  ],
  frag_2_badge: [
    {
      speaker: 'Gema Suara Oknum Guru',
      emotion: 'Merendahkan, berkuasa',
      text: '“Kamu manis sekali hari ini... mau tidak jadi istri bapak nanti?”',
      cue: 'whisper',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Gemetar di depan Ruang BK',
      text: 'Sudah pernah dilaporkan, tapi dia tetap bebas mengajar. Lihat pintu Ruang BK yang dirantai itu... bahkan untuk mengadu pun rasanya aku yang akan dihakimi.',
    },
  ],
  exit_2: [
    {
      speaker: 'Bima',
      emotion: 'Mematahkan rantai',
      text: 'Rantai rasa takut ini ada karena lingkungan membiarkan pelaku berkuasa tanpa sanksi. Ruang aman tidak boleh dikunci dari korban.',
      cue: 'door',
    },
  ],

  // BABAK III
  frag_3_kbgo: [
    {
      speaker: 'Layar Pesan Malam',
      emotion: 'Memaksa',
      text: '“Kalau sayang buktikan sekarang. Kirim PAP bagian itu. Jangan sok suci.”',
      cue: 'whisper',
    },
    {
      speaker: 'Bima',
      emotion: 'Terkejut, marah',
      text: 'Ya Tuhan... di layar ini ada foto wajah Rindi yang direkayasa tanpa busana memakai AI dan diperjualbelikan daring. Ini kejahatan digital nyata!',
    },
  ],
  frag_3_shareloc: [
    {
      speaker: 'Rindiani',
      emotion: 'Terengah, panik',
      text: 'Lengan dan bahuku dicengkeram keras hingga memar setiap kali aku menolak keinginannya... Untung aku sempat diam-diam mengirim share-loc ke teman dekatku.',
      cue: 'chime',
    },
    {
      speaker: 'Bima',
      emotion: 'Mantap',
      text: 'Suar biru itu jalan keluarnya. Jangan dengarkan bisikan fitnah di lorong terakhir!',
    },
  ],
  exit_3: [
    {
      speaker: 'Bisikan Fitnah',
      emotion: 'Mencemooh',
      text: '“Katanya anak rumahan yang diawasi ketat, kok gonta-ganti pacar? Salah sendiri terlalu gampang percaya...”',
      cue: 'whisper',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Pedih',
      text: 'Padahal aku hidup di bawah pengawasan ketat orang tuaku... Kenapa selalu aku yang harus menanggung malu dari kebohongan dan kekerasan mereka?',
    },
  ],

  // BABAK IV (4 Pillars)
  pillar_1: [
    {
      speaker: 'Bima',
      emotion: 'Hangat, meyakinkan',
      text: 'Pilar pertama menyala! Lingkar terdekat harus berani mendengar tanpa menyalahkan. Kamu berhak bersuara, Rindi.',
      cue: 'chime',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Mulai tergerak',
      text: 'Ternyata masih ada yang mau mendengar ceritaku tanpa menganggapnya lelucon...',
    },
  ],
  pillar_2: [
    {
      speaker: 'Bima',
      emotion: 'Serius',
      text: 'Pilar kedua aktif! Kampus tidak boleh pasif—layanan pelaporan dan Satgas PPKS harus proaktif menjemput amanah melindungi mahasiswa, bukan sekadar menempel poster.',
      cue: 'chime',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Berharap',
      text: 'Seandainya sejak sekolah dulu ada pintu yang benar-benar terbuka tanpa menghakimi...',
    },
  ],
  pillar_3: [
    {
      speaker: 'Bima',
      emotion: 'Tegas tanpa kompromi',
      text: 'Pilar ketiga menyala! Edukasi saja tidak pernah cukup jika pelaku—siapa pun jabatannya atau seberapa senior dia—tetap kebal dari sanksi tegas.',
      cue: 'chime',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Mulai tegar',
      text: 'Hanya sanksi nyata yang bisa memutus rantai pembiaran ini agar tidak ada korban berikutnya.',
    },
  ],
  pillar_4: [
    {
      speaker: 'Bima',
      emotion: 'Penuh empati',
      text: 'Pilar keempat aktif! Pemulihan psikologis, jaminan privasi, dan pengembalian martabatmu bukan belas kasihan—itu hak mutlakmu.',
      cue: 'ice',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Lega, suara jernih',
      text: 'Es di sekeliling kubah ini retak... Aku tidak lagi merasa kotor atau bersalah atas luka yang bukan perbuatanku.',
    },
  ],
};

export const TRIGGER_DIALOGUES: Record<string, DialogueLine[]> = {
  stair_warmth: [
    {
      speaker: 'Bima',
      emotion: 'Menatap ke bawah tangga',
      text: 'Cahaya hangat dari ruang keluarga lantai bawah... Semua tertawa merayakan syukuran, tanpa ada yang curiga pada apa yang terjadi di lantai atas.',
    },
  ],
  bk_hallway: [
    {
      speaker: 'Rindiani',
      emotion: 'Berbisik takut',
      text: 'Sepanjang lorong ini rasanya semua mata menghakimi. Pintu Ruang BK itu bahkan terikat rantai... ke mana lagi seorang siswi harus berlari?',
      cue: 'door',
    },
  ],
  slam_house: [
    {
      speaker: 'Rindiani',
      emotion: 'Tersentak kaget',
      text: 'Pintunya membanting tertutup lagi! Dia selalu mengunci pintu setiap kali marah, mencengkeram bahuku sampai biru...',
      cue: 'door',
    },
  ],
  whisper_corridor: [
    {
      speaker: 'Bisikan Lorong',
      emotion: 'Bertubi-tubi',
      text: '“Salah sendiri... cuma candaan... jangan dibesar-besarkan...”',
      cue: 'whisper',
    },
    {
      speaker: 'Bima',
      emotion: 'Menjaga fokus',
      text: 'Tutup telinga dari stigma itu. Ikuti cahaya suar biru di ujung lorong!',
    },
  ],
};

export function getEpilogueDialogues(endingType: EndingType): DialogueLine[] {
  if (endingType === 'true') {
    return [
      {
        speaker: 'Narator (Batin Bima)',
        emotion: 'Hangat di pagi hari',
        text: 'Kabut beku perlahan terangkat. Salju berhenti turun di sudut taman kampus, digantikan sinar matahari pagi yang menembus pepohonan.',
      },
      {
        speaker: 'Rindiani',
        emotion: 'Tersenyum tipis, tegar',
        text: 'Terima kasih sudah tidak berhenti mendengarkan, Bim. Hari ini aku siap melapor dan memulihkan hidupku.',
      },
      {
        speaker: 'Bima',
        emotion: 'Mendampingi',
        text: 'Ayo, gedung layanan Satgas PPKS sudah buka. Kita melangkah bersama.',
      },
    ];
  }

  if (endingType === 'neutral') {
    return [
      {
        speaker: 'Narator (Batin Bima)',
        emotion: 'Sendu di bawah langit mendung',
        text: 'Salju mulai menipis, tetapi udara di bangku taman tetap dingin. Di papan pengumuman kampus, poster anti-kekerasan berkibar pelan tanpa tindakan nyata di baliknya.',
      },
      {
        speaker: 'Rindiani',
        emotion: 'Ragu menatap gedung fakultas',
        text: 'Banyak yang bicara soal kesadaran, Bim... tapi aku masih belum yakin apakah pelaku akan benar-benar ditindak jika aku melapor hari ini.',
      },
    ];
  }

  return [
    {
      speaker: 'Narator (Batin Bima)',
      emotion: 'Kelam, membeku',
      text: 'Salju turun semakin lebat menelan cahaya lampu jalan. Bangku taman kembali sepi dan beku seperti semula.',
      cue: 'ice',
    },
    {
      speaker: 'Rindiani',
      emotion: 'Membisu, memeluk tas erat',
      text: 'Sudah kubilang, Bim... terlalu banyak pembiaran di luar sana. Lebih aman kalau aku tetap diam saja.',
    },
  ];
}

export const CUTSCENE_FATAL_LINE =
  'Maaf, Bim... terlalu dingin... aku sudah tidak bisa percaya siapa-siapa lagi...';

