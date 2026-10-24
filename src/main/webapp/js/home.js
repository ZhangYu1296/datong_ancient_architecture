/* =========================================================
 * 首页（剧情化新版）
 * 剧情开篇 Hero（粒子背景 + 短视频旁白精简版）+ 6 张闯关卡片
 * 存档系统复用 Progress（localStorage），与短视频闯关设定闭环
 * ======================================================= */

(() => {
  "use strict";
  const NUM_CN = ["壹", "贰", "叁", "肆", "伍", "陆"];

  /* ---------- 顶栏 & 存档进度 ---------- */
  function renderProgress() {
    document.getElementById("fragNum").textContent =
      `${Progress.collectedCount()}/${Progress.TOTAL}`;
    const pips = document.getElementById("fragPips");
    pips.innerHTML = "";
    Progress.load().fragments.forEach(f => {
      const i = document.createElement("i");
      if (f) i.classList.add("on");
      pips.appendChild(i);
    });
    const done = Progress.load().levels.filter(l => l.finish).length;
    document.getElementById("saveInfo").textContent =
      `存档：碎片 ${Progress.collectedCount()}/6 · 已通关 ${done} 关`;
  }
  renderProgress();

  /* ---------- 6 张闯关卡片 ---------- */
  const grid = document.getElementById("gateGrid");

  function renderCards() {
    grid.innerHTML = "";
    LEVELS.forEach(cfg => {
      const unlocked = Progress.isUnlocked(cfg.id);
      const finished = Progress.isFinished(cfg.id);
      const card = document.createElement("div");
      card.className = "gate-card " + (finished ? "finished" : unlocked ? "unlocked" : "locked");
      card.innerHTML = `
        <div class="gc-pop">
          <img src="images/preview${cfg.id}.jpg" alt="${cfg.name}预览">
          <p>${cfg.desc}</p>
        </div>
        <div class="gc-top">
          <span class="gc-num">${NUM_CN[cfg.id - 1]}</span>
          <span class="gc-state">${finished ? "✔ 已通关" : unlocked ? "可进入 ▸" : "🔒 未解锁"}</span>
        </div>
        <div class="gc-name">${cfg.name}</div>
        <div class="gc-dyn">${cfg.dynasty} · ${cfg.period}</div>
        <div class="gc-line"></div>
        <div class="gc-hint">${finished ? "点击回看本关" : unlocked ? "点击进入探索" : "完成上一关自动解锁"}</div>
      `;
      card.addEventListener("click", () => {
        if (unlocked) {
          Sound.whoosh();
          setTimeout(() => { location.href = `play.html?v=${cfg.id}`; }, 320);
        } else {
          NPC.show({ lines: [`「${cfg.name}」尚未开启。`, "闯过上一关，碎片之力会自动解开这里的封印。"] });
        }
      });
      grid.appendChild(card);
    });
  }
  renderCards();

  /* ---------- Hero 旁白逐字打印（短视频开场文案精简版） ---------- */
  const voBox = document.getElementById("heroVo");
  let li = 0, ci = 0, curP = null;
  (function typeVO() {
    if (li >= VO_OPENING.length) return;
    if (ci === 0) { curP = document.createElement("p"); voBox.appendChild(curP); }
    ci++;
    curP.textContent = VO_OPENING[li].slice(0, ci);
    if (ci >= VO_OPENING[li].length) { li++; ci = 0; setTimeout(typeVO, 750); }
    else setTimeout(typeVO, 48);
  })();

  /* ---------- 粒子背景 + 环境音效 ---------- */
  Particles.init(document.getElementById("heroParticles"), { count: 130 });
  /* 浏览器自动播放策略：首次交互后启动粒子嗡鸣环境音 */
  document.addEventListener("pointerdown", () => Sound.hum(), { once: true });

  /* 静音开关 */
  const btnSound = document.getElementById("btnSound");
  const syncSound = () => { btnSound.textContent = Sound.muted() ? "🔇" : "🔊"; };
  syncSound();
  btnSound.addEventListener("click", () => { Sound.toggle(); syncSound(); });

  /* ---------- 【开启漫游】穿越触发 → 古建漫游地图（蜿蜒路线六景点） ---------- */
  document.getElementById("btnStart").addEventListener("click", () => {
    Sound.whoosh();
    setTimeout(() => { location.href = "map.html"; }, 380);
  });

  /* ---------- 佛小伴开场（首页专属文案） ---------- */
  setTimeout(() => NPC.show({
    lines: [
      "施主，欢迎来到大同古建漫游！",
      "点击【开启漫游】进入古建地图，或直接点击下方卡片，开始第一关吧！"
    ]
  }), 600);

  /* ---------- 重置存档 ---------- */
  document.getElementById("btnReset").addEventListener("click", () => {
    if (confirm("确定清空全部闯关存档，重新开始副本吗？")) {
      Progress.reset();
      renderProgress();
      renderCards();
      NPC.show({ lines: ["存档已清空，一切从头开始。", "第一关「云冈石窟」已重新开启，出发吧！"] });
    }
  });
})();
