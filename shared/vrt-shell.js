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
