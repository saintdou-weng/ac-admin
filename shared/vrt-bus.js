/* VRT 同步通知 vrt-bus.js v1（2026-11-22）
   Paul：來源平台更新 → 自動通知下游平台；下游下載不回頭通知來源。
   單向對應（只往下）：
     HRA-PAY、HRA Portal、Audit       → PSJHR（＋Admin OS）
     GASCheck、SEC、GA-EXP            → PSJGA（＋Admin OS）
     生產系統（vrt-prod）             → PSJERP（＋Admin OS）
   做法（不改任何平台原本的同步程式，只是在對的時間「按一下它自己的同步」）：
   1 同一台裝置：來源平台上傳成功（POST 到雲端且回應正常）→ 留一個記號（localStorage＋BroadcastChannel）
     → 開著的下游頁（含 Admin OS 裡的分頁）收到後自動跑自己的同步，只下載有變的部分。
   2 跨裝置／別人更新：下游頁開著時每 15 分鐘、切回畫面時，自己跑一次同步（原本就只抓有變的）。
   3 共用紀錄 vrt_sync_ledger_v1：每個下游同步完記下時間；Admin OS「全部更新」看到 3 分鐘內已同步的就跳過。
   安全：正在打字／開著對話框時不自動同步（稍後再試）；下游不會發出通知；PSJHR 只聽 HR 來源，看不到其他部門。
   由 swipe-tabs.js（每個平台都有載）順帶載入；這支壞掉也不影響平台原本功能。 */
(function(G){
'use strict';
if(G.VRTBus)return;
if(/[?&]card=1\b/.test(location.search)){G.VRTBus={role:null,me:null,ledger:function(){return {};},syncNow:function(){return Promise.resolve('n/a');}};return;}   /* Admin OS 員工卡小視窗：不參與同步 */
var P=(location.pathname||'').toLowerCase();
var SRC={'/ac-hra-pay/':'hrpay','/ac-hra-portal/':'hraportal','/ac-gascheck/':'gascheck','/ac-gas-sec/':'sec','/ac-ga-exp/':'gaexp','/ac-audit/':'audit','/vrt-prod/':'prod'};
var CONS={
 '/psjhr/':{name:'psjhr',listen:['hrpay','hraportal','audit'],run:function(force){var jobs=[];
   try{if(typeof G.cloudReady==='function'&&G.cloudReady()&&typeof G.cloudSync==='function')jobs.push(G.cloudSync(false));}catch(e){}
   try{if(force&&typeof G.hpEnsureAll==='function'){try{if(typeof HP!=='undefined'&&HP&&HP.man)HP.man={};}catch(x){}jobs.push(G.hpEnsureAll(true));}}catch(e){}
   return Promise.all(jobs);}},
 '/psjerp/':{name:'psjerp',listen:['prod'],run:function(){try{if(typeof G.cloudReady==='function'&&G.cloudReady()&&typeof G.cloudSync==='function')return G.cloudSync(false);}catch(e){}return Promise.resolve();}},
 '/psjgas/':{name:'psjga',listen:['gascheck','sec','gaexp'],run:function(force){
   /* PSJGA 的程式是封閉模組：只有畫面上已經有「更新資料」鈕（＝已連線）時才按它，沒連線就不碰，避免跳出設定視窗 */
   if(!force)return Promise.resolve();var b=document.querySelector('[data-action="source-refresh"]:not([disabled])');if(b)b.click();return Promise.resolve();}}
};
var role=null,me=null;Object.keys(SRC).forEach(function(k){if(P.indexOf(k)===0)role='src',me=SRC[k];});
var cons=null;Object.keys(CONS).forEach(function(k){if(P.indexOf(k)===0)cons=CONS[k];});if(cons){role='cons';me=cons.name;}
if(P.indexOf('/ac-admin/')===0&&!/\/apps\//.test(P))role='admin',me='admin';
var BUS='vrt_bus_v1',LED='vrt_sync_ledger_v1';
var ch=null;try{ch=new BroadcastChannel('vrt-bus');}catch(e){}
function jget(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;}}
function jput(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function ledger(){return jget(LED,{});}
function mark(name,ok){var L=ledger();L[name]={at:Date.now(),ok:ok!==false};jput(LED,L);}
var api={role:role,me:me,ledger:ledger,syncNow:function(){return Promise.resolve('n/a');}};
G.VRTBus=api;
if(!role)return;

/* ── 來源：上傳成功才發通知（每 30 秒最多一次） ── */
if(role==='src'&&G.fetch){
 var lastPub=0,WRITE=/put|save|upload|commit|import|push|set|write|add|update|delete|remove|submit|approve|reject|merge|sync|send|record|append|edit/i;
 var pub=function(){var now=Date.now();if(now-lastPub<30000)return;lastPub=now;var m={src:me,at:now};jput(BUS,m);try{ch&&ch.postMessage(m);}catch(e){}};
 var of=G.fetch;
 G.fetch=function(input,init){var p=of.apply(this,arguments);try{
   var url=typeof input==='string'?input:(input&&input.url)||'',method=((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
   if(method==='POST'&&/script\.google(usercontent)?\.com/.test(url)){var body=init&&init.body,isW=typeof body!=='string'||WRITE.test(body.slice(0,400));
    if(isW)p.then(function(r){if(r&&r.ok)setTimeout(pub,1500);}).catch(function(){});}}catch(e){}return p;};
}

/* ── 下游：收到來源通知／每 15 分鐘／切回畫面 → 跑自己的同步 ── */
if(role==='cons'){
 var running=false,last=0,retry=0;
 var editing=function(){var a=document.activeElement;if(a&&(/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)||a.isContentEditable)&&a.type!=='checkbox'&&a.type!=='radio'&&a.type!=='button')return true;
   if(document.querySelector('dialog[open],.modal.open,.drawer.open,.modal.on,#modal.on'))return true;return false;};
 var run=function(force,why){
   if(running)return Promise.resolve('busy');
   if(!force&&Date.now()-last<3*60*1000)return Promise.resolve('recent');
   if(editing()&&why!=='admin'){clearTimeout(retry);retry=setTimeout(function(){run(force,why);},60000);return Promise.resolve('editing');}
   running=true;last=Date.now();
   return Promise.resolve().then(function(){return cons.run(force);}).then(function(){mark(me,true);return 'ok';},function(){mark(me,false);return 'err';}).then(function(r){running=false;return r;});
 };
 api.syncNow=function(){return run(true,'admin');};
 var onMsg=function(m){if(!m||cons.listen.indexOf(m.src)<0)return;if(document.hidden){api._pending=true;return;}setTimeout(function(){run(true,'bus');},800);};
 try{ch&&ch.addEventListener('message',function(e){onMsg(e.data);});}catch(e){}
 G.addEventListener('storage',function(e){if(e.key===BUS&&e.newValue&&!ch){try{onMsg(JSON.parse(e.newValue));}catch(x){}}});
 document.addEventListener('visibilitychange',function(){if(document.hidden)return;if(api._pending){api._pending=false;run(true,'bus');}else run(false,'vis');});
 setInterval(function(){if(!document.hidden)run(false,'timer');},15*60*1000);
}
})(window);
