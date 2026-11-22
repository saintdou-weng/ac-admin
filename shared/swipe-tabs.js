/* VRT swipe-tabs v1.2 (2026-11-11)  https://saintdou-weng.github.io/ac-admin/shared/swipe-tabs.js
   Swipe left / right (finger, mouse drag, trackpad, or the ← → keys) to move to the next / previous tab of the page.
   One file for every VRT system. It only LISTENS and then presses the page's own tab, exactly as a tap would:
   - never calls preventDefault on touches, never changes styles, data or storage;
   - ignores gestures on form fields, canvases (signatures, maps), anything that scrolls sideways (wide tables,
     scrolling tab bars, carousels), text being selected, pinch / multi-touch, and edge "back" swipes;
   - ignores period switches (day / week / month / year), language switches and location filters;
   - does nothing when it cannot tell which tab is the current one.
   Opt out for an element and everything inside it with  data-noswipe . */
(function (root) {
  'use strict';
  if (root.VRTSwipeTabs) return;

  var CONTAINERS = '[role=tablist],nav,.nav,.seg,.sec-sw,.tabs,.tab-bar,.tabbar,.tab-nav,.nav-tabs,.main-tabs,.view-tabs,.hub-tabs,.ptabs,.od-tabs,.module-tabs-inner,.exp-nav,.tabs-inner,.tab-wrap,.tabs-wrap,.stab-nav';
  var DATA = ['data-tab', 'data-page', 'data-view', 'data-p', 'data-route', 'data-section'];
  var ITEM = 'button,a,[role=tab],[onclick],[data-tab],[data-page],[data-view],[data-p],[data-route],[data-section],.tab,.tab-btn,.tab-item';
  var TAB_TOKEN = /^(?:(?:[a-z]+-)?[psmv]?tab(?:-btn|-item|-active|-inactive)?|nav-btn)$/i;
  var ACTIVE = /(^|[\s_-])(on|active|act|sel|selected|current|cur|pri)$/;
  var NOT_TABS = /(period|pn-pt|month|year|week|lang|loc-tab|loc_tab|zone|ztab|filter|sort|pager|page-nav|pagination|theme|palette)/i;
  var WORDS = /^(日|週|周|月|季|年|半月|天|本期|今日|每日|每週|每周|每月|每季|每年|自訂|自定|daily|weekly|monthly|quarterly|yearly|annual|custom|day|week|month|quarter|year|today|d|w|h|m|q|y|c|all|ថ្ងៃ|សប្ដាហ៍|ខែ|ឆ្នាំ|中|中文|繁中|zh|en|eng|english|km|kh|ខ្មែរ|ក|\d{1,2}月|20\d\d(年)?|全部)$/i;
  var SKIP_TARGET = 'input,textarea,select,option,[contenteditable=""],[contenteditable=true],canvas,video,audio,iframe,[draggable=true],[data-noswipe],.leaflet-container,.map,.sig,.signature,.sigpad,input[type=range]';

  function visible(el) {
    if (!el || !el.getClientRects().length) return false;
    var r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  }
  function label(el) { return (el.textContent || '').replace(/[\u{1F000}-\u{1FAFF}☀-➿️‍]/gu, '').replace(/\s+/g, ' ').trim(); }
  function isActive(el) {
    if (el.getAttribute('aria-selected') === 'true' || el.getAttribute('aria-current')) return true;
    var c = (el.getAttribute('class') || '').split(/\s+/);
    for (var i = 0; i < c.length; i++) if (c[i] && (ACTIVE.test(c[i]) || c[i] === 'tab-active')) return true;
    return false;
  }
  function leavesPage(el) {
    if (el.tagName === 'A') {
      var h = el.getAttribute('href') || '';
      if (el.target === '_blank' || (h && h.charAt(0) !== '#' && !/^javascript:/i.test(h))) return true;
    }
    return /location\.|window\.open|history\.back/.test(el.getAttribute('onclick') || '');
  }
  /* what kind of button this is: tabs of one row share it, the "add / save / export" buttons next to them do not */
  function signature(el) {
    var oc = el.getAttribute('onclick');
    if (oc) { var m = /^[\s;]*([\w.$]+)/.exec(oc); return 'fn:' + (m ? m[1] : oc.slice(0, 12)); }
    for (var i = 0; i < DATA.length; i++) if (el.hasAttribute(DATA[i])) return 'data:' + DATA[i];
    var c = (el.getAttribute('class') || '').split(/\s+/).filter(function (t) { return t && !ACTIVE.test(t) && !/^tab-(in)?active$/.test(t); }).sort();
    return 'cls:' + el.tagName + '.' + c.join('.');
  }
  /* a password gate, dialog or overlay is lying on top of this element */
  function covered(el, doc) {
    var win = doc.defaultView, c = el.getBoundingClientRect(), x = c.left + c.width / 2, y = c.top + c.height / 2, vw = win.innerWidth, vh = win.innerHeight;
    if (x <= 0 || y <= 0 || x >= vw || y >= vh) return false;
    var top = doc.elementFromPoint(x, y);
    if (!top || el.contains(top) || top.contains(el)) return false;
    for (var p = top; p && p.nodeType === 1; p = p.parentElement) {
      if (p.contains(el)) return false;
      var pos = win.getComputedStyle(p).position;
      if (pos === 'fixed' || pos === 'absolute') { var r = p.getBoundingClientRect(); if (r.width >= vw * 0.7 && r.height >= vh * 0.5) return true; }
    }
    return false;
  }
  /* every usable tab row in this document: [{bar, items, index}] */
  function groups(doc) {
    var out = [], seen = [];
    var bars = Array.prototype.slice.call(doc.querySelectorAll(CONTAINERS));
    /* also rows whose children are plainly tabs, whatever the wrapper is called */
    Array.prototype.forEach.call(doc.querySelectorAll('[class*="tab"],[class*="nav-btn"]'), function (el) {
      var p = el.parentElement; if (!p || bars.indexOf(p) >= 0) return;
      var c = (el.getAttribute('class') || '').split(/\s+/);
      for (var i = 0; i < c.length; i++) if (TAB_TOKEN.test(c[i])) { bars.push(p); return; }
    });
    bars.forEach(function (bar) {
      if (seen.indexOf(bar) >= 0 || !visible(bar)) return; seen.push(bar);
      if (bar.closest('[data-noswipe]') || NOT_TABS.test(bar.getAttribute('class') || '') || NOT_TABS.test(bar.id || '')) return;
      if (bar.closest('aside,.rail,.sidebar,.mobile-nav,footer,dialog,[role=dialog]')) return;   /* main navigation is not a tab row */
      var cand = Array.prototype.filter.call(bar.querySelectorAll(ITEM), function (el) {
        if (!visible(el) || el.disabled || leavesPage(el)) return false;
        for (var p = el.parentElement; p && p !== bar; p = p.parentElement) if (p.matches(ITEM) || p.matches(CONTAINERS)) return false;   /* top level of this row only */
        return !NOT_TABS.test(el.getAttribute('class') || '');
      });
      var act = cand.filter(isActive);
      if (act.length !== 1) return;                                                  /* cannot tell the current tab → leave it alone */
      var sig = signature(act[0]);
      var items = cand.filter(function (el) { return el.tagName === act[0].tagName && signature(el) === sig; });
      if (items.length < 2 || items.length > 14) return;
      var words = items.filter(function (el) { return WORDS.test(label(el)); }).length;
      if (words >= items.length - 1) return;                                          /* a period / language switch */
      /* a row (it may wrap), not a vertical list */
      var a = items[0].getBoundingClientRect(), b = items[1].getBoundingClientRect();
      if (Math.abs(b.left - a.left) < 6 && b.top >= a.bottom - 2) return;
      if (covered(act[0], doc)) return;
      for (var k = 0; k < out.length; k++) if (out[k].items[0] === items[0]) return;     /* same row found through its wrapper */
      out.push({ bar: bar, items: items, index: items.indexOf(act[0]) });
    });
    return out;
  }
  /* inside something that scrolls sideways by itself (wide table, scrolling tab bar, carousel) → never ours */
  function scrollsSideways(el, doc) {
    for (var p = el; p && p.nodeType === 1 && p !== doc.documentElement && p !== doc.body; p = p.parentElement) {
      if (p.scrollWidth > p.clientWidth + 8) {
        var ox = (doc.defaultView.getComputedStyle(p).overflowX || '');
        if (ox === 'auto' || ox === 'scroll') return true;
      }
    }
    return false;
  }
  /* the page itself can still slide that way (wider than the screen, or zoomed in with two fingers) → the gesture belongs to the page.
     At the page's own left / right end there is nothing left to slide, so the tab switches there. */
  function pageCanPan(doc, dir) {
    var win = doc.defaultView, se = doc.scrollingElement || doc.documentElement, vv = win.visualViewport;
    if (vv && vv.scale > 1.02) return true;                                           /* zoomed in */
    var max = se.scrollWidth - (vv ? vv.width : se.clientWidth);
    if (max <= 24) return false;
    var x = vv ? vv.pageLeft : se.scrollLeft; return dir > 0 ? x < max - 2 : x > 2;
  }
  function blocked(target, doc, finger) {
    if (!target || target.nodeType !== 1) target = target && target.parentElement;
    if (!target) return true;
    var hit = target.closest(SKIP_TARGET);
    if (hit) {
      /* a finger sliding across a plain, unfocused field or drop-down does nothing in the browser, so it may switch tabs;
         a mouse drag there selects text, and a focused field is being edited → leave those alone */
      var plain = finger && hit === target.closest('input,select') && hit !== doc.activeElement && !hit.closest('[data-noswipe]') &&
        !/^(range|file|color)$/i.test(hit.getAttribute('type') || '');
      if (!plain) return true;
    }
    return scrollsSideways(target, doc);
  }
  /* dir: +1 next (finger moves left), -1 previous. y: where the gesture started (viewport px). */
  function move(doc, dir, y) {
    var gs = groups(doc).map(function (g) { g.top = g.bar.getBoundingClientRect().top; return g; })
      .sort(function (a, b) { return b.top - a.top; });                            /* nearest row above the finger first */
    var above = gs.filter(function (g) { return g.top <= y + 4; });
    var order = above.length ? above : gs.slice().reverse().slice(0, 1);
    for (var i = 0; i < order.length; i++) {
      var g = order[i], next = g.items[g.index + dir];
      if (!next) continue;                                                          /* at the end of this row → try the row above it */
      try {
        next.click();
        var bar = g.bar, r = next.getBoundingClientRect(), br = bar.getBoundingClientRect();
        if (bar.scrollWidth > bar.clientWidth + 4) bar.scrollLeft += (r.left + r.width / 2) - (br.left + br.width / 2);
      } catch (e) {}
      return true;
    }
    /* no tab row here, or already at its first / last tab: the page that holds this frame gets the swipe (same site only),
       like pages inside pages on a phone. Not while a field of this page is being filled in: an extra swipe must
       never push a half-typed form away. */
    var ae = doc.activeElement;
    if (gs.length && ae && ae.matches && ae.matches('input,textarea,select,[contenteditable=""],[contenteditable=true]')) return false;
    try {
      var w = doc.defaultView, fe = w.frameElement;
      if (fe && fe.ownerDocument && fe.ownerDocument.__vrtSwipe) return move(fe.ownerDocument, dir, fe.getBoundingClientRect().top + y);
    } catch (e) {}
    /* 2026-11-23 Paul：滑到最後一個分頁不要停 → 循環。沒有別排可以接手、也沒有外層頁面可以接手時，
       最靠近手指的那一排從最後一個繞回第一個（或第一個繞到最後一個）。 */
    for (var q = 0; q < order.length; q++) {
      var g2 = order[q], n2 = g2.items.length;
      if (n2 < 3 || g2.index < 0) continue;
      var wrapTo = dir > 0 ? (g2.index === n2 - 1 ? g2.items[0] : null) : (g2.index === 0 ? g2.items[n2 - 1] : null);
      if (!wrapTo) continue;
      try { wrapTo.click(); var b2 = g2.bar; if (b2.scrollWidth > b2.clientWidth + 4) b2.scrollLeft = dir > 0 ? 0 : b2.scrollWidth; } catch (e) {}
      return true;
    }
    return false;
  }

  function attach(doc) {
    if (!doc || doc.__vrtSwipe || !doc.documentElement) return false;
    doc.__vrtSwipe = true;
    /* a sideways swipe that the page has nothing to scroll with must not be taken by the browser as "go back / forward"
       (Chrome, Edge, Android). Has no effect on scrolling inside the page. iPhone's own edge-of-screen swipe cannot be switched off. */
    try { doc.documentElement.style.overscrollBehaviorX = 'none'; } catch (e) {}
    var win = doc.defaultView, t = null, lastAt = 0;
    function fire(dir, y) { var now = Date.now(); if (now - lastAt < 350) return false; var ok = move(doc, dir, y); if (ok) lastAt = now; return ok; }

    /* finger */
    doc.addEventListener('touchstart', function (e) {
      t = null; if (e.touches.length !== 1) return;
      var p = e.touches[0], W = win.innerWidth;
      if (p.clientX < 22 || p.clientX > W - 22) return;                              /* leave the browser's own edge swipe alone */
      if (blocked(e.target, doc, true)) return;
      t = { x: p.clientX, y: p.clientY, at: Date.now(), sx: win.scrollX, sy: win.scrollY, pan: [pageCanPan(doc, -1), 0, pageCanPan(doc, 1)] };
    }, { passive: true, capture: true });
    doc.addEventListener('touchmove', function (e) { if (t && e.touches.length !== 1) t = null; }, { passive: true, capture: true });
    doc.addEventListener('touchcancel', function () { t = null; }, { passive: true, capture: true });
    doc.addEventListener('touchend', function (e) {
      var s = t; t = null; if (!s || e.touches.length) return;
      var p = e.changedTouches[0], dx = p.clientX - s.x, dy = p.clientY - s.y, dt = Date.now() - s.at;
      if (dt > 700 || Math.abs(dx) < 64 || Math.abs(dx) < Math.abs(dy) * 2.2) return;
      if (Math.abs(win.scrollY - s.sy) > 12 || Math.abs(win.scrollX - s.sx) > 12) return;   /* the page itself moved: it was a scroll */
      if (s.pan[dx < 0 ? 2 : 0]) return;                                              /* the page had room to slide that way when the finger went down */
      fire(dx < 0 ? 1 : -1, s.y);
    }, { passive: true, capture: true });

    /* mouse: press, drag sideways, release */
    var m = null;
    doc.addEventListener('mousedown', function (e) {
      m = null; if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (blocked(e.target, doc)) return;
      m = { x: e.clientX, y: e.clientY, at: Date.now() };
    }, true);
    doc.addEventListener('mouseup', function (e) {
      var s = m; m = null; if (!s) return;
      var dx = e.clientX - s.x, dy = e.clientY - s.y, dt = Date.now() - s.at;
      if (dt > 900 || Math.abs(dx) < 110 || Math.abs(dx) < Math.abs(dy) * 2.5) return;
      var sel = ''; try { sel = String(win.getSelection ? win.getSelection() : ''); } catch (x) {}
      if (sel.replace(/\s/g, '').length) return;                                      /* the person was selecting text */
      if (fire(dx < 0 ? 1 : -1, s.y)) {
        /* the drag must not also count as a click on whatever is under the pointer */
        var eat = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
        doc.addEventListener('click', eat, true); setTimeout(function () { doc.removeEventListener('click', eat, true); }, 60);
      }
    }, true);

    /* trackpad two-finger sideways swipe / tilt wheel */
    var w = { sum: 0, sumY: 0, last: 0, y: 0, lock: 0, skip: false };
    doc.addEventListener('wheel', function (e) {
      if (e.ctrlKey || Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return;
      var now = Date.now(); if (now < w.lock) return;
      if (now - w.last > 320) { w.sum = 0; w.sumY = 0; w.y = e.clientY; w.skip = blocked(e.target, doc) || pageCanPan(doc, e.deltaX > 0 ? 1 : -1); }
      w.last = now; if (w.skip) return;
      w.sum += e.deltaX; w.sumY += Math.abs(e.deltaY);
      if (Math.abs(w.sum) > 160 && w.sumY < 80) { var d = w.sum > 0 ? 1 : -1; w.sum = 0; w.lock = now + 800; fire(d, w.y); }
    }, { passive: true, capture: true });
    return true;
  }

  /* keyboard ← / → on a computer: same as a swipe, for whatever page is showing (also the page inside a frame).
     Only when nobody is typing or using a control that needs the arrows itself, and the page has nothing to slide sideways. */
  var KEY_BUSY = 'input,textarea,select,option,[contenteditable=""],[contenteditable=true],video,audio,[role=slider],[role=listbox],[role=menu],[role=menubar],[role=grid],[role=tree],[role=radiogroup],[role=spinbutton],[role=combobox],[data-noswipe]';
  function deepest(win) {
    try {
      var best = null, area = 0, fs = win.document.querySelectorAll('iframe');
      for (var i = 0; i < fs.length; i++) {
        var r = fs[i].getBoundingClientRect(); if (r.width < 200 || r.height < 200 || !fs[i].getClientRects().length) continue;
        var cs = win.getComputedStyle(fs[i]); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none') continue;
        try { if (!fs[i].contentDocument || !fs[i].contentDocument.body) continue; } catch (e) { continue; }
        if (r.width * r.height > area) { area = r.width * r.height; best = fs[i]; }
      }
      return best ? deepest(best.contentWindow) : win;
    } catch (e) { return win; }
  }
  function keys(doc, hostOnly) {
    if (!doc || doc.__vrtKeys) return; doc.__vrtKeys = true;
    var last = 0;
    doc.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || e.isComposing) return;
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!dir) return;
      var ae = doc.activeElement;
      if (ae && ae.closest && ae.closest(KEY_BUSY)) return;
      if (ae && ae !== doc.body && scrollsSideways(ae, doc)) return;
      var now = Date.now(); if (now - last < 250) return;
      var w = deepest(doc.defaultView), d = w.document;
      if (hostOnly && d === doc) return;                                              /* the VRT OS home page itself has no tabs to move */
      try { var a2 = d.activeElement; if (a2 && a2.closest && a2.closest(KEY_BUSY)) return; } catch (x) {}
      if (pageCanPan(doc, dir) || pageCanPan(d, dir)) return;
      if (move(d, dir, w.innerHeight)) last = now;
    }, false);
  }

  /* attach to a window and every same-site frame inside it, now and as frames come and go */
  function sweep(win, skipSelf) {
    try { if (!skipSelf) attach(win.document); keys(win.document, skipSelf); for (var i = 0; i < win.frames.length; i++) sweep(win.frames[i], false); } catch (e) {}
  }
  function watch(win, skipSelf) { sweep(win, skipSelf); return win.setInterval(function () { sweep(win, skipSelf); }, 800); }

  root.VRTSwipeTabs = { attach: attach, sweep: sweep, watch: watch, groups: groups, move: move, blocked: blocked, version: '1.2' };
  /* a page that includes this file gets it for itself and its frames; the VRT OS shell sets data-host to keep its own home page out */
  var me = document.currentScript, host = me && me.getAttribute('data-host') === 'shell';
  var start = function () { watch(root, host); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})(window);

