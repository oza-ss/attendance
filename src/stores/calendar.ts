import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CalendarOverride } from '../lib/types'
import { getDataStore } from '../data/dataStore'

export const useCalendarStore = defineStore('calendar', () => {
  const list = ref<CalendarOverride[]>([])
  const error = ref('')

  async function load() {
    try {
      list.value = await (await getDataStore()).listOverrides()
      error.value = ''
    } catch (e: any) {
      error.value = e?.message ?? '数据加载失败'
    }
  }
  async function save(o: CalendarOverride) {
    await (await getDataStore()).saveOverride(o)
    await load()
  }
  async function remove(date: string) {
    await (await getDataStore()).deleteOverride(date)
    await load()
  }

  return { list, error, load, save, remove }
})
