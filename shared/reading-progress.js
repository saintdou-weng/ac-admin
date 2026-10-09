(function(){'use strict';
 const script=document.currentScript,base=new URL('../',script.src),category=script.dataset.category||'';
 function init(){
  const R=window.ACReading;if(!R)return;
  const path=R.id(location.href);if(!path.startsWith('apps/'))return;
  let old=R.get(path),restoring=true,timer,record=old||{schema:1,path,title:document.title,category,status:'reading',y:0,updated:Date.now()},dirty=false;
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('shared/reading-ui.css',base);document.head.append(css);
  const dock=document.createElement('nav');dock.id='ac-reading-dock';dock.setAttribute('aria-label','閱讀導覽');
  const home=document.createElement('a');home.textContent='⌂ 首頁';home.href=new URL('index.html',base);
  const library=document.createElement('a');library.textContent='📚 換課';library.href=new URL('index.html?view=learning'+(category?'&category='+category:''),base);
  const top=document.createElement('button');top.textContent='↑ 頂端';top.type='button';top.onclick=()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});for(const el of document.querySelectorAll('main,#app,.app'))if(el.scrollTop)el.scrollTo({top:0,behavior:'instant'});};
  const more=document.createElement('button');more.type='button';more.textContent='閱讀紀錄';more.onclick=()=>details.showModal();dock.append(home,library,top,more);document.body.append(dock);const fit=()=>document.documentElement.style.setProperty('--ac-reading-height',dock.getBoundingClientRect().height+'px');new ResizeObserver(fit).observe(dock);fit();let pagerHeight=0;for(const pager of document.querySelectorAll('.pager')){if(getComputedStyle(pager).position==='fixed'&&getComputedStyle(pager).bottom==='0px'){pager.style.bottom='var(--ac-reading-height,58px)';pagerHeight=Math.max(pagerHeight,pager.getBoundingClientRect().height);}}document.documentElement.style.setProperty('--ac-native-pager-height',pagerHeight+'px');
  const details=document.createElement('dialog');details.id='ac-reading-details';details.innerHTML='<form method="dialog"><button class="ac-read-close" aria-label="關閉">×</button><h2>閱讀紀錄</h2><p class="ac-reading-status" role="status"></p><p>進度保存於目前瀏覽器；章節位置不等於測驗成績。可在學習首頁匯出備份，換裝置時再匯入。</p></form>';
  const complete=document.createElement('button');complete.type='button';complete.textContent=record.status==='completed'?'重新開始閱讀':'標記整課已完成';complete.onclick=()=>{record.status=record.status==='completed'?'reading':'completed';dirty=true;save();complete.textContent=record.status==='completed'?'重新開始閱讀':'標記整課已完成';};details.append(complete);document.body.append(details);
  const status=details.querySelector('.ac-reading-status');
  const chapters=()=>[...document.querySelectorAll('section.lesson,article.lesson,section.chapter,section.ch,section.unit,section.page')].filter(el=>!el.closest('#ac-reading-details'));
  function position(){const visible=chapters().filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden');return visible.find(el=>el.getBoundingClientRect().bottom>80)||visible.at(-1);}
  function save(){if(restoring||!dirty)return;const el=position(),parts=chapters();const headings=[...document.querySelectorAll('main h1,main h2,main h3,.lesson h1,.lesson h2,.lesson h3,.chapter h2,.ch h2,#heroTitle')];headings.forEach((h,i)=>{if(!h.id)h.id='ac-reading-anchor-'+i;});const anchor=headings.filter(h=>h.getClientRects().length&&h.getBoundingClientRect().top<=100).at(-1);const raw=window.AC_COURSE_POSITION;
   const heading=el?.querySelector('h1,h2,h3')||document.querySelector('main h1,#heroTitle,.lesson-h h1,main h2');
   record={...record,schema:1,path,title:document.title,category:category||record.category||'',updated:Date.now(),y:Math.max(0,window.scrollY),anchor:anchor?{id:anchor.id,offset:100-anchor.getBoundingClientRect().top}:null,hash:location.hash,section:el?.id||'',chapter:el?.dataset.title||heading?.textContent.trim().slice(0,160)||'',chapterIndex:el?parts.indexOf(el)+1:0,total:parts.length,containers:[...document.querySelectorAll('main[id],#app,.app[id],.panel-body')].filter(el=>el.scrollHeight>el.clientHeight&&el.scrollTop>0).map(el=>({id:el.id,selector:el.classList.contains('panel-body')?'.panel-body':'',y:el.scrollTop})).slice(0,4)};
   if(typeof raw==='string'||Number.isFinite(raw))record.native=raw;
   try{R.put(record);more.textContent='閱讀紀錄';status.textContent='已儲存於本機 · '+(record.chapter||'目前頁面')+' · '+new Date(record.updated).toLocaleTimeString();dirty=false;}catch(e){status.textContent='未能保存閱讀紀錄：'+e.message;more.textContent='⚠ 未儲存';}
  }
  function queue(){if(restoring)return;dirty=true;clearTimeout(timer);timer=setTimeout(save,600);}
  // Native chapter switching stays in the course's own function; no quiz buttons are replayed.
  if(old){try{if(old.hash&&old.hash!==location.hash){history.replaceState(null,'',old.hash);window.dispatchEvent(new HashChangeEvent('hashchange'));}if(old.native!==undefined&&typeof window.AC_COURSE_GO==='function')window.AC_COURSE_GO(old.native);}catch(e){status.textContent='章節位置已變更，請從目錄確認；原閱讀紀錄保留。';}}
  const restore=()=>{if(!old)return;const headings=[...document.querySelectorAll('main h1,main h2,main h3,.lesson h1,.lesson h2,.lesson h3,.chapter h2,.ch h2,#heroTitle')];headings.forEach((h,i)=>{if(!h.id)h.id='ac-reading-anchor-'+i;});const anchor=old.anchor&&document.getElementById(old.anchor.id);const y=anchor&&anchor.getClientRects().length&&Number.isFinite(old.anchor.offset)?window.scrollY+anchor.getBoundingClientRect().top+old.anchor.offset-100:old.y;window.scrollTo(0,Math.max(0,y));for(const c of old.containers||[]){const el=c.id?document.getElementById(c.id):c.selector==='.panel-body'?document.querySelector('.panel-body'):null;if(el&&Number.isFinite(c.y)&&c.y>=0)el.scrollTop=c.y;}};
  requestAnimationFrame(()=>{restore();requestAnimationFrame(()=>{restoring=false;if(!old){dirty=true;save();}status.textContent=old?'已續讀 · '+(old.chapter||'上次位置'):'開始閱讀後會自動保存位置';});});
  document.addEventListener('scroll',queue,true);document.addEventListener('click',e=>{if(!e.target.closest('#ac-reading-dock,#ac-reading-details,#ac-module-toolbar'))queue();});
  window.addEventListener('hashchange',queue);window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
  // Chapter mutations may follow a next-button action asynchronously.
  new MutationObserver(ms=>{if(ms.some(m=>m.target.matches?.('section.lesson,article.lesson,section.chapter,section.ch,section.unit,section.page')))queue();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
