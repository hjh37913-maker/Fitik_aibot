import type { AppState } from '../types'
import { buildDemo } from '../data/demo'
const KEY = 'smartmoney_v3'
export const loadState = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem('smartmoney_v2')
    if (raw) {
      const saved = JSON.parse(raw)
      const s = { ...buildDemo(), ...saved, ai: { ...buildDemo().ai, ...(saved.ai || {}) } }
      if (s.ai.provider === 'local' && !s.ai.apiKey) s.ai = { ...buildDemo().ai, personality: s.ai.personality }
      return s
    }
  } catch { /* ignore */ }
  return buildDemo()
}
export const saveState = (s: AppState) => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage full or blocked */ } }
export const download = (name: string, content: string, type: string) => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click()
}
export const toCSV = (s: AppState) => 'date,type,category,description,amount\n' + s.tx.map(t => [t.date, t.type, t.category, `"${t.description}"`, t.amount].join(',')).join('\n')
