export interface TimeZoneOption {
  label: string
  tz: string
}

export interface TimeSlot {
  utc: Date        // 這個格子代表的 UTC 時間點
  label: string    // 顯示用的時間字串，例如 "09:30"
  dateLabel: string // 短日期，例如 "06/29"
  showDate: boolean // 是否顯示日期（跨日時為 true）
}
