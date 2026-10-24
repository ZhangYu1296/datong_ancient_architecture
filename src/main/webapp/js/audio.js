/* =========================================================
 * 音效系统（WebAudio 合成，与短视频 BGM 同源的银白科技感）
 *  Sound.click()   点击     Sound.hover()   悬浮
 *  Sound.unlock()  解锁音阶  Sound.whoosh()  穿越转场
 *  Sound.hum()     粒子嗡鸣（环境循环）  Sound.stopHum()
 *  静音状态记忆于 localStorage（datong_sound_mute）
 * ======================================================= */

const Sound = (() => {
  "use strict";
  const MUTE_KEY = "datong_sound_mute";
  let ctx = null, humNodes = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function muted() {
    try { return localStorage.getItem(MUTE_KEY) === "1"; } catch (e) { return false; }
  }
  function setMute(m) {
    try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch (e) {}
  }

  function env(gain, t0, a, d, peak) {
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + a);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  }

  function tone(freq, t0, dur, peak = 0.1, type = "sine") {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g); g.connect(c.destination);
    env(g, t0, 0.012, dur, peak);
    o.start(t0); o.stop(t0 + dur + 0.08);
  }

  function click() {
    if (muted()) return;
    const c = ac(); if (!c) return;
    const t0 = c.currentTime;
    tone(880, t0, 0.09, 0.07, "triangle");
    tone(1320, t0 + 0.02, 0.12, 0.045, "sine");
  }

  function hover() {
    if (muted()) return;
    const c = ac(); if (!c) return;
    tone(1720, c.currentTime, 0.05, 0.018, "sine");
  }

  function unlock() {
    if (muted()) return;
    const c = ac(); if (!c) return;
    const t0 = c.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
      tone(f, t0 + i * 0.09, 0.4, 0.06, "sine"));
  }

  /* 穿越转场：噪声扫频 whoosh */
  function whoosh() {
    if (muted()) return;
    const c = ac(); if (!c) return;
    const t0 = c.currentTime, dur = 0.75;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = c.createBufferSource(); src.buffer = buf;
    const flt = c.createBiquadFilter(); flt.type = "bandpass";
    flt.frequency.setValueAtTime(260, t0);
    flt.frequency.exponentialRampToValueAtTime(2600, t0 + dur);
    const g = c.createGain();
    env(g, t0, 0.06, dur, 0.09);
    src.connect(flt); flt.connect(g); g.connect(c.destination);
    src.start(t0);
  }

  /* 环境粒子嗡鸣（低频双振荡 + 缓慢起伏） */
  function hum() {
    if (muted() || humNodes) return;
    const c = ac(); if (!c) return;
    const o1 = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
    o1.type = "sine"; o1.frequency.value = 108;
    o2.type = "sine"; o2.frequency.value = 163;
    const lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 0.14; lg.gain.value = 0.011;
    lfo.connect(lg); lg.connect(g.gain);
    g.gain.value = 0.028;
    o1.connect(g); o2.connect(g); g.connect(c.destination);
    o1.start(); o2.start(); lfo.start();
    humNodes = { o1, o2, lfo, g };
  }

  function stopHum() {
    if (!humNodes || !ctx) return;
    try { humNodes.g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.25); } catch (e) {}
    const h = humNodes; humNodes = null;
    setTimeout(() => {
      try { h.o1.stop(); h.o2.stop(); h.lfo.stop(); } catch (e) {}
    }, 700);
  }

  /* 全局事件委托：按钮 / 卡片 悬浮与点击自动出声 */
  document.addEventListener("click", (e) => {
    if (e.target.closest && e.target.closest(".btn, .gate-card, .quiz-opt")) click();
  });
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest && e.target.closest(".btn, .gate-card")) hover();
  });

  return {
    click, hover, unlock, whoosh, hum, stopHum,
    muted, setMute,
    toggle() { const m = !muted(); setMute(m); if (m) stopHum(); else hum(); return m; }
  };
})();
