export type BudgetProgress = {
  spent: number
  cap: number
  remaining: number
  overspend: number
  ratio: number
}

export function getBudgetProgress(spent: number, cap: number): BudgetProgress {
  const remaining = Math.max(0, cap - spent)
  const overspend = Math.max(0, spent - cap)
  const ratio = cap <= 0 ? 0 : Math.min(100, Math.round((spent / cap) * 100))

  return { spent, cap, remaining, overspend, ratio }
}
