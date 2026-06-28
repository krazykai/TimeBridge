# TimeBridge

手機優先的雙時區時間軸 Web App，快速對齊兩個城市的時間。

**Live Demo**: https://time-bridge-green.vercel.app

---

## 功能

- **雙時區時鐘** — 同時顯示兩個城市的即時時間，自動處理夏令時間（DST）
- **可拖動時間軸** — 左右滑動選取時間，無限延伸不卡邊界
- **時區選單** — 內建常用城市清單，不允許兩區設定相同時區
- **回到現在** — 一鍵跳回當前時間
- **localStorage 持久化** — 重新整理後保留上次選擇的時區
- **PWA** — 可安裝到手機主畫面，支援離線瀏覽
- **手機優化** — safe-area-inset、overscroll 防護、Pointer Events 觸控支援

---

## 技術棧

- React 19 + TypeScript
- Vite 8
- `Intl.DateTimeFormat` — 時區轉換（不用固定時差，自動 DST）
- `suncalc` — 依據緯經度計算每個時間點的日出／日落，精度 ±1 分鐘，純前端不需 API
- `vite-plugin-pwa` — Service Worker + Web Manifest
- Pointer Events API — 統一處理滑鼠與觸控拖動

---

## 本機開發

```bash
cd timebridge-app
npm install
npm run dev
```

開啟 http://localhost:5173
