<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useExpenseStore } from '@/stores/expenseStore'
import { getCurrentPeriodKey } from '@/services/expenseService'
import ExpenseListItem from '@/components/expenses/ExpenseListItem.vue'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, PackageOpen, InboxIcon } from '@lucide/vue'

const store = useExpenseStore()
const period = getCurrentPeriodKey()

onMounted(async () => {
  await store.fetchExpenses(period)
})

async function handleToggle(id: string, status: 'pending' | 'paid') {
  await store.toggleStatus(id, status)
}

const activeTab = ref<'all' | 'pending' | 'paid'>('all')

const allPaid = computed(
  () =>
    store.expenses.length > 0 &&
    store.pendingExpenses.length === 0,
)
</script>

<template>
  <div class="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
    <Tabs v-model="activeTab" class="w-full">
      <TabsList class="w-full grid grid-cols-3">
        <TabsTrigger value="all">
          Todos
          <span
            v-if="store.expenses.length"
            class="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5"
          >
            {{ store.expenses.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pendientes
          <span
            v-if="store.pendingExpenses.length"
            class="ml-1.5 text-[10px] bg-amber-100 text-amber-700 rounded-full px-1.5 py-0.5"
          >
            {{ store.pendingExpenses.length }}
          </span>
        </TabsTrigger>
        <TabsTrigger value="paid">
          Pagados
          <span
            v-if="store.paidExpenses.length"
            class="ml-1.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5"
          >
            {{ store.paidExpenses.length }}
          </span>
        </TabsTrigger>
      </TabsList>

      <!-- Tab content shared -->
      <TabsContent value="all" :force-mount="true" v-show="activeTab === 'all'" class="mt-4">
        <!-- Skeletons -->
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 5" :key="i" class="h-16 rounded-lg" />
        </div>

        <!-- All paid banner -->
        <Card
          v-else-if="allPaid"
          class="border-emerald-200 bg-emerald-50/60 mb-3"
        >
          <CardContent class="flex items-center gap-3 py-4">
            <CheckCircle2 class="w-6 h-6 text-emerald-500 shrink-0" />
            <div>
              <p class="text-sm font-semibold text-emerald-700">¡Todos los gastos pagados! 🎉</p>
              <p class="text-xs text-emerald-600">No tienes gastos pendientes este mes.</p>
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
          <div v-if="store.expenses.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
            <InboxIcon class="w-10 h-10 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">No hay gastos este mes</p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="pending" :force-mount="true" v-show="activeTab === 'pending'" class="mt-4">
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
        </div>
        <div v-else class="flex flex-col gap-2">
          <ExpenseListItem
            v-for="expense in store.pendingExpenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
          />
          <div v-if="store.pendingExpenses.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
            <CheckCircle2 class="w-10 h-10 text-emerald-500" />
            <div class="text-center">
              <p class="text-sm font-medium text-foreground">¡Sin pendientes!</p>
              <p class="text-xs text-muted-foreground mt-1">Todos los gastos están pagados</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="paid" :force-mount="true" v-show="activeTab === 'paid'" class="mt-4">
        <div v-if="store.loading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="h-16 rounded-lg" />
        </div>
        <div v-else class="flex flex-col gap-2">
          <ExpenseListItem
            v-for="expense in store.paidExpenses"
            :key="expense.id"
            :expense="expense"
            @toggle="handleToggle"
          />
          <div v-if="store.paidExpenses.length === 0" class="flex flex-col items-center justify-center py-16 gap-4">
            <PackageOpen class="w-10 h-10 text-muted-foreground" />
            <p class="text-sm text-muted-foreground">No hay gastos pagados aún</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>
