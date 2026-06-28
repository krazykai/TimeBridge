import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import { generateSlots, snapTo30Min, formatDate } from '../utils/time'

const SLOT_WIDTH = 72
const TOTAL_SLOTS = 96      // center ± 96 = 193 格（±48 小時）
const EDGE_THRESHOLD = 20   // 距邊緣幾格時觸發延伸
const SHIFT_SLOTS = 48      // 每次延伸移動幾格

interface TimelineProps {
  selectedDate: Date
  tz1: string
  tz2: string
  tz1Label: string
  tz2Label: string
  resetKey: number
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
  const pendingScrollAdjust = useRef(0)

  // slotCenter 控制槽位視窗，獨立於 selectedDate
  const [slotCenter, setSlotCenter] = useState(selectedDate)

  const slots1 = generateSlots(slotCenter, tz1, TOTAL_SLOTS)
  const slots2 = generateSlots(slotCenter, tz2, TOTAL_SLOTS)
  const slotsRef = useRef(slots1)
  slotsRef.current = slots1

  const [liveDate, setLiveDate] = useState(selectedDate)

  const getCenterDate = useCallback((): Date => {
    const el = scrollRef.current
    if (!el) return slotCenter
    const centerOffset = el.scrollLeft + el.clientWidth / 2
    const slotIndex = Math.round(centerOffset / SLOT_WIDTH)
    const clamped = Math.max(0, Math.min(slotIndex, slotsRef.current.length - 1))
    return snapTo30Min(slotsRef.current[clamped].utc)
  }, [slotCenter])

  // 邊界延伸：接近左右邊緣時移動 slotCenter 並補償 scrollLeft
  const extendIfNeeded = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const totalWidth = (TOTAL_SLOTS * 2 + 1) * SLOT_WIDTH
    const threshold = EDGE_THRESHOLD * SLOT_WIDTH
    const halfMs = SHIFT_SLOTS * 30 * 60 * 1000

    if (el.scrollLeft < threshold) {
      pendingScrollAdjust.current = SHIFT_SLOTS * SLOT_WIDTH
      setSlotCenter(prev => new Date(prev.getTime() - halfMs))
    } else if (el.scrollLeft > totalWidth - el.clientWidth - threshold) {
      pendingScrollAdjust.current = -SHIFT_SLOTS * SLOT_WIDTH
      setSlotCenter(prev => new Date(prev.getTime() + halfMs))
    }
  }, [])

  // 在 re-render 後、繪製前同步補償 scrollLeft，讓使用者感覺不到位移
  useLayoutEffect(() => {
    if (pendingScrollAdjust.current !== 0 && scrollRef.current) {
      scrollRef.current.scrollLeft += pendingScrollAdjust.current
      pendingScrollAdjust.current = 0
    }
  })

  // resetKey 變化 → 重置 slotCenter 並回到中心
  useEffect(() => {
    setSlotCenter(snapTo30Min(selectedDate))
    setLiveDate(selectedDate)
    // scrollLeft 重置由 slotCenter 更新觸發的 useLayoutEffect 後處理
    // 但這裡需要設定正確的初始位置
    pendingScrollAdjust.current = 0
    requestAnimationFrame(() => {
      const el = scrollRef.current
      if (!el) return
      const centerSlotMid = TOTAL_SLOTS * SLOT_WIDTH + SLOT_WIDTH / 2
      el.scrollLeft = centerSlotMid - el.clientWidth / 2
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // scroll 事件：更新 liveDate + 觸發邊界延伸
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      setLiveDate(getCenterDate())
      extendIfNeeded()
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [getCenterDate, extendIfNeeded])

  // 滾輪：垂直轉水平
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
                  className={`timeline-slot ${i === TOTAL_SLOTS ? 'is-center' : ''}`}
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
                  className={`timeline-slot ${i === TOTAL_SLOTS ? 'is-center' : ''}`}
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
