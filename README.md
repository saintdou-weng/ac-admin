# AC Admin Center — Factory Administration Management System(FAMS)

> SAINTDOU · Simply the Minimalist
> Repository:`ac-admin` · GitHub Pages:https://saintdou-weng.github.io/ac-admin/

行政中心。**不重新開發** HR / GA / Security / Audit 等平台,而是將六大 AC 平台整合為一個小型 ERP / HRM 管理中心。所有平台保持獨立;即使 Admin Center 關閉,各平台仍可正常使用。

---

## 檔案結構

```
ac-admin/
├── index.html                  ← Admin Center 主平台(單一檔案,全部功能)
├── shared/
│   └── platform-api.js         ← 通用 Platform API(各平台貼一行即接入)
├── AC_ADMIN_CENTER.gs          ← GAS 後端 + Telegram Bot(@ac_admin_center_bot)
└── README.md
```

## 功能一覽

| 區塊 | 內容 |
|---|---|
| **Factory Health Monitor** | 🟢🟡🔴 一眼看全廠六平台健康狀態(首頁頂部黑色橫條,點擊直達平台) |
| **Executive Dashboard** | 六平台 Summary Card:今日更新 / 最後同步 / 待辦 / 異常 / 模組完成率 / 版本 / Cloud / Telegram |
| **Factory Overview** | Total Employees、New/Resigned、Probation、Salary Adjust Pending、Repair/PO Pending、Security Incident、CAP Open、Document/Certificate Expiry、Budget/Actual/Variance、Training、Leave/Visitors — 自動來源+可手動修正 |
| **Budget Dashboard** | 8 大費用類別 × Budget/Actual/Variance/%,Monthly/Quarterly/Yearly 切換+長條圖 |
| **Notification Center** | 依平台分類的活動通知 |
| **Global Search** | 跨六平台全域搜尋(Employee/Document/PO/Repair/CAP/Contract/Salary/單號…) |
| **Activity Timeline** | 全平台更新時間軸 |
| **Platform Launcher** | 左側直連六平台(新分頁開啟,不用 iframe),附健康燈號 |
| **Organization** | 組織圖 · 部門 · 主管 · 職位 · 編制 · 缺編(放在 Admin Center,不在人資平台) |
| **Salary Structure** | Salary Grade · Range · Position · Allowance |
| **Annual Salary Adjustment** | 匯入 2021/2022/2026 調薪 xlsx,歷年比較 · 部門 · Increase % · Approval · Trend |

## 整合架構(核心原理)

所有平台都部署在 `saintdou-weng.github.io` **同一網域**之下 → localStorage 同源互通。

```
各平台 (hra/pay/gascheck/gaexp/sec/audit)
      │  資料變動 → platform-api.js 自動彙整
      ▼
localStorage: ac_admin_hub   ←──  Admin Center 即時讀取(不動原始資料)
      │  ⇅ Sync
      ▼
AC_ADMIN_CENTER GAS(Sheet 儲存)──→ Telegram /admin /summary(跨裝置查看)
```

- Admin Center **只讀取 Summary / Status / KPI / Activity**,不保存各平台完整資料,不重覆建立資料庫。
- 各平台入口頁貼入 platform-api.js 之後,提供標準 `window.PlatformAPI`:
  `getSummary() / getStatus() / sync() / upload() / download() / search() / version() / lastUpdate()`

---

## 部署步驟

### 1. 建立 GitHub Repo

```
Repo 名稱:ac-admin
上傳:index.html、shared/platform-api.js、README.md
Settings → Pages → main branch → 開啟
```

### 2. 部署 GAS 後端(URL 已填妥,照做即可)

1. script.google.com → 新專案,命名 **AC_ADMIN_CENTER**,貼入 `AC_ADMIN_CENTER.gs`
   ✅ `EXEC_URL` 已填入您的部署網址,**不需要再改任何程式碼**
2. 執行一次 `setup()`(授權 → 自動建立 Google Sheet「AC_ADMIN_CENTER_DB」)
3. 部署 → 管理部署 → 編輯 → **新版本** → 部署(沿用同一個 /exec 網址)
4. 執行 `fixWebhook()` → Telegram 群組會收到「Webhook 已綁定 ✓」
5. (選用)執行 `setupDailyDigest()` → 每日 08:00 自動發送全平台摘要

> ⚠️ 照舊規範:每次重新部署 GAS 後,務必再執行一次 `fixWebhook()`。

### 3. Admin Center 前端

開啟 https://saintdou-weng.github.io/ac-admin/ 即可 —
✅ GAS URL、Bot Token、Chat ID **全部已預填**,不用設定。
到 **Settings** 按 **Test Cloud**、**Test Telegram** 確認兩顆燈都亮綠即完成。

### 4. 六大平台接入(每個平台只要貼一行)

在各平台**入口頁** `</body>` 前貼入(全平台同一行,自動偵測平台):

```html
<script src="https://saintdou-weng.github.io/ac-admin/shared/platform-api.js"></script>
```

| 平台 | 貼入檔案 |
|---|---|
| ac-hra-portal | hra_portal_v2.html |
| ac-hra-pay | index.html |
| ac-gascheck | ac_gascheck_portal_v1.html |
| ac-ga-exp | index.html |
| ac-gas-sec | index.html |
| ac-audit | ac_audit_platform_v1.html |

貼入後:平台資料一有變動 → 自動更新 Hub → Admin Center Dashboard / Timeline / Notification 即時反映;若各平台也想跨裝置上雲,在該平台任一頁 Console 執行一次即可共用設定(通常不需要,Admin Center Sync 已涵蓋)。

> 未貼入 script 的平台,Admin Center 仍可直接掃描其本機資料(同源),只是少了「今日更新次數」與即時活動事件。

### 5. Telegram 指令

| 指令 | 功能 |
|---|---|
| `/admin` | 控制台(六平台按鈕 + Admin Center + Summary/Status) |
| `/summary` | 全平台健康摘要(🟢🟡🔴 + records/pending/最近活動) |
| `/status` | 系統狀態 |

---

## localStorage Keys(Admin Center 專用)

`ac_admin_hub`(彙整中樞)· `ac_admin_config` · `ac_admin_org` · `ac_admin_salary_structure` · `ac_admin_salary_adjust` · `ac_admin_budget` · `ac_admin_overview`

## 後續添磚加瓦

- 新平台加入:在 `shared/platform-api.js` 的 `PLATFORMS` 表加一段(id / name / url / keys),Admin Center 全部畫面自動出現該平台 — 不需改 index.html。
- 各平台若日後提供更精準的 pending / alerts,只要在自己頁面呼叫 `PlatformAPI.refresh()` 前先設定 `window.PLATFORM_VERSION`,或直接在 PLATFORMS 表補 keys 即可。
