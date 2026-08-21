<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'

const props = defineProps<{
  category: string
  spent: number
  count: number
  allocated: number | null
}>()

const icon = computed(() => getCategoryIcon(props.category))

const progressValue = computed(() => {
  if (props.allocated === null || props.allocated <= 0) {
    return 0
  }
  return Math.min(100, Math.round((props.spent / props.allocated) * 100))
})

const hasBudget = computed(() => props.allocated !== null)
</script>

<template>
  <div class="flex items-center gap-3">
    <div class="flex justify-center items-center bg-white/10 rounded-xl size-10 shrink-0">
      <component :is="icon" class="size-4 text-brand" />
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-baseline gap-2">
        <p class="font-medium text-sm truncate">{{ category }}</p>
        <p class="font-semibold tabular-nums text-sm shrink-0">
          {{ formatCurrency(spent) }}
        </p>
      </div>
      <p class="mt-0.5 text-[11px] text-white/55">
        {{ count }} {{ count === 1 ? 'gasto' : 'gastos' }}
        <template v-if="hasBudget">
          · {{ formatCurrency(allocated ?? 0) }}
        </template>
      </p>
      <Progress
        v-if="hasBudget"
        :model-value="progressValue"
        class="bg-white/10 mt-2 h-1.5"
      />
    </div>
  </div>
</template>
