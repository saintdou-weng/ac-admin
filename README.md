# VRT HR（技術代號 PSJHR）

網址（建議）：https://saintdou-weng.github.io/psjhr/　　GitHub repo（建議）：`saintdou-weng/psjhr`

VRT HR 是 BEST 人事管理系統（`D:\per\per.exe`）的雲端唯讀鏡像：把從 BEST 匯出的報表檔（`下載\HR_系統匯出\`）直接拖進網頁，就能在電腦、手機看同一份人事資料。做法和 VRT ERP（PSJERP）完全一樣：單一 `index.html` 放 GitHub Pages、Google Apps Script 當後端、Telegram 推播。

## 命名

| 項目 | 名稱 |
|---|---|
| 顯示名稱 | **VRT HR** |
| 技術代號 | **PSJHR**（ERP 是 PSJERP，同一個家族） |
| GitHub repo | `saintdou-weng/psjhr` → `https://saintdou-weng.github.io/psjhr/`（不要沿用舊的 vrt-hr，避免和舊內容混在一起） |
| Apps Script 專案 | **PSJHR**（檔名 `PSJHR.gs`） |
| Google 試算表 | `PSJHR_DATA`、`PSJHR_HRDATA`、`PSJHR_HR_<資料集>` |
| Telegram 指令 | `/hr`、`/psjhr` |
| 網頁本機儲存 | IndexedDB `psjhr`、localStorage 前綴 `psjhr_` |
| 主色 | 青綠（teal）——一眼就和 ERP 的藍色分開 |

## 檔案

| 檔案 | 用途 |
|---|---|
| `index.html` | VRT HR 網頁（單一檔案，GitHub Pages 直接開） |
| `PSJHR.gs` | Google Apps Script v0.1.0（Token / Chat ID / 同步密碼留空，可放 GitHub；真正貼進 Apps Script 的是另一份已填好的「PSJHR_AppsScript專用」） |
| `SETUP.md` | 安裝步驟 |
| `DEPLOY_ONCE.md` | 部署重點摘要 |
| `.nojekyll` | 讓 GitHub Pages 原樣提供檔案 |

## v0.1.0 功能

- **11 種 BEST 報表自動辨識**（依欄名／標題）：員工詳細資料表、員工資料表（代碼版）、通訊資料、新進離職、請假、工時（出勤日報）、異常工時、基本薪資、特休、國定假日、職務代碼。每個檔都和報表「總計」核對，核對失敗預設不匯入（會顯示原因，可勾選強制匯入）。
- **任何一頁都能拖檔**：把 `下載\HR_系統匯出\` 的檔案（可以一次整個資料夾）拖到畫面上即可；同範圍重匯＝取代，不會重複。`00_export*` 之類的索引檔自動略過。
- **頁面**：總覽（在職人數、本月出勤率、實際工時、異常筆數、12 個月新進 vs 離職、請假類別、各部門人數、資料健康）、員工、工時、異常工時、請假、新進離職、特休、國定假日、基本薪資、職務代碼、智慧匯入、同步中心、報表／Telegram、設定。
- **期間導覽**：日／週／月／年／自訂／全部；年份、月份下拉有資料的加 ●；打開時停在最近有資料的期間。
- **員工檔案抽屜**：點任一員工代號，合併所有報表（基本資料、通訊、薪別、特休、請假、出勤月曆）。
- **隱私模式**（右上角 👁）：薪資、電話、身分證、地址一鍵模糊，給別人看螢幕時用。
- **工時大檔分批存放**：每個匯入批次獨立存放、只在看到該月時才載入，手機也不會卡。
- **匯出 Excel**：目前期間＋篩選；第 1 頁「說明」，第 2 頁「資料」。
- **雲端同步**：電腦匯入 → 自動上傳 Google 試算表；手機打開 → 自動下載。每種資料一本試算表、每個批次一個分頁，不會撞到 Google 1,000 萬格上限。每台裝置輸入一次同步密碼。
- **Telegram**：報表頁可把目前期間摘要送到 HR 群組；Bot 選單由 `MENU` 表控制；每個工作日 16:00 推送雲端狀態。
- 三語介面：中文／English／ខ្មែរ。

## 規則

- BEST 人事系統（per.exe）永遠唯讀；本網頁只讀匯出檔，絕不寫回。
- Bot Token、Chat ID、同步密碼只放在 Apps Script，不放 GitHub、不放網頁。
- 員工代號是字串，`10` 和 `010` 是不同人，不會自動補零。
- 出勤率＝工作日（排除週日與已匯入的國定假日）出勤 ÷ 應出勤。
- 每個模組都能單獨開：`#emp`、`#att`、`#leave`…；前面加 `solo-` 會隱藏側欄（例 `#solo-att`）。
