/* VRT 背景色融合 tint-bridge.js v1（2026-11-22）
   Paul：各平台分頁的背景色要像 Admin OS 一樣融合——外框（PSJHR／PSJERP／PSJGA／Admin OS）選粉紅，
   嵌在裡面的分頁（HRA Portal、HRA-PAY、GASCheck、SEC、GA-EXP、Audit、生產…）也跟著粉紅，不會出一塊白、一塊黑。
   做法：被嵌在同網域的外框裡時，讀外框目前的底色 → 把分頁裡「白底」的卡片／表格／面板換成外框的淺色，
   「深色大標題列」換成外框色調的深色；文字顏色、狀態色（紅綠黃）不動。
   · 外框是白色／預設時什麼都不做；外框是深色主題時也不動（深色有各平台自己的處理）。
   · 主頁（PSJHR／PSJERP／PSJGA／Admin OS 本身）不套，主頁照樣分顏色。
   · 只改畫面顏色，不碰資料與功能；由 swipe-tabs.js 順帶載入。 */
(function(G){
'use strict';
if(G.VRTTint)return;G.VRTTint=1;
var P=(location.pathname||'').toLowerCase();
if(/^\/(psjhr|psjerp|psjgas)\/(index\.html)?$/.test(P)||/^\/ac-admin\/(index\.html)?$/.test(P))return;   /* 主頁本身不套 */
var par=null;try{if(G.parent!==G&&G.parent.document&&G.parent.location.origin===location.origin)par=G.parent;}catch(e){}
if(!par)return;
function rgb(c){var m=/rgba?\(([^)]+)\)/.exec(c||'');if(!m)return null;var p=m[1].split(',').map(parseFloat);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
function hex(c){var m=/^#([0-9a-f]{3,8})$/i.exec((c||'').trim());if(!m)return null;var h=m[1];if(h.length===3)h=h.replace(/./g,'$&$&');return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16),a:1};}
function col(c){return rgb(c)||hex(c);}
function lum(c){return (0.2126*c.r+0.7152*c.g+0.0722*c.b)/255;}
function mix(a,b,t){return {r:Math.round(a.r*(1-t)+b.r*t),g:Math.round(a.g*(1-t)+b.g*t),b:Math.round(a.b*(1-t)+b.b*t),a:1};}
function css(c,al){return 'rgba('+c.r+','+c.g+','+c.b+','+(al==null?c.a:al)+')';}
var WHITE={r:255,g:255,b:255,a:1},INK={r:27,g:39,b:56,a:1};
/* 外框目前的底色（每個外框存的地方不同） */
function hostTone(){try{var d=par.document,root=d.documentElement,rs=par.getComputedStyle(root);
  if(root.hasAttribute('data-dark')||root.hasAttribute('data-ga-dark'))return {dark:true};
  var names=['--ga-canvas','--bg','--psj-bg'];for(var i=0;i<names.length;i++){var v=rs.getPropertyValue(names[i]);var c=col(v);if(c&&c.a>0.5)return {bg:c};}
  var b=col(par.getComputedStyle(d.body).backgroundColor);if(b&&b.a>0.5)return {bg:b};}catch(e){}return null;}
var tone=null,surf=null,surf2=null,deep=null,on=false;
function setTone(){var t=hostTone();
 if(!t||t.dark||!t.bg||lum(t.bg)>0.965){on=false;tone=null;return false;}   /* 白色／預設、深色主題 → 不動 */
 var sat=Math.max(t.bg.r,t.bg.g,t.bg.b)-Math.min(t.bg.r,t.bg.g,t.bg.b);if(sat<6&&lum(t.bg)>0.9){on=false;return false;}
 tone=t.bg;surf=mix(tone,WHITE,0.55);surf2=mix(tone,WHITE,0.3);deep=mix(tone,INK,0.72);on=true;return true;}
var st=null;
function baseCss(){if(!st){st=document.createElement('style');st.id='vrt-tint';(document.head||document.documentElement).appendChild(st);}
 st.textContent=on?('html,body{background-color:'+css(tone,1)+'!important;background-image:none!important}'+
  'body::before,body::after{background-image:none!important}'+
  ':root{--tint-bg:'+css(tone,1)+';--tint-surface:'+css(surf,1)+';--tint-surface-2:'+css(surf2,1)+'}'):'';}
var MARK='data-vt';
/* 只換「容器」（面板、卡片、表格、列表、標題列）；按鈕、連結、輸入框、分頁鈕不碰，選中／狀態色才不會被蓋掉 */
var BOX=/^(DIV|SECTION|ARTICLE|MAIN|ASIDE|HEADER|FOOTER|NAV|FORM|FIELDSET|DIALOG|TABLE|THEAD|TBODY|TFOOT|TR|TD|TH|UL|OL|LI|DL|DETAILS|SUMMARY)$/;
function paint(el){if(!on||el.nodeType!==1||el.hasAttribute(MARK))return;var tag=el.tagName;if(!BOX.test(tag))return;var ro=el.getAttribute('role');if(ro==='button'||ro==='tab'||el.hasAttribute('onclick')&&el.offsetWidth<240)return;if(el.offsetWidth<40||el.offsetHeight<16)return;
 var cs=G.getComputedStyle(el),c=rgb(cs.backgroundColor),img=cs.backgroundImage,r;
 if(c&&c.a>0.6){var L=lum(c);
  if(L>0.93){el.setAttribute(MARK,'w');el.style.setProperty('background-color',css(/^(TH|THEAD)$/.test(tag)?surf2:surf,c.a),'important');return;}
  if(L<0.3){r=el.getBoundingClientRect();if(r.width>G.innerWidth*0.5&&r.height>30&&r.height<360){el.setAttribute(MARK,'d');el.style.setProperty('background-color',css(deep,1),'important');if(img&&img!=='none'&&/gradient/.test(img))el.style.setProperty('background-image','none','important');}return;}}
 if(img&&img!=='none'&&/gradient/.test(img)){var m=img.match(/rgba?\([^)]+\)|#[0-9a-f]{3,8}/i),g=m&&col(m[0]);if(g&&lum(g)<0.3){r=el.getBoundingClientRect();if(r.width>G.innerWidth*0.5&&r.height>30&&r.height<360){el.setAttribute(MARK,'d');el.style.setProperty('background-image','none','important');el.style.setProperty('background-color',css(deep,1),'important');}}}}
function unpaint(){[].forEach.call(document.querySelectorAll('['+MARK+']'),function(el){el.style.removeProperty('background-color');el.style.removeProperty('background-image');el.removeAttribute(MARK);});}
function scan(root){if(!on)return;var all=(root||document.body).querySelectorAll('*');var n=Math.min(all.length,6000);for(var i=0;i<n;i++)paint(all[i]);if(root&&root.nodeType===1)paint(root);}
var key='';
function refresh(){var before=key;setTone();key=on?css(tone,1):'off';if(key!==before){unpaint();baseCss();if(on)scan();}}
var pend=[],tm=0;
new MutationObserver(function(ms){if(!on)return;ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType===1)pend.push(n);});});if(!tm)tm=setTimeout(function(){tm=0;var p=pend.splice(0);p.forEach(function(n){if(n.isConnected)scan(n);});},250);}).observe(document.documentElement,{childList:true,subtree:true});
function start(){refresh();setInterval(refresh,1500);}   /* 外框換顏色 → 1.5 秒內跟上 */
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
G.VRTTint={refresh:function(){key='';refresh();}};
})(window);
