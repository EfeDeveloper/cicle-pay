<script setup lang="ts">
import { computed } from 'vue'
import type { MonthlyExpense } from '@/types/expense'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/services/expenseService'
import { getCategoryIcon } from '@/lib/categoryVisuals'
import { hasDescription } from '@/lib/recordDetail'

const props = defineProps<{
  expense: MonthlyExpense
}>()

const emit = defineEmits<{
  toggle: [id: string, status: 'pending' | 'paid']
  view: []
}>()

const icon = computed(() => getCategoryIcon(props.expense.category))

function handleToggle() {
  const newStatus = props.expense.status === 'paid' ? 'pending' : 'paid'
  emit('toggle', props.expense.id, newStatus)
}
</script>

<template>
  <div
    class="flex items-center gap-3 bg-card hover:bg-accent/30 shadow-card px-3.5 py-3 border border-border/70 rounded-2xl transition-colors cursor-pointer"
    :class="{ 'opacity-75': expense.status === 'paid' }"
    role="button"
    :aria-label="`Ver detalle de ${expense.name}`"
    @click="emit('view')"
  >
    <label
      class="flex justify-center items-center size-11 shrink-0 cursor-pointer"
      :for="`expense-${expense.id}`"
      @click.stop
    >
      <Checkbox
        :id="`expense-${expense.id}`"
        :model-value="expense.status === 'paid'"
        @update:model-value="handleToggle"
      />
    </label>

    <div class="flex justify-center items-center bg-brand-soft rounded-xl size-10 shrink-0">
      <component :is="icon" class="size-4 text-brand" />
    </div>

    <div class="flex-1 min-w-0">
      <p
        class="font-medium text-sm truncate leading-tight"
        :class="
          cn({
            'line-through text-muted-foreground': expense.status === 'paid',
            'text-foreground': expense.status === 'pending',
          })
        "
      >
        {{ expense.name }}
      </p>
      <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
        <p class="text-muted-foreground text-xs">{{ expense.category }}</p>
        <p v-if="expense.dueDay" class="text-muted-foreground text-xs">· Día {{ expense.dueDay }}</p>
        <Badge
          v-if="expense.source === 'manual'"
          variant="secondary"
          class="px-1.5 py-0 h-4 text-[10px]"
        >
          Adicional
        </Badge>
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
      <span
        class="font-semibold tabular-nums text-sm"
        :class="
          expense.status === 'paid' ? 'text-muted-foreground line-through' : 'text-foreground'
        "
      >
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
