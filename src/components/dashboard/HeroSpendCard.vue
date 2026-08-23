<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/services/expenseService'
import { getBudgetProgress } from '@/lib/budgetProgress'
import { PlusCircle, Pencil } from '@lucide/vue'

const props = defineProps<{
  spent: number
  cap: number | null
  periodLabel?: string
}>()

const emit = defineEmits<{
  openBudget: []
}>()

const hasBudget = computed(() => !!props.cap && props.cap > 0)

const progress = computed(() => {
  if (!hasBudget.value || !props.cap) return null
  return getBudgetProgress(props.spent, props.cap)
})

const isOverspent = computed(() => (progress.value?.overspend ?? 0) > 0)

const overspendPercentage = computed(() => {
  if (!props.cap || props.cap <= 0 || !isOverspent.value) return 0
  const over = props.spent - props.cap
  return Math.floor((over / props.cap) * 100)
})

// Calculate widths for the dual-portion bar when overspent
const greenWidthPercent = computed(() => {
  if (!props.cap || props.cap <= 0) return 0
  if (!isOverspent.value) {
    return Math.min(100, Math.round((props.spent / props.cap) * 100))
  }
  return Math.max(10, Math.round((props.cap / props.spent) * 100))
})

const overspentWidthPercent = computed(() => {
  if (!isOverspent.value) return 0
  return 100 - greenWidthPercent.value
})
</script>

<template>
  <Card class="bg-card border border-border shadow-card rounded-2xl md:rounded-3xl overflow-hidden">
    <CardContent class="p-6 md:p-7 space-y-6">
      <!-- Top header and amount -->
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="font-medium text-muted-foreground text-xs uppercase tracking-wider">
            TOTAL DEL MES
          </p>
          <h3 class="mt-1.5 font-bold text-foreground text-3xl md:text-4xl tabular-nums tracking-tight">
            {{ formatCurrency(spent) }}
          </h3>
          <p class="mt-1 text-muted-foreground text-xs">
            Total gastado en el mes
          </p>
        </div>

        <!-- Top Right Corner: Permanent Action Button + $ Badge -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card hover:bg-muted text-foreground transition-colors shadow-2xs cursor-pointer"
            :title="hasBudget ? 'Editar presupuesto' : 'Definir presupuesto'"
            @click="emit('openBudget')"
          >
            <component :is="hasBudget ? Pencil : PlusCircle" class="size-3.5 text-brand" />
            <span class="hidden sm:inline">{{ hasBudget ? 'Editar presupuesto' : 'Definir presupuesto' }}</span>
          </button>

          <!-- App base brand color orange -->
          <div class="flex justify-center items-center bg-brand-soft text-brand rounded-full size-10 shrink-0 font-bold text-base shadow-xs">
            $
          </div>
        </div>
      </div>

      <!-- Budget section (When Budget Exists) -->
      <div v-if="hasBudget && cap" class="pt-4 border-t border-border/40 space-y-2.5">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="font-medium text-muted-foreground uppercase tracking-wider">
            TOPE DEL MES
          </span>

          <div class="flex items-center gap-1.5 font-medium tabular-nums text-foreground">
            <!-- Red Flag SVG matching the mockup -->
            <svg
              v-if="isOverspent"
              viewBox="0 0 24 24"
              class="size-4 text-rose-500 fill-rose-500"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <span>{{ formatCurrency(spent) }} de {{ formatCurrency(cap) }}</span>
          </div>
        </div>

        <!-- Custom Overspend / Progress Bar with Tailwind classes -->
        <div class="relative w-full h-3 bg-muted rounded-full overflow-hidden flex">
          <!-- Green portion (Base budget cap) -->
          <div
            class="h-full bg-emerald-700 dark:bg-emerald-600 transition-all duration-300"
            :class="{
              'rounded-full': !isOverspent && greenWidthPercent === 100,
              'rounded-l-full': isOverspent,
            }"
            :style="{ width: `${greenWidthPercent}%` }"
          />

          <!-- Striped coral-red portion for overspend -->
          <div
            v-if="isOverspent"
            class="h-full bg-rose-500 transition-all duration-300 rounded-r-full relative overflow-hidden"
            :style="{
              width: `${overspentWidthPercent}%`,
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.45) 4px, rgba(255,255,255,0.45) 8px)',
            }"
          />
        </div>

        <!-- Status message below bar -->
        <div class="flex items-center justify-between text-xs pt-0.5">
          <p
            v-if="isOverspent"
            class="font-medium text-rose-500"
          >
            Te pasaste: {{ formatCurrency(progress?.overspend ?? 0) }} ({{ overspendPercentage }}% sobregirado)
          </p>
          <p
            v-else-if="progress?.remaining === 0"
            class="font-medium text-muted-foreground"
          >
            Llegaste al tope exacto de tu presupuesto.
          </p>
          <p
            v-else
            class="text-muted-foreground"
          >
            Te quedan {{ formatCurrency(progress?.remaining ?? 0) }}
          </p>
        </div>
      </div>

      <!-- No budget defined prompt -->
      <div v-else class="pt-4 border-t border-border/40 text-xs text-muted-foreground">
        <span>Sin tope definido para este mes</span>
      </div>
    </CardContent>
  </Card>
</template>
