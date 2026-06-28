import * as SunCalc from 'suncalc'
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
 * 計算某地某天的日出日落時間（UTC）
 * 使用 suncalc；回傳 null 表示極晝或極夜（sunrise/sunset 為 NaN）
 */
function getSunTimes(
  date: Date,
  lat: number,
  lng: number,
): { sunrise: Date; sunset: Date } | null {
  const times = SunCalc.getTimes(date, lat, lng)
  const rise = times.sunrise
  const set = times.sunset
  if (!rise || !set || isNaN(rise.getTime()) || isNaN(set.getTime())) return null
  return { sunrise: rise, sunset: set }
}

/**
 * 產生時間軸格子清單
 * @param center 中心時間點（已對齊 30 分鐘）
 * @param tz 要顯示的時區
 * @param slots 前後各幾格（總格數 = slots * 2 + 1）
 * @param lat 緯度（用於計算日夜）
 * @param lng 經度（用於計算日夜）
 */
export function generateSlots(
  center: Date,
  tz: string,
  slots = 24,
  lat?: number,
  lng?: number,
): TimeSlot[] {
  const interval = 30 * 60 * 1000
  const result: TimeSlot[] = []

  // 快取每天的日出日落，避免重複計算
  // 使用目標時區的本地日期當 key，避免 UTC 日期切換造成誤判
  // （例如溫哥華 UTC-7，下午 5 點在 UTC 已是隔天 00:00）
  const sunCache = new Map<string, { sunrise: Date; sunset: Date } | null>()
  const getSun = (utc: Date) => {
    if (lat == null || lng == null) return null
    const localDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(utc) // "YYYY-MM-DD" in target timezone
    if (!sunCache.has(localDateStr)) {
      // 傳入本地日期的 UTC 正午，讓 suncalc 算正確的那一天
      const noonUTC = new Date(`${localDateStr}T12:00:00Z`)
      sunCache.set(localDateStr, getSunTimes(noonUTC, lat, lng))
    }
    return sunCache.get(localDateStr) ?? null
  }

  for (let i = -slots; i <= slots; i++) {
    const utc = new Date(center.getTime() + i * interval)
    const dateLabel = formatShortDate(utc, tz)
    const prevDateLabel =
      i === -slots
        ? null
        : formatShortDate(new Date(center.getTime() + (i - 1) * interval), tz)

    const sun = getSun(utc)
    const isDay = sun
      ? utc >= sun.sunrise && utc <= sun.sunset
      : true // 極晝預設白天

    result.push({
      utc,
      label: formatTime(utc, tz),
      dateLabel,
      showDate: dateLabel !== prevDateLabel,
      isDay,
    })
  }

  return result
}
