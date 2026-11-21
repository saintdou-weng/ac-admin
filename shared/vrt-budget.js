/* VRT 預算計算核心 vrt-budget.js（2026-11-22）
   同一份程式給三個地方用：Admin OS「管理部預算 vs 實際」、PSJHR「直接／間接人工預算 vs 實際」、AC_ADMIN_CENTER GAS 每月結算月報。
   寫法維持 ES5／ES2015（GAS 也能 eval），不碰 DOM。

   方法（標準「靜態預算＋彈性預算」差異分析，依 Paul 2021 試作表調整成 VRT 現況）：
   · 組數＝DL 人數 ÷ 每組人數（預設 30；Paul 2021 用 32）。
   · 情境：2025–2027 固定 10／12／15 組；2021–2024 用該年平均組數 −2／平均／+2。
   · 人工預算＝組數 × 每組人數 × 最低工資 ×「去年平均工資倍數」；IDL＝DL × 去年 IDL/DL 比；OFF＝去年平均人數；12 月 × 年終係數。
   · 費用預算＝去年每月平均 ×（變動費用：情境組數 ÷ 去年平均組數）×（1＋加成%）；固定費用＝去年每月平均；社保＝人工預算 × 去年社保率 × 費率調整。
   · 彈性預算＝把「實際組數」代進同一公式 → 差異拆成「組數差異（量）」＋「單價／用量差異（價）」。
   · 最接近＝有實際資料的月份，預算合計跟實際合計差最少的情境。 */
