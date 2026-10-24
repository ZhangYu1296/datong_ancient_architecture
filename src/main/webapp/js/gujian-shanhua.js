/* 善化寺 3D 模型 —— 移植自开源项目 shanxi-gujian (github.com/vvlife/shanxi-gujian) shanhuasi-3d
 * 适配 Three.js r128 全局脚本版（无 import/export）。
 * 源模型中的 CapsuleGeometry（r131+）已用 CylinderGeometry + SphereGeometry 降级实现。
 * 仅保留建筑本体 Group 构建逻辑：山门、三圣殿（斜拱）、大雄宝殿（二十四诸天）、
 * 普贤阁、配殿廊庑、斗拱展示、庭院古树与香炉；灯光/相机/背景/UI/纯地面地板未移植。
 */
(function () {
  'use strict';

  const M = (color, opt = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, opt));

  // ── 材质库（源配色内联）──
  const mat = {
    roof: M(0x6b4226, { roughness: 0.7, metalness: 0.05 }),
    roofDark: M(0x4a2d1a, { roughness: 0.75, metalness: 0.05 }),
    wall: M(0xc4a878, { roughness: 0.85, metalness: 0.02 }),
    wallDark: M(0xa08858, { roughness: 0.85, metalness: 0.02 }),
    wood: M(0x8b5e3c, { roughness: 0.65, metalness: 0.05 }),
    woodDark: M(0x6b4423, { roughness: 0.7, metalness: 0.05 }),
    pillar: M(0x9d5c30, { roughness: 0.6, metalness: 0.05 }),
    stone: M(0x9a9088, { roughness: 0.9, metalness: 0.01 }),
    gold: M(0xc8a050, { roughness: 0.3, metalness: 0.6 }),
    statue: M(0xc89858, { roughness: 0.5, metalness: 0.15 }),
  };
  const treeMat = M(0x4a5c3a, { roughness: 0.9 });

  // 统一阴影标记：每个 mesh 都投射并接收阴影
  function SH(m) { m.castShadow = true; m.receiveShadow = true; return m; }

  // ════════════════════════════════════════
  //  建筑构建函数
  // ════════════════════════════════════════

  // 创建庑殿顶/歇山顶屋顶
  function createRoof(width, depth, height, style = 'wudian') {
    const group = new THREE.Group();

    if (style === 'wudian') {
      // 庑殿顶 - 四面斜坡
      // 主屋脊
      const ridgeGeom = new THREE.BoxGeometry(width * 0.7, 0.4, 0.5);
      const ridge = SH(new THREE.Mesh(ridgeGeom, mat.roofDark));
      ridge.position.set(0, height, -depth * 0.15);
      group.add(ridge);

      // 前后左右坡
      const frontGeom = new THREE.BufferGeometry();
      const hw = width / 2, hd = depth / 2, e = 0.8; // e = 出檐
      const verts = new Float32Array([
        // 前坡
        -hw - e, 0, hd + e,  hw - e * 0.3, 0, hd + e,  hw * 0.35, height, hd * 0.3,
        -hw - e, 0, hd + e,  hw * 0.35, height, hd * 0.3,  -hw * 0.35, height, hd * 0.3,
        // 后坡
        hw - e * 0.3, 0, -hd - e,  -hw - e, 0, -hd - e,  -hw * 0.35, height, -hd * 0.3,
        hw - e * 0.3, 0, -hd - e,  -hw * 0.35, height, -hd * 0.3,  hw * 0.35, height, -hd * 0.3,
        // 左坡
        -hw - e, 0, hd + e,  -hw * 0.35, height, -hd * 0.3,  -hw * 0.35, height, hd * 0.3,
        -hw - e, 0, hd + e,  -hw - e, 0, -hd - e,  -hw * 0.35, height, -hd * 0.3,
        // 右坡
        hw - e * 0.3, 0, -hd - e,  hw - e * 0.3, 0, hd + e,  hw * 0.35, height, hd * 0.3,
        hw - e * 0.3, 0, -hd - e,  hw * 0.35, height, hd * 0.3,  hw * 0.35, height, -hd * 0.3,
      ]);
      frontGeom.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      frontGeom.computeVertexNormals();
      group.add(SH(new THREE.Mesh(frontGeom, mat.roof)));

      // 鸱吻（屋脊两端装饰）
      for (const sign of [-1, 1]) {
        const ornMesh = SH(new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.5, 4), mat.gold));
        ornMesh.position.set(sign * width * 0.35, height + 0.75, -depth * 0.15);
        ornMesh.rotation.y = Math.PI / 4;
        group.add(ornMesh);
      }
    } else if (style === 'xieshan') {
      // 歇山顶
      const hw = width / 2, hd = depth / 2, e = 0.8;

      // 上部屋脊
      const ridge = SH(new THREE.Mesh(new THREE.BoxGeometry(width * 0.6, 0.35, 0.4), mat.roofDark));
      ridge.position.set(0, height, 0);
      group.add(ridge);

      // 前后坡（上部三角形区域）
      const upperGeom = new THREE.BufferGeometry();
      const uv = new Float32Array([
        -hw * 0.4, height, hd * 0.2,  hw * 0.4, height, hd * 0.2,  hw, 0, hd,
        -hw * 0.4, height, hd * 0.2,  hw, 0, hd,  -hw, 0, hd,
        hw * 0.4, height, -hd * 0.2,  -hw * 0.4, height, -hd * 0.2,  -hw, 0, -hd,
        hw * 0.4, height, -hd * 0.2,  -hw, 0, -hd,  hw, 0, -hd,
      ]);
      upperGeom.setAttribute('position', new THREE.BufferAttribute(uv, 3));
      upperGeom.computeVertexNormals();
      group.add(SH(new THREE.Mesh(upperGeom, mat.roof)));
    }

    return group;
  }

  // 创建斗拱
  function createDougong(x, y, z, scale = 1) {
    const group = new THREE.Group();

    // 栌斗（底座）
    group.add(SH(new THREE.Mesh(
      new THREE.BoxGeometry(1.2 * scale, 0.6 * scale, 1.2 * scale),
      mat.woodDark
    )));

    // 横拱
    for (let i = 0; i < 2; i++) {
      const heng = SH(new THREE.Mesh(
        new THREE.BoxGeometry(3 * scale, 0.35 * scale, 0.4 * scale),
        mat.wood
      ));
      heng.position.y = (0.5 + i * 0.4) * scale;
      group.add(heng);
    }

    // 小斗
    for (const sign of [-1, 0, 1]) {
      const xiaodou = SH(new THREE.Mesh(
        new THREE.BoxGeometry(0.5 * scale, 0.3 * scale, 0.5 * scale),
        mat.woodDark
      ));
      xiaodou.position.set(sign * 1 * scale, 0.75 * scale, 0);
      group.add(xiaodou);
    }

    group.position.set(x, y, z);
    return group;
  }

  // 创建柱子
  function createPillar(x, z, height, radius = 0.35) {
    const geom = new THREE.CylinderGeometry(radius, radius * 1.1, height, 12);
    const mesh = SH(new THREE.Mesh(geom, mat.pillar));
    mesh.position.set(x, height / 2, z);
    return mesh;
  }

  // 创建台基
  function createPlatform(width, depth, height, x = 0, z = 0) {
    const group = new THREE.Group();

    const base = SH(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat.stone));
    base.position.set(x, height / 2, z);
    group.add(base);

    // 台基边缘条石
    const edge = SH(new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.2, depth + 0.3), mat.stone));
    edge.position.set(x, height + 0.1, z);
    group.add(edge);

    // 台阶（正面）
    const steps = SH(new THREE.Mesh(new THREE.BoxGeometry(width * 0.4, height * 0.8, 1.5), mat.stone));
    steps.position.set(x, height * 0.4, z + depth / 2 + 0.75);
    group.add(steps);

    return group;
  }

  // 创建塑像（源 CapsuleGeometry 降级：圆柱 + 上下半球）
  function createStatue() {
    const group = new THREE.Group();
    const r = 0.35, len = 1.2;
    group.add(SH(new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat.statue)));
    const top = SH(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 4), mat.statue));
    top.position.y = len / 2;
    group.add(top);
    const bottom = SH(new THREE.Mesh(new THREE.SphereGeometry(r, 8, 4), mat.statue));
    bottom.position.y = -len / 2;
    group.add(bottom);
    return group;
  }

  // ════════════════════════════════════════
  //  创建善化寺各建筑
  // ════════════════════════════════════════

  // ── 1. 山门（辽代，面阔五间，单檐庑殿顶）──
  function buildShanmen() {
    const group = new THREE.Group();

    const w = 16, d = 8, ph = 1.2;

    // 台基
    group.add(createPlatform(w + 2, d + 2, ph, 0, 0));

    // 柱子
    for (let i = -2; i <= 2; i++) {
      group.add(createPillar(i * 3.2, d / 2, 5));
      group.add(createPillar(i * 3.2, -d / 2, 5));
    }

    // 墙体（半墙）
    const wallFront = SH(new THREE.Mesh(new THREE.BoxGeometry(w, 2, 0.3), mat.wall));
    wallFront.position.set(0, 1.5, d / 2);
    group.add(wallFront);
    const wallBack = wallFront.clone();
    wallBack.position.z = -d / 2;
    group.add(wallBack);

    // 门洞
    const door = SH(new THREE.Mesh(new THREE.BoxGeometry(3, 3.5, 0.2), mat.woodDark));
    door.position.set(0, 2.5, d / 2 + 0.2);
    group.add(door);

    // 斗拱
    for (let i = -2; i <= 2; i++) {
      group.add(createDougong(i * 3.2, 5.3, d / 2 + 0.2, 0.8));
      group.add(createDougong(i * 3.2, 5.3, -d / 2 - 0.2, 0.8));
    }

    // 屋顶
    const roof = createRoof(w, d, 4, 'wudian');
    roof.position.y = 5.8;
    group.add(roof);

    group.position.set(0, 0, 22);
    return group;
  }

  // ── 2. 三圣殿（金代，斜拱为特色）──
  function buildSanshengDian() {
    const group = new THREE.Group();

    const w = 20, d = 12, ph = 1.5;

    // 台基
    group.add(createPlatform(w + 3, d + 3, ph, 0, 0));

    // 柱子
    for (let i = -2; i <= 2; i++) {
      group.add(createPillar(i * 4, d / 2, 6));
      group.add(createPillar(i * 4, -d / 2, 6));
    }
    // 内柱
    group.add(createPillar(0, 0, 6));

    // 墙体
    const wallFront = SH(new THREE.Mesh(new THREE.BoxGeometry(w, 4, 0.3), mat.wall));
    wallFront.position.set(0, 3, d / 2);
    group.add(wallFront);
    const wallBack = wallFront.clone();
    wallBack.position.z = -d / 2;
    group.add(wallBack);

    // 侧墙
    const sideWallL = SH(new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, d), mat.wall));
    sideWallL.position.set(-w / 2, 3, 0);
    group.add(sideWallL);
    const sideWallR = sideWallL.clone();
    sideWallR.position.x = w / 2;
    group.add(sideWallR);

    // 门
    const door = SH(new THREE.Mesh(new THREE.BoxGeometry(4, 4, 0.15), mat.woodDark));
    door.position.set(0, 3, d / 2 + 0.2);
    group.add(door);

    // 斜拱（特色！）
    for (let i = -2; i <= 2; i++) {
      const dg = createDougong(i * 4, 6.3, d / 2 + 0.2, 1.0);
      // 添加斜拱
      for (const sign of [-1, 1]) {
        const xieGong = SH(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 0.3), mat.wood));
        xieGong.position.set(sign * 1.2, 0.7, 0);
        xieGong.rotation.y = sign * Math.PI / 6;
        dg.add(xieGong);
      }
      group.add(dg);
    }

    // 屋顶
    const roof = createRoof(w, d, 5, 'wudian');
    roof.position.y = 6.8;
    group.add(roof);

    group.position.set(0, 0, 7);
    return group;
  }

  // ── 3. 大雄宝殿（辽代主殿，面阔七间）──
  function buildDaxiongBaodian() {
    const group = new THREE.Group();

    const w = 36, d = 20, ph = 2;

    // 台基（月台）
    group.add(createPlatform(w + 4, d + 4, ph, 0, 0));

    // 月台前台阶
    const stair = SH(new THREE.Mesh(new THREE.BoxGeometry(w * 0.3, ph * 0.9, 3), mat.stone));
    stair.position.set(0, ph * 0.45, d / 2 + 2.5);
    group.add(stair);

    // 柱子 - 面阔七间
    for (let i = -3; i <= 3; i++) {
      group.add(createPillar(i * 5, d / 2, 8));
      group.add(createPillar(i * 5, -d / 2, 8));
    }
    // 内柱
    for (let i = -2; i <= 2; i++) {
      group.add(createPillar(i * 5, 0, 8, 0.4));
    }

    // 墙体
    const wallFront = SH(new THREE.Mesh(new THREE.BoxGeometry(w, 5, 0.3), mat.wall));
    wallFront.position.set(0, 4, d / 2);
    group.add(wallFront);
    const wallBack = wallFront.clone();
    wallBack.position.z = -d / 2;
    group.add(wallBack);

    // 侧墙
    const sideWallL = SH(new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, d), mat.wall));
    sideWallL.position.set(-w / 2, 4, 0);
    group.add(sideWallL);
    const sideWallR = sideWallL.clone();
    sideWallR.position.x = w / 2;
    group.add(sideWallR);

    // 正门
    const door = SH(new THREE.Mesh(new THREE.BoxGeometry(6, 5, 0.15), mat.woodDark));
    door.position.set(0, 4, d / 2 + 0.2);
    group.add(door);

    // 次间窗户
    for (const sign of [-1, 1]) {
      for (let i = 1; i <= 2; i++) {
        const win = SH(new THREE.Mesh(new THREE.BoxGeometry(3, 3, 0.1), mat.wood));
        win.position.set(sign * i * 5, 4.5, d / 2 + 0.2);
        group.add(win);
      }
    }

    // 斗拱 - 大型
    for (let i = -3; i <= 3; i++) {
      group.add(createDougong(i * 5, 8.3, d / 2 + 0.2, 1.3));
      group.add(createDougong(i * 5, 8.3, -d / 2 - 0.2, 1.3));
    }

    // 屋顶 - 庑殿顶
    const roof = createRoof(w, d, 7, 'wudian');
    roof.position.y = 9;
    group.add(roof);

    // 屋脊装饰
    const ridgeOrn = SH(new THREE.Mesh(new THREE.BoxGeometry(w * 0.5, 0.5, 0.6), mat.gold));
    ridgeOrn.position.set(0, 9 + 7, -d * 0.15);
    group.add(ridgeOrn);

    // 二十四诸天塑像（内部）
    const statueGroup = new THREE.Group();
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const r = 3;
      const statue = createStatue();
      statue.position.set(
        Math.cos(angle) * r,
        ph + 1.2,
        Math.sin(angle) * r
      );
      statueGroup.add(statue);
    }
    group.add(statueGroup);

    group.position.set(0, 0, -12);
    return group;
  }

  // ── 4. 普贤阁（金代两层楼阁）──
  function buildPuxianGe() {
    const group = new THREE.Group();

    const w = 8, d = 8, ph = 1;

    // 台基
    group.add(createPlatform(w + 2, d + 2, ph, 0, 0));

    // 一层柱子
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(createPillar(sx * w / 2.5, sz * d / 2.5, 4));
      }
    }

    // 一层墙
    const wall1Geom = new THREE.BoxGeometry(w, 3, 0.2);
    for (const sz of [-1, 1]) {
      const w1 = SH(new THREE.Mesh(wall1Geom, mat.wall));
      w1.position.set(0, 2, sz * d / 2);
      group.add(w1);
    }
    for (const sx of [-1, 1]) {
      const w1 = SH(new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, d), mat.wall));
      w1.position.set(sx * w / 2, 2, 0);
      group.add(w1);
    }

    // 一层斗拱
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(createDougong(sx * w / 2.5, 4.3, sz * d / 2.5, 0.6));
      }
    }

    // 一层屋顶（平座）
    const roof1 = SH(new THREE.Mesh(new THREE.BoxGeometry(w + 1.5, 0.4, d + 1.5), mat.roofDark));
    roof1.position.set(0, 4.8, 0);
    group.add(roof1);

    // 平座栏杆
    const railGeom = new THREE.BoxGeometry(w + 1.5, 0.8, 0.1);
    for (const sz of [-1, 1]) {
      const rail = SH(new THREE.Mesh(railGeom, mat.wood));
      rail.position.set(0, 5.4, sz * (d / 2 + 0.7));
      group.add(rail);
    }
    for (const sx of [-1, 1]) {
      const rail = SH(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, d + 1.5), mat.wood));
      rail.position.set(sx * (w / 2 + 0.7), 5.4, 0);
      group.add(rail);
    }

    // 二层柱子
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(createPillar(sx * w / 2.5, sz * d / 2.5, 3.5, 0.3));
      }
    }
    // 调整二层柱子位置（保留源逻辑）
    group.children.forEach(child => {
      if (child.geometry instanceof THREE.CylinderGeometry && child.position.y > 5) {
        child.position.y = 6.8;
      }
    });

    // 二层墙
    const wall2Geom = new THREE.BoxGeometry(w * 0.9, 2.5, 0.15);
    for (const sz of [-1, 1]) {
      const w2 = SH(new THREE.Mesh(wall2Geom, mat.wall));
      w2.position.set(0, 7.5, sz * d / 2.2);
      group.add(w2);
    }

    // 二层斗拱
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        group.add(createDougong(sx * w / 2.5, 8.3, sz * d / 2.5, 0.5));
      }
    }

    // 二层屋顶 - 歇山顶
    const roof2 = createRoof(w, d, 3.5, 'xieshan');
    roof2.position.y = 9;
    group.add(roof2);

    group.position.set(-22, 0, -5);
    return group;
  }

  // ── 5. 配殿廊庑 ──
  function buildPeidian() {
    const group = new THREE.Group();

    // 东廊庑
    group.add(createCorridor(-18, 22, -18, -5));

    // 西廊庑
    group.add(createCorridor(18, 22, 18, -5));

    // 后部廊庑
    group.add(createCorridor(-20, -25, 20, -25, true));

    return group;
  }

  function createCorridor(x1, z1, x2, z2, isHorizontal = false) {
    const group = new THREE.Group();
    const length = Math.hypot(x2 - x1, z2 - z1);
    const angle = Math.atan2(z2 - z1, x2 - x1);

    // 墙体
    const wall = SH(new THREE.Mesh(new THREE.BoxGeometry(length, 3, 0.3), mat.wallDark));
    wall.position.set((x1 + x2) / 2, 1.5, (z1 + z2) / 2);
    wall.rotation.y = -angle;
    group.add(wall);

    // 屋顶
    const roof = SH(new THREE.Mesh(new THREE.BoxGeometry(length + 1, 0.3, 2.5), mat.roof));
    roof.position.set((x1 + x2) / 2, 3.3, (z1 + z2) / 2);
    roof.rotation.y = -angle;
    group.add(roof);

    // 柱子
    const numPillars = Math.floor(length / 3);
    for (let i = 0; i <= numPillars; i++) {
      const t = i / numPillars;
      const px = x1 + (x2 - x1) * t;
      const pz = z1 + (z2 - z1) * t;
      group.add(createPillar(px, pz, 3, 0.2));
    }

    return group;
  }

  // ── 6. 斗拱结构（放大展示）──
  function buildDougongDisplay() {
    const group = new THREE.Group();

    // 创建一个放大的斗拱模型
    const scale = 2.5;

    // 栌斗
    const ludou = SH(new THREE.Mesh(
      new THREE.BoxGeometry(1.5 * scale, 0.8 * scale, 1.5 * scale),
      mat.woodDark
    ));
    ludou.position.y = 0;
    group.add(ludou);

    // 泥道拱
    const nidao = SH(new THREE.Mesh(
      new THREE.BoxGeometry(4 * scale, 0.4 * scale, 0.4 * scale),
      mat.wood
    ));
    nidao.position.y = 0.6 * scale;
    group.add(nidao);

    // 华拱第一跳
    const hua1 = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.4 * scale, 0.4 * scale, 3 * scale),
      mat.wood
    ));
    hua1.position.y = 0.6 * scale;
    hua1.position.z = 1 * scale;
    group.add(hua1);

    // 第一跳散斗
    const sandou1 = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.6 * scale, 0.35 * scale, 0.6 * scale),
      mat.woodDark
    ));
    sandou1.position.set(0, 0.85 * scale, 2 * scale);
    group.add(sandou1);

    // 华拱第二跳
    const hua2 = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.4 * scale, 0.4 * scale, 3 * scale),
      mat.wood
    ));
    hua2.position.y = 1.1 * scale;
    hua2.position.z = 1.5 * scale;
    group.add(hua2);

    // 第二跳散斗
    const sandou2 = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.6 * scale, 0.35 * scale, 0.6 * scale),
      mat.woodDark
    ));
    sandou2.position.set(0, 1.35 * scale, 2.8 * scale);
    group.add(sandou2);

    // 昂（下昂）
    const ang = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.35 * scale, 0.3 * scale, 2.5 * scale),
      mat.woodDark
    ));
    ang.position.set(0, 1.35 * scale, 2 * scale);
    ang.rotation.x = -0.3;
    group.add(ang);

    // 令拱
    const linggong = SH(new THREE.Mesh(
      new THREE.BoxGeometry(3 * scale, 0.35 * scale, 0.35 * scale),
      mat.wood
    ));
    linggong.position.set(0, 1.6 * scale, 2.8 * scale);
    group.add(linggong);

    // 齐心斗
    const qixin = SH(new THREE.Mesh(
      new THREE.BoxGeometry(0.5 * scale, 0.3 * scale, 0.5 * scale),
      mat.woodDark
    ));
    qixin.position.set(0, 1.85 * scale, 2.8 * scale);
    group.add(qixin);

    // 擦檐枋
    const chaoyan = SH(new THREE.Mesh(
      new THREE.BoxGeometry(5 * scale, 0.35 * scale, 0.35 * scale),
      mat.wood
    ));
    chaoyan.position.set(0, 2.1 * scale, 3.5 * scale);
    group.add(chaoyan);

    group.position.set(24, 2, -8);
    group.scale.set(0.8, 0.8, 0.8);
    return group;
  }

  // ── 7. 庭院点缀（源庭院地面/铺装/甬道为纯地板，未移植；保留古树与香炉）──
  function buildCourtyard() {
    const group = new THREE.Group();

    // 古树点缀
    for (const [tx, tz] of [[-15, 15], [15, 15], [-12, -2], [12, -2]]) {
      const trunk = SH(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 4, 8), mat.woodDark));
      trunk.position.set(tx, 2, tz);
      group.add(trunk);

      const crown = SH(new THREE.Mesh(new THREE.SphereGeometry(2.5, 12, 8), treeMat));
      crown.position.set(tx, 5, tz);
      group.add(crown);
    }

    // 香炉
    const xiangluBase = SH(new THREE.Mesh(new THREE.CylinderGeometry(1, 1.2, 0.5, 8), mat.stone));
    xiangluBase.position.set(0, 0.3, 3);
    group.add(xiangluBase);

    const xiangluBody = SH(new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.6, 1.5, 8), mat.gold));
    xiangluBody.position.set(0, 1.3, 3);
    group.add(xiangluBody);

    return group;
  }

  // ════════════════════════════════════════
  //  构建善化寺建筑群
  // ════════════════════════════════════════
  function buildShanhuaSi() {
    const g = new THREE.Group();
    g.add(buildCourtyard());
    g.add(buildShanmen());
    g.add(buildSanshengDian());
    g.add(buildDaxiongBaodian());
    g.add(buildPuxianGe());
    g.add(buildPeidian());
    g.add(buildDougongDisplay());

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
  window.GuJian.shanhua = buildShanhuaSi;
})();
