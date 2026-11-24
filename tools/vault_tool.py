#!/usr/bin/env python3
"""VRT 加密資料小工具（給自動 email 同步用）。程式碼公開，不含任何密碼；密碼由環境變數 VAULT_PW 提供。

用法（repo 都 clone 在同一個資料夾下，例如 /home/claude/ac-admin、/home/claude/psjgas、/home/claude/psjerp）：
  VAULT_PW=... python3 vault_tool.py dump ga  out.json     # 解開 → JSON
  VAULT_PW=... python3 vault_tool.py load ga  in.json      # JSON → 加密寫回（ga 會自動重算 CSP hash）

目標：
  ga = PSJGAS index.html 內嵌 GA_VAULT  {history[], annual[], status[]}
  ap = Admin OS 行政專案  apps/admin/admin_projects_vault.js  {projects[], items[]}
  pl = Admin OS 年度計劃  apps/admin/admin_plans_vault.js     {pillars[], years[], log[], slides{}}
  mm = PSJERP 會議追蹤    assets/mm-vault.js                   [ {d,t,src,secs[]} ]
加密：PBKDF2-SHA256 250000 次、salt 'VRT-PSJ-Vault-v1'、AES-GCM-256（網頁端同一套）。
"""
import base64, hashlib, json, os, re, sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

ROOT = os.environ.get('VRT_ROOT', os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
T = {
    'ga': ('psjgas/index.html', 'const GA_VAULT=', True),
    'ap': ('ac-admin/apps/admin/admin_projects_vault.js', 'window.AP_VAULT=', False),
    'pl': ('ac-admin/apps/admin/admin_plans_vault.js', 'window.PL_VAULT=', False),
    'mm': ('psjerp/assets/mm-vault.js', 'window.PSJ_MM_VAULT=', False),
}

def key():
    pw = os.environ['VAULT_PW'].encode()
    return hashlib.pbkdf2_hmac('sha256', pw, b'VRT-PSJ-Vault-v1', 250000, 32)

def path(t):
    return os.path.join(ROOT, T[t][0])

def read_obj(t):
    s = open(path(t), encoding='utf8').read()
    i = s.index(T[t][1]) + len(T[t][1])
    m = re.match(r'\{[^;]*?\}', s[i:])
    return s, i, m.end(), json.loads(m.group(0))

def dump(t, out):
    _, _, _, v = read_obj(t)
    pt = AESGCM(key()).decrypt(base64.b64decode(v['iv']), base64.b64decode(v['ct']), None)
    open(out, 'w', encoding='utf8').write(json.dumps(json.loads(pt), ensure_ascii=False, indent=1))
    print('dumped', t, '->', out)

def module_hash(s):
    m = re.search(r'<script type="module">(.*?)</script>', s, re.S)
    return "'sha256-" + base64.b64encode(hashlib.sha256(m.group(1).encode()).digest()).decode() + "'"

def load(t, src):
    obj = json.load(open(src, encoding='utf8'))
    iv = os.urandom(12)
    ct = AESGCM(key()).encrypt(iv, json.dumps(obj, ensure_ascii=False, separators=(',', ':')).encode(), None)
    enc = json.dumps({'v': 1, 'iv': base64.b64encode(iv).decode(), 'ct': base64.b64encode(ct).decode()})
    s, i, n, _ = read_obj(t)
    old = module_hash(s) if T[t][2] else None
    s = s[:i] + enc + s[i + n:]
    if T[t][2]:
        assert old in s, 'CSP hash not found'
        s = s.replace(old, module_hash(s))
    open(path(t), 'w', encoding='utf8').write(s)
    print('loaded', src, '->', t, len(enc), 'bytes')

if __name__ == '__main__':
    cmd, t, f = sys.argv[1:4]
    (dump if cmd == 'dump' else load)(t, f)
