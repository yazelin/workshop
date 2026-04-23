// ===========================================================
// 森之召喚師工坊 · 魔道具資料
// 所有 icon 是 inline SVG（24x24 viewBox），stroke-based 手繪風
// ===========================================================

// --- SVG Icon Library ---
// 設計原則：線條、currentColor、有機曲線、24x24 viewBox
// 使用時：<svg>...</svg>，由 CSS 控色
const ICONS = {
  chronocat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="13" r="7.5"/>
    <path d="M7.5 8.5L8.5 6.5M16.5 8.5L15.5 6.5"/>
    <path d="M9 13.5c0.5-1 1.3-1.5 3-1.5s2.5 0.5 3 1.5"/>
    <circle cx="10" cy="12" r="0.3" fill="currentColor"/>
    <circle cx="14" cy="12" r="0.3" fill="currentColor"/>
    <path d="M12 8.5v-2M12 8.5l-2 -1"/>
  </svg>`,

  moodscopia: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="1.5"/>
    <line x1="9" y1="3" x2="9" y2="21"/>
    <line x1="15" y1="3" x2="15" y2="21"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="3" y1="15" x2="21" y2="15"/>
    <circle cx="6" cy="6" r="0.6" fill="currentColor"/>
    <path d="M11 12.5c0.3 0.4 0.7 0.7 1 0.7s0.7 -0.3 1 -0.7"/>
    <path d="M17.5 18.5c-0.3 -0.4 -0.7 -0.7 -1 -0.7s-0.7 0.3 -1 0.7"/>
  </svg>`,

  'portrait-circle': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="8"/>
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4"/>
  </svg>`,

  'painted-tome': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 5c3 0 5 1 8 1s5 -1 8 -1v14c-3 0 -5 1 -8 1s-5 -1 -8 -1z"/>
    <path d="M12 6v14"/>
    <path d="M7 10c1.5 -0.5 2.5 0.5 3 1.5s0 2 -1 2"/>
    <path d="M15 11c1 0.3 2 0 2.5 -0.5"/>
  </svg>`,

  'spell-composer': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 4h14v16H5z"/>
    <path d="M5 4c-1 0 -1.5 0.5 -1.5 1.5s0.5 1.5 1.5 1.5"/>
    <path d="M19 17c1 0 1.5 0.5 1.5 1.5s-0.5 1.5 -1.5 1.5"/>
    <line x1="8" y1="9" x2="16" y2="9"/>
    <line x1="8" y1="12" x2="14" y2="12"/>
    <line x1="8" y1="15" x2="15" y2="15"/>
  </svg>`,

  'scribes-hand': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 20h16"/>
    <rect x="5" y="4" width="11" height="14" rx="0.5"/>
    <line x1="8" y1="8" x2="13" y2="8"/>
    <line x1="8" y1="11" x2="13" y2="11"/>
    <line x1="8" y1="14" x2="11" y2="14"/>
    <path d="M18 6l3 -3l1 1l-3 3z M18 6v4l2 2l-4 0l0 -4z"/>
  </svg>`,

  'lectern-of-light': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 10l6 -2l6 2v5H6z"/>
    <path d="M12 15v6M8 21h8"/>
    <path d="M12 5v-2M9 5l-1 -1M15 5l1 -1M7 7l-1 0M17 7l1 0"/>
    <line x1="8" y1="12" x2="16" y2="12" opacity="0.5"/>
  </svg>`,

  'shadow-vault': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="0.5"/>
    <line x1="4" y1="9" x2="20" y2="9"/>
    <line x1="4" y1="14" x2="20" y2="14"/>
    <circle cx="8" cy="6.5" r="0.6"/>
    <circle cx="8" cy="11.5" r="0.6"/>
    <circle cx="8" cy="17" r="0.6"/>
  </svg>`,

  'portal-rune': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="8"/>
    <path d="M8 12c1 -2.5 3 -4 6 -4"/>
    <path d="M16 12c-1 2.5 -3 4 -6 4"/>
    <path d="M14 8l2 0l0 2"/>
    <path d="M10 16l-2 0l0 -2"/>
  </svg>`,

  inkseal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="9" r="5"/>
    <path d="M7 9c1 -2 3 -3 5 -3s4 1 5 3"/>
    <path d="M9 9h6M10 11h4"/>
    <path d="M10 14l-1 6M14 14l1 6"/>
    <path d="M8 20h8"/>
  </svg>`,

  'ledger-whisper': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="5" y="4" width="11" height="16" rx="0.5"/>
    <line x1="8" y1="8" x2="13" y2="8"/>
    <line x1="8" y1="11" x2="13" y2="11"/>
    <line x1="8" y1="14" x2="11" y2="14"/>
    <path d="M18 9c1.5 0.5 2 1.5 2 3s-0.5 2.5 -2 3"/>
    <path d="M18 11c0.7 0.3 1 0.7 1 1s-0.3 0.7 -1 1"/>
  </svg>`,

  'voice-scribe': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
    <rect x="10" y="4" width="4" height="10" rx="2"/>
    <path d="M7 11c0 3 2 5 5 5s5 -2 5 -5"/>
    <line x1="12" y1="16" x2="12" y2="20"/>
    <line x1="9" y1="20" x2="15" y2="20"/>
    <path d="M4 8c0.5 0.5 0.5 1.5 0 2M20 8c-0.5 0.5 -0.5 1.5 0 2" opacity="0.6"/>
  </svg>`,
};

