/* Admin OS 員工連結 emp-link.js v1（2026-11-22）
   Paul：在 Admin OS 裡開 PSJGA、PSJERP、Audit…，點到跟員工有關的列／卡，直接在 Admin OS 顯示這位員工的照片與分頁資料；
         其他平台有、這個平台沒有的資料，也一起連過來看。
   做法（只讀，不改任何平台資料）：
   1 PSJHR 會存一份小索引 vrt_emp_idx_v1（工號、姓名、部門、狀態；不含照片薪資）。
   2 Admin OS 監看嵌在裡面的各平台頁（含它們再嵌的分頁）：點了一列或一張卡，裡面若有某位員工的「工號」（欄名是工號／ID，或同一列也有他的名字）
      或「全名」→ 右側（手機是整頁）跳出「👤 員工卡」。
      · 「HR 資料」分頁：用 PSJHR 員工卡模式（?card=1）顯示——照片、基本資料、出勤、請假、年假…跟 PSJHR 員工頁一樣。
      · 「其他平台」分頁：在這台裝置上各平台存的資料裡找同一個工號（宿舍、資產、保全、伙食、稽核訓練…），列出來源與內容。
   3 PSJHR 本身不套（它點員工本來就會開員工抽屜）。原本點了會做的事照做，員工卡只是另外疊在上面，按 ✕ 或點外面關掉。 */
