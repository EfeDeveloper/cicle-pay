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
  // Only generate if no expenses exist for this month (lazy init, once per month)
  if (store.expenses.length === 0) {
    await store.generateForPeriod(period)
  }
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
  <div class="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
    <!-- Period header -->
    <div>
      <p class="text-xs text-muted-foreground uppercase tracking-wide font-medium">Período actual</p>
      <h2 class="text-xl font-bold text-foreground capitalize">{{ periodLabel }}</h2>
    </div>

    <!-- Summary cards -->
    <div v-if="store.loading" class="grid grid-cols-2 gap-3">
      <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-lg" />
    </div>

    <div v-else class="grid grid-cols-2 gap-3">
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
      <div class="flex justify-between text-xs text-muted-foreground">
        <span>Progreso del mes</span>
        <span>{{ progressValue() }}%</span>
      </div>
      <Progress :model-value="progressValue()" class="h-2" />
    </div>

    <!-- All paid banner -->
    <Card
      v-if="!store.loading && store.summary.totalCount > 0 && store.summary.pendingCount === 0"
      class="border-emerald-200 bg-emerald-50/60"
    >
      <CardContent class="flex items-center gap-3 py-4">
        <CheckCircle2 class="w-6 h-6 text-emerald-500 shrink-0" />
        <div>
          <p class="text-sm font-semibold text-emerald-700">¡Todo al día! 🎉</p>
          <p class="text-xs text-emerald-600">Has pagado todos los gastos de {{ periodLabel }}</p>
        </div>
      </CardContent>
    </Card>

    <!-- Pending preview -->
    <div v-if="!store.loading && store.pendingExpenses.length > 0">
      <h3 class="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
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
          class="text-xs text-muted-foreground text-center py-1"
        >
          +{{ store.pendingExpenses.length - 3 }} gastos más en la sección Gastos
        </p>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!store.loading && store.expenses.length === 0"
      class="flex flex-col items-center justify-center py-16 gap-4"
    >
      <div class="size-14 rounded-full bg-muted flex items-center justify-center">
        <PackageOpen class="size-7 text-muted-foreground" />
      </div>
      <div class="text-center">
        <p class="text-sm font-medium text-foreground">Sin gastos este mes</p>
        <p class="text-xs text-muted-foreground mt-1 max-w-[28ch] mx-auto">
          No hay plantillas activas o no se han generado los gastos del mes.
        </p>
      </div>
      <div class="flex flex-col items-center gap-2">
        <Button @click="handleInitMonth" :disabled="store.loading" size="sm">
          <RefreshCw class="size-4" data-icon="inline-start" />
          Iniciar mes
        </Button>
        <RouterLink to="/templates" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Ir a Plantillas →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
