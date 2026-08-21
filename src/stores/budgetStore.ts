import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  deleteBudget as deleteBudgetDoc,
  getBudget,
  getPreviousBudget,
  saveBudget as saveBudgetDoc,
} from '@/services/budgetService'
import type { CategoryCaps, MonthlyBudget, SaveBudgetInput } from '@/types/budget'

export type BudgetFormDefaults = {
  totalAmount: number | null
  categories: CategoryCaps | null
  prefilledFromPrevious: boolean
  hasExistingBudget: boolean
}

export const useBudgetStore = defineStore('budgets', () => {
  const budget = ref<MonthlyBudget | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  async function fetchBudget(periodKey: string) {
    loading.value = true
    try {
      budget.value = await getBudget(periodKey)
    } catch (e) {
      budget.value = null
      toast.error('Error al cargar el presupuesto')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadFormDefaults(periodKey: string): Promise<BudgetFormDefaults> {
    const empty: BudgetFormDefaults = {
      totalAmount: null,
      categories: null,
      prefilledFromPrevious: false,
      hasExistingBudget: false,
    }

    try {
      if (budget.value && budget.value.periodKey === periodKey) {
        return {
          totalAmount: budget.value.totalAmount,
          categories: budget.value.categories ?? null,
          prefilledFromPrevious: false,
          hasExistingBudget: true,
        }
      }

      const current = await getBudget(periodKey)
      if (current) {
        budget.value = current
        return {
          totalAmount: current.totalAmount,
          categories: current.categories ?? null,
          prefilledFromPrevious: false,
          hasExistingBudget: true,
        }
      }

      const previous = await getPreviousBudget(periodKey)
      if (previous) {
        return {
          totalAmount: previous.totalAmount,
          categories: previous.categories ?? null,
          prefilledFromPrevious: true,
          hasExistingBudget: false,
        }
      }

      return empty
    } catch {
      return empty
    }
  }

  async function saveBudget(periodKey: string, input: SaveBudgetInput) {
    saving.value = true
    try {
      budget.value = await saveBudgetDoc(periodKey, input)
      toast.success('Presupuesto guardado')
    } catch (e) {
      toast.error('No se pudo guardar el presupuesto')
      throw e
    } finally {
      saving.value = false
    }
  }

  async function deleteBudget(periodKey: string) {
    saving.value = true
    try {
      await deleteBudgetDoc(periodKey)
      budget.value = null
      toast.success('Presupuesto eliminado')
    } catch (e) {
      toast.error('No se pudo eliminar el presupuesto')
      throw e
    } finally {
      saving.value = false
    }
  }

  return {
    budget,
    loading,
    saving,
    fetchBudget,
    loadFormDefaults,
    saveBudget,
    deleteBudget,
  }
})
