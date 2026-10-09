# DEPLOY ONCE — PSJHR

- 名稱：顯示名 **VRT HR**、技術名 **PSJHR**；主色青綠（ERP 藍、HR 青綠）。
- GitHub：新 repo `saintdou-weng/psjhr`，Pages 用 main / root。網址 https://saintdou-weng.github.io/psjhr/
- Telegram：指令 `/hr` `/psjhr`；Bot Token、HR 群組 Chat ID、同步密碼只放 Apps Script（「PSJHR_AppsScript專用」那份），GitHub 上的 `PSJHR.gs` 永遠留空。
- Apps Script：專案 PSJHR、時區 Asia/Phnom_Penh、Web App（Execute as Me / Anyone）。第一次執行 `INSTALL_ONCE()` 再 `CHECK_CLOUD()`。改程式後一律「管理部署作業 → 編輯 → 新版本」，`/exec` 網址不變。
- 雲端同步：索引 `PSJHR_HRDATA` ＋ 每種資料一本 `PSJHR_HR_*`（一批次一分頁）；讀寫都要同步密碼；每台裝置輸入一次。
- 排程：週一至週六 16:00 推送雲端狀態；週日與 HOLIDAYS 跳過。
- BEST 人事系統（per.exe）永遠唯讀；網頁只讀 `下載\HR_系統匯出\` 的匯出檔。員工備註是唯一可寫的欄位，正式數字鎖定。
- 側欄外連：VRT ERP、AC HRA Portal、VRT Prod；ERP 的 MENU 表也可以加一列 `👥 VRT HR` 指到本網址。
