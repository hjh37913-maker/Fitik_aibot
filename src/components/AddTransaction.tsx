import { useState } from 'react'
import Modal from './Modal'
import { CATS } from '../data/demo'
import { iso } from '../lib/finance'
import { useStore } from '../hooks/useStore'
import type { Category, TxType } from '../types'

export default function AddTransaction({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { set, toast } = useStore()
  const [type, setType] = useState<TxType>('e'), [amount, setAmount] = useState(''), [cat, setCat] = useState<Category>('Food'), [desc, setDesc] = useState(''), [date, setDate] = useState(iso(new Date()))
  const cats = (Object.keys(CATS) as Category[]).filter(c => (type === 'i' ? c === 'Income' : c !== 'Income'))
  const pick = (t: TxType) => { setType(t); setCat(t === 'i' ? 'Income' : 'Food') }
  const submit = (e: React.FormEvent) => {
    e.preventDefault(); const a = +amount
    if (!(a > 0)) return toast('Введи суму більше нуля')
    set(p => ({ ...p, tx: [...p.tx, { id: Date.now(), type, amount: a, category: cat, description: desc, date }] }))
    setAmount(''); setDesc(''); onClose(); toast('Операцію додано')
  }
  return <Modal open={open} onClose={onClose} title="Нова операція"><form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
    <div className="seg">{(['e', 'i'] as TxType[]).map(t => <button type="button" key={t} className={type === t ? 'on' : ''} onClick={() => pick(t)}>{t === 'e' ? 'Витрата' : 'Дохід'}</button>)}</div>
    <label>Сума, ₴<input type="number" min="1" step="any" value={amount} onChange={e => setAmount(e.target.value)} autoFocus required /></label>
    <label>Категорія<select value={cat} onChange={e => setCat(e.target.value as Category)}>{cats.map(c => <option key={c} value={c}>{CATS[c][0]} {CATS[c][1]}</option>)}</select></label>
    <label>Опис<input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Напр. Кава" /></label>
    <label>Дата<input type="date" value={date} onChange={e => setDate(e.target.value)} required /></label>
    <div style={{ display: 'flex', gap: 8 }}><button className="btn" style={{ flex: 1 }}>Додати</button><button type="button" className="btn g" onClick={onClose}>Скасувати</button></div>
  </form></Modal>
}
