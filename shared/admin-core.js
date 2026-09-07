/* AC Admin Center 1.2 · local preferences and revision-checked cloud documents */
(function(root){'use strict';
 const A=root.Admin={};
 A.get=(k,f=null)=>{try{const v=localStorage.getItem(k);return v===null?f:JSON.parse(v)}catch(e){return f}};
 A.put=(k,v)=>{localStorage.setItem(k,JSON.stringify(v));return v};
 A.lang=()=>A.get('ac_admin_lang','zh');
 A.l=(zh,en,km)=>({zh,en,km})[A.lang()]||zh;
 A.text=x=>typeof x==='object'?(x[A.lang()]||x.en||x.zh||''):String(x??'');
 A.escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 A.id=()=>root.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 A.gas=u=>/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(String(u||''));
 A.url=u=>{try{const x=new URL(u,location.href);return ['https:','http:','file:'].includes(x.protocol)&&!x.username&&!x.password?x.href:''}catch(e){return ''}};
 A.download=(name,data,type='application/json')=>{const b=new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500)};
 A.toast=(message,error=false)=>{let e=document.getElementById('ac-toast');if(!e){e=document.createElement('div');e.id='ac-toast';e.setAttribute('role','status');document.body.append(e)}e.textContent=message;e.className=error?'error':'';e.hidden=false;clearTimeout(A.toastTimer);A.toastTimer=setTimeout(()=>{e.hidden=true},6500)};
 A.today=()=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Phnom_Penh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return p.year+'-'+p.month+'-'+p.day};
 A.json=async(url,options={})=>{const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),15000);try{const r=await fetch(url,{...options,signal:ctrl.signal,redirect:'follow'});if(!r.ok)throw new Error('HTTP '+r.status);const raw=await r.text();let d;try{d=JSON.parse(raw)}catch(e){throw new Error(A.l('回傳的是網頁或無效資料，請檢查部署權限。','Response is not JSON; check deployment access.','ទិន្នន័យឆ្លើយតបមិនត្រឹមត្រូវ។'))}if(!d||typeof d!=='object'||Array.isArray(d))throw new Error('Invalid response');if(d.ok===false||d.success===false||d.error)throw new Error(String(d.error||d.message||'Request rejected'));return d}finally{clearTimeout(timer)}};
 A.hubConfig=()=>{
  const own=A.get('ac_admin_cloud_config',{}),legacy=A.get('ac_admin_hub',{}),old=A.get('ac_admin_config',{});
  return {url:own.url||legacy.url||old.gasUrl||root.AC_CONFIG?.hubUrl||''};
 };
 A.key=()=>''; // Compatibility shim: no manually entered key in v1.2.
 A.session=()=>{try{const d=JSON.parse(sessionStorage.getItem('ac_admin_session')||'null');return d&&d.expiresAt>Date.now()+30000&&d.url===A.hubConfig().url?d:null}catch(e){return null}};
 A.ensureAuth=()=>{
  if(A.session())return Promise.resolve(A.session().token);
  if(A.authPending)return A.authPending;
  const h=A.hubConfig();if(!A.gas(h.url))return Promise.reject(new Error(A.l('行政中心網址無效，請重新上傳 config.js。','Invalid Admin Center URL; re-upload config.js.','URL មិនត្រឹមត្រូវ។')));
  const nonce=Array.from(root.crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join(''),u=new URL(h.url);u.searchParams.set('action','connect');u.searchParams.set('nonce',nonce);
  const win=root.open(u.href,'ac-admin-connect','width=460,height=660');
  if(!win)return Promise.reject(new Error(A.l('請允許此網站開啟連線視窗，再按一次雲端按鈕。','Allow the connection popup, then press the cloud button again.','សូមអនុញ្ញាតផ្ទាំងតភ្ជាប់។')));
  A.put('ac_admin_auth_request',{nonce,createdAt:Date.now(),url:h.url});
  A.toast(A.l('正在使用你的 Google 帳號連線，無需輸入網址或存取碼。','Connecting with your Google account; no URL or access key entry.','កំពុងភ្ជាប់គណនី Google។'));
  A.authPending=new Promise((resolve,reject)=>{
   let settled=false;
   const finish=(err,token)=>{if(settled)return;settled=true;root.removeEventListener('storage',listen);root.clearInterval(poll);clearTimeout(timer);A.authPending=null;try{win.close()}catch(e){};if(err)reject(err);else resolve(token)};
   const consume=async()=>{const r=A.get('ac_admin_auth_result');if(!r||r.nonce!==nonce||r.url!==h.url)return;
    localStorage.removeItem('ac_admin_auth_result');
    try{const d=await A.json(h.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'exchangeGrant',nonce,grant:r.grant})});
     if(!d.token||!d.expiresAt)throw new Error('Invalid connection response');sessionStorage.setItem('ac_admin_session',JSON.stringify({token:d.token,expiresAt:d.expiresAt,url:h.url}));localStorage.removeItem('ac_admin_auth_request');finish(null,d.token);
    }catch(e){finish(e)}
   };
   const listen=e=>{if(e.key==='ac_admin_auth_result')consume()};root.addEventListener('storage',listen);
   const poll=setInterval(consume,800),timer=setTimeout(()=>finish(new Error(A.l('連線尚未完成；請使用部署 GAS 的同一個 Google 帳號再試。','Connection not completed. Retry with the Google account that deployed GAS.','សូមប្រើគណនី Google ដែលបានដាក់ប្រើ GAS។'))),180000);
  });return A.authPending;
 };
 A.cloud=async(action,payload={})=>{const token=await A.ensureAuth(),h=A.hubConfig();try{return await A.json(h.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({...payload,action,session:token})})}catch(e){if(String(e.message).includes('AUTH_REQUIRED'))sessionStorage.removeItem('ac_admin_session');throw e}};
 A.validateBudget=r=>{if(!r||typeof r!=='object')throw new Error('Invalid row');const y=Number(r.year),m=Number(r.month),b=Number(r.budget),a=Number(r.actual);if(!Number.isInteger(y)||y<1900||y>2200||!Number.isInteger(m)||m<1||m>12||!Number.isFinite(b)||!Number.isFinite(a)||b<0||a<0||!String(r.category||'').trim()||!String(r.department||'').trim())throw new Error(A.l('年份、月份、類別、部門或金額不正確。','Invalid year, month, category, department or amount.','ឆ្នាំ ខែ ប្រភេទ ផ្នែក ឬចំនួនទឹកប្រាក់មិនត្រឹមត្រូវ។'));return{id:String(r.id||A.id()),year:y,month:String(m).padStart(2,'0'),category:String(r.category).trim(),department:String(r.department).trim(),budget:b,actual:a,note:String(r.note||'')}};
 A.budgetKey=r=>[r.year,String(r.month).padStart(2,'0'),r.category.trim().toLowerCase(),r.department.trim().toLowerCase()].join('|');
 A.mergeBudget=(current,incoming)=>{const rows=current.map(A.validateBudget),keys=new Map();rows.forEach((r,i)=>{const k=A.budgetKey(r);keys.set(k,keys.has(k)?-1:i)});let added=0,changed=0,unchanged=0;const seen=new Set();for(const source of incoming){const n=A.validateBudget(source),k=A.budgetKey(n);if(seen.has(k))throw new Error(A.l('匯入檔有重複的年月／類別／部門，請先整理。','Duplicate year/month/category/department in import.','មានជួរស្ទួនក្នុងឯកសារនាំចូល។'));seen.add(k);if(keys.get(k)===-1)throw new Error(A.l('本機同項有多筆資料，請先合併後再匯入。','Multiple local rows match this item; resolve duplicates first.','សូមកែជួរស្ទួនជាមុន។'));if(keys.has(k)){const i=keys.get(k),old=rows[i];n.id=old.id;if(n.budget===old.budget&&n.actual===old.actual&&n.note===old.note)unchanged++;else{rows[i]=n;changed++}}else{n.id=A.id();keys.set(k,rows.length);rows.push(n);added++}}return{rows,added,changed,unchanged}};
 A.classify=(d,p)=>{if(!d||d.ok===false||d.error||d.success===false)return 'error';const name=String(d.app||d.platform||d.appName||'').toLowerCase();if(name&&p.identity&&!p.identity.some(x=>name.includes(x.toLowerCase())))return 'mismatch';return d.ok===true||d.success===true||d.version||d.meta||d.modules||d.snapshots?'readable':'unknown'};
 A.dialog=(id)=>{const d=document.getElementById(id);d.showModal();d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}},{once:true})};
})(typeof window==='undefined'?globalThis:window);
