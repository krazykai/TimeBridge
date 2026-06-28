import type { TimeZoneOption } from '../types/timeZone'

export const TIME_ZONE_OPTIONS: TimeZoneOption[] = [
  { label: '台北',   tz: 'Asia/Taipei',            lat: 25.04,  lng: 121.53 },
  { label: '溫哥華', tz: 'America/Vancouver',       lat: 49.25,  lng: -123.12 },
  { label: '東京',   tz: 'Asia/Tokyo',              lat: 35.69,  lng: 139.69 },
  { label: '首爾',   tz: 'Asia/Seoul',              lat: 37.57,  lng: 126.98 },
  { label: '倫敦',   tz: 'Europe/London',           lat: 51.51,  lng: -0.13 },
  { label: '紐約',   tz: 'America/New_York',        lat: 40.71,  lng: -74.01 },
  { label: '洛杉磯', tz: 'America/Los_Angeles',     lat: 34.05,  lng: -118.24 },
  { label: '雪梨',   tz: 'Australia/Sydney',        lat: -33.87, lng: 151.21 },
]

export const DEFAULT_TZ_1 = 'Asia/Taipei'
export const DEFAULT_TZ_2 = 'America/Vancouver'
