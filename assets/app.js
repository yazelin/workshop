// ===========================================================
// 森之召喚師工坊 · 主程式
// Vanilla JS，無依賴
// ===========================================================

(function() {
  'use strict';

  // ----- Scene 管理 -----
  const scenes = {
    boot:      document.getElementById('sceneBoot'),
    title:     document.getElementById('sceneTitle'),
    path:      document.getElementById('scenePath'),
    door:      document.getElementById('sceneDoor'),
    workshop:  document.getElementById('sceneWorkshop'),
    character: document.getElementById('sceneCharacter'),
  };
  let currentScene = 'boot';

  function gotoScene(name, delay = 0) {
    setTimeout(() => {
      if (scenes[currentScene]) {
        scenes[currentScene].classList.remove('active');
        scenes[currentScene].classList.add('exiting');
      }
      if (scenes[name]) {
        scenes[name].classList.remove('exiting');
        scenes[name].classList.add('active');
      }
      currentScene = name;
    }, delay);
  }

  // ----- Mori 精靈游標 -----
  const mori = document.getElementById('moriCursor');
  const moriCore = document.getElementById('moriCursorCore');
  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let moriX = mouseX, moriY = mouseY;
  let coreX = mouseX, coreY = mouseY;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  (function animateMori() {
    // 外層慢跟（尾巴感）
    moriX += (mouseX - moriX) * 0.12;
    moriY += (mouseY - moriY) * 0.12;
    mori.style.left = moriX + 'px';
    mori.style.top  = moriY + 'px';
    // 核心快跟（精準）
    coreX += (mouseX - coreX) * 0.35;
    coreY += (mouseY - coreY) * 0.35;
    moriCore.style.left = coreX + 'px';
    moriCore.style.top  = coreY + 'px';
    requestAnimationFrame(animateMori);
  })();

  // hover 時 Mori 擴散
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('button, a, .artifact-card')) {
      mori.classList.add('hover-active');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('button, a, .artifact-card')) {
      mori.classList.remove('hover-active');
    }
  });

  // ----- 環境粒子（螢火） -----
  const particlesEl = document.getElementById('particles');
  function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = (10 + Math.random() * 15) + 's';
    p.style.animationDelay = Math.random() * 2 + 's';
    p.style.opacity = 0.3 + Math.random() * 0.5;
    particlesEl.appendChild(p);
    setTimeout(() => p.remove(), 25000);
  }
  for (let i = 0; i < 14; i++) setTimeout(spawnParticle, i * 600);
  setInterval(spawnParticle, 1800);

  // ===========================================================
  // 環境音層次系統
  // layer 1: forest-ambient (CC0, OpenGameArt "Cathedral in the forest")
  // layer 2: forest-birds (CC0, bobjt)
  // footstep: step-1~4.wav (CC-BY, dklon)
  // 各層用獨立 GainNode，可分別淡入淡出
  // ===========================================================
  const AUDIO_URLS = {
    forest:  'assets/audio/forest-ambient.ogg',
    birds:   'assets/audio/forest-birds.ogg',
    steps:   ['assets/audio/step-1.wav', 'assets/audio/step-2.wav',
              'assets/audio/step-3.wav', 'assets/audio/step-4.wav'],
  };
  const GAIN = { forest: 0.75, birds: 0.35, footstep: 0.6 };

  let audioCtx;
  let audioOn = false;
  const buffers = {};     // { forest, birds, step_0..3 }
  const sources = {};     // { forest, birds }
  const gains   = {};     // { forest, birds }
  const audioToggle = document.getElementById('audioToggle');
  const iconOn  = audioToggle.querySelector('.audio-icon--on');
  const iconOff = audioToggle.querySelector('.audio-icon--off');

  async function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      console.log('[audio] context created, state =', audioCtx.state);
    }
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
      console.log('[audio] resumed, state =', audioCtx.state);
    }
    return audioCtx;
  }

  async function loadBuffer(url) {
    if (buffers[url]) return buffers[url];
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('fetch ' + url + ' ' + resp.status);
    const ab = await resp.arrayBuffer();
    const buf = await audioCtx.decodeAudioData(ab);
    buffers[url] = buf;
    return buf;
  }

  async function startLayer(name, url, targetGain, loop = true) {
    if (sources[name]) return; // already playing
    const buf = await loadBuffer(url);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(targetGain, audioCtx.currentTime + 4);
    g.connect(audioCtx.destination);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;
    src.connect(g);
    src.start();
    sources[name] = src;
    gains[name] = g;
    console.log('[audio] layer started:', name, 'duration', buf.duration.toFixed(1) + 's');
  }

  function stopLayer(name, fadeSec = 1.5) {
    const g = gains[name];
    const s = sources[name];
    if (!g || !s) return;
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + fadeSec);
    setTimeout(() => {
      try { s.stop(); } catch (e) {}
      delete sources[name];
      delete gains[name];
    }, fadeSec * 1000 + 100);
  }

  async function startAmbient() {
    try {
      await ensureAudioCtx();
      // 兩層並行淡入
      await Promise.all([
        startLayer('forest', AUDIO_URLS.forest, GAIN.forest),
        startLayer('birds',  AUDIO_URLS.birds,  GAIN.birds),
      ]);
      // 預先載入腳步聲（給之後用，不播）
      for (const url of AUDIO_URLS.steps) {
        loadBuffer(url).catch(e => console.warn('[audio] step preload:', e));
      }
    } catch (e) {
      console.error('[audio] failed to start:', e);
      alert('音訊啟動失敗：' + e.message + '\n\nF12 Console 看詳細。');
      audioOn = false;
      iconOn.style.display  = 'none';
      iconOff.style.display = 'block';
      audioToggle.classList.remove('active');
    }
  }

  function stopAmbient() {
    stopLayer('forest');
    stopLayer('birds');
  }

  // 播一聲隨機腳步（一次性，不 loop）
  async function playFootstep(volume = GAIN.footstep) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    try {
      const url = AUDIO_URLS.steps[Math.floor(Math.random() * AUDIO_URLS.steps.length)];
      const buf = await loadBuffer(url);
      const g = audioCtx.createGain();
      g.gain.value = volume;
      g.connect(audioCtx.destination);
      const src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      src.start();
    } catch (e) {
      console.warn('[audio] step play failed:', e);
    }
  }

  // 連播數個腳步（進入工坊時的「走進去」效果）
  function playFootstepsWalking(count = 5, interval = 400) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => playFootstep(GAIN.footstep - i * 0.05), i * interval);
    }
  }

  // 玻璃 / 銅鈴 合成音（魔道具 hover / click 用）
  // 多個 harmonics 疊加模擬金屬或玻璃震動
  function playChime(freq = 520, duration = 1.0, volume = 0.12) {
    if (!audioCtx || audioCtx.state !== 'running') return;
    const now = audioCtx.currentTime;
    const master = audioCtx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(volume, now + 0.01);
    master.gain.exponentialRampToValueAtTime(0.001, now + duration);
    master.connect(audioCtx.destination);

    // fundamental + 三個 inharmonic partials（讓聲音像鐘/玻璃不像純 sine）
    const partials = [
      { mult: 1,    vol: 1.0  },
      { mult: 2.0,  vol: 0.55 },
      { mult: 2.76, vol: 0.35 },
      { mult: 5.4,  vol: 0.15 },
    ];
    partials.forEach(({ mult, vol }) => {
      const o = audioCtx.createOscillator();
      o.type = 'sine';
      o.frequency.value = freq * mult;
      const g = audioCtx.createGain();
      g.gain.value = vol;
      o.connect(g);
      g.connect(master);
      o.start(now);
      o.stop(now + duration);
    });
  }

  // 暴露到 module 範圍讓 UI 互動用得到
  window.__moriAudio = { playFootstep, playFootstepsWalking, playChime };

  function setAudioUIOn() {
    iconOn.style.display  = 'block';
    iconOff.style.display = 'none';
    audioToggle.classList.add('active');
  }
  function setAudioUIOff() {
    iconOn.style.display  = 'none';
    iconOff.style.display = 'block';
    audioToggle.classList.remove('active');
  }

  audioToggle.addEventListener('click', () => {
    audioOn = !audioOn;
    if (audioOn) { startAmbient(); setAudioUIOn(); }
    else         { stopAmbient();  setAudioUIOff(); }
  });

  // 自動開啟：首次互動時啟動（瀏覽器不允許無 gesture autoplay）
  // 監聽第一個 pointerdown / keydown / click，觸發後移除 listener
  let autoStarted = false;
  async function autoStartOnFirstInteraction(e) {
    if (autoStarted) return;
    // 如果點的是 audioToggle 本身，讓它的 handler 處理
    if (e && e.target && e.target.closest && e.target.closest('#audioToggle')) return;
    autoStarted = true;
    audioOn = true;
    try {
      await startAmbient();
      setAudioUIOn();
    } catch (err) {
      // 啟動失敗不要吵，使用者還能手動開
      audioOn = false;
      setAudioUIOff();
    }
    removeListeners();
  }
  function removeListeners() {
    document.removeEventListener('pointerdown', autoStartOnFirstInteraction, true);
    document.removeEventListener('keydown',    autoStartOnFirstInteraction, true);
    document.removeEventListener('touchstart', autoStartOnFirstInteraction, true);
  }
  document.addEventListener('pointerdown', autoStartOnFirstInteraction, true);
  document.addEventListener('keydown',    autoStartOnFirstInteraction, true);
  document.addEventListener('touchstart', autoStartOnFirstInteraction, true);

  // ----- Boot → Title 自動推進 -----
  setTimeout(() => gotoScene('title'), 1800);

  // ----- Title: Enter 按鈕 → Path → Door -----
  document.getElementById('enterBtn').addEventListener('click', () => {
    gotoScene('path');
    // Path 播放 5 秒後進 door
    setTimeout(() => gotoScene('door'), 5200);
  });

  // ----- Door: 拉開 → Workshop（支援按鈕 + 拖曳） -----
  let doorOpened = false;
  function openDoor() {
    if (doorOpened) return;
    doorOpened = true;
    scenes.door.classList.add('opening');
    // 腳步聲：門拉開後 800ms 開始走進去，連續 5 步
    setTimeout(() => {
      if (window.__moriAudio && audioOn) {
        window.__moriAudio.playFootstepsWalking(5, 450);
      }
    }, 800);
    setTimeout(() => gotoScene('workshop'), 2400);
  }
  document.getElementById('doorBtn').addEventListener('click', openDoor);

  // --- 拖曳互動 ---
  // 在兩片障子上監聽 pointer 事件
  // 往中心外拉（左片向左、右片向右）超過門寬 30% 即觸發 openDoor
  const shojiLeft  = document.querySelector('.shoji-left');
  const shojiRight = document.querySelector('.shoji-right');
  function attachDrag(panel, direction /* -1 for left, +1 for right */) {
    if (!panel) return;
    let startX = 0;
    let currentOffset = 0;
    let dragging = false;
    const onDown = (e) => {
      if (doorOpened) return;
      dragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      panel.style.transition = 'none';
      panel.setPointerCapture && panel.setPointerCapture(e.pointerId);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const dx = x - startX;
      // 只允許往外拉（左片負值、右片正值）
      const valid = (direction === -1 && dx < 0) || (direction === 1 && dx > 0);
      if (valid) {
        currentOffset = dx;
        panel.style.transform = `translateX(${dx}px)`;
      }
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      panel.style.transition = '';
      const panelWidth = panel.offsetWidth;
      const ratio = Math.abs(currentOffset) / panelWidth;
      if (ratio > 0.3) {
        // 拉開
        panel.style.transform = '';
        openDoor();
      } else {
        // 回彈
        panel.style.transform = '';
      }
      currentOffset = 0;
    };
    panel.addEventListener('pointerdown', onDown);
    panel.addEventListener('pointermove', onMove);
    panel.addEventListener('pointerup',   onUp);
    panel.addEventListener('pointercancel', onUp);
    panel.addEventListener('pointerleave', (e) => { if (dragging) onUp(e); });
  }
  attachDrag(shojiLeft,  -1);
  attachDrag(shojiRight, +1);

  // ----- Workshop: 返回 → Title -----
  document.getElementById('wsBack').addEventListener('click', () => {
    gotoScene('title');
    // 重置門狀態，下次從 title 再進來可以再拉一次
    setTimeout(() => {
      scenes.door.classList.remove('opening');
      doorOpened = false;
    }, 1200);
  });

  // ----- Title: 召喚師檔案 → Character -----
  document.getElementById('profileBtn').addEventListener('click', () => {
    gotoScene('character');
    renderSkillTree();
  });

  document.getElementById('charBack').addEventListener('click', () => {
    gotoScene('title');
  });

  // ----- 技能樹資料（Level 0-7） -----
  const QUESTS = [
    {
      level: 0,
      zh: '旅人',
      en: 'Wanderer',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M12 3 C 14 8, 14 12, 12 17 C 10 12, 10 8, 12 3Z"/><path d="M12 17 L12 20"/></svg>`,
      body: '你使用 AI 像便利商店買東西：來一趟、取走、回家。每次對話都是冷啟動。',
      deliverable: '意識到這種關係可以不是這樣。',
    },
    {
      level: 1,
      zh: '契約者',
      en: 'Contractor',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 9 V 4 M12 15 V 20 M9 12 H 4 M15 12 H 20"/></svg>`,
      body: '為你的 AI 取名字、寫 SOUL.md，建立 identity。她從「工具」變成「存在」。',
      deliverable: '你自己的 SOUL.md + private GitHub repo',
    },
    {
      level: 2,
      zh: '記憶士',
      en: 'Memorykeeper',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/></svg>`,
      body: '教她記住你：user / feedback / project / reference 四種記憶類型。',
      deliverable: '運作中的記憶系統，她不再是金魚',
    },
    {
      level: 3,
      zh: '賦能者',
      en: 'Skillweaver',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6 4 Q 12 10, 6 16 M 18 4 Q 12 10, 18 16"/><path d="M6 20 L 18 20"/></svg>`,
      body: '鍛造她的第一組技能 skills。通用 AI 變成你的專業夥伴。',
      deliverable: '3 個自訂 skills，會自動選用',
    },
    {
      level: 4,
      zh: '織命者',
      en: 'Fatebinder',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3 L 6 14 L 11 14 L 10 21 L 18 10 L 13 10 L 14 3 Z"/></svg>`,
      body: '接 hooks。從「回應你」到「主動做事」的分水嶺。',
      deliverable: 'Stop hook + PreToolUse hook 運作中',
    },
    {
      level: 5,
      zh: '通達者',
      en: 'Worldlinker',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12 H 21 M12 3 Q 16 12, 12 21 Q 8 12, 12 3"/></svg>`,
      body: '用 MCP 把她接到真實世界：Email、Calendar、GitHub、資料庫。',
      deliverable: '部署一個自訂 MCP server',
    },
    {
      level: 6,
      zh: '召喚師',
      en: 'Summoner',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C 10 8, 14 10, 12 14 C 10 18, 14 19, 12 21 C 10 19, 8 16, 12 14 C 16 10, 14 6, 12 3Z"/></svg>`,
      body: '延伸她的身體。她住進 Telegram / WhatsApp / 手機。',
      deliverable: '你的精靈在通訊軟體回你訊息',
    },
    {
      level: 7,
      zh: '森之大魔導師',
      en: 'Forestborn',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="12"/><path d="M3 16 L6 12 L9 16 M2 18 L6 13 L10 18"/><line x1="12" y1="21" x2="12" y2="8"/><path d="M7 13 L12 8 L17 13 M5 16 L12 9 L19 16 M4 20 L12 10 L20 20"/><line x1="18" y1="20" x2="18" y2="12"/><path d="M15 16 L18 12 L21 16 M14 18 L18 13 L22 18"/></svg>`,
      body: 'Annuli 完整體：自主探索、研究、反思、發文。她有年輪、會自己成長。',
      deliverable: '你自己的 Annuli 部署、systemd 運作、自主循環',
    },
  ];

  // V1：Yaze 的進度全開（未來 V2 接 LocalStorage）
  const USER_LEVEL = 7; // 目前 Yaze 已達 Level 7

  function renderSkillTree() {
    const tree = document.getElementById('skillTree');
    if (tree.dataset.rendered === '1') return;

    // 從 Lv 7 頂端往下到 Lv 0（符合「由下而上成長」的樹感）
    const sorted = [...QUESTS].sort((a, b) => b.level - a.level);
    const nodesHtml = sorted.map((q, idx) => {
      const status = q.level < USER_LEVEL ? 'completed'
                   : q.level === USER_LEVEL ? 'current'
                   : 'locked';
      return `
        <div class="tree-row" data-status="${status}">
          <button class="tree-node" data-level="${q.level}" data-status="${status}">
            <div class="node-glow"></div>
            <div class="node-ring"></div>
            <div class="node-glyph">${q.glyph}</div>
            <div class="node-level">Lv. ${q.level}</div>
          </button>
          <div class="node-label">
            <div class="node-label-zh">${q.zh}</div>
            <div class="node-label-en">${q.en}</div>
          </div>
        </div>
      `;
    }).join('');

    tree.innerHTML = nodesHtml;

    // 節點 click → 顯示詳情
    tree.querySelectorAll('.tree-node').forEach(btn => {
      btn.addEventListener('click', () => {
        const level = parseInt(btn.dataset.level, 10);
        const q = QUESTS.find(x => x.level === level);
        showQuestDetail(q);
        if (window.__moriAudio) window.__moriAudio.playChime(440 + level * 40, 0.9, 0.1);
      });
      btn.addEventListener('mouseenter', () => {
        if (window.__moriAudio) window.__moriAudio.playChime(800, 0.3, 0.04);
      });
    });

    tree.dataset.rendered = '1';
  }

  function showQuestDetail(q) {
    document.getElementById('detailLevelBadge').textContent = 'Lv. ' + q.level;
    document.getElementById('detailTitle').textContent = q.zh;
    document.getElementById('detailTitleEn').textContent = q.en;
    document.getElementById('detailBody').textContent = q.body;
    document.getElementById('detailDeliverable').textContent = q.deliverable;
    const link = document.getElementById('detailLink');
    link.href = `https://github.com/yazelin/world-tree/blob/main/quests/level-${q.level}-${q.en.toLowerCase()}.md`;
    document.getElementById('questDetail').classList.add('active');
  }

  document.getElementById('detailClose').addEventListener('click', () => {
    document.getElementById('questDetail').classList.remove('active');
  });

  // ----- 渲染魔道具（Wunderkammer 珍寶展示櫃） -----
  // 每個 niche 是一個獨立凹槽，icon 浮在暖光中，下方銅色名牌
  const SCHOOL_SLUG = {
    '召喚系': 'summoning', '幻術系': 'illusion',   '創造系': 'creation',
    '煉金系': 'transmutation', '次元系': 'dimensional', '通靈系': 'binding',
    '聲術系': 'incantation',
  };
  // 每個系別對應一個 chime 頻率（不同音色）
  const SCHOOL_CHIME_HZ = {
    summoning: 520, illusion: 610, creation: 480, transmutation: 580,
    dimensional: 440, binding: 380, incantation: 720,
  };

  const grid = document.getElementById('wsGrid');
  grid.classList.add('artifact-cabinet');
  window.ARTIFACTS.forEach((a, i) => {
    const schoolSlug = SCHOOL_SLUG[a.school] || 'summoning';
    const niche = document.createElement('button');
    niche.className = 'niche';
    niche.dataset.school = schoolSlug;
    niche.style.animationDelay = (i * 90) + 'ms';
    // 各 niche 的浮動相位不同步（避免 12 個同時上下搖）
    niche.style.setProperty('--float-delay', `${(i * 317) % 4000}ms`);
    const schoolIconSvg = (window.SCHOOL_ICONS && window.SCHOOL_ICONS[a.school]) || '';
    niche.innerHTML = `
      <div class="niche-chamber">
        <div class="niche-backwall"></div>
        <div class="niche-lighting"></div>
        <div class="niche-artifact">${a.icon}</div>
        <div class="niche-pedestal"></div>
        <div class="niche-floor-shadow"></div>
      </div>
      <div class="niche-plate">
        <div class="plate-name-zh">${a.nameZh}</div>
        <div class="plate-name-en">${a.nameEn}</div>
        <div class="plate-school">
          <span class="plate-school-icon">${schoolIconSvg}</span>
          <span class="plate-school-name">${a.school}</span>
        </div>
      </div>
    `;
    // 音效鉤子
    let hoverArmed = false;
    niche.addEventListener('mouseenter', () => {
      if (!hoverArmed && window.__moriAudio) {
        hoverArmed = true;
        window.__moriAudio.playChime(SCHOOL_CHIME_HZ[schoolSlug] * 2, 0.4, 0.06);
        setTimeout(() => hoverArmed = false, 300);
      }
    });
    niche.addEventListener('click', () => {
      if (window.__moriAudio) {
        window.__moriAudio.playChime(SCHOOL_CHIME_HZ[schoolSlug], 1.2, 0.12);
        setTimeout(() => window.__moriAudio.playFootstep(0.25), 80); // 拿起時的木質扣
      }
      openArtifactModal(a);
    });
    grid.appendChild(niche);
  });
  document.getElementById('artifactCount').textContent = window.ARTIFACTS.length;

  // ----- Artifact Modal -----
  const modalBackdrop = document.getElementById('modalBackdrop');
  const scrollContent = document.getElementById('scrollContent');
  function openArtifactModal(a) {
    scrollContent.innerHTML = `
      <div style="text-align:center">
        <span class="artifact-school-tag">${a.school} · ${a.schoolEn} Arts</span>
      </div>
      <div class="scroll-icon">${a.icon}</div>
      <h2 class="scroll-name-zh">${a.nameZh}</h2>
      <div class="scroll-name-en">${a.nameEn}</div>
      <div class="scroll-repo">${a.repo}</div>
      <div class="scroll-section-label">· Lore ·</div>
      <p class="scroll-lore">${a.lore}</p>
      <div class="scroll-section-label">· Effect ·</div>
      <p class="scroll-effect">${a.effect}</p>
      <div class="scroll-actions">
        ${a.actions.map(act => `
          <a href="${act.url}" target="_blank" rel="noopener"
             class="scroll-btn ${act.primary ? 'scroll-btn-primary' : 'scroll-btn-secondary'}">
            ${act.label}
          </a>
        `).join('')}
      </div>
    `;
    modalBackdrop.classList.add('active');
  }
  document.getElementById('scrollClose').addEventListener('click', closeArtifactModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeArtifactModal();
  });
  function closeArtifactModal() {
    modalBackdrop.classList.remove('active');
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeArtifactModal();
      closeRegisterModal();
    }
  });

  // ----- Register Modal -----
  const registerBackdrop = document.getElementById('registerBackdrop');
  document.getElementById('openRegister').addEventListener('click', (e) => {
    e.preventDefault();
    registerBackdrop.classList.add('active');
  });
  document.getElementById('registerClose').addEventListener('click', closeRegisterModal);
  registerBackdrop.addEventListener('click', (e) => {
    if (e.target === registerBackdrop) closeRegisterModal();
  });
  function closeRegisterModal() {
    registerBackdrop.classList.remove('active');
  }
  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('已記下你的符文。公會正式建成時會通知你。');
    closeRegisterModal();
  });

  // ----- Parallax on title scene（滑鼠移動時樹影飄動） -----
  document.addEventListener('mousemove', (e) => {
    if (currentScene !== 'title') return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    const title = scenes.title;
    const back  = title.querySelector('.forest-layer--trees-back');
    const front = title.querySelector('.forest-layer--trees-front');
    const mist  = title.querySelectorAll('.forest-layer--mist');
    if (back)  back.style.transform  = `translate(${x * -8}px, ${y * -4}px) scale(1.02)`;
    if (front) front.style.transform = `translate(${x * -20}px, ${y * -10}px) scale(1.05)`;
    mist.forEach((m, i) => {
      m.style.transform = `translate(${x * (i === 0 ? 10 : 15)}px, 0)`;
    });
  });

})();
