import { createClient } from '@supabase/supabase-js'
import type { DataStore } from './dataStore'
import type { DailyRecord } from '../lib/types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string
const db = createClient(url, anon)

function toTime(t: string | null): string | null {
  return t ? t.slice(0, 8) : null
}

export const supabaseStore: DataStore = {
  async listDailyRecords() {
    const { data, error } = await db.from('daily_records').select('*').order('date', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: any) => ({ date: r.date, start_time: toTime(r.start_time), end_time: toTime(r.end_time) }) as DailyRecord)
  },
  async saveDailyRecord(r) {
    const { error } = await db.from('daily_records').upsert({ date: r.date, start_time: r.start_time, end_time: r.end_time }, { onConflict: 'date' })
    if (error) throw error
  },
  async deleteDailyRecord(date) {
    const { error } = await db.from('daily_records').delete().eq('date', date)
    if (error) throw error
  },
  async listSummaries() {
    const { data, error } = await db.from('summary_records').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((r: any) => ({ id: r.id, start_date: r.start_date, end_date: r.end_date, total_hours: Number(r.total_hours), work_days: r.work_days, note: r.note, created_at: r.created_at }))
  },
  async saveSummary(s) {
    const { error } = await db.from('summary_records').upsert({ id: s.id, start_date: s.start_date, end_date: s.end_date, total_hours: s.total_hours, work_days: s.work_days, note: s.note })
    if (error) throw error
  },
  async deleteSummary(id) {
    const { error } = await db.from('summary_records').delete().eq('id', id)
    if (error) throw error
  },
  async listOverrides() {
    const { data, error } = await db.from('calendar_overrides').select('*')
    if (error) throw error
    return (data ?? []).map((r: any) => ({ date: r.date, is_workday: r.is_workday }))
  },
  async saveOverride(o) {
    const { error } = await db.from('calendar_overrides').upsert({ date: o.date, is_workday: o.is_workday }, { onConflict: 'date' })
    if (error) throw error
  },
  async deleteOverride(date) {
    const { error } = await db.from('calendar_overrides').delete().eq('date', date)
    if (error) throw error
  },
}
