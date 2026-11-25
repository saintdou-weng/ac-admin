"""Copy the named <script>/<style id=...> blocks from island4.html into seasons_express.html (they must be identical
afterwards), check JS syntax of every touched block, and refresh world-manifest.json files[...] (sha, bytes, updatedAt).
usage (from apps/world): python3 refine/tools/sync_blocks.py island4-town-realism-v67 [more ids]"""
import re, sys, json, hashlib, datetime, subprocess, os
os.chdir(os.path.join(os.path.dirname(__file__), '..', '..'))
def find(src, bid):
    m = re.search(r'<(script|style)([^>]*\bid="%s"[^>]*)>(.*?)</\1>' % re.escape(bid), src, re.S)
    if not m: raise SystemExit('block not found: ' + bid)
    return m
a = open('island4.html', encoding='utf-8').read(); s = open('seasons_express.html', encoding='utf-8').read()
for bid in sys.argv[1:]:
    ma, ms = find(a, bid), find(s, bid)
    if ma.group(1) == 'script':
        r = subprocess.run(['node', '-e', 'new Function(require("fs").readFileSync(0,"utf8"))'], input=ma.group(3), text=True, capture_output=True)
        if r.returncode: raise SystemExit('syntax error in %s: %s' % (bid, r.stderr[-400:]))
    s = s[:ms.start()] + ma.group(0) + s[ms.end():]
    print('synced', bid, len(ma.group(3)))
open('seasons_express.html', 'w', encoding='utf-8').write(s)
m = json.load(open('world-manifest.json', encoding='utf-8')); now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
for f in ('island4.html', 'seasons_express.html'):
    b = open(f, 'rb').read(); m['files'][f] = {'sha': hashlib.sha256(b).hexdigest()[:32], 'bytes': len(b), 'updatedAt': now}
m['updatedAt'] = now[:10]
open('world-manifest.json', 'w', encoding='utf-8').write(json.dumps(m, ensure_ascii=False, indent=2) + '\n')
print('manifest updated', {f: m['files'][f]['bytes'] for f in ('island4.html', 'seasons_express.html')})
