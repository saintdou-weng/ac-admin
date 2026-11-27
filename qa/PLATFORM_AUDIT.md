# 全平台檢查（Paul 2026-11-27 19:00 要求）

標準：介面、卡片、連接、圖表、數據、顏色、滑動、編號、照片、匯入匯出、上傳下載、資料齊全、直覺易懂、跨平台連接、
新增／刪除／編輯／儲存／列印、報告與摘要（Paul 的格式）核可後發出無誤、核可生效程序、計算精確、排程自動、
字跟底色／卡片要清楚、帶 3D 微浮現感。不刪功能，不放資料到 repo。

## 第 1 層（2026-11-27 完成）：每頁首屏自動檢查
工具：`qa/platform_audit.py`（Playwright；/tmp/pages.json 放頁面清單；本機 http.server 開在 repo 上一層）。
範圍 114 頁：ac-admin 3、ac-audit 21、ac-ga-exp 10、ac-gas-sec 9、ac-gascheck 8、ac-hra-pay 13、ac-hra-portal 14、
psjerp 3、psjgas 2、psjhr 2、vrt-prod 26、vrt-acc-flow-cost 3。桌面 1366＋手機 390。
- JS 錯誤：0 頁。
- 字不清楚（對比不足）：桌面 1019 處／31 頁 → 21 處／1 頁（ac-ga-exp/damage 圖表 10px 標籤，差一點）。
  做法：`shared/legible.js`，由 swipe-tabs.js 與 vrt-prod/vrt-theme-v1.js 自動載入；沒載共用檔的 9 頁直接加 script。
  PSJGAS 有 CSP，已把 legible.js 加進 script-src 白名單。
- 卡片微浮：沒陰影的卡片自動加淡陰影（.lg3d），可點的滑過浮 1px。
- 手機橫向溢出：6 頁 → 0（VRT_DCC_v2、VRT_Factory_Rules_v2〔目錄改抽屜〕、ac_audit_core、audit_hub_main、psjgas/legacy、factory-map）。
- 按了沒反應的按鈕：ac_hra_complete_v2（測／別名 4 顆）、ac_hra_contract_v2（🔌 測試連線）→ 已補功能。

## 還沒做（下一層，依序）
- [ ] 第 2 層：單頁應用裡面的每個分頁（PSJHR、PSJERP、PSJGAS、Admin OS、各頁的分頁／彈窗）逐一點開跑同樣檢查。
- [ ] 第 3 層：每個 KPI 卡、圖表、表格列點得開、有資料；編號、照片有出現；跨平台連結（員工→PSJHR、機台→機修）。
- [ ] 第 4 層：匯入（Excel/PDF/照片）、匯出、列印、新增／編輯／刪除／儲存 每頁各跑一次（用測試資料，不寫雲端）。
- [ ] 第 5 層：計算核對（薪資、OT、年資、效率、費用合計）拿原始報表抽樣比對。
- [ ] 第 6 層：報告與摘要（Telegram／週報／月報）格式照 3 個 skill；核可→生效→發送流程每個模組走一次。
- [ ] 第 7 層：排程巡檢（每個排程最近一次有沒有成功、有沒有產出）。
- [ ] <10px 的小字（audit_hub_main 345 處、gascheck cleaning／dormitory、ga-exp index）要不要放大——會動版面，先列著。
- [ ] vrt-prod/portal_v2.html 還是 8 個入口，沒有新的「🧰 器具工具」。
