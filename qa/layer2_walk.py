"""第 2 層：單頁應用裡每個分頁／按鈕／彈窗逐一點開檢查。
用法：python3 layer2_walk.py config.json out.json
config = {"url":"psjhr/index.html","routes":["#dashboard",...],"scope":"#page","reset":"route()",
          "seed":"(可省) 進頁後先跑的 JS，用來塞本機測試資料","wait":2500,"skip":"(可省) 不點的按鈕文字 regex"}
本機 http.server 開在各 repo 的上一層（PORT）。所有外部連線一律攔掉（含 script.google.com），
只有 saintdou-weng.github.io/<repo>/ 對回本機檔、xlsx/chart 用本機檔。不寫雲端。
每一步檢查：JS 錯誤、字對比、橫向溢出、按了有沒有反應（DOM 變動／彈窗／下載／列印／開新頁／對話框／hash）。
"""
import asyncio, json, sys, os, re
from playwright.async_api import async_playwright
ROOT = os.environ.get('QA_ROOT', '/home/claude'); PORT = int(os.environ.get('QA_PORT', '8780'))
CFG = json.load(open(sys.argv[1])); OUT = sys.argv[2]
LIB = [(r'xlsx\.full\.min\.js', ROOT + '/ac-admin/shared/xlsx.full.min.js'),
       (r'chart(\.umd)?(\.min)?\.js', '/tmp/libs/node_modules/chart.js/dist/chart.umd.js')]
HOOK = r"""(()=>{const R=window.__qa={mut:0,open:[],print:0,dl:0,file:0,net:[],clip:0,scroll:0};
 const st=()=>{if(!document.body)return setTimeout(st,20);new MutationObserver(m=>{R.mut+=m.length}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,characterData:true})};st();
 window.open=function(u){R.open.push(String(u).slice(0,120));return {document:{write(){},close(){},open(){}},focus(){},print(){R.print++},close(){},closed:false,location:{}}};
 window.print=()=>{R.print++};
 const ac=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download||/^blob:|^data:/.test(this.href)){R.dl++;return}return ac.call(this)};
 document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('a');if(a&&(a.download||/^blob:|^data:/.test(a.href))){R.dl++;e.preventDefault()}else if(a&&a.target==='_blank'){R.open.push(a.href.slice(0,120));e.preventDefault()}else if(a&&a.href&&a.origin!==location.origin){R.open.push(a.href.slice(0,120));e.preventDefault()}else if(a&&a.href&&a.pathname!==location.pathname){R.open.push(a.href.slice(0,120));e.preventDefault()}},true);
 const ic=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(){if(this.type==='file'){R.file++;return}return ic.call(this)};
 document.addEventListener('click',e=>{const i=e.target.closest&&e.target.closest('input[type=file],label');if(i&&(i.type==='file'||(i.tagName==='LABEL'&&(i.querySelector('input[type=file]')||(i.htmlFor&&(document.getElementById(i.htmlFor)||{}).type==='file'))))){R.file++;e.preventDefault()}},true);
 const of=window.fetch;window.fetch=function(u){R.net.push(String(u&&u.url||u).slice(0,80));return of.apply(this,arguments)};
 try{navigator.clipboard.writeText=function(){R.clip++;return Promise.resolve()}}catch(e){}
 document.addEventListener('copy',()=>R.clip++,true);
 window.addEventListener('scroll',()=>R.scroll++,true);
})()"""
CHECK = r"""()=>{
 const out={};const de=document.documentElement;
 out.overflow=Math.max(de.scrollWidth,document.body?document.body.scrollWidth:0)-innerWidth;
 function rgb(s){const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}}
 function lum(c){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
 function bgOf(el){let layers=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none')return null;const c=rgb(cs.backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=.95)break}}
   let base={r:255,g:255,b:255};for(let i=layers.length-1;i>=0;i--){const c=layers[i];base={r:c.r*c.a+base.r*(1-c.a),g:c.g*c.a+base.g*(1-c.a),b:c.b*c.a+base.b*(1-c.a)}}return base}
 const low=[];let checked=0;const seen=new Set();const wide=[];
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const t=n.nodeValue.trim();if(t.length<2)continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(/^(SCRIPT|STYLE|OPTION|NOSCRIPT)$/.test(el.tagName))continue;
   const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<.3)continue;if(!el.offsetParent&&cs.position!=='fixed')continue;
   const fg=rgb(cs.color),bg=bgOf(el);if(!fg||!bg)continue;checked++;const f={r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a)};const L1=lum(f),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
   const fs=parseFloat(cs.fontSize);if(cr<3.2||(fs<11&&cr<4.5))low.push({t:t.slice(0,24),cr:+cr.toFixed(2),fs,cls:(el.className&&el.className.baseVal===undefined?String(el.className):'').slice(0,30),tag:el.tagName,fg:cs.color,bg:'rgb('+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b)+')'})}
 out.checked=checked;out.low=low;
 if(out.overflow>2){[...document.body.querySelectorAll('*')].forEach(e=>{const r=e.getBoundingClientRect();if(r.width>0&&r.right>innerWidth+2&&wide.length<6){let p=e.parentElement,clip=false;while(p&&p!==document.body){const o=getComputedStyle(p);if(/(auto|scroll|hidden|clip)/.test(o.overflowX)){clip=true;break}p=p.parentElement}if(!clip)wide.push(e.tagName+'.'+String(e.className&&e.className.baseVal===undefined?e.className:'').slice(0,30)+' r='+Math.round(r.right))}})}
 out.wide=wide;
 /* 彈窗／抽屜超出畫面 */
 out.modal=[...document.querySelectorAll('[role=dialog],.modal,#modal,.drawer,#drawer,dialog[open],.sheet,.overlay')].filter(e=>!e.hidden&&e.offsetParent!==null||getComputedStyle(e).position==='fixed'&&!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>50).map(e=>{const r=e.getBoundingClientRect();return {id:e.id||String(e.className).slice(0,20),w:Math.round(r.width),off:Math.round(Math.max(0,r.right-innerWidth,-r.left))}});
 const oc=[...document.querySelectorAll('[onclick]')].map(e=>e.getAttribute('onclick'));const miss=new Set();oc.forEach(s=>{const m=s.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);if(m&&typeof window[m[1]]==='undefined'&&!/^(if|return|event|this|location|window|document|alert|confirm|history|void)$/.test(m[1])){try{if(eval('typeof '+m[1])==='undefined')miss.add(m[1])}catch(e){miss.add(m[1])}}});out.missFn=[...miss];
 out.imgBroken=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src&&!/^data:/.test(i.src)&&i.src.startsWith(location.origin)).map(i=>i.getAttribute('src')).slice(0,5);
 out.bodyLen=(document.body.innerText||'').length;return out}"""
