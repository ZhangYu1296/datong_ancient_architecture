/* =========================================================
 * 进度状态管理（localStorage 方案 A）
 * 数据结构：
 * {
 *   levels:    [{ id, unlock, finish }...],   // 关卡解锁/通关
 *   fragments: [true/false...],               // 6 块碎片收集状态
 *   endingSeen: false,                        // 是否看过结局
 *   version: 1
 * }
 * ======================================================= */

const Progress = (() => {
  const KEY = "datong_gujian_v1";
  const TOTAL = (typeof LEVELS !== "undefined") ? LEVELS.length : 6;

  function fresh() {
    return {
      levels: Array.from({ length: TOTAL }, (_, i) => ({
        id: i + 1,
        unlock: i === 0,   // 默认只解锁第 1 关
        finish: false
      })),
      fragments: Array.from({ length: TOTAL }, () => false),
      endingSeen: false,
      version: 1
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      const d = JSON.parse(raw);
      if (!d || !Array.isArray(d.levels) || d.levels.length !== TOTAL ||
          !Array.isArray(d.fragments)) return fresh();
      return d;
    } catch (e) {
      return fresh();
    }
  }

  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* 隐私模式等 */ }
  }

  function findLevel(d, id) {
    return d.levels.find(l => l.id === id) || d.levels[0];
  }

  return {
    KEY,
    TOTAL,
    load,
    save,
    fresh,

    /* 单点查询 */
    isUnlocked(id)  { return findLevel(load(), id).unlock; },
    isFinished(id)  { return findLevel(load(), id).finish; },
    hasFragment(id) { const i = id - 1; return !!load().fragments[i]; },

    /* 通关第 id 关：标记 finish、点亮碎片、解锁下一关 */
    finishLevel(id) {
      const d = load();
      const lv = findLevel(d, id);
      const firstTime = !lv.finish;
      lv.finish = true;
      const idx = d.levels.findIndex(l => l.id === id);
      d.fragments[idx] = true;
      if (d.levels[idx + 1]) d.levels[idx + 1].unlock = true;
      save(d);
      return {
        firstTime,
        allDone: d.levels.every(l => l.finish),
        collected: d.fragments.filter(Boolean).length
      };
    },

    collectedCount() { return load().fragments.filter(Boolean).length; },
    allDone()        { return load().levels.every(l => l.finish); },
    markEndingSeen() { const d = load(); d.endingSeen = true; save(d); },

    /* 重新开始副本：清空全部进度 */
    reset() {
      try { localStorage.removeItem(KEY); } catch (e) {}
    }
  };
})();
