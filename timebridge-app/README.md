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

手機測試（同 Wi-Fi）：將 `localhost` 換成電腦的區域 IP，例如 `http://192.168.0.17:5173`

---

## 建置與部署

```bash
npm run build   # 輸出至 dist/
npm run preview # 本機預覽 production build
```

Vercel 設定：
- **Root Directory**: `timebridge-app`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

每次推送至 `master` 分支會自動重新部署。

---

## 專案結構

```
timebridge-app/src/
├── App.tsx
├── components/
│   ├── Timeline.tsx          # 時間軸核心：拖動、無限延伸、liveDate
│   ├── NowButton.tsx
│   └── TimeZoneSelect.tsx
├── data/timeZones.ts         # 時區清單與預設值
├── hooks/useTimeZoneSettings.ts  # localStorage 持久化
├── types/timeZone.ts
└── utils/time.ts             # snapTo30Min, formatTime, formatDate, generateSlots
```
