import type { DataStore } from './dataStore'
import type { DailyRecord, SummaryRecord, CalendarOverride } from '../lib/types'

const KEYS = { daily: 'at:daily', summary: 'at:summary', override: 'at:override' }

function read<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}
function write<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows))
}

export const localStore: DataStore = {
  async listDailyRecords() {
    return read<DailyRecord>(KEYS.daily)
  },
  async saveDailyRecord(r) {
    const rows = read<DailyRecord>(KEYS.daily).filter((x) => x.date !== r.date)
    rows.push(r)
    write(KEYS.daily, rows)
  },
  async deleteDailyRecord(date) {
    write(KEYS.daily, read<DailyRecord>(KEYS.daily).filter((x) => x.date !== date))
  },
  async listSummaries() {
    return read<SummaryRecord>(KEYS.summary)
  },
  async saveSummary(s) {
    const rows = read<SummaryRecord>(KEYS.summary).filter((x) => x.id !== s.id)
    rows.push(s)
    write(KEYS.summary, rows)
  },
  async deleteSummary(id) {
    write(KEYS.summary, read<SummaryRecord>(KEYS.summary).filter((x) => x.id !== id))
  },
  async listOverrides() {
    return read<CalendarOverride>(KEYS.override)
  },
  async saveOverride(o) {
    const rows = read<CalendarOverride>(KEYS.override).filter((x) => x.date !== o.date)
    rows.push(o)
    write(KEYS.override, rows)
  },
  async deleteOverride(date) {
    write(KEYS.override, read<CalendarOverride>(KEYS.override).filter((x) => x.date !== date))
  },
}
