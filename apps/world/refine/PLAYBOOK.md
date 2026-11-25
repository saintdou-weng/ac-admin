# 世界鐵道・每晚自動精修 — 作業規則

每晚一次、只做一小步，讓第四島的環境與建築逐步更接近真實照片。由排程工作「世界鐵道每晚精修」執行。

## 範圍
- 目前只做 **第四島（里約、開普敦、巴黎、伊斯坦堡、城堡樂園）的環境與建築**；人車、介面、其他島不動。
- 只改這幾個 **兩檔共用** 的程式區塊（改在 `island4.html`，再用 `tools/sync_blocks.py` 原樣複製進 `seasons_express.html`）：
  `island4-five-regions-rebuild`、`island4-town-realism-v67`、`island4-landmarks-cutaway-v67`、`fourth-island-world`（只限地形／地面，**不動鐵路線形與車站**）。
- 不碰：`index.html`、`sw.js`、`island1~3.html`、只存在單一檔的區塊（`island4-standalone-*`、`standalone-scope-*`）。

## 每一步
1. `git pull`，讀 `backlog.md` 第一個 `[ ]` 項目、`log.md` 最近幾筆（有 Paul 的「退回」要求就先處理：`git revert` 那一筆並重新同步）。
2. 用 `tools/check.py` 拍「改前」截圖（相機寫在 `shots/<項目編號>.json`，沒有就先建，一個項目 2–4 張：遠景＋近景＋手機 390×844）。
3. 只改一個小地方（例：一排公寓的陽台與窗框、一段海岸礁石、一片樹林的樹種與疏密、清真寺圓頂細節）。寧可小，不可大。
4. `python3 refine/tools/sync_blocks.py <改過的區塊 id>`。
5. 驗收（全部要過，沒過就整步丟棄、`git checkout .`，在 log 記原因，項目留著下次換方法）：
   - `check.py` 跑 `island4.html` 和 `seasons_express.html?route=four`：**零錯誤**
   - 第四島三角形數：單步增加 ≤ 3%，總量 ≤ 1,450,000（以 check.py 量的可見三角形為準；基準 2026-11-25：1,099,065）
   - 兩個檔各自單步變大 ≤ 120 KB
   - 人車數不變（基準 行人 204／車 46），鐵路、車站、步行網不受影響（不改 `island4-street-life`）
   - 改後截圖和改前並排看：要**明顯更像真實照片**，沒有穿模、浮空、泡水、擋住鐵路
6. 過了才提交：`git commit -m "world refine #<編號>: <一句話>"` → push。各裝置打開總控台時只會下載有改的兩個檔（內建版較新會蓋過舊的雲端匯入）。
7. 在 `log.md` 最上方加一筆（日期、編號、改了什麼、三角形數與檔案大小變化、過/不過），`backlog.md` 打勾；項目做不完就拆成更小的子項。
8. 用手機推播通知 Paul（繁體中文、三行內：今天改了哪裡、看哪一站、檢查結果）。

## 參考
- 參考照片重點見 `backlog.md` 開頭；Paul 的要求：越逼真越好、好看順眼、不礙眼、不能像積木。
- 「退回」：Paul 說退回哪一天／哪一項，就 `git revert` 那筆 commit，重新同步、記 log。
