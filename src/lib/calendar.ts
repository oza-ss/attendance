// 工作日历：手动微调(overrides) > 内置节假日 > 默认周一~五
import dayjs from 'dayjs'
import { pad } from './time'
import { BUILTIN_HOLIDAYS } from './holidays'
import type { CalendarOverride } from './types'

export function isWorkday(date: string | Date, overrides: CalendarOverride[] = []): boolean {
  const key = dayjs(date).format('YYYY-MM-DD')
  const ov = overrides.find((o) => o.date === key)
  if (ov) return ov.is_workday
  if (BUILTIN_HOLIDAYS.has(key)) return false
  const dow = dayjs(date).day() // 0=周日
  return dow >= 1 && dow <= 5
}

export function countWorkdays(start: string, end: string, overrides: CalendarOverride[] = []): number {
  let count = 0
  let cur = dayjs(start)
  const last = dayjs(end)
  while (cur.isBefore(last) || cur.isSame(last, 'day')) {
    if (isWorkday(cur.format('YYYY-MM-DD'), overrides)) count++
    cur = cur.add(1, 'day') // dayjs 不可变，需重新赋值，否则死循环
  }
  return count
}

export function monthWorkDays(year: number, month: number, overrides: CalendarOverride[] = []): number {
  const start = `${year}-${pad(month)}-01`
  const end = dayjs(`${year}-${pad(month)}-01`).endOf('month').format('YYYY-MM-DD')
  return countWorkdays(start, end, overrides)
}
