export interface TimeZoneOption {
  label: string
  tz: string
  lat: number
  lng: number
}

export interface TimeSlot {
  utc: Date
  label: string
  dateLabel: string
  showDate: boolean
  isDay: boolean
}
