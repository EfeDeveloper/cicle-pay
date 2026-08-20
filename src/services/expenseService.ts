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
  Timestamp,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import type { CreateManualExpenseInput, ExpenseTemplate, MonthlyExpense } from '@/types/expense'
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

function isValidPeriodKey(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

function isValidExpenseStatus(value: unknown): value is 'pending' | 'paid' {
  return value === 'pending' || value === 'paid'
}

function normalizeLegacyStatus(value: unknown): 'pending' | 'paid' {
  return isValidExpenseStatus(value) ? value : 'pending'
}

function normalizeLegacySource(value: unknown): 'template' | 'manual' {
  return value === 'manual' || value === 'template' ? value : 'template'
}

function normalizeLegacyAmount(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : 0
}

function normalizeDescription(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const description = value.trim()
  if (!description) return undefined
  return description.slice(0, 140)
}

function normalizeDueDay(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const day = typeof value === 'number' ? value : Number(value)
  if (!Number.isInteger(day) || day < 1 || day > 31) return null
  return day
}

// ─── EXPENSE TEMPLATES ─────────────────────────────────────────────────────

export async function getTemplates(): Promise<ExpenseTemplate[]> {
  const uid = requireAuthUserId()
  const q = query(collection(db, TEMPLATES_COL), where('userId', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d) => {
      const data = d.data() as Omit<ExpenseTemplate, 'id'>

      return {
        id: d.id,
        ...data,
        description: normalizeDescription(data.description),
        dueDay: normalizeDueDay(data.dueDay),
      } as ExpenseTemplate
    })
    .sort((a, b) => {
      const aCreatedAt = a.createdAt
      const bCreatedAt = b.createdAt

      const aMillis =
        aCreatedAt && typeof aCreatedAt === 'object' && 'toMillis' in aCreatedAt
          ? aCreatedAt.toMillis()
          : 0
      const bMillis =
        bCreatedAt && typeof bCreatedAt === 'object' && 'toMillis' in bCreatedAt
          ? bCreatedAt.toMillis()
          : 0

      return bMillis - aMillis
    })
}

export async function createTemplate(
  data: Omit<ExpenseTemplate, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
): Promise<string> {
  const uid = requireAuthUserId()
  const { description: rawDescription, dueDay: rawDueDay, ...baseData } = data
  const description = normalizeDescription(rawDescription)
  const dueDay = normalizeDueDay(rawDueDay)

  const payload: Record<string, unknown> = {
    ...baseData,
    userId: uid,
    dueDay,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  if (description) {
    payload.description = description
  }

  const ref = await addDoc(collection(db, TEMPLATES_COL), {
    ...payload,
  })
  return ref.id
}

export async function updateTemplate(
  id: string,
  data: Partial<Omit<ExpenseTemplate, 'id' | 'createdAt' | 'userId'>>,
): Promise<void> {
  const uid = requireAuthUserId()
  await assertOwnership(TEMPLATES_COL, id, uid)

  const { description, dueDay, ...rest } = data
  const payload: Record<string, unknown> = {
    ...rest,
    updatedAt: serverTimestamp(),
  }

  if ('description' in data) {
    const normalizedDescription = normalizeDescription(description)
    payload.description = normalizedDescription ?? deleteField()
  }

  if ('dueDay' in data) {
    payload.dueDay = normalizeDueDay(dueDay)
  }

  await updateDoc(doc(db, TEMPLATES_COL, id), {
    ...payload,
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
    .map((d) => {
      const data = d.data() as Omit<MonthlyExpense, 'id' | 'source'> & {
        source?: MonthlyExpense['source']
      }

      const normalizedSource = normalizeLegacySource(data.source)
      const normalizedStatus = normalizeLegacyStatus(data.status)
      const normalizedAmount = normalizeLegacyAmount(data.amount)
      const normalizedDescription = normalizeDescription(data.description)
      const normalizedDueDay = normalizeDueDay(data.dueDay)

      return {
        id: d.id,
        ...data,
        // Backward compatibility for legacy/invalid docs.
        source: normalizedSource,
        status: normalizedStatus,
        amount: normalizedAmount,
        description: normalizedDescription,
        dueDay: normalizedDueDay,
      } as MonthlyExpense
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export async function createManualExpense(input: CreateManualExpenseInput): Promise<MonthlyExpense> {
  const uid = requireAuthUserId()

  const name = input.name.trim()
  const category = input.category.trim()
  const amount = Number(input.amount)
  const status = input.status ?? 'pending'
  const description = normalizeDescription(input.description)
  const dueDay = normalizeDueDay(input.dueDay)

  if (!name) {
    throw new Error('El nombre del gasto es requerido.')
  }
  if (!category) {
    throw new Error('La categoría es requerida.')
  }
  if (!isValidPeriodKey(input.periodKey)) {
    throw new Error('El período debe tener formato YYYY-MM.')
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('El monto debe ser mayor a 0.')
  }
  if (!isValidExpenseStatus(status)) {
    throw new Error("El estado debe ser 'pending' o 'paid'.")
  }
  if (input.dueDay !== undefined && input.dueDay !== null && dueDay === null) {
    throw new Error('El día de pago debe estar entre 1 y 31.')
  }

  const createdAt = Timestamp.now()
  const expensePayload: Omit<MonthlyExpense, 'id'> = {
    userId: uid,
    templateId: null,
    source: 'manual',
    periodKey: input.periodKey,
    name,
    dueDay,
    amount,
    category,
    status,
    createdAt,
    ...(description ? { description } : {}),
    ...(status === 'paid' ? { paidAt: Timestamp.now() } : {}),
  }

  const ref = await addDoc(collection(db, EXPENSES_COL), expensePayload)

  return {
    id: ref.id,
    ...expensePayload,
  }
}

/**
 * Toggle the status of a monthly expense between pending and paid.
 * Uses atomic update: if marking as paid → stores paidAt timestamp.
 */
export async function toggleExpenseStatus(
  id: string,
  status: 'pending' | 'paid',
): Promise<void> {
  if (!isValidExpenseStatus(status)) {
    throw new Error("El estado debe ser 'pending' o 'paid'.")
  }

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
      source: 'template',
      periodKey,
      name: template.name,
      amount: template.amount,
      category: template.category,
      status: 'pending',
      createdAt: Timestamp.now(),
    }

    const description = normalizeDescription(template.description)
    const dueDay = normalizeDueDay(template.dueDay)

    if (description) {
      expense.description = description
    }

    if (dueDay !== null) {
      expense.dueDay = dueDay
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
