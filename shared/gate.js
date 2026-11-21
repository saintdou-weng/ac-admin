/* Admin OS 開門密碼（2026-11-21）：每台裝置輸入一次 admin12345，之後記住。
   只是「門鎖」：擋住隨便點進來的人；真正的機密檔案不放在這個網站（年度調薪 Excel 已移到 Google Drive 不公開資料夾）。
   放在 <head> 最前面：沒開門前整頁先藏起來，開門後才顯示。 */
(function(){
  'use strict';
  var KEY='vrt_admin_os_open',H='f065b43108b2d9766e5aff7f77a79f99575d34f6c2cb001b368686098ed75433';
  try{if(localStorage.getItem(KEY)===H)return;}catch(e){}
  var hide=document.createElement('style');hide.id='gate-hide';hide.textContent='body>*:not(#vrtGate){display:none!important}';
  (document.head||document.documentElement).appendChild(hide);
  function sha(t){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join('')})}
  function show(){
    if(document.getElementById('vrtGate'))return;
    var d=document.createElement('div');d.id='vrtGate';
    d.innerHTML='<style>#vrtGate{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:linear-gradient(135deg,#1e293b,#334155);font:15px/1.5 system-ui,-apple-system,"Noto Sans TC",sans-serif;padding:16px}#vrtGate form{background:#fff;border-radius:16px;padding:24px 22px;width:min(340px,100%);box-shadow:0 20px 50px rgba(0,0,0,.35);text-align:center}#vrtGate .lg{width:56px;height:56px;border-radius:14px;background:#2563eb;color:#fff;font-weight:800;display:grid;place-items:center;margin:0 auto 10px}#vrtGate h1{font-size:18px;margin:0 0 4px;color:#0f172a}#vrtGate p{margin:0 0 14px;color:#64748b;font-size:13px}#vrtGate input{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;margin-bottom:10px}#vrtGate button{width:100%;font:inherit;font-weight:700;padding:11px;border:0;border-radius:10px;background:#2563eb;color:#fff;cursor:pointer}#vrtGate .er{color:#b91c1c;font-size:13px;min-height:18px;margin-top:8px}</style>'+
      '<form autocomplete="off"><div class="lg">VRT</div><h1>VRT OS · 行政中心</h1><p>請輸入密碼（每台裝置一次）<br>Enter password (once per device)</p><input type="password" inputmode="text" aria-label="密碼 Password" autofocus><button type="submit">開門 / Enter</button><div class="er"></div></form>';
    document.body.appendChild(d);
    var f=d.querySelector('form'),inp=d.querySelector('input'),er=d.querySelector('.er');
    setTimeout(function(){try{inp.focus()}catch(e){}},50);
    f.onsubmit=function(e){e.preventDefault();sha('vrt-admin-os|'+inp.value.trim()).then(function(h){
      if(h===H){try{localStorage.setItem(KEY,H)}catch(e){}d.remove();var s=document.getElementById('gate-hide');if(s)s.remove();try{window.dispatchEvent(new Event('resize'))}catch(e){}}
      else{er.textContent='密碼不對，請再試一次 / Wrong password';inp.select();}
    })};
  }
  if(document.body)show();else document.addEventListener('DOMContentLoaded',show);
})();
