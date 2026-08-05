'use client'

import { useEffect, useState } from 'react'

export function ProgressBar({ active }: { active: boolean }) {
  const [finishing, setFinishing] = useState(false)
  const [visible, setVisible] = useState(active)

  useEffect(() => {
    if (active) {
      setVisible(true)
      setFinishing(false)
      return
    }
    if (!visible) return
    setFinishing(true)
    const timer = window.setTimeout(() => {
      setVisible(false)
      setFinishing(false)
    }, 220)
    return () => window.clearTimeout(timer)
  }, [active, visible])

  if (!visible) return null
  return (
    <div
      className="fixed inset-x-0 top-0 z-[120] h-0.5 overflow-hidden"
      aria-hidden="true"
    >
      <span
        className={`ux-progress-bar block h-full bg-blue-500 ${finishing ? 'ux-progress-finish' : ''}`}
      />
    </div>
  )
}
