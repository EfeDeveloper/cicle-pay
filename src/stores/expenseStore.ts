import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getMonthlyExpenses,
  toggleExpenseStatus,
  generateMonthlyExpenses,
  getCurrentPeriodKey,
  createManualExpense,
} from '@/services/expenseService'
import type { CreateManualExpenseInput, MonthlyExpense, PeriodSummary } from '@/types/expense'
import { toast } from 'vue-sonner'

export const useExpenseStore = defineStore('expenses', () => {
  // ─── State ─────────────────────────────────────────────────────────────
  const expenses = ref<MonthlyExpense[]>([])
  const loading = ref(false)
  const currentPeriod = ref(getCurrentPeriodKey())

  // ─── Getters ───────────────────────────────────────────────────────────
  const paidExpenses = computed(() => expenses.value.filter((e) => e.status === 'paid'))

  const pendingExpenses = computed(() => expenses.value.filter((e) => e.status === 'pending'))

  const summary = computed<PeriodSummary>(() => {
    const paid = paidExpenses.value
    const pending = pendingExpenses.value
    const all = expenses.value

    return {
      periodKey: currentPeriod.value,
      totalAmount: all.reduce((sum, e) => sum + e.amount, 0),
      paidAmount: paid.reduce((sum, e) => sum + e.amount, 0),
      pendingAmount: pending.reduce((sum, e) => sum + e.amount, 0),
      totalCount: all.length,
      paidCount: paid.length,
      pendingCount: pending.length,
    }
  })

  // ─── Actions ───────────────────────────────────────────────────────────
  async function fetchExpenses(period: string) {
    loading.value = true
    currentPeriod.value = period
    try {
      expenses.value = await getMonthlyExpenses(period)
    } catch (e) {
      toast.error('Error al cargar gastos del mes')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function toggleStatus(id: string, status: 'pending' | 'paid') {
    // Optimistic update
    const idx = expenses.value.findIndex((e) => e.id === id)
    if (idx !== -1) {
      expenses.value[idx] = { ...expenses.value[idx], status }
    }
    try {
      await toggleExpenseStatus(id, status)
    } catch (e) {
      // Rollback on failure
      if (idx !== -1) {
        const revertStatus = status === 'paid' ? 'pending' : 'paid'
        expenses.value[idx] = { ...expenses.value[idx], status: revertStatus }
      }
      toast.error('Error al actualizar estado del gasto')
      throw e
    }
  }

  async function generateForPeriod(period: string) {
    try {
      const result = await generateMonthlyExpenses(period)
      if (result.created > 0) {
        // Refresh expenses after generation
        await fetchExpenses(period)
        toast.success(`${result.created} gastos generados para el mes`)
      }
      return result
    } catch (e) {
      toast.error('Error al generar gastos del mes')
      throw e
    }
  }

  async function addManualExpense(payload: CreateManualExpenseInput) {
    try {
      const createdExpense = await createManualExpense(payload)

      if (createdExpense.periodKey !== currentPeriod.value) {
        await fetchExpenses(createdExpense.periodKey)
      } else {
        expenses.value = [...expenses.value, createdExpense].sort((a, b) =>
          a.name.localeCompare(b.name, 'es'),
        )
      }

      toast.success('Gasto adicional guardado')
      return createdExpense
    } catch (e) {
      toast.error('Error al guardar gasto adicional')
      throw e
    }
  }

  return {
    expenses,
    loading,
    currentPeriod,
    paidExpenses,
    pendingExpenses,
    summary,
    fetchExpenses,
    toggleStatus,
    generateForPeriod,
    addManualExpense,
  }
})
