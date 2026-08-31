<script setup lang="ts">
import { computed } from 'vue'
import { formatHoursDecimal } from '../lib/format'
import type { Forecast } from '../lib/types'

const props = defineProps<{ forecast: Forecast; avgHours: number }>()

const color = computed(() => {
  switch (props.forecast.status) {
    case 'achieved': return '#07c160'
    case 'on-track': return '#1989fa'
    case 'hard': return '#ff976a'
    case 'missed': return '#ee0a24'
  }
})
</script>

<template>
  <van-cell-group inset style="margin-top: 12px">
    <van-cell title="目标总工时" :value="`${forecast.targetTotalHours} 小时（${forecast.monthWorkDays} 天 × 9小时）`" />
    <van-cell title="当前累计" :value="`${forecast.currentTotalHours} 小时（已工作 ${forecast.workedDays} 天）`" />
    <van-cell title="当前剩余" :value="`${formatHoursDecimal(forecast.neededTotalHours)} 小时（剩余 ${forecast.remainingDays} 天）`" />
    <van-cell title="平均工时" :value="`${formatHoursDecimal(avgHours)} 小时/天`" />
    <van-cell title="剩余每天">
      <template #value>
        <b :style="{ color }">{{ formatHoursDecimal(forecast.perDayHours) }} 小时/天</b>
      </template>
    </van-cell>
    <van-cell :title="forecast.message" :style="{ color }" />
  </van-cell-group>
</template>