LIST = r"""(scope)=>{const root=document.querySelector(scope)||document.body;const els=[...root.querySelectorAll('button,[onclick],[role=button],[role=tab],summary,a[href^="#"],th[data-sort],[data-act],[data-go],[data-open],tr[data-no],[data-emp]')];
 const seen=new Set();const out=[];els.forEach((e,i)=>{if(e.disabled||e.hidden)return;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')return;
  const txt=(e.innerText||e.getAttribute('title')||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40);const sig=e.tagName+'|'+(e.id||'')+'|'+String(e.className&&e.className.baseVal===undefined?e.className:'').slice(0,40)+'|'+txt+'|'+(e.getAttribute('onclick')||'').slice(0,60)+'|'+Object.entries(e.dataset||{}).map(x=>x.join('=')).join(',').slice(0,60);
  let k=sig,c=0;while(seen.has(k)){c++;k=sig+'#'+c}seen.add(k);out.push({k,sig,dup:c,txt})});return out}"""
CLICK = r"""([scope,sig,dup])=>{const root=document.querySelector(scope)||document.body;const els=[...root.querySelectorAll('button,[onclick],[role=button],[role=tab],summary,a[href^="#"],th[data-sort],[data-act],[data-go],[data-open],tr[data-no],[data-emp]')];
 let c=0;for(const e of els){if(e.disabled||e.hidden)continue;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)continue;
  const txt=(e.innerText||e.getAttribute('title')||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40);const s=e.tagName+'|'+(e.id||'')+'|'+String(e.className&&e.className.baseVal===undefined?e.className:'').slice(0,40)+'|'+txt+'|'+(e.getAttribute('onclick')||'').slice(0,60)+'|'+Object.entries(e.dataset||{}).map(x=>x.join('=')).join(',').slice(0,60);
  if(s===sig){if(c===dup){const q=window.__qa;q.mut=0;q.open=[];q.print=0;q.dl=0;q.file=0;q.net=[];q.clip=0;q.scroll=0;q.hash=location.hash;e.scrollIntoView({block:'center'});q.scroll=0;if(typeof e.click==='function')e.click();else e.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));return true}c++}}return false}"""
