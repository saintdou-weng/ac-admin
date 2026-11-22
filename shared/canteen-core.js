/* VRT 外幹伙食費 canteen-core.js v10（2026-11-22）
   同一份程式給「伙食費頁（瀏覽器）」與「AC_ADMIN_CENTER（GAS，每月 25 號自動產生下個月 Excel 發給總務）」共用，
   兩邊算出來的數字、產生的 Excel 一模一樣。
   規則照 VRT_Canteen_Cost_Nov_2026_EN_KM.xlsx：
     每月伙食預算 US$110（整月；不足月按日曆天比例）÷ 26 基準工作天 ÷ 每天 3 餐 = 每餐單價；
     只吃午餐 → 每個「可計費日」1 餐；可計費日＝當月天數 − 星期日 − 國定假日 − 公司調休日 − 停工 − 請假／出差；
     伙食費 = ROUND(餐數 × 單價, 0)（取整數美元）；預付 US$180 − 伙食費 = 退款（附鈔票面額拆法）。
   標記：Hol 國定假日、Off 公司調休放假、Work 調成上班、AL 請假／出差、Shut 停工、Skip 那天沒吃。
   Excel 用最基本的 SpreadsheetML 自己組（不靠外掛）：公式＋已算好的值都寫進去，手機預覽也看得到數字。 */
