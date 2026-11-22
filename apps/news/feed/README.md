# Saintdou NEWS 雲端 feed（每週新聞自動發群組）

Paul（2026-11-22）：新聞要像之前 Gemini／ChatGPT 的排程一樣，每週固定那天、那個時間，發某一類新聞到群組，新聞頁也要自動更新。

## 怎麼運作

1. **Claude 每天 06:40（金邊時間）跑一次**（Claude 的排程工作「Saintdou NEWS 每日新聞整理」）。
   - 讀 `schedules.json`，找出 `active: true`、而且 `weekdays` 含今天星期幾（0＝星期日…6＝星期六，金邊時間）的任務。
   - **例假日不發**（Paul 2026-11-22）：今天是星期六、星期日，或是柬埔寨國定假日（清單在 `ac-admin/shared/canteen-core.js` 的 `HOLIDAYS`，日期格式 `YYYY-MM-DD`），就什麼都不寫、直接結束（不補發）。
     例外：任務有 `allowWeekend: true`（目前是「每週易經」，星期六 08:00）→ 星期六、日照發；國定假日一樣不發。易經那期的 items 放 2–3 則真實藝文新聞，專欄內容寫在 body 和 tg。
   - 每個任務上網找**過去 7 天**的新聞，照 `prompt` 寫一期，加進 `latest.json` 最前面。`sendAt` 設成今天的 `time`（+07:00；目前一律 08:00）。
   - `id` 用 `<task id>-<YYYY-MM-DD>`。同一個 id 已經有了就跳過，不要重複寫。
2. **AC_ADMIN_CENTER（GAS）每 10 分鐘看一次 `latest.json`**。到了 `sendAt`、還沒發過（而且在 12 小時內）的那一期，把 `tg` 發到行政中心群組，附一顆「📰 打開新聞」鈕。每一期只發一次，失敗最多重試 3 次。
3. **新聞頁（apps/news/index.html）每次打開都讀這兩個檔**。過了 `sendAt` 的期數會變成文章卡（每期一張總覽，加上每則新聞一張），排程分頁也顯示這份雲端排程。

要新增排程、改星期幾或幾點、改主題，就改 `schedules.json`（Paul 直接跟 Claude 說）。

## latest.json 的格式

```json
{"updated":"2026-11-25T06:52:00+07:00","issues":[
 {"id":"textile-2026-11-25","task":"textile","title":"每週紡織成衣新聞｜11/25","cat":"textile",
  "sendAt":"2026-11-25T07:35:00+07:00","created":"2026-11-25T06:52:00+07:00",
  "headline":"一句話講本週最重要的事",
  "body":"完整簡報純文字（小標＋段落，用 \n 換行），給新聞頁的「完整內容」",
  "tg":"Telegram HTML 訊息（見下面規則）",
  "items":[{"title":"中文標題","titleEn":"English headline","summary":"2–3 句重點","why":"對 VRT（柬埔寨西港成衣廠）的意義，1 句",
            "source":"Reuters","url":"https://...","date":"2026-11-21","cat":"textile"}]}
]}
```

- 最多保留 40 期（舊的從尾巴刪）。
- `cat` 只能用新聞頁有的分類：`world`、`taiwan`、`cambodia`、`asean`、`finance`、`ai`、`textile`、`fashion`、`japan`、`malaysia`、`culture`、`breaking`。
- 每則都要有真的 `url`（是 WebSearch 或 WebFetch 實際拿到的網址），不可以編造。找不到 4 則像樣的新聞就少寫幾則，並在 headline 註明。

## `tg`（Telegram）規則

- 只能用 `<b>`、`<i>`、`<a href="...">`；`&`、`<`、`>` 要轉成 `&amp;`、`&lt;`、`&gt;`。全長不超過 3500 字元。
- 內容用繁體中文，每則加一行簡短英文標題。保留圖示，「精簡但不能什麼都沒有」。
- 建議格式：

```
📰 <b>每週紡織成衣新聞｜11/25（三）</b>
Weekly textile &amp; garment news
早安，本週重點：一句話。

<b>1. 中文標題</b>
<i>English headline</i>
2 句重點。<a href="https://...">Reuters</a>

…（共 4–6 則）

🏭 <b>對 VRT 的意義</b>
• …
• …
```