// 系別 icon (小尺寸徽記)
const SCHOOL_ICONS = {
  '召喚系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <circle cx="8" cy="8" r="5"/><circle cx="8" cy="8" r="2"/><line x1="8" y1="1" x2="8" y2="3"/>
    <line x1="8" y1="13" x2="8" y2="15"/><line x1="1" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="15" y2="8"/>
  </svg>`,
  '幻術系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <ellipse cx="8" cy="8" rx="7" ry="4"/><circle cx="8" cy="8" r="2"/><circle cx="8" cy="8" r="0.5" fill="currentColor"/>
  </svg>`,
  '創造系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <path d="M3 3c0 4 2 7 5 7c2 0 2 -1 2 -2"/><path d="M10 10c3 0 5 -1 5 -3"/>
    <circle cx="4" cy="5" r="0.5" fill="currentColor"/><circle cx="12" cy="4" r="0.5" fill="currentColor"/>
  </svg>`,
  '煉金系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <path d="M6 2v4l-3 6c-0.3 1 0 2 1 2h8c1 0 1.3 -1 1 -2l-3 -6v-4z"/><line x1="5" y1="2" x2="11" y2="2"/>
  </svg>`,
  '次元系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <rect x="2" y="2" width="12" height="12"/><rect x="5" y="5" width="6" height="6"/><rect x="7" y="7" width="2" height="2"/>
  </svg>`,
  '通靈系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <circle cx="5" cy="5" r="2.5"/><circle cx="11" cy="11" r="2.5"/><line x1="7" y1="7" x2="9" y2="9"/>
  </svg>`,
  '聲術系': `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
    <path d="M8 4v8M5 6v4M11 6v4M2 7v2M14 7v2"/>
  </svg>`,
};

window.ICONS = ICONS;
window.SCHOOL_ICONS = SCHOOL_ICONS;

