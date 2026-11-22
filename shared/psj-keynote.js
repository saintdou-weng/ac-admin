/* PSJ 點了就有重點卡 psj-keynote.js v2（2026-11-22）
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
var KSEL='.kpi,.stat,.kcard,.metric,.kpi-card,.stat-card,.sum-card,.mini-kpi,.kpis>*,.stats>*,.kpi-grid>*,.kpi-row>*,.cards-kpi>*,.report-card';
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

/* ── 重點卡（畫在外框上，手機是下方滑出）
   v2（2026-11-22，Paul：「成品入庫點了 keynote 沒法連續下滑換別的資料，也沒顯示進一步的相關資料」）
   - 連續往下滑：捲到底自動接下一張（KPI 接下一個 KPI、列接下一列），上面標題／第幾張跟著換；◀ ▶、左右滑照舊。
   - 進一步資料：KPI → 依名稱找同一區的明細表（客戶數→各客戶、PO 數→各 PO、PCS／USD→最大的幾筆…），點了看那幾列；
     列 → 數字欄的合計／平均／第幾名＋比例條、「同一客戶／款式／PO 的其他列」，款號可開 VRT ERP 款式卡。
   - ↩ 回上一層。只讀畫面上的字，不動資料。 */
var mask=null,box=null,S={list:[],i:0,kind:''},STK=[],REG=[],IO=null,last=0,base=0;
function dark(){var r=D.documentElement;return r.hasAttribute('data-dark')||r.getAttribute('data-theme')==='dark'||r.hasAttribute('data-ga-dark');}
function numOf(s){s=String(s||'').replace(/[,$\s]|pcs|PCS|件|筆|USD|US\$/g,'');var m=s.match(/^-?\d+(\.\d+)?%?$/);return m?parseFloat(s):null;}
function F(n,d){return n==null||!isFinite(n)?'—':Number(n).toLocaleString('en-US',{maximumFractionDigits:d==null?2:d});}
function ui(){if(mask)return;
 var st=D.createElement('style');st.textContent=
  '.pkn-mask{position:fixed;inset:0;z-index:99990;background:rgba(15,23,42,.5);display:none;align-items:flex-end;justify-content:center;-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}.pkn-mask.on{display:flex}@media(min-width:720px){.pkn-mask{align-items:center}}'+
  '.pkn-box{--c:#fff;--i:#0f172a;--m:#64748b;--l:#e2e8f0;--s:#f8fafc;--a:#eef2ff;--ab:#c7d2fe;--at:#3730a3;background:var(--c);color:var(--i);width:min(680px,100%);height:min(88vh,920px);overflow:auto;overscroll-behavior:contain;border-radius:18px 18px 0 0;box-shadow:0 -8px 40px rgba(0,0,0,.3);font-family:inherit;animation:pknUp .2s ease-out}'+
  '.pkn-box.dk{--c:#1b1f27;--i:#eef1f6;--m:#9aa4b5;--l:#2e3542;--s:#232935;--a:#262c48;--ab:#3b4475;--at:#c7d2fe}@media(min-width:720px){.pkn-box{border-radius:18px}}@keyframes pknUp{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}'+
  '.pkn-h{position:sticky;top:0;z-index:2;display:flex;align-items:center;gap:8px;padding:12px 14px;background:#0f172a;color:#fff}.pkn-t{flex:1;min-width:0;font-weight:700;font-size:16px;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pkn-pos{font-size:11.5px;opacity:.75;white-space:nowrap}'+
  '.pkn-h button{border:0;background:rgba(255,255,255,.16);color:#fff;width:34px;height:34px;border-radius:50%;font-size:15px;cursor:pointer;flex:none}.pkn-h button:disabled{opacity:.3}'+
  '.pkn-sec{padding-bottom:6px}.pkn-sec+.pkn-sec{border-top:3px dashed var(--l);margin-top:6px}.pkn-sh{display:flex;gap:8px;align-items:baseline;padding:14px 16px 0}.pkn-sh b{font-size:18px;word-break:break-word}.pkn-sh span{margin-left:auto;font-size:11.5px;color:var(--m);white-space:nowrap}'+
  '.pkn-big{padding:10px 16px 6px}.pkn-bl{font-size:13px;color:var(--m)}.pkn-bv{font-size:34px;font-weight:800;line-height:1.15;margin:4px 0;word-break:break-word}.pkn-bs{font-size:13px;color:var(--m);white-space:pre-wrap;line-height:1.5}'+
  '.pkn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;padding:10px 16px 8px}.pkn-g{border:1px solid var(--l);background:var(--s);border-radius:12px;padding:9px 11px;cursor:pointer;text-align:left;color:inherit;font:inherit}.pkn-g.on{outline:2px solid #0ea5e9}.pkn-gl{font-size:11px;color:var(--m)}.pkn-gv{font-size:18px;font-weight:700;line-height:1.2;word-break:break-word}'+
  '.pkn-bar{height:5px;border-radius:3px;background:var(--l);margin:6px 0 3px;overflow:hidden}.pkn-bar i{display:block;height:100%;background:#4f46e5;border-radius:3px}.pkn-ref{font-size:10.5px;color:var(--m)}'+
  '.pkn-rel{margin:8px 16px 4px;padding:10px 12px;border-radius:12px;background:var(--a);border:1px solid var(--ab)}.pkn-rt{font-weight:700;font-size:13px;margin-bottom:6px}.pkn-rt small{font-weight:400;color:var(--m);margin-left:4px}'+
  '.pkn-it{display:flex;gap:10px;align-items:center;width:100%;text-align:left;border:0;border-top:1px solid var(--ab);background:none;color:inherit;font:inherit;padding:7px 2px;cursor:pointer}.pkn-it:first-of-type{border-top:0}.pkn-it .nm{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pkn-it .vl{font-weight:700;white-space:nowrap}.pkn-it .sb{font-size:11px;color:var(--m);white-space:nowrap}.pkn-it .bx{flex:0 0 70px;height:6px;border-radius:3px;background:var(--l);overflow:hidden}.pkn-it .bx i{display:block;height:100%;background:#6366f1}'+
  '.pkn-lk{display:flex;flex-wrap:wrap;gap:6px;padding:8px 16px 0}.pkn-lk button{border:1px solid var(--ab);background:var(--a);color:var(--at);border-radius:999px;padding:6px 11px;font:600 12.5px/1 inherit;cursor:pointer}'+
  '.pkn-rows{padding:6px 16px 8px}.pkn-r{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--l);font-size:14px}.pkn-r:last-child{border-bottom:0}.pkn-rl{flex:0 0 38%;color:var(--m);font-size:12.5px}.pkn-rv{flex:1;font-weight:600;word-break:break-word;white-space:pre-wrap}'+
  '.pkn-more{margin:14px 16px 22px;padding:12px;text-align:center;color:var(--m);border:1px dashed var(--l);border-radius:12px;cursor:pointer;font-size:13px}';
 D.head.appendChild(st);
 mask=D.createElement('div');mask.className='pkn-mask';mask.innerHTML='<div class="pkn-box" role="dialog" aria-modal="true"></div>';box=mask.firstChild;D.body.appendChild(mask);
 mask.addEventListener('click',function(e){if(e.target===mask)return close();var b=e.target.closest&&e.target.closest('[data-pk]');if(!b)return;var a=b.getAttribute('data-pk'),m;
  if(a==='x')close();else if(a==='p')step(-1);else if(a==='n')step(1);else if(a==='b')back();else if(a==='more')add();
  else if(/^\d+$/.test(a)){S.i=+a;draw();}
  else if((m=a.match(/^r(\d+):(\d+)$/))){var l=REG[+m[1]],sc=b.closest('.pkn-sec');if(sc)S.i=+sc.getAttribute('data-i');if(l)push('row',l,+m[2]);}
  else if((m=a.match(/^s:(.+)$/))){openStyleCard(decodeURIComponent(m[1]));}});
 D.addEventListener('keydown',function(e){if(!mask.classList.contains('on'))return;if(e.key==='Escape')(STK.length?back():close());else if(e.key==='ArrowRight')step(1);else if(e.key==='ArrowLeft')step(-1);});
 var sx=0,sy=0;box.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
 box.addEventListener('touchend',function(e){if(e.target.closest&&e.target.closest('.pkn-grid,.pkn-lk'))return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6)step(dx<0?1:-1);},{passive:true});
 var tk=0;box.addEventListener('scroll',function(){if(tk)return;tk=setTimeout(function(){tk=0;fill();var c=base,secs=box.querySelectorAll('.pkn-sec'),top=box.scrollTop+70;for(var k=0;k<secs.length;k++){if(secs[k].offsetTop<=top)c=+secs[k].getAttribute('data-i');else break;}if(c!==S.i){S.i=c;setHead();}},90);},{passive:true});}
