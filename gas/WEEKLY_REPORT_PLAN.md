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
