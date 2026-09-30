import { useRef } from 'react'
import { useStore } from '../hooks/useStore'
import { buildDemo } from '../data/demo'
import { PRESETS, answerFinancialQuestion } from '../services/aiService'
import { download } from '../services/storage'
import { CATS } from '../data/demo'
import type { AISettings } from '../types'

export default function Settings() {
  const { s, set, toast } = useStore(), file = useRef<HTMLInputElement>(null), ai = s.ai
  const up = (p: Partial<AISettings>) => set(x => ({ ...x, ai: { ...x.ai, ...p } }))
  const test = async () => { const r = await answerFinancialQuestion('Привіт! Одним реченням: який мій баланс?', s); toast(r.error ? 'Помилка: перевір ключ/URL/модель' : 'З’єднання працює ✓') }
  const imp = (f?: File) => f?.text().then(t => { try { const d = JSON.parse(t); if (!Array.isArray(d.tx)) throw 0; set(p => ({ ...p, ...d })); toast('Дані імпортовано') } catch { toast('Файл має неправильний формат') } })
  return <>
    <h1>Налаштування</h1>
    <div className="card" style={{ margin: '14px 0', display: 'grid', gap: 10 }}><h2>🤖 Підключення AI</h2>
      <div className="mu sm">За замовчуванням підключено Google Gemini. Встав ключ AIza… з Google AI Studio. Без ключа працює вбудований рушій.</div>
      <label>Пресет<select value="" onChange={e => { const p = PRESETS.find(x => x.name === e.target.value); if (p) up({ provider: p.provider, baseUrl: p.baseUrl, model: p.model }) }}><option value="">Обрати…</option>{PRESETS.map(p => <option key={p.name}>{p.name}</option>)}</select></label>
      <label>Тип<select value={ai.provider} onChange={e => up({ provider: e.target.value as AISettings['provider'] })}><option value="local">Вбудований (без ключа)</option><option value="openai">OpenAI-сумісний</option><option value="anthropic">Anthropic</option></select></label>
      <label>Base URL<input value={ai.baseUrl} onChange={e => up({ baseUrl: e.target.value })} /></label>
      <label>Модель<input value={ai.model} onChange={e => up({ model: e.target.value })} /></label>
      <label>API key<input type="password" autoComplete="off" value={ai.apiKey} onChange={e => up({ apiKey: e.target.value })} placeholder="AIza…" /></label>
      <div className="sm mu">Ключ зберігається лише в localStorage цього браузера й надсилається тільки провайдеру. Для публічного продакшену краще проксі на бекенді.</div>
      <label>Характер AI<select value={ai.personality} onChange={e => up({ personality: e.target.value as AISettings['personality'] })}><option value="calm">Calm</option><option value="direct">Direct</option><option value="friendly">Friendly</option><option value="analytical">Analytical</option></select></label>
      <div><button className="btn" onClick={test}>Перевірити з’єднання</button></div></div>
    <div className="card" style={{ display: 'grid', gap: 10 }}><h2>Профіль і ліміти</h2>
      <label>Ім’я<input value={s.name} onChange={e => set(p => ({ ...p, name: e.target.value }))} /></label>
      {(['Food', 'Transport', 'Entertainment', 'Shopping'] as const).map(c => <label key={c}>Ліміт: {CATS[c][1]}, ₴<input type="number" value={s.limits[c] ?? ''} onChange={e => set(p => ({ ...p, limits: { ...p.limits, [c]: +e.target.value } }))} /></label>)}
      <div><button className="btn g" onClick={() => set(p => ({ ...p, dark: !p.dark }))}>Змінити тему</button></div></div>
    <div className="card" style={{ marginTop: 14 }}><h2>Дані</h2><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <button className="btn g" onClick={() => download('smartmoney.json', JSON.stringify(s, null, 1), 'application/json')}>Export data</button>
      <button className="btn g" onClick={() => file.current?.click()}>Import data</button><input ref={file} type="file" accept=".json" hidden onChange={e => imp(e.target.files?.[0])} />
      <button className="btn g" onClick={() => { set(p => ({ ...buildDemo(), ai: p.ai })); toast('Демо-дані завантажено') }}>Use demo data</button>
      <button className="btn g" onClick={() => confirm('Видалити всі локальні дані? Цю дію не можна скасувати.') && (set(p => ({ ...p, tx: [], goals: [], chat: [] })), toast('Дані очищено'))}>Clear local data</button></div>
      <p className="sm mu">🔒 Твої фінансові дані належать тобі.</p></div>
  </>
}
