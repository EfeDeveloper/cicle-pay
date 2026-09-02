<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useExpenseStore } from '@/stores/expenseStore'
import { useTemplateStore } from '@/stores/templateStore'
import { useBudgetStore } from '@/stores/budgetStore'
import {
  getCurrentPeriodKey,
  formatPeriodLabel,
  getRecentPeriodsHistory,
  type PeriodHistoryPoint,
} from '@/services/expenseService'
import { buildCategorySpend } from '@/lib/categorySpend'
import HeroSpendCard from '@/components/dashboard/HeroSpendCard.vue'
import CategoryBudgetCard from '@/components/dashboard/CategoryBudgetCard.vue'
import PaymentCompletionCard from '@/components/dashboard/PaymentCompletionCard.vue'
import SavingsGoalCard from '@/components/dashboard/SavingsGoalCard.vue'
import PaymentStatusOverviewCard from '@/components/dashboard/PaymentStatusOverviewCard.vue'
import BudgetFormSheet from '@/components/dashboard/BudgetFormSheet.vue'
import UpcomingExpenseCard from '@/components/expenses/UpcomingExpenseCard.vue'
import RecordDetailSheet from '@/components/records/RecordDetailSheet.vue'
import { toExpenseDetail, type RecordDetail } from '@/lib/recordDetail'
import type { MonthlyExpense } from '@/types/expense'
import type { BudgetFormDefaults } from '@/stores/budgetStore'
import type { SaveBudgetInput } from '@/types/budget'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { PackageOpen, Clock, RefreshCw, Smile } from '@lucide/vue'

const store = useExpenseStore()
const templateStore = useTemplateStore()
const budgetStore = useBudgetStore()
const period = getCurrentPeriodKey()
const periodLabel = formatPeriodLabel(period)
const ready = ref(false)
const detailOpen = ref(false)
const detailRecord = ref<RecordDetail | null>(null)
const sheetOpen = ref(false)
const deleteDialogOpen = ref(false)
const historyPoints = ref<PeriodHistoryPoint[]>([])
const initMonthSubmitting = ref(false)
const initMonthLockedUntil = ref(0)

const formDefaults = ref<BudgetFormDefaults>({
  totalAmount: null,
  categories: null,
  prefilledFromPrevious: false,
  hasExistingBudget: false,
})

function openExpenseDetail(expense: MonthlyExpense) {
  detailRecord.value = toExpenseDetail(expense)
  detailOpen.value = true
}

onMounted(async () => {
  const [_, __, history] = await Promise.all([
    store.fetchExpenses(period).catch(() => undefined),
    templateStore.fetchTemplates().catch(() => undefined),
    budgetStore.fetchBudget(period).catch(() => undefined),
    getRecentPeriodsHistory(period, 6).catch(() => []),
  ])
  historyPoints.value = history || []
  ready.value = true
})

async function handleToggle(id: string, status: 'pending' | 'paid') {
  await store.toggleStatus(id, status)
  getRecentPeriodsHistory(period, 6).then((h) => {
    historyPoints.value = h
  }).catch(() => undefined)
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

    const result = await store.generateForPeriod(period)

    if (result.created === 0 && result.skipped === 0) {
      toast.info('No hay plantillas activas. Crea o activa una plantilla para iniciar el mes.')
      return
    }

    if (result.created === 0 && result.skipped > 0) {
      toast.warning('Este mes ya estaba iniciado.')
      return
    }
    toast.success(`${result.created} gastos generados para el mes`)
    getRecentPeriodsHistory(period, 6).then((h) => {
      historyPoints.value = h
    }).catch(() => undefined)
  } catch {
    toast.error('No se pudo iniciar el mes. Intenta nuevamente.')
  } finally {
    initMonthSubmitting.value = false
  }
}

async function openBudgetSheet() {
  try {
    formDefaults.value = await budgetStore.loadFormDefaults(period)
  } catch {
    formDefaults.value = {
      totalAmount: null,
      categories: null,
      prefilledFromPrevious: false,
      hasExistingBudget: false,
    }
  }
  sheetOpen.value = true
}

async function handleSaveBudget(payload: SaveBudgetInput) {
  try {
    await budgetStore.saveBudget(period, payload)
    sheetOpen.value = false
  } catch {
    // Toast del store; el sheet permanece abierto
  }
}

async function executeDeleteBudget() {
  try {
    await budgetStore.deleteBudget(period)
    deleteDialogOpen.value = false
    sheetOpen.value = false
  } catch {
    deleteDialogOpen.value = false
  }
}

const progressValue = computed(() => {
  if (store.summary.totalCount === 0) return 0
  return Math.round((store.summary.paidCount / store.summary.totalCount) * 100)
})

const categorySpend = computed(() =>
  buildCategorySpend(store.expenses, budgetStore.budget?.categories),
)

