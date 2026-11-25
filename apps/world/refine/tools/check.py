"""World refine check: load one island page in headless Chrome and report errors, triangle counts, people/cars,
and optional screenshots from fixed cameras.
usage: python3 check.py <file.html[?route=four]> <out_dir> [shots.json]
shots.json: [{"name":"rio_hill","t":0.085,"scene":"rio","pos":[x,y,z],"target":[x,y,z],"w":1280,"h":720}]
  pos/target are in that scene's local coordinates (A.world.island4.scenes[i].root).  w/h optional (default 1280x720).
prints JSON: {errors:[...], tri:{total,byScene}, life, title, shots:[paths]}"""
import sys, json, asyncio, os
from playwright.async_api import async_playwright
CHROME = os.environ.get('CHROME', '/usr/bin/google-chrome')
CAM = r"""(()=>{const T=window.THREE,cp=T.Camera.prototype;if(cp.__h)return;cp.__h=1;const o=cp.updateMatrixWorld;
 cp.updateMatrixWorld=function(f){const c=window.__cam;if(c&&this.isPerspectiveCamera&&!this.parent){this.position.set(...c.p);this.lookAt(...c.t);if(this.fov!==(c.fov||55)){this.fov=c.fov||55;this.updateProjectionMatrix();}}return o.call(this,f);};})()"""
TRI = r"""(()=>{const I=window.RailwayApp.world.island4,tri=o=>{let n=0;o.traverse(x=>{if(x.isMesh&&x.geometry&&x.visible!==false){const g=x.geometry;n+=(g.index?g.index.count:g.attributes.position.count)/3*(x.isInstancedMesh?x.count:1);}});return Math.round(n);};
 const by={};I.scenes.forEach(s=>by[s.definition?.id||s.id]=tri(s.root));return {total:tri(I.root),byScene:by};})()"""
async def main(html, out, shots):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        res = {'errors': [], 'shots': []}
        pg = await b.new_page(viewport={'width': 1280, 'height': 720})
        pg.on('pageerror', lambda e: res['errors'].append('pageerror: ' + str(e)[:300]))
        pg.on('console', lambda m: res['errors'].append('console.error: ' + m.text[:300]) if m.type == 'error' else None)
        path, _, q = html.partition('?')
        await pg.goto('file://' + os.path.abspath(path) + ('?' + q if q else ''), wait_until='load', timeout=240000)
        await pg.wait_for_function('window.RailwayApp&&window.RailwayApp.world&&window.RailwayApp.world.island4', timeout=240000)
        await pg.wait_for_timeout(9000)
        res['title'] = await pg.title()
        try: res['tri'] = await pg.evaluate(TRI)
        except Exception as e: res['tri'] = {'error': str(e)[:200]}
        try: res['life'] = await pg.evaluate('window.Island4Life&&window.Island4Life.status()')
        except Exception: pass
        await pg.evaluate(CAM)
        await pg.add_style_tag(content='body *{visibility:hidden!important}canvas{visibility:visible!important}')
        for s in shots:
            await pg.set_viewport_size({'width': s.get('w', 1280), 'height': s.get('h', 720)})
            await pg.evaluate('(a)=>{const A=window.RailwayApp;A.seekFourth(a.t);}', s)
            await pg.wait_for_timeout(1500)
            await pg.evaluate("""(a)=>{const T=window.THREE,I=window.RailwayApp.world.island4,sc=I.scenes.find(q=>(q.definition?.id||q.id)===a.scene)||I.scenes[0],r=sc.root;
              r.updateMatrixWorld(true);const P=r.localToWorld(new T.Vector3(...a.pos)),Q=r.localToWorld(new T.Vector3(...a.target));window.__cam={p:P.toArray(),t:Q.toArray(),fov:a.fov||55};}""", s)
            await pg.wait_for_timeout(2600)
            path = os.path.join(out, s['name'] + '.png'); await pg.screenshot(path=path); res['shots'].append(path)
        await b.close()
    print(json.dumps(res, ensure_ascii=False, indent=1))
shots = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else []
asyncio.run(main(sys.argv[1], sys.argv[2], shots))
