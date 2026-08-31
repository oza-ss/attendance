// 领域类型定义：日期均为 'YYYY-MM-DD' 字符串，时间为 'HH:mm' 字符串

export interface DailyRecord {
  date: string
  start_time: string
  end_time: string | null
}

export interface SummaryRecord {
  id: string
  start_date: string
  end_date: string
  total_hours: number
  work_days: number
  note?: string
  created_at: string
}

export interface CalendarOverride {
  date: string
  is_workday: boolean
}

export interface MonthStats {
  month: string
  totalHours: number
  workDays: number
  avgHours: number
  summaryTotalHours: number
  summaryWorkDays: number
  clockTotalHours: number
  clockWorkDays: number
}

export interface WeekStats {
  weekYear: number
  weekNumber: number
  startDate: string
  endDate: string
  totalHours: number
  workDays: number
  avgHours: number
}

export type ForecastStatus = 'achieved' | 'on-track' | 'hard' | 'missed'

export interface Forecast {
  month: string
  targetTotalHours: number
  currentTotalHours: number
  monthWorkDays: number
  workedDays: number
  remainingDays: number
  neededTotalHours: number
  perDayHours: number
  status: ForecastStatus
  message: string
}
