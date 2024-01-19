export const convertCategories = (categories: Record<string, string>) => {
  const keys = Object.keys(categories)

  return keys.map((_, index) => {
    const values = keys.slice(0, index + 1).map((k) => categories[k])
    return values.join('/')
  })
}
