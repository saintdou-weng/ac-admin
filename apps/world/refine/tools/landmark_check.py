"""Landmark tour check (island 4): open a landmark via Upgrades515.openBuilding, screenshot exterior (far) and walk (near)
at desktop 1440x900 and phone 390x844, click floor / exterior / exit and report modes, visible buttons, view, people/cars.
usage (from apps/world): python3 refine/tools/landmark_check.py <file.html[?route=four]> <out_dir> <rio|cape|paris|istanbul|disney> [ext]
  ext = click 外觀 before the far shots so before/after compare in the same exterior mode"""
import sys, json, asyncio, os
from playwright.async_api import async_playwright
html, out, lid = sys.argv[1], sys.argv[2], sys.argv[3]
EXT = len(sys.argv)>4 and sys.argv[4]=='ext'
os.makedirs(out, exist_ok=True)
async def main():
  async with async_playwright() as p:
    b = await p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    res={'errors':[],'steps':{}}
    pg = await b.new_page(viewport={'width':1440,'height':900})
    pg.on('pageerror', lambda e: res['errors'].append('pageerror: '+str(e)[:300]))
    pg.on('console', lambda m: res['errors'].append('console.error: '+m.text[:300]) if m.type=='error' else None)
    path,_,q=html.partition('?')
    await pg.goto('file://'+os.path.abspath(path)+('?'+q if q else ''), wait_until='load', timeout=240000)
    await pg.wait_for_function('window.RailwayApp&&window.RailwayApp.world&&window.RailwayApp.world.island4&&window.Island4Landmarks', timeout=240000)
    await pg.wait_for_timeout(8000)
    res['life0']=await pg.evaluate('window.Island4Life&&window.Island4Life.status()')
    st = lambda: pg.evaluate("""()=>{const i=window.Island4Landmarks.inspect();const vis=s=>{const e=document.querySelector(s);return e?!e.hidden&&getComputedStyle(e).display!=='none':null};return {i:{active:i.active,id:i.id,mode:i.mode,floor:i.floor},view:window.RailwayApp.getState().view,cut:vis('[data-lm4-mode=cut]'),stack:vis('[data-lm4-mode=stack]'),walk:vis('[data-lm4-mode=walk]'),floors:vis('#lm4Floors'),status:document.getElementById('lm4Status').textContent,jumps:['lm4CableJump','lm4PenguinJump','lm4TramJump','lm4ParkWalkJump'].filter(k=>{const e=document.getElementById(k);return e&&!e.hidden;})}}""")
    await pg.evaluate(f"window.Upgrades515.openBuilding('{lid}')")
    await pg.wait_for_timeout(3000)
    res['steps']['open']=await st()
    if EXT:
      await pg.click('[data-lm4-mode=exterior]'); await pg.wait_for_timeout(1500); res['steps']['open_ext']=await st()
    for vw,vh,tag in [(1440,900,'desk'),(390,844,'phone')]:
      await pg.set_viewport_size({'width':vw,'height':vh}); await pg.wait_for_timeout(2500)
      await pg.screenshot(path=f'{out}/{lid}_far_{tag}.png')
    await pg.set_viewport_size({'width':1440,'height':900})
    await pg.click('[data-lm4-mode=walk]'); await pg.wait_for_timeout(2500)
    res['steps']['walk']=await st(); await pg.screenshot(path=f'{out}/{lid}_near_desk.png')
    await pg.set_viewport_size({'width':390,'height':844}); await pg.wait_for_timeout(2000); await pg.screenshot(path=f'{out}/{lid}_near_phone.png')
    await pg.set_viewport_size({'width':1440,'height':900})
    fb = await pg.query_selector_all('[data-lm4-floor]')
    if len(fb)>1:
      await fb[1].click(); await pg.wait_for_timeout(1500); res['steps']['floor1']=await st()
    await pg.click('[data-lm4-mode=exterior]'); await pg.wait_for_timeout(1000); res['steps']['ext']=await st()
    await pg.click('#lm4Exit'); await pg.wait_for_timeout(2000); res['steps']['exit']=await st()
    res['life1']=await pg.evaluate('window.Island4Life&&window.Island4Life.status()')
    await b.close()
  print(json.dumps(res,ensure_ascii=False,indent=1))
asyncio.run(main())
