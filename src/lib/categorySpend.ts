import type { CategoryCaps } from '@/types/budget'
import {
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type MonthlyExpense,
} from '@/types/expense'

export type CategorySpendPreview = {
  category: ExpenseCategory
  spent: number
  count: number
  allocated: number | null
}

function capForCategory(caps: CategoryCaps | null | undefined, category: ExpenseCategory) {
  const value = caps?.[category]
  return typeof value === 'number' ? value : null
}

export function buildCategorySpend(
  expenses: MonthlyExpense[],
  caps?: CategoryCaps | null,
): CategorySpendPreview[] {
  return EXPENSE_CATEGORIES.map((category) => {
    const items = expenses.filter((expense) => expense.category === category)
    return {
      category,
      spent: items.reduce((sum, expense) => sum + expense.amount, 0),
      count: items.length,
      allocated: capForCategory(caps, category),
    }
  }).filter((row) => row.count > 0)
}
