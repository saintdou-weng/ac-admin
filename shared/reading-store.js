(function(){'use strict';
 const prefix='ac_reading_v1:';
 const id=url=>{const u=new URL(url,location.href),i=u.pathname.indexOf('/apps/');return i>=0?u.pathname.slice(i+1):u.pathname;};
 function valid(v){return v&&v.schema===1&&typeof v.path==='string'&&/^apps\/(admin|learning|personal|courses)\/[A-Za-z0-9_-]+\.html$/.test(v.path)&&typeof v.title==='string'&&Number.isFinite(v.updated)&&v.updated>0&&Number.isFinite(v.y)&&v.y>=0&&['reading','completed','paused'].includes(v.status)&&(!v.hash||(typeof v.hash==='string'&&v.hash.startsWith('#')&&v.hash.length<300))&&(v.native===undefined||typeof v.native==='string'||Number.isFinite(v.native));}
 function all(){const out=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(!k.startsWith(prefix))continue;try{const v=JSON.parse(localStorage.getItem(k));if(valid(v))out.push(v);}catch(e){}}return out.sort((a,b)=>b.updated-a.updated);}
 function get(path){try{const v=JSON.parse(localStorage.getItem(prefix+path));return valid(v)?v:null;}catch(e){return null;}}
 function put(v){if(!valid(v))throw Error('閱讀紀錄格式不正確');localStorage.setItem(prefix+v.path,JSON.stringify(v));window.dispatchEvent(new Event('ac-reading-changed'));}
 window.ACReading={id,valid,all,get,put,prefix};
})();