(function(G){
'use strict';
var CAT_INFO={
 indirect_labor:['ERP 間接人工（帳列）','ERP indirect labour (booked)','line',0,'B'],
 rent:['租金（工廠・宿舍・車）','Rent (factory, staff house, car)','fixed',0,'A'],
 mfg_overhead:['其他製造費用','Other manufacturing overhead','line',0,'B'],
 freight:['運費','Freight','line',0,'B'],
 postage:['郵電快遞','Postage & courier','line',0,'A'],
 repairs:['修繕維護','Repairs & maintenance','line',10,'A'],
 security:['保全','Security service','fixed',0,'A'],
 utilities:['水電','Water & electricity','line',10,'A'],
 insurance:['保險','Insurance','fixed',0,'B'],
 taxi:['交通計程車','Taxi & transport','line',0,'A'],
 taxes_licences:['稅捐規費・驗廠','Taxes, licences & audit fees','fixed',0,'A'],
 depreciation:['折舊','Depreciation','fixed',0,'B'],
 meal:['伙食','Meals','line',0,'A'],
 employee_benefit:['員工福利・獎金','Employee benefit / bonus','line',0,'A'],
 gasoline:['柴油油料','Diesel & fuel','line',10,'A'],
 printing_markers:['印刷・馬克','Printing & markers','line',0,'B'],
 misc_purchase:['雜項採購','Miscellaneous purchases','line',0,'A'],
 supplies:['文具・用品','Office & factory supplies','line',0,'A'],
 medical:['醫療','Medical','line',0,'A'],
 nssf:['社保 NSSF（公司負擔）','NSSF (company share)','nssf',0,'A']
};
var LAB_INFO={dl:['直接人工 DL','Direct labour (DL)'],idl:['間接人工 IDL','Indirect labour (IDL)'],off:['行政後勤 OFF','Office & support (OFF)']};
/* 公司負擔社保費率（年平均 %）：職業風險 0.8＋健康 2.6；2022-10 起退休金 2%；2027-10 起公司退休金 4%（10–12 月） */
var NSSF_RATE={2019:3.4,2020:3.4,2021:3.4,2022:3.9,2023:5.4,2024:5.4,2025:5.4,2026:5.4,2027:5.9,2028:7.4};
var MW_DEFAULT={2018:170,2019:182,2020:190,2021:192,2022:194,2023:200,2024:204,2025:208,2026:210,2027:212};
var PLAN_YEARS=[2025,2026,2027];

function r0(v){return Math.round(v||0);}
function pad(n){return (n<10?'0':'')+n;}
function ymOf(y,m){return y+'-'+pad(m);}
function keys(o){return Object.keys(o||{});}
function sum(a){var s=0;for(var i=0;i<a.length;i++)s+=a[i]||0;return s;}
function avg(a){return a.length?sum(a)/a.length:0;}
function clone(o){return JSON.parse(JSON.stringify(o||{}));}

/* data＝VRTB_DATA；doc＝使用者文件（雲端／本機，可編輯）；live＝GAS 抓到的最新月份 {fc:{ym:{cat:v}}, lab:{ym:[...]}} */
function Model(data,doc,live){
 var M=this; M.data=data; M.doc=doc||{}; M.live=live||{};
 M.cats=data.cats.slice(); M.CAT_INFO=CAT_INFO; M.LAB_INFO=LAB_INFO;
 M.doc.years=M.doc.years||{}; M.doc.cats=M.doc.cats||{}; M.doc.notes=M.doc.notes||{}; M.doc.actual=M.doc.actual||{}; M.doc.custom=M.doc.custom||[];
 M._fc={}; M._lab={}; M._src={};
 keys(data.fc).forEach(function(ym){var o={};data.fc[ym].forEach(function(v,i){o[M.cats[i]]=v;});M._fc[ym]=o;M._src['fc|'+ym]='seed';});
 keys(M.live.fc).forEach(function(ym){var o={},s=M.live.fc[ym];M.cats.forEach(function(c){o[c]=Number(s[c])||0;});M._fc[ym]=o;M._src['fc|'+ym]='erp';});
 keys(data.lab).forEach(function(ym){M._lab[ym]=data.lab[ym].slice();M._src['lab|'+ym]=data.lab[ym][6]?'pay':'est';});
 keys(M.live.lab).forEach(function(ym){var a=M.live.lab[ym];if(a&&a[0]>0){M._lab[ym]=a.slice(0,6).concat([1]);M._src['lab|'+ym]='pay';}});
 /* 手動輸入的實際數（覆蓋）：doc.actual[ym]={cat:v, dlN, dlG, …} */
 keys(M.doc.actual).forEach(function(ym){var a=M.doc.actual[ym]||{};var f=M._fc[ym]?clone(M._fc[ym]):null,hit=false;
  M.cats.forEach(function(c){if(a[c]!=null&&a[c]!==''){if(!f){f={};M.cats.forEach(function(k){f[k]=0;});}f[c]=Number(a[c])||0;hit=true;}});
  if(hit){M._fc[ym]=f;M._src['fc|'+ym]='manual';}
  var L=M._lab[ym]?M._lab[ym].slice():[0,0,0,0,0,0,1],lh=false;['dlN','dlG','idlN','idlG','offN','offG'].forEach(function(k,i){if(a[k]!=null&&a[k]!==''){L[i]=Number(a[k])||0;lh=true;}});
  if(lh){L[6]=1;M._lab[ym]=L;M._src['lab|'+ym]='manual';}
 });
 /* 暫估月份：總額 < 前 3 個月平均的 80% → 視為 ERP 還沒結完（實際照列、標 ⏳，但不拿來當明年基準） */
 M._prov={}; var fms=keys(M._fc).sort();
 fms.forEach(function(ym,i){if(i<3)return;var t=M.fcTotal(ym),p=avg([fms[i-1],fms[i-2],fms[i-3]].map(function(k){return M.fcTotal(k);}));if(p&&t<0.8*p&&M._src['fc|'+ym]!=='manual')M._prov[ym]=1;});
}
var P=Model.prototype;
P.t=function(zh,en,lang){return lang==='en'?en:zh;};
P.catName=function(c,lang){var x=CAT_INFO[c]||[c,c];var o=this.doc.cats[c]||{};return lang==='en'?(o.en||x[1]):(o.zh||x[0]);};
P.catCfg=function(c){var x=CAT_INFO[c]||['','','line',0,'A'];var o=this.doc.cats[c]||{};return {driver:o.driver||x[2],up:o.up!=null&&o.up!==''?Number(o.up):x[3],group:o.group||x[4],off:!!o.off};};
P.fc=function(ym){return this._fc[ym]||null;};
P.fcTotal=function(ym){var f=this._fc[ym];if(!f)return 0;var s=0;for(var c in f)s+=f[c]||0;return s;};
P.lab=function(ym){return this._lab[ym]||null;};
P.src=function(kind,ym){return this._src[kind+'|'+ym]||'';};
P.isProv=function(ym){return !!this._prov[ym];};
P.mw=function(y){var o=this.doc.years[y]||{};return Number(o.mw)||Number((this.data.mw||{})[y])||MW_DEFAULT[y]||MW_DEFAULT[2027];};
P.ppl=function(y){var o=this.doc.years[y]||{};return Number(o.ppl)||30;};
P.decF=function(y){var o=this.doc.years[y]||{};return o.decF!=null&&o.decF!==''?Number(o.decF):1.2;};
P.nssfRate=function(y){var o=this.doc.years[y]||{};return Number(o.nssf)||NSSF_RATE[y]||NSSF_RATE[2027];};
P.lines=function(ym){var l=this._lab[ym];return l&&l[0]?l[0]/this.ppl(+ym.slice(0,4)):null;};
P.labGross=function(ym){var l=this._lab[ym];return l?l[1]+l[3]+l[5]:0;};
P.monthsOf=function(y,kind){var out=[];for(var m=1;m<=12;m++){var ym=ymOf(y,m);if(kind==='fc'?this._fc[ym]:kind==='lab'?this._lab[ym]:(this._fc[ym]&&this._lab[ym]))out.push(ym);}return out;};
P.years=function(){var ys={};keys(this._fc).concat(keys(this._lab)).forEach(function(k){ys[+k.slice(0,4)]=1;});var a=keys(ys).map(Number).filter(function(y){return y>=2021;});a.push(2027);keys(this.doc.years).forEach(function(y){if(+y>=2021)a.push(+y);});return a.filter(function(v,i,s){return s.indexOf(v)===i;}).sort();};
P.avgLines=function(y){var self=this;var a=this.monthsOf(y,'lab').map(function(ym){return self.lines(ym);});return a.length?avg(a):null;};
P.scen=function(y){var o=this.doc.years[y]||{};if(o.scen&&o.scen.length)return o.scen.map(Number).filter(function(v){return v>0;}).sort(function(a,b){return a-b;});
 if(PLAN_YEARS.indexOf(+y)>=0||y>2027)return [10,12,15];var a=this.avgLines(y);if(!a)return [10,12,15];var m=Math.round(a);return [Math.max(1,m-2),m,m+2];};
P.scenKind=function(y){var o=this.doc.years[y]||{};if(o.scen&&o.scen.length)return 'custom';return (PLAN_YEARS.indexOf(+y)>=0||y>2027)?'plan':'avg';};

/* 基準＝前一年（沒有前一年資料就往前找） */
P.base=function(y){
 var self=this,key='_b'+y;if(this[key])return this[key];
 var py=y-1,fm=[],lm=[];for(var k=0;k<4&&!(fm.length&&lm.length);k++){fm=this.monthsOf(py,'fc').filter(function(ym){return !self._prov[ym];});lm=this.monthsOf(py,'lab');if(!(fm.length&&lm.length))py--;}
 var b={year:py,fcMonths:fm.length,labMonths:lm.length,cat:{},lines:0,k:{},rIDL:0,offN:0,nssfPct:0};
 this.cats.forEach(function(c){b.cat[c]=fm.length?avg(fm.map(function(ym){return self._fc[ym][c]||0;})):0;});
 b.lines=lm.length?avg(lm.map(function(ym){return self.lines(ym);})):12;
 var mwp=this.mw(py),nd=lm.filter(function(ym){return ym.slice(5)!=='12';});if(!nd.length)nd=lm;
 [['dl',0],['idl',2],['off',4]].forEach(function(p){var i=p[1];var tN=sum(nd.map(function(ym){return self._lab[ym][i];})),tG=sum(nd.map(function(ym){return self._lab[ym][i+1];}));b.k[p[0]]=tN?tG/tN/mwp:1.15;});
 b.rIDL=lm.length?sum(lm.map(function(ym){return self._lab[ym][2];}))/Math.max(1,sum(lm.map(function(ym){return self._lab[ym][0];}))):0.22;
 b.offN=lm.length?avg(lm.map(function(ym){return self._lab[ym][4];})):40;
 var both=fm.filter(function(ym){return self._lab[ym];});
 b.nssfPct=both.length?sum(both.map(function(ym){return self._fc[ym].nssf||0;}))/Math.max(1,sum(both.map(function(ym){return self.labGross(ym);}))):0.05;
 this[key]=b;return b;
};
/* 人工預算（一個月）：L＝組數；heads 給定時（彈性預算）用實際人數 */
P.labBudget=function(y,m,L,act){
 var b=this.base(y),mw=this.mw(y),ppl=this.ppl(y),f=m===12?this.decF(y):1;
 var dlN=act?act[0]:L*ppl, idlN=act?act[0]*b.rIDL:dlN*b.rIDL, offN=b.offN;
 var o={dlN:dlN,idlN:idlN,offN:offN,dlR:mw*b.k.dl*f,idlR:mw*b.k.idl*f,offR:mw*b.k.off*f};
 o.dlG=o.dlN*o.dlR;o.idlG=o.idlN*o.idlR;o.offG=o.offN*o.offR;o.total=o.dlG+o.idlG+o.offG;return o;
};
/* 費用預算（一個月、一項） */
P.catBudget=function(y,m,L,c,labTotal){
 var b=this.base(y),cfg=this.catCfg(c),v=b.cat[c]||0;
 if(cfg.driver==='nssf'){var py=b.year;return labTotal*b.nssfPct*(this.nssfRate(y)/this.nssfRate(py))*(1+cfg.up/100);}
 if(cfg.driver==='line')v=v*(b.lines?L/b.lines:1);
 return v*(1+cfg.up/100);
};
P.customFor=function(y,m){var out=[];this.doc.custom.forEach(function(x){if(+x.y!==+y)return;var ms=x.months&&x.months.length?x.months.map(Number):[1,2,3,4,5,6,7,8,9,10,11,12];if(ms.indexOf(m)<0)return;out.push(x);});return out;};

/* 一年的整張表：kind＝'admin' | 'labor' */
P.year=function(y,kind){
 var self=this,sc=this.scen(y),rows=[],lab=kind==='labor';
 var actM=lab?this.monthsOf(y,'lab'):this.monthsOf(y,'both');
 var acts={};actM.forEach(function(ym){acts[+ym.slice(5)]=ym;});
 function mk(key,zh,en,group){return {key:key,zh:zh,en:en,group:group,bud:sc.map(function(){return {full:0,ytd:0};}),flex:0,act:0,heads:null};}
 var R={};
 if(lab){['dl','idl','off'].forEach(function(k){R[k]=mk(k,LAB_INFO[k][0],LAB_INFO[k][1],'L');R[k].hd={bud:sc.map(function(){return 0;}),act:0,flex:0,n:0};});}
 else{R.labor=mk('labor','人工（DL＋IDL＋OFF 工資）','Labour (DL + IDL + OFF wages)','L');this.cats.forEach(function(c){var cfg=self.catCfg(c);if(cfg.off)return;R[c]=mk(c,self.catName(c,'zh'),self.catName(c,'en'),cfg.group);});}
 var cust={};
 var mon=[];
 for(var m=1;m<=12;m++){
  var ym=ymOf(y,m),has=!!acts[m],la=has?this._lab[ym]:null,mo={ym:ym,has:has,bud:sc.map(function(){return 0;}),flex:0,act:0,lines:has?this.lines(ym):null,prov:!lab&&has&&this._prov[ym],est:has&&this._src['lab|'+ym]==='est'};
  sc.forEach(function(L,si){
   var lb=self.labBudget(y,m,L);
   if(lab){['dl','idl','off'].forEach(function(k){var v=lb[k+'G'];R[k].bud[si].full+=v;if(has)R[k].bud[si].ytd+=v;R[k].hd.bud[si]+=lb[k+'N']/12;mo.bud[si]+=v;});}
   else{R.labor.bud[si].full+=lb.total;if(has)R.labor.bud[si].ytd+=lb.total;mo.bud[si]+=lb.total;
    self.cats.forEach(function(c){if(!R[c])return;var v=self.catBudget(y,m,L,c,lb.total);R[c].bud[si].full+=v;if(has)R[c].bud[si].ytd+=v;mo.bud[si]+=v;});
    self.customFor(y,m).forEach(function(x){var id='cx_'+x.id;if(!cust[id]){cust[id]=mk(id,x.zh||x.en||'—',x.en||x.zh||'—','C');cust[id].custom=x;}cust[id].bud[si].full+=Number(x.amt)||0;if(has)cust[id].bud[si].ytd+=Number(x.amt)||0;mo.bud[si]+=Number(x.amt)||0;});}
  });
  if(has){
   var fl=self.labBudget(y,m,mo.lines,la);
   if(lab){[['dl',0],['idl',2],['off',4]].forEach(function(p){var k=p[0],i=p[1];R[k].act+=la[i+1];R[k].flex+=fl[k+'G'];R[k].hd.act+=la[i];R[k].hd.flex+=fl[k+'N'];R[k].hd.n++;mo.act+=la[i+1];mo.flex+=fl[k+'G'];});}
   else{var lt=la[1]+la[3]+la[5];R.labor.act+=lt;R.labor.flex+=fl.total;mo.act+=lt;mo.flex+=fl.total;
    var f=self._fc[ym];self.cats.forEach(function(c){if(!R[c])return;R[c].act+=f[c]||0;var v=self.catBudget(y,m,mo.lines,c,lt);R[c].flex+=v;mo.act+=f[c]||0;mo.flex+=v;});
    self.customFor(y,m).forEach(function(x){var id='cx_'+x.id,a=x.act&&x.act[ym]!=null?Number(x.act[ym]):null;if(cust[id]&&a!=null){cust[id].act+=a;mo.act+=a;cust[id].flex+=Number(x.amt)||0;mo.flex+=Number(x.amt)||0;}});}
  }
  mon.push(mo);
 }
 keys(R).forEach(function(k){rows.push(R[k]);});keys(cust).forEach(function(k){rows.push(cust[k]);});
 rows.forEach(function(r){if(r.hd&&r.hd.n){r.hd.act/=r.hd.n;r.hd.flex/=r.hd.n;}});
 var T={bud:sc.map(function(_,si){return {full:sum(rows.map(function(r){return r.bud[si].full;})),ytd:sum(rows.map(function(r){return r.bud[si].ytd;}))};}),flex:sum(rows.map(function(r){return r.flex;})),act:sum(rows.map(function(r){return r.act;}))};
 var closest=-1,best=Infinity;if(actM.length)T.bud.forEach(function(b,si){var d=Math.abs(b.ytd-T.act);if(d<best){best=d;closest=si;}});
 var lines=actM.length?avg(actM.map(function(ym){return self.lines(ym);})):null;
 return {y:y,kind:kind,scen:sc,scenKind:this.scenKind(y),rows:rows,total:T,months:mon,actMonths:actM,closest:closest,lines:lines,base:this.base(y),
  estMonths:actM.filter(function(ym){return self._src['lab|'+ym]==='est';}),provMonths:lab?[]:actM.filter(function(ym){return self._prov[ym];})};
};
/* 差異說明（自動）：組數差異＝彈性預算 − 情境預算；單價／用量差異＝實際 − 彈性預算 */
P.explain=function(Y,row,si,lang){
 var en=lang==='en',b=row.bud[si].ytd,vol=row.flex-b,spd=row.act-row.flex,L=Y.scen[si],out=[];
 if(!Y.actMonths.length)return '';
 function $(v){return (v>=0?'+':'−')+'$'+Math.abs(r0(v)).toLocaleString('en-US');}
 var lt=Y.lines!=null?(Math.round(Y.lines*10)/10):'—';
 if(Math.abs(vol)>=1)out.push(en?'Lines '+lt+' vs '+L+' → '+$(vol):'組數 '+lt+' vs '+L+' 組 → '+$(vol));
 if(row.hd&&row.hd.n){var hb=row.hd.bud[si],ha=row.hd.act;var rb=row.flex/Math.max(1,row.hd.flex)/Y.actMonths.length,ra=row.act/Math.max(1,ha)/Y.actMonths.length;
  out.push(en?'Heads '+r0(ha)+' vs '+r0(hb)+' budget; avg wage $'+r0(ra)+' vs $'+r0(rb)+' → '+$(spd):'人數 '+r0(ha)+'（預算 '+r0(hb)+'）；平均工資 $'+r0(ra)+'（預算 $'+r0(rb)+'）→ '+$(spd));}
 else if(Math.abs(spd)>=1)out.push(en?'Price / usage '+$(spd):'單價／用量 '+$(spd));
 return out.join(en?'; ':'；');
};
P.note=function(y,key){var n=this.doc.notes[y+'|'+key];return n?(n.v||n):'';};
P.light=function(act,bud){if(!bud)return '⚪';var p=(act-bud)/bud*100;return Math.abs(p)<=5?'🟢':p>10?'🔴':p>5?'🟡':'🔵';};

/* ── Telegram 月報（中＋英） ── */
function N(v){return r0(v).toLocaleString('en-US');}
function K(v){var a=Math.abs(v);return (v<0?'-':'')+(a>=1e6?(a/1e6).toFixed(2)+'M':a>=1e4?(a/1e3).toFixed(1)+'k':N(a));}
function pct(a,b){return b?((a-b)/b*100):0;}
function sgn(p){return (p>=0?'+':'')+p.toFixed(1)+'%';}
function padL(s,n){s=String(s);while(s.length<n)s=' '+s;return s;}
function padR(s,n){s=String(s);while(s.length<n)s+=' ';return s;}
function esc(s){return String(s==null?'':s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
P.monthReport=function(ym,kind){
 var self=this,y=+ym.slice(0,4),m=+ym.slice(5),Y=this.year(y,kind),lab=kind==='labor',mo=Y.months[m-1];
 if(!mo.has)return null;
 var title=lab?'👷 <b>VRT 直接／間接人工 預算 vs 實際</b>　'+y+' 年 '+m+' 月\n<b>Direct / indirect labour budget vs actual</b> · '+ym:'📊 <b>VRT 管理部 預算 vs 實際</b>　'+y+' 年 '+m+' 月\n<b>Admin budget vs actual</b> · '+ym;
 var L=[title];
 var la=this._lab[ym];L.push('🏭 組數 Lines：<b>'+(Math.round(mo.lines*10)/10)+'</b>（DL '+N(la[0])+' 人 ÷ '+this.ppl(y)+'）　IDL '+N(la[2])+'・OFF '+N(la[4]));
 if(mo.est)L.push('⚠️ 本月人工是依出勤人數估算（HRA-PAY 沒有實發）｜Labour estimated from attendance');
 if(mo.prov)L.push('⏳ ERP 製造費用看起來還沒結完（低於前 3 月平均 80%）｜ERP overhead looks provisional');
 L.push('━━━━━━━━━━━━');
 var bestM=-1,bd=Infinity;mo.bud.forEach(function(b,si){var d=Math.abs(b-mo.act);if(d<bd){bd=d;bestM=si;}});
 var t=['<b>本月 This month</b>（USD；差異＝實際−預算 Var = actual − budget）','<pre>'+padR('Scenario',11)+padL('Budget',9)+padL('Var',9)+padL('%',8)];
 Y.scen.forEach(function(s,si){var b=mo.bud[si];t.push(padR((si===bestM?'* ':'  ')+s+' lines',11)+padL(K(b),9)+padL(K(mo.act-b),9)+padL(sgn(pct(mo.act,b)),8));});
 t.push(padR('  Flex',11)+padL(K(mo.flex),9)+padL(K(mo.act-mo.flex),9)+padL(sgn(pct(mo.act,mo.flex)),8));
 t.push(padR('  Actual',11)+padL(K(mo.act),9)+'</pre>');
 L.push(t.join('\n'));
 L.push('* ⭐ 最接近 Closest：<b>'+Y.scen[bestM]+' 組</b>（'+sgn(pct(mo.act,mo.bud[bestM]))+'）'+this.light(mo.act,mo.bud[bestM]));
 /* 本月各項差異（vs 彈性預算）前 4 名 */
 var items=[];
 if(lab){[['dl',0],['idl',2],['off',4]].forEach(function(p){var k=p[0],i=p[1];var fl=self.labBudget(y,m,mo.lines,la),sb=self.labBudget(y,m,Y.scen[bestM]);items.push({n:LAB_INFO[k],a:la[i+1],f:fl[k+'G'],hA:la[i],hF:sb[k+'N']});});}
 else{var lt=la[1]+la[3]+la[5],fl=self.labBudget(y,m,mo.lines,la);items.push({n:['人工','Labour'],a:lt,f:fl.total});
  this.cats.forEach(function(c){if(self.catCfg(c).off)return;items.push({n:[self.catName(c,'zh'),self.catName(c,'en')],a:self._fc[ym][c]||0,f:self.catBudget(y,m,mo.lines,c,lt)});});}
 items.sort(function(a,b){return Math.abs(b.a-b.f)-Math.abs(a.a-a.f);});
 L.push('━━━━━━━━━━━━');L.push('<b>主要差異 Top variances</b>（vs 彈性預算 flex budget）');
 items.slice(0,lab?3:4).forEach(function(x,i){var d=x.a-x.f;L.push((i+1)+'. '+self.light(x.a,x.f)+' '+esc(x.n[0])+' '+esc(x.n[1])+'　'+N(x.a)+' vs '+N(x.f)+'（'+(d>=0?'+':'')+N(d)+'）'+(x.hA!=null?'\n　人數 Heads '+N(x.hA)+'（'+Y.scen[bestM]+' 組預算 budget '+N(x.hF)+'）':''));});
 /* 今年累計 */
 var ytd={act:0,bud:Y.scen.map(function(){return 0;})};Y.months.slice(0,m).forEach(function(q){if(!q.has)return;ytd.act+=q.act;q.bud.forEach(function(b,si){ytd.bud[si]+=b;});});
 var bi=-1,bb=Infinity;ytd.bud.forEach(function(b,si){var d=Math.abs(b-ytd.act);if(d<bb){bb=d;bi=si;}});
 L.push('━━━━━━━━━━━━');
 L.push('<b>今年累計 YTD</b>（'+Y.months.slice(0,m).filter(function(q){return q.has;}).length+' 個月 months）實際 Actual <b>$'+N(ytd.act)+'</b>');
 L.push(Y.scen.map(function(s,si){return (si===bi?'⭐':'')+s+'組 $'+K(ytd.bud[si])+' '+sgn(pct(ytd.act,ytd.bud[si]));}).join('｜'));
 var full=Y.total.bud.map(function(b){return b.full;});
 L.push('全年預算 Full-year budget：'+Y.scen.map(function(s,si){return s+'組 $'+K(full[si]);}).join('｜'));
 var nt=this.note(y,'month:'+ym)||this.note(y,'year');if(nt)L.push('📝 '+esc(String(nt).slice(0,300)));
 /* 自我核對：各項加總＝合計 */
 var chk=Math.abs(sum(items.map(function(x){return x.a;}))-mo.act)<1;
 L.push(chk?'✅ 經計算核對正確：各項加總＝本月實際合計 Verified: items add up to the total':'⚠️ 各項加總與合計不符，請檢查 Items do not add up');
 L.push('<i>來源 Source：'+(lab?'HRA-PAY 實發（AG＋預支 S）':'PSJERP W_CCS450 製造費用＋HRA-PAY 工資')+'；組數＝DL÷'+this.ppl(y)+'</i>');
 return L.join('\n');
};
G.VRTBudget={Model:Model,CAT_INFO:CAT_INFO,LAB_INFO:LAB_INFO,NSSF_RATE:NSSF_RATE,PLAN_YEARS:PLAN_YEARS,
 make:function(data,doc,live){return new Model(data,doc,live);},ver:'1.0.0'};
})(typeof window!=='undefined'?window:this);
