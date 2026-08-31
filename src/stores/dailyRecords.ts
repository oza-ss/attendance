import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DailyRecord } from '../lib/types'
import { getDataStore } from '../data/dataStore'

export const useDailyRecordsStore = defineStore('dailyRecords', () => {
  const records = ref<DailyRecord[]>([])
  const error = ref('')

  async function load() {
    try {
      records.value = await (await getDataStore()).listDailyRecords()
      error.value = ''
    } catch (e: any) {
      error.value = e?.message ?? '数据加载失败'
    }
  }
  async function save(r: DailyRecord) {
    await (await getDataStore()).saveDailyRecord(r)
    await load()
  }
  async function remove(date: string) {
    await (await getDataStore()).deleteDailyRecord(date)
    await load()
  }
  function byDate(date: string): DailyRecord | undefined {
    return records.value.find((r) => r.date === date)
  }

  return { records, error, load, save, remove, byDate }
})
