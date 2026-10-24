/* =========================================================
 * 关卡详情页（6 关模板复用）
 * 左侧 Three.js 视口（优先加载 models/level{N}.glb，失败回退过程化模型）
 *   + 点云汇聚加载动画 + 彩蛋热点光点
 * 右侧：闯关答题 + 文脉档案 + 时光对比 + 数字复原说明 + 闯关手记
 * ======================================================= */

(() => {
  "use strict";

  /* ---------- 关卡定位 ---------- */
  const params = new URLSearchParams(location.search);
  let levelId = parseInt(params.get("levelId") || "1", 10);
  if (!LEVELS.some(l => l.id === levelId)) levelId = 1;
  const cfg = LEVELS.find(l => l.id === levelId);
  const NUM_CN = ["壹", "贰", "叁", "肆", "伍", "陆"];
  const lore = cfg.lore || {};
  const genImg = (prompt) =>
    `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(prompt)}&image_size=landscape_4_3`;

  /* 未解锁的关卡不允许直接 URL 进入 */
  if (!Progress.isUnlocked(levelId)) {
    NPC.show({ lines: [`「${cfg.name}」尚未开启，完成上一关才可进入。`] });
    setTimeout(() => { location.href = "index.html"; }, 1600);
    return;
  }

  /* ---------- 内容填充 ---------- */
  document.title = `大同古建漫游 · ${cfg.name}`;
  document.getElementById("lvTag").textContent = `第${NUM_CN[levelId - 1]}关 · ${cfg.name}`;
  document.getElementById("lvName").textContent = cfg.name;
  document.getElementById("lvDynasty").textContent = cfg.dynasty;
  document.getElementById("lvPeriod").textContent = cfg.period;
  document.getElementById("lvDesc").textContent = cfg.desc;
  document.getElementById("quizQ").textContent = cfg.task.question;

  /* 文脉档案 */
  document.getElementById("loreHistory").textContent = lore.history || "";
  const fillList = (id, arr) => {
    const ul = document.getElementById(id);
    (arr || []).forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      ul.appendChild(li);
    });
  };
  fillList("loreFeatures", lore.features);
  fillList("loreHeritage", lore.heritage);

  /* 数字复原说明 */
  document.getElementById("techScan").textContent = (lore.tech && lore.tech.scan) || "";
  document.getElementById("techDiff").textContent = (lore.tech && lore.tech.diff) || "";

  /* 闯关手记（穿越学生视角） */
  const notesBox = document.getElementById("notesBox");
  (lore.notes || []).forEach(t => {
    const p = document.createElement("p");
    p.textContent = t;
    notesBox.appendChild(p);
  });

  /* ---------- 顶栏进度 ---------- */
  function renderProgress() {
    document.getElementById("fragNum").textContent =
      `${Progress.collectedCount()}/${Progress.TOTAL}`;
    const pips = document.getElementById("fragPips");
    pips.innerHTML = "";
    Progress.load().fragments.forEach(f => {
      const pip = document.createElement("i");
      if (f) pip.classList.add("on");
      pips.appendChild(pip);
    });
  }
  renderProgress();

  /* ---------- 音效（首次交互启动环境嗡鸣，静音开关在首页顶栏） ---------- */
  document.addEventListener("pointerdown", () => Sound.hum(), { once: true });

  /* ---------- 时光对比滑块：左老照片 · 右数字复原 ---------- */
  const cmpBox = document.getElementById("cmpBox");
  const cmpOld = document.getElementById("cmpOld");
  const cmpNew = document.getElementById("cmpNew");
  const cmpHandle = document.getElementById("cmpHandle");
  cmpNew.src = `images/preview${levelId}.jpg`;
  /* 史料老照片（本地图片，秒开） */
  cmpOld.src = `images/old${levelId}.jpg`;
  if (lore.oldPhoto) {
    document.getElementById("cmpCaption").textContent = lore.oldPhoto.caption;
  }
  function setCmp(p) {
    const pct = Math.max(6, Math.min(94, p));
    cmpOld.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    cmpHandle.style.left = pct + "%";
  }
  setCmp(55);
  let cmpDragging = false;
  const cmpPct = (e) => {
    const r = cmpBox.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };
  cmpBox.addEventListener("pointerdown", (e) => {
    cmpDragging = true;
    cmpBox.setPointerCapture(e.pointerId);
    setCmp(cmpPct(e));
  });
  cmpBox.addEventListener("pointermove", (e) => { if (cmpDragging) setCmp(cmpPct(e)); });
  cmpBox.addEventListener("pointerup", () => { cmpDragging = false; });

  /* ---------- 旁白讲解（音频按钮，读取闯关手记） ---------- */
  const btnVoice = document.getElementById("btnVoice");
  let speaking = false;
  btnVoice.addEventListener("click", () => {
    if (!("speechSynthesis" in window)) {
      NPC.show({ lines: ["当前浏览器不支持语音讲解，请换用 Edge / Chrome。"] });
      return;
    }
    if (speaking) {
      speechSynthesis.cancel();
      speaking = false;
      btnVoice.textContent = "🎙 播放旁白讲解";
      return;
    }
    const u = new SpeechSynthesisUtterance((lore.notes || []).join(""));
    u.lang = "zh-CN";
    u.rate = 0.92;
    u.onend = () => { speaking = false; btnVoice.textContent = "🎙 播放旁白讲解"; };
    speaking = true;
    btnVoice.textContent = "⏹ 停止讲解";
    speechSynthesis.speak(u);
  });

  /* ---------- 佛小伴故事 ---------- */
  /* 从关卡影像（play.html）进入时不再自动弹出开场（可点按钮重听） */
  let seenVideo = false;
  try {
    seenVideo = sessionStorage.getItem(`videoSeen_${levelId}`) === "1";
    sessionStorage.removeItem(`videoSeen_${levelId}`);
  } catch (e) {}
  const tellStory = () => NPC.show({ lines: [`欢迎来到${cfg.name}！`, ...cfg.story] });
  document.getElementById("btnReplayStory").addEventListener("click", tellStory);
  if (!seenVideo) setTimeout(tellStory, 500);

  /* =========================================================
   * 左侧 3D 视口 + 点云汇聚加载动画
   * ======================================================= */
  const stageBox = document.getElementById("level3d");
  const canvas = document.getElementById("stage");
  const sceneKit = Buildings.createScene(canvas, { ground: cfg.ground, transparent: true });
  const { renderer, scene, camera } = sceneKit;

  let controls = null, model = null, animFns = [], hsSprites = [];
  const clock = new THREE.Clock();

  /* 汇聚动画：完成 + 模型就绪后才揭开 */
  const convMask = document.getElementById("convergeMask");
  let convDone = false, modelReady = false;
  const maybeHideConv = () => {
    if (convDone && modelReady) {
      convMask.classList.add("hide");
      setTimeout(() => convMask.remove(), 800);
    }
  };
  const convText = cfg.name.replace(/\s*&\s*.*$/, "");   // "九龙壁 & 大同古城" → "九龙壁"
  Particles.converge(document.getElementById("convergeCv"), () => {
    convDone = true; maybeHideConv();
  }, {
    text: convText,
    scale: Math.min(0.5, 4.2 / Math.max(4, convText.length)),
    step: 5
  });

  /* 金色光点纹理（热点彩蛋） */
  function makeGlowTexture() {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 64;
    const g = cv.getContext("2d");
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, "rgba(255,246,210,1)");
    grad.addColorStop(0.35, "rgba(240,201,79,0.9)");
    grad.addColorStop(1, "rgba(240,201,79,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(cv);
  }

  /* 在模型包围盒上布置热点光点 */
  function buildHotspots(obj) {
    if (!lore.hotspots || !lore.hotspots.length) return;
    const box = new THREE.Box3().setFromObject(obj);
    const c = box.getCenter(new THREE.Vector3());
    const s = box.getSize(new THREE.Vector3());
    const tex = makeGlowTexture();
    const base = Math.min(0.9, Math.max(0.28, Math.max(s.x, s.y, s.z) * 0.055));
    lore.hotspots.forEach((hs, i) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthTest: false, color: 0xffffff
      }));
      sp.position.set(c.x + hs.p[0] * s.x, c.y + hs.p[1] * s.y, c.z + hs.p[2] * s.z);
      sp.scale.setScalar(base);
      sp.userData.hs = hs;
      scene.add(sp);
      hsSprites.push(sp);
      animFns.push(t => sp.scale.setScalar(base * (1 + 0.22 * Math.sin(t * 2.6 + i * 1.7))));
    });
  }

  function addModel(obj) {
    model = obj;
    scene.add(obj);
    const focus = Buildings.closeupCamera(camera, obj, cfg.cam);
    if (typeof THREE.OrbitControls === "function") {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.target.copy(focus);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 3;
      controls.maxDistance = 28;
      controls.maxPolarAngle = Math.PI / 2 + 0.12;
      controls.autoRotate = true;            // 闲置自动旋转
      controls.autoRotateSpeed = 1.1;
      controls.addEventListener("start", () => { controls.autoRotate = false; });
    }
    buildHotspots(obj);
    modelReady = true;
    maybeHideConv();
    stageBox.classList.remove("loading");
  }

  function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    animFns.forEach(fn => fn(t));
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  stageBox.classList.add("loading");

  /* 优先尝试加载 Blender 导出的 glb（需要 http 服务；file:// 下自动回退） */
  function tryLoadGlb(url, onLoad, onFail) {
    if (typeof THREE.GLTFLoader !== "function") { onFail(); return; }
    const loader = new THREE.GLTFLoader();
    let settled = false;
    loader.load(url,
      (gltf) => { if (!settled) { settled = true; onLoad(gltf.scene); } },
      undefined,
      () => { if (!settled) { settled = true; onFail(); } }
    );
    setTimeout(() => { if (!settled) { settled = true; onFail(); } }, 4000);
  }

  tryLoadGlb(`models/level${levelId}.glb`, addModel, () => {
    addModel(Buildings.build(cfg.model));
  });
  loop();

  /* ---------- 热点点击（拖拽 > 6px 不触发） ---------- */
  const ray = new THREE.Raycaster();
  let downXY = null;
  const hsModal = document.getElementById("hsModal");
  renderer.domElement.addEventListener("pointerdown", (e) => { downXY = [e.clientX, e.clientY]; });
  renderer.domElement.addEventListener("pointerup", (e) => {
    if (!downXY) return;
    const moved = Math.hypot(e.clientX - downXY[0], e.clientY - downXY[1]);
    downXY = null;
    if (moved > 6) return;
    const r = renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hsSprites, false)[0];
    if (hit) {
      const hs = hit.object.userData.hs;
      document.getElementById("hsTitle").textContent = `彩蛋 · ${hs.title}`;
      document.getElementById("hsText").textContent = hs.text;
      hsModal.classList.add("show");
      Sound.unlock();
    }
  });
  document.getElementById("hsClose").addEventListener("click", () => hsModal.classList.remove("show"));
  hsModal.addEventListener("click", (e) => { if (e.target === hsModal) hsModal.classList.remove("show"); });

  /* =========================================================
   * 答题闯关
   * ======================================================= */
  const OPT_CN = ["甲", "乙", "丙", "丁"];
  let selected = -1, solved = false;
  const optsBox = document.getElementById("quizOpts");
  const msg = document.getElementById("quizMsg");
  const btnSubmit = document.getElementById("btnSubmit");

  function buildQuiz() {
    // 若已通关，直接展示通关态
    if (Progress.isFinished(levelId)) {
      renderOpts(true);
      solved = true;
      msg.textContent = "本关已通关，可随时回看。";
      msg.classList.add("ok");
      btnSubmit.disabled = true;
      btnSubmit.textContent = "已通关 ✔";
      showNextButton();
      return;
    }
    renderOpts(false);
  }

  function renderOpts(locked) {
    optsBox.innerHTML = "";
    cfg.task.options.forEach((text, i) => {
      const b = document.createElement("button");
      b.className = "quiz-opt";
      b.innerHTML = `<span class="opt-tag">${OPT_CN[i]}</span><span>${text}</span>`;
      if (locked) {
        b.disabled = true;
        if (i === cfg.task.answer) b.classList.add("right");
      } else {
        b.addEventListener("click", () => {
          if (solved) return;
          selected = i;
          optsBox.querySelectorAll(".quiz-opt").forEach(o => o.classList.remove("selected"));
          b.classList.add("selected");
          btnSubmit.disabled = false;
          msg.textContent = "";
        });
      }
      optsBox.appendChild(b);
    });
  }
  buildQuiz();

  btnSubmit.addEventListener("click", () => {
    if (solved || selected < 0) return;
    if (selected === cfg.task.answer) {
      solved = true;
      optsBox.querySelectorAll(".quiz-opt").forEach((o, i) => {
        o.disabled = true;
        o.classList.remove("selected", "wrong");
        if (i === cfg.task.answer) o.classList.add("right");
      });
      msg.textContent = "答对了！碎片正向你飞来……";
      msg.classList.add("ok");
      btnSubmit.disabled = true;
      btnSubmit.textContent = "已通关 ✔";
      Sound.unlock();
      setTimeout(winSequence, 700);
    } else {
      const opt = optsBox.querySelectorAll(".quiz-opt")[selected];
      opt.classList.remove("wrong");
      void opt.offsetWidth;
      opt.classList.add("wrong");
      msg.textContent = "不对哦，" + (cfg.task.hint || "再想一想。");
    }
  });

  /* =========================================================
   * 通关：碎片获取动画 + 进度保存
   * ======================================================= */
  const winMask = document.getElementById("winMask");
  let fragLoopStarted = false;

  function startFragLoop(color) {
    if (fragLoopStarted) return;
    fragLoopStarted = true;
    const fc = document.getElementById("fragCanvas");
    const r = new THREE.WebGLRenderer({ canvas: fc, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    r.setSize(150, 150, false);
    const sc = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    cam.position.set(0, 0.6, 4.2);
    cam.lookAt(0, 0, 0);
    sc.add(new THREE.AmbientLight(0xffffff, 0.7));
    const p1 = new THREE.PointLight(0xfff1c0, 1.4); p1.position.set(3, 4, 5); sc.add(p1);
    const p2 = new THREE.PointLight(0xf0c94f, 0.9); p2.position.set(-4, -2, 3); sc.add(p2);
    const frag = Buildings.buildFragment(color);
    sc.add(frag);
    const clk = new THREE.Clock();
    (function fl() {
      requestAnimationFrame(fl);
      frag.userData.animate(clk.getElapsedTime() * 1.4);
      r.render(sc, cam);
    })();
  }

  function winSequence() {
    const result = Progress.finishLevel(levelId);
    renderProgress();
    Sound.unlock();
    document.getElementById("winFragName").textContent = `获得碎片「${cfg.fragment.name}」`;
    startFragLoop(cfg.fragment.color);
    const sub = document.getElementById("winSub");
    const winNext = document.getElementById("winNext");
    if (result.allDone) {
      sub.textContent = `六块碎片已全部集齐（${result.collected}/6），大同古建全景即将点亮！`;
      winNext.style.display = "none";
      setTimeout(() => { location.href = "play.html?v=ending"; }, 4200);
    } else {
      const nextCfg = LEVELS.find(l => l.id === levelId + 1);
      sub.textContent = `碎片 ${result.collected}/6 · 下一关「${nextCfg.name}」已解锁！`;
      winNext.style.display = "inline-block";
      winNext.onclick = goNext;
    }
    showNextButton();
    winMask.classList.add("show");
  }

  function goNext() {
    Sound.whoosh();
    setTimeout(() => { location.href = `play.html?v=${levelId + 1}`; }, 320);
  }

  function showNextButton() {
    if (levelId < LEVELS.length) {
      const btnNext = document.getElementById("btnNext");
      btnNext.style.display = "inline-block";
      btnNext.onclick = goNext;
    }
  }
})();
