<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { useTemplateStore } from '@/stores/templateStore'
import { usePeriod } from '@/composables/usePeriod'
import type { CreateManualExpenseInput, MonthlyExpense } from '@/types/expense'
import ExpenseListItem from '@/components/expenses/ExpenseListItem.vue'
import ManualExpenseFormSheet from '@/components/expenses/ManualExpenseFormSheet.vue'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { CheckCircle2, PackageOpen, InboxIcon, Plus, RefreshCw, Search } from '@lucide/vue'

const store = useExpenseStore()
const templateStore = useTemplateStore()
const { currentPeriod, setPeriod, isCurrentPeriod, periodLabel } = usePeriod()
const ready = ref(false)
const manualExpenseSheetOpen = ref(false)
const manualExpenseSaving = ref(false)
const searchQuery = ref('')
const dueDayFilter = ref<DueDayFilter>(null)
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)
const initMonthSubmitting = ref(false)
const initMonthLockedUntil = ref(0)

function openExpenseDetail(expense: MonthlyExpense) {
  detailRecord.value = toExpenseDetail(expense)
  detailOpen.value = true
}

watch(
  currentPeriod,
  async (period) => {
    dueDayFilter.value = null
    await store.fetchExpenses(period)
    ready.value = true
  },
  { immediate: true },
)

templateStore.fetchTemplates().finally(() => undefined)

async function handleToggle(id: string, status: 'pending' | 'paid') {
  await store.toggleStatus(id, status)
}

async function handleManualExpenseSaved(payload: CreateManualExpenseInput) {
  if (manualExpenseSaving.value) return

  manualExpenseSaving.value = true
  try {
    await store.addManualExpense(payload)
    manualExpenseSheetOpen.value = false
  } finally {
    manualExpenseSaving.value = false
  }
}

async function handleInitMonth() {
  const now = Date.now()
  if (now < initMonthLockedUntil.value) return
  if (initMonthSubmitting.value || store.isGeneratingForPeriod) return

  initMonthLockedUntil.value = now + 800
  initMonthSubmitting.value = true
  try {
    if (templateStore.templates.length === 0) {
      toast.warning('No tienes plantillas creadas. Ve a Plantillas para crear la base de tus gastos mensuales.')
      return
    }

    await store.generateForPeriod(currentPeriod.value)
  } finally {
    initMonthSubmitting.value = false
  }
}

const activeTab = ref<'all' | 'pending' | 'paid'>('all')

const isSearchActive = computed(() => searchQuery.value.trim().length > 0)
const isFilterActive = computed(() => isSearchActive.value || dueDayFilter.value !== null)
const showInitMonthAction = computed(
  () => ready.value && !store.hasMonthInitializedFromTemplates,
)

const queriedExpenses = computed(() =>
  filterByQuery(store.expenses, searchQuery.value, expenseQueryFields),
)
const queriedPending = computed(() =>
  filterByQuery(store.pendingExpenses, searchQuery.value, expenseQueryFields),
)
const queriedPaid = computed(() =>
  filterByQuery(store.paidExpenses, searchQuery.value, expenseQueryFields),
)

const queriedForMarks = computed(() => {
  if (activeTab.value === 'pending') return queriedPending.value
  if (activeTab.value === 'paid') return queriedPaid.value
  return queriedExpenses.value
})

const dueDayMarks = computed(() => buildDueDayMarks(queriedForMarks.value, 'status'))
const hasUndated = computed(() => queriedForMarks.value.some((item) => item.dueDay == null))

const visibleExpenses = computed(() => filterByDueDay(queriedExpenses.value, dueDayFilter.value))
const visiblePending = computed(() => filterByDueDay(queriedPending.value, dueDayFilter.value))
const visiblePaid = computed(() => filterByDueDay(queriedPaid.value, dueDayFilter.value))

const allPaid = computed(
  () =>
    store.expenses.length > 0 &&
    store.pendingExpenses.length === 0,
)
</script>

