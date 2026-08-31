import dayjs from 'dayjs'
import { calculateDailyHours } from './workHours'
import { getWeekRange } from './weeks'
import type { DailyRecord, SummaryRecord, MonthStats, WeekStats } from './types'

// 是否覆盖整个自然月（以 end_date 所在月判定，规则与 forecast.ts 一致）
function isWholeMonthSummary(s: SummaryRecord): boolean {
  const end = dayjs(s.end_date)
  const monthStart = end.startOf('month').format('YYYY-MM-DD')
  const monthEnd = end.endOf('month').format('YYYY-MM-DD')
  return s.start_date <= monthStart && s.end_date >= monthEnd
}

export function computeMonthStats(month: string, records: DailyRecord[], summaries: SummaryRecord[]): MonthStats {
  const inMonth = (date: string) => date.startsWith(month)
  const monthSummaries = summaries.filter((s) => s.end_date.startsWith(month))

  // 存在覆盖整月的汇总时，以它为唯一权威，避免与周/其他汇总双计
  const wholeMonth = monthSummaries.find(isWholeMonthSummary)
  const effectiveSummaries = wholeMonth ? [wholeMonth] : monthSummaries

  // 被汇总覆盖的日期集合（区间内所有天）
  const covered = new Set<string>()
  for (const s of effectiveSummaries) {
    for (let d = dayjs(s.start_date); !d.isAfter(dayjs(s.end_date), 'day'); d = d.add(1, 'day')) {
      covered.add(d.format('YYYY-MM-DD'))
    }
  }

  const clockRecords = records.filter((r) => inMonth(r.date) && !covered.has(r.date))
  const clockTotal = clockRecords.reduce((acc, r) => acc + calculateDailyHours(r.start_time, r.end_time), 0)
  const clockWorkDays = clockRecords.length
  const summaryTotal = effectiveSummaries.reduce((acc, s) => acc + s.total_hours, 0)
  const summaryWorkDays = effectiveSummaries.reduce((acc, s) => acc + s.work_days, 0)

  const totalHours = Math.round((clockTotal + summaryTotal) * 100) / 100
  const workDays = clockWorkDays + summaryWorkDays
  const avgHours = workDays > 0 ? Math.round((totalHours / workDays) * 100) / 100 : 0

  return {
    month,
    totalHours,
    workDays,
    avgHours,
    summaryTotalHours: summaryTotal,
    summaryWorkDays,
    clockTotalHours: Math.round(clockTotal * 100) / 100,
    clockWorkDays,
  }
}

export function computeWeekStats(weekYear: number, weekNumber: number, records: DailyRecord[], summaries: SummaryRecord[]): WeekStats {
  const { start, end } = getWeekRange(weekYear, weekNumber)
  const weekStart = dayjs(start)
  const weekEnd = dayjs(end)
  // 排除整月汇总：月级汇总不是周级记录，周统计回退到打卡
  const weekSummaries = summaries.filter((s) => {
    const sStart = dayjs(s.start_date)
    const sEnd = dayjs(s.end_date)
    return !sStart.isAfter(weekEnd, 'day') && !sEnd.isBefore(weekStart, 'day') && !isWholeMonthSummary(s)
  })

  if (weekSummaries.length > 0) {
    const totalHours = Math.round(weekSummaries.reduce((acc, s) => acc + s.total_hours, 0) * 100) / 100
    const workDays = weekSummaries.reduce((acc, s) => acc + s.work_days, 0)
    const avgHours = workDays > 0 ? Math.round((totalHours / workDays) * 100) / 100 : 0
    return { weekYear, weekNumber, startDate: start, endDate: end, totalHours, workDays, avgHours }
  }

  const weekRecords = records.filter((r) => {
    const d = dayjs(r.date)
    return !d.isBefore(weekStart, 'day') && !d.isAfter(weekEnd, 'day')
  })
  const totalHours = Math.round(weekRecords.reduce((acc, r) => acc + calculateDailyHours(r.start_time, r.end_time), 0) * 100) / 100
  const workDays = weekRecords.length
  const avgHours = workDays > 0 ? Math.round((totalHours / workDays) * 100) / 100 : 0
  return { weekYear, weekNumber, startDate: start, endDate: end, totalHours, workDays, avgHours }
}
