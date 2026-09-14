/* Admin and Telegram share the same server summary, without guessing missing figures. */
(function(){'use strict';const A=Admin,$=id=>document.getElementById(id),E=A.escape,t=(a,b,c)=>A.l(a,b,c);let snapshot=null;
function labels(){
 const b=$('summary'),label=t('查看摘要','View summary','មើលសេចក្ដីសង្ខេប');
 b.title=label;b.setAttribute('aria-label',label);b.innerHTML='<span class="action-icon" aria-hidden="true">▤</span><span class="action-label">'+E(label)+'</span>';
 $('summaryTitle').textContent=t('行政中心摘要','Admin summary','សេចក្ដីសង្ខេបរដ្ឋបាល');
 $('summaryRefresh').textContent=t('重新讀取','Refresh','ផ្ទុកឡើងវិញ');
 $('telegramPanel').textContent=t('更新群組平台選單','Update group platform menu','ធ្វើបច្ចុប្បន្នភាពម៉ឺនុយក្រុម');
 $('telegramHelp').textContent=t('群組使用 /admin、/summary、/status。接收器通常約一分鐘回覆。','Use /admin, /summary or /status in the group. The receiver usually replies within about one minute.','ប្រើ /admin, /summary ឬ /status ក្នុងក្រុម។ ជាធម្មតាឆ្លើយតបក្នុងប្រហែលមួយនាទី។');
 if(snapshot)draw();
}
function note(p){return ({linked:t('使用會計平台的薪資模組','Salary module in Accounting','ម៉ូឌុលប្រាក់ខែក្នុងគណនេយ្យ'),notConfigured:t('入口可開啟，尚無雲端摘要設定','Link available; summary endpoint not configured','អាចបើកតំណបាន តែមិនទាន់កំណត់សេចក្ដីសង្ខេប'),unavailable:t('本次無法讀取；可進入平台查看','Not available this time; open the platform','មិនអាចអានពេលនេះបាន សូមបើកវេទិកា'),connected:t('連線有回應，來源未提供業務數據','Connected; source supplies no business figures','បានភ្ជាប់ តែប្រភពមិនផ្ដល់តួលេខ'),cached:t('上次儲存的摘要','Last saved summary','សេចក្ដីសង្ខេបដែលបានរក្សាទុក'),data:t('來源回傳數據','Source figures','តួលេខពីប្រភព')})[p.state]||p.state;}
function metricLabel(m){
 const known={'資料 Records':['資料','Records','កំណត់ត្រា'],'人數 People':['人數','People','ចំនួនមនុស្ស'],'待處理 Pending':['待處理','Pending','កំពុងរង់ចាំ'],'採購單 PO':['採購單','Purchase orders','ការបញ្ជាទិញ'],'維修 Repair':['維修','Repairs','ការជួសជុល'],'年度費用 YTD':['年度費用','YTD expense','ចំណាយប្រចាំឆ្នាំ'],'出勤 Attendance':['出勤','Attendance','វត្តមាន'],'合約 Contract':['合約','Contracts','កិច្ចសន្យា'],'產假 Maternity':['產假','Maternity','ការឈប់សម្រាកសម្ភព'],'人事報表 HR':['人事報表','HR reports','របាយការណ៍ធនធានមនុស្ស'],'薪資 Payroll':['薪資','Payroll','ប្រាក់ខែ'],'預支 Advance':['預支','Advance','បុរេប្រទាន'],'伙食 Meal':['伙食','Meals','អាហារ'],'巡邏 Patrol':['巡邏','Patrol','ល្បាត'],'消防 Fire':['消防','Fire safety','អគ្គិភ័យ'],'清潔 Cleaning':['清潔','Cleaning','អនាម័យ'],'溫度 Temperature':['溫度','Temperature','សីតុណ្ហភាព'],'訂單 Orders':['訂單','Orders','ការបញ្ជាទិញ'],'車縫 Sewing':['車縫','Sewing','ដេរ'],'裁剪 Cutting':['裁剪','Cutting','កាត់'],'成品 FG':['成品','Finished goods','ទំនិញសម្រេច'],'用料 BOM':['用料','Bill of materials','បញ្ជីសម្ភារៈ'],'工時 SMV':['標準工時','Standard minutes','នាទីស្តង់ដារ'],'零件 Parts':['零件','Parts','គ្រឿងបន្លាស់']};return known[m.label]?t(...known[m.label]):m.label;
}
function metricUnit(m){return m.unit==='人'?t('人','people','នាក់'):m.unit==='筆'?t('筆','records','កំណត់ត្រា'):m.unit==='金額'?t('金額','amount','ចំនួនទឹកប្រាក់'):m.unit;}
function draw(){
 $('summaryTime').textContent=t('檢查時間：','Checked: ','ពេលពិនិត្យ៖ ')+new Date(snapshot.checkedAt).toLocaleString(A.lang()==='zh'?'zh-TW':A.lang()==='km'?'km-KH':'en-GB',{timeZone:'Asia/Phnom_Penh'})+' · UTC+7';
 $('summaryContent').innerHTML=snapshot.platforms.map(p=>{const def=AC_CONFIG.platforms.find(x=>x.id===p.id)||{},name=A.lang()==='zh'?p.label:A.lang()==='km'?def.km:p.name;return '<article class="ac-summary-row"><h3>'+E(name||p.label)+'</h3><p>'+E(note(p))+'</p>'+(p.metrics.length?'<dl>'+p.metrics.map(m=>'<div><dt>'+E(metricLabel(m))+'</dt><dd>'+E(new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(m.value))+' '+E(metricUnit(m))+'</dd></div>').join('')+'</dl><p>'+E(t('期間：','Period: ','រយៈពេល៖ ')+(p.period||t('來源未提供','Not supplied by source','ប្រភពមិនបានផ្ដល់')))+(p.cached?' · '+E(p.cachedAt||''):'')+'</p>':'')+'<a class="button" target="_blank" rel="noopener noreferrer" href="'+E(A.url(p.url))+'">'+E(t('進入平台','Open platform','បើកវេទិកា'))+' ↗</a></article>';}).join('');
 $('summaryExplanation').textContent=t('各平台數量分開顯示。無資料不代表 0、已同步或已核可；舊摘要會標示儲存時間。','Counts remain separate. Missing data does not mean zero, synced or approved. Older summaries show their saved time.','តួលេខបង្ហាញដាច់ដោយឡែក។ គ្មានទិន្នន័យមិនមានន័យថាសូន្យ បានធ្វើសមកាលកម្ម ឬបានអនុម័តទេ។');
}
async function read(){
 $('summaryRefresh').disabled=true;$('summary').disabled=true;
 try{
  const pending=A.cloud('adminSummary'); // Open the Google connection in this user gesture.
  if(!$('summaryDialog').open)A.dialog('summaryDialog');
  $('summaryTime').textContent=t('正在讀取各平台摘要…','Reading platform summaries…','កំពុងអានសេចក្ដីសង្ខេប…');
  const d=await pending;if(d.ok!==true||!Array.isArray(d.platforms)||!d.checkedAt)throw new Error(t('請更新配套 GAS 的原部署，再讀取摘要。','Update the supplied GAS in the existing deployment, then retry.','សូមធ្វើបច្ចុប្បន្នភាព GAS រួចព្យាយាមម្តងទៀត។'));
  snapshot=d;draw();
 }catch(e){$('summaryTime').textContent=t('讀取未完成：','Read incomplete: ','មិនទាន់អានរួច៖ ')+e.message;}
 finally{$('summaryRefresh').disabled=false;$('summary').disabled=false;}
}
$('summary').addEventListener('click',read);$('summaryRefresh').addEventListener('click',read);
$('telegramPanel').addEventListener('click',async()=>{const b=$('telegramPanel');if(b.disabled)return;b.disabled=true;try{const d=await A.cloud('panel');if(d.ok!==true)throw new Error('Menu update not confirmed');A.toast(t('新版平台選單已送到原群組。請使用新訊息上的按鈕。','The updated menu was sent to the original group. Use the buttons in that message.','បានផ្ញើម៉ឺនុយថ្មីទៅក្រុមដើម។ សូមប្រើប៊ូតុងថ្មី។'));}catch(e){A.toast(e.message,true);}finally{b.disabled=false;}});
$('lang').addEventListener('change',labels);labels();
// A version check is read-only and does not send a message to Telegram.
A.json(A.hubConfig().url+'?action=status').then(d=>{const ready=d.app==='AC_ADMIN_CENTER'&&parseFloat(d.version)>=1.3&&d.receiveMode==='polling';if(ready)return;$('receiverNotice').hidden=false;$('receiverNotice').textContent=t('群組接收器尚未更新完成。請依本包說明執行 installAdminCenter，並更新原 GAS 部署。','The group receiver needs updating. Run installAdminCenter and update the existing GAS deployment using this package.','សូមដំណើរការ installAdminCenter ហើយធ្វើបច្ចុប្បន្នភាព GAS ដើម។');}).catch(()=>{/* Connectivity failure is shown when the user requests a summary. */});
})();
