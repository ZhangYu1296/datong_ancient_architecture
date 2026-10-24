/* 华严寺 3D 模型 —— 移植自开源项目 shanxi-gujian (github.com/vvlife/shanxi-gujian) huayansi-3d */
/* 目标环境：Three.js r128 全局脚本版（three.min.js / 全局 THREE），无 import/export */
(function () {
  const M = (color, opt = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, opt));

  // 材质调色板（源自项目 app.js，颜色内联保留）
  const MAT = {
    wD: M(0x3d2b1f, { roughness: 0.85 }),            // 深色木（柱）
    wM: M(0x6b4423, { roughness: 0.8 }),             // 中木（斗栱）
    wL: M(0x9c6b3f, { roughness: 0.75 }),            // 浅木（小木作）
    rT: M(0x4a3020, { roughness: 0.7, metalness: 0.1 }),  // 屋面主色
    rD: M(0x2a1810, { roughness: 0.65, metalness: 0.15 }),// 屋脊深色
    g: M(0xc9a04e, { roughness: 0.3, metalness: 0.8, emissive: 0xc9a04e, emissiveIntensity: 0.05 }),   // 金（鸱吻）
    gB: M(0xe8c876, { roughness: 0.2, metalness: 0.9, emissive: 0xe8c876, emissiveIntensity: 0.1 }),   // 亮金
    r: M(0x8b3a1e, { roughness: 0.7 }),              // 红
    rD2: M(0x5c2410, { roughness: 0.75 }),           // 深红（门）
    s: M(0x6a6058, { roughness: 0.9 }),              // 石（台阶/月台）
    sD: M(0x4a4038, { roughness: 0.9 }),             // 深石（台基）
    w: M(0x5c4030, { roughness: 0.85 }),             // 殿墙木色
    wC: M(0x8a7560, { roughness: 0.85 }),            // 浅墙木
    b: M(0xb8843e, { roughness: 0.4, metalness: 0.3, emissive: 0xb8843e, emissiveIntensity: 0.03 }),   // 佛身金
    bG: M(0xd4a850, { roughness: 0.3, metalness: 0.7, emissive: 0xd4a850, emissiveIntensity: 0.08 }),  // 佛首金
    lo: M(0xc99a5e, { roughness: 0.5 })              // 莲座
  };

  function box(w, h, d, x, y, z, mat) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, x, y, z, mat, seg = 16) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  // ===== 屋顶构建器 =====
  // type='wudian' 庑殿顶（正脊+四条戗脊），否则歇山顶（垂脊+山花+戗脊）；opts.chiwen=false 去鸱吻
  function buildRoof(w, d, h, type, opts = {}) {
    const g = new THREE.Group();
    const mat = opts.mat || MAT.rT;
    const ew = w + 5, ed = d + 5;
    // 屋面主体
    g.add(box(ew, h * 0.5, ed, 0, h * 0.25, 0, mat));
    // 前后檐口
    g.add(box(ew + 3, h * 0.12, 2, 0, h * 0.08, d / 2 + 2.5, mat));
    g.add(box(ew + 3, h * 0.12, 2, 0, h * 0.08, -d / 2 - 2.5, mat));
    // 两侧檐口
    g.add(box(2, h * 0.12, ed + 3, -ew / 2 - 2.5, h * 0.08, 0, mat));
    g.add(box(2, h * 0.12, ed + 3, ew / 2 + 2.5, h * 0.08, 0, mat));
    // 正脊
    g.add(box(ew - 3, 0.7, 0.9, 0, h * 0.5 + 0.35, 0, MAT.rD));
    if (type === 'wudian') {
      // 庑殿顶：四条戗脊
      for (let sx of [-1, 1]) for (let sz of [-1, 1]) {
        const dx = (ew - 3) / 2 * sx, dz = ed / 2 * sz, dy = h * 0.5;
        const len = Math.max(0.1, Math.sqrt(dx * dx + dy * dy + dz * dz));
        const ridge = box(0.4, 0.4, len, 0, 0, 0, MAT.rD);
        ridge.position.set(dx / 2, h * 0.5 + dy / 2, dz / 2);
        ridge.lookAt(new THREE.Vector3(dx, h * 0.5 + 0.5, dz));
        ridge.rotateX(Math.PI / 2);
        g.add(ridge);
      }
    } else {
      // 歇山顶：两侧垂脊 + 山面戗脊
      for (let sx of [-1, 1]) {
        g.add(box(0.3, h * 0.6, ed - 2, sx * (ew - 3) / 2, h * 0.55, 0, MAT.wD));
        for (let sz of [-1, 1]) {
          const dx = (ew - 3) / 2 * sx, dz = (ed - 4) / 2 * sz, dy = h * 0.45;
          const len = Math.max(0.1, Math.sqrt(dx * dx + dy * dy + dz * dz));
          const ridge = box(0.35, 0.35, len, 0, 0, 0, MAT.rD);
          ridge.position.set(dx * 0.5, h * 0.5 + dy * 0.5, dz * 0.5);
          ridge.lookAt(new THREE.Vector3(dx, h * 0.5 + 0.3, dz));
          ridge.rotateX(Math.PI / 2);
          g.add(ridge);
        }
      }
    }
    if (opts.chiwen !== false) {
      // 正脊两端鸱吻（国内现存最大琉璃鸱吻之一，高约4.5m）
      for (let sx of [-1, 1]) {
        const cw = new THREE.Group();
        cw.add(box(1.2, 2.5, 1.2, 0, 1.25, 0, MAT.g));          // 吻身
        cw.add(box(0.8, 1.5, 0.8, 0, 2.8, 0.3, MAT.gB));        // 吻首
        cw.add(box(0.5, 1, 0.5, sx * 0.4, 2.2, -0.3, MAT.g));   // 吻鳍
        cw.position.set(sx * (ew - 3) / 2, h * 0.5 + 0.7, 0);
        g.add(cw);
      }
    }
    return g;
  }

  // ===== 月台与台基 =====
  function buildPlatform() {
    const g = new THREE.Group();
    // 上寺台基（青石砌筑）
    g.add(box(72, 2.5, 48, 0, 1.25, 0, MAT.sD));
    // 正面三级石阶
    for (let i = 0; i < 3; i++) g.add(box(32 - i * 2, 0.5, 3, 0, 0.25 + i * 0.5, 25 + i * 1.5, MAT.s));
    // 月台（八角石台，前出月台）
    const moon = new THREE.Mesh(new THREE.CylinderGeometry(16, 17, 1.2, 8), MAT.s);
    moon.rotation.y = Math.PI / 8;
    moon.position.set(0, 1.8, 30);
    moon.castShadow = true;
    moon.receiveShadow = true;
    g.add(moon);
    // 下寺台基
    g.add(box(42, 1.5, 32, -38, 0.75, -16, MAT.sD));
    for (let i = 0; i < 2; i++) g.add(box(20 - i * 2, 0.4, 2.5, -38, 0.2 + i * 0.4, 1 + i * 1.2, MAT.s));
    return g;
  }

  // ===== 大雄宝殿（单檐庑殿顶，面阔九间，进深五间） =====
  function buildDaxiong() {
    const g = new THREE.Group();
    const w = 36, h = 14, d = 20;
    // 殿身
    g.add(box(w, h, d, 0, h / 2 + 2.5, 0, MAT.w));
    // 前后檐柱列（面阔九间）
    const colSpacing = w / 10;
    for (let i = 0; i <= 10; i++) {
      const x = -w / 2 + i * colSpacing;
      g.add(box(0.8, h + 2, 0.8, x, h / 2 + 2.5, d / 2 + 0.5, MAT.wD));
      g.add(box(0.8, h + 2, 0.8, x, h / 2 + 2.5, -d / 2 - 0.5, MAT.wD));
    }
    // 山面柱列（进深五间）
    for (let i = 1; i < 5; i++) {
      const z = -d / 2 + i * (d / 5);
      g.add(box(0.8, h + 2, 0.8, -w / 2 - 0.5, h / 2 + 2.5, z, MAT.wD));
      g.add(box(0.8, h + 2, 0.8, w / 2 + 0.5, h / 2 + 2.5, z, MAT.wD));
    }
    // 板门与窗
    g.add(box(4, 5, 0.3, 0, 5, d / 2 + 0.6, MAT.rD2));
    for (let x of [-10, 10]) g.add(box(3, 3, 0.3, x, 6, d / 2 + 0.6, MAT.wD));
    // 庑殿顶
    const roof = buildRoof(w, d, 8, 'wudian', { mat: MAT.rT });
    roof.position.y = h + 2.5;
    g.add(roof);
    // 檐下斗栱（柱头铺作）
    for (let i = 0; i <= 10; i++) {
      const x = -w / 2 + 1 + i * colSpacing;
      g.add(box(1, 1, 1.5, x, h + 2.5, d / 2 + 1, MAT.wM));
      g.add(box(1, 1, 1.5, x, h + 2.5, -d / 2 - 1, MAT.wM));
    }
    // 殿内五方佛彩塑（莲座+身+首+肉髻）
    for (let i = 0; i < 5; i++) {
      const bx = -12 + i * 6;
      const bg = new THREE.Group();
      bg.add(cyl(1.2, 1.5, 0.6, bx, 3.4, 0, MAT.lo));
      bg.add(cyl(0.8, 1.0, 3, bx, 5.5, 0, MAT.b));
      bg.add(cyl(0.5, 0.6, 1.2, bx, 7.8, 0, MAT.bG));
      bg.add(cyl(0.25, 0.3, 0.4, bx, 8.6, 0, MAT.bG));
      g.add(bg);
    }
    return g;
  }

  // ===== 薄伽教藏殿（单檐歇山顶，面阔五间，进深四间） =====
  function buildBojia() {
    const g = new THREE.Group();
    const w = 22, h = 10, d = 14;
    g.position.set(-38, 2.5, -16);
    // 殿身
    g.add(box(w, h, d, 0, h / 2, 0, MAT.w));
    // 柱列（面阔五间）
    const cs = w / 6;
    for (let i = 0; i <= 6; i++) {
      const x = -w / 2 + i * cs;
      g.add(box(0.7, h + 1.5, 0.7, x, h / 2, d / 2 + 0.4, MAT.wD));
      g.add(box(0.7, h + 1.5, 0.7, x, h / 2, -d / 2 - 0.4, MAT.wD));
    }
    // 板门
    g.add(box(3, 4, 0.3, 0, 4, d / 2 + 0.5, MAT.rD2));
    // 歇山顶
    const roof = buildRoof(w, d, 5, 'xieshan', { mat: MAT.rT });
    roof.position.y = h + 1.5;
    g.add(roof);
    // 天宫楼阁（沿壁双层小木作，海内孤品）
    const tg = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const x = -9 + i * 2.6;
      tg.add(box(2, 2.5, 0.6, x, 4, -d / 2 - 0.3, MAT.wL));      // 下层壁橱
      tg.add(box(2, 1.8, 0.8, x, 6.4, -d / 2 - 0.4, MAT.wM));    // 上层
      tg.add(box(2.2, 0.2, 1, x, 7.4, -d / 2 - 0.5, MAT.wD));    // 小飞檐
      tg.add(box(2.4, 0.3, 0.6, x, 7.6, -d / 2 - 0.6, MAT.rD));  // 小屋顶
    }
    // 山面壁橱
    for (let i = 0; i < 4; i++) {
      const z = -5 + i * 3.3;
      tg.add(box(0.6, 2.5, 2.5, -w / 2 - 0.3, 4, z, MAT.wL));
      tg.add(box(0.8, 1.8, 2, -w / 2 - 0.4, 6.4, z, MAT.wM));
      tg.add(box(1, 0.2, 2.2, -w / 2 - 0.5, 7.4, z, MAT.wD));
    }
    g.add(tg);
    // 合掌露齿菩萨（东方维纳斯）
    const ps = new THREE.Group();
    ps.add(cyl(0.7, 0.9, 0.4, 5, 3.2, 0, MAT.lo));
    ps.add(cyl(0.4, 0.6, 2.5, 5, 5, 0, MAT.b));
    ps.add(cyl(0.35, 0.4, 0.8, 5, 7, 0, MAT.bG));
    ps.add(box(0.2, 0.8, 0.2, 5.3, 5.5, 0.3, MAT.b));  // 合掌手臂
    ps.add(box(0.2, 0.8, 0.2, 4.7, 5.5, 0.3, MAT.b));
    ps.add(box(0.3, 0.3, 0.3, 5, 6.0, 0.4, MAT.bG));   // 合十双手
    g.add(ps);
    // 其余辽塑（简化）
    for (let i = 0; i < 3; i++) {
      const sx = -6 + i * 4;
      const st = new THREE.Group();
      st.add(cyl(0.6, 0.8, 0.3, sx, 3.1, 0, MAT.lo));
      st.add(cyl(0.4, 0.55, 2.2, sx, 4.6, 0, MAT.b));
      st.add(cyl(0.3, 0.35, 0.7, sx, 6.3, 0, MAT.bG));
      g.add(st);
    }
    return g;
  }

  // ===== 配殿与廊庑 =====
  function buildPeidian() {
    const g = new THREE.Group();
    // 连接上下寺的东西廊庑
    g.add(box(3, 6, 25, -20, 5, 5, MAT.w));
    g.add(box(3.5, 0.5, 25.5, -20, 8.5, 5, MAT.rD));
    g.add(box(3, 6, 25, 20, 5, 5, MAT.w));
    g.add(box(3.5, 0.5, 25.5, 20, 8.5, 5, MAT.rD));
    // 东西配殿
    for (let sx of [-1, 1]) {
      g.add(box(8, 7, 10, sx * 28, 5.5, -10, MAT.w));
      g.add(box(9, 0.8, 11, sx * 28, 9.5, -10, MAT.rT));
      g.add(box(8.5, 0.5, 0.6, sx * 28, 10, -10 + 5.5, MAT.rD));
      // 配殿廊柱
      for (let i = 0; i < 4; i++) {
        g.add(box(0.5, 7, 0.5, sx * 28 - 3.5 + i * 2.3, 5.5, -5, MAT.wD));
        g.add(box(0.5, 7, 0.5, sx * 28 - 3.5 + i * 2.3, 5.5, -15, MAT.wD));
      }
    }
    // 后廊
    g.add(box(60, 5, 3, 0, 4, -28, MAT.w));
    g.add(box(61, 0.4, 3.5, 0, 7, -28, MAT.rD));
    // 廊柱
    for (let i = 0; i < 10; i++) {
      const x = -27 + i * 6;
      g.add(box(0.4, 6, 0.4, x, 4, 8, MAT.wD));
      g.add(box(0.4, 6, 0.4, x, 4, 2, MAT.wD));
    }
    return g;
  }

  function buildHuayanSi() {
    const g = new THREE.Group();
    g.add(buildPlatform());
    g.add(buildDaxiong());
    g.add(buildBojia());
    g.add(buildPeidian());
    // 归一化：整组缩放到高度约 14，底部对齐 y=0，中心 x/z 对齐 0
    const box = new THREE.Box3().setFromObject(g);
    const size = box.getSize(new THREE.Vector3());
    const s = 14 / Math.max(size.y, 0.001);
    g.scale.setScalar(s);
    const box2 = new THREE.Box3().setFromObject(g);
    const c = box2.getCenter(new THREE.Vector3());
    g.position.set(-c.x, -box2.min.y, -c.z);
    const wrap = new THREE.Group();
    wrap.add(g);
    return wrap;
  }

  window.GuJian = window.GuJian || {};
  window.GuJian.huayan = buildHuayanSi;
})();
