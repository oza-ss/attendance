import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useNow(intervalMs = 30_000): { now: Ref<Date> } {
  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    timer = setInterval(() => {
      now.value = new Date()
    }, intervalMs)
  })
  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })
  return { now }
}
