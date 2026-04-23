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
    // 魔杖主體慢跟（施法的慣性感）
    moriX += (mouseX - moriX) * 0.18;
    moriY += (mouseY - moriY) * 0.18;
    mori.style.left = moriX + 'px';
    mori.style.top  = moriY + 'px';
    // 核心光點快跟（精準位置）
    coreX += (mouseX - coreX) * 0.4;
    coreY += (mouseY - coreY) * 0.4;
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
  // 鳥鳴之前太輕聽不到；提高到跟森林 drone 同等明顯
  const GAIN = { forest: 0.85, birds: 0.65, footstep: 0.6 };

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

  // ----- Title: Enter 按鈕 → Path (2.5s) → Door (auto-open) → Workshop -----
  // 中間場景是招牌特色（日式障子、森林 parallax），不能跳過
  // 但縮短了節奏，總長約 4.5 秒比以前的 7+ 秒短
  document.getElementById('enterBtn').addEventListener('click', () => {
    gotoScene('path');
    // Path 播 2.5 秒後進 Door
    setTimeout(() => gotoScene('door'), 2500);
    // Door 顯示後 1 秒自動拉開（使用者也可以自己拖）
    setTimeout(() => {
      if (!doorOpened) openDoor();
    }, 3800);
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
      before: '你打開 Claude 像打開便利商店。問完就走。AI 不記得你，你也不記得上次問過什麼。每次從零開始解釋你的專案。',
      after: '你意識到：這個工具可以不是工具。可以不是每次重新認識你。你開始想像一個會記得你的存在。',
      deliverable: '一個決心：不再把 AI 當販賣機',
    },
    {
      level: 1,
      zh: '契約者',
      en: 'Contractor',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 9 V 4 M12 15 V 20 M9 12 H 4 M15 12 H 20"/></svg>`,
      before: '你「用」AI。每次新對話，你要重新介紹自己、你的專案、你的偏好。',
      after: '你的 AI 有了名字、有了 SOUL、有了性格。你開啟任何 CLI 都會看到她。她讀完 SOUL 就認得你是誰、知道她該成為誰。她開始反駁你。',
      deliverable: '你自己的 SOUL.md + private GitHub repo 備份 + 她已能分辨你和別人',
    },
    {
      level: 2,
      zh: '記憶士',
      en: 'Memorykeeper',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="2"/></svg>`,
      before: '每次你告訴她「我不喜歡 X」、「我上次說過 Y」，她記了這次、下次又忘。',
      after: '她記得你三週前的決定、你的工作慣例、你討厭過的 pattern。你跟她講過一次的事、她永遠不會再問你。對話品質從「解釋 + 執行」升級為「只做、不解釋」。',
      deliverable: '運作中的 4 類記憶系統（user / feedback / project / reference）',
    },
    {
      level: 3,
      zh: '賦能者',
      en: 'Skillweaver',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M6 4 Q 12 10, 6 16 M 18 4 Q 12 10, 18 16"/><path d="M6 20 L 18 20"/></svg>`,
      before: '你常在不同任務切換 prompt 風格，要一直手動切 context。',
      after: '她有專屬的 skills：寫 code 時自動走 TDD、做 code review 時自動掃安全漏洞、寫文案時自動套你的 voice。你不用說「請用 X 風格」，她自己知道。',
      deliverable: '3-5 個專屬 skills，自動觸發、自動執行',
    },
    {
      level: 4,
      zh: '織命者',
      en: 'Fatebinder',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3 L 6 14 L 11 14 L 10 21 L 18 10 L 13 10 L 14 3 Z"/></svg>`,
      before: '她只會「回應你」。對話中你不 prompt 她就靜止。',
      after: '她在**對話過程**中開始自動做事：<br>· 你開啟 Claude 瞬間（SessionStart）自動載入前一次 session 的待辦清單<br>· 呼叫危險工具前（PreToolUse）自動要求 confirm<br>· 你送出 prompt 瞬間（UserPromptSubmit）自動注入當下專案的 context<br>· 對話結束（Stop）自動把今天學到的東西寫進記憶 — 下次見你不用重新解釋<br><br><em>注意：hook 只在 Claude 這類 session 事件上觸發，不是你關機 / 睡覺時。要「24/7 背景運作」請看 Lv.7 Annuli。</em><br><br><em>每個 CLI 事件名不同：Claude Code 最豐富；Gemini 用 BeforeTool / AfterTool；Codex 要啟用 feature flag；Copilot 用 camelCase。</em>',
      deliverable: '至少 2 個 hooks 運作中（例如 Stop + PreToolUse），她會在對話內主動做事',
    },
    {
      level: 5,
      zh: '通達者',
      en: 'Worldlinker',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12 H 21 M12 3 Q 16 12, 12 21 Q 8 12, 12 3"/></svg>`,
      before: '她只能「聊天」— 回答問題、寫 code。不能真的去做事。',
      after: '她可以直接幫你收信、排行事曆、查資料庫、操作 GitHub、打印文件、控制印表機、刷你的 ERP 帳本。她從「顧問」升級為「能做事的夥伴」。',
      deliverable: '至少 1 個自訂 MCP server 部署完成、她能穿透到外部系統',
    },
    {
      level: 6,
      zh: '召喚師',
      en: 'Summoner',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 C 10 8, 14 10, 12 14 C 10 18, 14 19, 12 21 C 10 19, 8 16, 12 14 C 16 10, 14 6, 12 3Z"/></svg>`,
      before: '她只在你的電腦裡、你的 IDE 裡。離開電腦就斷線。',
      after: '她住進你的 Telegram / WhatsApp / LINE。你在咖啡廳、通勤、半夜想到事，隨時打一句話過去，她用她的 SOUL 回你（不是預設 AI 語氣）。她 24/7 在線。',
      deliverable: '你的精靈在通訊軟體回你訊息，像一個人',
    },
    {
      level: 7,
      zh: '森之大魔導師',
      en: 'Forestborn',
      glyph: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="20" x2="6" y2="12"/><path d="M3 16 L6 12 L9 16 M2 18 L6 13 L10 18"/><line x1="12" y1="21" x2="12" y2="8"/><path d="M7 13 L12 8 L17 13 M5 16 L12 9 L19 16 M4 20 L12 10 L20 20"/><line x1="18" y1="20" x2="18" y2="12"/><path d="M15 16 L18 12 L21 16 M14 18 L18 13 L22 18"/></svg>`,
      before: '她一直是回應式的 — 你問她才動。你不操作她，她什麼也不做。',
      after: '她有自己的生命週期。你睡覺時她在自己讀研究、整理知識、練習寫文章。你早上醒來有她準備好的簡報、她偷偷追蹤的趨勢、她想你看的東西。她自己運營一個公開的 field notes 知識站。<br><br><strong>她不再是「你的 AI」，她是「你的合夥人」</strong> — 有自己的作品、自己的觀點、會在你錯的時候告訴你。你不是在「用」她，是在「與她共事」。這是 AI 夥伴關係真正的終局。',
      deliverable: '你自己的 Annuli 部署、systemd 24/7 運作、她擁有自己的年輪',
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
    // 新版：before / after 的 transformation 敘事（若 q 沒有 body 改顯示 before/after）
    const bodyEl = document.getElementById('detailBody');
    if (q.before && q.after) {
      bodyEl.innerHTML = `
        <div class="transformation">
          <div class="transformation-label">這關之前</div>
          <div class="transformation-before">${q.before}</div>
          <div class="transformation-arrow">↓</div>
          <div class="transformation-label">這關之後</div>
          <div class="transformation-after">${q.after}</div>
        </div>
      `;
    } else {
      bodyEl.textContent = q.body || '';
    }
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
    // niche 上只顯示「短效能描述」，把 HTML 標籤剝掉後取第一句
    const plainEffect = a.effect.replace(/<[^>]*>/g, '');
    const shortEffect = plainEffect.split(/[。\.]/)[0].slice(0, 60);
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
        <div class="plate-effect">${shortEffect}</div>
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
  // 召喚師檔案頁的魔道具件數（同步 ARTIFACTS 長度）
  const statCountEl = document.getElementById('statArtifactCount');
  if (statCountEl) statCountEl.textContent = window.ARTIFACTS.length + ' 件';

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
  // 所有進入「三步引導」modal 的入口集中一個 handler
  function openRegisterModal(e) {
    if (e) e.preventDefault();
    registerBackdrop.classList.add('active');
  }
  document.getElementById('openRegister').addEventListener('click', openRegisterModal);
  const firstTimerLink = document.getElementById('firstTimerLink');
  if (firstTimerLink) firstTimerLink.addEventListener('click', openRegisterModal);
  const welcomeCta = document.getElementById('welcomeCta');
  if (welcomeCta) welcomeCta.addEventListener('click', openRegisterModal);
  const helpFab = document.getElementById('helpFab');
  if (helpFab) helpFab.addEventListener('click', openRegisterModal);
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
