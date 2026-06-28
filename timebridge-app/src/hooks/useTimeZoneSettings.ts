import { useState } from 'react'
import { DEFAULT_TZ_1, DEFAULT_TZ_2 } from '../data/timeZones'

const STORAGE_KEY_TZ1 = 'timebridge_tz1'
const STORAGE_KEY_TZ2 = 'timebridge_tz2'

function loadFromStorage(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

export function useTimeZoneSettings() {
  const [tz1, setTz1Internal] = useState(() => loadFromStorage(STORAGE_KEY_TZ1, DEFAULT_TZ_1))
  const [tz2, setTz2Internal] = useState(() => loadFromStorage(STORAGE_KEY_TZ2, DEFAULT_TZ_2))

  const setTz1 = (tz: string) => {
    setTz1Internal(tz)
    saveToStorage(STORAGE_KEY_TZ1, tz)
  }

  const setTz2 = (tz: string) => {
    setTz2Internal(tz)
    saveToStorage(STORAGE_KEY_TZ2, tz)
  }

  return { tz1, tz2, setTz1, setTz2 }
}
