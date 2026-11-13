# 行政中心每週五 09:00 全系統週報 — 進度與接手筆記（2026-11-13）

Paul 11/13：每週五早上 9 點發「當週」週報，分 ① 生產 ② 人事行政；以 PSJERP／PSJHR／PSJGA 為主；寫法照各平台摘要（REPORT_STANDARD.md，在 PSJERP repo）；
有問題可以問 bot；問法與設計參考 PROD。

## 已上線
- **AC_ADMIN_CENTER GAS v2.2.0（部署第 17 版）**：原始碼 `gas/admin-talk-v2.1.0.txt`（群組對話）＋ `gas/admin-weekly-v2.2.0.txt`（週報＋問答）。
  - `weeklyTick_()` 掛在每分鐘的 `pollAdminTelegram` 裡（鎖內）：週五 09:00–12:00、`WEEKLY_SENT`≠本週週一 → 發；失敗最多試 3 次（`WEEKLY_TRY`）。
  - `previewWeekly()` 只看不發；`sendWeeklyNow()` 立刻重算並發。錯誤在指令碼屬性 `WEEKLY_LAST_ERROR`。
  - 發過的文字存在 `WEEKLY_TEXT_prod`／`WEEKLY_TEXT_admin`、數字 `WEEKLY_FACTS_prod`（問答用）。
  - 問答：開頭打 ？ 或回覆週報。有 `CLAUDE_API_KEY`（指令碼屬性，Paul 自己貼）→ Claude 依週報回答（每天 40 題）；沒有 → 從週報找相關行。「？重算」＝重算重發。
- **VRT Production GAS v4.28（部署第 41 版）**：`dailyReportWeekNow`（doPost，唯讀）回傳最新車縫資料那一週到目前為止的效率週報（情境版 html＋精簡 facts），
  只算不存不發。計算約 90 秒，所以 `adminWeekWarm` 每週五約 08:15 先算好放快取 6 小時（`installAdminWeekWarm()` 已執行）。程式在 `v412_compact_daily_report.gs` 最後。
  注意：這次部署把 11/12 的 v4.15／v4.27（原本只靠觸發器跑 HEAD）一起變成網頁版。

## 還沒做（人事行政那一份目前不會發）
`AC_WEEKLY.HR_URL`／`GA_URL` 是空的；填上「回傳 `{ok:true, html 或 text}` 的唯讀網址」就會自動併成「🧑‍💼 人事行政週報」。
1. **人事**：在 AC_HRA_CloudSync 加一個唯讀動作，照 `weeklyAttendanceRun71_`（gas/v71_weekly_attendance.gs.txt）的作法但週一取「本週」，
   回傳 `HRAAttTg.build({mode:'weekly',lang:'both',…})` 的文字（＝Paul 核過的考勤週報格式）。11/13 凌晨別的工作階段正在改這個專案（01:16），所以沒有動它。
   之後可加：入離職本週／本月累計、人力缺額、證照簽證到期。PSJHR（BEST 鏡像）的在職人數可再併入。
2. **總務保全**：PSJGA_CORE 的雲端快照（`psjgaSummary_` 已能算週摘要，但要金鑰且不確定快照有沒有在更新）。可加一個不含個資的唯讀週摘要動作，
   或直接向 SEC／GASCheck／GA-EXP 各自的週摘要要資料。
3. **機器人讀一般訊息**：@ac_admin_center_bot 在群組是一般成員（`checkGroupReading()`），Telegram 只送指令和「回覆它的訊息」給它；
   開頭打 ？ 要能收到，需把它設成群組管理員（等 Paul 同意）。
4. 資料時間：車縫日報通常下午才匯入，週五 09:00 的「當週」多半只到週二～週三。可改週五 16:30 或週六早上再發（等 Paul 決定）。

## 11/13 02:45 更新（Paul：改週六、設管理員、金鑰不自己貼、人事自己跟進、全自動）
- **改週六 09:00**：AC_ADMIN_CENTER `AC_WEEKLY.DOW=6`（v2.2.3，部署第 20 版）；PROD 的 `adminWeekWarm` 觸發器改週六約 08:15（PROD 部署第 42 版）。
- **人事已接上**：AC_HRA_CloudSync 加 `adminWeekNow`（doGet，唯讀，`adminWeekAttendance74_`，在檔案最後；快取 30 分鐘；部署第 103 版）。
  回傳本週到目前的考勤週報（HRAAttTg，中＋英）。`AC_WEEKLY.HR_URL` 已填。預覽 11/10–11/12：出勤率 94.3%、已核對正確。
