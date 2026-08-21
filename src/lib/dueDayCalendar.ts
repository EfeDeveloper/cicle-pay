export type DueDayFilter = number | 'none' | null
export type DayMarkKind = 'pending' | 'paid' | 'mixed' | 'present'

export interface DueDayMark {
  dueDay: number
  kind: DayMarkKind
  count: number
}

function isValidDueDay(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 31
}

export function buildDueDayMarks(
  items: Array<{ dueDay?: number | null; status?: 'pending' | 'paid' }>,
  mode: 'status' | 'presence',
): DueDayMark[] {
  const buckets = new Map<number, { pending: number; paid: number; total: number }>()

  for (const item of items) {
    if (!isValidDueDay(item.dueDay)) continue

    const bucket = buckets.get(item.dueDay) ?? { pending: 0, paid: 0, total: 0 }
    bucket.total += 1
    if (item.status === 'paid') bucket.paid += 1
    if (item.status === 'pending') bucket.pending += 1
    buckets.set(item.dueDay, bucket)
  }

  return [...buckets.entries()]
    .filter(([, bucket]) => bucket.total > 0)
    .sort(([dayA], [dayB]) => dayA - dayB)
    .map(([dueDay, bucket]) => {
      if (mode === 'presence') {
        return { dueDay, kind: 'present' as const, count: bucket.total }
      }

      const hasPending = bucket.pending > 0
      const hasPaid = bucket.paid > 0
      const kind: DayMarkKind = hasPending && hasPaid ? 'mixed' : hasPaid ? 'paid' : 'pending'

      return { dueDay, kind, count: bucket.total }
    })
}

export function filterByDueDay<T extends { dueDay?: number | null }>(
  items: T[],
  filter: DueDayFilter,
): T[] {
  if (filter === null) return items
  if (filter === 'none') {
    return items.filter((item) => item.dueDay == null)
  }
  return items.filter((item) => item.dueDay === filter)
}
