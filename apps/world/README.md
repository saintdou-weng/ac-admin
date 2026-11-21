# 世界鐵道・四季慢行（3D）

- `index.html`：入口頁（VRT OS「行政工具」→ 🚂 世界鐵道・四季慢行 會開這頁）。顯示目前版本、快速前往、**匯入更新**、版本管理。
- `seasons_express.html`：內建版，目前 **v5.6**（2026-11-21，吳哥窟與第 2–4 島季節材質）。單一離線 HTML，約 11.0 MB。
- `version.json`：內建版的版本資訊，入口頁會讀它。**換內建版時要一起改。**
- `sw.js`：Service Worker。使用者在入口頁匯入的檔案存在該裝置的 Cache Storage（`vrt-world-import-v1`），之後 `seasons_express.html` 這個網址就回傳匯入版；網址加 `?builtin=1` 一律回內建版。
- 快速參觀：`seasons_express.html?visit=angkor` 由吳哥窟北池畔開始；點「回列車」繼續旅程。

## 三種版本（優先順序由上到下）
1. **雲端匯入版**（Paul 自己做，所有裝置生效）：入口頁「匯入更新」放 .html 或 .zip → 這台裝置立刻換版並自動上傳到行政中心 GAS；其他裝置打開入口頁會自動下載同一版。上傳要 Google 帳號連線，下載不用。GAS 端說明在 `gas/admin-world-v2.5.0.txt`。
2. **只在這台的匯入版**：上傳沒成功時的狀態，入口頁會出現「☁ 上傳到雲端」可重試。
3. **內建版**（AI 推 repo）：`seasons_express.html` ＋ `version.json`，`</body>` 前保留 `<script id="vrt-os-return">`。**注意：雲端有匯入版時，各裝置開的是雲端版，不是內建版**；入口頁「改回內建版」會把雲端版一起取消。

原始修改檔與交接筆記不放在這裡，跟著每一版的 `Seasons_Express_v5_x_source_patches.zip`。
