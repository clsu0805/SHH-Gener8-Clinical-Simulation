# Immersive Clinical Simulation & Situation Awareness Platform

Gener8 沉浸式臨床情境覺察教案網站。

## 系統定位
- **Gener8 Engine**：負責 5760×1080 三面牆、互動、狀態切換、全螢幕與未來的影片/音訊/monitor 元件。
- **Clinical Scenario Package**：負責病例資料、題目、答案與案例媒體。第一個案例為 AECOPD。

## v0.1 網站版
目前已建立可直接由 GitHub Pages 發布的單頁網站骨架，包含：
- 深藍色三面牆介面
- 5760×1080 舞台比例，自動縮放至瀏覽器
- AECOPD 第二幕：病況惡化 → Lung Sound → ABG → 主要處置 → NIV 後改善
- Lung Sound 單選回饋
- ABG 判讀單選回饋
- 主要處置多選回饋
- 快捷鍵：2 / L / A / T / N / F

## GitHub Pages
完成檔案後，到 Repository：
Settings → Pages → Deploy from a branch → main → /(root)

網站網址預期為：
https://clsu0805.github.io/SHH-Gener8-Clinical-Simulation/

## 下一版
- 將第一幕完整內容轉入
- 加入原 PPT 的病人影片、monitor 影片與呼吸音
- 建立教師控制台
- 增加 Reset / Lock / 教學模式
- 加入 GitHub Actions 驗證與發布流程

> 注意：網站版本不得放置真實病人可識別資料。
