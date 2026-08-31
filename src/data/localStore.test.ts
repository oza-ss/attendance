import { describe, it, expect, beforeEach } from 'vitest'
import { localStore } from './localStore'

beforeEach(() => localStorage.clear())

describe('localStore（localStorage 实现）', () => {
  it('打卡记录 增/查/删', async () => {
    await localStore.saveDailyRecord({ date: '2026-08-25', start_time: '07:00', end_time: '18:00' })
    await localStore.saveDailyRecord({ date: '2026-08-26', start_time: '07:00', end_time: null })
    expect(await localStore.listDailyRecords()).toHaveLength(2)
    await localStore.deleteDailyRecord('2026-08-25')
    const rows = await localStore.listDailyRecords()
    expect(rows).toHaveLength(1)
    expect(rows[0].date).toBe('2026-08-26')
  })

  it('同一天重复保存为覆盖', async () => {
    await localStore.saveDailyRecord({ date: '2026-08-25', start_time: '07:00', end_time: '18:00' })
    await localStore.saveDailyRecord({ date: '2026-08-25', start_time: '08:00', end_time: '19:00' })
    const rows = await localStore.listDailyRecords()
    expect(rows).toHaveLength(1)
    expect(rows[0].start_time).toBe('08:00')
  })

  it('汇总记录 增/删，id 保留', async () => {
    await localStore.saveSummary({ id: 's1', start_date: '2026-08-24', end_date: '2026-08-28', total_hours: 45, work_days: 5, created_at: '2026-08-28T00:00:00Z' })
    expect((await localStore.listSummaries())[0].id).toBe('s1')
    await localStore.deleteSummary('s1')
    expect(await localStore.listSummaries()).toHaveLength(0)
  })

  it('日历微调 增/删', async () => {
    await localStore.saveOverride({ date: '2026-08-29', is_workday: true })
    expect((await localStore.listOverrides())[0].is_workday).toBe(true)
    await localStore.deleteOverride('2026-08-29')
    expect(await localStore.listOverrides()).toHaveLength(0)
  })
})
