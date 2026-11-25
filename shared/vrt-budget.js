/* VRT 預算計算核心 vrt-budget.js（2026-11-22）
   同一份程式給三個地方用：Admin OS「管理部預算 vs 實際」、PSJHR「直接／間接人工預算 vs 實際」、AC_ADMIN_CENTER GAS 每月結算月報。
   寫法維持 ES5／ES2015（GAS 也能 eval），不碰 DOM。

   方法（標準「靜態預算＋彈性預算」差異分析，依 Paul 2021 試作表調整成 VRT 現況）：
   · 組數＝DL 人數 ÷ 每組人數（預設 30；Paul 2021 用 32）。
   · 情境：2025–2027 固定 10／12／15 組；2021–2024 用該年平均組數 −2／平均／+2。
   · 人工預算＝組數 × 每組人數 × 最低工資 ×「去年平均工資倍數」；IDL＝DL × 去年 IDL/DL 比；OFF＝去年平均人數；12 月 × 年終係數。
   · 費用預算＝去年每月平均 ×（變動費用：情境組數 ÷ 去年平均組數）×（1＋加成%）；固定費用＝去年每月平均；社保＝人工預算 × 去年社保率 × 費率調整。
   · 彈性預算＝把「實際組數」代進同一公式 → 差異拆成「組數差異（量）」＋「單價／用量差異（價）」。
   · 最接近＝有實際資料的月份，預算合計跟實際合計差最少的情境。

   2026-11-25 修正（v1.1.0，只影響「管理部」這一張；人工那張不變）：
   ① ERP「間接人工（帳列）」不再加進合計 —— 那筆薪資已經在「人工」裡，加兩次每月多算約 $8,000。
   ② 有會計 factory exp 的月份：人工＝會計帳列總薪資（含加班、離職結算、年資／年假提列）；
      合計＝會計「直接人工＋製造費用」。ERP 還沒入帳的差額獨立列一行「ERP 未入帳／會計調整」。
      人工預算同步乘上「帳列係數」（基準年 會計總薪資 ÷ 人事工資），預算跟實際才是同一個口徑。
   ③ ERP 還沒結完時，只有「金額明顯偏低的科目」標 ⏳；折舊這種本來就這麼多的不再被誤標。
   ④ 折舊改用基準年最後 3 個月的水準（設備折完後不會回到全年平均）。 */
