/* =========================================================
 * 通关结局页
 * 六块碎片从四面八方飞入汇聚 → 全景点亮 → 佛小伴最终台词
 * ======================================================= */

(() => {
  "use strict";

  /* 未集齐则不允许停留 */
  if (!Progress.allDone()) {
    location.replace("index.html");
    return;
  }
  Progress.markEndingSeen();

  const stage = document.getElementById("endingStage");
  const panorama = document.getElementById("panorama");

  /* 全景背景（国风水彩大同古城） */
  panorama.style.backgroundImage = `url("https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent("Chinese guofeng watercolor panorama of Datong ancient city, grand temple halls, pagoda, glazed nine dragon wall and city gate tower under golden sunset clouds, birds, mist")}&image_size=landscape_16_9")`;

  /* ---------- 碎片生成与汇聚 ---------- */
  const fragEls = [];
  LEVELS.forEach((cfg, i) => {
    const el = document.createElement("img");
    el.className = "fly-shard";
    el.alt = cfg.fragment.name;
    /* 初始位置：屏幕四周随机 */
    const W = innerWidth, H = innerHeight;
    const side = i % 4;
    const sx = side === 0 ? -120 : side === 1 ? W + 40 : Math.random() * W;
    const sy = side === 2 ? -120 : side === 3 ? H + 40 : Math.random() * H;
    el.style.left = sx + "px";
    el.style.top = sy + "px";
    el.style.transform = `rotate(${(Math.random() * 300 - 150).toFixed(0)}deg) scale(${(0.5 + Math.random() * 0.5).toFixed(2)})`;
    stage.appendChild(el);
    fragEls.push(el);

    /* 3D 碎片快照（圆形刻印样式） */
    requestAnimationFrame(() => {
      el.src = Buildings.snapshot(
        (color) => Buildings.buildFragment(color, true),
        { width: 240, height: 240, sky: 0x6f4a28,   // 统一棕色背景
          ground: 0x5d3f22, glow: true, color: cfg.fragment.color }
      );
      el.style.borderRadius = "50%";
      el.style.border = "3px solid rgba(240,201,79,.9)";
      el.style.boxShadow = "0 0 16px rgba(240,201,79,.9), inset 0 0 12px rgba(240,201,79,.5)";
      el.style.objectFit = "cover";
    });
  });

  /* 汇聚目标：屏幕中心环形排布 */
  function gather() {
    const cx = innerWidth / 2 - 42, cy = innerHeight * 0.42 - 42;
    const R = Math.min(innerWidth, innerHeight) * 0.17;
    fragEls.forEach((el, i) => {
      const ang = -Math.PI / 2 + (i / fragEls.length) * Math.PI * 2;
      setTimeout(() => {
        el.style.left = (cx + Math.cos(ang) * R) + "px";
        el.style.top = (cy + Math.sin(ang) * R) + "px";
        el.style.transform = "rotate(0deg) scale(1)";
      }, 350 + i * 260);
    });
    /* 碎片到齐后：全景点亮 → 标题 → 结局面板 → 佛小伴台词 */
    const total = 350 + fragEls.length * 260 + 1900;
    setTimeout(() => {
      document.getElementById("vignette").classList.add("show");
      panorama.classList.add("show");
    }, total);
    setTimeout(() => document.getElementById("endingTitle").classList.add("show"), total + 900);
    setTimeout(() => {
      document.getElementById("endingPanel").classList.add("show");
      NPC.show({ lines: NPC_ENDING });
    }, total + 1900);
  }

  /* 等首帧渲染完再启动动画 */
  setTimeout(gather, 500);

  /* ---------- 重新开始副本 ---------- */
  const resetModal = document.getElementById("resetModal");
  document.getElementById("btnReset").addEventListener("click", () => resetModal.classList.add("show"));
  document.getElementById("resetNo").addEventListener("click", () => resetModal.classList.remove("show"));
  resetModal.addEventListener("click", (e) => { if (e.target === resetModal) resetModal.classList.remove("show"); });
  document.getElementById("resetYes").addEventListener("click", () => {
    Progress.reset();
    location.href = "index.html";
  });
})();
