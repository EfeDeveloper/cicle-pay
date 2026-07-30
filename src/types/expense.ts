import type { Timestamp } from 'firebase/firestore'

export interface ExpenseTemplate {
  id: string
  name: string
  amount: number
  category: string
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface MonthlyExpense {
  id: string           // Format: `${templateId}_${periodKey}` e.g. "abc123_2026-07"
  templateId: string
  periodKey: string    // Format: "YYYY-MM"
  name: string
  amount: number
  category: string
  status: 'pending' | 'paid'
  paidAt?: Timestamp
  createdAt: Timestamp
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
