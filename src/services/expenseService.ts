import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  orderBy,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { ExpenseTemplate, MonthlyExpense } from '@/types/expense'
import { format, addMonths, subMonths, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── Collection references ─────────────────────────────────────────────────
const TEMPLATES_COL = 'expense_templates'
const EXPENSES_COL = 'monthly_expenses'

function requireAuthUserId(): string {
  const uid = auth.currentUser?.uid
  if (!uid) {
    throw new Error('No authenticated user found')
  }
  return uid
}

async function assertOwnership(collectionName: string, id: string, uid: string): Promise<void> {
  const snapshot = await getDoc(doc(db, collectionName, id))
  if (!snapshot.exists()) {
    throw new Error('Recurso no encontrado.')
  }

  const data = snapshot.data() as { userId?: string }
  if (data.userId !== uid) {
    throw new Error('No tienes permisos para modificar este recurso.')
  }
}

// ─── Helper: format period key ─────────────────────────────────────────────
export function getCurrentPeriodKey(): string {
  return format(new Date(), 'yyyy-MM')
}

export function formatPeriodLabel(periodKey: string): string {
  // Parse "2026-07" → Date
  const date = parseISO(`${periodKey}-01`)
  return format(date, 'MMMM yyyy', { locale: es })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function getPrevPeriodKey(periodKey: string): string {
  const date = parseISO(`${periodKey}-01`)
  return format(subMonths(date, 1), 'yyyy-MM')
}

export function getNextPeriodKey(periodKey: string): string {
  const date = parseISO(`${periodKey}-01`)
  return format(addMonths(date, 1), 'yyyy-MM')
}

// ─── EXPENSE TEMPLATES ─────────────────────────────────────────────────────

export async function getTemplates(): Promise<ExpenseTemplate[]> {
  const uid = requireAuthUserId()
  const q = query(
    collection(db, TEMPLATES_COL),
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as ExpenseTemplate)
}

export async function createTemplate(
  data: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
): Promise<string> {
  const uid = requireAuthUserId()
  const ref = await addDoc(collection(db, TEMPLATES_COL), {
    ...data,
    userId: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<ExpenseTemplate, 'id' | 'createdAt' | 'userId'>>,
): Promise<void> {
  const uid = requireAuthUserId()
  await assertOwnership(TEMPLATES_COL, id, uid)

  await updateDoc(doc(db, TEMPLATES_COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTemplate(id: string): Promise<void> {
  const uid = requireAuthUserId()
  await assertOwnership(TEMPLATES_COL, id, uid)

  await deleteDoc(doc(db, TEMPLATES_COL, id))
}

export async function toggleTemplate(id: string, isActive: boolean): Promise<void> {
  const uid = requireAuthUserId()
  await assertOwnership(TEMPLATES_COL, id, uid)

  await updateDoc(doc(db, TEMPLATES_COL, id), {
    isActive,
    updatedAt: serverTimestamp(),
  })
}

// ─── MONTHLY EXPENSES ──────────────────────────────────────────────────────

export async function getMonthlyExpenses(periodKey: string): Promise<MonthlyExpense[]> {
  const uid = requireAuthUserId()
  const q = query(
    collection(db, EXPENSES_COL),
    where('periodKey', '==', periodKey),
    where('userId', '==', uid),
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as MonthlyExpense)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

/**
 * Toggle the status of a monthly expense between pending and paid.
 * Uses atomic update: if marking as paid → stores paidAt timestamp.
 */
export async function toggleExpenseStatus(
  id: string,
  status: 'pending' | 'paid',
): Promise<void> {
  const uid = requireAuthUserId()
  await assertOwnership(EXPENSES_COL, id, uid)

  const data: Record<string, unknown> = { status }
  if (status === 'paid') {
    data['paidAt'] = serverTimestamp()
  } else {
    data['paidAt'] = null
  }
  await updateDoc(doc(db, EXPENSES_COL, id), data)
}

/**
 * Generate monthly expenses for a given period from active templates.
 *
 * GOLDEN RULE: Uses setDoc with ID `${templateId}_${periodKey}` for idempotence.
 * Calling this function twice for the same month will NOT create duplicates.
 *
 * @param periodKey - Format "YYYY-MM"
 * @returns { created, skipped } counts
 */
export async function generateMonthlyExpenses(
  periodKey: string,
): Promise<{ created: number; skipped: number }> {
  const uid = requireAuthUserId()
  // 1. Get all active templates
  const templatesQuery = query(
    collection(db, TEMPLATES_COL),
    where('isActive', '==', true),
    where('userId', '==', uid),
  )
  const templatesSnap = await getDocs(templatesQuery)
  const templates = templatesSnap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as ExpenseTemplate[]

  // 2. Check which expenses already exist for this period
  const existingExpenses = await getMonthlyExpenses(periodKey)
  const existingIds = new Set(existingExpenses.map((e) => e.id))

  let created = 0
  let skipped = 0

  // 3. For each active template, setDoc with deterministic ID
  for (const template of templates) {
    const expenseId = `${template.id}_${periodKey}`

    if (existingIds.has(expenseId)) {
      skipped++
      continue
    }

    const expense: Omit<MonthlyExpense, 'id'> = {
      userId: uid,
      templateId: template.id,
      periodKey,
      name: template.name,
      amount: template.amount,
      category: template.category,
      status: 'pending',
      createdAt: Timestamp.now(),
    }

    await setDoc(doc(db, EXPENSES_COL, expenseId), expense)
    created++
  }

  return { created, skipped }
}

// ─── CURRENCY FORMAT HELPER ────────────────────────────────────────────────
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  }).format(amount)
}
