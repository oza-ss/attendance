import { defineStore } from 'pinia'
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useDailyRecordsStore } from './dailyRecords'
import { useSummariesStore } from './summaries'
import { useCalendarStore } from './calendar'
import { computeMonthStats, computeWeekStats } from '../lib/aggregate'
import { computeForecast } from '../lib/forecast'
import { getCurrentWeek } from '../lib/weeks'

export const useStatsStore = defineStore('stats', () => {
  const daily = useDailyRecordsStore()
  const summaries = useSummariesStore()
  const calendar = useCalendarStore()

  const month = computed(() => dayjs().format('YYYY-MM'))
  const week = computed(() => getCurrentWeek())

  const monthStats = computed(() => computeMonthStats(month.value, daily.records, summaries.list))
  const weekStats = computed(() => computeWeekStats(week.value.year, week.value.week, daily.records, summaries.list))
  const forecast = computed(() => computeForecast(month.value, daily.records, summaries.list, calendar.list))

  return { month, week, monthStats, weekStats, forecast }
})
