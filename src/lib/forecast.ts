// 推演逻辑：根据目标/当前工时/剩余天数推演本月达标所需单日工时与状态
import dayjs from 'dayjs'
import { computeMonthStats } from './aggregate'
import { monthWorkDays } from './calendar'
import type { DailyRecord, SummaryRecord, CalendarOverride, Forecast } from './types'

// 每日目标工时（小时）
export const TARGET_PER_DAY = 9
// 单日合理工时上限（小时），超过视为 hard
export const HARD_LIMIT = 12

export function computeForecast(month: string, records: DailyRecord[], summaries: SummaryRecord[], overrides: CalendarOverride[]): Forecast {
  const stats = computeMonthStats(month, records, summaries)
  const [year, monthNum] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd = dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD')

  // T（月工作天数）：存在覆盖整自然月(1日~月末)的汇总 → 其 work_days；否则按日历计算
  const whole = summaries.find((s) => s.start_date <= monthStart && s.end_date >= monthEnd)
  const T = whole ? whole.work_days : monthWorkDays(year, monthNum, overrides)

  const targetTotal = TARGET_PER_DAY * T
  const C = stats.totalHours
  const D = stats.workDays
  const remainingDays = Math.max(0, T - D)
  const neededTotal = Math.max(0, targetTotal - C)
  // 浮点容差：精确达标时 C 的 2 位小数求和可能留下 <0.01 的残差，视为已达标
  const achieved = neededTotal <= 0.005
  const perDay = remainingDays > 0 ? Math.round((neededTotal / remainingDays) * 100) / 100 : achieved ? 0 : Infinity

  let status: Forecast['status']
  let message: string
  if (achieved) {
    status = 'achieved'
    message = `已达标！本月目标 ${targetTotal}h 已达成，剩余每天 0h 即可`
  } else if (remainingDays === 0) {
    status = 'missed'
    message = `本月已无剩余工作日，目标 ${targetTotal}h，当前 ${C}h，未能达标`
  } else if (perDay > HARD_LIMIT) {
    status = 'hard'
    message = `本月难以达标，剩余每天需 ${perDay}h（超过 ${HARD_LIMIT}h 合理上限）`
  } else {
    status = 'on-track'
    message = `剩余 ${remainingDays} 个工作日，每天需 ≈ ${perDay}小时 即可达标`
  }

  return {
    month,
    targetTotalHours: targetTotal,
    currentTotalHours: C,
    monthWorkDays: T,
    workedDays: D,
    remainingDays,
    neededTotalHours: neededTotal,
    perDayHours: perDay,
    status,
    message,
  }
}