function close(){if(mask)mask.classList.remove('on');STK=[];if(IO){IO.disconnect();IO=null;}}
function step(d){var j=S.i+d;if(j<0||j>=S.list.length)return;S.i=j;draw();}
function push(kind,list,i){STK.push({kind:S.kind,list:S.list,i:S.i});S.kind=kind;S.list=list;S.i=Math.max(0,i);draw();}
function back(){var s=STK.pop();if(!s)return close();S.kind=s.kind;S.list=s.list;S.i=s.i;draw();}
function reg(l){REG.push(l);return REG.length-1;}
function heads(tr){var tb=tr.closest('table'),out=[],row=tb&&tb.tHead&&tb.tHead.rows.length?tb.tHead.rows[tb.tHead.rows.length-1]:null,c=0;if(!row)return out;[].forEach.call(row.cells,function(x){var t=txt(x).replace(/\n/g,' ').replace(/\s*[▲▼↕⇅]\s*$/,'');for(var j=0;j<(x.colSpan||1);j++)out[c++]=t;});return out;}
function kpiParts(el){var v=el.querySelector('.stat-value,.v,.val,.value,.num,.n,.big,.kv,.kpi-v,.stat-v,b,strong'),l=el.querySelector('.l,.lb,.label,.t,.title,.k,.kl,.kpi-l,.stat-l,small');
 var lines=txt(el).split('\n').map(function(s){return s.trim();}).filter(Boolean);
 var val=v&&txt(v)&&/\d/.test(txt(v))?txt(v).split('\n')[0]:'';if(!val)val=lines.filter(function(s){return /\d/.test(s)&&s.length<=26;})[0]||lines[0]||'';
 var lab=l&&txt(l)&&txt(l)!==val?txt(l).split('\n')[0]:'';if(!lab)lab=lines.filter(function(s){return s!==val;})[0]||'';
 var z=function(x){return String(x).replace(/\s/g,'');},sub=lines.filter(function(s){return s!==val&&s!==lab&&z(s)!==z(lab+val)&&z(s)!==z(val+lab);}).join('\n');return {l:lab,v:val,s:sub};}

