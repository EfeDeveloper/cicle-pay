import type { MonthlyExpense } from '@/types/expense'

function normalizeDueDayForSort(dueDay: number | null | undefined): number {
  if (typeof dueDay !== 'number' || !Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
    return Number.POSITIVE_INFINITY
  }
  return dueDay
}

export function compareMonthlyExpenses(a: MonthlyExpense, b: MonthlyExpense): number {
  const dueDayDiff = normalizeDueDayForSort(a.dueDay) - normalizeDueDayForSort(b.dueDay)
  if (dueDayDiff !== 0) return dueDayDiff

  const nameDiff = a.name.localeCompare(b.name, 'es')
  if (nameDiff !== 0) return nameDiff

  return a.id.localeCompare(b.id, 'es')
}

export function sortMonthlyExpenses(items: MonthlyExpense[]): MonthlyExpense[] {
  return [...items].sort(compareMonthlyExpenses)
}