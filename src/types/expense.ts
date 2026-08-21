import type { Timestamp } from 'firebase/firestore'

export interface ExpenseTemplate {
  id: string
  userId?: string
  name: string
  description?: string
  dueDay?: number | null
  amount: number
  category: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface MonthlyExpense {
  id: string           // Templates: `${templateId}_${periodKey}`; manual: Firestore auto ID
  userId?: string
  templateId?: string | null
  source: 'template' | 'manual'
  periodKey: string    // Format: "YYYY-MM"
  name: string
  description?: string
  dueDay?: number | null
  amount: number
  category: string
  status: 'pending' | 'paid'
  paidAt?: Timestamp
  createdAt: Timestamp
}

export interface CreateManualExpenseInput {
  periodKey: string
  name: string
  description?: string
  amount: number
  dueDay?: number | null
  category: string
  status?: ExpenseStatus
}

export type ExpenseStatus = 'pending' | 'paid'

export interface PeriodSummary {
  periodKey: string
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  totalCount: number
  paidCount: number
  pendingCount: number
}

export const EXPENSE_CATEGORIES = [
  'Vivienda',
  'Servicios',
  'Alimentación',
  'Transporte',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Seguros',
  'Suscripciones',
  'Otros',
] as const

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number]
