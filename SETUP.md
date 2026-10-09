# PSJHR — 安裝步驟（v0.1.0 全新安裝）

GitHub repo（建議）：`saintdou-weng/psjhr`　網頁：`https://saintdou-weng.github.io/psjhr/`

> 和 PSJERP 一樣的做法；ERP 和 HR 各自獨立一個 repo、一個 Apps Script 專案、一個 Bot（或同一個 Bot 不同群組都可以）。

## 0. 先準備（給 Claude 之後填進「專用版」.gs 用）

1. **Telegram Bot Token**：BotFather → `/newbot`（建議名稱 VRT HR、使用者名稱 `vrt_hr_bot` 之類）→ 複製 Token。也可以沿用 ERP 的 Bot，但建議另開一個，HR 資料敏感。
2. **HR 群組 Chat ID**：開一個 Telegram 群組（例：VRT HR），把 Bot 加進去；用 `https://api.telegram.org/bot<Token>/getUpdates` 看 `chat.id`（負數）。
3. **同步密碼**：自己訂一組，例 `VRT-XXXX-XXXX`（和 ERP 的不要相同）。

把這三樣交給 Claude，Claude 會產生「PSJHR_AppsScript專用_v0.1.0.gs」（已填好）和已填 `/exec` 網址的 `index.html`。這三樣**不要**上傳 GitHub。

## A. GitHub（網頁）

1. 建新 repo `psjhr`（Public）；上傳本資料夾全部檔案（`index.html`、`PSJHR.gs` 空白版、`README.md`、`SETUP.md`、`DEPLOY_ONCE.md`、`.nojekyll`）。
2. Settings → Pages → Source：Deploy from a branch，Branch `main` / `/ (root)` → Save。
3. 約一分鐘後開 `https://saintdou-weng.github.io/psjhr/`，應該看到青綠色的 VRT HR 畫面。

## B. Apps Script（後端）

1. script.google.com → 新專案，命名 **PSJHR**；Project Settings → 時區 `Asia/Phnom_Penh`。
2. 刪掉預設 `Code.gs` 內容 → 貼上「PSJHR_AppsScript專用」（已填 Token / Chat ID / 同步密碼）→ 儲存。
3. Deploy → New deployment → 類型 Web app：Description `PSJHR v0.1.0`、Execute as **Me**、Who has access **Anyone** → Deploy → 複製 `/exec` 網址。
4. 上方選函式 **`INSTALL_ONCE`** → 執行 → 第一次會要 Google 權限，全部允許。這一步會建立 `PSJHR_DATA`（SETTINGS / MENU / HOLIDAYS / LOG）、Telegram 選單、webhook、`/hr` `/psjhr` 指令、每日 16:00 排程。
5. 選函式 **`CHECK_CLOUD`** → 執行（建立 `PSJHR_HRDATA` 索引表）。
6. 在 Telegram 群組打 `/hr`，Bot 應回覆選單。

## C. 網頁連線

1. 開網頁 → 設定 → **雲端同步**：貼「後端網址（/exec）」和「同步密碼」→ **儲存並同步**。右上角雲朵變 ☁️ 已同步。
   （若 Claude 已把 `/exec` 填進 `index.html` 的 `DEFAULT_GAS`，網址欄會自動帶入，只要填密碼。）
2. 可以先在瀏覽器直接開 `/exec` 網址檢查：看到 `{"ok":true,"app":"PSJHR",…}` 就表示後端正常。
3. 把 `下載\HR_系統匯出\` 的檔案拖進網頁 → 確認匯入 → 自動上傳雲端。工時檔很多（2014 起每月兩檔），可分幾次拖；雲朵會顯示進度。
4. 手機開同一個網址 → 設定 → 輸入同步密碼一次 → 之後自動下載。

## Google 試算表

| 試算表 | 內容 |
|---|---|
| `PSJHR_DATA` | SETTINGS / MENU / HOLIDAYS / TELEGRAM_LOG / SYNC_LOG |
| `PSJHR_HRDATA` | 索引：HR_FILES（每個匯入批次一列：資料集、key、期間、筆數、存在哪本哪頁）、NOTES（員工備註） |
| `PSJHR_HR_<資料集>` | 資料：EMP、EMP2、CONTACT、JOINLEAVE、LEAVE、ATT、ATTEXC、BASEPAY、ANNUAL、HOLIDAY、JOBCODE；**每個匯入批次一個分頁**（例 `att|2024-03|01-15`）；快到 900 萬格時自動開 `_2`、`_3` |

這些試算表都是網頁自動寫的，請不要手動改內容；要重來就在網頁重新匯入同一份檔（同範圍＝取代）。

## 維護（不用改程式）

- 選單：改 `MENU` 表。廠休日：改 `HOLIDAYS` 表（或在網頁匯入 BEST 的國定假日報表）。
- 每日推送時間：改 `SETTINGS` 的 `DAILY_TIME` 後執行 `REINSTALL_TRIGGER()`。
- 換同步密碼：改 .gs 最上面 `SYNC_KEY_DIRECT` → 儲存 → 管理部署作業 → 編輯 → 新版本 → 每台裝置重新輸入。
- 程式更新：GitHub 直接覆蓋 `index.html`；Apps Script 貼新 .gs 後一律「管理部署作業 → 編輯 → 新版本」，`/exec` 網址不變。
- Telegram 選單重複或沒反應：執行 `FIX_REPEAT()`。