(function(G){
'use strict';
if(G.VRTEmpLink)return;
var D=document,IDX=null,BYNAME=null,IDXAT='';
var API=G.VRTEmpLink={open:openCard,find:findEmp};
function loadIdx(){try{var raw=localStorage.getItem('vrt_emp_idx_v1');if(!raw){IDX=null;return false;}var o=JSON.parse(raw);if(o.at===IDXAT&&IDX)return true;IDXAT=o.at;IDX=new Map();BYNAME=[];
 (o.n||[]).forEach(function(r){var no=String(r[0]);IDX.set(no,{no:no,name:r[1]||'',dept:r[2]||'',status:r[3]||'',sex:r[4]||''});var nm=norm(r[1]);if(nm.length>=5)BYNAME.push([nm,no]);});
 BYNAME.sort(function(a,b){return b[0].length-a[0].length;});return true;}catch(e){IDX=null;return false;}}
function norm(s){return String(s||'').toLowerCase().replace(/\s+/g,' ').trim();}
var IDH=/工號|員工編號|編號|emp|staff|worker|\bid\b|id no|no\.?$|code|លេខ|អត្តលេខ/i;
function headerOf(td){try{var tb=td.closest('table');if(!tb||!tb.tHead)return '';var row=tb.tHead.rows[tb.tHead.rows.length-1];var i=0,c=0;for(var k=0;k<td.parentElement.cells.length;k++){if(td.parentElement.cells[k]===td)break;c+=td.parentElement.cells[k].colSpan||1;}
 for(var j=0;j<row.cells.length;j++){var sp=row.cells[j].colSpan||1;if(c>=i&&c<i+sp)return row.cells[j].textContent;i+=sp;}}catch(e){}return '';}
/* 從點到的東西找員工：先看那一格本身，再看整列／整張卡 */
function findEmp(target){
 if(!loadIdx()||!IDX.size)return null;
 var box=target.closest('tr,li,[class*="card"],[class*="row"],[class*="item"],.kpi,.stat,article,section')||target;
 var text=String(box.innerText||box.textContent||'').slice(0,600),low=norm(text);
 var cell=target.closest('td,th');var ids=(text.match(/\b[A-Z]{0,2}\d{3,6}\b/g)||[]).filter(function(t){return IDX.has(t);});
 var named=null;for(var i=0;i<BYNAME.length;i++){if(low.indexOf(BYNAME[i][0])>=0){named=BYNAME[i][1];break;}}
 if(named&&(ids.length===0||ids.indexOf(named)>=0))return IDX.get(named);       /* 有全名（工號對得上或沒工號） */
 if(ids.length){
  if(cell){var own=(cell.textContent||'').trim();if(IDX.has(own)&&(own===ids[0]||ids.indexOf(own)>=0)&&(IDH.test(headerOf(cell))||named===own))return IDX.get(own);}
  for(var k=0;k<ids.length;k++){var e=IDX.get(ids[k]),first=norm(e.name).split(' ').filter(function(w){return w.length>=3;});if(first.some(function(w){return low.indexOf(w)>=0;}))return e;}  /* 工號＋名字的一部分 */
  if(box.tagName==='TR'){var tds=box.cells;for(var j=0;j<tds.length;j++){var v=(tds[j].textContent||'').trim();if(IDX.has(v)&&IDH.test(headerOf(tds[j])))return IDX.get(v);}}
 }
 return null;}
/* ── 監看各平台頁（同網域 iframe，含巢狀）── */
function skipDoc(w){try{return /^\/psjhr\//i.test(w.location.pathname)||/[?&]card=1\b/.test(w.location.search);}catch(e){return true;}}
function hook(w){try{var d=w.document;if(!d||d.__empLink||skipDoc(w))return;d.__empLink=1;
 d.addEventListener('click',function(e){if(e.button!==0)return;var t=e.target;if(!t||!t.closest)return;if(t.closest('input,select,textarea,label,[contenteditable],.pkn-h,[data-noemp]'))return;
  try{var sel=w.getSelection&&String(w.getSelection());if(sel&&sel.length>1)return;}catch(x){}
  var emp=findEmp(t);if(emp)setTimeout(function(){openCard(emp.no,w);},120);},true);}catch(e){}}
function scan(w,depth){if(depth>3)return;try{[].forEach.call(w.document.querySelectorAll('iframe'),function(f){try{var cw=f.contentWindow;if(!cw||!cw.document||cw.location.href==='about:blank')return;if(skipDoc(cw))return;hook(cw);scan(cw,depth+1);if(!f.__empL){f.__empL=1;f.addEventListener('load',function(){setTimeout(function(){scan(w,depth);},500);});}}catch(e){}});}catch(e){}}
/* ── 員工卡 ── */
var ov=null,fr=null,frReady=false,cur=null;
function L(){var l='zh';try{var v=JSON.parse(localStorage.getItem('ac_admin_lang')||'"zh"');l=v==='zh'?'zh':v==='km'?'km':'en';}catch(e){}return l;}
function T(zh,en){return L()==='zh'?zh:en;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ui(){if(ov)return;
 var st=D.createElement('style');st.textContent=
 '#empOv{position:fixed;inset:0;z-index:99995;display:none;background:rgba(15,23,42,.42)}#empOv.on{display:block}'+
 '#empOv .ep{position:absolute;top:0;right:0;bottom:0;width:min(600px,100%);background:#fff;display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(0,0,0,.25);animation:epIn .2s ease-out}'+
 '@keyframes epIn{from{transform:translateX(30px);opacity:.4}to{transform:none;opacity:1}}'+
 '#empOv .eh{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#0f172a;color:#fff}#empOv .eh b{font-size:16px}#empOv .eh .s{font-size:12px;opacity:.8}'+
 '#empOv .eh button{border:0;background:rgba(255,255,255,.16);color:#fff;border-radius:9px;padding:7px 10px;font:600 13px system-ui;cursor:pointer}#empOv .eh .x{margin-left:auto;width:36px;height:36px;border-radius:50%;padding:0;font-size:16px}'+
 '#empOv .et{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid #e2e8f0;background:#f8fafc}#empOv .et button{border:1px solid #cbd5e1;background:#fff;border-radius:999px;padding:6px 12px;font:650 13px system-ui;cursor:pointer}#empOv .et button.on{background:#0f172a;color:#fff;border-color:#0f172a}'+
 '#empOv .eb{flex:1;position:relative;min-height:0}#empOv iframe{position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff}#empOv .eo{position:absolute;inset:0;overflow:auto;padding:12px;display:none;font:14px/1.5 system-ui,"Noto Sans TC",sans-serif;color:#1b2738}'+
 '#empOv .eo .src{border:1px solid #e2e8f0;border-radius:12px;margin-bottom:10px;overflow:hidden}#empOv .eo .src h4{margin:0;padding:8px 10px;background:#f1f5f9;font-size:13.5px}#empOv .eo .rec{padding:8px 10px;border-top:1px solid #eef2f7;font-size:13px}#empOv .eo .rec span{display:inline-block;margin:0 10px 2px 0}#empOv .eo .rec i{font-style:normal;color:#64748b}'+
 '#empOv .ld{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#64748b;font:14px system-ui;background:#fff}'+
 '@media (prefers-color-scheme:dark){#empOv .ep,#empOv iframe,#empOv .ld{background:#1a1c20}#empOv .et{background:#202329;border-color:#2d3138}#empOv .et button{background:#26292f;color:#eee;border-color:#3a3f47}#empOv .eo{color:#eef0f3}#empOv .eo .src{border-color:#2d3138}#empOv .eo .src h4{background:#24272d}}';
 D.head.appendChild(st);
 ov=D.createElement('div');ov.id='empOv';ov.innerHTML='<div class="ep" role="dialog" aria-modal="true"><div class="eh"><span style="font-size:22px">👤</span><div><b id="epN"></b><div class="s" id="epS"></div></div><button id="epHR">↗ PSJHR</button><button class="x" id="epX" aria-label="close">✕</button></div>'+
  '<div class="et"><button data-et="hr" class="on" id="epT1"></button><button data-et="oth" id="epT2"></button></div><div class="eb"><div class="ld" id="epLd"></div><div class="eo" id="epO"></div></div></div>';
 D.body.appendChild(ov);
 ov.addEventListener('click',function(e){if(e.target===ov)close();var b=e.target.closest('[data-et]');if(b)tab(b.dataset.et);});
 D.getElementById('epX').onclick=close;
 D.getElementById('epHR').onclick=function(){var no=cur;close();try{G.location.hash='#hr';}catch(e){}setTimeout(function(){try{var f=[].filter.call(D.querySelectorAll('iframe'),function(x){return /\/psjhr\//.test(x.src)&&!/card=1/.test(x.src);})[0];if(f&&f.contentWindow.openEmp)f.contentWindow.openEmp(String(no));}catch(e){}},1800);};
 D.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov.classList.contains('on'))close();});
 G.addEventListener('message',function(e){if(e.origin===location.origin&&e.data&&e.data.vrt==='emp-close')close();});}
function close(){if(ov)ov.classList.remove('on');}
function tab(k){D.querySelectorAll('#empOv .et button').forEach(function(b){b.classList.toggle('on',b.dataset.et===k);});if(fr)fr.style.visibility=k==='hr'?'visible':'hidden';D.getElementById('epO').style.display=k==='oth'?'block':'none';if(k==='hr'&&!frReady)D.getElementById('epLd').style.display='flex';else D.getElementById('epLd').style.display='none';}
function openCard(no,srcWin){
 loadIdx();ui();no=String(no);cur=no;var e=(IDX&&IDX.get(no))||{no:no,name:'',dept:'',status:''};
 D.getElementById('epN').textContent=no+'　'+e.name;D.getElementById('epS').textContent=[e.dept,e.status].filter(Boolean).join(' · ');
 D.getElementById('epT1').textContent=T('👤 HR 資料（照片・分頁）','👤 HR profile');
 var oth=others(no,e);D.getElementById('epT2').textContent=T('🔗 其他平台 ','🔗 Other platforms ')+'('+oth.n+')';D.getElementById('epO').innerHTML=oth.html;
 D.getElementById('epLd').textContent=T('載入 PSJHR 員工資料…','Loading PSJHR profile…');
 ov.classList.add('on');tab('hr');
 if(!fr){fr=D.createElement('iframe');fr.title='employee';fr.src='/psjhr/?card=1#card';D.querySelector('#empOv .eb').appendChild(fr);fr.addEventListener('load',function(){waitCard();});}
 else if(frReady)show(no);
}
function waitCard(){var t0=Date.now();(function go(){try{if(fr.contentWindow.psjhrCard){frReady=true;show(cur);return;}}catch(e){}if(Date.now()-t0<20000)setTimeout(go,300);})();}
function show(no){if(!no)return;try{fr.contentWindow.psjhrCard(no).then(function(ok){D.getElementById('epLd').style.display='none';if(!ok)D.getElementById('epLd').style.display='flex',D.getElementById('epLd').textContent=T('PSJHR 裡找不到這位員工的資料','No PSJHR profile for this employee');});}catch(e){}}
/* 其他平台：在這台裝置上各平台存的資料裡找同一個工號 */
var SRC=[[/gascheck|gc_|ac_gc/i,'🧹 GASCheck'],[/sec|patrol|guard|保全/i,'🛡️ SEC 保全'],[/ga_exp|gaexp|expense|procure/i,'💳 GA-EXP'],[/audit|wrap|wse|train/i,'📋 Audit'],[/prod|sewing|qc|spare|vrt_prod/i,'🏭 生產'],[/erp/i,'🏭 ERP'],[/canteen|meal/i,'🍱 伙食'],[/hra|pay/i,'🧑‍💼 HRA'],[/acc|contract|leave-manager|salary/i,'🌏 ACC'],[/dorm|宿舍/i,'🏠 宿舍']];
var SKIP=/^(vrt_emp_idx_v1|ac_admin_lang|vrt_sync_ledger_v1|vrt_bus_v1|vrt_admin_os_open|vrt_canteen_v10)$|theme|lang$|tint|prefs?$|ui_|_ui|cache_meta/i;
function srcName(k){for(var i=0;i<SRC.length;i++)if(SRC[i][0].test(k))return SRC[i][1];return '📦 '+k.slice(0,32);}
function others(no,e){
 var out={},n=0,name=norm(e.name),nameW=name.split(' ').filter(function(w){return w.length>=3;});
 var keys=[];try{for(var i=0;i<localStorage.length;i++)keys.push(localStorage.key(i));}catch(x){}
 keys.forEach(function(k){if(!k||SKIP.test(k))return;var raw;try{raw=localStorage.getItem(k);}catch(x){return;}if(!raw||raw.length>6e6||raw.indexOf(no)<0)return;var o;try{o=JSON.parse(raw);}catch(x){return;}
  var found=[],seen=0;
  (function walk(v,depth){if(found.length>=12||seen>60000||depth>7||v==null)return;seen++;
   if(Array.isArray(v)){for(var i=0;i<v.length&&found.length<12;i++)walk(v[i],depth+1);return;}
   if(typeof v!=='object')return;
   var hit=false,ks=Object.keys(v);
   for(var j=0;j<ks.length;j++){var x=v[ks[j]];if((typeof x==='string'||typeof x==='number')&&String(x).trim()===no){if(IDH.test(ks[j])||ks.some(function(kk){var y=v[kk];return typeof y==='string'&&nameW.some(function(w){return norm(y).indexOf(w)>=0;});})){hit=true;break;}}}
   if(hit){found.push(v);return;}
   for(var m=0;m<ks.length&&found.length<12;m++){var y=v[ks[m]];if(y&&typeof y==='object')walk(y,depth+1);}
  })(o,0);
  if(found.length){var s=srcName(k);(out[s]=out[s]||[]).push.apply(out[s],found);n+=found.length;}});
 var html=Object.keys(out).map(function(s){return '<div class="src"><h4>'+esc(s)+' · '+out[s].length+'</h4>'+out[s].slice(0,12).map(function(r){return '<div class="rec">'+Object.keys(r).filter(function(k){var v=r[k];return v!==''&&v!=null&&typeof v!=='object'&&String(v).length<120&&!/^(_|id$|uuid|hash|token|sig)/i.test(k);}).slice(0,12).map(function(k){return '<span><i>'+esc(k)+'</i> '+esc(r[k])+'</span>';}).join('')+'</div>';}).join('')+'</div>';}).join('');
 if(!html)html='<div style="color:#64748b;padding:20px 4px">'+T('這台裝置上其他平台的資料裡，沒有找到這位員工（工號 '+esc(no)+'）。平台資料只存在雲端、還沒在這台裝置打開過的，這裡看不到——先在 Admin OS 打開那個平台一次就會有。','No records for this employee in other platforms on this device yet.')+'</div>';
 return {n:n,html:html};}
function start(){loadIdx();scan(G,0);setInterval(function(){scan(G,0);},2000);
 /* 還沒有索引（PSJHR 沒在這台開過）→ 背景開一次員工卡模式，順便建立索引 */
 if(!IDX)setTimeout(function(){if(!IDX&&!fr){ui();fr=D.createElement('iframe');fr.title='employee';fr.src='/psjhr/?card=1#card';D.querySelector('#empOv .eb').appendChild(fr);fr.addEventListener('load',waitCard);}},8000);}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',start);else start();
})(window);
