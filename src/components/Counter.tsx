import { useEffect, useState } from 'react'
import { fmt } from '../lib/finance'
export default function Counter({ value }: { value: number }) {
  const [v, setV] = useState(0)
  useEffect(() => { const t0 = performance.now(); let id = 0
    const f = (n: number) => { const p = Math.min(1, (n - t0) / 600); setV(value * (1 - Math.pow(1 - p, 3))); if (p < 1) id = requestAnimationFrame(f) }
    id = requestAnimationFrame(f); return () => cancelAnimationFrame(id) }, [value])
  return <>{fmt(v)}</>
}
