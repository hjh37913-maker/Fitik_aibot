import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { fmt, goalCalc } from '../lib/finance'
import { Empty } from './Home'

export default function Goals() {
  const { s, set, toast } = useStore(), [n, setN] = useState(''), [t, setT] = useState(''), [c, setC] = useState(''), [d, setD] = useState('')
  const add = (e: React.FormEvent) => { e.preventDefault(); set(p => ({ ...p, goals: [...p.goals, { id: Date.now(), name: n, target: +t, current: +c || 0, deadline: d }] })); setN(''); setT(''); setC(''); setD(''); toast('Ціль створено') }
  const dep = (id: number) => { const v = +(prompt('Сума внеску, ₴') || 0); if (v > 0) { set(p => ({ ...p, goals: p.goals.map(g => g.id === id ? { ...g, current: g.current + v } : g) })); toast('Внесок додано') } }
  return <>
    <h1>Цілі</h1>
    <div style={{ margin: '14px 0' }}>{s.goals.length ? s.goals.map(g => { const k = goalCalc(g, s)
      return <div className="card" key={g.id} style={{ marginBottom: 12 }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><b>{g.name}</b><span className="mu sm">до {g.deadline}</span></div>
        <div className="big">{fmt(g.current)} <span className="mu sm">з {fmt(g.target)}</span></div><div className="bar" style={{ margin: '8px 0' }}><i style={{ width: Math.min(100, k.p) + '%' }} /></div>
        <div className="sm mu">{Math.round(k.p)}% · на день {fmt(k.perDay)} · на тиждень {fmt(k.perWeek)} · на місяць {fmt(k.perMonth)}</div><p>{k.msg}</p>
        <button className="btn g" onClick={() => dep(g.id)}>+ Внесок</button> <button className="btn g" onClick={() => set(p => ({ ...p, goals: p.goals.filter(x => x.id !== g.id) }))}>Видалити</button></div> })
      : <Empty a="Ще немає цілей" b="Створи першу ціль — я порахую, скільки відкладати." />}</div>
    <form className="card f" onSubmit={add}><input placeholder="Назва" aria-label="Назва" required value={n} onChange={e => setN(e.target.value)} /><input type="number" placeholder="Мета, ₴" aria-label="Мета" required value={t} onChange={e => setT(e.target.value)} />
      <input type="number" placeholder="Вже є, ₴" aria-label="Поточна сума" value={c} onChange={e => setC(e.target.value)} /><input type="date" aria-label="Дедлайн" required value={d} onChange={e => setD(e.target.value)} /><button className="btn">Створити</button></form>
  </>
}
