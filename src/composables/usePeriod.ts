import { ref, computed } from 'vue'
import {
  getCurrentPeriodKey,
  formatPeriodLabel,
  getPrevPeriodKey,
  getNextPeriodKey,
} from '@/services/expenseService'

export function usePeriod(initialPeriod?: string) {
  const currentPeriod = ref(initialPeriod ?? getCurrentPeriodKey())
  const todayPeriod = getCurrentPeriodKey()

  function prevPeriod() {
    currentPeriod.value = getPrevPeriodKey(currentPeriod.value)
  }

  function nextPeriod() {
    // Cannot go beyond current month
    if (currentPeriod.value < todayPeriod) {
      currentPeriod.value = getNextPeriodKey(currentPeriod.value)
    }
  }

  const isCurrentPeriod = computed(() => currentPeriod.value === todayPeriod)

  const periodLabel = computed(() => formatPeriodLabel(currentPeriod.value))

  return {
    currentPeriod,
    prevPeriod,
    nextPeriod,
    isCurrentPeriod,
    periodLabel,
  }
}
