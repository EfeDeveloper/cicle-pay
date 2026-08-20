<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { usePeriod } from '@/composables/usePeriod'
import { formatCurrency } from '@/services/expenseService'
import type { MonthlyExpense } from '@/types/expense'
import ExpenseHistoryItem from '@/components/expenses/ExpenseHistoryItem.vue'
import ListSearchBar from '@/components/lists/ListSearchBar.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { expenseQueryFields, filterByQuery } from '@/lib/filterByQuery'
import { toExpenseDetail, type RecordDetail } from '@/lib/recordDetail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CalendarX2, ChevronLeft, ChevronRight, Search } from '@lucide/vue'

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

const searchQuery = ref('')
const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)

function openExpenseDetail(expense: MonthlyExpense) {
  detailRecord.value = toExpenseDetail(expense)
  detailOpen.value = true
}

const visibleExpenses = computed(() =>
  filterByQuery(store.expenses, searchQuery.value, expenseQueryFields),
)

const progressValue = computed(() => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
})
</script>

<template>
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-5xl">
    <!-- Period selector -->
    <div class="flex items-center justify-between">
      <Button variant="outline" size="icon" @click="prevPeriod">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      <h2 class="font-semibold text-foreground text-xl capitalize tracking-tight">{{ periodLabel }}</h2>
      <Button variant="outline" size="icon" :disabled="isCurrentPeriod" @click="nextPeriod">
        <ChevronRight class="w-4 h-4" />
      </Button>
    </div>

    <!-- Period summary bar -->
    <div v-if="store.loading" class="space-y-2">
      <Skeleton class="rounded-2xl h-20" />
      <Skeleton class="rounded-full h-3" />
    </div>

    <div v-else-if="store.expenses.length > 0" class="space-y-4">
      <!-- Summary card -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-sm font-medium text-muted-foreground">Resumen del período</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:text-center">
            <div class="flex sm:flex-col items-baseline sm:items-center justify-between gap-2 min-w-0">
              <p class="text-xs text-muted-foreground shrink-0">Total</p>
              <p class="min-w-0 font-bold tabular-nums text-sm md:text-base text-foreground wrap-break-word">
                {{ formatCurrency(store.summary.totalAmount) }}
              </p>
            </div>
            <div class="flex sm:flex-col items-baseline sm:items-center justify-between gap-2 min-w-0">
              <p class="text-xs text-muted-foreground shrink-0">Pagado</p>
              <p class="min-w-0 font-bold tabular-nums text-sm md:text-base text-emerald-600 wrap-break-word">
                {{ formatCurrency(store.summary.paidAmount) }}
              </p>
            </div>
            <div class="flex sm:flex-col items-baseline sm:items-center justify-between gap-2 min-w-0">
              <p class="text-xs text-muted-foreground shrink-0">Pendiente</p>
              <p class="min-w-0 font-bold tabular-nums text-sm md:text-base text-amber-600 wrap-break-word">
                {{ formatCurrency(store.summary.pendingAmount) }}
              </p>
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

      <ListSearchBar
        id="history-search"
        v-model="searchQuery"
        aria-label="Buscar en el historial"
      />

      <!-- Expense list (read-only) -->
      <div class="gap-3 grid grid-cols-1 sm:grid-cols-2">
        <ExpenseHistoryItem
          v-for="expense in visibleExpenses"
          :key="expense.id"
          :expense="expense"
          @view="openExpenseDetail(expense)"
        />
        <div
          v-if="visibleExpenses.length === 0"
          class="flex flex-col items-center justify-center sm:col-span-2 py-12 gap-3"
        >
          <div class="flex justify-center items-center bg-brand-soft rounded-full size-14">
            <Search class="size-7 text-brand" />
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-foreground">
              {{ isSearchActive ? 'Sin coincidencias' : 'Sin registros en este período' }}
            </p>
            <p v-if="isSearchActive" class="text-xs text-muted-foreground mt-1">
              Prueba con otro nombre o categoría
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!store.loading"
      class="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div class="flex justify-center items-center bg-brand-soft rounded-full size-14">
        <CalendarX2 class="size-7 text-brand" />
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-foreground">Sin registros en este período</p>
        <p class="text-xs text-muted-foreground mt-1 capitalize">{{ periodLabel }}</p>
      </div>
    </div>

    <RecordDetailSheet
      :open="detailOpen"
      :record="detailRecord"
      @close="detailOpen = false"
    />
  </div>
</template>
