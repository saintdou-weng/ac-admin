import asyncio,json,sys,os,re
from playwright.async_api import async_playwright
ROOT='/home/claude';PORT=8780
PAGES=json.load(open('/tmp/pages.json'))
LIB=[(r'chart(\.umd)?(\.min)?\.js','/tmp/libs/node_modules/chart.js/dist/chart.umd.js'),(r'xlsx\.full\.min\.js','/home/claude/vrt-prod/vendor/xlsx.full.min.js'),(r'pdf\.min\.js','/tmp/libs/pdfjs-dist-3.11.174/build/pdf.min.js'),(r'pdf\.worker\.min\.js','/tmp/libs/pdfjs-dist-3.11.174/build/pdf.worker.min.js'),(r'jszip\.min\.js','/tmp/libs/jszip-3.10.1/dist/jszip.min.js'),(r'qrcode\.js','/home/claude/vrt-prod/vendor/qrcode.js')]
JS=r"""()=>{
 const out={};const de=document.documentElement;
 out.overflow=Math.max(de.scrollWidth,document.body?document.body.scrollWidth:0)-innerWidth;
 function rgb(s){const m=String(s).match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[,\s\/]+/).filter(Boolean).map(Number);return {r:a[0],g:a[1],b:a[2],a:a.length>3?a[3]:1}}
 function lum(c){const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)}
 function bgOf(el){let layers=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&cs.backgroundImage!=='none')return null;const c=rgb(cs.backgroundColor);if(c&&c.a>0){layers.push(c);if(c.a>=.95)break}}
   let base={r:255,g:255,b:255};for(let i=layers.length-1;i>=0;i--){const c=layers[i];base={r:c.r*c.a+base.r*(1-c.a),g:c.g*c.a+base.g*(1-c.a),b:c.b*c.a+base.b*(1-c.a)}}return base}
 const low=[];let checked=0;const seen=new Set();
 const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 while((n=w.nextNode())){const t=n.nodeValue.trim();if(t.length<2)continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(/^(SCRIPT|STYLE|OPTION|NOSCRIPT)$/.test(el.tagName))continue;
   const r=el.getBoundingClientRect();if(r.width<4||r.height<4)continue;const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity<.3)continue;if(!el.offsetParent&&cs.position!=='fixed')continue;
   const fg=rgb(cs.color),bg=bgOf(el);if(!fg||!bg)continue;checked++;const f={r:fg.r*fg.a+bg.r*(1-fg.a),g:fg.g*fg.a+bg.g*(1-fg.a),b:fg.b*fg.a+bg.b*(1-fg.a)};const L1=lum(f),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
   const fs=parseFloat(cs.fontSize);if(cr<3.2||(fs<11&&cr<4.5))low.push({t:t.slice(0,24),cr:+cr.toFixed(2),fs,cls:(el.className&&el.className.baseVal===undefined?String(el.className):'').slice(0,30),tag:el.tagName,fg:cs.color,bg:'rgb('+Math.round(bg.r)+','+Math.round(bg.g)+','+Math.round(bg.b)+')'})}
 out.checked=checked;out.low=low.length;out.lowS=low.slice(0,12);
 out.tiny=[...seen].filter(el=>{const cs=getComputedStyle(el);return parseFloat(cs.fontSize)<10&&el.offsetParent}).length;
 const links=[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(h=>h&&!/^(#|javascript:|mailto:|tel:|https?:|data:|blob:)/.test(h));out.links=[...new Set(links)];
 const oc=[...document.querySelectorAll('[onclick]')].map(e=>e.getAttribute('onclick'));const miss=new Set();oc.forEach(s=>{const m=s.match(/^\s*([A-Za-z_$][\w$]*)\s*\(/);if(m&&typeof window[m[1]]==='undefined'&&!/^(if|return|event|this|location|window|document|alert|confirm|history|void)$/.test(m[1])){try{if(eval('typeof '+m[1])==='undefined')miss.add(m[1])}catch(e){miss.add(m[1])}}});out.missFn=[...miss].slice(0,10);
 out.imgBroken=[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src&&!/^data:/.test(i.src)&&i.src.startsWith(location.origin)).map(i=>i.getAttribute('src')).slice(0,5);
 out.cards=document.querySelectorAll('.card,.kpi,.mcard,[class*="card"]').length;
 out.shadow=[...document.querySelectorAll('.card,.kpi,.mcard,[class*="card"]')].slice(0,40).filter(e=>getComputedStyle(e).boxShadow!=='none').length;
 out.title=document.title;out.bodyLen=(document.body.innerText||'').length;
 return out}"""
async def main():
  res={}
  async with async_playwright() as p:
    br=await p.chromium.launch(executable_path='/usr/bin/google-chrome')
    async def one(path,sem):
      async with sem:
        r={}
        for mode,vp in (('d',{'width':1366,'height':800}),('m',{'width':390,'height':800})):
          ctx=await br.new_context(viewport=vp)
          async def rt(route):
            u=route.request.url
            if u.startswith('http://localhost'):return await route.continue_()
            m=re.match(r'https://saintdou-weng\.github\.io/([^/]+)/([^?#]+)',u)
            if m:
              f=os.path.join(ROOT,m.group(1).lower(),m.group(2))
              if os.path.exists(f):return await route.fulfill(path=f,content_type='application/javascript' if f.endswith('.js') else None)
            for pat,f in LIB:
              if re.search(pat,u) and os.path.exists(f):return await route.fulfill(path=f,content_type='application/javascript')
            await route.abort()
          await ctx.route('**/*',rt);pg=await ctx.new_page();errs=[]
          pg.on('pageerror',lambda e:errs.append(str(e)[:160]));pg.on('dialog',lambda d:asyncio.ensure_future(d.dismiss()))
          try:
            await pg.goto(f'http://localhost:{PORT}/{path}',wait_until='domcontentloaded',timeout=30000);await pg.wait_for_timeout(4200)
            o=await pg.evaluate(JS);o['errs']=list(dict.fromkeys(errs))[:6]
          except Exception as e:o={'fail':str(e)[:150],'errs':errs[:4]}
          r[mode]=o;await ctx.close()
        res[path]=r;print('.',end='',flush=True)
    sem=asyncio.Semaphore(4);await asyncio.gather(*[one(x,sem) for x in PAGES]);await br.close()
  json.dump(res,open('/tmp/audit.json','w'),ensure_ascii=False)
asyncio.run(main())
