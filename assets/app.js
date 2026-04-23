// ===========================================================
// 森之召喚師工坊 · 主程式
// Vanilla JS，無依賴
// ===========================================================

(function() {
  'use strict';

  // ----- Scene 管理 -----
  const scenes = {
    boot:     document.getElementById('sceneBoot'),
    title:    document.getElementById('sceneTitle'),
    path:     document.getElementById('scenePath'),
    door:     document.getElementById('sceneDoor'),
    workshop: document.getElementById('sceneWorkshop'),
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

  // ----- 環境音（Web Audio API 生成 drone） -----
  let audioCtx, droneNodes = [];
  let audioOn = false;
  const audioToggle = document.getElementById('audioToggle');
  const iconOn  = audioToggle.querySelector('.audio-icon--on');
  const iconOff = audioToggle.querySelector('.audio-icon--off');

  function startAmbient() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const master = audioCtx.createGain();
      master.gain.value = 0.04;
      master.connect(audioCtx.destination);

      // 三個 sine 低頻，微微飄動，製造遠方風聲感
      [55, 82.4, 110].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        lfo.frequency.value = 0.08 + i * 0.03;
        lfoGain.gain.value = 1 + i * 0.3;
        gain.gain.value = 0.3 - i * 0.08;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        osc.connect(gain);
        gain.connect(master);
        osc.start();
        lfo.start();
        droneNodes.push({ osc, lfo, gain });
      });

      // 高頻 shimmer（偶爾出現）
      setInterval(() => {
        if (!audioOn || !audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800 + Math.random() * 400;
        const now = audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.02, now + 0.5);
        gain.gain.linearRampToValueAtTime(0, now + 3);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + 3);
      }, 8000);
    } catch (e) {
      console.warn('Audio unavailable', e);
    }
  }
  function stopAmbient() {
    if (!audioCtx) return;
    droneNodes.forEach(n => { try { n.osc.stop(); n.lfo.stop(); } catch(e){} });
    droneNodes = [];
    audioCtx.close();
    audioCtx = null;
  }

  audioToggle.addEventListener('click', () => {
    audioOn = !audioOn;
    if (audioOn) {
      startAmbient();
      iconOn.style.display  = 'block';
      iconOff.style.display = 'none';
    } else {
      stopAmbient();
      iconOn.style.display  = 'none';
      iconOff.style.display = 'block';
    }
  });

  // ----- Boot → Title 自動推進 -----
  setTimeout(() => gotoScene('title'), 1800);

  // ----- Title: Enter 按鈕 → Path → Door -----
  document.getElementById('enterBtn').addEventListener('click', () => {
    gotoScene('path');
    // Path 播放 5 秒後進 door
    setTimeout(() => gotoScene('door'), 5200);
  });

  // ----- Door: 推開 → Workshop -----
  document.getElementById('doorBtn').addEventListener('click', () => {
    scenes.door.classList.add('opening');
    setTimeout(() => gotoScene('workshop'), 2200);
  });

  // ----- Workshop: 返回 → Title -----
  document.getElementById('wsBack').addEventListener('click', () => {
    gotoScene('title');
    scenes.door.classList.remove('opening');
  });

  // ----- 渲染魔道具 -----
  const grid = document.getElementById('wsGrid');
  window.ARTIFACTS.forEach((a, i) => {
    const card = document.createElement('button');
    card.className = 'artifact-card';
    card.style.animationDelay = (i * 80) + 'ms';
    card.innerHTML = `
      <div class="artifact-school">${a.school}</div>
      <div class="artifact-icon-wrap">
        <div class="artifact-icon">${a.icon}</div>
      </div>
      <div class="artifact-name-zh">${a.nameZh}</div>
      <div class="artifact-name-en">${a.nameEn}</div>
      <div class="artifact-preview">${a.effect}</div>
    `;
    card.addEventListener('click', () => openArtifactModal(a));
    grid.appendChild(card);
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
