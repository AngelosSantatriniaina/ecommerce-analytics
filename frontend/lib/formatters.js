export function formatAr(value) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} Ar`
}