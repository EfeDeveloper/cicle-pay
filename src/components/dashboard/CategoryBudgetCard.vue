<script setup lang="ts">
import { computed } from 'vue'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { getBudgetProgress } from '@/lib/budgetProgress'

const props = defineProps<{
  category: string
  spent: number
  count: number
  allocated: number | null
}>()

const icon = computed(() => getCategoryIcon(props.category))
const hasBudget = computed(() => props.allocated !== null)
const progress = computed(() =>
  props.allocated === null ? null : getBudgetProgress(props.spent, props.allocated),
)
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
          · cupo {{ formatCurrency(allocated ?? 0) }}
        </template>
      </p>
      <Progress
        v-if="progress"
        :model-value="progress.ratio"
        class="bg-white/10 mt-2 h-1.5"
      />
      <p v-if="progress && progress.overspend > 0" class="mt-1 text-amber-300 text-[11px]">
        Te pasaste {{ formatCurrency(progress.overspend) }}
      </p>
    </div>
  </div>
</template>
