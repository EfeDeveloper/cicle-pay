<script setup lang="ts">
import type { MonthlyExpense } from '@/types/expense'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/services/expenseService'

const props = defineProps<{
  expense: MonthlyExpense
}>()

const emit = defineEmits<{
  toggle: [id: string, status: 'pending' | 'paid']
}>()

function handleToggle() {
  const newStatus = props.expense.status === 'paid' ? 'pending' : 'paid'
  emit('toggle', props.expense.id, newStatus)
}
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg hover:bg-accent/30 transition-colors"
    :class="{ 'opacity-75': expense.status === 'paid' }"
  >
    <!-- Checkbox -->
    <Checkbox
      :id="`expense-${expense.id}`"
      :model-value="expense.status === 'paid'"
      @update:model-value="handleToggle"
      class="shrink-0"
    />

    <!-- Contenido principal -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <div class="min-w-0">
          <p
            class="text-sm font-medium leading-tight truncate"
            :class="
              cn({
                'line-through text-muted-foreground': expense.status === 'paid',
                'text-foreground': expense.status === 'pending',
              })
            "
          >
            {{ expense.name }}
          </p>
          <p class="text-xs text-muted-foreground mt-0.5">{{ expense.category }}</p>
        </div>

        <div class="flex flex-col items-end gap-1 shrink-0">
          <span
            class="text-sm font-semibold tabular-nums"
            :class="
              expense.status === 'paid' ? 'text-muted-foreground line-through' : 'text-foreground'
            "
          >
            {{ formatCurrency(expense.amount) }}
          </span>
          <Badge
            variant="outline"
            class="text-[10px] px-1.5 py-0 h-4"
            :class="
              expense.status === 'paid'
                ? 'badge-paid'
                : 'badge-pending'
            "
          >
            {{ expense.status === 'paid' ? 'Pagado' : 'Pendiente' }}
          </Badge>
        </div>
      </div>
    </div>
  </div>
</template>
