export function expenseQueryFields(item: {
  name: string
  category: string
  description?: string
}): Array<string | undefined> {
  return [item.name, item.category, item.description]
}

export function filterByQuery<T>(
  items: T[],
  query: string,
  fields: (item: T) => Array<string | undefined>,
): T[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return items
  }

  return items.filter((item) => {
    const haystack = fields(item)
      .filter((field): field is string => Boolean(field))
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalized)
  })
}