// --- Artifact Data ---
window.ARTIFACTS = [
  {
    id: 'chronocat',
    icon: ICONS.chronocat,
    nameZh: '時之貓苑',
    nameEn: 'Chronocat',
    school: '召喚系',
    schoolEn: 'Summoning',
    repo: 'yazelin/catime',
    lore: '每至整點，森林深處便浮現一隻新貓。<br>有 103 種藝術流派的皮毛，各自攜帶一段小故事。',
    effect: 'GitHub Actions 每小時自動呼叫 Gemini 生成 AI 貓圖，發至 Telegram 與 Gallery 歸檔。',
    actions: [
      { label: 'Gallery', url: 'https://yazelin.github.io/catime/', primary: true },
      { label: 'Telegram', url: 'https://t.me/catime_yaze' },
      { label: 'Source', url: 'https://github.com/yazelin/catime' },
    ],
  },
  {
    id: 'moodscopia',
    icon: ICONS.moodscopia,
    nameZh: '心情占卜儀',
    nameEn: 'Moodscopia',
    school: '幻術系',
    schoolEn: 'Illusion',
    repo: 'yazelin/emoji-slot-machine',
    lore: '取冒險者一張自拍，映入九宮魔陣，<br>瞬間化為九格誇張表情。手指一碰便停在一格。',
    effect: 'Cloudflare Worker + Vertex AI。自拍 → 3×3 emoji 臉 → FB 可嵌拉霸影片。',
    actions: [
      { label: '試用', url: 'https://yazelin.github.io/emoji-slot-machine/', primary: true },
      { label: 'Source', url: 'https://github.com/yazelin/emoji-slot-machine' },
    ],
  },
  {
    id: 'portrait-circle',
    icon: ICONS['portrait-circle'],
    nameZh: '繪影魔陣',
    nameEn: 'Portrait Circle',
    school: '創造系',
    schoolEn: 'Creation',
    repo: 'yazelin/nanobanana-pro',
    lore: '能自動在多個創造之神之間換手，<br>繪製最切合意念的圖像。若一神拒絕，轉請下一神。',
    effect: 'AI 圖像生成 Agent Skill，支援自動模型 fallback。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/nanobanana-pro', primary: true },
    ],
  },
  {
    id: 'painted-tome',
    icon: ICONS['painted-tome'],
    nameZh: '繪風傳承書',
    nameEn: 'Painted Tome',
    school: '創造系',
    schoolEn: 'Creation',
    repo: 'yazelin/gemini-web',
    lore: '讓神靈（Gemini）在此作畫，<br>支援繁體符文、不留神印。',
    effect: 'Gemini AI 圖片生成 CLI + HTTP API。繁中原生、浮水印自動處理。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/gemini-web', primary: true },
    ],
  },
  {
    id: 'spell-composer',
    icon: ICONS['spell-composer'],
    nameZh: '咒文起稿匣',
    nameEn: 'Spell Composer',
    school: '創造系',
    schoolEn: 'Creation',
    repo: 'yazelin/PromptFill',
    lore: '為繪影魔陣準備咒文草稿的輔助匣。<br>結構化、省去散亂冥想。',
    effect: '結構化 AI 繪圖 prompt 產生器，適配 Nano Banana Pro。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/PromptFill', primary: true },
    ],
  },
  {
    id: 'scribes-hand',
    icon: ICONS['scribes-hand'],
    nameZh: '卷軸化術',
    nameEn: "Scribe's Hand",
    school: '煉金系',
    schoolEn: 'Transmutation',
    repo: 'yazelin/MD2DOC-Evolution',
    lore: '將凡人墨跡（Markdown）煉成正式卷軸（Word）。<br>格式可客製化，符合任何行會規範。',
    effect: 'Markdown → Word，支援自訂樣式、表格、圖片、目錄。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/MD2DOC-Evolution', primary: true },
    ],
  },
  {
    id: 'lectern-of-light',
    icon: ICONS['lectern-of-light'],
    nameZh: '簡報祭壇',
    nameEn: 'Lectern of Light',
    school: '煉金系',
    schoolEn: 'Transmutation',
    repo: 'yazelin/MD2PPT-Evolution',
    lore: '將墨跡化為幻燈（PPT），<br>可現場投影展示，支援線上宣講模式。',
    effect: 'Markdown → PPT，含投影模式、語法高亮。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/MD2PPT-Evolution', primary: true },
    ],
  },
  {
    id: 'shadow-vault',
    icon: ICONS['shadow-vault'],
    nameZh: '藏影閣',
    nameEn: 'Shadow Vault',
    school: '次元系',
    schoolEn: 'Dimensional',
    repo: 'yazelin/image-bed',
    lore: '個人圖像的次元書架，<br>不佔本空間，存入 GitHub Releases 異界永不損壞。',
    effect: '個人圖床，圖片存放在 GitHub Releases。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/image-bed', primary: true },
    ],
  },
  {
    id: 'portal-rune',
    icon: ICONS['portal-rune'],
    nameZh: '傳送門刻印',
    nameEn: 'Portal Rune',
    school: '次元系',
    schoolEn: 'Dimensional',
    repo: 'yazelin/shorturl-worker',
    lore: '將漫長的咒文路徑封印為短刻印，<br>單手即可傳送冒險者。',
    effect: 'Cloudflare Workers + KV 縮網址服務。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/shorturl-worker', primary: true },
    ],
  },
  {
    id: 'inkseal',
    icon: ICONS.inkseal,
    nameZh: '印刻術',
    nameEn: 'Inkseal',
    school: '通靈系',
    schoolEn: 'Binding',
    repo: 'yazelin/printer-mcp',
    lore: '讓精靈能直接指揮凡人印刷術（CUPS），<br>將任何訊息化為實體。',
    effect: 'MCP server，透過 CUPS 控制印表機。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/printer-mcp', primary: true },
    ],
  },
  {
    id: 'ledger-whisper',
    icon: ICONS['ledger-whisper'],
    nameZh: '帳本監聽術',
    nameEn: 'Ledger Whisper',
    school: '通靈系',
    schoolEn: 'Binding',
    repo: 'yazelin/erpnext-mcp',
    lore: '讓精靈與商會帳本（ERPNext）直接對話，<br>問帳、記帳不必經過凡人之手。',
    effect: 'MCP server for ERPNext REST API。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/erpnext-mcp', primary: true },
    ],
  },
  {
    id: 'voice-scribe',
    icon: ICONS['voice-scribe'],
    nameZh: '詠唱辨識器',
    nameEn: 'Voice Scribe',
    school: '聲術系',
    schoolEn: 'Incantation',
    repo: 'yazelin/asr-ime-fcitx',
    lore: '將咒術師的口語即時記下為文字，<br>嵌入 fcitx 輸入法，隨呼隨用。',
    effect: 'ASR 語音輸入法，整合 fcitx framework。',
    actions: [
      { label: 'Source', url: 'https://github.com/yazelin/asr-ime-fcitx', primary: true },
    ],
  },
];
