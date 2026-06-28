import { useRef, useEffect, useState, useCallback } from 'react'
import { generateSlots, snapTo30Min, formatDate } from '../utils/time'

const SLOT_WIDTH = 72
const VISIBLE_SLOTS = 48

interface TimelineProps {
  selectedDate: Date
  tz1: string
  tz2: string
  tz1Label: string
  tz2Label: string
  resetKey: number          // 每次「回到現在」+1，觸發 scroll 重置
  onSelectDate: (date: Date) => void
}

export default function Timeline({
  selectedDate,
  tz1,
  tz2,
  tz1Label,
  tz2Label,
  resetKey,
  onSelectDate,
}: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)

  const slots1 = generateSlots(selectedDate, tz1, VISIBLE_SLOTS)
  const slots2 = generateSlots(selectedDate, tz2, VISIBLE_SLOTS)
  const slotsRef = useRef(slots1)
  slotsRef.current = slots1

  const [liveDate, setLiveDate] = useState(selectedDate)

  const getCenterDate = useCallback((): Date => {
    const el = scrollRef.current
    if (!el) return selectedDate
    const centerOffset = el.scrollLeft + el.clientWidth / 2
    const slotIndex = Math.round(centerOffset / SLOT_WIDTH)
    const clamped = Math.max(0, Math.min(slotIndex, slotsRef.current.length - 1))
    return snapTo30Min(slotsRef.current[clamped].utc)
  }, [selectedDate])

  // 只在 resetKey 變化時重置 scroll（「回到現在」觸發）
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const centerSlotMid = VISIBLE_SLOTS * SLOT_WIDTH + SLOT_WIDTH / 2
    el.scrollLeft = centerSlotMid - el.clientWidth / 2
    setLiveDate(selectedDate)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // 監聽 scroll 事件，即時更新日期顯示
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => setLiveDate(getCenterDate())
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [getCenterDate])

  // 滑鼠滾輪：垂直轉水平
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      el.scrollLeft += e.deltaY + e.deltaX
      setLiveDate(getCenterDate())
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [getCenterDate])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true
    startX.current = e.clientX
    startScrollLeft.current = scrollRef.current?.scrollLeft ?? 0
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    const dx = e.clientX - startX.current
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = startScrollLeft.current - dx
      setLiveDate(getCenterDate())
    }
  }

  const onPointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    onSelectDate(getCenterDate())
  }

  return (
    <div className="timeline-wrapper">
      <div className="tz-label-row">
        <span className="tz-label-name">{tz2Label}</span>
        <span className="tz-label-date">{formatDate(liveDate, tz2)}</span>
      </div>

      <div className="timeline-scroll-container">
        <div className="timeline-center-line" />
        <div
          className="timeline-scroll"
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="timeline-content">
            <div className="timeline-row">
              {slots2.map((slot, i) => (
                <div
                  key={i}
                  className={`timeline-slot ${i === VISIBLE_SLOTS ? 'is-center' : ''}`}
                  style={{ width: SLOT_WIDTH }}
                >
                  <span className="slot-time">{slot.label}</span>
                </div>
              ))}
            </div>

            <div className="timeline-divider" />

            <div className="timeline-row">
              {slots1.map((slot, i) => (
                <div
                  key={i}
                  className={`timeline-slot ${i === VISIBLE_SLOTS ? 'is-center' : ''}`}
                  style={{ width: SLOT_WIDTH }}
                >
                  <span className="slot-time">{slot.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tz-label-row">
        <span className="tz-label-name">{tz1Label}</span>
        <span className="tz-label-date">{formatDate(liveDate, tz1)}</span>
      </div>
    </div>
  )
}
