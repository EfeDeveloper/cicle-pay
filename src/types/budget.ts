import type { Timestamp } from 'firebase/firestore'
import type { ExpenseCategory } from '@/types/expense'

export type CategoryCaps = Partial<Record<ExpenseCategory, number>>

export interface MonthlyBudget {
  id: string
  userId: string
  periodKey: string
  totalAmount: number
  categories?: CategoryCaps
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface SaveBudgetInput {
  totalAmount: number
  categories?: CategoryCaps
}
