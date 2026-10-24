/**
 * 山西古建统一主题切换脚本
 * 在所有页面引入：<script src="theme.js"></script>
 * 自动注入白天模式 CSS + 右上角切换按钮
 */
(function () {
  'use strict';

  // ===== 白天模式 CSS（覆盖所有页面的暗色变量） =====
  const dayCSS = `
[data-theme="day"] {
  /* 统一白天色板 — 覆盖所有已知变量名 */
  --ink-deep: #f0ebe0 !important;
  --ink-dark: #e6dfd0 !important;
  --ink-mid: #ddd4c0 !important;
  --ink: #f0ebe0 !important;
  --ink-soft: #e6dfd0 !important;

  --stone: #8a8270 !important;
  --stone-light: #aaa098 !important;

  --wood-light: #8a6a3a !important;
  --wood-mid: #6b4e2e !important;
  --wood-dark: #5a3e22 !important;
  --wood-deep: #4a3520 !important;
  --wood-darker: #3d2810 !important;

  --gold: #9a6a1a !important;
  --gold-bright: #b8842a !important;
  --gold-dim: #8a6a30 !important;
  --gold-glow: rgba(154, 106, 26, 0.2) !important;

  --red-seal: #9a3020 !important;
  --moss: #5a7a48 !important;

  --paper: #4a3a20 !important;
  --paper-dim: #6a5a3a !important;

  --text-light: #3a3528 !important;
  --text-light: #2e2820 !important;
  --text-dim: #5a5240 !important;
  --text-mute: #8a7e6a !important;
  --text-primary: #2e2820 !important;

  --bg-deep: #f0ebe0 !important;
  --bg-dark: #f0ebe0 !important;
  --bg-darker: #e6dfd0 !important;
  --bg-mid: #e6dfd0 !important;
  --bg-warm: #f5f0e6 !important;
  --bg-overlay: rgba(240, 235, 224, 0.92) !important;
  --bg-gradient: linear-gradient(to bottom, #f5f0e6, #e6dfd0) !important;
  --bg-gradient-top: #f5f0e6 !important;
  --bg-1: #f5f0e6 !important;
  --bg-2: #e6dfd0 !important;

  --border-soft: rgba(120, 100, 60, 0.25) !important;
  --border-mid: rgba(120, 100, 60, 0.45) !important;
  --panel-bg: rgba(245, 240, 230, 0.92) !important;
  --panel-border: rgba(120, 100, 60, 0.3) !important;
  --accent: #9a6a1a !important;
  --accent-gold: #b8842a !important;
  --vermillion: #8a3020 !important;
  --vermillion-bright: #a04030 !important;
  --roof-tile: #5a6a4a !important;
}

/* ===== 白天模式全局背景覆盖 ===== */
[data-theme="day"] html,
[data-theme="day"] body {
  background: #f0ebe0 !important;
  color: #2e2820 !important;
}

[data-theme="day"] #scene-container,
[data-theme="day"] #canvas-container,
[data-theme="day"] #loader {
  background: linear-gradient(to bottom, #e8e0d0 0%, #f5f0e6 50%, #e0d8c8 100%) !important;
}

[data-theme="day"] #scene-container::before,
[data-theme="day"] #canvas-container::before {
  background: none !important;
}

/* 面板/信息卡 背景变亮 */
[data-theme="day"] .info-panel,
[data-theme="day"] .panel,
[data-theme="day"] .info-card,
[data-theme="day"] .ui-panel,
[data-theme="day"] .overlay-panel,
[data-theme="day"] #info-panel,
[data-theme="day"] #info-card,
[data-theme="day"] #topbar,
[data-theme="day"] .topbar,
[data-theme="day"] .header-bar,
[data-theme="day"] .bottom-bar,
[data-theme="day"] .tool-bar,
[data-theme="day"] .controls {
  background: rgba(245, 240, 230, 0.9) !important;
  color: #2e2820 !important;
  border-color: rgba(120, 100, 60, 0.3) !important;
}

/* 渐变遮罩变亮 */
[data-theme="day"] .header-gradient,
[data-theme="day"] .top-gradient {
  background: linear-gradient(180deg, rgba(240, 235, 224, 0.9) 0%, transparent 100%) !important;
}

[data-theme="day"] .bottom-gradient {
  background: linear-gradient(0deg, rgba(240, 235, 224, 0.9) 0%, transparent 100%) !important;
}

/* 文字颜色 */
[data-theme="day"] .title,
[data-theme="day"] .main-title,
[data-theme="day"] h1,
[data-theme="day"] h2,
[data-theme="day"] h3 {
  color: #1a1a14 !important;
}

[data-theme="day"] .subtitle,
[data-theme="day"] .label,
[data-theme="day"] .desc,
[data-theme="day"] .description,
[data-theme="day"] p {
  color: #3a3528 !important;
}

/* 按钮 */
[data-theme="day"] .btn,
[data-theme="day"] button:not(.theme-toggle) {
  background: rgba(230, 223, 208, 0.8) !important;
  color: #5a4a2a !important;
  border-color: rgba(120, 100, 60, 0.3) !important;
}

[data-theme="day"] .btn:hover,
[data-theme="day"] button:not(.theme-toggle):hover {
  background: rgba(220, 210, 190, 0.9) !important;
  color: #3a2a10 !important;
  border-color: rgba(154, 106, 26, 0.5) !important;
}

/* ===== 主地图页面白天模式 ===== */
[data-theme="day"] #map-view {
  background: radial-gradient(ellipse at center, #f0e8d8 0%, #e0d8c8 70%) !important;
}

[data-theme="day"] #shanxi-svg {
  background: transparent !important;
}

[data-theme="day"] .city-path {
  fill: rgba(200, 190, 170, 0.3) !important;
  stroke: rgba(120, 100, 60, 0.3) !important;
}

[data-theme="day"] .city-path:hover {
  fill: rgba(200, 170, 120, 0.4) !important;
}

[data-theme="day"] .city-label {
  fill: rgba(80, 70, 50, 0.7) !important;
  font-weight: 600 !important;
}

[data-theme="day"] .marker-label {
  fill: #1a1a14 !important;
  stroke: rgba(255, 255, 255, 0.95) !important;
  stroke-width: 3.5 !important;
  font-weight: 700 !important;
  opacity: 1 !important;
}

[data-theme="day"] .marker-group:hover .marker-label {
  fill: #0a0a06 !important;
  stroke: rgba(255, 255, 255, 1) !important;
}

[data-theme="day"] .marker-era {
  fill: #6a5a3a !important;
  font-weight: 700 !important;
}

/* 白天模式建筑标记点 — 加深颜色提高对比度 */
[data-theme="day"] .marker-dot {
  stroke: rgba(255, 255, 255, 0.9) !important;
  stroke-width: 2 !important;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.3)) !important;
}

[data-theme="day"] .marker-group:hover .marker-dot {
  stroke: rgba(255, 255, 255, 1) !important;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4)) !important;
}

[data-theme="day"] .marker-ring {
  stroke: rgba(0, 0, 0, 0.2) !important;
  opacity: 0.5 !important;
}

[data-theme="day"] .marker-pulse {
  stroke: rgba(0, 0, 0, 0.15) !important;
}

/* 河流已移除 */

[data-theme="day"] #legend {
  background: rgba(245, 240, 230, 0.85) !important;
  color: #3a3528 !important;
  border-color: rgba(120, 100, 60, 0.2) !important;
}

[data-theme="day"] .view-btn {
  background: rgba(240, 235, 224, 0.8) !important;
  color: #5a5240 !important;
}

[data-theme="day"] .view-btn.active {
  background: rgba(154, 106, 26, 0.15) !important;
  color: #9a6a1a !important;
}

[data-theme="day"] #info-card {
  background: rgba(245, 240, 230, 0.95) !important;
  color: #2e2820 !important;
}

[data-theme="day"] #zoom-controls button {
  background: rgba(240, 235, 224, 0.85) !important;
  color: #8a6a1a !important;
}

/* 时间轴白天模式 */
[data-theme="day"] #timeline-view {
  background: radial-gradient(ellipse at center, #f0e8d8 0%, #e0d8c8 70%) !important;
}

[data-theme="day"] .timeline-title h1,
[data-theme="day"] .timeline-title p {
  color: #2e2820 !important;
}

[data-theme="day"] .era-card,
[data-theme="day"] .building-card {
  background: rgba(245, 240, 230, 0.95) !important;
  color: #1a1a14 !important;
  border-color: rgba(120, 100, 60, 0.2) !important;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;
}

[data-theme="day"] .era-card h2,
[data-theme="day"] .era-card h3,
[data-theme="day"] .building-card h3 {
  color: #1a1a14 !important;
}

[data-theme="day"] .era-card p,
[data-theme="day"] .building-card p {
  color: #3a3528 !important;
}

/* 书页白天模式 */
[data-theme="day"] #book-view {
  background: #e8e0d0 !important;
}

[data-theme="day"] .book-page {
  background: #f5f0e6 !important;
  color: #2e2820 !important;
}

[data-theme="day"] .book-page-inner {
  color: #3a3528 !important;
}

/* 卡片视图白天模式 */
[data-theme="day"] #grid-view {
  background: radial-gradient(ellipse at center, #f0e8d8 0%, #e0d8c8 70%) !important;
}

[data-theme="day"] .grid-card {
  background: rgba(245, 240, 230, 0.95) !important;
  color: #1a1a14 !important;
  border-color: rgba(120, 100, 60, 0.25) !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08) !important;
}

[data-theme="day"] .grid-card h3,
[data-theme="day"] .grid-card .card-title {
  color: #1a1a14 !important;
}

[data-theme="day"] .grid-card p,
[data-theme="day"] .grid-card .card-desc {
  color: #3a3528 !important;
}

/* 封印/印章 */
[data-theme="day"] .seal {
  filter: brightness(0.7) !important;
}
`;

  // ===== 注入 CSS =====
  const style = document.createElement('style');
  style.id = 'day-theme-css';
  style.textContent = dayCSS;
  (document.head || document.documentElement).appendChild(style);

  // ===== 切换按钮 =====
  const btnCSS = `
.theme-toggle {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid rgba(196, 168, 120, 0.3);
  background: rgba(19, 24, 32, 0.7);
  backdrop-filter: blur(8px);
  color: var(--gold-bright, #e8c878);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  user-select: none;
}
.theme-toggle:hover {
  background: rgba(58, 42, 24, 0.6);
  border-color: rgba(196, 168, 120, 0.6);
  transform: scale(1.08);
}
[data-theme="day"] .theme-toggle {
  background: rgba(240, 235, 224, 0.8);
  color: #9a6a1a;
  border-color: rgba(120, 100, 60, 0.3);
}
[data-theme="day"] .theme-toggle:hover {
  background: rgba(220, 210, 190, 0.9);
  border-color: rgba(120, 100, 60, 0.5);
}
`;
  const btnStyle = document.createElement('style');
  btnStyle.id = 'theme-toggle-css';
  btnStyle.textContent = btnCSS;
  (document.head || document.documentElement).appendChild(btnStyle);

  // ===== Three.js 场景日间适配 =====
  const DAY_BG = 0xe8e0d0;
  const DAY_FOG_NEAR = 0.5;  // 乘以原 fog near
  const DAY_FOG_FAR = 0.6;   // 乘以原 fog far（白天雾更短）

  function patchThreeScene() {
    if (typeof THREE === 'undefined') return;
    // 通过 window.scene 访问（module 脚本已暴露）
    var sc = null;
    try { sc = typeof scene !== 'undefined' ? scene : null; } catch(e) {}
    if (!sc && typeof window !== 'undefined') {
      sc = window.scene;
    }
    if (!sc || !sc.isScene) return;

    var isDay = document.documentElement.getAttribute('data-theme') === 'day';

    // ===== 白天模式：增强灯光强度 =====
    if (isDay) {
      if (!sc._origLights) {
        sc._origLights = [];
        sc.traverse(function (o) {
          if (o.isLight) {
            sc._origLights.push({ light: o, intensity: o.intensity });
            // 白天提亮灯光（不同类型不同倍率）
            var boost = 1.8;
            if (o.isAmbientLight) boost = 2.5;
            else if (o.isHemisphereLight) boost = 2.2;
            o.intensity = o.intensity * boost;
          }
        });
      }
    } else {
      if (sc._origLights) {
        sc._origLights.forEach(function (item) {
          item.light.intensity = item.intensity;
        });
        sc._origLights = null;
      }
    }

    if (isDay) {
      // 保存原值
      if (!sc._origBackground) {
        sc._origBackground = sc.background;
        sc._origFog = sc.fog ? {
          color: sc.fog.color.getHex(),
          near: sc.fog.near || 0,
          far: sc.fog.far || 0,
          density: sc.fog.density || 0,
          type: sc.fog.isFogExp2 ? 'exp2' : 'linear'
        } : null;
      }
      // 应用白天背景
      sc.background = new THREE.Color(DAY_BG);
      if (sc._origFog) {
        if (sc._origFog.type === 'exp2') {
          sc.fog = new THREE.FogExp2(DAY_BG, sc._origFog.density * 0.4);
        } else {
          sc.fog = new THREE.Fog(DAY_BG, sc._origFog.near, sc._origFog.far * 1.5);
        }
      }
    } else {
      // 恢复原值
      if (sc._origBackground) {
        sc.background = sc._origBackground;
      }
      if (sc._origFog) {
        if (sc._origFog.type === 'exp2') {
          sc.fog = new THREE.FogExp2(sc._origFog.color, sc._origFog.density);
        } else {
          sc.fog = new THREE.Fog(sc._origFog.color, sc._origFog.near, sc._origFog.far);
        }
      }
    }
  }

  // 延迟调用以确保 Three.js 场景已初始化
  setTimeout(patchThreeScene, 500);
  setTimeout(patchThreeScene, 2000);

  function createToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.title = '切换白天/夜间模式';
    btn.innerHTML = '<span class="theme-icon">🌙</span>';

    btn.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'day') {
        document.documentElement.removeAttribute('data-theme');
        btn.innerHTML = '<span class="theme-icon">🌙</span>';
        try { localStorage.setItem('theme', 'night'); } catch (e) {}
      } else {
        document.documentElement.setAttribute('data-theme', 'day');
        btn.innerHTML = '<span class="theme-icon">☀️</span>';
        try { localStorage.setItem('theme', 'day'); } catch (e) {}
      }
      // 切换 Three.js 场景背景
      setTimeout(patchThreeScene, 50);
    });

    return btn;
  }

  // 初始化
  function init() {
    // 恢复偏好
    try {
      var saved = localStorage.getItem('theme');
      if (saved === 'day') {
        document.documentElement.setAttribute('data-theme', 'day');
      }
    } catch (e) {}

    var btn = createToggle();
    // 同步图标
    if (document.documentElement.getAttribute('data-theme') === 'day') {
      btn.innerHTML = '<span class="theme-icon">☀️</span>';
    }
    document.body.appendChild(btn);

    // 如果初始就是白天模式，延迟补丁 Three.js
    if (document.documentElement.getAttribute('data-theme') === 'day') {
      setTimeout(patchThreeScene, 500);
      setTimeout(patchThreeScene, 2000);
    }
  }

  if (document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
