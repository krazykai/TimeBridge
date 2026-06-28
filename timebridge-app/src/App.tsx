import { useState } from 'react'
import './App.css'
import Timeline from './components/Timeline'
import NowButton from './components/NowButton'
import TimeZoneSelect from './components/TimeZoneSelect'
import { snapTo30Min } from './utils/time'
import { TIME_ZONE_OPTIONS } from './data/timeZones'
import { useTimeZoneSettings } from './hooks/useTimeZoneSettings'

function getLabelForTz(tz: string): string {
  return TIME_ZONE_OPTIONS.find(o => o.tz === tz)?.label ?? tz
}

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => snapTo30Min(new Date()))
  const [resetKey, setResetKey] = useState(0)
  const { tz1, tz2, setTz1, setTz2 } = useTimeZoneSettings()

  const goToNow = () => {
    setSelectedDate(snapTo30Min(new Date()))
    setResetKey(k => k + 1) // 觸發 scroll 回到中心
  }

  return (
    <div className="app">
      <h1 className="app-title">TimeBridge</h1>

      <div className="tz-selectors">
        <TimeZoneSelect value={tz1} disabledValue={tz2} onChange={setTz1} />
        <span className="tz-selectors-sep">⇄</span>
        <TimeZoneSelect value={tz2} disabledValue={tz1} onChange={setTz2} />
      </div>

      <Timeline
        selectedDate={selectedDate}
        tz1={tz1}
        tz2={tz2}
        tz1Label={getLabelForTz(tz1)}
        tz2Label={getLabelForTz(tz2)}
        resetKey={resetKey}
        onSelectDate={setSelectedDate}
      />

      <NowButton onClick={goToNow} />
    </div>
  )
}
