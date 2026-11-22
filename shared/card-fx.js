/* 卡片互動微變色 card-fx.js v1（2026-11-22）
   Paul：滑鼠移入或手指按下卡片時，卡片背景與邊框柔和微變色，讓操作目標更容易辨識。
   · 顏色：低飽和柔和色（淺藍、淺綠、粉紅、粉橘）依卡片順序輪替；深色主題或深色卡片（白字）改用 10–15% 透明度的同色光疊加，文字對比不變。
   · 電腦（滑鼠）：@media (hover:hover) 才有 :hover，150ms ease-out 平滑變色，移開恢復。
   · 手機（觸控）：不用 :hover（避免點完顏色卡住），改成手指按下（:active）立即變色，放開恢復。
   · 只加在「點了會有反應」的卡片上（按鈕型卡片、連結卡、可點的 KPI 卡…）；一般小按鈕、側欄選單、表格列不套。
   · 用疊加陰影上色，不改卡片原本的底色／漸層，不碰資料與功能。
   適用：PSJERP、PSJHR、PSJGA、Admin OS、Audit（由 swipe-tabs.js 順帶載入）。 */
(function(G){
'use strict';
if(G.VRTCardFx)return;G.VRTCardFx=1;
var D=document;
var EXC='nav,aside,header,.rail,#rail,.sidebar,.mobile-nav,.topbar,.top,.tabs,.hd-tabs,.hd-dots,.segments,.periodbar,.lang,#langSw,.cloud-actions,.pkn-h,table,thead,tbody,tr,td,th,select,option,label,input,textarea,dialog .pkn-h';
var st=D.createElement('style');st.id='card-fx-css';
var L=[['219,234,254','147,197,253'],['220,252,231','134,239,172'],['252,231,243','249,168,212'],['255,237,213','253,186,116']];
var O=['96,165,250','74,222,128','244,114,182','251,146,60'];
var css='.cfx{transition:box-shadow .15s ease-out,border-color .15s ease-out!important}';
var on='';
for(var i=0;i<4;i++){
 on+='.cfx[data-cfx="'+i+'"]{--fx-l:rgba('+L[i][0]+',.72);--fx-lb:rgb('+L[i][1]+');--fx-o:rgba('+O[i]+',.14);--fx-ob:rgba('+O[i]+',.6)}';}
css+=on;
var ACT='box-shadow:inset 0 0 0 999px var(--fx-l),0 4px 14px rgba(15,23,42,.10)!important;border-color:var(--fx-lb)!important';
var ACTO='box-shadow:inset 0 0 0 999px var(--fx-o),0 4px 14px rgba(0,0,0,.18)!important;border-color:var(--fx-ob)!important';
css+='@media (hover:hover) and (pointer:fine){.cfx:hover,.cfx:active{'+ACT+'}.cfx.cfx-o:hover,.cfx.cfx-o:active,html.cfx-dark .cfx:hover,html.cfx-dark .cfx:active{'+ACTO+'}}';
css+='@media (hover:none),(pointer:coarse){.cfx{transition:none!important}.cfx:active{'+ACT+'}.cfx.cfx-o:active,html.cfx-dark .cfx:active{'+ACTO+'}}';
st.textContent=css;(D.head||D.documentElement).appendChild(st);
try{D.addEventListener('touchstart',function(){},{passive:true});}catch(e){}   /* iPhone：讓 :active 在按下時就生效 */
function rgb(c){var m=/rgba?\(([^)]+)\)/.exec(c||'');if(!m)return null;var p=m[1].split(',').map(parseFloat);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
function lum(c){return (0.2126*c.r+0.7152*c.g+0.0722*c.b)/255;}
function darkPage(){var r=D.documentElement;if(r.hasAttribute('data-dark')||r.getAttribute('data-theme')==='dark'||r.hasAttribute('data-ga-dark'))return true;
 var b=rgb(getComputedStyle(D.body).backgroundColor);if(b&&b.a>.5)return lum(b)<.35;var h=rgb(getComputedStyle(r).backgroundColor);return !!(h&&h.a>.5&&lum(h)<.35);}
var seen=new WeakSet();
function check(el){if(seen.has(el))return;
 var r=el.getBoundingClientRect();if(!r.width&&!r.height)return;   /* 還沒顯示（藏起來的分頁）→ 之後再看 */
 seen.add(el);
 if(el.closest(EXC))return;
if(r.width<88||r.height<44||r.width>960||r.height>520)return;
 var cs=getComputedStyle(el);if(cs.cursor!=='pointer')return;
 var tag=el.tagName;
 /* 一般小按鈕不算卡片：要有圓角＋（底色或邊框），按鈕還要夠大 */
 var rad=parseFloat(cs.borderTopLeftRadius)||0;if(rad<6)return;
 var bg=rgb(cs.backgroundColor),hasBg=(bg&&bg.a>.08)||/gradient/.test(cs.backgroundImage),hasBd=parseFloat(cs.borderTopWidth)>0&&cs.borderTopStyle!=='none';
 if(!hasBg&&!hasBd)return;
 if((tag==='BUTTON'||tag==='A')&&r.height<52&&r.width<200)return;
 if(el.parentElement&&el.parentElement.closest('.cfx'))return;   /* 已在可點的卡片裡 */
 var sib=el.parentElement?[].filter.call(el.parentElement.children,function(x){return x.classList.contains('cfx');}).length:0;
 el.classList.add('cfx');el.setAttribute('data-cfx',String(sib%4));
 var tc=rgb(cs.color);if(tc&&lum(tc)>.62)el.classList.add('cfx-o');   /* 白字的深色卡片 → 用透明色光疊加 */
 [].forEach.call(el.querySelectorAll('.cfx'),function(x){x.classList.remove('cfx');});}
function scan(root){var r=root||D.body;if(!r||!r.querySelectorAll)return;var all=r.querySelectorAll('a,button,[onclick],[role=button],[data-action],[data-route],[data-hk],[data-hg],[data-hgo],div,li,article,section');
 for(var i=0;i<all.length&&i<5000;i++){var e=all[i];if(seen.has(e))continue;try{check(e);}catch(x){}}}
function mode(){D.documentElement.classList.toggle('cfx-dark',darkPage());}
var tm=0,pend=[];
function start(){mode();scan();setTimeout(function(){scan();},1500);
 new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType===1)pend.push(n);});});if(!tm)tm=setTimeout(function(){tm=0;var p=pend.splice(0);p.forEach(function(n){if(n.isConnected){scan(n);try{check(n);}catch(x){}}});},500);}).observe(D.body,{childList:true,subtree:true});
 new MutationObserver(mode).observe(D.documentElement,{attributes:true,attributeFilter:['data-dark','data-theme','data-ga-dark','data-tint','class']});
 setInterval(mode,4000);}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})(window);
