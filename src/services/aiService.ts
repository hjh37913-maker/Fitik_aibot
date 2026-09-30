import type { AISettings, AppState } from '../types'
import { CATS } from '../data/demo'
import { balance, fmt, goalCalc, pct, sg, simulate, stats } from '../lib/finance'

/** Пресети: будь-який OpenAI-сумісний API підходить через Base URL (OpenAI, OpenRouter, Groq, DeepSeek, Mistral, Together, Gemini, Ollama, LM Studio…) */
export const PRESETS: { name: string; provider: AISettings['provider']; baseUrl: string; model: string }[] = [
  { name: 'Google Gemini', provider: 'openai', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', model: 'gemini-2.0-flash' },
  { name: 'OpenAI', provider: 'openai', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { name: 'Anthropic (Claude)', provider: 'anthropic', baseUrl: 'https://api.anthropic.com', model: 'claude-sonnet-4-5' },
  { name: 'OpenRouter', provider: 'openai', baseUrl: 'https://openrouter.ai/api/v1', model: 'openai/gpt-4o-mini' },
  { name: 'Groq', provider: 'openai', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama-3.3-70b-versatile' },
  { name: 'DeepSeek', provider: 'openai', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { name: 'Ollama (локально)', provider: 'openai', baseUrl: 'http://localhost:11434/v1', model: 'llama3.2' },
]

// ---------- локальний рушій (працює без ключа, рахує з реальних даних) ----------
export function generateInsight(s: AppState): string {
  const st = stats(s), e = pct(st.exp, st.pe), i = pct(st.inc, st.pi)
  if (e > 5 && i >= e) return `Витрати за 30 днів зросли на ${e}%, але доходи теж (${sg(i)}), тож ситуація залишається стабільною.`
  if (e > 5) return `Витрати за 30 днів зросли на ${e}% порівняно з попереднім періодом. Це не критично: норма накопичення — ${Math.round(st.rate)}%.`
  return `Фінансовий стан стабільний: зміна витрат ${sg(e)}, відкладається ${Math.round(st.rate)}% доходу.`
}
export function analyzeFinances(s: AppState): string[] {
  const st = stats(s), out: string[] = []
  const days = ['неділю', 'понеділок', 'вівторок', 'середу', 'четвер', 'п’ятницю', 'суботу']
  out.push(`Найбільше грошей ти витрачаєш у ${days[st.dow.indexOf(Math.max(...st.dow))]}.`)
  const f = pct(st.cat.Food || 0, st.pc.Food || 0)
  out.push(`Витрати на їжу ${f >= 0 ? 'зросли' : 'зменшились'} на ${Math.abs(f)}% порівняно з попереднім періодом.`)
  if (s.goals[0]) out.push(goalCalc(s.goals[0], s).msg)
  const top = Object.entries(st.cat).sort((a, b) => b[1] - a[1])[0]
  if (top) out.push(`Найбільша категорія — ${CATS[top[0] as keyof typeof CATS][1]}: ${fmt(top[1])} (${Math.round((top[1] / st.exp) * 100)}% витрат).`)
  return out
}
export function generateMonthlyReport(s: AppState): string {
  const st = stats(s), lines = [`Загальний висновок: за 30 днів доходи ${fmt(st.inc)}, витрати ${fmt(st.exp)}, відкладено ${fmt(st.saved)} (${Math.round(st.rate)}%).`]
  lines.push(`Що змінилось: витрати ${sg(pct(st.exp, st.pe))}, доходи ${sg(pct(st.inc, st.pi))}.`)
  lines.push(st.saved > 0 ? 'Що добре: ти закінчуєш період у плюсі.' : 'Потенціал: витрати зараз не менші за доходи — почни з необов’язкових категорій.')
  return lines.join('\n')
}
export function simulatePurchase(amount: number, s: AppState) { return simulate(amount, s) }

function localAnswer(q: string, s: AppState): string {
  const l = q.toLowerCase(), num = (l.replace(/\s/g, '').match(/\d+/) || [])[0], st = stats(s), g = s.goals[0]
  if (num && /(куп|витрат|можу|телефон|ноут)/.test(l)) { const r = simulate(+num, s)
    return `${r.verdict}. Після ${fmt(+num)} залишиться ${fmt(r.after)} — це ≈${Math.max(0, Math.round(r.cover))} днів звичайних витрат. ${r.shift ? `Ціль зміститься приблизно на ${r.shift} дн. ` : ''}${r.alt}` }
  if (/найбільше/.test(l)) { const t = Object.entries(st.cat).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, v]) => `${CATS[c as keyof typeof CATS][1]} — ${fmt(v)}`).join(', '); return `За 30 днів найбільше йде на: ${t}. Разом ${fmt(st.exp)}.` }
  if (/чому/.test(l)) { const d = Object.keys(st.cat).map(c => [c, (st.cat[c] || 0) - (st.pc[c] || 0)] as [string, number]).sort((a, b) => b[1] - a[1])[0]
    return d ? `Витрати змінились на ${sg(pct(st.exp, st.pe))} (${fmt(st.exp)} проти ${fmt(st.pe)}). Найбільший внесок — ${CATS[d[0] as keyof typeof CATS][1]}: ${d[1] >= 0 ? '+' : ''}${fmt(d[1])}.` : 'Поки замало даних.' }
  if (/(щотижня|відкладат)/.test(l) && g) { const c = goalCalc(g, s); return `Для «${g.name}» до ${g.deadline} треба відкладати ≈${fmt(c.perWeek)} на тиждень (${fmt(c.perDay)} на день). Зараз ≈${fmt(Math.max(0, st.saved) / 4.3)} на тиждень.` }
  if (/коли/.test(l)) { const t = +(num || 0) || (g ? g.target - g.current : 5000), m = st.saved > 0 ? Math.ceil(t / (st.saved / 30)) : null
    return m ? `При нинішньому темпі (${fmt(st.saved)}/міс) ${fmt(t)} накопичиться приблизно через ${m} дн.` : 'Зараз накопичення стоять — скоротивши необов’язкові витрати, ми зможемо порахувати дату.' }
  return `Я бачу: баланс ${fmt(balance(s))}, доходи ${fmt(st.inc)}, витрати ${fmt(st.exp)} за 30 днів. Спитай, наприклад: «Чи можу я витратити 500 грн?»`
}

// ---------- зовнішній AI ----------
const TONE = { calm: 'спокійний', direct: 'прямий і лаконічний', friendly: 'дружній', analytical: 'аналітичний, з цифрами' }
export function buildContext(s: AppState): string {
  const st = stats(s), g = s.goals[0]
  return [`Баланс: ${fmt(balance(s))}`, `За 30 днів: доходи ${fmt(st.inc)}, витрати ${fmt(st.exp)}, відкладено ${fmt(st.saved)}`,
    `Попередні 30 днів: доходи ${fmt(st.pi)}, витрати ${fmt(st.pe)}`,
    'Категорії: ' + Object.entries(st.cat).map(([c, v]) => `${c} ${fmt(v)}`).join(', '),
    g ? `Ціль: ${g.name}, ${fmt(g.current)} з ${fmt(g.target)} до ${g.deadline}` : 'Цілей немає'].join('\n')
}
const systemPrompt = (s: AppState) => `Ти SmartMoney AI — фінансовий радник. Тон: ${TONE[s.ai.personality]}. Відповідай мовою користувача. Ніколи не сварі за витрати. Структура: висновок, пояснення, рекомендація, альтернатива. Використовуй лише ці дані, не вигадуй цифр.\n\nДані користувача:\n${buildContext(s)}`

export async function answerFinancialQuestion(q: string, s: AppState): Promise<{ text: string; error?: string }> {
  const { provider, baseUrl, apiKey, model } = s.ai
  if (provider === 'local' || !apiKey) return { text: localAnswer(q, s) }
  const history = s.chat.slice(-8).map(m => ({ role: m.role, content: m.text }))
  try {
    let text = ''
    if (provider === 'anthropic') {
      const r = await fetch(baseUrl.replace(/\/$/, '') + '/v1/messages', { method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model, max_tokens: 800, system: systemPrompt(s), messages: [...history, { role: 'user', content: q }] }) })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      text = (await r.json()).content?.map((c: { text?: string }) => c.text || '').join('') || ''
    } else {
      const r = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt(s) }, ...history, { role: 'user', content: q }] }) })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      text = (await r.json()).choices?.[0]?.message?.content || ''
    }
    if (!text) throw new Error('Порожня відповідь')
    return { text }
  } catch (e) {
    return { text: localAnswer(q, s), error: `Не вдалося звернутись до AI-провайдера (${(e as Error).message}). Перевір ключ, модель і URL — а поки відповідає локальний рушій.` }
  }
}
