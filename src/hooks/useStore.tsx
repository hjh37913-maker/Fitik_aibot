import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AppState } from '../types'
import { loadState, saveState } from '../services/storage'

interface Ctx { s: AppState; set: (f: (p: AppState) => AppState) => void; toast: (m: string) => void }
const C = createContext<Ctx>(null!)
export const useStore = () => useContext(C)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, setS] = useState<AppState>(loadState)
  const [msg, setMsg] = useState('')
  useEffect(() => saveState(s), [s])
  useEffect(() => { document.documentElement.dataset.theme = s.dark ? 'dark' : 'light' }, [s.dark])
  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2200) }
  return <C.Provider value={{ s, set: f => setS(f), toast }}>{children}{msg && <div className="toast" role="status">{msg}</div>}</C.Provider>
}
