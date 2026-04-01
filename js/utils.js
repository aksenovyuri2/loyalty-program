/** Shared formatting utilities */

export function fmtNum(n) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export function fmtRate(r) {
  return r.toFixed(2).replace('.', ',') + '%';
}

export function loanWord(n) {
  if (n === 1) return 'займ';
  if (n >= 2 && n <= 4) return 'займа';
  return 'займов';
}

/** Format date as DD.MM.YYYY */
export function fmtDate(date) {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}
