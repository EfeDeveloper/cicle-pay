<script setup lang="ts">
import type { MonthlyExpense } from '@/types/expense'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/services/expenseService'
import { CheckCircle2, Circle } from '@lucide/vue'

defineProps<{
  expense: MonthlyExpense
}>()
</script>

<template>
  <div class="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-lg">
    <!-- Status icon -->
    <div class="shrink-0">
      <CheckCircle2
        v-if="expense.status === 'paid'"
        class="w-4 h-4 text-emerald-500"
      />
      <Circle
        v-else
        class="w-4 h-4 text-amber-400"
      />
    </div>

    <!-- Contenido -->
    <div class="flex-1 min-w-0">
      <p
        class="text-sm font-medium truncate"
        :class="expense.status === 'paid' ? 'line-through text-muted-foreground' : 'text-foreground'"
      >
        {{ expense.name }}
      </p>
      <p class="text-xs text-muted-foreground mt-0.5">{{ expense.category }}</p>
    </div>

    <!-- Monto + badge -->
    <div class="flex flex-col items-end gap-1 shrink-0">
      <span class="text-sm font-semibold tabular-nums text-foreground">
        {{ formatCurrency(expense.amount) }}
      </span>
      <Badge
        variant="outline"
        class="text-[10px] px-1.5 py-0 h-4"
        :class="expense.status === 'paid' ? 'badge-paid' : 'badge-pending'"
      >
        {{ expense.status === 'paid' ? 'Pagado' : 'Pendiente' }}
      </Badge>
    </div>
  </div>
</template>
