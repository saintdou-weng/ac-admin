/* VRT legible v1.0 (2026-11-27)  https://saintdou-weng.github.io/ac-admin/shared/legible.js
   Paul 11/27：所有平台「字要搭配背景跟卡片等顏色要清楚，帶 3D 微浮現感」。
   一支檔案給所有 VRT 平台（由 swipe-tabs.js / vrt-theme-v1.js 自動載入），只改「看起來」，不碰資料、不碰功能：
   1. 字不清楚就加深（或在深色底上加亮）：算每段字跟它底色的對比，不夠（小字 4.5、大字 3.2）就沿原本的色相調到夠；
      狀態色（綠／橘／紅）保留顏色，只是變深一點。底是漸層或圖片的不動（判斷不了）。
   2. 卡片微浮：沒有陰影的卡片／KPI 加一層很淡的陰影和上緣亮邊；可點的卡片滑過去浮起 1px。原本有陰影的不動。
   3. 輸入框提示字（placeholder）加深到看得清楚。
   關掉：<html data-legible="off">。換主題（深／淺）會重算。 */
(function(g){
'use strict';
if(g.VRTLegible)return;var D=document;
function off(){return D.documentElement.getAttribute('data-legible')==='off'}
function rgb(s){var m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;var a=m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}}
function lum(c){function f(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
function cr(a,b){var A=lum(a),B=lum(b);return (Math.max(A,B)+.05)/(Math.min(A,B)+.05)}
function over(f,b){return {r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a)}}
var BG=new WeakMap();
function bgOf(el){var layers=[],e=el;for(;e&&e.nodeType===1;e=e.parentElement){if(BG.has(e)){var c0=BG.get(e);if(c0===null)return null;layers.push({r:c0.r,g:c0.g,b:c0.b,a:1});break}
    var cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none')return null;var c=rgb(cs.backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=.95)break}}
  var base={r:255,g:255,b:255};for(var i=layers.length-1;i>=0;i--)base=over(layers[i],base);return base}
function mix(c,t,k){return {r:c.r+(t.r-c.r)*k,g:c.g+(t.g-c.g)*k,b:c.b+(t.b-c.b)*k}}
function fixColor(fg,bg,need){var dark=lum(bg)<.22,t=dark?{r:255,g:255,b:255}:{r:10,g:16,b:30},k=0,c=fg;while(k<1&&cr(c,bg)<need){k+=.08;c=mix(fg,t,Math.min(1,k))}return 'rgb('+Math.round(c.r)+','+Math.round(c.g)+','+Math.round(c.b)+')'}
var busy=false,timer=null,obs=null;
function pass(){if(off()||busy)return;busy=true;BG=new WeakMap();
  var nt=D.createElement('style');nt.textContent='*,*::before,*::after{transition:none!important}';
  try{(D.head||D.documentElement).appendChild(nt);/* 有 color 過場動畫的字，拿掉舊修正時算到的還是舊顏色，會漏修 → 重算這一下先停過場 */
    var old=D.querySelectorAll('[data-lg]'),i;for(i=0;i<old.length;i++){old[i].style.removeProperty('color');old[i].removeAttribute('data-lg')}void D.body.offsetHeight;
    var w=D.createTreeWalker(D.body,NodeFilter.SHOW_TEXT),n,seen=new Set(),todo=[],cnt=0;
    while((n=w.nextNode())&&cnt<7000){if(n.nodeValue.trim().length<1)continue;var el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(/^(SCRIPT|STYLE|OPTION|NOSCRIPT|TEXTAREA|CANVAS|svg|text|tspan)$/i.test(el.tagName))continue;
      if(!el.offsetParent&&getComputedStyle(el).position!=='fixed')continue;cnt++;var cs=getComputedStyle(el);if(cs.webkitBackgroundClip==='text'||cs.backgroundClip==='text')continue;
      var fg=rgb(cs.color);if(!fg)continue;var bg=bgOf(el);if(!bg)continue;var f=over(fg,bg),fs=parseFloat(cs.fontSize)||14,big=fs>=18||(fs>=15&&parseInt(cs.fontWeight,10)>=700),need=big?3.2:4.5;
      if(cr(f,bg)<need)todo.push([el,fixColor(f,bg,need)])}
    for(i=0;i<todo.length;i++){todo[i][0].style.setProperty('color',todo[i][1],'important');todo[i][0].setAttribute('data-lg','1')}
    lift()}catch(e){}
  try{void D.body.offsetHeight;nt.remove()}catch(e){}
  if(obs)obs.takeRecords();busy=false}
var CARD='.card,.kpi,.mcard,.stat,.stat-card,.panel,.tile,.box,.wl,.it,.sec,.section,[class*="card"],[class*="kpi"]';
function lift(){var dark=lum(rgb(getComputedStyle(D.body).backgroundColor)||{r:255,g:255,b:255})<.22;D.documentElement.classList.toggle('lg-dark',dark);
  var a=D.querySelectorAll(CARD),n=0;for(var i=0;i<a.length&&n<500;i++){var e=a[i];if(e.classList.contains('lg3d')||!e.offsetParent)continue;var r=e.getBoundingClientRect();if(r.width<110||r.height<36||r.width>innerWidth*1.2)continue;
    var cs=getComputedStyle(e);if(cs.boxShadow!=='none')continue;var b=rgb(cs.backgroundColor);if(!b||b.a<.5)continue;if(parseFloat(cs.borderTopLeftRadius)<3)continue;n++;e.classList.add('lg3d');if(cs.cursor==='pointer'||e.hasAttribute('onclick')||e.tagName==='A')e.classList.add('lg3d-h')}}
function css(){if(D.getElementById('vrt-legible-css'))return;var s=D.createElement('style');s.id='vrt-legible-css';
  s.textContent='.lg3d{box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 1px 2px rgba(15,23,42,.07),0 8px 16px -8px rgba(15,23,42,.20)}'+
   '.lg-dark .lg3d{box-shadow:inset 0 1px 0 rgba(255,255,255,.07),0 1px 2px rgba(0,0,0,.35),0 10px 18px -10px rgba(0,0,0,.6)}'+
   '.lg3d-h{transition:transform .16s ease,box-shadow .16s ease}.lg3d-h:hover{transform:translateY(-1px);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 2px 4px rgba(15,23,42,.08),0 14px 22px -10px rgba(15,23,42,.26)}'+
   'html:not(.lg-dark) input::placeholder,html:not(.lg-dark) textarea::placeholder{color:#64748b;opacity:1}html.lg-dark input::placeholder,html.lg-dark textarea::placeholder{color:#a3adbd;opacity:1}'+
   '@media print{.lg3d,.lg3d-h{box-shadow:none!important;transform:none!important}}@media (prefers-reduced-motion:reduce){.lg3d-h{transition:none}.lg3d-h:hover{transform:none}}';
  (D.head||D.documentElement).appendChild(s)}
function later(ms){clearTimeout(timer);timer=setTimeout(function(){(g.requestIdleCallback||function(f){setTimeout(f,1)})(pass,{timeout:1200})},ms)}
function start(){if(off())return;css();later(500);setTimeout(function(){later(0)},2200);
  try{obs=new MutationObserver(function(){if(!busy)later(350)});obs.observe(D.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden','data-theme']});
    new MutationObserver(function(){later(300)}).observe(D.documentElement,{attributes:true,attributeFilter:['data-theme','class']})}catch(e){}}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
g.VRTLegible={version:'1.0.1',run:pass};
})(window);