// Fixed (from templates) vs Variable (manual/extras) pending spend breakdown
const fixedPendingAmount = computed(() => {
  return store.pendingExpenses
    .filter((e) => e.source === 'template' || (e.templateId !== null && e.templateId !== undefined))
    .reduce((sum, e) => sum + e.amount, 0)
})

const variablePendingAmount = computed(() => {
  return store.pendingExpenses
    .filter((e) => e.source === 'manual' || !e.templateId)
    .reduce((sum, e) => sum + e.amount, 0)
})

const showInitMonthAction = computed(
  () => ready.value && store.expenses.length > 0 && !store.hasMonthInitializedFromTemplates,
)
</script>

<template>
  <div class="space-y-6 mx-auto p-4 md:p-8 max-w-6xl">
    <!-- Top Header: PERIODO ACTUAL / Agosto 2026 -->
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div>
        <p class="font-medium text-neutral-400 dark:text-neutral-500 text-[11px] uppercase tracking-wider">
          PERIODO ACTUAL
        </p>
        <h2 class="font-bold text-neutral-900 dark:text-neutral-50 text-2xl md:text-3xl capitalize tracking-tight mt-0.5">
          {{ periodLabel }}
        </h2>
      </div>

      <Button
        v-if="showInitMonthAction"
        :disabled="store.loading || store.isGeneratingForPeriod || initMonthSubmitting"
        class="rounded-full px-5 bg-neutral-900 text-white hover:bg-neutral-800 self-start sm:self-auto"
        @click="handleInitMonth"
      >
        <RefreshCw class="size-4" />
        Iniciar mes
      </Button>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="!ready" class="space-y-5">
      <div class="gap-5 grid lg:grid-cols-12">
        <Skeleton class="lg:col-span-7 xl:col-span-8 rounded-3xl h-64" />
        <Skeleton class="lg:col-span-5 xl:col-span-4 rounded-3xl h-64" />
      </div>
      <div class="gap-5 grid lg:grid-cols-12">
        <Skeleton class="lg:col-span-7 xl:col-span-8 rounded-3xl h-48" />
        <Skeleton class="lg:col-span-5 xl:col-span-4 rounded-3xl h-48" />
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">
      <!-- Empty state when month has no expenses -->
      <template v-if="store.expenses.length === 0">
        <Card class="shadow-card mx-auto max-w-xl border border-border rounded-3xl">
          <CardContent class="flex flex-col items-center gap-4 py-12">
            <div class="flex justify-center items-center bg-brand-soft rounded-full size-14 text-brand">
              <PackageOpen class="size-7" />
            </div>
            <div class="text-center">
              <p class="font-semibold text-neutral-900 text-base">Sin gastos este mes</p>
              <p class="mx-auto mt-1 max-w-[32ch] text-neutral-500 text-sm">
                Agrega un gasto adicional para que aparezca la acción de iniciar mes.
              </p>
            </div>
            <div class="flex flex-col items-center gap-2">
              <Button
                @click="handleInitMonth"
                :disabled="store.loading || store.isGeneratingForPeriod || initMonthSubmitting"
                class="rounded-full px-5 bg-neutral-900 text-white hover:bg-neutral-800"
              >
                <RefreshCw class="size-4" />
                Iniciar mes
              </Button>
              <RouterLink
                to="/templates"
                class="text-neutral-500 hover:text-neutral-900 text-xs transition-colors"
              >
                Ir a Plantillas →
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      </template>

      <!-- Dashboard Layout: Pure CSS Grid hierarchy -->
      <template v-else>
        <!-- UPPER BLOCK: Left and Right Columns in pure CSS -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <!-- LEFT COLUMN: Dictates the height naturally -->
          <div class="lg:col-span-7 xl:col-span-8 flex flex-col gap-5">
            <!-- Hero Spend Card -->
            <HeroSpendCard
              :spent="store.summary.totalAmount"
              :cap="budgetStore.budget?.totalAmount ?? null"
              :period-label="periodLabel"
              @open-budget="openBudgetSheet"
            />

            <!-- Sub-grid: Pagos Completados & Metas de Ahorro -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <PaymentCompletionCard
                :paid-amount="store.summary.paidAmount"
                :paid-count="store.summary.paidCount"
                :total-count="store.summary.totalCount"
                :completion-rate="progressValue"
                :history="historyPoints"
                class="h-full"
              />

              <SavingsGoalCard
                :target-amount="150000"
                :target-percent="15"
                class="h-full"
              />
            </div>
          </div>

          <!-- RIGHT COLUMN: Stretches to left column height in pure CSS without JS -->
          <div class="lg:col-span-5 xl:col-span-4 self-stretch flex flex-col min-h-0">
            <Card
              class="h-full flex flex-col min-h-0 bg-neutral-900 dark:bg-neutral-950 shadow-elevated border-0 rounded-2xl md:rounded-3xl text-neutral-50 overflow-hidden"
            >
              <CardContent class="p-5 md:p-6 flex flex-col h-full min-h-0 gap-2.5">
                <div class="shrink-0">
                  <h3 class="font-bold text-base md:text-lg text-white">
                    Gastos mensuales por categoría
                  </h3>
                  <p class="text-white/40 text-xs mt-0.5">
                    Así se reparte el gasto este mes.
                  </p>
                </div>

                <!-- Responsive Scroll Area: Natural flow on mobile, full-height absolute containment on desktop -->
                <div class="relative lg:flex-1 min-h-0 max-h-72 lg:max-h-none overflow-hidden">
                  <div class="overflow-y-auto lg:absolute lg:inset-0 max-h-72 lg:max-h-none pr-1.5 space-y-1 scrollbar-thin">
                    <CategoryBudgetCard
                      v-for="row in categorySpend"
                      :key="row.category"
                      :category="row.category"
                      :spent="row.spent"
                      :count="row.count"
                      :allocated="row.allocated"
                    />
                  </div>
                </div>

                <RouterLink
                  to="/pending"
                  class="shrink-0 pt-2.5 border-t border-white/10 text-white/50 hover:text-white text-xs transition-colors block text-right font-medium"
                >
                  Ver todos los gastos →
                </RouterLink>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- LOWER BLOCK: Left (Próximos por pagar) & Right (Estado General de Pagos) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch pt-2">
          <!-- LEFT LOWER (7 or 8 cols): Próximos por pagar list -->
          <div class="lg:col-span-7 xl:col-span-8 flex flex-col space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="flex items-center gap-2 font-medium text-neutral-800 dark:text-neutral-200 text-sm">
                <Clock class="size-4 text-neutral-500" />
                <span>Próximos por pagar</span>
              </h3>
              <RouterLink
                v-if="store.pendingExpenses.length > 0"
                to="/pending"
                class="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xs transition-colors"
              >
                Ver pendientes ({{ store.pendingExpenses.length }}) →
              </RouterLink>
            </div>

            <!-- List of pending expenses -->
            <div v-if="store.pendingExpenses.length > 0" class="space-y-2.5">
              <UpcomingExpenseCard
                v-for="expense in store.pendingExpenses.slice(0, 4)"
                :key="expense.id"
                :expense="expense"
                @toggle="handleToggle"
                @view="openExpenseDetail(expense)"
              />
            </div>

            <!-- Empty state: All expenses paid / up to date matching right card height -->
            <div
              v-else
              class="flex-1 flex flex-col items-center justify-center min-h-50 py-10 px-6 bg-card border border-border rounded-2xl md:rounded-3xl shadow-card gap-4 text-center"
            >
              <div class="flex justify-center items-center bg-emerald-50 dark:bg-emerald-950/40 rounded-full size-18 md:size-20 text-emerald-600 dark:text-emerald-400 shadow-xs">
                <Smile class="size-10 md:size-11 stroke-[1.75]" />
              </div>
              <div class="space-y-1">
                <p class="font-bold text-foreground text-base md:text-lg">¡Estás al día!</p>
                <p class="text-muted-foreground text-xs md:text-sm">Todos tus gastos de este mes están pagados 🎉</p>
              </div>
            </div>

            <p
              v-if="store.pendingExpenses.length > 4"
              class="py-2 text-neutral-400 text-xs text-center"
            >
              +{{ store.pendingExpenses.length - 4 }} gastos más en la sección Gastos
            </p>
          </div>

          <!-- RIGHT LOWER (5 or 4 cols): Estado General de Pagos -->
          <div class="lg:col-span-5 xl:col-span-4 flex flex-col">
            <PaymentStatusOverviewCard
              :paid-amount="store.summary.paidAmount"
              :pending-amount="store.summary.pendingAmount"
              :fixed-pending-amount="fixedPendingAmount"
              :variable-pending-amount="variablePendingAmount"
              :pending-count="store.summary.pendingCount"
              class="h-full"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Budget Form Sheet -->
    <BudgetFormSheet
      :open="sheetOpen"
      :period-label="periodLabel"
      :has-existing-budget="formDefaults.hasExistingBudget"
      :initial-total="formDefaults.totalAmount"
      :initial-categories="formDefaults.categories"
      :prefilled-from-previous="formDefaults.prefilledFromPrevious"
      :saving="budgetStore.saving"
      @close="sheetOpen = false"
      @saved="handleSaveBudget"
      @request-delete="deleteDialogOpen = true"
    />

    <!-- Delete Budget Confirmation Dialog -->
    <AlertDialog :open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Quitar presupuesto?</AlertDialogTitle>
          <AlertDialogDescription>
            Se elimina el tope y los cupos de {{ periodLabel }}. Tus gastos no se modifican.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteDialogOpen = false">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            class="bg-destructive text-white hover:bg-destructive/90"
            :disabled="budgetStore.saving"
            @click="executeDeleteBudget"
          >
            Quitar presupuesto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Expense Detail Sheet -->
    <RecordDetailSheet
      :open="detailOpen"
      :record="detailRecord"
      @close="detailOpen = false"
    />

  </div>
</template>
