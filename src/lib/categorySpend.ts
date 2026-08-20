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

export function buildCategorySpend(expenses: MonthlyExpense[]): CategorySpendPreview[] {
  return EXPENSE_CATEGORIES.map((category) => {
    const items = expenses.filter((expense) => expense.category === category)
    return {
      category,
      spent: items.reduce((sum, expense) => sum + expense.amount, 0),
      count: items.length,
      allocated: null,
    }
  }).filter((row) => row.count > 0)
}
