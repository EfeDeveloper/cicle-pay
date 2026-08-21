import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { getPrevPeriodKey } from '@/services/expenseService'
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '@/types/expense'
import type { CategoryCaps, MonthlyBudget, SaveBudgetInput } from '@/types/budget'

const PAYMENT_CYCLES_COL = 'payment_cycles'
const PERIOD_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

function requireAuthUserId(): string {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error('No authenticated user found')
  }
  return uid
}

function userBudgetDoc(uid: string, periodKey: string) {
  return doc(db, PAYMENT_CYCLES_COL, uid, 'budgets', periodKey)
}

function isValidPeriodKey(value: string): boolean {
  return PERIOD_KEY_PATTERN.test(value)
}

function isExpenseCategory(value: string): value is ExpenseCategory {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(value)
}

function sanitizeCategories(input?: CategoryCaps): CategoryCaps | undefined {
  if (!input) return undefined

  const categories: CategoryCaps = {}
  for (const [key, value] of Object.entries(input)) {
    if (!isExpenseCategory(key)) {
      throw new Error('La categoría del cupo no es válida.')
    }
    if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
      throw new Error('Cada cupo debe ser mayor a 0.')
    }
    categories[key] = value
  }

  return Object.keys(categories).length > 0 ? categories : undefined
}

function toBudget(id: string, data: Record<string, unknown>): MonthlyBudget {
  const categories = data.categories
  return {
    id,
    userId: String(data.userId),
    periodKey: String(data.periodKey),
    totalAmount: Number(data.totalAmount),
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
    ...(categories && typeof categories === 'object'
      ? { categories: categories as CategoryCaps }
      : {}),
  }
}

export async function getBudget(periodKey: string): Promise<MonthlyBudget | null> {
  if (!isValidPeriodKey(periodKey)) {
    throw new Error('El período debe tener formato YYYY-MM.')
  }

  const uid = requireAuthUserId()
  const snapshot = await getDoc(userBudgetDoc(uid, periodKey))
  if (!snapshot.exists()) return null
  return toBudget(snapshot.id, snapshot.data())
}

export async function getPreviousBudget(periodKey: string): Promise<MonthlyBudget | null> {
  return getBudget(getPrevPeriodKey(periodKey))
}

export async function saveBudget(
  periodKey: string,
  input: SaveBudgetInput,
): Promise<MonthlyBudget> {
  if (!isValidPeriodKey(periodKey)) {
    throw new Error('El período debe tener formato YYYY-MM.')
  }

  const totalAmount = Number(input.totalAmount)
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('El tope debe ser mayor a 0.')
  }

  const uid = requireAuthUserId()
  const ref = userBudgetDoc(uid, periodKey)
  const existing = await getDoc(ref)
  const categories = sanitizeCategories(input.categories)

  await setDoc(ref, {
    userId: uid,
    periodKey,
    totalAmount,
    ...(categories ? { categories } : {}),
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const saved = await getDoc(ref)
  if (!saved.exists()) {
    throw new Error('No se pudo guardar el presupuesto.')
  }
  return toBudget(saved.id, saved.data())
}

export async function deleteBudget(periodKey: string): Promise<void> {
  if (!isValidPeriodKey(periodKey)) {
    throw new Error('El período debe tener formato YYYY-MM.')
  }

  const uid = requireAuthUserId()
  await deleteDoc(userBudgetDoc(uid, periodKey))
}
