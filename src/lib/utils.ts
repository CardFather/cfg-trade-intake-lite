export function dollarsToCents(s: string | number) {
  const n = typeof s === "string" ? parseFloat(s) : s;
  return Math.round((n || 0) * 100);
}
export function centsToDollars(c: number | null | undefined) {
  return ((c || 0) / 100).toFixed(2);
}
export function makeIntakeId(date = new Date(), seq: number) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const s = String(seq).padStart(4, "0");
  return `TI-${y}-${m}-${d}-${s}`;
}
