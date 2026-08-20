<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { getCurrentPeriodKey } from '@/services/expenseService'
import type { CreateManualExpenseInput, MonthlyExpense } from '@/types/expense'
import ExpenseListItem from '@/components/expenses/ExpenseListItem.vue'
import ManualExpenseFormSheet from '@/components/expenses/ManualExpenseFormSheet.vue'
import ListSearchBar from '@/components/lists/ListSearchBar.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { expenseQueryFields, filterByQuery } from '@/lib/filterByQuery'
import { toExpenseDetail, type RecordDetail } from '@/lib/recordDetail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, PackageOpen, InboxIcon, Plus, Search } from '@lucide/vue'

const store = useExpenseStore()
const period = getCurrentPeriodKey()
const manualExpenseSheetOpen = ref(false)
const searchQuery = ref('')
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)

function openExpenseDetail(expense: MonthlyExpense) {
  detailRecord.value = toExpenseDetail(expense)
  detailOpen.value = true
}

onMounted(async () => {
  await store.fetchExpenses(period)
})

async function handleToggle(id: string, status: 'pending' | 'paid') {
  await store.toggleStatus(id, status)
}

async function handleManualExpenseSaved(payload: CreateManualExpenseInput) {
  await store.addManualExpense(payload)
  manualExpenseSheetOpen.value = false
}

const activeTab = ref<'all' | 'pending' | 'paid'>('all')

const isSearchActive = computed(() => searchQuery.value.trim().length > 0)

const visibleExpenses = computed(() =>
  filterByQuery(store.expenses, searchQuery.value, expenseQueryFields),
)
const visiblePending = computed(() =>
  filterByQuery(store.pendingExpenses, searchQuery.value, expenseQueryFields),
)
const visiblePaid = computed(() =>
  filterByQuery(store.paidExpenses, searchQuery.value, expenseQueryFields),
)

const allPaid = computed(
  () =>
    store.expenses.length > 0 &&
    store.pendingExpenses.length === 0,
)
</script>

<template>
  <div class="space-y-5 mx-auto p-4 md:p-8 max-w-5xl">
    <div class="hidden sm:block">
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">Mes actual</p>
      <h2 class="font-bold text-foreground text-2xl tracking-tight">Gastos</h2>
    </div>
    <div class="flex sm:flex-row flex-col sm:items-center gap-3">
      <ListSearchBar
        id="expense-search"
        v-model="searchQuery"
        aria-label="Buscar gastos"
      />
      <Button size="sm" class="gap-1.5 sm:shrink-0" @click="manualExpenseSheetOpen = true">
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
              <Search v-if="isSearchActive" class="size-7 text-brand" />
              <InboxIcon v-else class="size-7 text-brand" />
            </div>
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">
                {{ isSearchActive ? 'Sin coincidencias' : 'No hay gastos este mes' }}
              </p>
              <p class="mx-auto mt-1 max-w-[32ch] text-muted-foreground text-xs">
                {{
                  isSearchActive
                    ? 'Prueba con otro nombre o categoría'
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
            <Search v-if="isSearchActive" class="w-10 h-10 text-muted-foreground" />
            <CheckCircle2 v-else class="w-10 h-10 text-emerald-500" />
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">
                {{ isSearchActive ? 'Sin coincidencias' : '¡Sin pendientes!' }}
              </p>
              <p class="mt-1 text-muted-foreground text-xs">
                {{ isSearchActive ? 'Prueba con otro nombre o categoría' : 'Todos los gastos están pagados' }}
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
            <Search v-if="isSearchActive" class="w-10 h-10 text-muted-foreground" />
            <PackageOpen v-else class="w-10 h-10 text-muted-foreground" />
            <p class="text-muted-foreground text-sm">
              {{ isSearchActive ? 'Sin coincidencias' : 'No hay gastos pagados aún' }}
            </p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>

  <ManualExpenseFormSheet
    :open="manualExpenseSheetOpen"
    @close="manualExpenseSheetOpen = false"
    @saved="handleManualExpenseSaved"
  />

  <RecordDetailSheet
    :open="detailOpen"
    :record="detailRecord"
    @close="detailOpen = false"
  />
</template>
