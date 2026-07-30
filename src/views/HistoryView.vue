<script setup lang="ts">
import { watch, computed } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { usePeriod } from '@/composables/usePeriod'
import { formatCurrency } from '@/services/expenseService'
import ExpenseHistoryItem from '@/components/expenses/ExpenseHistoryItem.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, CalendarX2, TrendingDown } from '@lucide/vue'

const store = useExpenseStore()
const { currentPeriod, prevPeriod, nextPeriod, isCurrentPeriod, periodLabel } = usePeriod()

// Load expenses when period changes
watch(
  currentPeriod,
  async (period) => {
    await store.fetchExpenses(period)
  },
  { immediate: true },
)

const progressValue = computed(() => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
})
</script>

<template>
  <div class="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
    <!-- Period selector -->
    <div class="flex items-center justify-between">
      <Button variant="outline" size="icon" @click="prevPeriod">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h2 class="text-base font-semibold text-foreground capitalize">{{ periodLabel }}</h2>
      <Button variant="outline" size="icon" :disabled="isCurrentPeriod" @click="nextPeriod">
        <ChevronRight class="w-4 h-4" />
      </Button>
    </div>

    <!-- Period summary bar -->
    <div v-if="store.loading" class="space-y-2">
      <Skeleton class="h-20 rounded-lg" />
      <Skeleton class="h-3 rounded-full" />
    </div>

    <div v-else-if="store.expenses.length > 0" class="space-y-4">
      <!-- Summary card -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">Resumen del período</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="grid grid-cols-3 gap-3 text-center">
            <div>
              <p class="text-lg font-bold tabular-nums text-foreground">
                {{ formatCurrency(store.summary.totalAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              <p class="text-lg font-bold tabular-nums text-emerald-600">
                {{ formatCurrency(store.summary.paidAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">Pagado</p>
            </div>
            <div>
              <p class="text-lg font-bold tabular-nums text-amber-600">
                {{ formatCurrency(store.summary.pendingAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">Pendiente</p>
            </div>
          </div>

          <!-- Progress -->
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>{{ store.summary.paidCount }}/{{ store.summary.totalCount }} pagados</span>
              <span>{{ progressValue }}%</span>
            </div>
            <Progress :model-value="progressValue" class="h-2" />
          </div>
        </CardContent>
      </Card>

      <!-- Accumulated card -->
      <Card class="border-dashed bg-muted/20">
        <CardContent class="flex items-center gap-3 py-4">
          <TrendingDown class="w-5 h-5 text-muted-foreground shrink-0" />
          <div>
            <p class="text-sm font-medium text-foreground">
              Total comprometido: {{ formatCurrency(store.summary.totalAmount) }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ store.summary.paidCount }} pagados · {{ store.summary.pendingCount }} pendientes
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Expense list (read-only) -->
      <div class="flex flex-col gap-2">
        <ExpenseHistoryItem
          v-for="expense in store.expenses"
          :key="expense.id"
          :expense="expense"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.loading"
      class="flex flex-col items-center justify-center py-16 gap-4"
    >
      <CalendarX2 class="w-12 h-12 text-muted-foreground" />
      <div class="text-center">
        <p class="text-sm font-medium text-foreground">Sin registros en este período</p>
        <p class="text-xs text-muted-foreground mt-1 capitalize">{{ periodLabel }}</p>
      </div>
    </div>
  </div>
</template>
