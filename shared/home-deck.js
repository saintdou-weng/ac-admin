/* VRT 首頁摘要輪播 home-deck.js v1（2026-11-22）
   Paul：把 Admin OS 首頁的瀏覽方式（彩色摘要卡、上方分類標籤、左右滑、圓點、進入）用到 PSJHR／PSJERP／PSJGA 主頁。
   · 第 1 張「總覽」＝平台原本的重點數字（照原頁抓，數字一定一致），每格都能點，直接進對應頁面；
   · 後面每一張＝側欄的一個分類（人員、出勤、薪資…），每格＝那個分類的頁面（含數量徽章），點了就進去；
   · 原本那排重點數字收起來（還在頁面裡，資料、點擊照舊），其他圖表不動；
   · 只在主頁出現；換語言／數字更新會自動重畫；手機手指左右滑、電腦有 ‹ › 鈕。 */
(function(G){
'use strict';
if(G.VRTHomeDeck)return;G.VRTHomeDeck=1;
var P=(location.pathname||'').toLowerCase();
var A=null;
var PAL=['#0f766e','#2563eb','#7c3aed','#c2410c','#be185d','#0369a1','#4d7c0f','#a16207','#475569','#9333ea'];
var KW_HR=[[/在職|headcount|active/i,'emp'],[/新進|離職|join|leav|resign/i,'joinleave'],[/異常|exception/i,'attexc'],[/請假|leave/i,'leave'],[/出勤|工時|未請假|attend|hour/i,'att'],[/薪資|payroll|salary/i,'payroll'],[/伙食|meal/i,'meal']];
var KW_ERP=[[/訂單|order/i,'orders'],[/成品|finished|fg/i,'fg'],[/出貨|ship/i,'shipping'],[/布|fabric/i,'fabric'],[/輔料|access/i,'accessories'],[/應付|payable|ap/i,'payables'],[/發票|invoice/i,'invoices'],[/產量|生產|output|prod/i,'production']];
function psj(kw){return {
  home:function(){var h=(location.hash||'').slice(1).split(/[/?]/)[0];return !h||h==='dashboard';},
  host:function(){return document.getElementById('page');},
  src:function(){var p=document.getElementById('page');if(!p)return null;for(var i=0;i<p.children.length;i++){var c=p.children[i];if(c.classList.contains('kpis'))return c;}return null;},
  kpis:function(src){return [].slice.call(src.querySelectorAll('.kpi')).map(function(k){var l=k.querySelector('.l'),v=k.querySelector('.v'),d=k.querySelector('.d');var lab=l?l.textContent.trim():'';var r=null;for(var i=0;i<kw.length;i++)if(kw[i][0].test(lab)){r=kw[i][1];break;}
    if(r&&!document.querySelector('#nav a[href="#'+r+'"]'))r=null;return {l:lab,v:v?v.textContent.trim():'',d:d?d.textContent.trim():'',hot:/warn|crit|bad|hot/.test(k.className),go:r?'#'+r:null};});},
  groups:function(){var n=document.getElementById('nav');if(!n)return [];var gs=[],g=null;[].forEach.call(n.children,function(c){
    if(c.classList.contains('nav-g')){g={t:c.textContent.trim(),items:[]};gs.push(g);return;}
    if(c.tagName==='A'&&g){var href=c.getAttribute('href')||'';if(!href||href==='#dashboard')return;var tx=c.textContent.trim().replace(/\s+/g,' ');var ic=(tx.match(/^(\p{Extended_Pictographic}️?|\S)/u)||[''])[0];
      var bd=c.querySelector('.bd,.badge,.cnt,small,i');var badge=bd?bd.textContent.trim():'';var name=tx.slice(ic.length).replace(badge,'').trim();if(/^(Portal|HRA-PAY|Audit|Admin)$/.test(badge))badge='';
      g.items.push({ic:ic,t:name||tx,b:badge,go:href});}});return gs.filter(function(x){return x.items.length;});},
  title:function(){var b=document.querySelector('.brand b,.brand .nm,.brand');return b?b.textContent.trim().split('\n')[0]:'';}
};}
if(P.indexOf('/psjhr/')===0)A=psj(KW_HR);
else if(P.indexOf('/psjerp/')===0)A=psj(KW_ERP);
else if(P.indexOf('/psjgas/')===0)A={
  home:function(){var h=(location.hash||'').slice(1);return !h||h==='overview';},
  host:function(){var s=document.querySelector('.stats');return s&&s.parentElement;},
  src:function(){return document.querySelector('.stats');},
  kpis:function(src){return [].slice.call(src.querySelectorAll('.stat')).map(function(k){return {l:(k.querySelector('.stat-head span')||{textContent:''}).textContent.trim(),v:(k.querySelector('.stat-value')||{textContent:''}).textContent.trim(),d:(k.querySelector('.stat-bottom')||{textContent:''}).textContent.trim(),act:k.dataset.action||'',go:null};});},
  groups:function(){var sb=document.querySelector('.sidebar');if(!sb)return [];var gs=[],g=null;[].forEach.call(sb.querySelectorAll('.nav-caption,.nav-btn'),function(c){
    if(c.classList.contains('nav-caption')){g={t:c.textContent.trim(),items:[]};gs.push(g);return;}
    if(!g||c.dataset.route==='overview')return;var bd=c.querySelector('.badge,.count,small,em');g.items.push({ic:'',svg:(c.querySelector('svg')||{outerHTML:''}).outerHTML,t:(c.querySelector('span')||c).textContent.trim(),b:bd?bd.textContent.trim():'',route:c.dataset.route});});
    return gs.filter(function(x){return x.items.length;});},
  title:function(){return '';}
};
if(!A)return;
var css='.hd-wrap{margin:4px 0 16px}.hd-tabs{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;margin:0 0 8px}.hd-tabs::-webkit-scrollbar{display:none}'+
 '.hd-tab{flex:0 0 auto;border:1px solid rgba(127,127,127,.28);background:var(--surface,#fff);color:inherit;border-radius:999px;padding:6px 13px;font:700 13px/1.2 inherit;white-space:nowrap;cursor:pointer;display:flex;align-items:center;gap:6px}'+
 '.hd-tab i{width:8px;height:8px;border-radius:50%;background:var(--c)}.hd-tab.on{background:var(--c);border-color:var(--c);color:#fff}.hd-tab.on i{background:#fff}'+
 '.hd-carw{position:relative}.hd-car{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;border-radius:18px;-webkit-overflow-scrolling:touch}.hd-car::-webkit-scrollbar{display:none}'+
 '.hd-slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;padding:1px}'+
 '.hd-box{background:linear-gradient(160deg,color-mix(in srgb,var(--c) 92%,#000),color-mix(in srgb,var(--c) 70%,#1b2738));color:#fff;border-radius:18px;padding:16px clamp(12px,2.4vw,22px) 14px;min-height:230px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden}'+
 '.hd-head{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.hd-head h2{margin:0;font-size:19px;color:#fff}.hd-head .pl{font-size:12px;opacity:.85;background:rgba(255,255,255,.16);border-radius:999px;padding:2px 10px}'+
 '.hd-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(46%,160px),1fr));gap:9px}'+
 '.hd-tile{background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.2);border-radius:13px;padding:10px 12px;text-align:left;color:#fff;display:flex;flex-direction:column;gap:2px;min-width:0;cursor:pointer;font:inherit;text-decoration:none}'+
 '.hd-tile:hover{background:rgba(255,255,255,.24)}.hd-tile .l{font-size:12px;opacity:.9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.hd-tile .v{font-size:clamp(21px,3.2vw,28px);font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '.hd-tile .d{font-size:11.5px;opacity:.82;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hd-tile.hot{background:#fff;color:#9a3412;border-color:#fff}.hd-tile.hot .v{color:#c2410c}'+
 '.hd-tile.m{flex-direction:row;align-items:center;gap:9px}.hd-tile.m .ic{font-size:20px;flex:none;width:24px;text-align:center}.hd-tile.m .ic svg{width:20px;height:20px;stroke:#fff;fill:none;stroke-width:1.8}.hd-tile.m .t{flex:1;min-width:0;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hd-tile.m .b{font-weight:800;font-size:13px;background:rgba(255,255,255,.2);border-radius:999px;padding:1px 8px}'+
 '.hd-nav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:0;background:#fff;color:#1b2738;box-shadow:0 2px 10px rgba(27,39,56,.25);font-size:16px;z-index:3;cursor:pointer}.hd-nav.l{left:-10px}.hd-nav.r{right:-10px}'+
 '.hd-dots{display:flex;justify-content:center;gap:7px;margin:9px 0 2px}.hd-dots i{width:8px;height:8px;border-radius:50%;background:rgba(127,127,127,.4);transition:.2s;cursor:pointer}.hd-dots i.on{width:22px;border-radius:5px;background:currentColor}'+
 '.hd-src-hidden{display:none!important}@media(max-width:900px){.hd-nav{display:none}.hd-box{min-height:210px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var IDX=0;try{IDX=+sessionStorage.getItem('hd_idx_'+P)||0;}catch(e){}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function sig(){var s=A.src();var n=document.getElementById('nav')||document.querySelector('.sidebar');return (s?s.textContent:'')+'|'+(n?n.textContent.length:0)+'|'+document.documentElement.lang;}
var last='',busy=false;
function build(){
 var host=A.host(),src=A.src();var old=document.getElementById('hdWrap');
 if(!A.home()||!src||!host){if(old&&!A.home())old.remove();return;}
 var s=sig();if(old&&s===last&&old.parentNode)return;last=s;
 var k=A.kpis(src),gs=A.groups();
 var en=/^en|^km/.test(document.documentElement.lang||'')||/[a-z]{4}/i.test((gs[0]||{}).t||'');
 var slides=[{t:en?'Overview':'總覽',c:PAL[0],kpi:k}].concat(gs.map(function(g,i){return {t:g.t,c:PAL[(i+1)%PAL.length],items:g.items};}));
 var h='<div class="hd-tabs">'+slides.map(function(sl,i){return '<button type="button" class="hd-tab" style="--c:'+sl.c+'" data-hd="'+i+'"><i></i>'+esc(sl.t)+'</button>';}).join('')+'</div>'+
  '<div class="hd-carw"><button type="button" class="hd-nav l" data-hdp="-1" aria-label="Previous">‹</button><div class="hd-car" data-noswipe>'+
  slides.map(function(sl,i){var body;
   if(sl.kpi)body='<div class="hd-tiles">'+sl.kpi.map(function(x,j){return '<button type="button" class="hd-tile'+(x.hot?' hot':'')+'" data-hk="'+j+'"><span class="l">'+esc(x.l)+'</span><span class="v">'+esc(x.v)+'</span>'+(x.d?'<span class="d">'+esc(x.d)+'</span>':'')+'</button>';}).join('')+'</div>';
   else body='<div class="hd-tiles">'+sl.items.map(function(x,j){return '<button type="button" class="hd-tile m" data-hg="'+i+':'+j+'"><span class="ic">'+(x.svg||esc(x.ic))+'</span><span class="t">'+esc(x.t)+'</span>'+(x.b?'<span class="b">'+esc(x.b)+'</span>':'')+'</button>';}).join('')+'</div>';
   return '<div class="hd-slide"><div class="hd-box" style="--c:'+sl.c+'"><div class="hd-head"><h2>'+esc(sl.t)+'</h2><span class="pl">'+(sl.kpi?sl.kpi.length:sl.items.length)+(en?' items':' 項')+'</span></div>'+body+'</div></div>';}).join('')+
  '</div><button type="button" class="hd-nav r" data-hdp="1" aria-label="Next">›</button></div><div class="hd-dots">'+slides.map(function(_,i){return '<i data-hd="'+i+'"></i>';}).join('')+'</div>';
 var w=old||document.createElement('div');w.id='hdWrap';w.className='hd-wrap';w.innerHTML=h;
 if(!old||w.nextSibling!==src)host.insertBefore(w,src);
 src.classList.add('hd-src-hidden');
 w._slides=slides;w._k=k;
 var car=w.querySelector('.hd-car');if(IDX>=slides.length)IDX=0;
 requestAnimationFrame(function(){car.scrollLeft=IDX*car.clientWidth;mark(w,IDX);});
 var t=0;car.addEventListener('scroll',function(){if(t)return;t=requestAnimationFrame(function(){t=0;var i=Math.round(car.scrollLeft/Math.max(1,car.clientWidth));if(i!==IDX){IDX=i;try{sessionStorage.setItem('hd_idx_'+P,i);}catch(e){}mark(w,i);}});},{passive:true});
}
function mark(w,i){[].forEach.call(w.querySelectorAll('.hd-tab'),function(b,j){b.classList.toggle('on',j===i);});[].forEach.call(w.querySelectorAll('.hd-dots i'),function(b,j){b.classList.toggle('on',j===i);});
 var tb=w.querySelector('.hd-tab.on'),tabs=w.querySelector('.hd-tabs');if(tb&&tabs)tabs.scrollLeft=Math.max(0,tb.offsetLeft-tabs.clientWidth/2+tb.offsetWidth/2);}
function go(i){var w=document.getElementById('hdWrap');if(!w)return;var car=w.querySelector('.hd-car');var n=w._slides.length;i=(i+n)%n;IDX=i;car.scrollTo({left:i*car.clientWidth,behavior:'smooth'});mark(w,i);}
document.addEventListener('click',function(e){var w=document.getElementById('hdWrap');if(!w||!w.contains(e.target))return;
 var t=e.target.closest('[data-hd],[data-hdp],[data-hk],[data-hg]');if(!t)return;
 if(t.dataset.hd!=null){go(+t.dataset.hd);return;}
 if(t.dataset.hdp){go(IDX+(+t.dataset.hdp));return;}
 if(t.dataset.hk!=null){var x=w._k[+t.dataset.hk];if(x.act){var o=A.src().querySelectorAll('.stat')[+t.dataset.hk];if(o)o.click();return;}if(x.go){location.hash=x.go;return;}var nx=w._slides[1];if(nx){go(1);}return;}
 if(t.dataset.hg){var p=t.dataset.hg.split(':'),it=w._slides[+p[0]].items[+p[1]];if(it.route){location.hash=it.route;return;}if(it.go){var a=document.querySelector('#nav a[href="'+it.go+'"]');if(a)a.click();else location.hash=it.go.replace(/^#/,'');}}
});
var tm=0;function ask(){if(tm)return;tm=setTimeout(function(){tm=0;try{build();}catch(e){}},180);}
new MutationObserver(ask).observe(document.body,{childList:true,subtree:true,characterData:true});
G.addEventListener('hashchange',ask);ask();
})(window);
