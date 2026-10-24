/* 悬空寺 3D 模型 —— 移植自开源项目 shanxi-gujian (github.com/vvlife/shanxi-gujian) hanging-temple-3d
 * 适配目标环境：Three.js r128 全局脚本版（window.THREE），禁止 import/export。
 * 结构：翠屏峰崖壁、27 根半插飞梁、立柱、南楼/北楼（三檐楼阁：平台/墙体/前柱/佛像/挑檐/栏杆/攒尖顶）、
 *       长线桥栈道（上下两层+支撑柱+桥顶）、寺院主体（平台+三殿+钟鼓楼）、"壮观"题刻。
 * 灯光/相机/地面/河流/UI/交互不移植；theme.js 仅注入 UI CSS 变量，3D 配色取自源 index.html 内联值。
 * 源模型无程序化建筑动画（无风铃/旗帜），故不设置 wrap.userData.animate。
 */
(function () {
  'use strict';

  const M = (color, opt = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0.05 }, opt));

  // ===== 材质（源配色内联常量，统一 MeshStandardMaterial） =====
  const MAT = {
    // 崖壁
    cliff: M(0x4a4640, { roughness: 0.92, metalness: 0.03, flatShading: true }),
    cliffDark: M(0x3a3630, { roughness: 0.95, metalness: 0.02, flatShading: true }),
    // 木作
    dark: M(0x5a3e22, { roughness: 0.82, metalness: 0.08 }),
    mid: M(0x8a6a3e, { roughness: 0.78, metalness: 0.06 }),
    light: M(0xa88848, { roughness: 0.75, metalness: 0.05 }),
    roof: M(0x3a2a18, { roughness: 0.85, metalness: 0.05 }),
    beam: M(0x6b5030, { roughness: 0.7, metalness: 0.1 }),
    gold: M(0xd4a84b, { roughness: 0.4, metalness: 0.6 }),
    goldBright: M(0xe8c878, { roughness: 0.35, metalness: 0.7 }),
    red: M(0x8a3a2e, { roughness: 0.7, metalness: 0.1 }),
    stone: M(0x5a5048, { roughness: 0.92, metalness: 0.03 }),
    // "壮观"题刻
    inscription: M(0xb8362e, { roughness: 0.6, metalness: 0.1, emissive: 0x8a2a20, emissiveIntensity: 0.1 }),
  };

  // ===== 翠屏峰崖壁（悬空寺背靠的凹形岩壁，与建筑造型一体，保留） =====
  function buildCliff() {
    const group = new THREE.Group();
    group.userData.partId = 'cliff';

    // 主崖壁（寺庙背后）
    const cliff = new THREE.Mesh(new THREE.BoxGeometry(50, 55, 12), MAT.cliff);
    cliff.position.set(0, 27, -10);
    group.add(cliff);

    // 凹龛（寺庙所在凹形岩壁）
    const concave = new THREE.Mesh(new THREE.BoxGeometry(20, 18, 4), MAT.cliffDark);
    concave.position.set(0, 15, -6);
    group.add(concave);

    // 上部岩檐（天然挡雨）
    const overhang = new THREE.Mesh(new THREE.BoxGeometry(24, 4, 6), MAT.cliff);
    overhang.position.set(0, 26, -4);
    group.add(overhang);

    // 岩面凸石
    for (let i = 0; i < 30; i++) {
      const size = 1 + Math.random() * 3;
      const bump = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), Math.random() > 0.5 ? MAT.cliff : MAT.cliffDark);
      bump.position.set(
        (Math.random() - 0.5) * 45,
        5 + Math.random() * 45,
        -8 + Math.random() * 8
      );
      bump.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(bump);
    }

    // 左右崖墙
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(15, 50, 10), MAT.cliff);
    leftWall.position.set(-28, 25, -8);
    group.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(15, 50, 10), MAT.cliff);
    rightWall.position.set(28, 25, -8);
    group.add(rightWall);

    // "壮观"题刻（崖面红匾）
    const inscription = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), MAT.inscription);
    inscription.position.set(0, 3, -3.5);
    group.add(inscription);

    return group;
  }

  // ===== 半插飞梁（27 根深入岩壁的悬臂横梁 + 入岩深色梁端） =====
  function buildBeams() {
    const group = new THREE.Group();
    group.userData.partId = 'beams';

    const beamPositions = [];
    // 南楼承重梁
    for (let i = 0; i < 8; i++) {
      beamPositions.push({ x: -8 + i * 0.3, y: 6 + i * 0.5, z: -2 });
    }
    // 寺院承重梁
    for (let i = 0; i < 7; i++) {
      beamPositions.push({ x: -3 + i * 1, y: 5 + Math.sin(i) * 0.5, z: -2 });
    }
    // 北楼承重梁
    for (let i = 0; i < 12; i++) {
      beamPositions.push({ x: 5 + i * 0.3, y: 8 + i * 0.6, z: -2 });
    }

    beamPositions.forEach(pos => {
      // 外露梁身
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 3, 8), MAT.beam);
      beam.rotation.z = Math.PI / 2;
      beam.position.set(pos.x, pos.y, pos.z + 0.5);
      group.add(beam);

      // 入岩梁端（深色）
      const end = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.5, 8), MAT.dark);
      end.rotation.z = Math.PI / 2;
      end.position.set(pos.x - 1.5, pos.y, pos.z - 0.5);
      group.add(end);
    });

    return group;
  }

  // ===== 立柱（悬而不承的辅助木柱） =====
  function buildPillars() {
    const group = new THREE.Group();
    group.userData.partId = 'pillars';

    const pillarPositions = [
      // 南楼立柱
      { x: -9, y: 2, h: 4 },
      { x: -7, y: 2, h: 5 },
      { x: -5, y: 2, h: 6 },
      // 寺院立柱
      { x: -2, y: 2, h: 3.5 },
      { x: 0, y: 2, h: 3.5 },
      { x: 2, y: 2, h: 3.5 },
      // 北楼立柱
      { x: 5, y: 2, h: 6 },
      { x: 7, y: 2, h: 7 },
      { x: 9, y: 2, h: 8 },
      { x: 11, y: 2, h: 9 },
    ];

    pillarPositions.forEach(pos => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, pos.h, 8), MAT.mid);
      pillar.position.set(pos.x, pos.y + pos.h / 2, pos.z || 1);
      group.add(pillar);
    });

    return group;
  }

  // ===== 楼阁（南楼/北楼通用：逐层平台、后墙、侧墙、前柱、楣梁、佛像、檐板、檐角、栏杆、顶部攒尖顶） =====
  function buildTower(config) {
    const partIds = config.partIds;
    const x = config.x, baseY = config.baseY, floors = config.floors;
    const width = config.width, depth = config.depth, floorHeight = config.floorHeight;
    const group = new THREE.Group();
    group.userData.partId = config.partIdTower;

    for (let f = 0; f < floors; f++) {
      const y = baseY + f * floorHeight;
      const partId = partIds[f];
      const fw = width - f * 0.3; // 逐层收分
      const fd = depth - f * 0.2;
      const sub = new THREE.Group();
      sub.userData.partId = partId;

      // 层平台
      const floor = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.3, fd), MAT.dark);
      floor.position.set(x, y, 0);
      sub.add(floor);

      // 后墙（贴崖）
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(fw, floorHeight * 0.7, 0.15), MAT.mid);
      backWall.position.set(x, y + floorHeight * 0.4, -fd / 2 + 0.1);
      sub.add(backWall);

      // 侧墙
      const sideWallGeo = new THREE.BoxGeometry(0.15, floorHeight * 0.7, fd);
      const leftWall = new THREE.Mesh(sideWallGeo, MAT.mid);
      leftWall.position.set(x - fw / 2 + 0.08, y + floorHeight * 0.4, 0);
      sub.add(leftWall);

      const rightWall = new THREE.Mesh(sideWallGeo, MAT.mid);
      rightWall.position.set(x + fw / 2 - 0.08, y + floorHeight * 0.4, 0);
      sub.add(rightWall);

      // 前檐柱
      const colHeight = floorHeight * 0.65;
      for (let c = 0; c < 3; c++) {
        const cx = x - fw / 2 + 0.5 + (c * (fw - 1)) / 2;
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, colHeight, 8), MAT.light);
        col.position.set(cx, y + 0.3 + colHeight / 2, fd / 2 - 0.15);
        sub.add(col);
      }

      // 柱上楣梁
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.2, 0.2), MAT.dark);
      lintel.position.set(x, y + 0.3 + colHeight, fd / 2 - 0.15);
      sub.add(lintel);

      // 殿内佛像（身 + 头）
      const statueHeight = floorHeight * 0.4;
      const statueMat = MAT.goldBright.clone();
      statueMat.emissive = new THREE.Color(0xd4a84b);
      statueMat.emissiveIntensity = 0.08;
      const statue = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, statueHeight, 12), statueMat);
      statue.position.set(x, y + 0.3 + statueHeight / 2 + 0.1, 0);
      sub.add(statue);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), statueMat);
      head.position.set(x, y + 0.3 + statueHeight + 0.35, 0);
      sub.add(head);

      // 檐板
      const roofY = y + floorHeight - 0.2;
      const roof = new THREE.Mesh(new THREE.BoxGeometry(fw + 0.8, 0.2, fd + 0.5), MAT.roof);
      roof.position.set(x, roofY, 0);
      sub.add(roof);

      // 挑檐角（起翘，简化）
      for (let e = 0; e < 2; e++) {
        const ex = x + (e === 0 ? -1 : 1) * (fw / 2 + 0.3);
        const eave = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.6, 4), MAT.dark);
        eave.position.set(ex, roofY + 0.2, fd / 2 - 0.1);
        eave.rotation.z = (e === 0 ? 1 : -1) * 0.3;
        sub.add(eave);
      }

      // 前栏杆
      const rail = new THREE.Mesh(new THREE.BoxGeometry(fw - 0.4, 0.4, 0.08), MAT.light);
      rail.position.set(x, y + 0.5, fd / 2 + 0.05);
      sub.add(rail);

      group.add(sub);
    }

    // 顶部攒尖顶（四棱锥，r128 ConeGeometry 可用）
    const topY = baseY + floors * floorHeight;
    const topRoof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.8, 1.5, 4), MAT.roof);
    topRoof.position.set(x, topY + 0.5, 0);
    topRoof.rotation.y = Math.PI / 4;
    topRoof.userData.partId = partIds[floors - 1];
    group.add(topRoof);

    return group;
  }

  // ===== 长线桥（连接南北楼的上下两层栈道 + 支撑柱 + 桥顶） =====
  function buildBridge() {
    const group = new THREE.Group();
    group.userData.partId = 'bridge';

    // 上层栈道
    const upperBridge = new THREE.Mesh(new THREE.BoxGeometry(10, 0.2, 1.5), MAT.mid);
    upperBridge.position.set(0, 11, 0.5);
    group.add(upperBridge);

    // 上层栏杆
    for (let i = 0; i < 2; i++) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(10, 0.5, 0.05), MAT.light);
      rail.position.set(0, 11.3, i === 0 ? -0.2 : 1.2);
      group.add(rail);
    }

    // 下层栈道
    const lowerBridge = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 1.3), MAT.mid);
    lowerBridge.position.set(0, 6.5, 0.5);
    group.add(lowerBridge);

    // 栈道支撑柱
    for (let i = 0; i < 4; i++) {
      const px = -3 + i * 2;
      const ph = 6.5 - 2;
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, ph, 6), MAT.mid);
      pillar.position.set(px, 2 + ph / 2, 0.8);
      group.add(pillar);
    }

    // 桥顶
    const bridgeRoof = new THREE.Mesh(new THREE.BoxGeometry(10, 0.15, 1.8), MAT.roof);
    bridgeRoof.position.set(0, 12, 0.5);
    group.add(bridgeRoof);

    return group;
  }

  // ===== 寺院主体（主平台 + 三座小殿 + 钟楼鼓楼） =====
  function buildCourtyard() {
    const group = new THREE.Group();
    group.userData.partId = 'courtyard';

    // 主平台
    const plat = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 4), MAT.dark);
    plat.position.set(0, 5, 0.5);
    group.add(plat);

    // 三座小殿
    for (let i = 0; i < 3; i++) {
      const hx = -3 + i * 3;
      const hall = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2, 2), MAT.mid);
      hall.position.set(hx, 6.2, 0);
      group.add(hall);

      const hallRoof = new THREE.Mesh(new THREE.ConeGeometry(2, 0.8, 4), MAT.roof);
      hallRoof.position.set(hx, 7.6, 0);
      hallRoof.rotation.y = Math.PI / 4;
      group.add(hallRoof);
    }

    // 钟楼（左）
    const bell = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1.5), MAT.light);
    bell.position.set(-5.5, 6.5, 0.5);
    group.add(bell);

    const bellRoof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.8, 4), MAT.roof);
    bellRoof.position.set(-5.5, 8.1, 0.5);
    bellRoof.rotation.y = Math.PI / 4;
    group.add(bellRoof);

    // 鼓楼（右）
    const drum = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1.5), MAT.light);
    drum.position.set(5.5, 6.5, 0.5);
    group.add(drum);

    const drumRoof = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.8, 4), MAT.roof);
    drumRoof.position.set(5.5, 8.1, 0.5);
    drumRoof.rotation.y = Math.PI / 4;
    group.add(drumRoof);

    return group;
  }

  function buildXuankongSi() {
    const g = new THREE.Group();

    g.add(buildCliff());
    g.add(buildBeams());
    g.add(buildPillars());
    g.add(buildTower({
      partIdTower: 'south-tower',
      partIds: ['south-l1', 'south-l2', 'south-l3'],
      x: -8,
      baseY: 5,
      floors: 3,
      width: 5,
      depth: 3.5,
      floorHeight: 2.5,
    }));
    g.add(buildTower({
      partIdTower: 'north-tower',
      partIds: ['north-l1', 'north-l2', 'north-l3'],
      x: 8,
      baseY: 6,
      floors: 3,
      width: 4.5,
      depth: 3,
      floorHeight: 2.8,
    }));
    g.add(buildBridge());
    g.add(buildCourtyard());

    // 阴影与 partId 语义标签统一落到每个 mesh
    g.traverse(o => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        if (!o.parent.userData.partId) o.userData.partId = o.parent.userData.partId;
      }
    });
    // 题刻为崖面装饰，仅接受阴影
    g.traverse(o => {
      if (o.isMesh && o.parent && o.parent.userData.partId === 'cliff' &&
          o.geometry && o.geometry.type === 'PlaneGeometry') {
        o.castShadow = false;
        o.userData.partId = 'cliff';
      }
    });

    // 归一化：整组缩放到高度约 14 单位，底部对齐 y=0，中心 x/z 对齐 0
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
  window.GuJian.hanging = buildXuankongSi;
})();
