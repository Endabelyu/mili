export function formatCurrency(amount: number | string) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
}

export function formatDate(dateStr: string | Date) {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('id-ID', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