<template>
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-5xl">
    <div class="hidden sm:block">
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {{ isCurrentPeriod ? 'Mes actual' : 'Período' }}
      </p>
      <h2 class="font-bold text-foreground text-2xl tracking-tight capitalize">
        Gastos
        <span class="font-medium text-muted-foreground text-base"> · {{ periodLabel }}</span>
      </h2>
    </div>
    <div class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
      <ListSearchBar
        id="expense-search"
        v-model="searchQuery"
        aria-label="Buscar gastos"
      />
      <DueDayCalendar
        v-if="ready"
        v-model="dueDayFilter"
        :period-key="currentPeriod"
        :marks="dueDayMarks"
        mode="status"
        :has-undated="hasUndated"
        allow-period-change
        :disabled="store.loading"
        @update:period-key="setPeriod"
      />
      <Button
        v-if="showInitMonthAction"
        size="sm"
        class="gap-1.5 sm:shrink-0"
        :disabled="store.loading || store.isGeneratingForPeriod || initMonthSubmitting"
        @click="handleInitMonth"
      >
        <RefreshCw class="w-4 h-4" />
        Iniciar mes
      </Button>
      <Button
        size="sm"
        class="gap-1.5 sm:shrink-0"
        :disabled="manualExpenseSaving"
        @click="manualExpenseSheetOpen = true"
      >
        <Plus class="w-4 h-4" />
        Agregar gasto adicional
      </Button>
    </div>

    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="grid grid-cols-3 w-full">
        <TabsTrigger value="all">
          Todos
          <span
            v-if="store.expenses.length"
            class="bg-muted ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
          >
            {{ store.expenses.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pendientes
          <span
            v-if="store.pendingExpenses.length"
            class="bg-amber-100 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] text-amber-700"
          >
            {{ store.pendingExpenses.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="paid">
          Pagados
          <span
            v-if="store.paidExpenses.length"
            class="bg-emerald-100 ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] text-emerald-700"
          >
            {{ store.paidExpenses.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Tab content shared -->
      <TabsContent value="all" :force-mount="true" v-show="activeTab === 'all'" class="mt-4">
        <!-- Skeletons -->
        <div v-if="store.loading" class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Skeleton v-for="i in 6" :key="i" class="rounded-2xl h-20" />
        </div>

        <!-- All paid banner -->
        <Card
          v-else-if="allPaid"
          class="bg-emerald-50/60 mb-3 border-emerald-200"
        >
          <CardContent class="flex items-center gap-3 py-4">
            <CheckCircle2 class="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p class="font-semibold text-emerald-700 text-sm">¡Todos los gastos pagados! 🎉</p>
              <p class="text-emerald-600 text-xs">No tienes gastos pendientes este mes.</p>
            </div>
          </CardContent>
        </Card>

        <div v-if="!store.loading" class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <ExpenseListItem
            v-for="expense in visibleExpenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
            @view="openExpenseDetail(expense)"
          />
          <div
            v-if="visibleExpenses.length === 0"
            class="flex flex-col justify-center items-center gap-3 sm:col-span-2 py-16"
          >
            <div class="flex justify-center items-center bg-brand-soft rounded-full size-14">
              <Search v-if="isFilterActive" class="size-7 text-brand" />
              <InboxIcon v-else class="size-7 text-brand" />
            </div>
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">
                {{ isFilterActive ? 'Sin coincidencias' : 'No hay gastos este mes' }}
              </p>
              <p class="mx-auto mt-1 max-w-[32ch] text-muted-foreground text-xs">
                {{
                  isFilterActive
                    ? 'Prueba con otro día, nombre o categoría'
                    : 'Inicia el mes desde el Dashboard o agrega un gasto adicional.'
                }}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="pending" :force-mount="true" v-show="activeTab === 'pending'" class="mt-4">
        <div v-if="store.loading" class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Skeleton v-for="i in 4" :key="i" class="rounded-2xl h-20" />
        </div>
        <div v-else class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <ExpenseListItem
            v-for="expense in visiblePending"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
            @view="openExpenseDetail(expense)"
          />
          <div
            v-if="visiblePending.length === 0"
            class="flex flex-col justify-center items-center gap-4 sm:col-span-2 py-16"
          >
            <Search v-if="isFilterActive" class="w-10 h-10 text-muted-foreground" />
            <CheckCircle2 v-else class="w-10 h-10 text-emerald-500" />
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">
                {{ isFilterActive ? 'Sin coincidencias' : '¡Sin pendientes!' }}
              </p>
              <p class="mt-1 text-muted-foreground text-xs">
                {{ isFilterActive ? 'Prueba con otro día, nombre o categoría' : 'Todos los gastos están pagados' }}
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="paid" :force-mount="true" v-show="activeTab === 'paid'" class="mt-4">
        <div v-if="store.loading" class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <Skeleton v-for="i in 4" :key="i" class="rounded-2xl h-20" />
        </div>
        <div v-else class="gap-3 grid grid-cols-1 sm:grid-cols-2">
          <ExpenseListItem
            v-for="expense in visiblePaid"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
            @view="openExpenseDetail(expense)"
          />
          <div
            v-if="visiblePaid.length === 0"
            class="flex flex-col justify-center items-center gap-4 sm:col-span-2 py-16"
          >
            <Search v-if="isFilterActive" class="w-10 h-10 text-muted-foreground" />
            <PackageOpen v-else class="w-10 h-10 text-muted-foreground" />
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">
                {{ isFilterActive ? 'Sin coincidencias' : 'No hay gastos pagados aún' }}
              </p>
              <p v-if="isFilterActive" class="mt-1 text-muted-foreground text-xs">
                Prueba con otro día, nombre o categoría
              </p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>

  <ManualExpenseFormSheet
    :open="manualExpenseSheetOpen"
    :saving="manualExpenseSaving"
    :period-key="currentPeriod"
    @close="manualExpenseSheetOpen = false"
    @saved="handleManualExpenseSaved"
  />

  <RecordDetailSheet
    :open="detailOpen"
    :record="detailRecord"
    @close="detailOpen = false"
  />
</template>
