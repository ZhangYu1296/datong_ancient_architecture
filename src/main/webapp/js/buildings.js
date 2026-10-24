/* =========================================================
 * 程序化古建 3D 模型库（Three.js 几何体拼装的写意低多边形古建）
 * 若后续有 Blender 导出的 .glb 模型，可放置于 models/level{N}.glb，
 * 关卡页会优先加载 glb，失败时自动回退到本文件的过程化模型。
 * ======================================================= */

const Buildings = (() => {
  "use strict";

  /* ---------- 基础工具 ---------- */
  const M = (color, opts = {}) => new THREE.MeshStandardMaterial(Object.assign({
    color, roughness: 0.88, metalness: 0.04, flatShading: true
  }, opts));

  function box(w, h, d, color, x = 0, y = 0, z = 0, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(color, opts));
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 14, opts = {}) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(color, opts));
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function sph(r, color, x = 0, y = 0, z = 0, opts = {}) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), M(color, opts));
    m.position.set(x, y, z);
    m.castShadow = true;
    return m;
  }

  /* 庑殿顶（四坡屋顶）：底面 w×d，顶高 h，屋脊长 rw */
  function hipRoofMesh(w, d, h, rw, color) {
    const w2 = w / 2, d2 = d / 2, rw2 = rw / 2;
    const B0 = [-w2, 0, -d2], B1 = [w2, 0, -d2], B2 = [w2, 0, d2], B3 = [-w2, 0, d2];
    const R0 = [-rw2, h, 0], R1 = [rw2, h, 0];
    const tris = [
      B3, B2, R1,  B3, R1, R0,   // 前坡
      B1, B0, R0,  B1, R0, R1,   // 后坡
      B1, R1, B2,  B0, B3, R0    // 右坡 / 左坡
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(tris.flat(), 3));
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, M(color, { side: THREE.DoubleSide }));
    mesh.castShadow = true;
    return mesh;
  }

  /* 屋顶组件：庑殿顶 + 出檐 + 正脊 + 鸱吻 */
  function addRoof(g, { x = 0, y = 0, z = 0, w, d, h, ridge, color, ridgeColor = 0xd8b13c }) {
    const roof = hipRoofMesh(w, d, h, ridge, color);
    roof.position.set(x, y, z);
    g.add(roof);
    g.add(box(w * 1.03, 0.16, d * 1.03, color, x, y - 0.05, z));             // 出檐檐口
    g.add(box(ridge + 0.3, 0.17, 0.16, ridgeColor, x, y + h + 0.06, z));     // 正脊
    g.add(box(0.22, 0.34, 0.16, ridgeColor, x - ridge / 2, y + h + 0.18, z));// 鸱吻(左)
    g.add(box(0.22, 0.34, 0.16, ridgeColor, x + ridge / 2, y + h + 0.18, z));// 鸱吻(右)
  }

  /* 斗拱一排（檐下） */
  function addDougong(g, { x = 0, y = 0, z = 0, span, n = 7, color = 0x3c7a6e, gold = 0xd8b13c }) {
    for (let i = 0; i < n; i++) {
      const px = x - span / 2 + span * (i / (n - 1));
      g.add(box(0.14, 0.14, 0.14, color, px, y, z));
      g.add(box(0.3, 0.06, 0.18, gold, px, y + 0.11, z));
    }
  }

  /* 柱廊（沿前排 x 均布） */
  function addColumns(g, { y0 = 0, h, x0, x1, z, n, color = 0x8e2620, r = 0.09 }) {
    for (let i = 0; i < n; i++) {
      const px = n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * (i / (n - 1));
      g.add(cyl(r, r, h, color, px, y0 + h / 2, z, 10));
    }
  }

  /* 松树（写意） */
  function addPine(g, x, z, s = 1) {
    g.add(cyl(0.09 * s, 0.13 * s, 0.7 * s, 0x6e4526, x, 0.35 * s, z, 8));
    const c = [0x3d6b45, 0x2f5c3a];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry((0.75 - i * 0.2) * s, 0.8 * s, 8),
        M(c[i % 2], { flatShading: true }));
      m.position.set(x, (0.7 + 0.45 * (i + 1)) * s, z);
      m.castShadow = true;
      g.add(m);
    }
  }

  /* 台基（两级） */
  function addPlatform(g, { w, d, y = 0, color = 0x9d968a }) {
    g.add(box(w, 0.5, d, color, 0, y + 0.25, 0));
    g.add(box(w - 1, 0.5, d - 0.8, color, 0, y + 0.75, 0));
    return y + 1;
  }

  /* ================= 六座古建 ================= */

  /* 1. 云冈石窟：砂岩崖壁 + 造像龛 + 大佛 */
  function buildGrotto() {
    const g = new THREE.Group();
    const stone = 0xb5905f, stone2 = 0xa8825a, dark = 0x6b4a2f, buddha = 0x9a8874;
    g.add(box(17, 1.6, 11, 0xc4a475, 0, 0.8, 0));                 // 山前坡地
    g.add(box(11, 7.5, 6, stone2, 0, 5.3, -2));                   // 主崖体
    g.add(box(7.5, 2.6, 4, stone, 0.5, 10.2, -2.6));              // 崖顶岩层
    g.add(box(5, 1.6, 3, 0xb99a6c, -4.8, 9.6, -2.2));
    // 造像龛（内凹暗龛 + 拱形门楣）
    g.add(box(4.6, 5.6, 0.9, dark, 0, 6.2, 0.85));
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.3, 8, 22, Math.PI), M(stone));
    arch.position.set(0, 8.9, 1.32);
    arch.castShadow = true;
    g.add(arch);
    // 结跏趺坐大佛
    g.add(cyl(1.45, 1.7, 0.5, 0x8a7355, 0, 3.95, 0.7, 20));       // 莲台
    g.add(cyl(0.72, 1.05, 1.9, buddha, 0, 5.15, 0.7, 16));        // 佛身
    const lap = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.15, 8, 18, Math.PI), M(0x8f7d68));
    lap.rotation.x = Math.PI / 2;
    lap.position.set(0, 5.55, 1.05);
    g.add(lap);                                                    // 双手结印
    g.add(sph(0.6, buddha, 0, 6.55, 0.7));                         // 佛首
    g.add(sph(0.16, buddha, 0, 7.28, 0.7));                        // 肉髻
    g.add(cyl(0.09, 0.09, 1.1, buddha, -1.15, 5.5, 0.9, 8));       // 手臂(左)
    g.add(cyl(0.09, 0.09, 1.1, buddha, 1.15, 5.5, 0.9, 8));
    // 二胁侍菩萨
    [-2.6, 2.6].forEach((x, i) => {
      g.add(cyl(0.3, 0.42, 1.5, 0x8f7d68, x, 4.55, 0.9, 10));
      g.add(sph(0.26, buddha, x, 5.5, 0.9));
      g.add(sph(0.08, buddha, x, 5.85, 0.9));
    });
    // 崖顶小塔
    const tx = 4.2, tz = -2.6;
    g.add(cyl(0.55, 0.62, 0.4, stone, tx, 11.4, tz, 8));
    [0, 1, 2].forEach(i => {
      g.add(box(0.75 - i * 0.13, 0.34, 0.75 - i * 0.13, 0x9d968a, tx, 11.75 + i * 0.42, tz));
    });
    g.add(cyl(0.02, 0.02, 0.7, 0x6e4526, tx, 13.35, tz, 6));
    // 环境点缀
    addPine(g, -6.6, 3.2, 1.1);
    addPine(g, 6.9, 3.6, 0.9);
    return g;
  }

  /* 2. 悬空寺：绝壁插梁 + 悬空楼阁 */
  function buildHanging() {
    const g = new THREE.Group();
    const rock = 0x9c8a72, wood = 0x8a5a33, woodD = 0x6e4526, roofC = 0x55606e;
    g.add(box(20, 1.8, 12, 0xa4b287, 0, 0.9, 0));                 // 峡谷地面
    g.add(box(13, 15, 4.5, rock, 0, 8.6, -2.4));                  // 翠屏峰崖壁
    g.add(box(9, 3.4, 3.4, 0x8d7c64, -1.2, 16.6, -2.8));          // 崖顶岩
    [3.5, 7.2, 10.8, 14].forEach((y, i) => {                       // 崖壁层理
      g.add(box(13 - (i % 2) * 1.2, 0.34, 4.7, i % 2 ? 0x8d7c64 : 0xa5947c, (i % 2) * 0.4, y, -2.35));
    });
    // 两层悬空栈道（横梁深插岩体）
    const decks = [
      { y: 5.6, len: 7.2 }, { y: 9.2, len: 6.2 }
    ];
    decks.forEach(d => {
      for (let i = 0; i < 7; i++) {                                // 插梁
        g.add(box(0.2, 0.2, 2.8, woodD, -d.len / 2 + d.len * i / 6, d.y - 0.16, -0.95));
      }
      g.add(box(d.len, 0.26, 2.7, wood, 0, d.y, 0.3));             // 楼板
      // 栏杆
      g.add(box(d.len, 0.09, 0.09, woodD, 0, d.y + 0.62, 1.62));
      for (let i = 0; i < 8; i++) g.add(cyl(0.05, 0.05, 0.6, woodD, -d.len / 2 + d.len * i / 7, d.y + 0.32, 1.62, 6));
      // 支撑立柱（斜撑）
      [-d.len / 2 + 0.7, d.len / 2 - 0.7].forEach(px => {
        const pole = cyl(0.1, 0.12, 4.2, woodD, px, d.y - 2.1, 1.3, 8);
        pole.rotation.z = px < 0 ? 0.06 : -0.06;
        g.add(pole);
      });
    });
    // 上层楼阁
    const up = new THREE.Group();
    up.add(box(3.6, 1.9, 2.2, 0xb0413e, 0, 1.05, 0));
    addColumns(up, { y0: 0, h: 2.1, x0: -1.7, x1: 1.7, z: 1.05, n: 4, r: 0.08 });
    addDougong(up, { y: 2.06, z: 1.16, span: 3.4, n: 5 });
    addRoof(up, { y: 2.14, w: 4.3, d: 2.9, h: 1.05, ridge: 2.2, color: roofC });
    up.position.set(0, 9.35, 0.1);
    g.add(up);
    // 下层殿宇（更宽）
    const low = new THREE.Group();
    low.add(box(4.6, 1.8, 2.3, 0xa8402f, 0, 1.0, 0));
    addColumns(low, { y0: 0, h: 1.95, x0: -2.2, x1: 2.2, z: 1.1, n: 5, r: 0.08 });
    addDougong(low, { y: 1.96, z: 1.2, span: 4.3, n: 6 });
    addRoof(low, { y: 2.04, w: 5.4, d: 3.1, h: 1.0, ridge: 3.0, color: roofC });
    low.position.set(-0.6, 5.75, 0.15);
    g.add(low);
    // 悬空廊桥
    g.add(box(1.6, 0.22, 1.6, wood, 2.35, 7.5, 0.3));
    g.add(box(1.7, 0.08, 0.08, woodD, 2.35, 8.0, 1.05));
    // 崖顶小亭
    const pav = new THREE.Group();
    addColumns(pav, { y0: 0, h: 0.8, x0: -0.5, x1: 0.5, z: 0.5, n: 2, r: 0.06 });
    addColumns(pav, { y0: 0, h: 0.8, x0: -0.5, x1: 0.5, z: -0.5, n: 2, r: 0.06 });
    pav.add(box(1.5, 0.14, 1.5, wood, 0, 0.07, 0));
    addRoof(pav, { y: 0.84, w: 1.9, d: 1.9, h: 0.55, ridge: 0.5, color: roofC });
    pav.position.set(-1.4, 18.3, -2.8);
    g.add(pav);
    return g;
  }

  /* 3. 华严寺：辽金大殿（大雄宝殿式）+ 配殿 */
  function buildHuayan() {
    const g = new THREE.Group();
    const wall = 0xa8402f, roofC = 0x5a6472, stone = 0x9d968a;
    const y = addPlatform(g, { w: 13, d: 8.4, color: stone });
    // 栏杆
    for (let i = 0; i <= 10; i++) g.add(box(0.12, 0.5, 0.12, 0xcfc6b5, -6 + i * 1.2, y + 0.28, 4.05));
    g.add(box(12.2, 0.1, 0.1, 0xcfc6b5, 0, y + 0.52, 4.05));
    // 主殿
    const hall = new THREE.Group();
    hall.add(box(9, 2.7, 5.4, wall, 0, 1.35, 0));
    addColumns(hall, { y0: 0, h: 2.8, x0: -4.3, x1: 4.3, z: 2.68, n: 7 });
    addColumns(hall, { y0: 0, h: 2.8, x0: -4.3, x1: 4.3, z: -2.68, n: 7 });
    for (let i = 0; i < 3; i++) hall.add(box(0.9, 1.7, 0.1, 0x4a2a20, -1.6 + i * 1.6, 0.95, 2.72)); // 隔扇门
    addDougong(hall, { y: 2.78, z: 2.76, span: 8.6, n: 9 });
    addDougong(hall, { y: 2.78, z: -2.76, span: 8.6, n: 9 });
    addRoof(hall, { y: 3.0, w: 10.6, d: 7.0, h: 2.5, ridge: 6.6, color: roofC });
    hall.add(box(0.9, 0.55, 0.2, 0xd8b13c, 0, 4.0, 2.4));          // 匾额
    hall.position.y = y;
    g.add(hall);
    // 东西配殿
    [-8.1, 8.1].forEach(px => {
      const side = new THREE.Group();
      side.add(box(3.4, 1.7, 3, wall, 0, 0.85, 0));
      addDougong(side, { y: 1.76, z: 1.55, span: 3.1, n: 4 });
      addRoof(side, { y: 1.9, w: 4.1, d: 3.7, h: 1.1, ridge: 2.2, color: roofC });
      side.position.set(px, y, -0.4);
      g.add(side);
    });
    addPine(g, -6.4, 3.9, 1.0);
    addPine(g, 6.6, 3.6, 1.15);
    return g;
  }

  /* 4. 善化寺：山门 + 三圣殿（斜拱）+ 石经幢 */
  function buildShanhua() {
    const g = new THREE.Group();
    const wall = 0x9e3428, roofC = 0x515c6a, stone = 0x9d968a;
    const y = addPlatform(g, { w: 14, d: 9, color: stone });
    // 主殿（三圣殿：檐角斜拱舒展）
    const hall = new THREE.Group();
    hall.add(box(8.6, 2.5, 5, wall, 0, 1.25, 0));
    addColumns(hall, { y0: 0, h: 2.6, x0: -4.1, x1: 4.1, z: 2.48, n: 7 });
    addDougong(hall, { y: 2.56, z: 2.56, span: 8.2, n: 10 });
    addDougong(hall, { y: 2.56, z: -2.56, span: 8.2, n: 10 });
    [-3.9, 3.9].forEach(px => {                                     // 斜拱（45°斜出）
      const dg = box(0.16, 0.5, 0.9, 0x3c7a6e, px, 2.6, 2.62);
      dg.rotation.x = 0.5;
      hall.add(dg);
      hall.add(box(0.9, 0.16, 0.16, 0x3c7a6e, px * 0.82, 2.82, 2.5));
    });
    addRoof(hall, { y: 2.85, w: 10.8, d: 6.8, h: 2.2, ridge: 6.0, color: roofC });
    hall.position.set(0, y, -1.4);
    g.add(hall);
    // 前方山门
    const gate = new THREE.Group();
    gate.add(box(4.2, 2.0, 2.4, wall, 0, 1.0, 0));
    gate.add(box(1.1, 1.4, 0.12, 0x3a241a, 0, 0.72, 1.22));         // 门洞
    addColumns(gate, { y0: 0, h: 2.1, x0: -2.0, x1: 2.0, z: 1.18, n: 5 });
    addDougong(gate, { y: 2.06, z: 1.26, span: 3.9, n: 6 });
    addRoof(gate, { y: 2.22, w: 5.2, d: 3.2, h: 1.05, ridge: 2.9, color: roofC });
    gate.position.set(0, y, 3.1);
    g.add(gate);
    // 石经幢
    const cz = new THREE.Group();
    cz.add(cyl(0.3, 0.36, 0.3, stone, 0, 0.15, 0, 8));
    cz.add(cyl(0.16, 0.16, 1.5, 0xb5b0a4, 0, 1.05, 0, 8));
    [0.6, 1.2, 1.8].forEach(hy => cz.add(cyl(0.3, 0.3, 0.1, 0x8a8578, 0, hy, 0, 8)));
    cz.add(sph(0.2, 0xd8b13c, 0, 1.95, 0));
    cz.position.set(-5.6, y, 3.2);
    g.add(cz);
    addPine(g, 5.6, 3.4, 0.95);
    addPine(g, -6.6, -0.6, 0.8);
    return g;
  }

  /* 5. 永安寺：元代传法正宗殿 + 院墙 */
  function buildYongan() {
    const g = new THREE.Group();
    const wallW = 0xcfc6b5, wall = 0x9e3428, roofC = 0x4c5664, stone = 0x9d968a;
    const y = addPlatform(g, { w: 15, d: 10, color: stone });
    // 院墙（前开山门）
    const wh = 1.3, wt = 0.28;
    const wz = 4.6, wx = 7;
    g.add(box(2 * wx - 4.2, wh, wt, wallW, 3.1, y + wh / 2, wz));   // 前墙右段
    g.add(box(2 * wx - 4.2, wh, wt, wallW, -3.1, y + wh / 2, wz));  // 前墙左段
    g.add(box(wt, wh, 2 * wz, wallW, -wx, y + wh / 2, 0));          // 西墙
    g.add(box(wt, wh, 2 * wz, wallW, wx, y + wh / 2, 0));           // 东墙
    g.add(box(2 * wx, wh, wt, wallW, 0, y + wh / 2, -wz));          // 后墙
    // 墙帽
    [[3.1, wz], [-3.1, wz], [-wx, 0], [wx, 0], [0, -wz]].forEach(([px, pz], i) => {
      const len = i < 2 ? 2 * wx - 4.2 : (i === 4 ? 2 * wx : 2 * wz);
      const cap = box(i === 2 || i === 3 ? wt + 0.24 : len + 0.24, 0.16,
                      i === 2 || i === 3 ? wt + 0.24 : wt + 0.24, 0x55606e, px, y + wh + 0.08, pz);
      g.add(cap);
    });
    // 山门
    g.add(box(4.2, 1.7, 0.4, wall, 0, y + 0.85, wz));
    g.add(box(1.2, 1.15, 0.44, 0x3a241a, 0, y + 0.58, wz));
    const gRoof = hipRoofMesh(4.9, 1.1, 0.55, 2.4, 0x55606e);
    gRoof.position.set(0, y + 1.7, wz);
    g.add(gRoof);
    // 传法正宗之殿（元代雄浑：檐坡深、出檐大）
    const hall = new THREE.Group();
    hall.add(box(8.2, 2.6, 4.8, wall, 0, 1.3, 0));
    addColumns(hall, { y0: 0, h: 2.7, x0: -3.9, x1: 3.9, z: 2.38, n: 6 });
    for (let i = 0; i < 3; i++) hall.add(box(1.0, 1.6, 0.1, 0x4a2a20, -1.4 + i * 1.4, 0.9, 2.42));
    addDougong(hall, { y: 2.66, z: 2.46, span: 7.7, n: 8 });
    addDougong(hall, { y: 2.66, z: -2.46, span: 7.7, n: 8 });
    addRoof(hall, { y: 2.9, w: 10.6, d: 6.6, h: 2.3, ridge: 6.2, color: roofC });
    hall.add(box(2.4, 0.5, 0.16, 0xd8b13c, 0, 3.85, 2.25));         // "传法正宗之殿"匾
    hall.position.set(0, y, -1.2);
    g.add(hall);
    // 幡杆
    [-4.9, 4.9].forEach(px => {
      g.add(cyl(0.07, 0.09, 4.4, 0x6e4526, px, y + 2.2, 3.6, 8));
      const flag = box(0.9, 0.55, 0.04, 0xc0392b, px + 0.45, y + 3.9, 3.6);
      g.add(flag);
    });
    addPine(g, -6.6, 2.6, 0.9);
    return g;
  }

  /* 6. 九龙壁：明代五彩琉璃照壁 */
  function buildJiulongbi() {
    const g = new THREE.Group();
    const blue = 0x2e4a6b, teal = 0x3c7a6e, gold = 0xd8b13c;
    g.add(box(16, 1.7, 12, 0xb9a98c, 0, 0.85, 0));                 // 王府前地坪
    g.add(box(15, 0.8, 3.2, 0x7d7f7d, 0, 1.6, -0.4));              // 壁基须弥座
    g.add(box(14, 3.3, 1.5, blue, 0, 3.65, -0.4));                 // 壁身
    // 九块琉璃龙戏珠壁芯
    for (let i = 0; i < 9; i++) {
      const px = -5.6 + i * 1.4;
      const col = [0x3c7a6e, 0xc9a227, 0x2e4a6b, 0xa8402f, 0xe8dcc0, 0xa8402f, 0x2e4a6b, 0xc9a227, 0x3c7a6e][i];
      g.add(cyl(0.62, 0.62, 0.18, col, px, 3.75, 0.42, 22));       // 圆形壁芯
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.07, 8, 26), M(gold));
      ring.position.set(px, 3.75, 0.5);
      ring.castShadow = true;
      g.add(ring);                                                  // 环边
      // 盘旋龙身（三段弧）
      const dc = i === 4 ? 0xc9a227 : (i % 2 ? 0xe8dcc0 : 0xd8b13c);
      [0, 2.1, 4.2].forEach(a => {
        const seg = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.075, 6, 16, 1.7), M(dc));
        seg.position.set(px, 3.75, 0.53);
        seg.rotation.z = a + i;
        g.add(seg);
      });
      g.add(sph(0.09, 0xe8dcc0, px + 0.1, 3.98, 0.55));             // 龙珠
    }
    // 壁顶琉璃檐
    addRoof(g, { y: 5.3, z: -0.4, w: 14.6, d: 2.1, h: 0.85, ridge: 10.5, color: teal });
    // 两端垛墙
    [-7.4, 7.4].forEach(px => {
      g.add(box(0.9, 4.4, 1.9, 0x51616f, px, 3.9, -0.4));
      g.add(box(1.1, 0.2, 2.1, teal, px, 6.15, -0.4));
    });
    addPine(g, -6.5, 3.4, 1.0);
    addPine(g, 6.5, 3.4, 1.0);
    return g;
  }

  const BUILDERS = {
    grotto: buildGrotto,
    hanging: buildHanging,
    huayan: buildHuayan,
    shanhua: buildShanhua,
    yongan: buildYongan,
    jiulongbi: buildJiulongbi
  };

  /* ---------- 碎片（琉璃棱晶 + 光晕） ---------- */
  function glowTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const grd = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
    grd.addColorStop(0, "rgba(255,236,170,0.95)");
    grd.addColorStop(0.35, "rgba(240,201,79,0.55)");
    grd.addColorStop(1, "rgba(240,201,79,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function buildFragment(color = 0xf0c94f, withGlow = true) {
    const g = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.85, 0),
      M(color, { roughness: 0.25, metalness: 0.55, emissive: color, emissiveIntensity: 0.35 })
    );
    core.scale.set(1, 1.5, 1);
    core.castShadow = true;
    g.add(core);
    const shell = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.02, 0),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 })
    );
    shell.scale.set(1, 1.5, 1);
    g.add(shell);
    if (withGlow) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(), transparent: true, depthWrite: false
      }));
      sp.scale.set(3.4, 3.4, 1);
      g.add(sp);
    }
    g.userData.animate = (t) => {
      core.rotation.y = t * 0.9;
      shell.rotation.y = -t * 0.6;
      core.position.y = Math.sin(t * 1.6) * 0.16;
      shell.position.y = core.position.y;
    };
    return g;
  }

  /* ---------- 场景脚手架 ---------- */
  function createScene(canvas, { sky = 0xe8d9b5, ground = 0xcbb489, shadows = true, transparent = false } = {}) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: transparent });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = shadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (transparent) renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    if (transparent) {
      scene.background = null;   // 由 CSS 容器提供棕色半透明底
      scene.fog = null;
    } else {
      scene.background = new THREE.Color(sky);
      scene.fog = new THREE.Fog(sky, 26, 78);
    }

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 300);

    const hemi = new THREE.HemisphereLight(0xfff4dd, 0x8a7a5c, 0.85);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d0, 1.0);
    sun.position.set(9, 14, 8);
    if (shadows) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
      sun.shadow.camera.far = 60;
    }
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.18));

    const groundMesh = new THREE.Mesh(
      new THREE.CircleGeometry(40, 48),
      M(ground, { roughness: 1 })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    function resize() {
      const w = canvas.clientWidth || canvas.parentElement.clientWidth;
      const h = canvas.clientHeight || canvas.parentElement.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    return { renderer, scene, camera, ground: groundMesh, resize };
  }

  /* 依据模型包围盒自动取景 */
  function frameCamera(camera, object, distScale = 1.35) {
    const bb = new THREE.Box3().setFromObject(object);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(
      center.x + maxDim * 0.78 * distScale,
      center.y + maxDim * 0.5 * distScale,
      center.z + maxDim * 0.92 * distScale
    );
    camera.lookAt(center.x, center.y + size.y * 0.06, center.z);
    return center;
  }

  /* 近景特写机位：贴近建筑正门、低视角微仰视，营造"即将步入"的临场感
     opt 可按关卡微调：dist(距离/maxDim) eye(机位高/size.y，负=低于中心) aim(注视点高/size.y) */
  function closeupCamera(camera, object, opt = {}) {
    const distK = opt.dist || 0.5;
    const eyeK = opt.eye !== undefined ? opt.eye : -0.24;
    const aimK = opt.aim !== undefined ? opt.aim : 0.14;
    const bb = new THREE.Box3().setFromObject(object);
    const size = bb.getSize(new THREE.Vector3());
    const center = bb.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist = maxDim * distK;
    camera.position.set(
      center.x + dist * 0.42,
      center.y + size.y * eyeK,
      center.z + dist * 0.95
    );
    camera.lookAt(center.x, center.y + size.y * aimK, center.z);
    return new THREE.Vector3(center.x, center.y + size.y * aimK, center.z);
  }

  /* ---------- 离屏快照（地图点位预览图 / 博物馆碎片图） ---------- */
  let snapshotRenderer = null;
  function snapshot(buildFn, { width = 380, height = 264, sky = 0xdfe8f5, ground = 0xcbb489, glow = false, color = 0xf0c94f, transparent = false } = {}) {
    if (!snapshotRenderer) {
      snapshotRenderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
    }
    snapshotRenderer.setSize(width, height, false);
    snapshotRenderer.shadowMap.enabled = true;
    snapshotRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    snapshotRenderer.setClearColor(0x000000, transparent ? 0 : 1);

    const scene = new THREE.Scene();
    if (transparent) {
      scene.background = null;
      scene.fog = null;
    } else {
      scene.background = new THREE.Color(sky);
      scene.fog = new THREE.Fog(sky, 30, 90);
    }
    scene.add(new THREE.HemisphereLight(0xfff4dd, 0x8a7a5c, 0.9));
    const sun = new THREE.DirectionalLight(0xfff1d0, 1.05);
    sun.position.set(9, 14, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(512, 512);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    if (!transparent) {
      const gr = new THREE.Mesh(new THREE.CircleGeometry(50, 40), M(ground, { roughness: 1 }));
      gr.rotation.x = -Math.PI / 2;
      gr.receiveShadow = true;
      scene.add(gr);
    }

    const obj = glow ? buildFn(color) : buildFn();
    scene.add(obj);

    const cam = new THREE.PerspectiveCamera(46, width / height, 0.1, 300);
    frameCamera(cam, obj, glow ? 1.15 : 1.3);

    snapshotRenderer.render(scene, cam);
    return snapshotRenderer.domElement.toDataURL("image/png");
  }

  /* 模型键 → 构建器（gujian-*.js 提供开源精细版时优先使用） */
  function build(key) {
    const gj = window.GuJian || {};
    if (key === "hanging" && typeof gj.hanging === "function") return gj.hanging();
    if (key === "huayan" && typeof gj.huayan === "function") return gj.huayan();
    if (key === "shanhua" && typeof gj.shanhua === "function") return gj.shanhua();
    const fn = BUILDERS[key];
    return fn ? fn() : buildGrotto();
  }

  return { build, buildFragment, createScene, frameCamera, closeupCamera, snapshot };
})();
