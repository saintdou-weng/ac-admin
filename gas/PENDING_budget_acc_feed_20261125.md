# 待辦：預算月報自動讀會計帳列（live.acc）— 2026-11-25

vrt-budget.js v1.1.0 已上線（網頁立即生效；GAS 快取最多 6 小時後也會用新版）。
會計帳列數目前在 `shared/vrt-budget-data.js` 的 `acc`（到 2026-10）。
要讓之後每個月自動進來，還差兩處 GAS（當天 Chrome 連不上，沒做）：

## 1. VRT-ACC-Flow-Cost-Cloud（doGet 加一個輕量讀取）
```js
if (action === 'expenseTotals') return json_({ok: true, acc: expenseTotals_()});

function expenseTotals_() {
  const part = loadJsonFile_(VRT_ACC.fileProps.expense) || {}, out = {};
  Object.keys(part.periods || {}).forEach(function(p) {
    const r = ((part.periods[p] || {}).records || [])[0]; if (!r) return;
    const s = Number(r.salary) || 0; if (!(s > 0)) return;
    out[p] = [Math.round(s), Number(r.directLabor) > 0 ? Math.round(r.directLabor) : null, Number(r.overhead) > 0 ? Math.round(r.overhead) : null];
  });
  return out;
}
```

## 2. AC_ADMIN_CENTER（budgetLive_ 加 acc；順便換快取鍵）
```js
// AC_BUDGET 加：ACC:'<ACC Flow 網頁應用程式 /exec 網址>'
function budgetAccLive_(){const r=UrlFetchApp.fetch(AC_BUDGET.ACC+'?action=expenseTotals',{muteHttpExceptions:true,followRedirects:true});
 if(r.getResponseCode()!==200)throw new Error('ACC HTTP '+r.getResponseCode());const j=JSON.parse(r.getContentText());if(!j.ok)throw new Error('ACC '+(j.message||j.code||'error'));return j.acc||{};}
// budgetLive_ 內，live.lab 那行後面加：
try{live.acc=budgetAccLive_();}catch(e){live.err.push('ACC '+String(e.message||e).slice(0,120));}
// live 初始值加 acc:{}；budgetSettle_ 的 M.isProv(ym) 改成 M.provAdmin(ym)
```
做完前：沒有會計數的月份，月報會標「⚠️ 會計 factory exp 還沒進來，人工依係數估算」。
