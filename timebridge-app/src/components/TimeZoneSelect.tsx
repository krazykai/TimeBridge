import { TIME_ZONE_OPTIONS } from '../data/timeZones'

interface TimeZoneSelectProps {
  value: string
  disabledValue: string // 不允許和另一個時區相同
  onChange: (tz: string) => void
}

export default function TimeZoneSelect({ value, disabledValue, onChange }: TimeZoneSelectProps) {
  return (
    <select
      className="tz-select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {TIME_ZONE_OPTIONS.map(opt => (
        <option key={opt.tz} value={opt.tz} disabled={opt.tz === disabledValue}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
