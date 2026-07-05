/* ═══════════════════════════════════════════════════════════════
   AC ADMIN CENTER — Universal Platform API   shared/platform-api.js  v1.0
   ─────────────────────────────────────────────────────────────────
   用法:在各平台「入口頁」</body> 前貼一行(全平台同一行,自動偵測):

   <script src="https://saintdou-weng.github.io/ac-admin/shared/platform-api.js"></script>

   功能:
   1. window.PlatformAPI — getSummary / getStatus / sync / upload /
      download / search / version / lastUpdate
   2. 自動掃描本平台 localStorage 資料 → 寫入共用 Hub key:ac_admin_hub
      (GitHub Pages 同源,Admin Center 直接讀取,即時更新)
   3. 攔截 localStorage.setItem → 資料一變動即刷新 Summary + Activity
   4. 若 ac_admin_config 已設定 gasUrl,自動每 10 分鐘推送 Summary 上雲
      (Telegram /admin 即可跨裝置查看)
   ─────────────────────────────────────────────────────────────────
   規範:不動平台原始資料。只讀取、只彙整。各平台完全獨立運作。
═══════════════════════════════════════════════════════════════ */
(function (G) {
  'use strict';
  if (G.PlatformAPI) return; // 防重複載入

  var HUB_KEY = 'ac_admin_hub';
  var CFG_KEY = 'ac_admin_config';
  var ACT_MAX = 300;

  /* ── 各平台資料地圖(由 Admin Center 統一維護)──
     type: arr=陣列筆數 / obj=物件 keys 數 / raw=存在即 1 / db=IndexedDB */
  var PLATFORMS = {
    hra: {
      name: 'AC-HRA Portal', icon: '👥', label: '人資平台',
      url: 'https://saintdou-weng.github.io/ac-hra-portal/hra_portal_v2.html',
      match: /ac-hra-portal/,
      keys: [
        { k: 'vrt_att_v5_db',      label: 'Attendance',   type: 'auto' },
        { k: 'ac_hra_joins',       label: 'Onboarding',   type: 'auto' },
        { k: 'ac_hra_resigns',     label: 'Resignations', type: 'auto' },
        { k: 'ac_hra_manpower_reqs', label: 'Manpower Req', type: 'auto', pending: true },
        { k: 'ac_hra_recruit',     label: 'Recruiting',   type: 'auto' },
        { k: 'vrt_maternity_v1',   label: 'Maternity',    type: 'auto' },
        { k: 'vrt_contracts',      label: 'Contracts',    type: 'auto' },
        { k: 'ac_hra_log',         label: 'HRA Log',      type: 'auto' }
      ]
    },
    pay: {
      name: 'AC-HRA Payroll', icon: '💰', label: '薪資平台',
      url: 'https://saintdou-weng.github.io/ac-hra-pay/index.html',
      match: /ac-hra-pay/,
      keys: [
        { k: 'hrpay:result:payroll', label: 'Payroll',     type: 'auto' },
        { k: 'hrpay:result:advance', label: 'Advance Pay', type: 'auto' },
        { k: 'hrpay:result:meal',    label: 'Meal Fee',    type: 'auto' },
        { k: 'vrt_salary_hr_v1',     label: 'Transfer/Salary', type: 'auto', pending: true },
        { k: 'vrt_roster',           label: 'Roster',      type: 'auto' },
        { k: 'vrt_att_records',      label: 'Att Records', type: 'auto' }
      ]
    },
    gascheck: {
      name: 'AC-GAS Check', icon: '🧹', label: '行政巡檢',
      url: 'https://saintdou-weng.github.io/ac-gascheck/ac_gascheck_portal_v1.html',
      match: /ac-gascheck/,
      keys: [
        { k: 'vrt_c7',            label: 'Cleaning',     type: 'auto' },
        { k: 'vrt_a7',            label: 'Asset',        type: 'auto' },
        { k: 'vrt_p7',            label: 'Patrol/EHS',   type: 'auto' },
        { k: 'wdr_data',          label: 'Water Drum',   type: 'auto' },
        { k: 'vrt_keys',          label: 'Key Movement', type: 'auto' },
        { k: 'vrt_dorm_draft',    label: 'Dormitory',    type: 'auto' },
        { k: 'ac_waterdrum_backup', label: 'WD Backup',  type: 'auto' }
      ]
    },
    gaexp: {
      name: 'AC-GA Expense', icon: '🧾', label: '總務請購/費用',
      url: 'https://saintdou-weng.github.io/ac-ga-exp/index.html',
      match: /ac-ga-exp/,
      keys: [
        { k: 'vrt26b',            label: 'Expense',      type: 'auto' },
        { k: 'vrt_dsl_gas',       label: 'Fuel/Diesel',  type: 'auto' },
        { k: 'vrt_receive_data',  label: 'Receiving',    type: 'auto' },
        { k: 'ac_ga_exp_config',  label: 'Config',       type: 'raw' }
      ]
    },
    sec: {
      name: 'AC-Security', icon: '🛡️', label: '保全平台',
      url: 'https://saintdou-weng.github.io/ac-gas-sec/index.html',
      match: /ac-gas-sec/,
      keys: [
        { k: 'vrt_patrol_cache',  label: 'Patrol',        type: 'auto' },
        { k: 'vrt_cameras',       label: 'CCTV',          type: 'auto' },
        { k: 'vrt_truck_v2',      label: 'Container/Truck', type: 'auto' },
        { k: 'vr-container-inspections', label: 'Inspections', type: 'auto' },
        { k: 'vrt-v9',            label: 'Attendance',    type: 'auto' },
        { k: 'vrt_v2',            label: 'Commute',       type: 'auto' },
        { k: 'ac_sec_lastmod',    label: 'Last Modified', type: 'raw' }
      ]
    },
    audit: {
      name: 'AC-Audit', icon: '📋', label: '驗廠平台',
      url: 'https://saintdou-weng.github.io/ac-audit/ac_audit_platform_v1.html',
      match: /ac-audit/,
      keys: [
        { k: 'vrt_dcc_v2',        label: 'Documents (DCC)', type: 'auto', expiry: true },
        { k: 'vrt3_tr',           label: 'Training',        type: 'auto' },
        { k: 'vrt3_rc',           label: 'Records',         type: 'auto' },
        { k: 'msgProcessor_data', label: 'MSG Processor',   type: 'auto' },
        { k: 'vl',                label: 'Law Library',     type: 'auto' }
      ]
    },
    admin: {
      name: 'AC Admin Center', icon: '🏛️', label: '行政中心',
      url: 'https://saintdou-weng.github.io/ac-admin/index.html',
      match: /ac-admin/,
      keys: [
        { k: 'ac_admin_org',              label: 'Organization',     type: 'auto' },
        { k: 'ac_admin_salary_structure', label: 'Salary Structure', type: 'auto' },
        { k: 'ac_admin_salary_adjust',    label: 'Salary Adjust',    type: 'auto', pending: true },
        { k: 'ac_admin_budget',           label: 'Budget',           type: 'auto' }
      ]
    }
  };

  /* ── 自動偵測目前所在平台 ── */
  function detectPlatform() {
    var tag = document.currentScript && document.currentScript.getAttribute('data-platform');
    if (tag && PLATFORMS[tag]) return tag;
    var p = location.pathname + location.hostname;
    for (var id in PLATFORMS) {
      if (PLATFORMS[id].match.test(p)) return id;
    }
    return null;
  }

  /* ── 工具 ── */
  function nowStr() {
    var d = new Date();
    function z(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) +
      ' ' + z(d.getHours()) + ':' + z(d.getMinutes()) + ':' + z(d.getSeconds());
  }
  function safeParse(s) { try { return JSON.parse(s); } catch (e) { return null; } }

  /* 通用計數:陣列→length;物件→找最大的內層陣列或 keys 數 */
  function countAny(v) {
    if (v == null) return 0;
    if (Array.isArray(v)) return v.length;
    if (typeof v === 'object') {
      var best = 0, keys = Object.keys(v);
      for (var i = 0; i < keys.length; i++) {
        var x = v[keys[i]];
        if (Array.isArray(x) && x.length > best) best = x.length;
      }
      return best || keys.length;
    }
    return 1;
  }

  /* 通用待辦偵測:深掃 status/state 欄位 */
  var PENDING_RE = /^(pending|waiting|draft|open|submitted|review|processing|待|草稿|審核中)/i;
  function countPending(v, depth) {
    if (v == null || depth > 4) return 0;
    var n = 0;
    if (Array.isArray(v)) {
      for (var i = 0; i < v.length; i++) n += countPending(v[i], depth + 1);
    } else if (typeof v === 'object') {
      var st = v.status || v.state || v.approval || '';
      if (typeof st === 'string' && PENDING_RE.test(st)) n++;
      for (var k in v) {
        if (typeof v[k] === 'object') n += countPending(v[k], depth + 1);
      }
    }
    return n;
  }

  /* ── 掃描平台 → 產生 Summary ── */
  function buildSummary(pid) {
    var cfg = PLATFORMS[pid];
    var counts = {}, total = 0, pending = 0, alerts = 0, found = 0;
    cfg.keys.forEach(function (spec) {
      var raw = localStorage.getItem(spec.k);
      if (raw == null) { counts[spec.label] = null; return; }
      found++;
      if (spec.type === 'raw') { counts[spec.label] = 1; return; }
      var v = safeParse(raw);
      var c = (v == null) ? 1 : countAny(v);
      counts[spec.label] = c;
      total += c;
      if (v != null && typeof v === 'object') pending += countPending(v, 0);
    });
    return {
      id: pid, name: cfg.name, icon: cfg.icon, label: cfg.label, url: cfg.url,
      counts: counts, totalRecords: total, pending: pending, alerts: alerts,
      modulesFound: found, modulesTotal: cfg.keys.length,
      lastUpdate: nowStr(), version: G.PLATFORM_VERSION || 'v1',
      cloud: !!(localStorage.getItem('ac_hra_gas_url') || localStorage.getItem('vrt_gas_url') ||
                localStorage.getItem('hrpay_gas_url') || localStorage.getItem('ac_gascheck_gas_url') ||
                (safeParse(localStorage.getItem('ac_ga_exp_config')) || {}).gasUrl),
      tg: !!(localStorage.getItem('vrt_tg_token') || localStorage.getItem('tg_token') ||
             localStorage.getItem('ac_gascheck_tg_token') || localStorage.getItem('vrt_dsl_tg_token'))
    };
  }

  /* ── Hub 讀寫 ── */
  function readHub() {
    return safeParse(localStorage.getItem(HUB_KEY)) || { platforms: {}, activity: [] };
  }
  function writeHub(hub) {
    try { localStorage.setItem(HUB_KEY, JSON.stringify(hub)); } catch (e) { /* quota */ }
  }
  function publish(eventLabel) {
    var pid = CURRENT; if (!pid) return;
    var hub = readHub();
    var prev = hub.platforms[pid];
    var sum = buildSummary(pid);
    /* 今日更新次數 */
    var today = nowStr().slice(0, 10);
    sum.todayUpdates = (prev && prev.lastUpdate && prev.lastUpdate.slice(0, 10) === today)
      ? (prev.todayUpdates || 0) + (eventLabel ? 1 : 0)
      : (eventLabel ? 1 : 0);
    hub.platforms[pid] = sum;
    if (eventLabel) {
      hub.activity.unshift({ t: nowStr(), p: pid, name: sum.name, e: eventLabel });
      if (hub.activity.length > ACT_MAX) hub.activity.length = ACT_MAX;
    }
    writeHub(hub);
  }

  /* ── 攔截 setItem:平台資料一變動即更新 Hub ── */
  var CURRENT = detectPlatform();
  var WATCH = {};
  if (CURRENT) {
    PLATFORMS[CURRENT].keys.forEach(function (s) { WATCH[s.k] = s.label; });
    var _set = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (k, v) {
      _set(k, v);
      if (WATCH[k]) {
        clearTimeout(publish._t);
        publish._t = setTimeout(function () { publish(WATCH[k] + ' updated'); }, 800);
      }
    };
  }

  /* ── 雲端推送(選用:ac_admin_config.gasUrl)── */
  function cloudPush() {
    var cfg = safeParse(localStorage.getItem(CFG_KEY)) || {};
    if (!cfg.gasUrl) return Promise.resolve({ ok: false, error: 'No GAS URL' });
    var hub = readHub();
    return fetch(cfg.gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'pushHub', hub: hub, from: CURRENT || 'unknown', at: nowStr() })
    }).then(function (r) { return r.json(); })
      .catch(function (e) { return { ok: false, error: e.message }; });
  }
  function cloudPull() {
    var cfg = safeParse(localStorage.getItem(CFG_KEY)) || {};
    if (!cfg.gasUrl) return Promise.resolve({ ok: false, error: 'No GAS URL' });
    return fetch(cfg.gasUrl + '?action=pullHub', { redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j.ok && j.hub) {
          /* 合併:各平台取 lastUpdate 較新者 */
          var local = readHub();
          for (var pid in j.hub.platforms) {
            var rp = j.hub.platforms[pid], lp = local.platforms[pid];
            if (!lp || (rp.lastUpdate || '') > (lp.lastUpdate || '')) local.platforms[pid] = rp;
          }
          writeHub(local);
        }
        return j;
      }).catch(function (e) { return { ok: false, error: e.message }; });
  }

  /* ── 通用深度搜尋 ── */
  function deepSearch(q) {
    q = (q || '').toLowerCase();
    if (!q) return [];
    var out = [];
    for (var pid in PLATFORMS) {
      PLATFORMS[pid].keys.forEach(function (spec) {
        var raw = localStorage.getItem(spec.k);
        if (!raw) return;
        var low = raw.toLowerCase();
        var idx = low.indexOf(q);
        var hits = 0;
        while (idx !== -1 && hits < 5) {
          out.push({
            platform: pid, name: PLATFORMS[pid].name, icon: PLATFORMS[pid].icon,
            module: spec.label, key: spec.k,
            snippet: raw.slice(Math.max(0, idx - 40), idx + q.length + 60).replace(/[{}\[\]"]/g, ' ').trim()
          });
          hits++;
          idx = low.indexOf(q, idx + q.length);
        }
      });
    }
    return out;
  }

  /* ── 公開 API ── */
  G.PlatformAPI = {
    version: function () { return '1.0'; },
    platform: CURRENT,
    platforms: PLATFORMS,
    getSummary: function (pid) {
      /* getSummary('hra')→單平台;getSummary('*')→全平台 map;
         getSummary()→當前平台(Admin Center 本身則回全平台 map) */
      if (pid && pid !== '*') return buildSummary(pid);
      if (pid !== '*' && CURRENT && CURRENT !== 'admin') return buildSummary(CURRENT);
      var all = {}; for (var id in PLATFORMS) all[id] = buildSummary(id);
      return all;
    },
    getStatus: function () {
      var hub = readHub();
      return { platform: CURRENT, hubPlatforms: Object.keys(hub.platforms).length, activity: hub.activity.length };
    },
    lastUpdate: function (pid) {
      var hub = readHub();
      var p = hub.platforms[pid || CURRENT];
      return p ? p.lastUpdate : null;
    },
    search: deepSearch,
    sync: function () { publish(null); return cloudPush(); },
    upload: cloudPush,
    download: cloudPull,
    refresh: function () { publish(null); },
    readHub: readHub
  };

  /* ── 啟動:載入即發佈一次;每 10 分鐘雲端推送(若已設定)── */
  if (CURRENT) {
    setTimeout(function () { publish(null); }, 1200);
    setInterval(function () { publish(null); cloudPush(); }, 10 * 60 * 1000);
  }
})(window);