/* 2026-11-22 順帶載入 VRT 同步通知（vrt-bus.js）：來源平台更新 → 下游平台自動同步（單向）。
   每個平台都有載這支，所以掛在這裡一次到位；載入失敗不影響左右滑。 */
(function(){try{if(window.VRTBus||document.querySelector('script[src*="vrt-bus.js"]'))return;var s=document.createElement('script');s.src='https://saintdou-weng.github.io/ac-admin/shared/vrt-bus.js?v=1';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})();
/* 2026-11-22 順帶載入背景色融合（tint-bridge.js）：被嵌在 PSJHR／PSJERP／PSJGA／Admin OS 裡時，跟外框選的底色融合（選粉紅就粉紅，不出白塊黑塊）。 */
(function(){try{if(window.parent===window||window.VRTTint||document.querySelector('script[src*="tint-bridge.js"]'))return;var s=document.createElement('script');s.src='https://saintdou-weng.github.io/ac-admin/shared/tint-bridge.js?v=1';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})();
/* 2026-11-22 順帶載入卡片互動微變色（card-fx.js）：PSJERP、PSJHR、PSJGA、Admin OS、Audit 的可點卡片，滑鼠移入／手指按下時柔和變色。 */
(function(){try{if(window.VRTCardFx||document.querySelector('script[src*="card-fx.js"]'))return;if(!/^\/(psjhr|psjerp|psjgas|ac-admin|ac-audit)\//i.test(location.pathname))return;var s=document.createElement('script');s.src='https://saintdou-weng.github.io/ac-admin/shared/card-fx.js?v=1';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})();

/* 2026-11-23 順帶載入 ♪ 音樂開關＋🎨 共用調色盤（PSJERP repo 的 music.js，一支兩用）。
   Paul：各平台上方都要有音樂開關跟調色盤。PSJERP／PSJHR／生產平台自己已經載了，這裡跳過；
   調色盤只會出現在「自己沒有調色盤」的平台（Admin OS、HRA Portal、HRA-PAY、SEC、GA-EXP、Audit），不干涉 PSJGA／GASCheck 原本的換色。
   開關位置會自動避開頁面原有的按鈕；載入失敗不影響左右滑。 */
(function(){try{if(window.__VRT_MUSIC||document.querySelector('script[src*="/PSJERP/music.js"]'))return;if(/^\/(psjhr|psjerp|vrt-prod)\//i.test(location.pathname))return;var s=document.createElement('script');s.src='https://saintdou-weng.github.io/PSJERP/music.js?v=2.3.0';s.async=true;(document.head||document.documentElement).appendChild(s);}catch(e){}})();

/* 2026-11-23 Paul：嵌在別的平台裡的分頁（例：PSJGA 裡的 CCTV、Admin OS 裡的款式卡），點開重點卡／物品頁時不要被外框的頁首、
   左側選單佔掉一半 → 卡片開著的期間，把這個分頁暫時放大到整個視窗（只改外框那個 iframe 的位置大小），關掉卡片就還原。
   只認得已知的卡片：物品頁 .gip-ov、SEC／GASCheck 重點卡 .cmp-mask／.cmp-zoom、HRA 重點卡 #kn-mask、PSJ 重點卡 .pkn-mask、PSJERP／PSJHR 的 #drawer。
   不動資料、不動各頁功能；外框不是同網域就不做。 */
(function(){try{
  var W=window;if(W.parent===W||W.__vrtFrameZoom)return;
  try{if(!W.frameElement||W.parent.location.origin!==location.origin)return;}catch(e){return;}
  W.__vrtFrameZoom=1;
  function vis(e){return e&&(e.offsetWidth||e.offsetHeight)&&getComputedStyle(e).visibility!=='hidden';}
  function isOpen(){var d=document,els=d.querySelectorAll('.gip-ov,.cmp-mask,.cmp-zoom,#kn-mask.on,.pkn-mask.on,.pkn-mask[style*="flex"],.pkn-mask[style*="block"]');
    for(var i=0;i<els.length;i++)if(vis(els[i]))return true;
    var dr=d.getElementById('drawer');return !!(dr&&!dr.hidden&&vis(dr));}
  function chain(){var out=[],w=W;try{while(w!==w.parent&&w.frameElement&&w.parent.location.origin===location.origin){out.push(w.frameElement);w=w.parent;}}catch(e){}return out;}
  var on=false;
  function set(v){if(v===on)return;on=v;chain().forEach(function(f){try{
    if(v){if(f.__vz==null)f.__vz=f.getAttribute('style')||'';var hw=f.ownerDocument.defaultView;
      f.style.cssText=f.__vz+';position:fixed!important;left:0!important;top:0!important;width:'+hw.innerWidth+'px!important;height:'+hw.innerHeight+'px!important;max-width:none!important;max-height:none!important;min-height:0!important;z-index:9000!important;border:0!important;border-radius:0!important;margin:0!important;transform:none!important';
      var r=f.getBoundingClientRect();   /* 外框有 transform／毛玻璃時 fixed 會以它為準 → 用量到的位置補回來 */
      if(Math.abs(r.left)>1||Math.abs(r.top)>1){f.style.setProperty('left',(-r.left)+'px','important');f.style.setProperty('top',(-r.top)+'px','important');}
      f.setAttribute('data-vrt-zoom','1');}
    else if(f.__vz!=null){f.setAttribute('style',f.__vz);if(!f.__vz)f.removeAttribute('style');f.__vz=null;f.removeAttribute('data-vrt-zoom');}
  }catch(e){}});}
  var tm=0;function check(){if(tm)return;tm=setTimeout(function(){tm=0;try{set(isOpen());}catch(e){}},80);}
  function start(){try{new MutationObserver(check).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style','hidden','open']});}catch(e){}check();}
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
  W.addEventListener('pagehide',function(){try{set(false);}catch(e){}});
  try{W.parent.addEventListener('resize',function(){if(on){on=false;set(true);}});}catch(e){}
}catch(e){}})();
