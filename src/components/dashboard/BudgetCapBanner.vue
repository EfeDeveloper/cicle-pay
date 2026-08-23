<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/services/expenseService'
import { getBudgetProgress } from '@/lib/budgetProgress'

const props = defineProps<{
  spent: number
  cap: number
}>()

const progress = computed(() => getBudgetProgress(props.spent, props.cap))

const statusText = computed(() => {
  if (progress.value.overspend > 0) {
    return `Te pasaste ${formatCurrency(progress.value.overspend)}`
  }
  if (progress.value.remaining === 0) {
    return 'Llegaste al tope'
  }
  return `Te quedan ${formatCurrency(progress.value.remaining)}`
})
</script>

<template>
  <div class="space-y-2">
    <div class="flex justify-between items-baseline gap-2">
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">Tope del mes</p>
      <p class="font-semibold tabular-nums text-sm shrink-0">
        {{ formatCurrency(spent) }} de {{ formatCurrency(cap) }}
      </p>
    </div>
    <Progress :model-value="progress.ratio" class="h-2.5" />
    <p
      class="text-xs"
      :class="progress.overspend > 0 ? 'text-amber-700' : 'text-muted-foreground'"
    >
      {{ statusText }}
    </p>
  </div>
</template>
