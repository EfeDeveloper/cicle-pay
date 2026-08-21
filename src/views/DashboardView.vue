<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useExpenseStore } from '@/stores/expenseStore'
import { getCurrentPeriodKey, formatPeriodLabel } from '@/services/expenseService'
import { buildCategorySpend } from '@/lib/categorySpend'
import SummaryCard from '@/components/dashboard/SummaryCard.vue'
import CategoryBudgetCard from '@/components/dashboard/CategoryBudgetCard.vue'
import UpcomingExpenseCard from '@/components/expenses/UpcomingExpenseCard.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { toExpenseDetail, type RecordDetail } from '@/lib/recordDetail'
import type { MonthlyExpense } from '@/types/expense'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PackageOpen, CheckCircle2, DollarSign, Clock, ListChecks, RefreshCw } from '@lucide/vue'

const store = useExpenseStore()
const period = getCurrentPeriodKey()
const periodLabel = formatPeriodLabel(period)
const initMessage = ref<{ text: string; tone: 'info' | 'warning' } | null>(null)
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

async function handleInitMonth() {
  try {
    const result = await store.generateForPeriod(period)

    if (result.created === 0 && result.skipped === 0) {
      initMessage.value = {
        text: 'No hay plantillas activas. Crea o activa una plantilla para iniciar el mes.',
        tone: 'info',
      }
      return
    }

    if (result.created === 0 && result.skipped > 0) {
      initMessage.value = {
        text: 'Este mes ya estaba iniciado.',
        tone: 'warning',
      }
      return
    }

    initMessage.value = null
  } catch {
    initMessage.value = {
      text: 'No se pudo iniciar el mes. Intenta nuevamente.',
      tone: 'warning',
    }
  }
}

const progressValue = () => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
}

const categorySpend = computed(() => buildCategorySpend(store.expenses))
</script>

<template>
  <div class="space-y-6 mx-auto p-4 md:p-8 max-w-5xl">
    <div>
      <p class="font-medium text-muted-foreground text-xs uppercase tracking-wide">Período actual</p>
      <h2 class="font-bold text-foreground text-2xl capitalize tracking-tight">{{ periodLabel }}</h2>
    </div>

    <div v-if="store.loading" class="gap-5 grid lg:grid-cols-12">
      <Skeleton class="lg:col-span-8 rounded-2xl h-64" />
      <Skeleton class="lg:col-span-4 rounded-2xl h-64" />
    </div>

    <div v-else class="gap-5 grid lg:grid-cols-12">
      <div
        class="space-y-5"
        :class="store.expenses.length === 0 ? 'lg:col-span-12' : 'lg:col-span-8'"
      >
        <template v-if="store.expenses.length === 0">
          <Card class="shadow-card mx-auto max-w-xl">
            <CardContent class="flex flex-col items-center gap-4 py-12">
              <div class="flex justify-center items-center bg-brand-soft rounded-full size-14">
                <PackageOpen class="size-7 text-brand" />
              </div>
              <div class="text-center">
                <p class="font-semibold text-foreground text-base">Sin gastos este mes</p>
                <p class="mx-auto mt-1 max-w-[32ch] text-muted-foreground text-sm">
                  Inicia el mes para generar los gastos desde tus plantillas activas.
                </p>
              </div>
              <div class="flex flex-col items-center gap-2">
                <Button @click="handleInitMonth" :disabled="store.loading">
                  <RefreshCw class="size-4" />
                  Iniciar mes
                </Button>
                <RouterLink
                  to="/templates"
                  class="text-muted-foreground hover:text-foreground text-xs transition-colors"
                >
                  Ir a Plantillas →
                </RouterLink>
              </div>
              <div
                v-if="initMessage"
                :class="[
                  'w-full max-w-md rounded-full border px-3 py-2 text-xs text-center',
                  initMessage.tone === 'warning'
                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-slate-50 text-slate-700',
                ]"
              >
                {{ initMessage.text }}
              </div>
            </CardContent>
          </Card>
        </template>

        <template v-else>
          <SummaryCard
            title="Total del mes"
            :value="store.summary.totalAmount"
            :is-currency="true"
            :subtitle="periodLabel"
            :icon="DollarSign"
            variant="neutral"
          />
          <div class="gap-3 md:gap-4 grid grid-cols-3">
            <SummaryCard
              title="Pagado"
              :value="store.summary.paidAmount"
              :is-currency="true"
              :subtitle="`${store.summary.paidCount} de ${store.summary.totalCount} gastos`"
              :icon="CheckCircle2"
              variant="paid"
              compact
            />
            <SummaryCard
              title="Pendiente"
              :value="store.summary.pendingAmount"
              :is-currency="true"
              :subtitle="`${store.summary.pendingCount} gastos restantes`"
              :icon="Clock"
              variant="pending"
              compact
            />
            <SummaryCard
              title="Avance"
              :value="`${progressValue()}%`"
              :subtitle="`${store.summary.paidCount}/${store.summary.totalCount}`"
              :icon="ListChecks"
              variant="neutral"
              compact
            />
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-muted-foreground text-xs">
              <span>Progreso del mes</span>
              <span>{{ progressValue() }}%</span>
            </div>
            <Progress :model-value="progressValue()" class="h-2.5" />
          </div>

          <Card
            v-if="store.summary.pendingCount === 0"
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

          <div v-if="store.pendingExpenses.length > 0">
            <h3 class="flex items-center gap-2 mb-3 font-semibold text-foreground text-sm">
              <Clock class="w-4 h-4 text-brand" />
              Próximos por pagar
            </h3>
            <div class="space-y-3">
              <UpcomingExpenseCard
                v-for="expense in store.pendingExpenses.slice(0, 3)"
                :key="expense.id"
                :expense="expense"
                @toggle="handleToggle"
                @view="openExpenseDetail(expense)"
              />
            </div>
            <p
              v-if="store.pendingExpenses.length > 3"
              class="py-2 text-muted-foreground text-xs text-center"
            >
              +{{ store.pendingExpenses.length - 3 }} gastos más en la sección Gastos
            </p>
          </div>
        </template>
      </div>

      <section
        v-if="store.expenses.length > 0"
        class="flex flex-col lg:col-span-4 lg:h-full bg-primary shadow-elevated p-5 rounded-2xl text-primary-foreground"
      >
        <div class="mb-4">
          <p class="font-medium text-white/55 text-xs uppercase tracking-wide">Por categoría</p>
          <h3 class="mt-1 font-semibold text-lg">Gasto del mes</h3>
          <p class="mt-1 text-white/50 text-xs">
            Así se reparte el gasto este mes.
          </p>
        </div>
        <div class="space-y-4">
          <CategoryBudgetCard
            v-for="row in categorySpend"
            :key="row.category"
            :category="row.category"
            :spent="row.spent"
            :count="row.count"
            :allocated="row.allocated"
          />
        </div>
        <RouterLink
          to="/pending"
          class="mt-auto pt-6 text-white/50 hover:text-white text-xs transition-colors"
        >
          Ver todos los gastos →
        </RouterLink>
      </section>
    </div>

    <RecordDetailSheet
      :open="detailOpen"
      :record="detailRecord"
      @close="detailOpen = false"
    />
  </div>
</template>
