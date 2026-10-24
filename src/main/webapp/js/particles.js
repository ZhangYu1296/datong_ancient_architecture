/* =========================================================
 * 银白粒子视觉系统（与短视频开场点云风格统一）
 *  Particles.init(canvas, opts)      —— 页面背景：漂移 + 闪烁 + 鼠标视差
 *  Particles.converge(canvas, done)  —— 加载动画：点云汇聚成型为文字
 * ======================================================= */

const Particles = (() => {
  "use strict";

  function makeParticles(w, h, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 0.8 + 0.2,             // 视差深度 0.2~1
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        tw: Math.random() * Math.PI * 2,           // 闪烁相位
        ts: 0.008 + Math.random() * 0.022
      });
    }
    return arr;
  }

  /* ---------- 背景粒子场 ---------- */
  function init(canvas, opts = {}) {
    const ctx = canvas.getContext("2d");
    let W, H, parts, mx = 0, my = 0, raf = 0, alive = true;
    const count = opts.count || 110;
    const base = opts.color || "rgba(214,228,255,";

    function resize() {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = Math.max(2, Math.round(rect.width));
      H = canvas.height = Math.max(2, Math.round(rect.height));
      parts = makeParticles(W, H, count);
    }
    resize();
    window.addEventListener("resize", resize);

    window.addEventListener("mousemove", (e) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 26;
      my = (e.clientY / window.innerHeight - 0.5) * 26;
    }, { passive: true });

    function frame() {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += p.ts;
        if (p.x < -8) p.x = W + 8; else if (p.x > W + 8) p.x = -8;
        if (p.y < -8) p.y = H + 8; else if (p.y > H + 8) p.y = -8;
        const a = (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(p.tw))) * p.z;
        ctx.beginPath();
        ctx.fillStyle = base + a.toFixed(3) + ")";
        ctx.arc(p.x + mx * p.z, p.y + my * p.z, p.r * p.z, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    frame();

    return {
      stop() { alive = false; cancelAnimationFrame(raf); }
    };
  }

  /* ---------- 点云汇聚成型动画：粒子飞聚成文字（如关卡名） ---------- */
  function converge(canvas, done, opts = {}) {
    const ctx = canvas.getContext("2d");
    const text = opts.text || "古建";
    const W = canvas.width = Math.max(200, canvas.clientWidth || 300);
    const H = canvas.height = Math.max(120, canvas.clientHeight || 200);

    /* 离屏画布绘制文字并采样目标点 */
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const octx = off.getContext("2d");
    octx.fillStyle = "#fff";
    octx.font = `700 ${Math.min(W, H) * (opts.scale || 0.52)}px "Noto Serif SC", "KaiTi", serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillText(text, W / 2, H / 2);
    const data = octx.getImageData(0, 0, W, H).data;
    const targets = [];
    const step = opts.step || 5;
    for (let y = 0; y < H; y += step) {
      for (let x = 0; x < W; x += step) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          targets.push({
            x: x + (Math.random() - 0.5) * 2.5,
            y: y + (Math.random() - 0.5) * 2.5
          });
        }
      }
    }
    if (!targets.length) { done && done(); return { stop() {} }; }

    const dots = targets.map(t => ({
      tx: t.x, ty: t.y,
      x: Math.random() * W, y: Math.random() * H,
      vx: 0, vy: 0
    }));

    const DUR = opts.duration || 2400;
    const t0 = performance.now();
    let raf = 0, alive = true;

    function frame(now) {
      if (!alive) return;
      raf = requestAnimationFrame(frame);
      const p = Math.min(1, (now - t0) / DUR);
      ctx.clearRect(0, 0, W, H);
      const ease = 1 - Math.pow(1 - p, 3);
      for (const d of dots) {
        /* 弹性趋近目标点，带轻微过冲 */
        d.vx = (d.vx + (d.tx - d.x) * 0.055) * 0.87;
        d.vy = (d.vy + (d.ty - d.y) * 0.055) * 0.87;
        d.x += d.vx; d.y += d.vy;
        ctx.fillStyle = `rgba(222,236,255,${(0.25 + 0.75 * ease).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.35, 0, Math.PI * 2);
        ctx.fill();
      }
      if (p >= 1) {
        alive = false;
        setTimeout(() => done && done(), 300);
      }
    }
    raf = requestAnimationFrame(frame);

    return { stop() { alive = false; cancelAnimationFrame(raf); } };
  }

  return { init, converge };
})();