/* 表格 → 欄位資訊（同一張表算一次） */
function tmodel(tb){if(tb.__pknM&&tb.__pknM.n===tb.tBodies[0].rows.length)return tb.__pknM;var body=tb.tBodies[0];if(!body)return null;
 var rows=[].filter.call(body.rows,function(r){return r.cells.length>=2&&!/^(合計|總計|小計|total|sum|平均)/i.test(txt(r.cells[0]))&&r.offsetParent!==null;});
 var hs=rows.length?heads(rows[0]):[];var cols=hs.map(function(h,i){var vals=rows.map(function(r){return r.cells[i]?numOf(txt(r.cells[i])):null;}),nn=vals.filter(function(v){return v!=null;});
   var numeric=nn.length>=Math.max(1,rows.length*.6)&&!/日期|date|期間|月份|週|年|款|style|po|單號|no\.?$|編號|code/i.test(h);
   return {h:h,i:i,numeric:numeric,pct:numeric&&rows.some(function(r){return r.cells[i]&&/%/.test(txt(r.cells[i]));}),vals:vals,max:nn.length?Math.max.apply(null,nn.map(Math.abs)):0,sum:nn.reduce(function(a,b){return a+b;},0),n:nn.length};});
 return tb.__pknM={n:body.rows.length,rows:rows,hs:hs,cols:cols};}
