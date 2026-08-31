import type { DailyRecord, SummaryRecord, CalendarOverride } from '../lib/types'

export interface DataStore {
  listDailyRecords(): Promise<DailyRecord[]>
  saveDailyRecord(r: DailyRecord): Promise<void>
  deleteDailyRecord(date: string): Promise<void>
  listSummaries(): Promise<SummaryRecord[]>
  saveSummary(s: SummaryRecord): Promise<void>
  deleteSummary(id: string): Promise<void>
  listOverrides(): Promise<CalendarOverride[]>
  saveOverride(o: CalendarOverride): Promise<void>
  deleteOverride(date: string): Promise<void>
}

const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY
// 存储模式：VITE_STORAGE=local 强制用本地 localStorage；否则有 Supabase 配置用云库，再否则本地
const useLocal = import.meta.env.VITE_STORAGE === 'local'

export async function getDataStore(): Promise<DataStore> {
  if (!useLocal && hasSupabase) {
    const { supabaseStore } = await import('./supabaseStore')
    return supabaseStore
  }
  const { localStore } = await import('./localStore')
  return localStore
}
