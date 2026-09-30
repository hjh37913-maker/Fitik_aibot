import type { AppState, Category, Tx } from '../types'
import { DAY, iso } from '../lib/finance'

export const CATS: Record<Category, [string, string]> = {
  Food: ['🍔', 'Їжа'], Transport: ['🚌', 'Транспорт'], Entertainment: ['🎬', 'Розваги'], Shopping: ['🛍️', 'Покупки'],
  Subscriptions: ['📺', 'Підписки'], Education: ['📚', 'Навчання'], Health: ['💊', 'Здоров’я'], Other: ['📦', 'Інше'], Income: ['💰', 'Дохід'],
}
export const defaultAI = { provider: 'openai' as const, baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', apiKey: '', model: 'gemini-2.0-flash', personality: 'friendly' as const }

export function buildDemo(): AppState {
  let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647
  const w: Record<string, [string, number][]> = {
    Food: [['Супермаркет', 380], ['Кафе', 210], ['Доставка', 320]], Transport: [['Метро', 60], ['Таксі', 150]],
    Entertainment: [['Кіно', 260], ['Ігри', 300]], Shopping: [['Одяг', 600]], Subscriptions: [['Стрімінг', 150]], Health: [['Аптека', 180]], Other: [['Різне', 140]],
  }
  const ks = Object.keys(w), tx: Tx[] = []; let id = 1; const now = Date.now()
  for (let i = 95; i >= 0; i--) {
    const d = new Date(now - i * DAY), dow = d.getDay(), n = rnd() < (dow >= 5 ? .85 : .5) ? 1 + (rnd() < .3 ? 1 : 0) : 0
    for (let j = 0; j < n; j++) {
      const c = ks[Math.floor(rnd() ** 1.4 * ks.length)], [t, b] = w[c][Math.floor(rnd() * w[c].length)]
      tx.push({ id: id++, type: 'e', amount: Math.round(b * (.6 + rnd() * (dow >= 5 ? 1.2 : .8))), category: c as Category, description: t, date: iso(d) })
    }
    if (i % 30 === 3) tx.push({ id: id++, type: 'i', amount: i < 30 ? 13500 : 12000, category: 'Income', description: 'Зарплата', date: iso(d) })
  }
  return {
    name: 'Дмитро', start: 6000, tx, dark: true, chat: [], ai: defaultAI,
    goals: [{ id: 1, name: 'Gaming PC', target: 30000, current: 8500, deadline: '2027-03-01' }],
    limits: { Food: 2500, Transport: 1000, Entertainment: 1500, Shopping: 2000 },
  }
}
