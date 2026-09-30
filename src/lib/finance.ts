import type { AppState, Goal, Tx, TxType } from '../types'
export const DAY = 864e5
export const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10)
export const fmt = (n: number) => Math.round(n).toLocaleString('uk-UA') + ' ₴'
export const sum = (l: Tx[], t: TxType) => l.filter(x => x.type === t).reduce((a, x) => a + x.amount, 0)
export const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : 0)
export const sg = (n: number) => (n > 0 ? '+' : '') + n + '%'
const ago = (s: string) => Math.round((new Date(iso(new Date())).getTime() - new Date(s).getTime()) / DAY)
/** транзакції, що були між a і b днями тому (b < a) */
export const between = (tx: Tx[], a: number, b: number) => tx.filter(t => { const d = ago(t.date); return d >= b && d < a })
export const balance = (s: AppState) => s.start + sum(s.tx, 'i') - sum(s.tx, 'e')

export function stats(s: AppState) {
  const cur = between(s.tx, 30, 0), prev = between(s.tx, 60, 30)
  const inc = sum(cur, 'i'), exp = sum(cur, 'e'), pi = sum(prev, 'i'), pe = sum(prev, 'e')
  const cat: Record<string, number> = {}, pc: Record<string, number> = {}
  cur.filter(t => t.type === 'e').forEach(t => (cat[t.category] = (cat[t.category] || 0) + t.amount))
  prev.filter(t => t.type === 'e').forEach(t => (pc[t.category] = (pc[t.category] || 0) + t.amount))
  const dow = [0, 0, 0, 0, 0, 0, 0]; s.tx.filter(t => t.type === 'e').forEach(t => (dow[new Date(t.date).getDay()] += t.amount))
  const saved = inc - exp
  return { inc, exp, pi, pe, cat, pc, dow, saved, rate: inc ? (saved / inc) * 100 : 0, daily: exp / 30 }
}

export function health(s: AppState) {
  const st = stats(s), g = s.goals[0]
  const gp = g ? Math.min(g.current / g.target, 1) * 100 : 50
  const r = Math.max(0, Math.min(100, st.rate * 3.3))
  const stab = st.pe ? Math.max(0, 100 - (Math.abs(st.exp - st.pe) / st.pe) * 200) : 70
  const b = Math.min(100, (balance(s) / (st.exp || 1)) * 50)
  return Math.round(r * .35 + stab * .2 + gp * .2 + b * .25)
}

export function buckets(tx: Tx[], days: number) {
  const n = days <= 7 ? 7 : days <= 30 ? 10 : 12, step = days / n
  const out = Array.from({ length: n }, (_, k) => ({ label: iso(new Date(Date.now() - (days - (k + 1) * step) * DAY)).slice(5), Income: 0, Expenses: 0 }))
  tx.forEach(t => {
    const a = ago(t.date); if (a < 0 || a >= days) return
    const k = Math.min(n - 1, Math.floor((days - 1 - a) / step))
    if (t.type === 'i') out[k].Income += t.amount; else out[k].Expenses += t.amount
  })
  return out
}

export function goalCalc(g: Goal, s: AppState) {
  const st = stats(s), left = Math.max(0, g.target - g.current)
  const days = Math.max(1, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / DAY))
  const perDay = left / days, eta = st.saved > 0 ? Math.ceil(left / (st.saved / 30)) : null
  let msg: string
  if (!left) msg = 'Ціль досягнуто — вітаю!'
  else if (eta === null) msg = 'Зараз витрати не менші за доходи, тому накопичення стоять. Навіть 500 ₴ на місяць запустять рух до цілі.'
  else if (eta <= days) msg = `За поточного темпу ціль буде досягнута приблизно через ${eta} дн. — раніше за дедлайн.`
  else msg = `За поточного темпу ціль буде приблизно на ${Math.round(((eta - days) / 30) * 10) / 10} міс. пізніше. Щоб встигнути, достатньо збільшити щомісячне накопичення приблизно на ${fmt(Math.max(0, perDay * 30 - st.saved))}.`
  return { left, days, perDay, perWeek: perDay * 7, perMonth: perDay * 30, eta, msg, p: (g.current / g.target) * 100 }
}

export function simulate(a: number, s: AppState) {
  const st = stats(s), b = balance(s), after = b - a, cover = st.daily ? after / st.daily : 0
  const shift = st.saved > 0 ? Math.ceil(a / (st.saved / 30)) : null
  const verdict = after < 0 ? 'Такої суми зараз не вистачає на балансі' : cover >= 30 ? 'Виглядає цілком допустимо' : cover >= 14 ? 'Можливо, але запас стане тоншим' : 'Це помітно скоротить запас'
  const alt = after < 0 ? `Можна накопичити бракуючі ${fmt(-after)} — за поточного темпу це ~${st.saved > 0 ? Math.ceil(-after / (st.saved / 30)) : '—'} дн.`
    : cover < 14 ? 'Варіант: розбити покупку на частини або зачекати 1–2 тижні.' : 'Альтернатива не потрібна, але можна пошукати акції.'
  return { b, after, cover, shift, verdict, alt }
}
