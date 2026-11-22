/* PSJ 點了就有重點卡 psj-keynote.js v1（2026-11-22）
   Paul：「keynote 在 PSJ 這些平台主頁或分頁有的還是按了沒連接出現」→ 補上沒反應的地方：
   1 KPI 小卡（人數、金額、件數…）點了 → 跳出大字卡：這張的數字＋說明，下面列同一排的其他 KPI（可點換、◀ ▶、左右滑）。
   2 表格的一列，原本點了沒任何動作的 → 跳出這一列的重點卡（欄位：值），◀ ▶／左右滑換下一列。
   不碰的：原本點了就有功能的列／卡（會開員工、切期間、開視窗…照舊）、按鈕／連結／輸入框、
           已經有自己 Keynote 的分頁（HRA Portal／HRA-PAY 的列表 Keynote、PSJHR 平台頁的重點卡）。
   只讀畫面上的字，不動資料、不寫雲端。由 PSJHR／PSJERP／PSJGA 主頁載入，同網域的嵌入分頁一起照顧。 */
(function(G){
'use strict';
if(G.PSJKN)return;
var D=document,API=G.PSJKN={hook:hook};
var SKIP='button,a[href],input,select,textarea,label,summary,[contenteditable],[onclick],[role=button],[data-action]';
var NOGO='dialog,[role=dialog],[class*=modal i],[class*=drawer i],#drawer,#kn-mask,.pkn-mask,#hdWrap,nav,header,.side,.sidebar';
var KSEL='.kpi,.stat,.kcard,.metric,.kpi-card,.stat-card,.sum-card,.mini-kpi,.kpis>*,.stats>*,.kpi-grid>*,.kpi-row>*,.cards-kpi>*';
function txt(e){return String(e&&(e.innerText||e.textContent)||'').replace(/[ \t ]+/g,' ').replace(/\n\s*\n+/g,'\n').trim();}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ptr(w,e){try{return w.getComputedStyle(e).cursor==='pointer';}catch(x){return false;}}

/* ── 標記：哪些列／卡原本點了沒反應 ── */
function markDoc(doc){var w=doc.defaultView;if(!w||!doc.body)return;
 var rowsOk=!w.__acKeynote&&!doc.__psjKn;
 if(rowsOk){var trs=doc.querySelectorAll('tbody tr:not(.pkn-row):not([data-pkn-no])');for(var i=0;i<trs.length&&i<4000;i++){var tr=trs[i];
   if(tr.cells.length<2||tr.closest(NOGO)||tr.closest('table[data-keynote="off"]')){tr.setAttribute('data-pkn-no','');continue;}
   if(tr.offsetParent===null)continue;
   var own=tr.hasAttribute('onclick')||ptr(w,tr)||[].some.call(tr.cells,function(c){return c.hasAttribute('onclick')||ptr(w,c);});
   if(own){tr.setAttribute('data-pkn-no','');continue;}
   tr.classList.add('pkn-row');}}
 var ks=doc.querySelectorAll(KSEL);for(var j=0;j<ks.length&&j<600;j++){var k=ks[j];if(k.classList.contains('pkn-kpi')||k.hasAttribute('data-pkn-no'))continue;
   if(k.offsetParent===null)continue;
   var r=k.getBoundingClientRect(),t=txt(k);
   var bad=r.width<70||r.width>560||r.height<34||r.height>260||!/\d/.test(t)||t.length>180||k.closest(NOGO)||k.closest('.pkn-kpi')||k.querySelector('.pkn-kpi')||
     k.hasAttribute('onclick')||ptr(w,k)||k.closest('button,a,[onclick],[role=button]')||k.querySelector('button,a[href],input,select,textarea,[onclick],table,canvas,svg');
   if(bad){k.setAttribute('data-pkn-no','');continue;}
   k.classList.add('pkn-kpi');}}

function hook(doc){if(!doc||doc.__pkn)return;var w=doc.defaultView;if(!w)return;doc.__pkn=1;
 try{var st=doc.createElement('style');st.id='pkn-css';st.textContent='tbody tr.pkn-row{cursor:pointer}tbody tr.pkn-row:hover>td{filter:brightness(.97)}.pkn-kpi{cursor:pointer;transition:transform .12s ease,box-shadow .12s ease}.pkn-kpi:hover{box-shadow:0 4px 14px rgba(15,23,42,.12)}.pkn-kpi:active{transform:scale(.97)}';(doc.head||doc.documentElement).appendChild(st);}catch(e){}
 var tm=0,run=function(){tm=0;try{markDoc(doc);}catch(e){}};
 run();setTimeout(run,1200);
 try{new w.MutationObserver(function(){if(!tm)tm=setTimeout(run,400);}).observe(doc.body,{childList:true,subtree:true});}catch(e){}
 doc.addEventListener('click',function(e){if(e.defaultPrevented||e.button!==0)return;var t=e.target;if(!t||!t.closest)return;
   try{var sel=w.getSelection&&String(w.getSelection());if(sel&&sel.length>1)return;}catch(x){}
   var tr=t.closest('tr.pkn-row'),kp=!tr&&t.closest('.pkn-kpi');if(!tr&&!kp)return;
   var hit=t.closest(SKIP);if(hit&&(tr?tr.contains(hit):kp.contains(hit)))return;
   if(tr){if(doc===D&&typeof G.psjKnOpenRows==='function'){G.psjKnOpenRows(tr);return;}openRows(tr);}
   else openKpis(kp);},false);}

/* ── 外框：嵌入分頁一起照顧（同網域、載入後） ── */
function frames(){[].forEach.call(D.querySelectorAll('iframe'),function(f){if(f.__pknF)return;f.__pknF=1;
  var go=function(){try{var d=f.contentDocument;if(d&&d.body&&d.URL!=='about:blank')hook(d);}catch(e){}};
  f.addEventListener('load',function(){setTimeout(go,600);});go();});}

/* ── 重點卡（畫在外框上，手機是下方滑出） ── */
var mask=null,box=null,S={list:[],i:0,kind:''};
function dark(){var r=D.documentElement;return r.hasAttribute('data-dark')||r.getAttribute('data-theme')==='dark'||r.hasAttribute('data-ga-dark');}
function ui(){if(mask)return;
 var st=D.createElement('style');st.textContent=
  '.pkn-mask{position:fixed;inset:0;z-index:99990;background:rgba(15,23,42,.5);display:none;align-items:flex-end;justify-content:center;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}.pkn-mask.on{display:flex}@media(min-width:720px){.pkn-mask{align-items:center}}'+
  '.pkn-box{--c:#fff;--i:#0f172a;--m:#64748b;--l:#e2e8f0;--s:#f8fafc;background:var(--c);color:var(--i);width:min(640px,100%);max-height:86vh;overflow:auto;overscroll-behavior:contain;border-radius:18px 18px 0 0;box-shadow:0 -8px 40px rgba(0,0,0,.3);font-family:inherit;animation:pknUp .2s ease-out}'+
  '.pkn-box.dk{--c:#1b1f27;--i:#eef1f6;--m:#9aa4b5;--l:#2e3542;--s:#232935}@media(min-width:720px){.pkn-box{border-radius:18px}}@keyframes pknUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}'+
  '.pkn-h{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:8px;padding:12px 14px;background:#0f172a;color:#fff}.pkn-t{flex:1;min-width:0;font-weight:700;font-size:16px;line-height:1.3;word-break:break-word}.pkn-pos{font-size:11.5px;opacity:.75;white-space:nowrap}'+
  '.pkn-h button{border:0;background:rgba(255,255,255,.16);color:#fff;width:34px;height:34px;border-radius:50%;font-size:15px;cursor:pointer;flex:none}'+
  '.pkn-big{padding:18px 16px 6px}.pkn-bl{font-size:13px;color:var(--m)}.pkn-bv{font-size:34px;font-weight:800;line-height:1.15;margin:4px 0;word-break:break-word}.pkn-bs{font-size:13px;color:var(--m);white-space:pre-wrap;line-height:1.5}'+
  '.pkn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;padding:12px 16px 18px}.pkn-g{border:1px solid var(--l);background:var(--s);border-radius:12px;padding:9px 11px;cursor:pointer;text-align:left;color:inherit;font:inherit}.pkn-g.on{outline:2px solid #0ea5e9}.pkn-gl{font-size:11px;color:var(--m)}.pkn-gv{font-size:18px;font-weight:700;line-height:1.2;word-break:break-word}'+
  '.pkn-rows{padding:6px 16px 18px}.pkn-r{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--l);font-size:14px}.pkn-r:last-child{border-bottom:0}.pkn-rl{flex:0 0 38%;color:var(--m);font-size:12.5px}.pkn-rv{flex:1;font-weight:600;word-break:break-word;white-space:pre-wrap}';
 D.head.appendChild(st);
 mask=D.createElement('div');mask.className='pkn-mask';mask.innerHTML='<div class="pkn-box" role="dialog" aria-modal="true"></div>';box=mask.firstChild;D.body.appendChild(mask);
 mask.addEventListener('click',function(e){if(e.target===mask)close();var b=e.target.closest&&e.target.closest('[data-pk]');if(!b)return;var a=b.getAttribute('data-pk');if(a==='x')close();else if(a==='p')step(-1);else if(a==='n')step(1);else if(/^\d+$/.test(a)){S.i=+a;draw();}});
 D.addEventListener('keydown',function(e){if(!mask.classList.contains('on'))return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);});
 var sx=0,sy=0;box.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
 box.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)step(dx<0?1:-1);},{passive:true});}
