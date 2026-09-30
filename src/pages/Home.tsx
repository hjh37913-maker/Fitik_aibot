import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useStore } from '../hooks/useStore'
import Counter from '../components/Counter'
import { CATS } from '../data/demo'
import { balance, buckets, fmt, health, pct, sg, stats } from '../lib/finance'
import { analyzeFinances, generateInsight } from '../services/aiService'

const RANGES: [number, string][] = [[7, '7 днів'], [30, '30 днів'], [90, '3 міс.'], [180, '6 міс.'], [365, 'Рік']]
export default function Home() {
  const { s } = useStore(), st = stats(s), h = health(s), [range, setRange] = useState(30)
  const hr = new Date().getHours(), gr = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening'
  const cats = Object.entries(st.cat).sort((a, b) => b[1] - a[1])
  const Card = ({ t, v, sub, c }: { t: string; v: number; sub?: string; c?: string }) => <div className="card"><div className="mu sm">{t}</div><div className={'big ' + (c || '')}><Counter value={v} /></div>{sub && <div className="sm mu">{sub}</div>}</div>
  return <>
    <h1>{gr}, {s.name}</h1>
    <div className="card ai" style={{ margin: '12px 0' }}><b>✨ AI-висновок</b><p style={{ margin: '6px 0 0' }}>{generateInsight(s)}</p></div>
    <div className="grid">
      <Card t="Баланс" v={balance(s)} /><Card t="Доходи · 30 дн." v={st.inc} sub={sg(pct(st.inc, st.pi))} c="gn" />
      <Card t="Витрати · 30 дн." v={st.exp} sub={sg(pct(st.exp, st.pe))} /><Card t="Відкладено" v={Math.max(0, st.saved)} sub={Math.round(st.rate) + '% доходу'} c="gn" />
      <div className="card"><div className="mu sm">Financial Health</div><div className="big">{h}/100</div><div className="bar"><i style={{ width: h + '%' }} /></div><div className="sm mu" style={{ marginTop: 6 }}>Накопичення, стабільність, баланс, ціль</div></div>
    </div>
    <div className="card"><div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}><h2>Income vs Expenses</h2>
      <div className="seg">{RANGES.map(([v, l]) => <button key={v} className={range === v ? 'on' : ''} onClick={() => setRange(v)}>{l}</button>)}</div></div>
      <div style={{ height: 240 }}><ResponsiveContainer><BarChart data={buckets(s.tx, range)}><CartesianGrid vertical={false} stroke="var(--bd)" /><XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--mu)' }} /><YAxis width={44} tick={{ fontSize: 11, fill: 'var(--mu)' }} />
        <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--bd)', borderRadius: 12 }} /><Bar dataKey="Income" fill="var(--gn)" radius={[4, 4, 0, 0]} /><Bar dataKey="Expenses" fill="var(--ac)" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))' }}>
      <div className="card"><h2>Категорії витрат</h2>{cats.length ? cats.map(([c, v]) => { const d = pct(v, st.pc[c] || 0)
        return <div className="row" key={c}><div className="ic">{CATS[c as keyof typeof CATS][0]}</div><div className="grow">{CATS[c as keyof typeof CATS][1]}<div className="bar"><i style={{ width: (v / st.exp) * 100 + '%' }} /></div></div><div style={{ textAlign: 'right' }}>{fmt(v)}<div className={'sm ' + (d > 0 ? 'mu' : 'gn')}>{Math.round((v / st.exp) * 100)}% · {sg(d)}</div></div></div> })
        : <Empty a="Ще немає витрат" b="Додай першу операцію, щоб побачити розподіл." />}</div>
      <div className="card"><h2>✨ AI Financial Insights</h2>{analyzeFinances(s).map((t, i) => <p key={i} style={{ margin: '0 0 10px' }}>• {t}</p>)}
        <h2 style={{ marginTop: 14 }}>Ліміти</h2>{Object.entries(s.limits).map(([c, l]) => { const u = ((st.cat[c] || 0) / (l as number)) * 100
          return <div key={c}><div className="sm" style={{ marginTop: 8 }}>{CATS[c as keyof typeof CATS][1]}: {Math.round(u)}% з {fmt(l as number)}{u > 90 ? ' — майже вичерпано' : ''}</div><div className="bar"><i style={{ width: Math.min(100, u) + '%', background: u > 100 ? 'var(--rd)' : undefined }} /></div></div> })}</div>
    </div>
    <p className="sm mu">🔒 Твої фінансові дані належать тобі. Вони зберігаються лише у цьому браузері.</p>
  </>
}
export const Empty = ({ a, b }: { a: string; b: string }) => <div className="mu" style={{ textAlign: 'center', padding: 24 }}><div style={{ fontSize: 32 }}>🌱</div><b style={{ color: 'var(--tx)' }}>{a}</b><div className="sm">{b}</div></div>