var ENT=[[/客戶|customer|buyer/i,'客戶','👥'],[/款號|款式|style/i,'款式','👕'],[/^po\b|po\s*no|po#|訂單|order/i,'PO','📄'],[/線別|組別|^line/i,'線別','🧵'],[/料號|item|物料|品名/i,'料號','🧶']];
function entCols(M){var out=[];M.cols.forEach(function(c){if(c.numeric||/數|count|qty|件|%/i.test(c.h))return;for(var k=0;k<ENT.length;k++)if(ENT[k][0].test(c.h)){out.push({c:c,e:ENT[k]});break;}});return out;}
function pcsCol(M){return M.cols.filter(function(c){return c.numeric&&/pcs|件|數量|qty|quantity/i.test(c.h);})[0]||null;}
function usdCol(M){return M.cols.filter(function(c){return c.numeric&&/usd|金額|amount|價|\$/i.test(c.h);})[0]||null;}
function nameOf(M,r){for(var i=0;i<r.cells.length;i++){var v=txt(r.cells[i]).split('\n')[0];if(v&&!/^[\d\-\/\s.:—$,%+]+$/.test(v))return v;}return txt(r.cells[0]).split('\n')[0]||'—';}
function itemBtn(pk,nm,vl,sb,w){return '<button class="pkn-it" data-pk="'+pk+'"><span class="nm">'+esc(nm)+'</span>'+(w!=null?'<span class="bx"><i style="width:'+Math.max(2,w).toFixed(1)+'%"></i></span>':'')+'<span class="vl">'+esc(vl)+'</span>'+(sb?'<span class="sb">'+esc(sb)+'</span>':'')+' ›</button>';}
/* 依某欄分組（客戶／款式／PO…）→ 每組幾筆、合計件數／金額，點了看那一組的列 */
function groupHtml(M,c,e,title,max){var g={},ord=[],pc=pcsCol(M),us=usdCol(M);M.rows.forEach(function(r){var v=r.cells[c.i]?txt(r.cells[c.i]).split('\n')[0].trim():'';if(!v||v==='—')return;if(!g[v]){g[v]={rows:[],p:0,u:0};ord.push(v);}g[v].rows.push(r);if(pc)g[v].p+=pc.vals[M.rows.indexOf(r)]||0;if(us)g[v].u+=us.vals[M.rows.indexOf(r)]||0;});
 if(ord.length<1)return '';var key=pc?'p':us?'u':null;ord.sort(function(a,b){return key?g[b][key]-g[a][key]:g[b].rows.length-g[a].rows.length;});var top=key?g[ord[0]][key]:g[ord[0]].rows.length,tot=key?ord.reduce(function(s,k){return s+g[k][key];},0):M.rows.length;
 return '<div class="pkn-rel"><div class="pkn-rt">'+e[2]+' '+esc(title||('各'+e[1]))+' <small>'+ord.length+' 個'+(key?' · 依'+(key==='p'?'件數':'金額'):' · 依筆數')+'排序，點了看明細</small></div>'+ord.slice(0,max||8).map(function(k){var o=g[k],v=key?o[key]:o.rows.length;return itemBtn('r'+reg(o.rows)+':0',k,(key==='u'?'$':'')+F(v,0)+(key==='p'?' pcs':key?'':' 筆'),(key?o.rows.length+' 筆 · ':'')+(tot?F(v/tot*100,0)+'%':''),top?v/top*100:0);}).join('')+(ord.length>(max||8)?'<div class="pkn-ref">…還有 '+(ord.length-(max||8))+' 個</div>':'')+'</div>';}
function topHtml(M,c,title){var idx=M.rows.map(function(r,i){return i;}).filter(function(i){return c.vals[i]!=null;}).sort(function(a,b){return c.vals[b]-c.vals[a];}).slice(0,8);if(!idx.length)return '';var l=M.rows,id=reg(l);
 return '<div class="pkn-rel"><div class="pkn-rt">🏆 '+esc(title)+' <small>'+esc(c.h)+' 最大的 '+idx.length+' 筆（共 '+l.length+' 筆，合計 '+F(c.sum,0)+'），點了看那一筆</small></div>'+idx.map(function(i){return itemBtn('r'+id+':'+i,nameOf(M,l[i]),F(c.vals[i]),c.sum?F(c.vals[i]/c.sum*100,1)+'%':'',c.max?Math.abs(c.vals[i])/c.max*100:0);}).join('')+'</div>';}
/* KPI 屬於哪一區 → 那一區最大的明細表 */
function paneTable(el){var p=el,doc=el.ownerDocument;for(var k=0;k<7&&p&&p!==doc.body;k++){p=p.parentElement;if(!p)break;var ts=[].filter.call(p.querySelectorAll('table'),function(t){return t.tBodies[0]&&t.offsetParent!==null&&!t.closest('.pkn-box')&&t.tBodies[0].rows.length>=2;});if(ts.length){ts.sort(function(a,b){return b.tBodies[0].rows.length-a.tBodies[0].rows.length;});return ts[0];}}return null;}
function kpiRel(el,p){var tb=paneTable(el);if(!tb)return '';var M=tmodel(tb);if(!M||!M.rows.length)return '';var lab=(p.l||'')+' ',ec=entCols(M),pick=function(re){return ec.filter(function(x){return re.test(x.c.h);})[0];},x;
 if(/客戶|customer/i.test(lab)&&(x=pick(/客戶|customer|buyer/i)))return groupHtml(M,x.c,x.e);
 if(/款|style/i.test(lab)&&(x=pick(/款|style/i)))return groupHtml(M,x.c,x.e);
 if(/\bpo\b|訂單/i.test(lab)&&(x=pick(/po|訂單|order/i)))return groupHtml(M,x.c,x.e);
 if(/線|line/i.test(lab)&&(x=pick(/線|line/i)))return groupHtml(M,x.c,x.e);
 var c=/usd|金額|\$|amount/i.test(lab+p.v)?usdCol(M):/pcs|件|數量|qty/i.test(lab+p.v)?pcsCol(M):null;
 var g=pick(/客戶|customer|buyer/i)||ec[0];
 if(c)return topHtml(M,c,'最大的幾筆')+(g?groupHtml(M,g.c,g.e,'依'+g.e[1]+'分',6):'');
 return g?groupHtml(M,g.c,g.e,'依'+g.e[1]+'分'):topHtml(M,M.cols.filter(function(c){return c.numeric;})[0]||{vals:[]},'最大的幾筆');}
function kpiSec(it,k,first){var p=kpiParts(it);
 return '<section class="pkn-sec" data-i="'+k+'"><div class="pkn-sh"><b>📊 '+esc(p.l||p.v)+'</b><span>'+(k+1)+' / '+S.list.length+'</span></div><div class="pkn-big"><div class="pkn-bv">'+esc(p.v)+'</div>'+(p.s?'<div class="pkn-bs">'+esc(p.s)+'</div>':'')+'</div>'+
  (first&&S.list.length>1?'<div class="pkn-grid">'+S.list.map(function(o,i){var q=kpiParts(o);return '<button class="pkn-g'+(i===k?' on':'')+'" data-pk="'+i+'"><div class="pkn-gl">'+esc(q.l)+'</div><div class="pkn-gv">'+esc(q.v)+'</div></button>';}).join('')+'</div>':'')+kpiRel(it,p)+'</section>';}
function isERP(){return typeof G.openStyle==='function'||/\/PSJERP\//i.test(location.pathname);}
function openStyleCard(s){close();try{location.hash='style='+encodeURIComponent(s);}catch(e){}}
function rowSec(tr,k){var tb=tr.closest('table'),M=tb?tmodel(tb):null,hs=heads(tr),ri=M?M.rows.indexOf(tr):-1,nums=[],kv=[],lk=[],rel='',title='';
 [].forEach.call(tr.cells,function(td,j){var cl=td.cloneNode(true);[].forEach.call(cl.querySelectorAll('button,input,select'),function(x){x.remove();});var v=txt(cl),h=hs[j]||'';if(!h&&!v)return;if(/^(操作|動作|action)/i.test(h))return;
  if(!title&&v&&!/^[\d\-\/\s.:—$,%+]+$/.test(v))title=v.split('\n')[0];var c=M&&M.cols[j];
  if(c&&c.numeric&&ri>=0&&c.vals[ri]!=null){var x=c.vals[ri],rank=1+c.vals.filter(function(o){return o!=null&&o>x;}).length;
   nums.push('<div class="pkn-g" style="cursor:default"><div class="pkn-gl">'+esc(h)+'</div><div class="pkn-gv">'+esc(v)+'</div><div class="pkn-bar"><i style="width:'+(c.max?Math.abs(x)/c.max*100:0).toFixed(1)+'%"></i></div><div class="pkn-ref">'+(c.pct?'':'合計 '+F(c.sum,0)+' · ')+'第 '+rank+' / '+c.n+' 名</div></div>');}
  else kv.push([h||'—',v||'—']);});
 if(M&&ri>=0){entCols(M).forEach(function(x){var v=tr.cells[x.c.i]?txt(tr.cells[x.c.i]).split('\n')[0].trim():'';if(!v||v==='—')return;var same=M.rows.filter(function(r){return r.cells[x.c.i]&&txt(r.cells[x.c.i]).split('\n')[0].trim()===v;});
   if(same.length>1){var pc=pcsCol(M),us=usdCol(M),sp=pc?same.reduce(function(s,r){return s+(pc.vals[M.rows.indexOf(r)]||0);},0):null,su=us?same.reduce(function(s,r){return s+(us.vals[M.rows.indexOf(r)]||0);},0):null;
    lk.push('<button data-pk="r'+reg(same)+':'+same.indexOf(tr)+'">'+x.e[2]+' 同'+x.e[1]+'「'+esc(v)+'」'+same.length+' 筆'+(sp!=null?' · '+F(sp,0)+' pcs':'')+(su!=null?' · $'+F(su,0):'')+' ›</button>');}
   if(x.e[1]==='款式'&&isERP())lk.push('<button data-pk="s:'+encodeURIComponent(v)+'">👕 '+esc(v)+' 款式卡 ›</button>');});}
 return '<section class="pkn-sec" data-i="'+k+'"><div class="pkn-sh"><b>🔎 '+esc(title||(kv[0]&&kv[0][1])||'—')+'</b><span>'+(k+1)+' / '+S.list.length+'</span></div>'+(lk.length?'<div class="pkn-lk">'+lk.join('')+'</div>':'')+(nums.length?'<div class="pkn-grid">'+nums.join('')+'</div>':'')+'<div class="pkn-rows">'+kv.map(function(p){return '<div class="pkn-r"><div class="pkn-rl">'+esc(p[0])+'</div><div class="pkn-rv">'+esc(p[1])+'</div></div>';}).join('')+'</div></section>';}
function sec(k,first){var it=S.list[k];if(!it)return '';try{return S.kind==='kpi'?kpiSec(it,k,first):rowSec(it,k);}catch(e){return '<section class="pkn-sec" data-i="'+k+'"><div class="pkn-rows">'+esc(txt(it))+'</div></section>';}}
function titleOf(k){var it=S.list[k];if(!it)return '';if(S.kind==='kpi'){var p=kpiParts(it);return '📊 '+esc(p.l||p.v);}var tb=it.closest('table'),M=tb&&tmodel(tb);return '🔎 '+esc(M?nameOf(M,it):txt(it.cells[0]));}
function setHead(){var h=box.querySelector('.pkn-h');if(!h)return;h.querySelector('.pkn-t').innerHTML=titleOf(S.i);h.querySelector('.pkn-pos').textContent=(S.i+1)+' / '+S.list.length;var p=h.querySelector('[data-pk=p]'),n=h.querySelector('[data-pk=n]');if(p)p.disabled=S.i<=0;if(n)n.disabled=S.i>=S.list.length-1;
 if(S.kind==='row')try{S.list[S.i].scrollIntoView({block:'nearest'});}catch(e){}}
function label(){var m=box.querySelector('.pkn-more');if(!m)return;var nx=S.list[last+1];m.innerHTML=nx?'⬇ 繼續往下滑：下一個 <b>'+titleOf(last+1)+'</b>':'— 已經是最後一個 —';}
function add(){if(!S.list[last+1])return false;var m=box.querySelector('.pkn-more');m.insertAdjacentHTML('beforebegin',sec(last+1));last++;label();return true;}
function near(){var m=box.querySelector('.pkn-more');return m&&m.getBoundingClientRect().top<box.getBoundingClientRect().bottom+420;}
function fill(){var n=0;while(near()&&n++<3&&add());}
function draw(){if(!S.list[S.i])return;box.classList.toggle('dk',dark());base=last=S.i;
 box.innerHTML='<div class="pkn-h">'+(STK.length?'<button data-pk="b" aria-label="back" title="回上一層">↩</button>':'')+'<div class="pkn-t"></div><span class="pkn-pos"></span>'+(S.list.length>1?'<button data-pk="p" aria-label="prev">◀</button><button data-pk="n" aria-label="next">▶</button>':'')+'<button data-pk="x" aria-label="close">✕</button></div>'+sec(S.i,true)+'<div class="pkn-more" data-pk="more"></div>';
 label();setHead();box.scrollTop=0;mask.classList.add('on');
 if(IO)IO.disconnect();if(G.IntersectionObserver){IO=new IntersectionObserver(function(es){if(es.some(function(x){return x.isIntersecting;}))fill();},{root:box,rootMargin:'0px 0px 420px 0px'});IO.observe(box.querySelector('.pkn-more'));}
 setTimeout(fill,50);}
function openRows(tr){ui();STK=[];REG=[];var tb=tr.closest('tbody');S.kind='row';S.list=tb?[].filter.call(tb.rows,function(r){return r.classList.contains('pkn-row')&&r.offsetParent!==null;}):[tr];if(S.list.indexOf(tr)<0)S.list=[tr];S.i=Math.max(0,S.list.indexOf(tr));draw();}
function openKpis(el){ui();STK=[];REG=[];var par=el.parentElement;S.kind='kpi';S.list=par?[].filter.call(par.children,function(x){return x.classList.contains('pkn-kpi')&&x.offsetParent!==null;}):[el];if(!S.list.length)S.list=[el];S.i=Math.max(0,S.list.indexOf(el));draw();}
API.openRows=openRows;API.openKpis=openKpis;

function start(){hook(D);frames();setInterval(frames,2000);}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})(window);