function close(){if(mask)mask.classList.remove('on');}
function step(d){var j=S.i+d;if(j<0||j>=S.list.length)return;S.i=j;draw();}
function head(title){return '<div class="pkn-h"><div class="pkn-t">'+title+'</div><span class="pkn-pos">'+(S.i+1)+' / '+S.list.length+'</span>'+(S.list.length>1?'<button data-pk="p" aria-label="prev">◀</button><button data-pk="n" aria-label="next">▶</button>':'')+'<button data-pk="x" aria-label="close">✕</button></div>';}
function heads(tr){var tb=tr.closest('table'),out=[],row=tb&&tb.tHead&&tb.tHead.rows.length?tb.tHead.rows[tb.tHead.rows.length-1]:null,c=0;if(!row)return out;[].forEach.call(row.cells,function(x){var t=txt(x).replace(/\n/g,' ');for(var j=0;j<(x.colSpan||1);j++)out[c++]=t;});return out;}
function kpiParts(el){var v=el.querySelector('.v,.val,.value,.num,.n,.big,.kv,.kpi-v,.stat-v,b,strong'),l=el.querySelector('.l,.lb,.label,.t,.title,.k,.kl,.kpi-l,.stat-l,small');
 var lines=txt(el).split('\n').map(function(s){return s.trim();}).filter(Boolean);
 var val=v&&txt(v)&&/\d/.test(txt(v))?txt(v).split('\n')[0]:'';if(!val)val=lines.filter(function(s){return /\d/.test(s)&&s.length<=26;})[0]||lines[0]||'';
 var lab=l&&txt(l)&&txt(l)!==val?txt(l).split('\n')[0]:'';if(!lab)lab=lines.filter(function(s){return s!==val;})[0]||'';
 var sub=lines.filter(function(s){return s!==val&&s!==lab;}).join('\n');return {l:lab,v:val,s:sub};}
