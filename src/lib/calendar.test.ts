import { describe, it, expect } from 'vitest'
import { isWorkday, countWorkdays, monthWorkDays } from './calendar'

const ov = (date: string, is_workday: boolean) => ({ date, is_workday })

describe('工作日历', () => {
  it('默认周一~周五为工作日', () => {
    expect(isWorkday('2026-08-25')).toBe(true) // 周二
    expect(isWorkday('2026-08-29')).toBe(false) // 周六
    expect(isWorkday('2026-08-30')).toBe(false) // 周日
  })

  it('内置法定节假日不算工作日', () => {
    expect(isWorkday('2026-01-01')).toBe(false) // 元旦（周四）
  })

  it('手动微调覆盖默认与内置', () => {
    expect(isWorkday('2026-08-29', [ov('2026-08-29', true)])).toBe(true) // 调休补班
    expect(isWorkday('2026-08-25', [ov('2026-08-25', false)])).toBe(false) // 手动放假
  })

  it('countWorkdays 统计区间工作日', () => {
    expect(countWorkdays('2026-08-24', '2026-08-30')).toBe(5)
  })

  it('monthWorkDays 统计整月工作日（2026-08 无节假日）', () => {
    expect(monthWorkDays(2026, 8)).toBe(21)
  })
})
