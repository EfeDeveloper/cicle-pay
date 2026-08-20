<script setup lang="ts">
import { computed } from 'vue'
import type { MonthlyExpense } from '@/types/expense'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
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
    class="flex items-center gap-3 bg-card hover:bg-accent/20 shadow-card px-4 py-4 border border-border/70 rounded-2xl transition-colors cursor-pointer"
    role="button"
    :aria-label="`Ver detalle de ${expense.name}`"
    @click="emit('view')"
  >
    <label
      class="flex justify-center items-center size-11 shrink-0 cursor-pointer"
      :for="`upcoming-${expense.id}`"
      @click.stop
    >
      <Checkbox
        :id="`upcoming-${expense.id}`"
        :model-value="expense.status === 'paid'"
        @update:model-value="handleToggle"
      />
    </label>

    <div class="flex justify-center items-center bg-brand-soft rounded-xl size-11 shrink-0">
      <component :is="icon" class="size-4 text-brand" />
    </div>

    <div class="flex-1 min-w-0">
      <p class="font-semibold text-sm truncate">{{ expense.name }}</p>
      <div class="flex flex-wrap items-center gap-1.5 mt-1">
        <span class="text-muted-foreground text-xs">{{ expense.category }}</span>
        <span
          v-if="expense.dueDay"
          class="bg-muted px-2 py-0.5 rounded-full text-[11px] text-muted-foreground"
        >
          Vence día {{ expense.dueDay }}
        </span>
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
      <p class="font-bold tabular-nums text-base tracking-tight">
        {{ formatCurrency(expense.amount) }}
      </p>
      <Badge variant="outline" class="badge-pending px-1.5 py-0 h-4 text-[10px]">
        Pendiente
      </Badge>
    </div>
  </div>
</template>