(function(G){
'use strict';
var CAT_INFO={
 indirect_labor:['ERP 間接人工（帳列，已含在人工）','ERP indirect labour (booked, already in Labour)','line',0,'B'],
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
 depreciation:['折舊','Depreciation','last',0,'B'],
 meal:['伙食','Meals','line',0,'A'],
 employee_benefit:['員工福利・獎金','Employee benefit / bonus','line',0,'A'],
 gasoline:['柴油油料','Diesel & fuel','line',10,'A'],
 printing_markers:['印刷・馬克','Printing & markers','line',0,'B'],
 misc_purchase:['雜項採購','Miscellaneous purchases','line',0,'A'],
 supplies:['文具・用品','Office & factory supplies','line',0,'A'],
 medical:['醫療','Medical','line',0,'A'],
 nssf:['社保 NSSF（公司負擔）','NSSF (company share)','nssf',0,'A']
};
var ADJ_KEY='acc_adj',ADJ_NAME=['ERP 未入帳／會計調整','Not yet in ERP / accounting adjustment'];
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
 M._fc={}; M._lab={}; M._src={}; M._acc={};
 keys(data.acc).forEach(function(ym){M._acc[ym]=data.acc[ym].slice();});
 keys(M.live.acc).forEach(function(ym){var a=M.live.acc[ym];if(a&&a[0]>0)M._acc[ym]=[Number(a[0])||0,a[1]!=null?Number(a[1]):null,a[2]!=null?Number(a[2]):null];});
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
P.catCfg=function(c){var x=CAT_INFO[c]||['','','line',0,'A'];var o=this.doc.cats[c]||{};return {driver:o.driver||x[2],up:o.up!=null&&o.up!==''?Number(o.up):x[3],group:o.group||x[4],off:c==='indirect_labor'?true:!!o.off};};
P.fc=function(ym){return this._fc[ym]||null;};
P.fcTotal=function(ym){var f=this._fc[ym];if(!f)return 0;var s=0;for(var c in f)s+=f[c]||0;return s;};
P.lab=function(ym){return this._lab[ym]||null;};
P.src=function(kind,ym){return this._src[kind+'|'+ym]||'';};
P.isProv=function(ym){return !!this._prov[ym];};
/* ── 會計帳列（factory exp）── acc[ym]＝[總薪資, 直接人工, 製造費用] */
P.acc=function(ym){return this._acc[ym]||null;};
P.accFull=function(ym){var a=this._acc[ym];return !!(a&&a[0]>0&&a[1]>0&&a[2]>0);};
/* 管理部用的人工實際：有會計帳列用帳列總薪資，沒有才用人事工資 */
P.admLab=function(ym){var a=this._acc[ym];return a&&a[0]>0?a[0]:this.labGross(ym)*this.admK(+ym.slice(0,4));};
P.admLabSrc=function(ym){var a=this._acc[ym];if(a&&a[0]>0)return 'acc';return Math.abs(this.admK(+ym.slice(0,4))-1)>0.001?'accest':this._src['lab|'+ym];};
/* 會計還沒進來的月份：人事工資 × 今年「會計總薪資 ÷ HRA-PAY 實發」（今年沒有可比月份 → 用基準年的帳列係數） */
P.admK=function(y){var key='_ak'+y;if(this[key]!=null)return this[key];var self=this,A=0,H=0;this.monthsOf(y,'lab').forEach(function(ym){var a=self._acc[ym];if(a&&a[0]>0&&self._src['lab|'+ym]==='pay'){A+=a[0];H+=self.labGross(ym);}});this[key]=H>0&&A>0?A/H:this.accK(y);return this[key];};
/* 管理部合計還算不算暫估：ERP 沒結完，而且會計也還沒有這個月 */
P.provAdmin=function(ym){return !!this._prov[ym]&&!this.accFull(ym);};
/* 單一科目這個月是不是「ERP 還沒入帳」：整個月被判暫估，且這科目 < 前 3 個月平均的一半 */
P.unposted=function(ym,c){if(!this._prov[ym])return false;var self=this,ms=keys(this._fc).sort(),i=ms.indexOf(ym);if(i<1)return false;
 var pv=ms.slice(Math.max(0,i-3),i).filter(function(k){return !self._prov[k];}).map(function(k){return self._fc[k][c]||0;});if(!pv.length)return false;var a=avg(pv);return a>=100&&(this._fc[ym][c]||0)<0.5*a;};
/* ERP 未入帳／會計調整＝會計製造費用 −（會計總薪資 − 會計直接人工）− ERP 各科目（不含間接人工）；沒有完整會計數 → null */
P.accAdj=function(ym){if(!this.accFull(ym)||!this._fc[ym])return null;var a=this._acc[ym],f=this._fc[ym],self=this,s=0;this.cats.forEach(function(c){if(!self.catCfg(c).off)s+=f[c]||0;});return a[2]-(a[0]-a[1])-s;};
/* 帳列係數：基準年 會計總薪資 ÷ 人事工資（同月份才比）→ 人工預算換成會計口徑 */
P.accK=function(y){var key='_k'+y;if(this[key]!=null)return this[key];var self=this,py=this.base(y).year,A=0,H=0;function add(yy){self.monthsOf(yy,'lab').forEach(function(ym){var a=self._acc[ym];if(a&&a[0]>0){A+=a[0];H+=self.labGross(ym);}});}add(py);if(!(H>0&&A>0)){A=0;H=0;add(y);}   /* 基準年沒有會計數 → 用當年自己的比 */
 this[key]=H>0&&A>0?A/H:1;return this[key];};
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
 b.catLast={};var l3=fm.slice(-3);this.cats.forEach(function(c){b.catLast[c]=l3.length?avg(l3.map(function(ym){return self._fc[ym][c]||0;})):0;});
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
 if(cfg.driver==='last')v=(b.catLast||{})[c]||0;
 if(cfg.driver==='line')v=v*(b.lines?L/b.lines:1);
 return v*(1+cfg.up/100);
};
P.customFor=function(y,m){var out=[];this.doc.custom.forEach(function(x){if(+x.y!==+y)return;var ms=x.months&&x.months.length?x.months.map(Number):[1,2,3,4,5,6,7,8,9,10,11,12];if(ms.indexOf(m)<0)return;out.push(x);});return out;};

/* 一年的整張表：kind＝'admin' | 'labor' */
P.year=function(y,kind,opt){
 /* opt＝{from:月,to:月}：只比較這段期間（單月＝from＝to）；圖表與逐月仍顯示全年 */
 var self=this,sc=this.scen(y),rows=[],lab=kind==='labor',F=(opt&&+opt.from)||1,TO=(opt&&+opt.to)||12;
 var allM=lab?this.monthsOf(y,'lab'):this.monthsOf(y,'both');
 var acts={};allM.forEach(function(ym){acts[+ym.slice(5)]=ym;});
 var actM=allM.filter(function(ym){var m=+ym.slice(5);return m>=F&&m<=TO;});
 function mk(key,zh,en,group){return {key:key,zh:zh,en:en,group:group,bud:sc.map(function(){return {full:0,ytd:0};}),flex:0,act:0,heads:null};}
 var R={};
 if(lab){['dl','idl','off'].forEach(function(k){R[k]=mk(k,LAB_INFO[k][0],LAB_INFO[k][1],'L');R[k].hd={bud:sc.map(function(){return 0;}),act:0,flex:0,n:0};});}
 else{R.labor=mk('labor','人工（DL＋IDL＋OFF 工資）','Labour (DL + IDL + OFF wages)','L');this.cats.forEach(function(c){var cfg=self.catCfg(c);if(cfg.off)return;R[c]=mk(c,self.catName(c,'zh'),self.catName(c,'en'),cfg.group);});}
 var cust={},mon=[],AK=lab?1:this.accK(y);
 if(!lab)R[ADJ_KEY]=mk(ADJ_KEY,ADJ_NAME[0],ADJ_NAME[1],'B');
 for(var m=1;m<=12;m++){
  var ym=ymOf(y,m),has=!!acts[m],inR=has&&m>=F&&m<=TO,la=has?this._lab[ym]:null,mo={ym:ym,m:m,has:has,inR:m>=F&&m<=TO,bud:sc.map(function(){return 0;}),flex:0,act:0,lines:has?this.lines(ym):null,prov:!lab&&has&&this.provAdmin(ym),est:has&&(lab?this._src['lab|'+ym]:this.admLabSrc(ym))==='est'};
  sc.forEach(function(L,si){
   var lb=self.labBudget(y,m,L);
   if(lab){['dl','idl','off'].forEach(function(k){var v=lb[k+'G'];R[k].bud[si].full+=v;if(inR)R[k].bud[si].ytd+=v;R[k].hd.bud[si]+=lb[k+'N']/12;mo.bud[si]+=v;});}
   else{R.labor.bud[si].full+=lb.total*AK;if(inR)R.labor.bud[si].ytd+=lb.total*AK;mo.bud[si]+=lb.total*AK;
    self.cats.forEach(function(c){if(!R[c])return;var v=self.catBudget(y,m,L,c,lb.total);R[c].bud[si].full+=v;if(inR)R[c].bud[si].ytd+=v;mo.bud[si]+=v;});
    self.customFor(y,m).forEach(function(x){var id='cx_'+x.id;if(!cust[id]){cust[id]=mk(id,x.zh||x.en||'—',x.en||x.zh||'—','C');cust[id].custom=x;}cust[id].bud[si].full+=Number(x.amt)||0;if(inR)cust[id].bud[si].ytd+=Number(x.amt)||0;mo.bud[si]+=Number(x.amt)||0;});}
  });
  if(has){
   var fl=self.labBudget(y,m,mo.lines,la);
   if(lab){[['dl',0],['idl',2],['off',4]].forEach(function(p){var k=p[0],i=p[1];mo.act+=la[i+1];mo.flex+=fl[k+'G'];if(inR){R[k].act+=la[i+1];R[k].flex+=fl[k+'G'];R[k].hd.act+=la[i];R[k].hd.flex+=fl[k+'N'];R[k].hd.n++;}});}
   else{var lt=la[1]+la[3]+la[5],la2=self.admLab(ym);mo.act+=la2;mo.flex+=fl.total*AK;if(inR){R.labor.act+=la2;R.labor.flex+=fl.total*AK;}
    var f=self._fc[ym];self.cats.forEach(function(c){if(!R[c])return;var v=self.catBudget(y,m,mo.lines,c,lt);mo.act+=f[c]||0;mo.flex+=v;if(inR){R[c].act+=f[c]||0;R[c].flex+=v;}});
    var aj=self.accAdj(ym);if(aj!=null){mo.act+=aj;mo.adj=aj;if(inR)R[ADJ_KEY].act+=aj;}
    self.customFor(y,m).forEach(function(x){var id='cx_'+x.id,a=x.act&&x.act[ym]!=null?Number(x.act[ym]):null;if(cust[id]&&a!=null){mo.act+=a;mo.flex+=Number(x.amt)||0;if(inR){cust[id].act+=a;cust[id].flex+=Number(x.amt)||0;}}});}
  }
  mon.push(mo);
 }
 if(!lab&&!allM.some(function(ym){return self.accAdj(ym)!=null;}))delete R[ADJ_KEY];
 keys(R).forEach(function(k){rows.push(R[k]);});keys(cust).forEach(function(k){rows.push(cust[k]);});
 rows.forEach(function(r){if(r.hd&&r.hd.n){r.hd.act/=r.hd.n;r.hd.flex/=r.hd.n;}});
 var T={bud:sc.map(function(_,si){return {full:sum(rows.map(function(r){return r.bud[si].full;})),ytd:sum(rows.map(function(r){return r.bud[si].ytd;}))};}),flex:sum(rows.map(function(r){return r.flex;})),act:sum(rows.map(function(r){return r.act;}))};
 var closest=-1,best=Infinity;if(actM.length)T.bud.forEach(function(b,si){var d=Math.abs(b.ytd-T.act);if(d<best){best=d;closest=si;}});
 var lines=actM.length?avg(actM.map(function(ym){return self.lines(ym);})):null;
 return {y:y,kind:kind,from:F,to:TO,scen:sc,scenKind:this.scenKind(y),rows:rows,total:T,months:mon,actMonths:actM,allMonths:allM,closest:closest,lines:lines,base:this.base(y),
  estMonths:actM.filter(function(ym){return (lab?self._src['lab|'+ym]:self.admLabSrc(ym))==='est';}),provMonths:lab?[]:actM.filter(function(ym){return self.provAdmin(ym);}),accK:AK,accMonths:lab?[]:actM.filter(function(ym){return self.accFull(ym);})};
};
/* 單一項目的 12 個月明細（卡片用）：每月 預算(各情境)／彈性／實際／去年同月／人數 */
P.item=function(y,kind,key){
 var self=this,sc=this.scen(y),lab=kind==='labor',out=[],idx={dl:0,idl:2,off:4},AK=lab?1:this.accK(y),adj=key===ADJ_KEY;
 var cx=key.indexOf('cx_')===0?this.doc.custom.filter(function(x){return 'cx_'+x.id===key;})[0]:null;
 function actOf(yy,mm){var ym=ymOf(yy,mm),la=self._lab[ym];
  if(lab){if(!la)return null;return {v:la[idx[key]+1],h:la[idx[key]]};}
  if(key==='labor')return la?{v:self.admLab(ym),h:la[0]+la[2]+la[4],parts:[la[1],la[3],la[5]],hp:[la[0],la[2],la[4]]}:null;
  if(adj){var aj=self.accAdj(ym);return aj!=null?{v:aj}:null;}
  if(cx){return cx.act&&cx.act[ym]!=null?{v:Number(cx.act[ym])}:null;}
  var f=self._fc[ym];return f?{v:f[key]||0}:null;}
 for(var m=1;m<=12;m++){
  var ym=ymOf(y,m),la=this._lab[ym],hasL=!!la,hasF=lab||key==='labor'||cx?true:!!this._fc[ym];if(adj&&!this.accFull(ym))hasF=false;
  var a=hasL&&hasF?actOf(y,m):null,lines=hasL?this.lines(ym):null,o={ym:ym,m:m,lines:lines,act:a?a.v:null,heads:a&&a.h!=null?a.h:null,parts:a&&a.parts,hp:a&&a.hp,prev:(actOf(y-1,m)||{}).v,bud:[],budH:[],flex:null,flexH:null,est:hasL&&this._src['lab|'+ym]==='est',prov:!lab&&key!=='labor'&&!cx&&!adj&&this.unposted(ym,key),src:lab?this._src['lab|'+ym]:key==='labor'?this.admLabSrc(ym):adj?'acc':this._src['fc|'+ym]};
  if(o.prev==null)o.prev=null;
  sc.forEach(function(L){var lb=self.labBudget(y,m,L);
   if(lab){o.bud.push(lb[key+'G']);o.budH.push(lb[key+'N']);}
   else if(key==='labor'){o.bud.push(lb.total*AK);o.budH.push(lb.dlN+lb.idlN+lb.offN);}
   else if(adj){o.bud.push(0);}
   else if(cx){var ms=cx.months&&cx.months.length?cx.months.map(Number):[1,2,3,4,5,6,7,8,9,10,11,12];o.bud.push(ms.indexOf(m)>=0?Number(cx.amt)||0:0);}
   else o.bud.push(self.catBudget(y,m,L,key,lb.total));});
  if(a&&hasL){var fl=this.labBudget(y,m,lines,la);
   if(lab){o.flex=fl[key+'G'];o.flexH=fl[key+'N'];}
   else if(key==='labor'){o.flex=fl.total*AK;o.flexH=fl.dlN+fl.idlN+fl.offN;}
   else if(adj){o.flex=0;}
   else if(cx){o.flex=o.bud[0];}
   else o.flex=this.catBudget(y,m,lines,key,la[1]+la[3]+la[5]);}
  out.push(o);
 }
 return {y:y,key:key,scen:sc,months:out,cfg:lab||key==='labor'||cx||adj?null:this.catCfg(key),base:this.base(y)};
};

/* 部門分類（HRA-PAY 部門／組別名稱 → DL／IDL／OFF） */
P.cls=function(d){d=String(d||'').toLowerCase().replace(/[​\s]+/g,' ').trim();
 if(/clean|guard|secur|driver|admin|nurse|doctor|export|lab office|^pc$|account|\bhr\b|hra|cook|canteen|office|gardener|import|purchas|merchand|electric|compliance|^it\b|ga\b|general affairs|gereral/.test(d))return 'off';
 if(/^l\d+$|line|sample|supervisor|training|service on line|service in garment|maker|sewer|sewing|cut and sew|^production$|^003$/.test(d)&&!/machin|mechanic/.test(d))return 'dl';return 'idl';};
/* 🤖 系統推測的可能原因（沒有人工說明時顯示；Paul：AI 覺得有就自己備註） */
P.autoReason=function(I,idx,si,lang,kind){
 var en=lang==='en',ms=I.months,o=ms[idx],key=I.key,out=[];if(!o||o.act==null)return [];
 function pc(a,b){return b?((a-b)/b*100):null;}function f(p){return (p>=0?'+':'')+p.toFixed(0)+'%';}function $(v){return '$'+r0(v).toLocaleString('en-US');}
 var lab=kind==='labor'||key==='labor',b=o.bud[si],L=I.scen[si],vol=o.flex!=null?o.flex-b:0,tot=o.act-b,spd=o.flex!=null?o.act-o.flex:tot;
 if(key===ADJ_KEY){out.push(en?'Booked by accounting but not yet posted in ERP (meals, freight, indirect labour etc.) — it moves into the items once ERP closes':'會計已經入帳、ERP 還沒過帳的金額（伙食、運費、間接人工等）；ERP 結帳後會回到各科目');return out;}
 if(o.prov)out.push(en?'Not posted in ERP yet this month (already counted in "Not yet in ERP")':'這個科目 ERP 本月還沒入帳（金額已算在「ERP 未入帳」那一列）');
 if(key==='labor'&&kind!=='labor'&&this.acc(o.ym)&&this.acc(o.ym)[0]>0){var hg=this.labGross(o.ym),ag=this.acc(o.ym)[0];if(hg>0&&Math.abs(ag-hg)>=500)out.push(en?'Accounting salary '+$(ag)+' = payroll '+$(hg)+' + resign settlements / seniority & leave accruals '+$(ag-hg):'會計帳列 '+$(ag)+'＝人事工資 '+$(hg)+'＋離職結算／年資・年假提列 '+$(ag-hg));}
 if(lab&&o.est)out.push(en?'Labour is estimated from attendance (no HRA-PAY payroll)':'人工是依出勤估算（沒有 HRA-PAY 實發），僅供參考');
 if(Math.abs(tot)>=1&&Math.abs(vol)>Math.abs(tot)*0.5&&o.lines!=null)out.push(en?'Mostly the line count: '+(Math.round(o.lines*10)/10)+' actual vs '+L+' budgeted':'主要是組數差：實際 '+(Math.round(o.lines*10)/10)+' 組，預算 '+L+' 組');
 if(lab&&o.heads!=null&&o.flexH!=null){var dh=o.heads-o.flexH;if(Math.abs(dh)>=Math.max(3,o.flexH*0.05))out.push(en?'Heads '+(dh>0?'+':'')+r0(dh)+' vs the line-based standard':'人數比依組數算的標準'+(dh>0?'多 ':'少 ')+Math.abs(r0(dh))+' 人');
  var ra=o.act/Math.max(1,o.heads),rf=o.flex/Math.max(1,o.flexH);if(Math.abs(ra-rf)>=rf*0.04)out.push(en?'Average wage '+$(ra)+' vs '+$(rf)+' (OT, allowances or raises)':'平均工資 '+$(ra)+'，標準 '+$(rf)+'（加班、加給或調薪影響）');}
 if(lab&&o.m===12)out.push(en?'December includes year-end / seniority pay':'12 月含年終／年資金，偏高屬正常');
 if(lab&&o.m===1)out.push(en?'January: new minimum wage $'+this.mw(I.y)+' takes effect':'1 月起最低工資調為 $'+this.mw(I.y));
 var pv=idx>0?ms[idx-1]:null;if(pv&&pv.act!=null&&!pv.prov){var p1=pc(o.act,pv.act);if(p1!=null&&Math.abs(p1)>=25)out.push(en?'vs last month '+f(p1)+' (last month '+$(pv.act)+')':'比上月 '+f(p1)+'（上月 '+$(pv.act)+'）');}
 var last3=ms.slice(Math.max(0,idx-3),idx).filter(function(x){return x.act!=null&&!x.prov;});if(last3.length>=2){var a3=avg(last3.map(function(x){return x.act;})),p3=pc(o.act,a3);if(p3!=null&&p3>=40&&!o.prov)out.push(en?f(p3)+' above the 3-month average — likely a one-off expense':'比前 3 個月平均高 '+f(p3)+'，可能有一次性支出');}
 if(o.prev!=null&&o.prev>0){var py=pc(o.act,o.prev);if(Math.abs(py)>=25&&!o.prov)out.push(en?'vs same month last year '+f(py):'比去年同月 '+f(py));}
 var hint={utilities:[[3,4,5],'旱季用電較高（冷氣、風扇、抽風）','Hot season — more air-con / fans'],meal:[null,'加班多時加班餐增加；人數變動也會影響','More OT means more OT meals; headcount also matters'],
  nssf:[null,'社保費率或投保薪資上下限調整（2022-10 退休金、2026-11 上下限）','NSSF rate or wage floor/ceiling changes (pension Oct 2022, limits Nov 2026)'],depreciation:[null,'資產折舊到期或新增設備','Assets fully depreciated or new equipment'],
  rent:[null,'租約調整或補繳','Lease change or catch-up payment'],employee_benefit:[null,'生產獎金／全勤獎隨達成率變動','Production / attendance bonus follows achievement'],repairs:[null,'設備大修（發電機、空調、叉車）多為一次性','Major repairs (generator, air-con, forklift) are usually one-off'],gasoline:[null,'停電時發電機用油增加','Power cuts raise generator diesel use']}[key];
 if(hint&&Math.abs(spd)>=Math.max(50,Math.abs(b)*0.08)&&(!hint[0]||hint[0].indexOf(o.m)>=0))out.push(en?hint[2]:hint[1]);
 return out.slice(0,4);
};
/* 單月的差異說明 */
P.explainMonth=function(o,L,si,lang){
 if(o.act==null)return '';var en=lang==='en',b=o.bud[si],vol=o.flex-b,spd=o.act-o.flex,out=[];
 function $(v){return (v>=0?'+':'−')+'$'+Math.abs(r0(v)).toLocaleString('en-US');}
 if(Math.abs(vol)>=1)out.push(en?'Lines '+(Math.round(o.lines*10)/10)+' vs '+L+' → '+$(vol):'組數 '+(Math.round(o.lines*10)/10)+' vs '+L+' → '+$(vol));
 if(o.heads!=null&&o.flexH!=null&&o.heads>0){var ra=o.act/o.heads,rf=o.flex/Math.max(1,o.flexH);
  out.push(en?'Heads '+r0(o.heads)+' (flex '+r0(o.flexH)+'), avg $'+r0(ra)+' vs $'+r0(rf)+' → '+$(spd):'人數 '+r0(o.heads)+'（彈性 '+r0(o.flexH)+'）、平均 $'+r0(ra)+' vs $'+r0(rf)+' → '+$(spd));}
 else if(Math.abs(spd)>=1)out.push(en?'Price / usage '+$(spd):'單價／用量 '+$(spd));
 return out.join(en?'; ':'；');
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
 var accOk=!lab&&this.accFull(ym),unp=lab?[]:this.cats.filter(function(c){return !self.catCfg(c).off&&self.unposted(ym,c);});
 if(!lab&&this.admLabSrc(ym)==='accest')L.push('⚠️ 會計 factory exp 還沒進來：人工先用人事工資 × '+this.admK(y).toFixed(3)+' 估算｜Accounting not in yet — labour estimated from payroll × '+this.admK(y).toFixed(3));
 if(mo.prov)L.push('⏳ <b>暫估</b>：ERP 製造費用還沒結完，會計也還沒有這個月 → 合計偏低，先不判定｜Provisional: ERP not closed and no accounting figure yet');
 else if(accOk&&this._prov[ym])L.push('ℹ️ ERP 還沒結完，合計改用會計帳列（直接人工＋製造費用）｜ERP not closed — total uses the accounting books');
 L.push('━━━━━━━━━━━━');
 var bestM=-1,bd=Infinity;mo.bud.forEach(function(b,si){var d=Math.abs(b-mo.act);if(d<bd){bd=d;bestM=si;}});
 var t=['<b>本月 This month</b>（USD；差異＝實際−預算 Var = actual − budget）','<pre>'+padR('Scenario',11)+padL('Budget',9)+padL('Var',9)+padL('%',8)];
 Y.scen.forEach(function(s,si){var b=mo.bud[si];t.push(padR((si===bestM?'* ':'  ')+s+' lines',11)+padL(K(b),9)+padL(K(mo.act-b),9)+padL(sgn(pct(mo.act,b)),8));});
 t.push(padR('  Flex',11)+padL(K(mo.flex),9)+padL(K(mo.act-mo.flex),9)+padL(sgn(pct(mo.act,mo.flex)),8));
 t.push(padR('  Actual',11)+padL(K(mo.act),9)+'</pre>');
 L.push(t.join('\n'));
 if(mo.prov)L.push('⏳ 暫估月份不判定最接近情境 No closest scenario for a provisional month');
 else L.push('* ⭐ 最接近 Closest：<b>'+Y.scen[bestM]+' 組</b>（'+sgn(pct(mo.act,mo.bud[bestM]))+'）'+this.light(mo.act,mo.bud[bestM]));
 /* 本月各項差異（vs 彈性預算）前 4 名 */
 var items=[];
 if(lab){[['dl',0],['idl',2],['off',4]].forEach(function(p){var k=p[0],i=p[1];var fl=self.labBudget(y,m,mo.lines,la),sb=self.labBudget(y,m,Y.scen[bestM]);items.push({k:k,n:LAB_INFO[k],a:la[i+1],f:fl[k+'G'],hA:la[i],hF:sb[k+'N']});});}
 else{var lt=la[1]+la[3]+la[5],fl=self.labBudget(y,m,mo.lines,la);items.push({k:'labor',n:['人工','Labour'],a:self.admLab(ym),f:fl.total*Y.accK});
  if(mo.adj!=null&&Math.abs(mo.adj)>=1)items.push({k:ADJ_KEY,n:ADJ_NAME,a:mo.adj,f:0});
  this.cats.forEach(function(c){if(self.catCfg(c).off)return;items.push({k:c,n:[self.catName(c,'zh'),self.catName(c,'en')],a:self._fc[ym][c]||0,f:self.catBudget(y,m,mo.lines,c,lt),u:unp.indexOf(c)>=0});});}
 items.sort(function(a,b){return Math.abs(b.a-b.f)-Math.abs(a.a-a.f);});
 L.push('━━━━━━━━━━━━');L.push('<b>主要差異 Top variances</b>（vs 彈性預算 flex budget）');
 items.filter(function(x){return !x.u;}).slice(0,lab?3:4).forEach(function(x,i){var d=x.a-x.f;L.push((i+1)+'. '+(x.k===ADJ_KEY?'⏳':self.light(x.a,x.f))+' '+esc(x.n[0])+' '+esc(x.n[1])+'　'+N(x.a)+' vs '+N(x.f)+'（'+(d>=0?'+':'')+N(d)+'）'+(self.note(y,x.k+'@'+ym)?'\n　📝 '+esc(String(self.note(y,x.k+'@'+ym)).slice(0,160)):(function(){var I=self.item(y,kind,x.k),r=self.autoReason(I,m-1,bestM,'zh',kind),re=self.autoReason(I,m-1,bestM,'en',kind);return r.length?'\n　🤖 '+esc(r.slice(0,2).join('；'))+'\n　🤖 '+esc(re.slice(0,2).join('; ')):'';})())+(x.hA!=null?'\n　人數 Heads '+N(x.hA)+'（'+Y.scen[bestM]+' 組預算 budget '+N(x.hF)+'）':''));});
 if(unp.length)L.push('⏳ ERP 本月還沒入帳 Not posted in ERP yet：'+unp.map(function(c){return esc(self.catName(c,'zh'));}).join('、')+(accOk?'（金額已含在「ERP 未入帳」）':'')+'\n　'+unp.map(function(c){return esc(self.catName(c,'en'));}).join(', ')+(accOk?' (included in "Not yet in ERP")':''));
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
 if(accOk){var ac=this.acc(ym),tie=Math.abs(ac[1]+ac[2]-mo.act)<1;L.push((tie?'✅':'⚠️')+' 會計 直接人工 $'+N(ac[1])+'＋製造費用 $'+N(ac[2])+'＝$'+N(ac[1]+ac[2])+(tie?'，與本月合計相同 Matches the accounting books':'，與本月合計差 $'+N(mo.act-ac[1]-ac[2])+' Differs from the books'));}
 L.push('<i>來源 Source：'+(lab?'HRA-PAY 實發（AG＋預支 S）':(accOk?'會計 factory exp（總薪資・直接人工・製造費用）＋PSJERP W_CCS450 科目明細':'PSJERP W_CCS450 製造費用＋'+(this.admLabSrc(ym)==='acc'?'會計帳列總薪資':'HRA-PAY 工資'))+'；ERP 間接人工已含在人工，不重複計')+'；組數＝DL÷'+this.ppl(y)+'</i>');
 return L.join('\n');
};
G.VRTBudget={Model:Model,CAT_INFO:CAT_INFO,LAB_INFO:LAB_INFO,NSSF_RATE:NSSF_RATE,PLAN_YEARS:PLAN_YEARS,
 make:function(data,doc,live){return new Model(data,doc,live);},ver:'1.1.0',ADJ_KEY:ADJ_KEY};
})(typeof window!=='undefined'?window:this);
