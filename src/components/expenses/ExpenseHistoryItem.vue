<script setup lang="ts">
import { computed } from 'vue'
import type { MonthlyExpense } from '@/types/expense'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { hasDescription } from '@/lib/recordDetail'

const props = defineProps<{
  expense: MonthlyExpense
}>()

const emit = defineEmits<{
  view: []
}>()

const icon = computed(() => getCategoryIcon(props.expense.category))
</script>

<template>
  <div
    class="flex items-center gap-3 bg-card hover:bg-accent/30 shadow-card px-3.5 py-3 border border-border/70 rounded-2xl cursor-pointer transition-colors"
    role="button"
    :aria-label="`Ver detalle de ${expense.name}`"
    @click="emit('view')"
  >
    <div class="flex justify-center items-center bg-brand-soft rounded-xl size-10 shrink-0">
      <component :is="icon" class="size-4 text-brand" />
    </div>

    <div class="flex-1 min-w-0">
      <p
        class="font-medium text-sm truncate"
        :class="expense.status === 'paid' ? 'line-through text-muted-foreground' : 'text-foreground'"
      >
        {{ expense.name }}
      </p>
      <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
        <p class="text-muted-foreground text-xs">{{ expense.category }}</p>
        <Badge
          v-if="hasDescription(expense.description)"
          variant="secondary"
          class="px-1.5 py-0 h-4 text-[10px]"
        >
          Nota
        </Badge>
      </div>
    </div>

    <div class="flex flex-col items-end gap-1 shrink-0">
      <span class="font-semibold tabular-nums text-sm">
        {{ formatCurrency(expense.amount) }}
      </span>
      <Badge
        variant="outline"
        class="px-1.5 py-0 h-4 text-[10px]"
        :class="expense.status === 'paid' ? 'badge-paid' : 'badge-pending'"
      >
        {{ expense.status === 'paid' ? 'Pagado' : 'Pendiente' }}
      </Badge>
    </div>
  </div>
</template>