FPJS = r"""()=>{let h=0;const add=s=>{for(let i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0}};
 add(document.body.innerText||'');const all=document.body.querySelectorAll('*');
 for(const e of all){if(/^(SCRIPT|STYLE)$/.test(e.tagName))continue;const c=(e.className&&e.className.baseVal===undefined?String(e.className):'').split(/\s+/).filter(x=>x&&!/ripple|^vc-|^ux-|^lg3d|press|^hd-in$|anim/i.test(x)).join(' ');add(c);if(e.hidden)add('H');if(e.open)add('O');
  if(e.tagName==='INPUT'||e.tagName==='SELECT'||e.tagName==='TEXTAREA')add(String(e.type==='checkbox'||e.type==='radio'?e.checked:e.value));if(e.style&&e.style.display)add(e.style.display);if(e.getAttribute('aria-expanded'))add(e.getAttribute('aria-expanded'))}
 add(String(document.documentElement.className)+document.documentElement.getAttribute('style')+document.body.getAttribute('style')+document.title+location.hash);return h}"""
RESP = r"""()=>{const q=window.__qa;return {mut:q.mut,open:q.open,print:q.print,dl:q.dl,file:q.file,net:q.net.length,clip:q.clip,scroll:q.scroll,hash:location.hash!==q.hash}}"""
CLOSE = CFG.get('close', r"""()=>{try{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))}catch(e){}
 ['closeModal','closeDrawer','hideModal'].forEach(f=>{try{if(typeof window[f]==='function')window[f]()}catch(e){}});
 document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}})}""")

