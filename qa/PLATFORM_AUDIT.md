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
- [ ] 第 2 層：單頁應用裡面的每個分頁／彈窗逐一點開跑同樣檢查。拆成「平台 × 層」，一晚一個：
  - [x] PSJHR（2026-11-27 晚，見下方「第 2 層紀錄」）
  - [ ] PSJERP
  - [ ] PSJGAS
  - [ ] Admin OS（ac-admin）
  - [ ] HRA Portal（ac-hra-portal，14 頁）
  - [ ] HRA-PAY（ac-hra-pay，13 頁）
  - [ ] AC Audit（ac-audit，21 頁）
  - [ ] AC Security（ac-gas-sec，9 頁）
  - [ ] GASCheck（ac-gascheck，8 頁）
  - [ ] GA-EXP（ac-ga-exp，10 頁）
- [ ] 第 3 層：每個 KPI 卡、圖表、表格列點得開、有資料；編號、照片有出現；跨平台連結（員工→PSJHR、機台→機修）。
- [ ] 第 4 層：匯入（Excel/PDF/照片）、匯出、列印、新增／編輯／刪除／儲存 每頁各跑一次（用測試資料，不寫雲端）。
- [ ] 第 5 層：計算核對（薪資、OT、年資、效率、費用合計）拿原始報表抽樣比對。
- [ ] 第 6 層：報告與摘要（Telegram／週報／月報）格式照 3 個 skill；核可→生效→發送流程每個模組走一次。
- [ ] 第 7 層：排程巡檢（每個排程最近一次有沒有成功、有沒有產出）。
- [ ] <10px 的小字（audit_hub_main 345 處、gascheck cleaning／dormitory、ga-exp index）要不要放大——會動版面，先列著。
- [ ] vrt-prod/portal_v2.html 還是 8 個入口，沒有新的「🧰 器具工具」。
- [ ] PSJHR 補測（第 2 層沒測到的）：quiz.html 要輸入工號才進得去，只測到語言鍵；嵌入的 10 個外部分頁（#x-hra-*、#x-pay-*、#x-adm-labor、#x-aud-*）是 iframe，內容留給各自平台那一晚；考勤（att）要真的匯入檔才有資料；每頁超過 90 個可點項目的後段（員工表後面的列）沒點完。
- [ ] PSJHR：沒輸入同步密碼時頁面仍會嘗試連 script.google.com（測試中全數攔下，每輪 GET 很多、POST 約 70–90 次）——第 6 層時確認沒密碼是否該先不送。

## 第 2 層紀錄
工具：`qa/layer2_walk.py <config.json> <out.json>`（Playwright；每個 hash 分頁 × 桌面 1366／手機 390，把頁內每個按鈕、分頁、表格列、彈窗裡的按鈕逐一點開，
每一步量 JS 錯誤、字對比（先等 legible.js 跑完）、橫向溢出、彈窗超出畫面、按了有沒有反應〔點前點後 DOM 指紋＋下載／列印／開新頁／對話框／hash〕）。
所有外部連線一律攔掉（含 script.google.com），資料只在測試瀏覽器裡。設定檔範例：`qa/layer2_psjhr.json`（內含 30 個虛構員工「測試員工01…」的本機測試資料，不是公司資料）。
2 核心的機器跑完 PSJHR 一輪約 45 分鐘。

### PSJHR（2026-11-27 晚）
範圍：index.html 選單上 34 個分頁（24 個本頁＋10 個嵌入頁）＋頂列（語言、背景色 20 色、音樂、壁紙、個資遮罩）＋員工抽屜 5 個分頁與其按鈕。
三輪：沒資料 2,196 步、虛構資料 3,351 步＋2,831 步（第二次用較嚴的「沒反應」判定），修正後再驗 1,485 步。
- 查到 1 處、修了 1 處：**員工、薪資設定、職務代碼三頁的「發 Telegram 摘要」按了出錯、沒有任何反應**（這三頁沒有期間指標，程式直接壞掉）。
  → 改成用頁面上同一組 KPI 出摘要：員工＝在職（女／男）、留職停薪、期間新進／離職、平均年資；薪資設定＝人數、月薪／日薪、網頁編輯過（不含金額）；職務代碼＝代碼數、費用類別、打卡否。
  驗證：本機用虛構資料開預覽視窗，三頁都出摘要、0 錯誤；只開預覽，沒有送出。已 push（psjhr f33e64d）。
- JS 錯誤：修正後 0。手機 390 橫向溢出：0。彈窗／抽屜超出畫面：0。onclick 找不到函式：0。破圖：0。
- 字對比：穩定狀態 0 處。剛換頁／剛換背景色的 0.4 秒內有些灰字還沒被 legible.js 加深（之後會自動加深），20 個背景色逐一確認過選單字都有加深。
- 按了沒反應：0（判定出的 149 個都是「已經選中的分頁再按一次」、嵌入頁「⟳ 重新載入」、員工「🖨 列印」〔0.6 秒後才叫出列印，確認有作用〕）。
- 沒重現：桌面總覽輪播按「›」時有一次量到橫向多 18px（動畫中），單獨重測 0。
- 沒測到：見上方「PSJHR 補測」。Claude in Chrome 在排程（雲端）連不上，真實頁面沒有開來看，只做 repo 內與本機部分。
