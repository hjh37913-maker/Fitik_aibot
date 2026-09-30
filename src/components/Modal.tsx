import { useEffect, type ReactNode } from 'react'
export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); addEventListener('keydown', h); return () => removeEventListener('keydown', h) }, [onClose])
  if (!open) return null
  return <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}><div className="card" role="dialog" aria-modal="true" aria-label={title}><h2>{title}</h2>{children}</div></div>
}
