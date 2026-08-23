<script setup lang="ts">
import { computed } from 'vue'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'

const props = defineProps<{
  category: string
  spent: number
  count: number
  allocated?: number | null
}>()

const icon = computed(() => getCategoryIcon(props.category))

const isOverspent = computed(() => {
  if (!props.allocated || props.allocated <= 0) return false
  return props.spent > props.allocated
})

const overspentAmount = computed(() => {
  if (!isOverspent.value || !props.allocated) return 0
  return props.spent - props.allocated
})

const progressPercent = computed(() => {
  if (!props.allocated || props.allocated <= 0) return 100
  return Math.min(100, Math.round((props.spent / props.allocated) * 100))
})
</script>

<template>
  <div class="space-y-1.5 py-1">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <!-- Dark circular badge with orange icon outline -->
        <div class="flex justify-center items-center bg-neutral-800 rounded-full size-8.5 shrink-0 text-brand">
          <component :is="icon" class="size-4.5 stroke-[1.75]" />
        </div>
        <div class="min-w-0">
          <p class="font-medium text-sm text-neutral-100 truncate">
            {{ category }}
          </p>
          <p class="text-neutral-400 text-xs truncate">
            {{ count }} {{ count === 1 ? 'gasto' : 'gastos' }}
            <span v-if="allocated && allocated > 0"> · cupo {{ formatCurrency(allocated) }}</span>
          </p>
        </div>
      </div>

      <p class="font-bold tabular-nums text-sm text-neutral-100 shrink-0">
        {{ formatCurrency(spent) }}
      </p>
    </div>

    <!-- Category Progress Bar (if budget allocated) -->
    <div v-if="allocated && allocated > 0" class="space-y-0.5 pl-11">
      <div class="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="isOverspent ? 'bg-rose-500' : 'bg-emerald-600'"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <p v-if="isOverspent" class="text-rose-400 font-medium text-[10px]">
        Te pasaste {{ formatCurrency(overspentAmount) }}
      </p>
    </div>
  </div>
</template>
