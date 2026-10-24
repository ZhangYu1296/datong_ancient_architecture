/* =========================================================
 * 佛小伴 NPC 弹窗组件（全站复用）
 * 用法：NPC.show({ lines: ["台词1","台词2"], onDone: fn })
 * 台词逐字打印；点击卡片区切换下一句；播完自动收起为悬浮小佛。
 * ======================================================= */

const NPC = (() => {
  let card = null, miniBtn = null, textEl = null, nextEl = null;
  let lines = [], idx = 0, typing = false, timer = null, onDone = null;

  /* 佛小伴官方形象（毛绒挂件同款矢量重绘）：盘发小髻 + 大耳 + 合十 + 薄荷衣 + 粉莲座 */
  const MASCOT_SVG = `
  <svg viewBox="0 0 64 64" width="46" height="46" aria-hidden="true">
    <!-- 耳朵（后层） -->
    <ellipse cx="13.5" cy="29" rx="5.6" ry="8.2" fill="#fdfaf4" stroke="#c9a887" stroke-width="1.1" transform="rotate(-9 13.5 29)"/>
    <ellipse cx="13.9" cy="29.5" rx="3.1" ry="5.2" fill="#f0d9b8" transform="rotate(-9 13.9 29.5)"/>
    <ellipse cx="50.5" cy="29" rx="5.6" ry="8.2" fill="#fdfaf4" stroke="#c9a887" stroke-width="1.1" transform="rotate(9 50.5 29)"/>
    <ellipse cx="50.1" cy="29.5" rx="3.1" ry="5.2" fill="#f0d9b8" transform="rotate(9 50.1 29.5)"/>
    <!-- 脸 -->
    <circle cx="32" cy="28" r="15.5" fill="#fdfaf4" stroke="#d9c3a6" stroke-width="1"/>
    <!-- 盘发 -->
    <path d="M16.6,25.5 Q15.5,11.5 32,10.8 Q48.5,11.5 47.4,25.5 Q42,19.6 32,19.6 Q22,19.6 16.6,25.5 Z"
          fill="#6b4a35" stroke="#553a28" stroke-width="1"/>
    <path d="M20,17.5 Q24,12.6 30,12.1" fill="none" stroke="#8a6446" stroke-width="1" stroke-linecap="round" opacity=".6"/>
    <!-- 小髻 -->
    <circle cx="32" cy="8.6" r="4.1" fill="#6b4a35" stroke="#553a28" stroke-width="1"/>
    <path d="M30.4,6.4 q1.6,-1 3.2,0" fill="none" stroke="#8a6446" stroke-width="1" stroke-linecap="round"/>
    <!-- 五官 -->
    <path d="M24.2,27.6 q2.6,2.5 5.2,0" fill="none" stroke="#5a4030" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M34.6,27.6 q2.6,2.5 5.2,0" fill="none" stroke="#5a4030" stroke-width="1.7" stroke-linecap="round"/>
    <circle cx="32" cy="31.3" r="0.9" fill="#8a6446"/>
    <path d="M29.6,33.8 q2.4,2 4.8,0" fill="none" stroke="#5a4030" stroke-width="1.5" stroke-linecap="round"/>
    <!-- 腮红 -->
    <ellipse cx="21.6" cy="32.4" rx="3.3" ry="2.2" fill="#f2a0a0" opacity=".8"/>
    <ellipse cx="42.4" cy="32.4" rx="3.3" ry="2.2" fill="#f2a0a0" opacity=".8"/>
    <!-- 身体（薄荷绿衣） -->
    <path d="M22.5,42.5 Q32,39 41.5,42.5 L43.2,53.5 Q32,58 20.8,53.5 Z"
          fill="#7fd0c0" stroke="#5cb8a8" stroke-width="1.1"/>
    <path d="M22.9,44.5 q9.1,-3.2 18.2,0" fill="none" stroke="#5cb8a8" stroke-width="1"/>
    <!-- 合十的双手 -->
    <ellipse cx="30.4" cy="45.8" rx="2.7" ry="4.6" fill="#fdfaf4" stroke="#c9a887" stroke-width="1" transform="rotate(-16 30.4 45.8)"/>
    <ellipse cx="33.6" cy="45.8" rx="2.7" ry="4.6" fill="#fdfaf4" stroke="#c9a887" stroke-width="1" transform="rotate(16 33.6 45.8)"/>
    <!-- 粉色莲花座 -->
    <ellipse cx="22.6" cy="55.6" rx="4.6" ry="3" fill="#ee9cb0" transform="rotate(-18 22.6 55.6)"/>
    <ellipse cx="41.4" cy="55.6" rx="4.6" ry="3" fill="#ee9cb0" transform="rotate(18 41.4 55.6)"/>
    <ellipse cx="32" cy="57.2" rx="7.6" ry="3.6" fill="#f2a2b0" stroke="#e88aa0" stroke-width="1"/>
  </svg>`;

  /* =========================================================
   * 语音配音：幼稚男童声（Web Speech 合成）
   * 策略：优先选 zh-CN 男声，音调 pitch 调高模拟童声
   * ======================================================= */
  let zhVoice = null;

  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;
    const zh = voices.filter(v => /^zh/i.test(v.lang));
    // 优先常见中文男声（Windows: Kangkang；Edge: Yunxi/Yunjian/Yunyang）
    zhVoice = zh.find(v => /kangkang|yunxi|yunjian|yunyang|male|男/i.test(v.name)) ||
              zh.find(v => /xiaoyou|child|童/i.test(v.name)) ||
              zh[0] || null;
  }
  if ("speechSynthesis" in window) {
    pickVoice();
    speechSynthesis.addEventListener("voiceschanged", pickVoice);
  }

  function speakLine(text) {
    if (!("speechSynthesis" in window)) return;
    // 与全局音效静音状态联动（audio.js 存在时）
    if (window.Sound && typeof Sound.muted === "function" && Sound.muted()) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN";
    if (zhVoice) u.voice = zhVoice;
    u.pitch = 1.85;   // 音调拉高 → 幼稚感
    u.rate  = 1.08;   // 稍快，贴合小沙弥活泼人设
    u.volume = 1;
    speechSynthesis.speak(u);
  }

  function stopSpeak() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }

  function ensureDom() {
    if (card) return;
    card = document.createElement("div");
    card.className = "npc-card";
    card.innerHTML = `
      <button class="npc-close" title="关闭" aria-label="关闭">&times;</button>
      <div class="npc-head">
        <div class="npc-avatar">${MASCOT_SVG}</div>
        <div class="npc-name">佛小伴<span>· 守塔小沙弥</span></div>
      </div>
      <div class="npc-text"></div>
      <div class="npc-next">点击继续 ▾</div>
    `;
    document.body.appendChild(card);
    textEl = card.querySelector(".npc-text");
    nextEl = card.querySelector(".npc-next");
    card.querySelector(".npc-close").addEventListener("click", (e) => {
      e.stopPropagation(); closeCard(true);
    });
    card.addEventListener("click", next);

    /* 收起后的悬浮小佛按钮 */
    miniBtn = document.createElement("button");
    miniBtn.className = "npc-mini";
    miniBtn.title = "召唤佛小伴";
    miniBtn.innerHTML = MASCOT_SVG;
    miniBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (lines.length) showCurrent(); else NPC.show({ lines: ["施主，有何吩咐？"] });
    });
    document.body.appendChild(miniBtn);
  }

  function showCurrent() {
    card.classList.add("show");
    miniBtn.classList.remove("show");
    typeLine();
  }

  function typeLine() {
    const text = lines[idx] || "";
    typing = true;
    speakLine(text);          // 每句台词同步童声配音
    textEl.textContent = "";
    nextEl.style.visibility = "hidden";
    clearInterval(timer);
    let i = 0;
    timer = setInterval(() => {
      textEl.textContent = text.slice(0, ++i);
      if (i >= text.length) finishTyping();
    }, 32);
  }

  function finishTyping() {
    clearInterval(timer);
    typing = false;
    textEl.textContent = lines[idx] || "";
    nextEl.textContent = (idx < lines.length - 1) ? "点击继续 ▾" : "点击收起 ×";
    nextEl.style.visibility = "visible";
  }

  function next(e) {
    if (e) e.stopPropagation();
    if (typing) { finishTyping(); return; }
    if (idx < lines.length - 1) { idx++; typeLine(); }
    else closeCard(true);
  }

  function closeCard(finished) {
    clearInterval(timer);
    typing = false;
    stopSpeak();              // 收起弹窗即停声
    card.classList.remove("show");
    miniBtn.classList.add("show");
    if (finished && onDone) { const cb = onDone; onDone = null; cb(); }
  }

  return {
    /* 打开一段对话。opts: { lines:[], onDone:fn, autoCloseMs:number } */
    show(opts) {
      ensureDom();
      lines = (opts && opts.lines) || [];
      onDone = (opts && opts.onDone) || null;
      idx = 0;
      showCurrent();
      if (opts && opts.autoCloseMs) {
        setTimeout(() => { if (card.classList.contains("show")) closeCard(true); }, opts.autoCloseMs);
      }
    },
    /* 隐藏（不触发 onDone） */
    hide() { if (card) closeCard(false); },
    /* 返回佛小伴 SVG，供其他页面内嵌使用 */
    mascotSvg: MASCOT_SVG
  };
})();
