import { useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../hooks/useStore'
import { CATS } from '../data/demo'
import { fmt } from '../lib/finance'
import { download, toCSV } from '../services/storage'
import { Empty } from './Home'

export default function Transactions() {
  const { s, set, toast } = useStore()
  const [q, setQ] = useState(''), [t, setT] = useState('all'), [c, setC] = useState('all'), [from, setFrom] = useState(''), [sort, setSort] = useState('date')
  const list = useMemo(() => s.tx.filter(x => (t === 'all' || x.type === t) && (c === 'all' || x.category === c) && (!from || x.date >= from) && (!q || (x.description + CATS[x.category][1]).toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date) || b.id - a.id), [s.tx, q, t, c, from, sort])
  return <>
    <h1>Операції</h1>
    <div className="f" style={{ marginTop: 14 }}>
      <input placeholder="Пошук…" aria-label="Пошук" value={q} onChange={e => setQ(e.target.value)} />
      <select aria-label="Тип" value={t} onChange={e => setT(e.target.value)}><option value="all">Всі</option><option value="i">Доходи</option><option value="e">Витрати</option></select>
      <select aria-label="Категорія" value={c} onChange={e => setC(e.target.value)}><option value="all">Всі категорії</option>{Object.entries(CATS).map(([k, v]) => <option key={k} value={k}>{v[1]}</option>)}</select>
      <input type="date" aria-label="Від дати" value={from} onChange={e => setFrom(e.target.value)} />
      <select aria-label="Сортування" value={sort} onChange={e => setSort(e.target.value)}><option value="date">За датою</option><option value="amount">За сумою</option></select>
    </div>
    <div className="card">{list.length ? list.slice(0, 100).map(x => <div className="row" key={x.id}><div className="ic">{CATS[x.category][0]}</div>
      <div className="grow">{x.description || CATS[x.category][1]}<div className="sm mu">{CATS[x.category][1]} · {x.date}</div></div>
      <b className={x.type === 'i' ? 'gn' : ''}>{x.type === 'i' ? '+' : '−'}{fmt(x.amount)}</b>
      <button className="btn g" aria-label="Видалити" onClick={() => { set(p => ({ ...p, tx: p.tx.filter(y => y.id !== x.id) })); toast('Операцію видалено') }}><Trash2 size={15} /></button></div>)
      : <Empty a="No transactions yet." b="Add your first transaction to start understanding your finances." />}</div>
    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}><button className="btn g" onClick={() => download('smartmoney.csv', toCSV(s), 'text/csv')}>Експорт CSV</button><button className="btn g" onClick={() => download('smartmoney.json', JSON.stringify(s, null, 1), 'application/json')}>Експорт JSON</button></div>
  </>
}
