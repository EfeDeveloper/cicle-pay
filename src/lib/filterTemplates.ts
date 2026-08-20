import type { ExpenseTemplate } from '@/types/expense'
import { filterByQuery } from '@/lib/filterByQuery'

export function filterTemplates(templates: ExpenseTemplate[], query: string): ExpenseTemplate[] {
  return filterByQuery(templates, query, (template) => [
    template.name,
    template.category,
    template.description,
  ])
}
