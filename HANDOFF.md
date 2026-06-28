# TimeBridge — Claude Code Handoff

## Project

手機優先的雙時區時間軸 Web App（React + TypeScript + Vite）。
Git repo 位於 `timebridge-app/`，尚未 push 到 GitHub。

---

## Current Progress

| Phase | 狀態 | 說明 |
|-------|------|------|
| 1 Vite + React + TS | ✅ | `timebridge-app/` 已建立 |
| 2 雙時區時鐘 | ✅ | Intl.DateTimeFormat，正確處理夏令時間 |
| 3 工具函式 | ✅ | `utils/time.ts`, `types/timeZone.ts`, `data/timeZones.ts` |
| 4 靜態時間軸 | ✅ | 97 格（±24h），每格 30min，72px |
| 5 拖動滑動 | ✅ | Pointer Events + 滾輪轉水平 |
| 6 選取時間更新 | ✅ | 拖動放開後更新 selectedDate，不自動回中心 |
| 7 回到現在 | ✅ | resetKey 機制，只有此按鈕觸發 scroll reset |
| 8 時區切換 + localStorage | ✅ | 下拉選單，不允許兩區相同，localStorage 持久化 |
| 9 手機優化 | ✅ | viewport-fit=cover, safe-area-inset, overscroll-behavior:none |
| 10 GitHub + Vercel | ❌ 未做 | git init 已跑，尚未 push |
| 11 PWA | ❌ 未做 | |

---

## Todo List

1. **GitHub**: 在 github.com 建立 repo → `git remote add origin <url>` → `git push -u origin main`
2. **Vercel**: import GitHub repo，Build Command: `npm run build`，Output: `dist`
3. **PWA**: `vite-plugin-pwa`，manifest，icons，offline cache，`display: standalone`
4. **iPhone 測試**: 實機確認滑動流暢度、Safari 底部工具列遮擋、深色模式
5. **時間軸邊界**: 滑到盡頭時無縫延伸（目前固定 ±24h，到邊緣就停）

---

## Tech Decisions

| 決定 | 原因 |
|------|------|
| `Intl.DateTimeFormat` 做所有時區轉換 | 不用固定時差（如 -15h），自動處理夏令時間（DST） |
| `resetKey` prop 控制 scroll reset | 拖動後 `selectedDate` 更新會觸發重繪，若直接 watch `selectedDate` 會強制 scroll 回中心；`resetKey` 分離「外部重置」與「拖動更新」 |
| `inline-flex` 包住 `.timeline-content` | `.timeline-divider` 預設 `width: 100%` 只撐到 viewport 寬，不跟著 97 格延伸；用 `inline-flex` 讓分隔線撐滿 slot 總寬 |
| Pointer Events + `setPointerCapture` | 同時處理滑鼠拖動與觸控，不需分開寫 mouse/touch handler |
| `liveDate` 本地 state | scroll 中即時更新日期顯示，不污染 parent 的 `selectedDate` |
| `overscroll-behavior: none` on body | 防止 iOS pull-to-refresh 干擾時間軸拖動 |

---

## Potential Bugs

- **時間軸邊界跳動**：滑到最左/右邊緣放開，`getCenterDate()` clamped 到第一/最後格，`selectedDate` 更新後 slots 重算，scroll 位置可能對不上
- **時區切換後 scroll 不重置**：切換時區時 `selectedDate` 不變、`resetKey` 不變，slots 重算但 scroll 停留原位，可能造成視覺錯位（中央線對應時間與標籤不符）——建議切換時區時也 increment `resetKey`
- **滾輪事件 passive 衝突**：`wheel` listener 用 `passive: false` + `preventDefault()`，若瀏覽器策略改變可能失效
- **iOS Safari 滑動慣性**：目前無 momentum scrolling，手指快速 swipe 後停得很突然，UX 略差

---

## File Structure

```
timebridge-app/src/
├── App.tsx
├── main.tsx
├── index.css
├── App.css
├── components/
│   ├── Timeline.tsx       # 核心：時間軸 + 拖動 + liveDate
│   ├── NowButton.tsx
│   └── TimeZoneSelect.tsx
├── data/timeZones.ts      # 時區清單 + 預設值
├── hooks/useTimeZoneSettings.ts  # localStorage 持久化
├── types/timeZone.ts
└── utils/time.ts          # snapTo30Min, formatTime, formatDate, generateSlots
```