function draw(){var it=S.list[S.i];if(!it)return;box.classList.toggle('dk',dark());
 if(S.kind==='kpi'){var p=kpiParts(it);
  box.innerHTML=head('📊 '+esc(p.l||p.v))+'<div class="pkn-big"><div class="pkn-bl">'+esc(p.l)+'</div><div class="pkn-bv">'+esc(p.v)+'</div>'+(p.s?'<div class="pkn-bs">'+esc(p.s)+'</div>':'')+'</div>'+
   (S.list.length>1?'<div class="pkn-grid">'+S.list.map(function(k,i){var q=kpiParts(k);return '<button class="pkn-g'+(i===S.i?' on':'')+'" data-pk="'+i+'"><div class="pkn-gl">'+esc(q.l)+'</div><div class="pkn-gv">'+esc(q.v)+'</div></button>';}).join('')+'</div>':'');}
 else{var hs=heads(it),kv=[],title='';[].forEach.call(it.cells,function(td,j){var v=txt(td),h=hs[j]||'';if(!h&&!v)return;if(!title&&v&&!/^[\d\-\/\s.:—$,%+]+$/.test(v))title=v.split('\n')[0];kv.push([h||'—',v||'—']);});
  box.innerHTML=head('🔎 '+esc(title||(kv[0]&&kv[0][1])||'—'))+'<div class="pkn-rows">'+kv.map(function(p){return '<div class="pkn-r"><div class="pkn-rl">'+esc(p[0])+'</div><div class="pkn-rv">'+esc(p[1])+'</div></div>';}).join('')+'</div>';
  try{it.scrollIntoView({block:'nearest'});}catch(e){}}
 box.scrollTop=0;mask.classList.add('on');}
function openRows(tr){ui();var tb=tr.closest('tbody');S.kind='row';S.list=tb?[].filter.call(tb.rows,function(r){return r.classList.contains('pkn-row')&&r.offsetParent!==null;}):[tr];S.i=Math.max(0,S.list.indexOf(tr));draw();}
function openKpis(el){ui();var par=el.parentElement;S.kind='kpi';S.list=par?[].filter.call(par.children,function(x){return x.classList.contains('pkn-kpi')&&x.offsetParent!==null;}):[el];if(!S.list.length)S.list=[el];S.i=Math.max(0,S.list.indexOf(el));draw();}
API.openRows=openRows;API.openKpis=openKpis;

function start(){hook(D);frames();setInterval(frames,2000);}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})(window);