- **AI 問答不用貼金鑰**：行政中心沒有金鑰時走 `weeklyClaudeRelay_` → PROD `dailyReportAdminAsk`（`adminAsk_`）。PROD 先回頭問行政中心 `doGet qaNonce`
  確認一次性號碼才用自己的 `CLAUDE_API_KEY` 回答；每天 40 題。`checkWeeklyQa()` 測過會回答。
- **/ask 指令**：`/ask L1 效率`（指令在隱私模式也收得到，已加進群組指令選單）。開頭打「？」仍需要 bot 是管理員。
- **沒做成**：把 bot 設成群組管理員——瀏覽器工具不允許開 web.telegram.org。改用 /ask 與「回覆週報」。
- **還沒做**：總務保全（`GA_URL` 空）；人事可再加入離職明細／人力缺額／證照到期；首次自動發送是 11/14（六）09:00，發完要看實際訊息。

## 11/13 08:40 更新
- **群組編號變了**：把 bot 設成管理員時 Telegram 把「AI AC System」升級成超級群組，Chat ID 由 `-5446063094` 變成 **`-1003749472443`**。
  AC_ADMIN_CENTER `AC_ADMIN.CHAT_ID` 已改（v2.2.4，其他地方若還寫舊編號要一起改）。bot 現在是管理員（只有置頂權限），一般訊息都收得到；實測「？出勤率」有回。
- v2.2.5–2.2.6（部署第 23 版）：手動「？重算」不再佔掉週六自動發送；已處理過的訊息不會重做（11/13 08:33、08:35 重發了兩次就是這個洞）；
  重算前先記已收。`weeklyNotIn_`：最新資料日之後的日子寫「⏳ 日報還沒匯入」，不寫「沒有生產」（Paul：不是沒生產，是日報還沒從 Outlook 下載，前一天的報告下午才出來）。
- 11/13 08:36 已清掉 WEEKLY_SENT，11/14（六）09:00 會照常自動發。

## 11/13 09:00 更新：總務保全接上（AC_ADMIN_CENTER v2.3.0，部署第 24 版）
- PSJGA_CORE 雲端沒有快照（從來沒有人上傳過），所以不能當來源。改成行政中心直接問三個來源後端公開的 `smartManifest`（17 個模組的雲端最後更新時間）
  ＋ SEC `weeklyDigestStatus`（摘要待發）。程式 `gas/admin-weekly-ga-v2.3.0.txt`（`weeklyGa_`，`checkWeeklyGa()` 只看不發）。沒有動 SEC／GASCheck／GA-EXP。
- 只列「更新狀態」不列筆數：各模組月份桶寫法不同（m:2026-11、m:2026-11:分類、m:2026-11~分段、h:xx），筆數容易算錯。
- 還沒列入：採購、維修、損壞、燃油、行車、ETC（不走 smartManifest）。要真正的件數／金額，得讓 VRT GA 把整理好的紀錄上傳雲端，或各後端提供週統計。
- PSJGA_CORE 專案 HEAD 多了 `psjgaAdminWeek_`／`doGet(e)`（v1.1.8，已存檔、**沒有部署**，目前沒用到；有快照以後可以直接用）。
- `previewWeekly()` 11/13 08:55 三段都有內容、errors 空。人事行政那則約 3,900 字，會自動照行切成兩則。

## 11/13 09:40 更新（v2.3.1，已存檔；網頁部署仍是第 24 版，週報走排程用 HEAD 所以已生效）
- Paul：鑰匙不用燈號，要按人／組／部門看「發出幾把、庫存幾把」；總務保全的件數若難做就不做。
- 查過 GASCheck 雲端：keymovement 25 筆全部是 8/15–8/16 刪除的（tombstone），沒有有效紀錄，雲端也沒有鑰匙名單（vrt_key_master 不是 smart tool）。
  → 沒有資料可算，先把「鑰匙借還」從週報拿掉。等鑰匙頁重新登記並上傳後再做「按部門／領用人：借出中、已歸還、在庫」。
- 總務保全維持「更新狀態」16 個模組，不做件數。
- AI 問答不需要 Paul 貼金鑰（走 PROD 代問），他 09:35 又問「在哪一行」→ 已回覆不用加。
