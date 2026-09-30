import { useState } from 'react'
import { Home as HomeIcon, Receipt, Sparkles, Target, Settings as Cog, Plus } from 'lucide-react'
import { StoreProvider } from './hooks/useStore'
import AddTransaction from './components/AddTransaction'
import Home from './pages/Home'
import Transactions from './pages/Transactions'
import Advisor from './pages/Advisor'
import Goals from './pages/Goals'
import Settings from './pages/Settings'

const NAV = [['home', HomeIcon, 'Головна', Home], ['tx', Receipt, 'Операції', Transactions], ['ai', Sparkles, 'AI', Advisor], ['goals', Target, 'Цілі', Goals], ['set', Cog, 'Профіль', Settings]] as const
export default function App() {
  const [page, setPage] = useState<string>('home'), [open, setOpen] = useState(false)
  const Page = NAV.find(n => n[0] === page)![3]
  return <StoreProvider>
    <div className="app">
      <aside className="side"><div className="logo">Smart<b>Money</b> AI</div>
        {NAV.map(([k, I, l]) => <button key={k} className={'nav ' + (page === k ? 'on' : '')} onClick={() => setPage(k)}><I size={16} /> {l}</button>)}
        <button className="btn" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>+ Add transaction</button></aside>
      <main key={page}><Page /></main>
    </div>
    <nav className="tab" aria-label="Навігація">
      {NAV.slice(0, 2).map(([k, I, l]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => setPage(k)}><I size={20} /><br />{l}</button>)}
      <button className="add" aria-label="Додати операцію" onClick={() => setOpen(true)}><Plus /></button>
      {NAV.slice(2).filter(n => n[0] === 'ai' || n[0] === 'set').map(([k, I, l]) => <button key={k} className={page === k ? 'on' : ''} onClick={() => setPage(k)}><I size={20} /><br />{l}</button>)}
    </nav>
    <AddTransaction open={open} onClose={() => setOpen(false)} />
  </StoreProvider>
}
