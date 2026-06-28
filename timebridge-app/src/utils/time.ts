import type { TimeSlot } from '../types/timeZone'

/** 將時間對齊到最近的 30 分鐘（無條件捨去） */
export function snapTo30Min(date: Date): Date {
  const ms = date.getTime()
  const interval = 30 * 60 * 1000
  return new Date(Math.floor(ms / interval) * interval)
}

/** 格式化時間為 HH:mm，依指定時區 */
export function formatTime(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

/** 格式化時間為 HH:mm:ss，依指定時區 */
export function formatTimeWithSeconds(date: Date, tz: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

/** 格式化日期，例如 2026-06-29（週一） */
export function formatDate(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date)

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}（${get('weekday')}）`
}

/** 格式化短日期，例如 "06/29" */
export function formatShortDate(date: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('zh-TW', {
    timeZone: tz,
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('month')}/${get('day')}`
}

/**
 * 產生時間軸格子清單
 * @param center 中心時間點（已對齊 30 分鐘）
 * @param tz 要顯示的時區
 * @param slots 前後各幾格（總格數 = slots * 2 + 1）
 */
export function generateSlots(center: Date, tz: string, slots = 24): TimeSlot[] {
  const interval = 30 * 60 * 1000
  const result: TimeSlot[] = []

  for (let i = -slots; i <= slots; i++) {
    const utc = new Date(center.getTime() + i * interval)
    const dateLabel = formatShortDate(utc, tz)
    const prevDateLabel = i === -slots ? null : formatShortDate(new Date(center.getTime() + (i - 1) * interval), tz)
    result.push({
      utc,
      label: formatTime(utc, tz),
      dateLabel,
      showDate: dateLabel !== prevDateLabel,
    })
  }

  return result
}
