/* VRT 首頁 home-deck.js v2（2026-11-22）
   v1：Admin OS 首頁瀏覽方式（彩色摘要卡、分類標籤、左右滑）用到 PSJHR／PSJERP／PSJGA 主頁。
   v2（Paul 11:45）：
   · PSJHR／PSJERP 總覽改成「卡片式」：上面一張總覽重點數字，下面每個分類一張大卡（例 ERP：接單、備料、生產、成品與出貨…），
     點卡片 → 進到那個分類，列出裡面的分頁；再點分頁才進到平台的頁面。從分頁回到總覽會先回到剛才那個分類，按「‹ 總覽」回上一層。
   · PSJGA 保留左右滑的輪播。
   · 不再閃：平台自己重畫畫面時，原本那排數字不會先冒出來再被蓋掉（同一個畫格內就換好），左右滑的位置也不會跳回第一張。
   · 顏色融合：卡片顏色跟著平台目前的主題色調和，帶半透明毛玻璃，底色／桌布會透出來。
   · 原本那排重點數字仍在頁面裡（資料、點擊照舊），只是收起來；其他圖表不動。 */
(function(G){
'use strict';
if(G.VRTHomeDeck)return;G.VRTHomeDeck=2;
var P=(location.pathname||'').toLowerCase();
var A=null;
var PAL=['#0f766e','#2563eb','#7c3aed','#c2410c','#be185d','#0369a1','#4d7c0f','#a16207','#475569','#9333ea'];
var KW_HR=[[/在職|headcount|active/i,'emp'],[/新進|離職|join|resign/i,'joinleave'],[/異常|未請假|缺勤|exception|absen/i,'attexc|att'],[/請假|leave/i,'leave|att'],[/出勤|工時|attend|hour/i,'att'],[/薪資|payroll|salary/i,'payroll'],[/伙食|meal/i,'meal']];
var KW_ERP=[[/訂單|order/i,'ordercenter|orders|!orders'],[/成品|finished|fg/i,'finished-goods|fg|acc-fg|!production'],[/出貨|ship/i,'shipping|!shipping'],[/布|fabric/i,'fabric'],[/輔料|access/i,'materials|accessories'],[/應付|payable|ap/i,'payables'],[/發票|invoice/i,'invoices'],[/產量|生產|output|prod/i,'prodreports|production']];
function psj(kw){return {mode:'car', /* 2026-11-22 13:33 Paul：PSJERP 跟其他平台一樣，用左右滑、一個分類一頁當首頁（PSJHR 一起統一） */
  home:function(){var h=(location.hash||'').slice(1).split(/[/?]/)[0];return !h||h==='dashboard';},
  host:function(){return document.getElementById('page');},
  anchor:function(){var p=document.getElementById('page');if(!p)return null;for(var i=0;i<p.children.length;i++){var c=p.children[i];if(c.id!=='hdWrap'&&i>0)return c;}return null;}, /* 沒有重點數字時：放在頁面標題下面 */
  src:function(){var p=document.getElementById('page');if(!p)return null;for(var i=0;i<p.children.length;i++){var c=p.children[i];if(c.classList.contains('kpis'))return c;}return null;},
  kpis:function(src){return [].slice.call(src.querySelectorAll('.kpi')).map(function(k){var l=k.querySelector('.l'),v=k.querySelector('.v'),d=k.querySelector('.d');var lab=l?l.textContent.trim():'';var r=null;for(var i=0;i<kw.length;i++)if(kw[i][0].test(lab)){r=kw[i][1];break;}
    if(r){r=r.split('|').filter(function(x){return x.charAt(0)==='!'||document.querySelector('#nav a[href="#'+x+'"]');})[0]||null;if(r)r=r.replace(/^!/,'');}return {l:lab,v:v?v.textContent.trim():'',d:d?d.textContent.trim():'',hot:/warn|crit|bad|hot/.test(k.className),go:r?'#'+r:null};});},
  groups:function(){var n=document.getElementById('nav');if(!n)return [];var gs=[],g=null;[].forEach.call(n.children,function(c){
    if(c.classList.contains('nav-g')){g={t:c.textContent.trim(),items:[]};gs.push(g);return;}
    if(c.tagName==='A'&&g){var href=c.getAttribute('href')||'';if(!href||href==='#dashboard')return;var tx=c.textContent.trim().replace(/\s+/g,' ');var ic=(tx.match(/^(\p{Extended_Pictographic}️?|\S)/u)||[''])[0];
      var bd=c.querySelector('.bd,.badge,.cnt,small,i');var badge=bd?bd.textContent.trim():'';var name=tx.slice(ic.length).replace(badge,'').replace(/(平台|Platform|ប្រព័ន្ធ)?\s*[🟢🟠🔴🟡⚪⚫●]+/gu,'').trim();if(/^(Portal|HRA-PAY|Audit|Admin|平台|Platform)$/i.test(badge))badge='';
      g.items.push({ic:ic,t:name||tx,b:badge,go:href});}});return gs.filter(function(x){return x.items.length;});},
  acc:'var(--accent,#2563eb)'
};}
if(P.indexOf('/psjhr/')===0)A=psj(KW_HR);
else if(P.indexOf('/psjerp/')===0)A=psj(KW_ERP);
else if(P.indexOf('/psjgas/')===0)A={mode:'car',
  home:function(){var h=(location.hash||'').slice(1);return !h||h==='overview';},
  host:function(){var s=document.querySelector('.stats');return s&&s.parentElement;},
  src:function(){return document.querySelector('.stats');},
  kpis:function(src){return [].slice.call(src.querySelectorAll('.stat')).map(function(k){return {l:(k.querySelector('.stat-head span')||{textContent:''}).textContent.trim(),v:(k.querySelector('.stat-value')||{textContent:''}).textContent.trim(),d:(k.querySelector('.stat-bottom')||{textContent:''}).textContent.trim(),act:k.dataset.action||'',go:null};});},
  groups:function(){var sb=document.querySelector('.sidebar');if(!sb)return [];var gs=[],g=null;[].forEach.call(sb.querySelectorAll('.nav-caption,.nav-btn'),function(c){
    if(c.classList.contains('nav-caption')){g={t:c.textContent.trim(),items:[]};gs.push(g);return;}
    if(!g||c.dataset.route==='overview')return;var bd=c.querySelector('.badge,.count,small,em');g.items.push({ic:'',svg:(c.querySelector('svg')||{outerHTML:''}).outerHTML,t:(c.querySelector('span')||c).textContent.trim(),b:bd?bd.textContent.trim():'',route:c.dataset.route});});
    return gs.filter(function(x){return x.items.length;});},
  acc:'var(--ga-side-accent,var(--teal,#087f72))'
};
if(!A)return;
/* 卡片色＝分類色和平台主題色調和；半透明＋毛玻璃，讓底色／桌布透出來 */
var css='.hd-wrap{margin:4px 0 16px;--hd-acc:'+A.acc+'}'+
 '.hd-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px}.hd-tabs::-webkit-scrollbar{display:none}'+
 '.hd-tab{flex:0 0 auto;border:1px solid rgba(127,127,127,.28);background:color-mix(in srgb,var(--surface,#fff) 70%,transparent);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:inherit;border-radius:999px;padding:6px 13px;font:700 13px/1.2 inherit;white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:6px}'+
 '.hd-tab i{width:8px;height:8px;border-radius:50%;background:var(--cc)}.hd-tab.on{background:var(--cc);border-color:var(--cc);color:#fff}.hd-tab.on i{background:#fff}'+
 '.hd-wrap [style*="--c"]{--cc:color-mix(in srgb,var(--c) var(--hd-mix,66%),var(--hd-acc))}'+
 '.hd-carw{position:relative}.hd-car{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:18px;-webkit-overflow-scrolling:touch}.hd-car::-webkit-scrollbar{display:none}'+
 '.hd-slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;padding:1px}'+
 '.hd-box{background:linear-gradient(160deg,color-mix(in srgb,color-mix(in srgb,var(--cc) 90%,#000) 86%,transparent),color-mix(in srgb,color-mix(in srgb,var(--cc) 72%,#1b2738) 80%,transparent));-webkit-backdrop-filter:blur(14px) saturate(1.15);backdrop-filter:blur(14px) saturate(1.15);border:1px solid rgba(255,255,255,.22);color:#fff;border-radius:18px;padding:16px clamp(12px,2.4vw,22px) 14px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;box-shadow:0 8px 26px rgba(15,23,42,.12)}'+
 '.hd-car .hd-box{min-height:230px}'+
 '.hd-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hd-head h2{margin:0;font-size:19px;color:#fff}.hd-head .pl{font-size:12px;opacity:.85;background:rgba(255,255,255,.16);border-radius:999px;padding:2px 10px}'+
 '.hd-back{border:0;background:rgba(255,255,255,.2);color:#fff;border-radius:999px;padding:7px 13px;font:700 13.5px/1 inherit;cursor:pointer}.hd-back:hover{background:rgba(255,255,255,.3)}'+
 '.hd-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(46%,160px),1fr));gap:9px}'+
 '.hd-tile{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:13px;padding:10px 12px;text-align:left;color:#fff;display:flex;flex-direction:column;gap:2px;min-width:0;cursor:pointer;font:inherit;text-decoration:none}'+
 '.hd-tile:hover{background:rgba(255,255,255,.24)}.hd-tile .l{font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.hd-tile .v{font-size:clamp(21px,3.2vw,28px);font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.hd-tile .d{font-size:11.5px;opacity:.82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hd-tile.hot{background:#fff;color:#9a3412;border-color:#fff}.hd-tile.hot .v{color:#c2410c}'+
 '.hd-tile.m{flex-direction:row;align-items:center;gap:9px}.hd-tile.m .ic{font-size:20px;flex:none;width:24px;text-align:center}.hd-tile.m .ic svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:1.8}.hd-tile.m .t{flex:1;min-width:0;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hd-tile.m .b{font-weight:800;font-size:13px;background:rgba(255,255,255,.2);border-radius:999px;padding:1px 8px}'+
 '.hd-tile.big{padding:14px 14px;min-height:64px}.hd-tile.big .ic{font-size:24px;width:30px}.hd-tile.big .t{font-size:15px;white-space:normal;line-height:1.3}'+
 /* 分類大卡 */
 '.hd-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px;margin-top:12px}'+
 '.hd-card{position:relative;text-align:left;font:inherit;color:#fff;cursor:pointer;border-radius:18px;padding:15px 15px 13px;min-height:132px;display:flex;flex-direction:column;gap:6px;border:1px solid rgba(255,255,255,.22);overflow:hidden;'+
   'background:linear-gradient(150deg,color-mix(in srgb,color-mix(in srgb,var(--cc) 92%,#000) 84%,transparent),color-mix(in srgb,color-mix(in srgb,var(--cc) 70%,#1b2738) 76%,transparent));-webkit-backdrop-filter:blur(14px) saturate(1.15);backdrop-filter:blur(14px) saturate(1.15);box-shadow:0 8px 24px rgba(15,23,42,.12);transition:transform .15s ease,box-shadow .15s ease}'+
 '.hd-card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(15,23,42,.18)}.hd-card:active{transform:scale(.98)}'+
 '.hd-card .ic{font-size:28px;line-height:1}.hd-card .ic svg{width:26px;height:26px;stroke:#fff;fill:none;stroke-width:1.8}.hd-card b{font-size:18px;line-height:1.25}'+
 '.hd-card .pv{font-size:12.5px;opacity:.85;line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
 '.hd-card .ft{margin-top:auto;display:flex;align-items:center;gap:8px;font-size:12px}.hd-card .ft .n{background:rgba(255,255,255,.18);border-radius:999px;padding:2px 9px;font-weight:700}.hd-card .ft .s{background:#fff;color:#9a3412;border-radius:999px;padding:2px 9px;font-weight:800}.hd-card .ft .go{margin-left:auto;font-size:20px;opacity:.9}'+
 '.hd-nav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:0;background:#fff;color:#1b2738;box-shadow:0 2px 10px rgba(27,39,56,.25);font-size:16px;z-index:3;cursor:pointer}.hd-nav.l{left:-10px}.hd-nav.r{right:-10px}'+
 '.hd-dots{display:flex;justify-content:center;gap:7px;margin:9px 0 2px}.hd-dots i{width:8px;height:8px;border-radius:50%;background:rgba(127,127,127,.4);transition:.2s;cursor:pointer}.hd-dots i.on{width:22px;border-radius:5px;background:currentColor}'+
 '.hd-in{animation:hdIn .22s ease-out}@keyframes hdIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
 '.hd-src-hidden{display:none!important}@media(max-width:900px){.hd-car .hd-box{min-height:210px}}@media(max-width:600px){.hd-nav{display:none}}'+
 '@media(max-width:560px){.hd-cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.hd-card{min-height:124px;padding:13px 12px 11px}.hd-card b{font-size:16px}.hd-card .pv{font-size:11.5px}.hd-tiles.g2{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '@media(prefers-reduced-motion:reduce){.hd-in{animation:none}.hd-card{transition:none}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var IDX=0,GV=-1;try{IDX=+sessionStorage.getItem('hd_idx_'+P)||0;GV=sessionStorage.getItem('hd_back_'+P)!=null?+sessionStorage.getItem('hd_back_'+P):-1;sessionStorage.removeItem('hd_back_'+P);}catch(e){}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function L(){var l=(document.documentElement.lang||'').toLowerCase();return l.indexOf('km')===0?'km':l.indexOf('en')===0?'en':'zh';}
function tx(zh,en,km){var l=L();return l==='en'?en:l==='km'?(km||en):zh;}
function sig(){var s=A.src();var n=document.getElementById('nav')||document.querySelector('.sidebar');return (s?s.textContent:'')+'|'+(n?n.textContent:'')+'|'+document.documentElement.lang+'|'+GV;}
var last='',W=null,SL=null,K=null;
function tileK(x,j){return '<button type="button" class="hd-tile'+(x.hot?' hot':'')+'" data-hk="'+j+'"><span class="l">'+esc(x.l)+'</span><span class="v">'+esc(x.v)+'</span>'+(x.d?'<span class="d">'+esc(x.d)+'</span>':'')+'</button>';}
function tileM(x,key,big){return '<button type="button" class="hd-tile m'+(big?' big':'')+'" data-hg="'+key+'"><span class="ic">'+(x.svg||esc(x.ic))+'</span><span class="t">'+esc(x.t)+'</span>'+(x.b?'<span class="b">'+esc(x.b)+'</span>':'')+'</button>';}
function html(k,gs,extra){
 var slides=[{t:tx('總覽','Overview','ទិដ្ឋភាពទូទៅ'),c:PAL[0],kpi:k,items:extra}].concat(gs.map(function(g,i){return {t:g.t,c:PAL[(i+1)%PAL.length],items:g.items};}));
 SL=slides;
 if(A.mode==='grid'){
  if(GV>0&&slides[GV]){var g=slides[GV];
   return '<div class="hd-box hd-in" style="--c:'+g.c+'"><div class="hd-head"><button type="button" class="hd-back" data-hback>‹ '+esc(slides[0].t)+'</button><h2>'+esc(g.t)+'</h2><span class="pl">'+g.items.length+' '+tx('項','pages','ទំព័រ')+'</span></div>'+
    '<div class="hd-tiles g2">'+g.items.map(function(x,j){return tileM(x,GV+':'+j,true);}).join('')+'</div></div>';}
  var ov=slides[0];
  return (k.length||extra.length?'<div class="hd-box" style="--c:'+ov.c+'"><div class="hd-head"><h2>'+esc(ov.t)+'</h2><span class="pl">'+(k.length||extra.length)+' '+tx('項','items','ធាតុ')+'</span></div>'+(k.length?'<div class="hd-tiles">'+k.map(tileK).join('')+'</div>':'')+
    (extra.length?'<div class="hd-tiles">'+extra.map(function(x,j){return tileM(x,'0:'+j);}).join('')+'</div>':'')+'</div>':'')+
   '<div class="hd-cards">'+slides.slice(1).map(function(g,i){var n=i+1,sum=0;g.items.forEach(function(x){if(/^\d+$/.test(x.b||''))sum+=+x.b;});
    return '<button type="button" class="hd-card" style="--c:'+g.c+'" data-hgo="'+n+'"><span class="ic">'+(g.items[0].svg||esc(g.items[0].ic))+'</span><b>'+esc(g.t)+'</b><span class="pv">'+esc(g.items.slice(0,4).map(function(x){return x.t;}).join(' · '))+'</span>'+
     '<span class="ft"><span class="n">'+g.items.length+' '+tx('項','pages','ទំព័រ')+'</span>'+(sum?'<span class="s">'+sum+'</span>':'')+'<span class="go">›</span></span></button>';}).join('')+'</div>';}
 return '<div class="hd-tabs">'+slides.map(function(sl,i){return '<button type="button" class="hd-tab" style="--c:'+sl.c+'" data-hd="'+i+'"><i></i>'+esc(sl.t)+'</button>';}).join('')+'</div>'+
  '<div class="hd-carw"><button type="button" class="hd-nav l" data-hdp="-1" aria-label="Previous">‹</button><div class="hd-car" data-noswipe>'+
  slides.map(function(sl,i){var body=sl.kpi?'<div class="hd-tiles">'+sl.kpi.map(tileK).join('')+'</div>'+(sl.items&&sl.items.length?'<div class="hd-tiles">'+sl.items.map(function(x,j){return tileM(x,i+':'+j);}).join('')+'</div>':''):'<div class="hd-tiles g2">'+sl.items.map(function(x,j){return tileM(x,i+':'+j,true);}).join('')+'</div>';
   return '<div class="hd-slide"><div class="hd-box" style="--c:'+sl.c+'"><div class="hd-head"><h2>'+esc(sl.t)+'</h2><span class="pl">'+(sl.kpi?sl.kpi.length:sl.items.length)+' '+tx('項','items','ធាតុ')+'</span></div>'+body+'</div></div>';}).join('')+
  '</div><button type="button" class="hd-nav r" data-hdp="1" aria-label="Next">›</button></div><div class="hd-dots">'+slides.map(function(_,i){return '<i data-hd="'+i+'"></i>';}).join('')+'</div>';}
/* 顏色融合：讀平台目前的背景色（🎨 選粉紅就是粉紅），取它的色相做成較深的同色系，卡片顏色往這個色調和 */
function hsl(c){var m=/^#([0-9a-f]{6})$/i.exec(c)||null,r,g,b;if(m){r=parseInt(m[1].slice(0,2),16);g=parseInt(m[1].slice(2,4),16);b=parseInt(m[1].slice(4,6),16);}else{m=/rgba?\(([^)]+)\)/.exec(c||'');if(!m)return null;var p=m[1].split(',').map(parseFloat);r=p[0];g=p[1];b=p[2];}
 r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,h=0,sa=0;if(mx!==mn){var d=mx-mn;sa=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return {h:h,s:sa*100,l:l*100};}
function tint(){if(!W)return;var rs=getComputedStyle(document.documentElement),v=(rs.getPropertyValue('--bg')||'').trim();if(!v)v=getComputedStyle(document.body).backgroundColor;
 var c=hsl(v);if(c&&c.s>14&&c.l>55&&c.l<97){W.style.setProperty('--hd-acc','hsl('+Math.round(c.h)+','+Math.round(Math.min(72,c.s+28))+'%,40%)');W.style.setProperty('--hd-mix','50%');}else{W.style.removeProperty('--hd-acc');W.style.removeProperty('--hd-mix');}}
new MutationObserver(function(){tint();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-tint','data-theme','data-dark','style','class']});
/* 同步執行（在 MutationObserver 回呼裡，畫面還沒畫出來之前）→ 不會先閃出原本那排數字 */
function build(){
 if(!A.home()){if(W&&W.parentNode)W.remove();return;}
 var host=A.host(),src=A.src();if(!host)return;var anc=A.anchor?A.anchor():src; /* 卡片放在頁面標題正下方，總覽重點數字收進第一張卡 */if(!src&&!A.anchor)return;if(!src&&!host.children.length)return;
 var s=sig();
 if(W&&s===last){ /* 內容沒變：平台重畫把卡片拿掉了 → 原封不動放回去（滑動位置也保留） */
  if(W.parentNode!==host||(anc&&W.nextElementSibling!==anc))host.insertBefore(W,anc);
  if(src&&!src.classList.contains('hd-src-hidden'))src.classList.add('hd-src-hidden');
  var c0=W.querySelector('.hd-car');if(c0&&Math.abs(c0.scrollLeft-IDX*c0.clientWidth)>4)c0.scrollLeft=IDX*c0.clientWidth;
  return;}
 last=s;
 K=src?A.kpis(src):[];var gs=A.groups(),extra=[];
 gs=gs.filter(function(g,i){if(i===0&&/總覽|概覽|overview|工作空間|workspace|ទិដ្ឋភាព/i.test(g.t)){extra=g.items;return false;}return true;});
 if(!W){W=document.createElement('div');W.id='hdWrap';W.className='hd-wrap';}
 W.className='hd-wrap '+(A.mode==='grid'?'hd-gridm':'hd-carm');
 W.innerHTML=html(K,gs,extra);tint();
 if(W.parentNode!==host||(anc&&W.nextElementSibling!==anc))host.insertBefore(W,anc);
 if(src)src.classList.add('hd-src-hidden');
 var car=W.querySelector('.hd-car');
 if(car){if(IDX>=SL.length)IDX=0;car.scrollLeft=IDX*car.clientWidth;mark(IDX);
  /* 2026-11-23 Paul：左右滑到底不要停 → 循環。在最後一張再往左滑＝回第一張；在第一張再往右滑＝跳到最後一張（◀ ▶ 本來就會循環）。 */
  (function(){var s0=null;car.addEventListener('touchstart',function(e){s0=e.touches.length===1?{x:e.touches[0].clientX,y:e.touches[0].clientY,l:car.scrollLeft}:null;},{passive:true});
   car.addEventListener('touchend',function(e){var s=s0;s0=null;if(!s||SL.length<2)return;var p=e.changedTouches[0],dx=p.clientX-s.x,dy=p.clientY-s.y;if(Math.abs(dx)<48||Math.abs(dx)<Math.abs(dy)*1.6)return;
    var max=car.scrollWidth-car.clientWidth;if(dx<0&&s.l>=max-4)go(IDX+1);else if(dx>0&&s.l<=4)go(IDX-1);},{passive:true});})();
  var t=0;car.addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=0;var i=Math.round(car.scrollLeft/Math.max(1,car.clientWidth));if(i!==IDX){IDX=i;try{sessionStorage.setItem('hd_idx_'+P,i);}catch(e){}mark(i);}});},{passive:true});}
}
function mark(i){if(!W)return;[].forEach.call(W.querySelectorAll('.hd-tab'),function(b,j){b.classList.toggle('on',j===i);});[].forEach.call(W.querySelectorAll('.hd-dots i'),function(b,j){b.classList.toggle('on',j===i);});
 var tb=W.querySelector('.hd-tab.on'),tabs=W.querySelector('.hd-tabs');if(tb&&tabs)tabs.scrollLeft=Math.max(0,tb.offsetLeft-tabs.clientWidth/2+tb.offsetWidth/2);}
/* 2026-11-23 Paul：換頁要順，不要「到底後一張張倒退回最前面」。相鄰的照舊平滑滑過去；繞一圈（最後→第一）或跳很多張時，
   改成：目前這張淡出 → 直接換到目標那張 → 從滑動的方向輕輕滑進來。 */
function go(i){var car=W&&W.querySelector('.hd-car');if(!car)return;var n=SL.length,raw=i,from=IDX;i=(i+n)%n;if(i===from)return;var dir=raw>from?1:-1;IDX=i;mark(i);
 if(Math.abs(i-from)===1&&raw===i||!car.animate){car.scrollTo({left:i*car.clientWidth,behavior:'smooth'});return;}
 var a=car.animate([{opacity:1},{opacity:0}],{duration:130,easing:'ease-out'});
 a.onfinish=function(){try{car.scrollTo({left:i*car.clientWidth,behavior:'instant'});}catch(e){car.scrollLeft=i*car.clientWidth;}car.animate([{opacity:0,transform:'translateX('+(dir*42)+'px)'},{opacity:1,transform:'translateX(0)'}],{duration:340,easing:'cubic-bezier(.22,.61,.36,1)'});};}
function setGV(v,push){GV=v;if(push){try{history.pushState({hdg:v},'',location.href);}catch(e){}}last='';build();try{var y=W.getBoundingClientRect().top+G.scrollY-80;if(G.scrollY>y)G.scrollTo({top:Math.max(0,y)});}catch(e){}}
G.addEventListener('popstate',function(e){if(A.mode!=='grid'||!A.home())return;var v=e.state&&e.state.hdg;var nv=v>0?v:-1;if(nv!==GV)setGV(nv,false);});
document.addEventListener('click',function(e){if(!W||!W.contains(e.target))return;
 var t=e.target.closest('[data-hd],[data-hdp],[data-hk],[data-hg],[data-hgo],[data-hback]');if(!t)return;
 if(t.dataset.hd!=null){go(+t.dataset.hd);return;}
 if(t.dataset.hdp){go(IDX+(+t.dataset.hdp));return;}
 if(t.hasAttribute('data-hback')){if(history.state&&history.state.hdg>0)history.back();else setGV(-1,false);return;}
 if(t.dataset.hgo){setGV(+t.dataset.hgo,true);return;}
 if(t.dataset.hk!=null){var x=K[+t.dataset.hk];if(!x)return;if(x.act){var o=A.src().querySelectorAll('.stat')[+t.dataset.hk];if(o)o.click();return;}if(x.go){location.hash=x.go;return;}if(A.mode==='grid'){if(SL[1])setGV(1,true);}else go(1);return;}
 if(t.dataset.hg){var p=t.dataset.hg.split(':'),it=SL[+p[0]]&&SL[+p[0]].items[+p[1]];if(!it)return;
  if(it.route){location.hash=it.route;return;}if(it.go){var a=document.querySelector('#nav a[href="'+it.go+'"]');if(a)a.click();else location.hash=it.go.replace(/^#/,'');}
  if(A.mode==='grid'&&+p[0]>0){try{sessionStorage.setItem('hd_back_'+P,p[0]);}catch(x){}} /* 從分頁回總覽 → 先回到這個分類（放在點連結之後，側欄的清除才不會把它清掉） */}
});
/* 回到總覽：只有「從分類點進去的分頁」回來才先停在那個分類；其他方式（側欄、標誌）回總覽＝最外層 */
var wasHome=A.home();
G.addEventListener('hashchange',function(){var h=A.home();if(h&&!wasHome){var b=null;try{b=sessionStorage.getItem('hd_back_'+P);sessionStorage.removeItem('hd_back_'+P);}catch(e){}GV=b!=null?+b:-1;last='';}wasHome=h;build();});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#nav a[href],.sidebar [data-route]');if(a){try{sessionStorage.removeItem('hd_back_'+P);}catch(x){}}},true);
new MutationObserver(function(){try{build();}catch(e){}}).observe(document.body,{childList:true,subtree:true,characterData:true});
try{build();}catch(e){}
})(window);
