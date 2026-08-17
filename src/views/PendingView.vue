<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { getCurrentPeriodKey } from '@/services/expenseService'
import type { CreateManualExpenseInput } from '@/types/expense'
import ExpenseListItem from '@/components/expenses/ExpenseListItem.vue'
import ManualExpenseFormSheet from '@/components/expenses/ManualExpenseFormSheet.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, PackageOpen, InboxIcon, Plus } from '@lucide/vue'

const store = useExpenseStore()
const period = getCurrentPeriodKey()
const manualExpenseSheetOpen = ref(false)

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

const allPaid = computed(
  () =>
    store.expenses.length > 0 &&
    store.pendingExpenses.length === 0,
)
</script>

<template>
  <div class="space-y-4 mx-auto p-4 md:p-6 max-w-2xl">
    <div class="flex justify-end">
      <Button size="sm" class="gap-1.5" @click="manualExpenseSheetOpen = true">
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
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 5" :key="i" class="rounded-lg h-16" />
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

        <div v-if="!store.loading" class="flex flex-col gap-2">
          <ExpenseListItem
            v-for="expense in store.expenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
          />
          <div v-if="store.expenses.length === 0" class="flex flex-col justify-center items-center gap-4 py-16">
            <InboxIcon class="w-10 h-10 text-muted-foreground" />
            <p class="text-muted-foreground text-sm">No hay gastos este mes</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="pending" :force-mount="true" v-show="activeTab === 'pending'" class="mt-4">
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="rounded-lg h-16" />
        </div>
        <div v-else class="flex flex-col gap-2">
          <ExpenseListItem
            v-for="expense in store.pendingExpenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
          />
          <div v-if="store.pendingExpenses.length === 0" class="flex flex-col justify-center items-center gap-4 py-16">
            <CheckCircle2 class="w-10 h-10 text-emerald-500" />
            <div class="text-center">
              <p class="font-medium text-foreground text-sm">¡Sin pendientes!</p>
              <p class="mt-1 text-muted-foreground text-xs">Todos los gastos están pagados</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="paid" :force-mount="true" v-show="activeTab === 'paid'" class="mt-4">
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="rounded-lg h-16" />
        </div>
        <div v-else class="flex flex-col gap-2">
          <ExpenseListItem
            v-for="expense in store.paidExpenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
          />
          <div v-if="store.paidExpenses.length === 0" class="flex flex-col justify-center items-center gap-4 py-16">
            <PackageOpen class="w-10 h-10 text-muted-foreground" />
            <p class="text-muted-foreground text-sm">No hay gastos pagados aún</p>
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
</template>
