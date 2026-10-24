/* =========================================================
 * 碎片博物馆 · 藏品展厅
 * 已收集：3D 碎片点亮 + 光晕；未收集：灰色剪影
 * ======================================================= */

(() => {
  "use strict";

  /* 每座古建的手绘插图（弹窗展示用） */
  const IMG_PROMPTS = {
    1: "Ancient Chinese Buddhist cave temple, giant seated Buddha statue carved into sandstone cliff, Yungang Grottoes Datong, golden sunset light, incense smoke, detailed guofeng illustration",
    2: "Ancient Chinese wooden temple hanging on vertical cliff face, Xuankong Temple Hengshan mountain, wooden stilts and walkways, misty valley, guofeng illustration",
    3: "Grand ancient Chinese Liao dynasty temple hall, gray tile hip roof, red wooden columns, dougong brackets, stone platform, ancient pines, guofeng illustration",
    4: "Ancient Chinese Liao Jin dynasty temple complex, grand gate hall with sloping dougong brackets, red walls, stone pagoda, courtyard, guofeng illustration",
    5: "Ancient Chinese Yuan dynasty temple hall, colorful water-land mural paintings, courtyard walls with gate, banner poles, guofeng illustration",
    6: "Colorful glazed nine dragon screen wall, blue green gold ceramic dragons relief, Ming dynasty city wall, guofeng illustration"
  };
  const img = (id) =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(IMG_PROMPTS[id])}&image_size=landscape_4_3`;

  /* ---------- 顶栏进度 ---------- */
  document.getElementById("fragNum").textContent =
    `${Progress.collectedCount()}/${Progress.TOTAL}`;
  const pips = document.getElementById("fragPips");
  Progress.load().fragments.forEach(f => {
    const i = document.createElement("i");
    if (f) i.classList.add("on");
    pips.appendChild(i);
  });

  /* ---------- 渲染卡片 ---------- */
  const grid = document.getElementById("museumGrid");

  LEVELS.forEach(cfg => {
    const collected = Progress.hasFragment(cfg.id);
    const card = document.createElement("div");
    card.className = "frag-card " + (collected ? "collected" : "uncollected");
    card.innerHTML = `
      <span class="frag-st">${collected ? "已收藏" : "未收集"}</span>
      <div class="frag-stage"><img alt="${cfg.fragment.name}"></div>
      <div class="frag-nm">${cfg.fragment.name}</div>
      <div class="frag-bd">出自 · ${cfg.name}（${cfg.dynasty}）</div>
    `;
    card.addEventListener("click", () => openDetail(cfg, collected));
    grid.appendChild(card);

    /* 3D 碎片快照（已收集带光晕；未收集同图由 CSS 滤镜做灰色剪影） */
    requestAnimationFrame(() => {
      card.querySelector("img").src = Buildings.snapshot(
        (color) => Buildings.buildFragment(color, collected),
        { width: 300, height: 220, sky: 0x6f4a28,   // 统一棕色背景
          ground: 0x5d3f22,
          glow: collected, color: cfg.fragment.color }
      );
    });
  });

  /* ---------- 藏品详情弹窗 ---------- */
  const modal = document.getElementById("fragModal");
  let currentGo = "index.html";

  function openDetail(cfg, collected) {
    document.getElementById("fmTitle").textContent =
      `${cfg.fragment.name} · 出自${cfg.name}`;
    document.getElementById("fmImg").src = img(cfg.id);
    const text = document.getElementById("fmText");
    if (collected) {
      text.textContent = FRAGMENT_INTROS[cfg.id] || cfg.desc;
      document.getElementById("fmGo").style.display = "inline-block";
      currentGo = `play.html?v=${cfg.id}`;
    } else {
      text.textContent = "这块碎片尚未收集。回到地图，闯过对应关卡即可点亮它。";
      document.getElementById("fmGo").style.display = "none";
    }
    modal.classList.add("show");
  }
  document.getElementById("fragModalClose").addEventListener("click", () => modal.classList.remove("show"));
  document.getElementById("fmClose2").addEventListener("click", () => modal.classList.remove("show"));
  document.getElementById("fmGo").addEventListener("click", () => { location.href = currentGo; });
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

  /* ---------- 通关奖励：《大同古建数字图鉴》 ---------- */
  const banner = document.getElementById("tujianBanner");
  const tujian = document.getElementById("tujianGrid");
  if (Progress.allDone()) {
    banner.classList.add("unlocked");
    tujian.hidden = false;
    const tjCards = document.getElementById("tujianCards");
    LEVELS.forEach(cfg => {
      const fig = document.createElement("figure");
      fig.className = "tj-card";
      fig.innerHTML = `
        <img alt="${cfg.name}" src="images/preview${cfg.id}.jpg">
        <figcaption><b>${cfg.name}</b><span>${cfg.dynasty}</span></figcaption>
      `;
      tjCards.appendChild(fig);
    });
  }

  /* ---------- 佛小伴开场旁白 ---------- */
  const got = Progress.collectedCount();
  NPC.show({
    lines: [
      "欢迎来到碎片博物馆！这里是收藏大同古建记忆的地方。",
      `目前共收集了 ${got} / 6 块碎片。已收集的碎片正在展台上发光呢。`,
      "点击灰色剪影，可以看看它属于哪座古建——去把它带回博物馆吧！"
    ]
  });
})();
