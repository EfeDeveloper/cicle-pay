<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useExpenseStore } from '@/stores/expenseStore'
import { getCurrentPeriodKey, formatPeriodLabel } from '@/services/expenseService'
import SummaryCard from '@/components/dashboard/SummaryCard.vue'
import ExpenseListItem from '@/components/expenses/ExpenseListItem.vue'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PackageOpen, CheckCircle2, DollarSign, Clock, ListChecks, RefreshCw } from '@lucide/vue'

const store = useExpenseStore()
const period = getCurrentPeriodKey()
const periodLabel = formatPeriodLabel(period)

onMounted(async () => {
  await store.fetchExpenses(period)
})

async function handleToggle(id: string, status: 'pending' | 'paid') {
  await store.toggleStatus(id, status)
}

async function handleInitMonth() {
  await store.generateForPeriod(period)
}

const progressValue = () => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
}
</script>

<template>
  <div class="space-y-6 mx-auto p-4 md:p-6 max-w-2xl">
    <!-- Period header -->
    <div>
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">Período actual</p>
      <h2 class="font-bold text-foreground text-xl capitalize">{{ periodLabel }}</h2>
    </div>

    <!-- Summary cards -->
    <div v-if="store.loading" class="gap-3 grid grid-cols-2">
      <Skeleton v-for="i in 4" :key="i" class="rounded-lg h-24" />
    </div>

    <div v-else class="gap-3 grid grid-cols-2">
      <SummaryCard
        title="Total pagado"
        :value="store.summary.paidAmount"
        :is-currency="true"
        :subtitle="`${store.summary.paidCount} de ${store.summary.totalCount} gastos`"
        :icon="CheckCircle2"
        variant="paid"
      />
      <SummaryCard
        title="Pendiente"
        :value="store.summary.pendingAmount"
        :is-currency="true"
        :subtitle="`${store.summary.pendingCount} gastos restantes`"
        :icon="Clock"
        variant="pending"
      />
      <SummaryCard
        title="Total del mes"
        :value="store.summary.totalAmount"
        :is-currency="true"
        :subtitle="periodLabel"
        :icon="DollarSign"
        variant="neutral"
      />
      <SummaryCard
        title="Completado"
        :value="`${progressValue()}%`"
        :subtitle="store.summary.totalCount === 0 ? 'Sin gastos' : `${store.summary.paidCount}/${store.summary.totalCount}`"
        :icon="ListChecks"
        variant="neutral"
      />
    </div>

    <!-- Progress bar -->
    <div v-if="!store.loading && store.summary.totalCount > 0" class="space-y-2">
      <div class="flex justify-between text-muted-foreground text-xs">
        <span>Progreso del mes</span>
        <span>{{ progressValue() }}%</span>
      </div>
      <Progress :model-value="progressValue()" class="h-2" />
    </div>

    <!-- All paid banner -->
    <Card
      v-if="!store.loading && store.summary.totalCount > 0 && store.summary.pendingCount === 0"
      class="bg-emerald-50/60 border-emerald-200"
    >
      <CardContent class="flex items-center gap-3 py-4">
        <CheckCircle2 class="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p class="font-semibold text-emerald-700 text-sm">¡Todo al día! 🎉</p>
          <p class="text-emerald-600 text-xs">Has pagado todos los gastos de {{ periodLabel }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Pending preview -->
    <div v-if="!store.loading && store.pendingExpenses.length > 0">
      <h3 class="flex items-center gap-2 mb-3 font-semibold text-foreground text-sm">
        <Clock class="w-4 h-4 text-amber-500" />
        Próximos por pagar
      </h3>
      <div class="flex flex-col gap-2">
        <ExpenseListItem
          v-for="expense in store.pendingExpenses.slice(0, 3)"
          :key="expense.id"
          :expense="expense"
          @toggle="handleToggle"
        />
        <p
          v-if="store.pendingExpenses.length > 3"
          class="py-1 text-muted-foreground text-xs text-center"
        >
          +{{ store.pendingExpenses.length - 3 }} gastos más en la sección Gastos
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!store.loading && store.expenses.length === 0"
      class="flex flex-col justify-center items-center gap-4 py-16"
    >
      <div class="flex justify-center items-center bg-muted rounded-full size-14">
        <PackageOpen class="size-7 text-muted-foreground" />
      </div>
      <div class="text-center">
        <p class="font-medium text-foreground text-sm">Sin gastos este mes</p>
        <p class="mx-auto mt-1 max-w-[28ch] text-muted-foreground text-xs">
          No hay plantillas activas o no se han generado los gastos del mes.
        </p>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Button @click="handleInitMonth" :disabled="store.loading" size="sm">
          <RefreshCw class="size-4" data-icon="inline-start" />
          Iniciar mes
        </Button>
        <RouterLink to="/templates" class="text-muted-foreground hover:text-foreground text-xs transition-colors">
          Ir a Plantillas →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
