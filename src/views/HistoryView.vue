<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { usePeriod } from '@/composables/usePeriod'
import { formatCurrency } from '@/services/expenseService'
import type { MonthlyExpense } from '@/types/expense'
import ExpenseHistoryItem from '@/components/expenses/ExpenseHistoryItem.vue'
import DueDayCalendar from '@/components/lists/DueDayCalendar.vue'
import ListSearchBar from '@/components/lists/ListSearchBar.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { expenseQueryFields, filterByQuery } from '@/lib/filterByQuery'
import {
  buildDueDayMarks,
  filterByDueDay,
  type DueDayFilter,
} from '@/lib/dueDayCalendar'
import { toExpenseDetail, type RecordDetail } from '@/lib/recordDetail'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { CalendarX2, Search } from '@lucide/vue'

const store = useExpenseStore()
const { currentPeriod, setPeriod, periodLabel } = usePeriod()
const ready = ref(false)

// Load expenses when period changes
const searchQuery = ref('')
const dueDayFilter = ref<DueDayFilter>(null)

watch(
  currentPeriod,
  async (period) => {
    dueDayFilter.value = null
    await store.fetchExpenses(period)
    ready.value = true
  },
  { immediate: true },
)

const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
const isFilterActive = computed(() => isSearchActive.value || dueDayFilter.value !== null)
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)

function openExpenseDetail(expense: MonthlyExpense) {
  detailRecord.value = toExpenseDetail(expense)
  detailOpen.value = true
}

const queriedExpenses = computed(() =>
  filterByQuery(store.expenses, searchQuery.value, expenseQueryFields),
)
const dueDayMarks = computed(() => buildDueDayMarks(queriedExpenses.value, 'status'))
const hasUndated = computed(() => queriedExpenses.value.some((item) => item.dueDay == null))
const visibleExpenses = computed(() => filterByDueDay(queriedExpenses.value, dueDayFilter.value))

const progressValue = computed(() => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
})

const isMonthHeading = computed(
  () => dueDayFilter.value === null || dueDayFilter.value === 'none',
)

const historyHeading = computed(() => {
  const filter = dueDayFilter.value
  if (filter === null || filter === 'none') return periodLabel.value

  const [year, month] = currentPeriod.value.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  if (filter > lastDay) return `Día ${filter} · ${periodLabel.value}`

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, filter))
})
</script>

<template>
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-5xl">
    <h2
      class="text-left font-semibold text-foreground text-xl tracking-tight"
      :class="{ capitalize: isMonthHeading }"
    >
      {{ historyHeading }}
    </h2>

    <!-- Period summary bar -->
    <div v-if="store.loading && !ready" class="space-y-2">
      <Skeleton class="rounded-2xl h-20" />
      <Skeleton class="rounded-full h-3" />
    </div>

    <template v-else-if="ready">
      <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <ListSearchBar
          id="history-search"
          v-model="searchQuery"
          aria-label="Buscar en el historial"
        />
        <DueDayCalendar
          v-model="dueDayFilter"
          :period-key="currentPeriod"
          :marks="dueDayMarks"
          mode="status"
          :has-undated="hasUndated"
          allow-period-change
          :disabled="store.loading"
          @update:period-key="setPeriod"
        />
      </div>

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
              {{ isFilterActive ? 'Sin coincidencias' : 'Sin registros en este período' }}
            </p>
            <p v-if="isFilterActive" class="text-xs text-muted-foreground mt-1">
              Prueba con otro día, nombre o categoría
            </p>
          </div>
        </div>
      </div>
      </div>

      <div
        v-else
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
    </template>

    <RecordDetailSheet
      :open="detailOpen"
      :record="detailRecord"
      @close="detailOpen = false"
    />
  </div>
</template>
