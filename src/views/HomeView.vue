<script setup lang="ts">
import { onMounted } from 'vue'
import { useDailyRecordsStore } from '../stores/dailyRecords'
import { useSummariesStore } from '../stores/summaries'
import { useCalendarStore } from '../stores/calendar'
import { useStatsStore } from '../stores/stats'
import ForecastCard from '../components/ForecastCard.vue'

const daily = useDailyRecordsStore()
const summaries = useSummariesStore()
const calendar = useCalendarStore()
const stats = useStatsStore()

onMounted(() => {
  daily.load() // 统计（月/周平均、推演）依赖打卡与汇总数据
  summaries.load()
  calendar.load()
})
</script>

<template>
  <ForecastCard :forecast="stats.forecast" :avg-hours="stats.monthStats.avgHours" />
</template>