async def main():
    res = {}
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path='/usr/bin/google-chrome')
        async def walk(rt_hash, mode, vp, sem):
            async with sem:
                ctx = await br.new_context(viewport=vp, has_touch=(mode == 'm'))
                blocked = []
                async def rt(route):
                    u = route.request.url
                    if u.startswith('http://localhost'): return await route.continue_()
                    m = re.match(r'https://saintdou-weng\.github\.io/([^/]+)/([^?#]+)', u)
                    if m:
                        f = os.path.join(ROOT, m.group(1).lower(), m.group(2))
                        if os.path.exists(f): return await route.fulfill(path=f, content_type='application/javascript' if f.endswith('.js') else None)
                    for pat, f in LIB:
                        if re.search(pat, u) and os.path.exists(f): return await route.fulfill(path=f, content_type='application/javascript')
                    if 'script.google.com' in u: blocked.append(route.request.method)
                    await route.abort()
                await ctx.route('**/*', rt); await ctx.add_init_script(HOOK)
                pg = await ctx.new_page(); errs = []; dlg = []
                pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
                pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' and 'net::' not in m.text and 'Failed to load resource' not in m.text else None)
                async def ondlg(d):
                    dlg.append(d.type + ':' + d.message[:60])
                    try: await d.dismiss()
                    except Exception: pass
                pg.on('dialog', lambda d: asyncio.ensure_future(ondlg(d)))
                steps = []
                async def load():
                    await pg.goto(f'http://localhost:{PORT}/{CFG["url"]}{rt_hash}', wait_until='domcontentloaded', timeout=40000)
                    await pg.wait_for_timeout(CFG.get('wait', 2500))
                    if CFG.get('seed'):
                        await pg.evaluate(CFG['seed']); await pg.wait_for_timeout(600)
                async def reset():
                    try:
                        await pg.evaluate(CLOSE)
                        cur = await pg.evaluate('location.hash')
                        if cur != rt_hash: await pg.evaluate('h=>{location.hash=h}', rt_hash); await pg.wait_for_timeout(200)
                        if CFG.get('reset'): await pg.evaluate(CFG['reset'])
                        await pg.wait_for_timeout(120)
                    except Exception:
                        await load()
                async def check(label, extra=None):
                    try:
                        # legible.js 是延後 0.35 秒才重算對比；先讓它跑完再量，量到的才是使用者實際看到的
                        await pg.evaluate("()=>{try{window.VRTLegible&&VRTLegible.run()}catch(e){}}")
                        o = await pg.evaluate(CHECK)
                    except Exception as e: o = {'fail': str(e)[:120]}
                    o['label'] = label; o['errs'] = list(dict.fromkeys(errs)); errs.clear()
                    if extra: o.update(extra)
                    steps.append(o)
                try:
                    await load(); await check('(首屏)')
                    items = await pg.evaluate(LIST, CFG.get('scope', 'body'))
                    skip = re.compile(CFG['skip']) if CFG.get('skip') else None
                    done = set(); queue = [(it, None) for it in items][:CFG.get('max', 140)]
                    while queue:
                        it, parent = queue.pop(0)
                        if it['k'] in done: continue
                        done.add(it['k'])
                        if skip and skip.search(it['txt']): continue
                        await reset()
                        if parent:
                            okp = await pg.evaluate(CLICK, [CFG.get('scope', 'body'), parent['sig'], parent['dup']]); await pg.wait_for_timeout(350)
                            if not okp: continue
                        dlg.clear()
                        scope = CFG.get('scope', 'body') if not it.get('glob') else 'body'
                        try: fp0 = await pg.evaluate(FPJS)
                        except Exception: fp0 = None
                        try: ok = await pg.evaluate(CLICK, [scope, it['sig'], it['dup']])
                        except Exception as e: ok = False; errs.append('click: ' + str(e)[:100])
                        if not ok: continue
                        await pg.wait_for_timeout(CFG.get('after', 450))
                        try: r = await pg.evaluate(RESP)
                        except Exception: r = {'nav': True}
                        r['dlg'] = list(dlg)
                        try: fp1 = await pg.evaluate(FPJS)
                        except Exception: fp1 = -1
                        r['same'] = (fp0 is not None and fp0 == fp1)
                        noresp = not (r.get('nav') or not r['same'] or r['open'] or r['print'] or r['dl'] or r['file'] or r['net'] or r['clip'] or r['scroll'] or r['hash'] or r['dlg'])
                        await check(('  ↳ ' if parent else '') + it['txt'] + ' [' + it['sig'].split('|')[0] + ']', {'resp': r, 'noresp': noresp, 'sig': it['sig'][:160]})
                        # 點開後新出現的按鈕（彈窗、抽屜、子分頁）再往下走一層
                        if not parent and len(done) < CFG.get('max', 140) * 3:
                            try:
                                sub = await pg.evaluate(LIST, 'body')
                                known = {x['k'] for x in items}
                                base = await pg.evaluate(LIST, CFG.get('scope', 'body'))
                                for s in sub + base:
                                    if s['k'] not in known and s['k'] not in done and not any(q[0]['k'] == s['k'] for q in queue):
                                        s['glob'] = True
                                        if sum(1 for q in queue if q[1] and q[1]['k'] == it['k']) < CFG.get('submax', 25): queue.append((s, it))
                            except Exception: pass
                except Exception as e:
                    steps.append({'label': '(中斷)', 'fail': str(e)[:200], 'errs': errs[:5]})
                res.setdefault(rt_hash, {})[mode] = {'steps': steps, 'cloudWrites': blocked}
                print(rt_hash, mode, len(steps), flush=True)
                await ctx.close()
        sem = asyncio.Semaphore(int(os.environ.get('QA_PAR', '4')))
        jobs = [walk(h, m, vp, sem) for h in CFG['routes'] for m, vp in (('d', {'width': 1366, 'height': 800}), ('m', {'width': 390, 'height': 800}))]
        await asyncio.gather(*jobs); await br.close()
    json.dump(res, open(OUT, 'w'), ensure_ascii=False)
asyncio.run(main())
