/* =========================================================
 * 首页 · 古建漫游地图
 * 拖拽平移 / 滚轮缩放 / 六朝代点位状态渲染
 * ======================================================= */

(() => {
  "use strict";

  const WORLD_W = 2200, WORLD_H = 1500;
  const NUM_CN = ["壹", "贰", "叁", "肆", "伍", "陆"];

  /* 六个点位的世界坐标（沿蜿蜒时间线） */
  const NODE_POS = [
    { x: 300,  y: 1150 },
    { x: 620,  y: 900  },
    { x: 980,  y: 1050 },
    { x: 1330, y: 820  },
    { x: 1620, y: 560  },
    { x: 1920, y: 330  }
  ];

  const viewport = document.getElementById("mapViewport");
  const world = document.getElementById("mapWorld");
  const svg = document.getElementById("mapSvg");

  /* ---------- 地图装饰：云纹 / 蜿蜒路线（山水由背景插画承担） ---------- */
  function drawDecor() {
    let s = "";
    // 云纹
    const clouds = [
      [340, 380, 1.2], [1080, 240, 1.0], [1720, 950, 1.15], [700, 1350, 0.9], [1900, 1150, 1.0]
    ];
    clouds.forEach(([cx, cy, k]) => {
      s += `<g transform="translate(${cx},${cy}) scale(${k})" opacity="0.4">
        <ellipse cx="0" cy="0" rx="70" ry="22" fill="#fff8e6"/>
        <ellipse cx="-45" cy="10" rx="45" ry="16" fill="#fdf3da"/>
        <ellipse cx="48" cy="8" rx="50" ry="17" fill="#fdf3da"/>
      </g>`;
    });
    // 时间线主路（蜿蜒）
    s += `<path d="M300,1150 C380,1030 500,960 620,900 C760,830 840,1130 980,1050
                  C1090,990 1180,880 1330,820 C1460,765 1520,640 1620,560
                  C1730,470 1810,380 1920,330"
          fill="none" stroke="rgba(90,66,34,.45)" stroke-width="16" stroke-linecap="round"/>
          <path d="M300,1150 C380,1030 500,960 620,900 C760,830 840,1130 980,1050
                  C1090,990 1180,880 1330,820 C1460,765 1520,640 1620,560
                  C1730,470 1810,380 1920,330"
          fill="none" stroke="rgba(255,250,228,.85)" stroke-width="9" stroke-linecap="round"/>
          <path d="M300,1150 C380,1030 500,960 620,900 C760,830 840,1130 980,1050
                  C1090,990 1180,880 1330,820 C1460,765 1520,640 1620,560
                  C1730,470 1810,380 1920,330"
          fill="none" stroke="#d9a622" stroke-width="5" stroke-dasharray="16 12" stroke-linecap="round"/>`;
    // 起点终点标记
    s += `<g font-family="STKaiti,KaiTi,serif" style="text-shadow:0 0 8px rgba(255,248,230,.95)">
      <text x="216" y="1236" font-size="32" fill="#6f1d18" stroke="#fdf3da" stroke-width="4" paint-order="stroke" opacity=".92">「启程」</text>
      <text x="1856" y="258" font-size="32" fill="#6f1d18" stroke="#fdf3da" stroke-width="4" paint-order="stroke" opacity=".92">「圆满」</text>
    </g>`;
    svg.innerHTML = s;
  }

  /* ---------- 视图变换（平移 + 缩放） ---------- */
  const view = { x: 0, y: 0, s: 0.85 };
  function applyView() {
    // 限制拖出范围
    const vw = viewport.clientWidth, vh = viewport.clientHeight;
    const minX = vw - WORLD_W * view.s - 60, maxX = 60;
    const minY = vh - WORLD_H * view.s - 60, maxY = 60;
    view.x = Math.min(maxX, Math.max(minX, view.x));
    view.y = Math.min(maxY, Math.max(minY, view.y));
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  }
  function centerOn(wx, wy, s) {
    if (s) view.s = s;
    view.x = viewport.clientWidth / 2 - wx * view.s;
    view.y = viewport.clientHeight / 2 - wy * view.s;
    applyView();
  }

  function bindGestures() {
    let dragging = false, lx = 0, ly = 0, moved = 0;
    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".map-node")) return;
      dragging = true; moved = 0; lx = e.clientX; ly = e.clientY;
      viewport.classList.add("dragging");
      viewport.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lx, dy = e.clientY - ly;
      moved += Math.abs(dx) + Math.abs(dy);
      lx = e.clientX; ly = e.clientY;
      view.x += dx; view.y += dy;
      applyView();
    });
    const stop = () => { dragging = false; viewport.classList.remove("dragging"); };
    viewport.addEventListener("pointerup", stop);
    viewport.addEventListener("pointercancel", stop);

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const ns = Math.min(2.2, Math.max(0.45, view.s * k));
      // 以鼠标位置为锚点缩放
      const rect = viewport.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      view.x = cx - ((cx - view.x) / view.s) * ns;
      view.y = cy - ((cy - view.y) / view.s) * ns;
      view.s = ns;
      applyView();
    }, { passive: false });
  }

  /* ---------- 点位渲染 ---------- */
  function nodeState(id) {
    if (Progress.isFinished(id)) return "finished";
    if (Progress.isUnlocked(id)) return "unlocked";
    return "locked";
  }

  function buildNode(cfg, i) {
    const p = NODE_POS[i];
    const el = document.createElement("div");
    el.className = "map-node " + nodeState(cfg.id);
    el.style.left = p.x + "px";
    el.style.top = p.y + "px";
    el.dataset.id = cfg.id;
    el.innerHTML = `
      <span class="node-hit"></span>
      <img class="node-building" alt="${cfg.name}小建筑">
      <div class="node-orb">
        <span class="orb-num">${NUM_CN[i]}</span>
        <span class="orb-lock">🔒</span>
        <span class="orb-done">✔</span>
      </div>
      <div class="node-label">
        <span class="nm">${cfg.name}</span><span class="dy">${cfg.dynasty}</span>
      </div>
      <div class="node-tip">🔒 完成上一关才可进入</div>
      <div class="node-pop">
        <img alt="${cfg.name}预览">
        <div class="cap">${cfg.name} · <b>${cfg.dynasty}</b><br>点击进入关卡</div>
      </div>
    `;
    el.addEventListener("click", () => {
      const st = nodeState(cfg.id);
      if (st === "locked") {
        NPC.show({ lines: ["此关尚未开启，" + "完成上一关才可进入哦。"] });
        el.style.animation = "none";
        el.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-5px)" },
           { transform: "translateX(5px)" }, { transform: "translateX(0)" }],
          { duration: 320 });
        return;
      }
      location.href = `play.html?v=${cfg.id}`;
    });
    /* 悬浮时展示景点实拍图（images/preview{N}.jpg，按关卡顺序对应） */
    el.addEventListener("mouseenter", () => {
      if (nodeState(cfg.id) === "locked") return;
      el.querySelector(".node-pop img").src = `images/preview${cfg.id}.jpg`;
    });
    return el;
  }

  /* 光球旁的小古建：透明底 3D 快照（错峰渲染避免卡顿） */
  function renderMiniBuildings() {
    LEVELS.forEach((cfg, i) => {
      setTimeout(() => {
        const img = world.querySelector(`.map-node[data-id="${cfg.id}"] .node-building`);
        if (!img) return;
        img.src = Buildings.snapshot(
          () => Buildings.build(cfg.model),
          { width: 240, height: 240, transparent: true }
        );
      }, 180 + i * 170);
    });
  }

  function renderNodes() {
    world.querySelectorAll(".map-node").forEach(n => n.remove());
    LEVELS.forEach((cfg, i) => world.appendChild(buildNode(cfg, i)));
  }

  /* ---------- 顶栏进度 ---------- */
  function renderProgress() {
    const got = Progress.collectedCount();
    document.getElementById("fragNum").textContent = `${got}/${Progress.TOTAL}`;
    const pips = document.getElementById("fragPips");
    pips.innerHTML = "";
    for (let i = 0; i < Progress.TOTAL; i++) {
      const pip = document.createElement("i");
      if (Progress.load().fragments[i]) pip.classList.add("on");
      pips.appendChild(pip);
    }
  }

  /* ---------- 启动 ---------- */
  drawDecor();
  bindGestures();
  renderNodes();
  renderMiniBuildings();
  renderProgress();

  // 初始镜头：对准当前应挑战的关卡
  const target = LEVELS.find(l => !Progress.isFinished(l.id) && Progress.isUnlocked(l.id)) || LEVELS[0];
  centerOn(NODE_POS[target.id - 1].x, NODE_POS[target.id - 1].y, 0.85);

  // 集齐碎片且未看过结局 → 先播终章影像，再进结局页
  if (Progress.allDone() && !Progress.load().endingSeen) {
    setTimeout(() => { location.href = "play.html?v=ending"; }, 400);
  } else {
    // 佛小伴开场（延时自动弹出）
    setTimeout(() => NPC.show({ lines: NPC_OPENING }), 700);
  }
})();
