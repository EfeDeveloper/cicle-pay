import type { ExpenseTemplate, MonthlyExpense } from '@/types/expense'

export type RecordDetailKind = 'template' | 'expense'

export interface RecordDetail {
  kind: RecordDetailKind
  name: string
  description?: string
  amount: number
  category: string
  dueDay?: number | null
  isActive?: boolean
  status?: 'pending' | 'paid'
  source?: 'template' | 'manual'
  periodKey?: string
  paidAt?: unknown
}

export function hasDescription(value?: string): boolean {
  return Boolean(value?.trim())
}

export function toTemplateDetail(template: ExpenseTemplate): RecordDetail {
  return {
    kind: 'template',
    name: template.name,
    description: template.description,
    amount: template.amount,
    category: template.category,
    dueDay: template.dueDay,
    isActive: template.isActive,
  }
}

export function toExpenseDetail(expense: MonthlyExpense): RecordDetail {
  return {
    kind: 'expense',
    name: expense.name,
    description: expense.description,
    amount: expense.amount,
    category: expense.category,
    dueDay: expense.dueDay,
    status: expense.status,
    source: expense.source,
    periodKey: expense.periodKey,
    paidAt: expense.paidAt,
  }
}
