/* VRT 左上角 Logo 開關選單 vrt-shell.js v1（2026-11-22）
   Paul：PSJHR／PSJERP／PSJGA 都像 Admin OS 一樣，左上角放 VRT 標誌，點一下開、再點一下關左側選單；
         要「隨按隨開隨關」，不能按一次之後就沒反應。
   以前的問題：手機上選單打開後會蓋住 ☰ 鈕，又沒有半透明遮罩，只能點選單裡的項目才關得掉 → 看起來像「按一次就沒效」。
   現在：
   · 頂部的 ☰ 換成 VRT 標誌（同一顆鈕、同一個功能）；
   · 手機：選單打開時，選單頂端的 VRT 標誌在同一個位置 → 再點一下就關；點選單外面的半透明區也會關；
   · 電腦：點 VRT 標誌收起／展開左側選單（記住你的選擇），畫面變寬。
   · 被 Admin OS 嵌在裡面時不動（Admin OS 有自己的選單）。只改外框，不碰資料與功能。 */
(function(G){
'use strict';
if(G.VRTShell)return;G.VRTShell=1;
(function(){/* 2026-11-22 Paul：PSJGA 手機上方（原系統紀錄＋大標題＋日週月年＋年月選擇）太佔空間 → 縮成兩排，學 Admin OS：
   第一排＝資料狀態燈號＋「更新資料／連線設定」小圖示鈕；第二排＝日週月年＋◀ 年 月 ▶。
   大標題在頂部麵包屑已經有了，手機上收起（標題列有按鈕的頁面照常顯示）。電腦版不變。 */
if(/^\/psjgas\//i.test(location.pathname)){var D=document,gc=D.createElement('style');gc.id='vrt-ga-compact';gc.textContent='@media(max-width:720px){'+
 '.cloud-toolbar.source-toolbar{flex-wrap:nowrap!important;gap:6px!important;padding:6px 8px!important;margin:0 0 8px!important;border-radius:12px!important}'+
 '.source-toolbar .cloud-toolbar-status{min-width:0;flex:1 1 auto;display:flex;align-items:center;gap:6px;overflow:hidden}'+
 '.source-toolbar .cloud-toolbar-status>svg,.source-toolbar .cloud-toolbar-status strong,.source-toolbar .cloud-toolbar-status small{display:none!important}'+
 '.source-toolbar .cloud-toolbar-status>div{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.source-toolbar .pill{font-size:11.5px!important;padding:3px 9px!important;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.source-toolbar .cloud-actions{display:flex!important;flex:none;gap:5px!important;flex-wrap:nowrap!important}'+
 '.source-toolbar .cloud-actions .btn{font-size:0!important;width:34px;height:34px;min-height:34px!important;padding:0!important;display:inline-grid!important;place-items:center;gap:0!important}'+
 '.source-toolbar .cloud-actions .btn.primary{font-size:12px!important;width:auto;padding:0 10px!important;display:inline-flex!important;gap:5px!important}'+
 '.source-toolbar .cloud-actions .btn svg{width:17px!important;height:17px!important;margin:0!important}'+
 '.title-row:not(:has(button,a,select,input)){display:none!important}'+
 '.periodbar{flex-wrap:nowrap!important;gap:5px!important;margin-bottom:12px!important}'+
 '.periodbar .segments{width:auto!important;flex:none;padding:3px!important;gap:2px!important}'+
 '.periodbar .segments button{flex:none!important;padding:0 8px!important;min-height:30px!important;font-size:12px!important}'+
 '.periodbar .periodnav{width:auto!important;flex:1 1 auto;min-width:0;gap:4px!important;justify-content:flex-end!important}'+
 '.periodbar .periodnav select,.periodbar .periodnav input{min-width:0;flex:1 1 0;max-width:96px;height:32px!important;min-height:32px!important;padding:0 18px 0 6px!important;font-size:12.5px!important;background-position:right 4px center!important}'+
 '.periodbar .periodnav .btn.square{width:30px!important;height:32px!important;min-height:32px!important;min-width:30px!important;padding:0!important;flex:none}'+
 '.periodbar .periodnav .period-label{font-size:11.5px;white-space:nowrap}'+
 '.periodbar .periodnav [data-action="today"],.periodbar .range{display:none!important}'+
 '}';(D.head||D.documentElement).appendChild(gc);}})();   /* 被 Admin OS 嵌著時也縮 */
try{if(G.top!==G)return;}catch(e){return;}
var D=document,P=(location.pathname||'').toLowerCase(),K='vrt_shell_side_off_'+(P.split('/')[1]||'x');
var GA=P.indexOf('/psjgas/')===0;
var CFG=GA?{bp:850,btn:'.topbar [data-action="menu"]',side:'.sidebar',isOpen:function(s){return s.classList.contains('open');},brand:'.sidebar .brand',
  off:'html.vs-off .sidebar{display:none!important}html.vs-off .shell{display:block!important}html.vs-off .main-shell{grid-column:auto!important}'}
 :{bp:860,btn:'#menuBtn',side:'#rail',isOpen:function(s){return s.classList.contains('open');},brand:'#rail .brand',
  off:'html.vs-off .rail{display:none!important}html.vs-off .app{grid-template-columns:minmax(0,1fr)!important}'};
function wide(){return G.innerWidth>CFG.bp;}
var st=D.createElement('style');st.id='vrt-shell-css';
st.textContent=
 /* ☰ → VRT 標誌（只換外觀，用 CSS，平台重畫也不會掉） */
 CFG.btn+'{display:inline-grid!important;place-items:center;width:auto!important;min-width:42px;height:36px;padding:0 9px!important;border-radius:9px!important;border:0!important;background:linear-gradient(135deg,#2563EB,#1D4ED8)!important;color:#fff!important;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,.28)}'+
 CFG.btn+'>svg,'+CFG.btn+'>*{display:none!important}'+CFG.btn+'::before{content:"VRT";font:800 13.5px/1 system-ui,-apple-system,"Segoe UI",sans-serif;letter-spacing:.04em}'+
 CFG.btn+':active{transform:scale(.94)}'+
 'html.vs-off '+CFG.btn+'{box-shadow:0 0 0 3px rgba(37,99,235,.25),0 2px 8px rgba(37,99,235,.28)}'+
 /* 手機：選單外面的半透明遮罩，點了就關 */
 '.vs-scrim{position:fixed;inset:0;z-index:54;background:rgba(10,16,22,.38);display:none;-webkit-tap-highlight-color:transparent}.vs-scrim.on{display:block}'+
 (GA?'':'@media(max-width:'+CFG.bp+'px){#rail .brand{cursor:pointer}}')+
 /* 電腦：收起左側選單 */
 '@media(min-width:'+(CFG.bp+1)+'px){'+CFG.off+'}';
(D.head||D.documentElement).appendChild(st);

var off=false;try{off=localStorage.getItem(K)==='1';}catch(e){}
function apply(){D.documentElement.classList.toggle('vs-off',off&&wide());}
apply();G.addEventListener('resize',apply);
var scrim=null;
function side(){return D.querySelector(CFG.side);}
function setOpen(v){var s=side();if(!s)return;
 if(GA){if(CFG.isOpen(s)!==v){var b=D.querySelector(CFG.btn);if(b){b.__vs=1;b.click();b.__vs=0;}}return;}
 s.classList.toggle('open',v);sync();}
function sync(){if(GA)return;var s=side();if(!scrim){scrim=D.createElement('div');scrim.className='vs-scrim';scrim.addEventListener('click',function(){setOpen(false);});D.body.appendChild(scrim);}
 scrim.classList.toggle('on',!!(s&&!wide()&&CFG.isOpen(s)));}
/* 按 VRT 標誌：電腦＝收起／展開；手機＝開／關。
   在「手指按下」那一刻就動作（PSJGA 讀資料時會一直重畫頂部，等到放開手指時按鈕可能已換新，點擊就被吃掉 → 看起來按了沒反應） */
var supp=0;
function toggle(b){
 if(wide()){off=!off;try{localStorage.setItem(K,off?'1':'0');}catch(x){}apply();return;}
 if(GA){b.__vs=1;try{b.click();}finally{b.__vs=0;}return;}
 var s=side();setOpen(!(s&&CFG.isOpen(s)));}
D.addEventListener('pointerdown',function(e){if(e.button>0)return;var b=e.target.closest&&e.target.closest(CFG.btn);if(!b)return;supp=Date.now()+800;toggle(b);},true);
D.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest(CFG.btn);
 if(b){if(b.__vs)return;e.preventDefault();e.stopImmediatePropagation();
  if(Date.now()<supp){supp=0;return;}   /* 已在按下時處理過 */
  toggle(b);return;}                     /* 鍵盤 Enter／空白鍵 */
 if(!wide()&&!GA){var br=e.target.closest&&e.target.closest(CFG.brand);if(br){e.preventDefault();setOpen(false);return;}
  var a=e.target.closest&&e.target.closest('#rail a[href]');if(a)setTimeout(sync,50);}
},true);
function watch(){var s=side();if(!s){setTimeout(watch,500);return;}if(!GA){new MutationObserver(sync).observe(s,{attributes:true,attributeFilter:['class']});sync();}}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',watch);else watch();
G.addEventListener('resize',sync);
})(window);
