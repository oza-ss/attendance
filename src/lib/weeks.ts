// ISO 周工具：周号（ISO 8601 周一~周日）、周区间、周标签
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

// 返回日期所在 ISO 周的年/周号
export function getIsoWeek(date: string | Date): { year: number; week: number } {
  const d = dayjs(date)
  return { year: d.isoWeekYear(), week: d.isoWeek() }
}

// 当前所在 ISO 周，支持注入 now 便于测试
export function getCurrentWeek(now: Date = new Date()): { year: number; week: number } {
  return getIsoWeek(now)
}

// 返回 ISO 周（周一 ~ 周日）的起止日期 'YYYY-MM-DD'
export function getWeekRange(year: number, week: number): { start: string; end: string } {
  // ISO 规则：1 月 4 日必在当年第 1 周；第 1 周的周一为其所在周的周一
  const jan4 = dayjs(`${year}-01-04`)
  const monday = jan4.startOf('isoWeek').add((week - 1) * 7, 'day')
  const sunday = monday.add(6, 'day')
  return { start: monday.format('YYYY-MM-DD'), end: sunday.format('YYYY-MM-DD') }
}

// 周标签，如 '2026 年第 35 周'
export function weekLabel(year: number, week: number): string {
  return `${year} 年第 ${week} 周`
}
