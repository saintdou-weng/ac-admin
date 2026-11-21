# 世界鐵道・四季慢行（3D）

- `index.html`：入口頁（VRT OS「行政工具」→ 🚂 世界鐵道・四季慢行 會開這頁）。顯示目前版本、快速前往、**匯入更新**、版本管理。
- `seasons_express.html`：內建版，目前 **v5.6**（2026-11-21，吳哥窟與第 2–4 島季節材質）。單一離線 HTML，約 11.0 MB。
- `version.json`：內建版的版本資訊，入口頁會讀它。**換內建版時要一起改。**
- `sw.js`：Service Worker。使用者在入口頁匯入的檔案存在該裝置的 Cache Storage（`vrt-world-import-v1`），之後 `seasons_express.html` 這個網址就回傳匯入版；網址加 `?builtin=1` 一律回內建版。
- 快速參觀：`seasons_express.html?visit=angkor` 由吳哥窟北池畔開始；點「回列車」繼續旅程。

## 兩種更新
1. **裝置匯入**（Paul 自己做）：入口頁「匯入更新」放 .html 或 .zip。只影響那一台裝置。
2. **換內建版**（AI 做，所有裝置生效）：把新版覆蓋成 `seasons_express.html`，更新 `version.json`，`</body>` 前保留 `<script id="vrt-os-return">`。

原始修改檔與交接筆記不放在這裡，跟著每一版的 `Seasons_Express_v5_x_source_patches.zip`。