(function(root){
'use strict';
var DAYS_EN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var DAYS_KM=['អាទិត្យ','ចន្ទ','អង្គារ','ពុធ','ព្រហស្បតិ៍','សុក្រ','សៅរ៍'];
var MON_EN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MON_KM=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
var MON_ZH=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
var KMD='០១២៣៤៥៦៧៨៩';
function km(n){return String(n).replace(/[0-9]/g,function(d){return KMD[+d];});}
function p2(n){return (n<10?'0':'')+n;}
function dim(y,m){return new Date(Date.UTC(y,m,0)).getUTCDate();}          /* m = 1..12 */
function dow(y,m,d){return new Date(Date.UTC(y,m-1,d)).getUTCDay();}
function iso(y,m,d){return y+'-'+p2(m)+'-'+p2(d);}
function r6(x){return Math.round(x*1e6)/1e6;}

/* 柬埔寨國定假日（NBC／官方公告；農曆節日以政府當年公告為準，頁面上可改） */
var HOLIDAYS=[
 {d:'2026-11-09',en:'Independence Day',km:'បុណ្យឯករាជ្យជាតិ',zh:'獨立日'},
 {d:'2026-11-23',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},{d:'2026-11-24',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},{d:'2026-11-25',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},
 {d:'2026-12-29',en:'Peace Day',km:'ទិវាសន្តិភាព',zh:'和平日'},
 {d:'2027-01-01',en:"New Year's Day",km:'ទិវាចូលឆ្នាំសកល',zh:'元旦'},
 {d:'2027-01-07',en:'Victory over Genocide Day',km:'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍',zh:'勝利日'},
 {d:'2027-03-08',en:"International Women's Day",km:'ទិវានារីអន្តរជាតិ',zh:'婦女節'},
 {d:'2027-04-14',en:'Khmer New Year',km:'បុណ្យចូលឆ្នាំខ្មែរ',zh:'高棉新年'},{d:'2027-04-15',en:'Khmer New Year',km:'បុណ្យចូលឆ្នាំខ្មែរ',zh:'高棉新年'},{d:'2027-04-16',en:'Khmer New Year',km:'បុណ្យចូលឆ្នាំខ្មែរ',zh:'高棉新年'},
 {d:'2027-05-01',en:'International Labour Day',km:'ទិវាពលកម្មអន្តរជាតិ',zh:'勞動節'},
 {d:'2027-05-14',en:"King's Birthday",km:'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មព្រះមហាក្សត្រ',zh:'國王誕辰'},
 {d:'2027-05-20',en:'Visak Bochea Day',km:'ពិធីបុណ្យវិសាខបូជា',zh:'佛誕節'},
 {d:'2027-05-24',en:'Royal Ploughing Ceremony',km:'ព្រះរាជពិធីច្រត់ព្រះនង្គ័ល',zh:'御耕節'},
 {d:'2027-06-18',en:"King's Mother's Birthday",km:'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្មសម្តេចព្រះមហាក្សត្រី',zh:'太后誕辰'},
 {d:'2027-09-24',en:'Constitution Day',km:'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ',zh:'憲法日'},
 {d:'2027-09-29',en:'Pchum Ben',km:'ពិធីបុណ្យភ្ជុំបិណ្ឌ',zh:'亡人節'},{d:'2027-09-30',en:'Pchum Ben',km:'ពិធីបុណ្យភ្ជុំបិណ្ឌ',zh:'亡人節'},{d:'2027-10-01',en:'Pchum Ben',km:'ពិធីបុណ្យភ្ជុំបិណ្ឌ',zh:'亡人節'},
 {d:'2027-10-15',en:"Commemoration of the King Father",km:'ទិវាគោរពព្រះវិញ្ញាណក្ខន្ធព្រះបរមរតនកោដ្ឋ',zh:'太皇紀念日'},
 {d:'2027-10-29',en:"King's Coronation Day",km:'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ',zh:'國王登基日'},
 {d:'2027-11-09',en:'Independence Day',km:'បុណ្យឯករាជ្យជាតិ',zh:'獨立日'},
 {d:'2027-11-12',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},{d:'2027-11-13',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},{d:'2027-11-14',en:'Water Festival',km:'បុណ្យអុំទូក',zh:'送水節'},
 {d:'2027-12-29',en:'Peace Day',km:'ទិវាសន្តិភាព',zh:'和平日'}
];
function defaults(){return {
 v:10,person:{first:'Paul',last:'Weng'},
 budget:110,baseDays:26,divisor:3,advance:180,
 meals:{b:0,l:1,d:0},                       /* 只吃午餐 */
 holidays:HOLIDAYS.map(function(h){return {d:h.d,en:h.en,km:h.km,zh:h.zh};}),
 swaps:[{d:'2026-12-29',type:'work',zh:'和平日調成上班（與 2027/1/2 對調）',en:'Peace Day worked (swapped with Jan 2, 2027)',km:'ធ្វើការថ្ងៃសន្តិភាព (ប្តូរជាមួយ ២ មករា ២០២៧)'},
        {d:'2027-01-02',type:'off',zh:'公司調休放假（與 2026/12/29 對調）',en:'Company day off (swapped with Dec 29, 2026)',km:'ថ្ងៃឈប់ក្រុមហ៊ុន (ប្តូរជាមួយ ២៩ ធ្នូ ២០២៦)'}],
 leaves:[{from:'2027-01-31',to:'2027-02-12',zh:'返馬來西亞亞庇（MH755／MH2640 去、MH2621／MH762 回）',en:'Trip to Kota Kinabalu (out Jan 31, back Feb 12 evening)',km:'ធ្វើដំណើរទៅកូតាគីណាបាលូ'}],
 shutdown:[],skip:[],extra:{},
 autoSend:{day:25,at:'09:00'}
};}
/* 一個月的計算結果 */
function calc(cfg,ym){
 cfg=cfg||defaults();var y=+ym.slice(0,4),m=+ym.slice(5,7),n=dim(y,m);
 var H={},S={},SH={},SK={},i;
 (cfg.holidays||[]).forEach(function(h){H[h.d]=h;});
 (cfg.swaps||[]).forEach(function(s){S[s.d]=s;});
 (cfg.shutdown||[]).forEach(function(d){SH[typeof d==='string'?d:d.d]=1;});
 (cfg.skip||[]).forEach(function(d){SK[typeof d==='string'?d:d.d]=1;});
 function inLeave(ds){return (cfg.leaves||[]).filter(function(l){return ds>=l.from&&ds<=l.to;})[0]||null;}
 var meals=(cfg.meals&&((cfg.meals.b?1:0)+(cfg.meals.l?1:0)+(cfg.meals.d?1:0)))||1;
 var list=[],c={sun:0,hol:0,off:0,shut:0,al:0,skip:0,bill:0};
 for(i=1;i<=n;i++){var ds=iso(y,m,i),w=dow(y,m,i),mark='',note='';
  var sw=S[ds];
  if(w===0)mark='Sun';
  else if(sw&&sw.type==='off'){mark='Off';note=sw;}
  else if(H[ds]&&!(sw&&sw.type==='work')){mark='Hol';note=H[ds];}
  else if(SH[ds])mark='Shut';
  else if(inLeave(ds)){mark='AL';note=inLeave(ds);}
  else if(SK[ds])mark='Skip';
  var work=sw&&sw.type==='work'&&w!==0;
  if(mark==='Sun')c.sun++;else if(mark==='Hol')c.hol++;else if(mark==='Off')c.off++;else if(mark==='Shut')c.shut++;else if(mark==='AL')c.al++;else if(mark==='Skip')c.skip++;else c.bill++;
  list.push({d:i,date:ds,dow:w,mark:mark,note:note,swapWork:!!work,hol:H[ds]||null,meals:mark?0:meals});}
 var budget=r6((cfg.budget||0)/n*n);                 /* 整月＝預算本身（保留「不足月按日曆天」的算式） */
 var unit=(cfg.budget||0)/(cfg.baseDays||26)/(cfg.divisor||3);
 var total=c.bill*meals,extra=+((cfg.extra||{})[ym]||0);
 var charge=Math.round(total*unit)+extra,adv=+cfg.advance||0,refund=adv-charge;
 return {ym:ym,y:y,m:m,days:n,list:list,c:c,meals:meals,budget:budget,unit:unit,perDay:meals*unit,total:total,extra:extra,charge:charge,advance:adv,refund:refund,cash:notes(refund),cfg:cfg};
}
function notes(a){var r=Math.max(0,Math.round(a)),out=[];[100,50,20,10,5,1].forEach(function(d){var k=Math.floor(r/d);if(k){out.push({d:d,n:k});r-=k*d;}});return out;}
function nextYm(ym){var y=+ym.slice(0,4),m=+ym.slice(5,7)+1;if(m>12){m=1;y++;}return y+'-'+p2(m);}
function mealWord(r,lang){var x=r.cfg.meals||{l:1};if(x.b&&x.l&&x.d)return lang==='km'?'អាហារ ៣ ពេល':lang==='zh'?'三餐':'all meals';
 if(x.l&&!x.b&&!x.d)return lang==='km'?'អាហារថ្ងៃត្រង់':lang==='zh'?'午餐':'lunch';return lang==='km'?'អាហារ':lang==='zh'?'餐':'meals';}
/* 「哪幾天不計費」說明（英／高棉） */
function nonBillText(r){
 var M=MON_EN[r.m-1].slice(0,3),Mk=MON_KM[r.m-1],sun=[],hol={},off=[],al=[],sh=[],sk=[];
 r.list.forEach(function(x){if(x.mark==='Sun')sun.push(x.d);else if(x.mark==='Hol'){var k=x.note.en;(hol[k]=hol[k]||{h:x.note,d:[]}).d.push(x.d);}else if(x.mark==='Off')off.push(x);else if(x.mark==='AL')al.push(x.d);else if(x.mark==='Shut')sh.push(x.d);else if(x.mark==='Skip')sk.push(x.d);});
 function rng(a){var out=[],s=null,p=null;a.forEach(function(d){if(s===null){s=p=d;}else if(d===p+1)p=d;else{out.push(s===p?String(s):s+'–'+p);s=p=d;}});if(s!==null)out.push(s===p?String(s):s+'–'+p);return out;}
 function rngK(a){return rng(a).map(function(t){return km(t);});}
 var en=[],kh=[];
 en.push('Sundays '+M+' '+sun.join(', '));kh.push('ថ្ងៃអាទិត្យ '+sun.map(km).join(', ')+' '+Mk);
 var hk=Object.keys(hol);if(hk.length){en.push('public holidays '+hk.map(function(k){return M+' '+rng(hol[k].d).join(', ')+' ('+k+')';}).join(' and '));kh.push('ថ្ងៃឈប់សម្រាកជាតិ '+hk.map(function(k){return rngK(hol[k].d).join(', ')+' '+Mk+' ('+hol[k].h.km+')';}).join(' និង '));}
 else{en.push('no public holidays');kh.push('គ្មានថ្ងៃឈប់សម្រាកជាតិ');}
 off.forEach(function(x){en.push(M+' '+x.d+' ('+(x.note.en||'company day off')+')');kh.push(km(x.d)+' '+Mk+' ('+(x.note.km||'ថ្ងៃឈប់ក្រុមហ៊ុន')+')');});
 if(al.length){en.push('leave / away '+M+' '+rng(al).join(', '));kh.push('ច្បាប់ / ធ្វើដំណើរ '+rngK(al).join(', ')+' '+Mk);}
 if(sh.length){en.push('shutdown '+M+' '+rng(sh).join(', '));kh.push('ផ្អាកការងារ '+rngK(sh).join(', ')+' '+Mk);}
 if(sk.length){en.push('no meal taken '+M+' '+rng(sk).join(', '));kh.push('មិនបានញ៉ាំ '+rngK(sk).join(', ')+' '+Mk);}
 var work=r.list.filter(function(x){return x.swapWork;});
 var tail='',tailK='';if(work.length){tail=' Note: '+work.map(function(x){return M+' '+x.d+' ('+(x.hol?x.hol.en:'')+') is a normal workday — '+(r.cfg.swaps.filter(function(s){return s.d===x.date;})[0]||{}).en;}).join('; ')+'.';
  tailK=' ចំណាំ៖ '+work.map(function(x){return km(x.d)+' '+Mk+' ('+(x.hol?x.hol.km:'')+') ជាថ្ងៃធ្វើការធម្មតា — '+(r.cfg.swaps.filter(function(s){return s.d===x.date;})[0]||{}).km;}).join('; ')+'។';}
 return {en:'Non-billable dates: '+en.join('; ')+'.'+tail,km:'ថ្ងៃមិនគិតថ្លៃ៖ '+kh.join('; ')+'។'+tailK};
}
/* Telegram 說明（繁中＋英文） */
function caption(r){
 var c=r.c,M=MON_EN[r.m-1];
 var lines=['🍱 <b>外幹伙食費｜'+r.y+' 年 '+MON_ZH[r.m-1]+'</b>　Canteen cost · '+M+' '+r.y,
  '👤 '+r.cfg.person.first+' '+r.cfg.person.last+'　'+mealWord(r,'zh')+' / '+mealWord(r,'en'),
  '📅 '+r.days+' 天 − 星期日 '+c.sun+(c.hol?' − 國定假日 '+c.hol:'')+(c.off?' − 調休 '+c.off:'')+(c.shut?' − 停工 '+c.shut:'')+(c.al?' − 請假／出差 '+c.al:'')+(c.skip?' − 未用餐 '+c.skip:'')+' = <b>'+c.bill+'</b> 天',
  '　'+r.days+' days − '+c.sun+' Sun'+(c.hol?' − '+c.hol+' hol':'')+(c.off?' − '+c.off+' off':'')+(c.shut?' − '+c.shut+' shutdown':'')+(c.al?' − '+c.al+' leave':'')+(c.skip?' − '+c.skip+' no-meal':'')+' = '+c.bill+' billable days',
  '💵 '+r.total+' 餐 × US$'+r.unit.toFixed(6)+' ≈ <b>US$'+r.charge+'</b>（取整數 / rounded）',
  '↩️ 預付 Advance US$'+r.advance+' − US$'+r.charge+' = <b>退款 Refund US$'+r.refund+'</b>'+(r.cash.length?'　('+r.cash.map(function(x){return x.n+'×$'+x.d;}).join(', ')+')':'')];
 var sw=r.list.filter(function(x){return x.swapWork;}).map(function(x){return r.m+'/'+x.d+' 上班（調休）';}).concat(r.list.filter(function(x){return x.mark==='Off';}).map(function(x){return r.m+'/'+x.d+' 放假（調休）';}));
 if(sw.length)lines.push('🔁 '+sw.join('、'));
 var lv=(r.cfg.leaves||[]).filter(function(l){return l.from<=r.ym+'-31'&&l.to>=r.ym+'-01';});if(lv.length)lines.push('✈️ '+lv.map(function(l){return l.from.slice(5).replace('-','/')+'–'+l.to.slice(5).replace('-','/')+' '+(l.zh||l.en||'');}).join('；'));
 lines.push('📎 附 Excel（英文／高棉文）給總務 · Excel attached for GA');
 return lines.join('\n');
}

/* ───────── Excel（SpreadsheetML）───────── */
function col(n){var s='';while(n>0){var k=(n-1)%26;s=String.fromCharCode(65+k)+s;n=Math.floor((n-1)/26);}return s;}
function xe(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function serial(y,m,d){return Math.round((Date.UTC(y,m-1,d)-Date.UTC(1899,11,30))/86400000);}
/* 樣式表：索引對照 ST */
var ST={def:0,hdr:1,num:2,dec6:3,int:4,due:5,mark:6,date:7,wday:8,grid:9,gridOff:10,tot:11,title:12,lab:13,usd:14,val:15,note:16,foot:17,name:18,txt:19,usd6:20,ymd:21,hdrTop:22,bold:23,leg:24};
function stylesXml(){
 var fonts=['<font><sz val="11"/><name val="Carlito"/></font>',
  '<font><b/><sz val="10"/><color rgb="FF252525"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="12"/><color rgb="FF3B2B00"/><name val="Carlito"/></font>',
  '<font><b/><sz val="11"/><color rgb="FF991B1B"/><name val="Carlito"/></font>',
  '<font><b/><sz val="9"/><color rgb="FF1F4A72"/><name val="Carlito"/></font>',
  '<font><sz val="9"/><color rgb="FF475569"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="11"/><color rgb="FF234E75"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="11"/><color rgb="FF8B4B0A"/><name val="Noto Sans Khmer"/></font>',
  '<font><sz val="11"/><color rgb="FF374151"/><name val="Noto Sans Khmer"/></font>',
  '<font><sz val="10"/><color rgb="FF465568"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="11"/><name val="Noto Sans Khmer"/></font>',
  '<font><sz val="11"/><name val="Noto Sans Khmer"/></font>',
  '<font><b/><sz val="11"/><name val="Carlito"/></font>'];
 var fills=['<fill><patternFill patternType="none"/></fill>','<fill><patternFill patternType="gray125"/></fill>'];
 var fillIdx={};function F(rgb){if(!rgb)return 0;if(fillIdx[rgb]==null){fillIdx[rgb]=fills.length;fills.push('<fill><patternFill patternType="solid"><fgColor rgb="FF'+rgb+'"/><bgColor indexed="64"/></patternFill></fill>');}return fillIdx[rgb];}
 var thin='<border><left style="thin"><color rgb="FFB8C2CC"/></left><right style="thin"><color rgb="FFB8C2CC"/></right><top style="thin"><color rgb="FFB8C2CC"/></top><bottom style="thin"><color rgb="FFB8C2CC"/></bottom><diagonal/></border>';
 var borders=['<border><left/><right/><top/><bottom/><diagonal/></border>',thin];
 var numFmts=[[164,'0.000000'],[165,'m/d'],[166,'&quot;$&quot;0.00'],[167,'&quot;$&quot;0.000000'],[168,'yyyy-mm-dd']];
 /* [font,fill,border,numFmt,halign,valign,wrap] */
 var X=[[0,0,0,0],[1,'EEF1F5',1,0,'center','center',1],[0,0,1,0,'center','center'],[0,0,1,164,'center','center'],[0,0,1,1,'center','center'],[2,'FFE05F',1,1,'center','center'],[3,'FBC3A7',1,0,'center','center'],
  [4,'E5E7EB',1,165,'center','center'],[5,'E5E7EB',1,0,'center','center',1],[0,0,1,0,'center','center'],[0,'F1F5F9',1,0,'center','center'],[13,'FFF1A8',1,0,'center','center'],[6,'254B74',0,0,'left','center',1],
  [7,'E9F0F7',0,0,'left','center',1],[8,'FFF6D9',0,166,'center','center',1],[8,'FFF6D9',0,1,'center','center',1],[9,'F5F8FC',0,0,'left','center',1],[10,'F3F6FA',0,0,'left','center',1],[11,'FBBF24',1,0,'left','center'],
  [12,0,1,0,'left','center',1],[8,'FFF6D9',0,167,'center','center',1],[0,0,1,168,'center','center'],[1,'EEF1F5',0,0,'center','center',1],[13,0,0,0,'right','center'],[10,0,0,0,'left','center',1]];
 var xfs=X.map(function(a){var fill=F(a[1]);var al=a[4]||a[5]||a[6]?'<alignment'+(a[4]?' horizontal="'+a[4]+'"':'')+(a[5]?' vertical="'+a[5]+'"':'')+(a[6]?' wrapText="1"':'')+'/>':'';
  return '<xf numFmtId="'+a[3]+'" fontId="'+a[0]+'" fillId="'+fill+'" borderId="'+a[2]+'" xfId="0"'+(a[3]?' applyNumberFormat="1"':'')+(a[0]?' applyFont="1"':'')+(fill?' applyFill="1"':'')+(a[2]?' applyBorder="1"':'')+(al?' applyAlignment="1">'+al+'</xf>':'/>');});
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+
  '<numFmts count="'+numFmts.length+'">'+numFmts.map(function(n){return '<numFmt numFmtId="'+n[0]+'" formatCode="'+n[1]+'"/>';}).join('')+'</numFmts>'+
  '<fonts count="'+fonts.length+'">'+fonts.join('')+'</fonts><fills count="'+fills.length+'">'+fills.join('')+'</fills><borders count="'+borders.length+'">'+borders.join('')+'</borders>'+
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="'+xfs.length+'">'+xfs.join('')+'</cellXfs>'+
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
}
function sheetXml(r){
 var rows={},merges=[],hts={2:33,3:45,5:28,9:20,10:25,11:38,12:25,16:53,17:49,18:49,19:49,20:53,21:52,22:40,23:70,24:72,25:31};
 function put(ref,cell){var m=/^([A-Z]+)(\d+)$/.exec(ref);(rows[+m[2]]=rows[+m[2]]||[]).push({c:m[1],x:cell});}
 function S(ref,v,s){put(ref,'<c r="'+ref+'" s="'+(s||0)+'" t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>');}
 function N(ref,v,s){put(ref,'<c r="'+ref+'" s="'+(s||0)+'"><v>'+v+'</v></c>');}
 function E(ref,s){put(ref,'<c r="'+ref+'" s="'+(s||0)+'"/>');}
 function Fn(ref,f,v,s){put(ref,'<c r="'+ref+'" s="'+(s||0)+'"><f>'+xe(f)+'</f><v>'+v+'</v></c>');}
 function Fs(ref,f,v,s){put(ref,'<c r="'+ref+'" s="'+(s||0)+'" t="str"><f>'+xe(f)+'</f><v>'+xe(v)+'</v></c>');}
 function M(a,b){merges.push(a+':'+b);}
 var n=r.days,c=r.c,first=5,last=first+n-1,LC=col(last),TC=col(last+1),Mn=MON_EN[r.m-1],Mk=MON_KM[r.m-1];
 /* 第 1–6 列：總表（同原 Excel 欄位） */
 S('R1','Daily / ប្រចាំថ្ងៃ',ST.hdrTop);S('S1','Total / សរុប',ST.hdrTop);S('T1','Meal charge / ថ្លៃអាហារ',ST.hdrTop);S('X1','Leave / ច្បាប់',ST.hdrTop);
 S('A2','Advance / បង់មុន',ST.hdr);N('B2',r.advance,ST.num);N('C2',r.m,ST.num);N('D2',n,ST.num);
 var H2=['Meal cost','Calendar days','Sundays','Public holidays','Shutdown','Annual leave','Base workdays','Billable days','Cost / meal','Breakfast','Lunch','Dinner','Meals / day','Cost / day','Total meals','Monthly charge','Extra cost','Amount due','Refund','Leave period','End date','Leave days','Overlapping days'];
 var H3=['ថ្លៃអាហារ','ថ្ងៃសរុប','ថ្ងៃអាទិត្យ','ថ្ងៃបុណ្យជាតិ','ថ្ងៃផ្អាកការងារ','ច្បាប់ប្រចាំឆ្នាំ','ថ្ងៃធ្វើការគោល','ថ្ងៃគិតថ្លៃ','តម្លៃមួយពេល','អាហារពេលព្រឹក','អាហារថ្ងៃត្រង់','អាហារពេលល្ងាច','ចំនួនពេល/ថ្ងៃ','ថ្លៃអាហារ/ថ្ងៃ','អាហារសរុប','ថ្លៃខែនេះ','ថ្លៃបន្ថែម','ប្រាក់ត្រូវបង់','ប្រាក់ត្រូវសងវិញ','ការឈប់សម្រាក','ថ្ងៃបញ្ចប់','ចំនួនថ្ងៃ','ថ្ងៃឈប់ស្ទួន'];
 H2.forEach(function(t,i){S(col(5+i)+'2',t,ST.hdr);S(col(5+i)+'3',H3[i],ST.hdr);});
 S('A3','#',ST.hdr);S('B3','',ST.hdr);S('C3','Name / ឈ្មោះ',ST.hdr);S('D3','',ST.hdr);M('C3','D3');
 S('X4','Start / ចាប់ផ្ដើម',ST.leg);S('Y4','End / បញ្ចប់',ST.leg);S('Z4','Days / ថ្ងៃ',ST.leg);
 var R9='$'+col(first)+'$9:$'+LC+'$9',R11='$'+col(first)+'$11:$'+LC+'$11';
 Fn('A5','$B$2',r.advance,ST.num);N('B5',1,ST.num);S('C5',r.cfg.person.first,ST.txt);S('D5',r.cfg.person.last,ST.txt);
 Fn('E5','('+r.cfg.budget+'/$D$2)*F5',r6(r.budget),ST.num);N('F5',n,ST.num);
 Fn('G5','COUNTIF('+R11+',"Sun"&CHAR(10)&"អាទិត្យ")',c.sun,ST.num);
 Fn('H5','COUNTIF('+R9+',"Hol")+COUNTIF('+R9+',"Off")',c.hol+c.off,ST.num);
 Fn('I5','COUNTIF('+R9+',"Shut")',c.shut,ST.num);
 Fn('J5','COUNTIF('+R9+',"AL")+COUNTIF('+R9+',"Skip")',c.al+c.skip,ST.num);
 N('K5',r.cfg.baseDays,ST.num);
 Fn('L5','F5-G5-H5-I5-J5+AA5',c.bill,ST.num);
 Fn('M5','E5/K5/'+r.cfg.divisor,r6(r.unit),ST.dec6);
 var ml=r.cfg.meals||{l:1};
 if(ml.b)N('N5',1,ST.num);else E('N5',ST.num);if(ml.l)N('O5',1,ST.num);else E('O5',ST.num);if(ml.d)N('P5',1,ST.num);else E('P5',ST.num);
 Fn('Q5','SUM(N5:P5)',r.meals,ST.num);Fn('R5','Q5*M5',r6(r.perDay),ST.dec6);
 Fn('S5',TC+'12',r.total,ST.num);
 if(r.extra)N('U5',r.extra,ST.num);else E('U5',ST.num);
 Fn('T5','ROUND(S5*M5,0)+IF(U5="",0,U5)',r.charge,ST.int);Fn('V5','T5',r.charge,ST.due);Fn('W5','A5-V5',r.refund,ST.int);
 var lv=(r.cfg.leaves||[]).filter(function(l){return l.from<=r.ym+'-31'&&l.to>=r.ym+'-01';})[0];
 if(lv){var a=lv.from.split('-').map(Number),b=lv.to.split('-').map(Number);N('X5',serial(a[0],a[1],a[2]),ST.ymd);N('Y5',serial(b[0],b[1],b[2]),ST.ymd);Fn('Z5','IF(X5="","",Y5-X5+1)',serial(b[0],b[1],b[2])-serial(a[0],a[1],a[2])+1,ST.num);}
 else{E('X5',ST.ymd);E('Y5',ST.ymd);Fs('Z5','IF(X5="","",Y5-X5+1)','',ST.num);}
 N('AA5',0,ST.num);
 Fn('A6','SUM(A5:A5)',r.advance,ST.bold);['Q','S','T','U','V','W'].forEach(function(k){var v={Q:r.meals,S:r.total,T:r.charge,U:r.extra||0,V:r.charge,W:r.refund}[k];Fn(k+'6','SUM('+k+'5:'+k+'5)',v,ST.bold);});
 S('U8','Total / សរុប',ST.bold);Fn('V8','V6',r.charge,ST.due);Fn('W8','V6+W6',r.charge+r.refund,ST.int);
 /* 第 9–14 列：每日表 */
 S('B9','Hol = public holiday · Off = company day off (swap) · AL = leave / away · Shut = shutdown · Skip = no meal\nHol = ថ្ងៃបុណ្យជាតិ · Off = ថ្ងៃឈប់ក្រុមហ៊ុន · AL = ច្បាប់ · Shut = ផ្អាកការងារ · Skip = មិនបានញ៉ាំ',ST.leg);M('B9','D9');
 S('C10','NAME / ឈ្មោះ',ST.name);E('D10',ST.name);M('C10','D10');S('C11','Weekday / ថ្ងៃ',ST.txt);E('D11',ST.txt);M('C11','D11');
 var gridSum=[];
 r.list.forEach(function(x,i){var L=col(first+i);
  if(x.mark&&x.mark!=='Sun')S(L+'9',x.mark,ST.mark);else if(x.swapWork)S(L+'9','Work',ST.leg);
  N(L+'10',serial(r.y,r.m,x.d),ST.date);
  Fs(L+'11','TEXT('+L+'10,"ddd")&CHAR(10)&CHOOSE(WEEKDAY('+L+'10,1),"អាទិត្យ","ចន្ទ","អង្គារ","ពុធ","ព្រហស្បតិ៍","សុក្រ","សៅរ៍")',DAYS_EN[x.dow]+'\n'+DAYS_KM[x.dow],ST.wday);
  var f='IF(OR('+L+'$9="Hol",'+L+'$9="Off",'+L+'$9="AL",'+L+'$9="Shut",'+L+'$9="Skip",LEFT('+L+'$11,3)="Sun"),"",$Q5)';
  if(x.meals)Fn(L+'12',f,x.meals,ST.grid);else Fs(L+'12',f,'',ST.gridOff);
  Fn(L+'13','SUM('+L+'12:'+L+'12)',x.meals,x.meals?ST.grid:ST.gridOff);
  if(x.meals)Fn(L+'14','IF('+L+'13=0,"",1)',1,ST.grid);else Fs(L+'14','IF('+L+'13=0,"",1)','',ST.gridOff);
  gridSum.push(x.meals);});
 S(TC+'10','Meals / ពេល',ST.tot);S(TC+'11','total',ST.tot);
 N('B12',1,ST.num);Fs('C12','C5',r.cfg.person.first,ST.txt);Fs('D12','D5',r.cfg.person.last,ST.txt);
 Fn(TC+'12','SUM('+col(first)+'12:'+LC+'12)',r.total,ST.tot);
 S('C13','Daily total / សរុប',ST.txt);E('D13',ST.txt);M('C13','D13');Fn(TC+'13','SUM('+col(first)+'13:'+LC+'13)',r.total,ST.tot);
 S('C14','Days eaten / ថ្ងៃមានអាហារ',ST.txt);E('D14',ST.txt);M('C14','D14');Fn(TC+'14','SUM('+col(first)+'14:'+LC+'14)',c.bill,ST.tot);
 /* 第 16–25 列：說明區（英／高棉） */
 var MW=mealWord(r,'en').toUpperCase(),MWk=mealWord(r,'km');
 S('B16','VRT CANTEEN | '+Mn.toUpperCase()+' '+r.y+' MEAL COST SUMMARY ('+(MW==='LUNCH'?'LUNCH ONLY':MW)+')\nសេចក្តីសង្ខេបថ្លៃអាហារ VRT | ខែ'+Mk+' '+km(r.y)+(MW==='LUNCH'?' (អាហារថ្ងៃត្រង់តែប៉ុណ្ណោះ)':''),ST.title);M('B16','W16');
 function row(i,lab,ref,v,st,note){S('B'+i,lab,ST.lab);M('B'+i,'G'+i);Fn('H'+i,ref,v,st);M('H'+i,'J'+i);S('K'+i,note,ST.note);M('K'+i,'W'+i);}
 var parts=[r.days+' days','− '+c.sun+' Sundays'],partsK=[km(r.days)+' ថ្ងៃ','− '+km(c.sun)+' ថ្ងៃអាទិត្យ'];
 parts.push('− '+c.hol+' public holiday'+(c.hol===1?'':'s'));partsK.push('− '+km(c.hol)+' ថ្ងៃឈប់សម្រាកជាតិ');
 if(c.off){parts.push('− '+c.off+' company day off');partsK.push('− '+km(c.off)+' ថ្ងៃឈប់ក្រុមហ៊ុន');}
 if(c.shut){parts.push('− '+c.shut+' shutdown');partsK.push('− '+km(c.shut)+' ថ្ងៃផ្អាកការងារ');}
 if(c.al){parts.push('− '+c.al+' leave / away');partsK.push('− '+km(c.al)+' ថ្ងៃច្បាប់');}
 if(c.skip){parts.push('− '+c.skip+' no meal');partsK.push('− '+km(c.skip)+' ថ្ងៃមិនបានញ៉ាំ');}
 row(17,'Monthly meal budget (US$)\nថ្លៃអាហារប្រចាំខែ (ដុល្លារ)','E5',r6(r.budget),ST.usd,'US$'+r.cfg.budget+' per month.\n'+km(r.cfg.budget)+' ដុល្លារក្នុងមួយខែ។');
 row(18,(MW==='LUNCH'?'Lunch cost per meal (US$)\nតម្លៃអាហារថ្ងៃត្រង់មួយពេល (ដុល្លារ)':'Cost per meal (US$)\nតម្លៃអាហារមួយពេល (ដុល្លារ)'),'M5',r6(r.unit),ST.usd6,'US$'+r.cfg.budget+' ÷ '+r.cfg.baseDays+' base workdays ÷ '+r.cfg.divisor+' meals per day.\n'+km(r.cfg.budget)+' ដុល្លារ ÷ '+km(r.cfg.baseDays)+' ថ្ងៃធ្វើការគោល ÷ អាហារ '+km(r.cfg.divisor)+' ពេលក្នុងមួយថ្ងៃ។');
 row(19,(MW==='LUNCH'?'Billable lunch days\nចំនួនថ្ងៃគិតថ្លៃអាហារថ្ងៃត្រង់':'Billable meals\nចំនួនអាហារគិតថ្លៃ'),'S5',r.total,ST.val,parts.join(' ')+'.\n'+partsK.join(' ')+'។');
 row(20,Mn+' meal charge (US$)\nថ្លៃអាហារខែ'+Mk+' (ដុល្លារ)','V5',r.charge,ST.usd,r.total+' '+(MW==='LUNCH'?'lunches':'meals')+' × US$'+r.unit.toFixed(6)+'; rounded to whole USD as in the original file.'+(r.extra?' Plus extra US$'+r.extra+'.':'')+'\n'+(MW==='LUNCH'?'អាហារថ្ងៃត្រង់ ':'អាហារ ')+km(r.total)+' ពេល × '+km(r.unit.toFixed(6))+' ដុល្លារ; បង្គត់ជាដុល្លារគត់ដូចឯកសារដើម។');
 row(21,'Refund if US$'+r.advance+' prepaid (US$)\nប្រាក់សងវិញ បើបានបង់មុន '+km(r.advance)+' ដុល្លារ','W5',r.refund,ST.usd,'US$'+r.advance+' advance payment less '+Mn+"'s meal charge.\nប្រាក់បង់មុន "+km(r.advance)+' ដុល្លារ ដកថ្លៃអាហារខែ'+Mk+'។');
 S('B22','Refund in cash notes\nប្រាក់សងវិញជាក្រដាសប្រាក់',ST.lab);M('B22','G22');S('H22',r.cash.map(function(x){return x.n+' × $'+x.d;}).join(', ')||'—',ST.val);M('H22','J22');
 S('K22','Suggested notes for the US$'+r.refund+' refund.\nក្រដាសប្រាក់សម្រាប់សងវិញ '+km(r.refund)+' ដុល្លារ។',ST.note);M('K22','W22');
 var nb=nonBillText(r);S('B23',nb.en+'\n'+nb.km,ST.foot);M('B23','W23');
 var ass='Assumption: one '+mealWord(r,'en')+' on each billable workday'+(c.al?'; no meals during the leave / away period':'')+'. Adjust the daily row (row 12) if the actual meals differ.',
     assK='សន្មត់ថា ទទួលទាន'+MWk+'មួយពេលក្នុងមួយថ្ងៃធ្វើការដែលគិតថ្លៃ'+(c.al?' និងមិនមានអាហារក្នុងអំឡុងពេលច្បាប់':'')+'។ អាចកែជួរទី ១២ តាមការពិត។';
 S('B24',ass+'\n'+assK,ST.foot);M('B24','W24');
 S('B25','Public holiday source / ប្រភពថ្ងៃឈប់សម្រាកជាតិ៖ https://www.nbc.gov.kh/english/news_and_events/official_holiday.php',ST.foot);M('B25','W25');
 /* 組 XML */
 var keys=Object.keys(rows).map(Number).sort(function(a,b){return a-b;});
 function cidx(s){var n=0;for(var i=0;i<s.length;i++)n=n*26+(s.charCodeAt(i)-64);return n;}
 var body=keys.map(function(k){var cs=rows[k].sort(function(a,b){return cidx(a.c)-cidx(b.c);});return '<row r="'+k+'"'+(hts[k]?' ht="'+hts[k]+'" customHeight="1"':'')+'>'+cs.map(function(x){return x.x;}).join('')+'</row>';}).join('');
 var cols='<cols><col min="1" max="2" width="10" customWidth="1"/><col min="3" max="3" width="13" customWidth="1"/><col min="4" max="4" width="9" customWidth="1"/><col min="5" max="'+(last+1)+'" width="11" customWidth="1"/></cols>';
 return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'+
  '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" zoomScale="90"/></sheetViews><sheetFormatPr defaultRowHeight="15"/>'+cols+'<sheetData>'+body+'</sheetData>'+
  '<mergeCells count="'+merges.length+'">'+merges.map(function(x){return '<mergeCell ref="'+x+'"/>';}).join('')+'</mergeCells>'+
  '<pageMargins left="0.3" right="0.3" top="0.4" bottom="0.4" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
}
function xlsxFiles(cfg,ym){
 var r=calc(cfg,ym),name=MON_EN[r.m-1].slice(0,3)+' '+r.y;
 return {result:r,filename:'VRT_Canteen_Cost_'+MON_EN[r.m-1].slice(0,3)+'_'+r.y+'_EN_KM.xlsx',files:{
  '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>',
  '_rels/.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>',
  'docProps/core.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>VRT Canteen Cost '+xe(name)+'</dc:title><dc:creator>VRT Admin Center</dc:creator></cp:coreProperties>',
  'docProps/app.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>VRT Admin Center</Application></Properties>',
  'xl/workbook.xml':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="'+xe(name)+'" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>',
  'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
  'xl/styles.xml':stylesXml(),
  'xl/worksheets/sheet1.xml':sheetXml(r)}};
}
var API={defaults:defaults,calc:calc,caption:caption,xlsxFiles:xlsxFiles,nextYm:nextYm,nonBillText:nonBillText,HOLIDAYS:HOLIDAYS,MON_EN:MON_EN,MON_ZH:MON_ZH,MON_KM:MON_KM,DAYS_EN:DAYS_EN,iso:iso,dim:dim,dow:dow};
if(typeof module!=='undefined'&&module.exports)module.exports=API;else root.VRTCanteen=API;
})(this);
