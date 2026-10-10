'use client'

import { useEffect } from 'react'
import { ToastViewport } from '@/components/ui'
import { hydrateStore, useAppState } from '@/lib/store'

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useAppState().theme

  useEffect(() => {
    hydrateStore()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = theme === 'dark' || (theme === 'system' && prefersDark)
    root.dataset.theme = dark ? 'dark' : 'light'
    root.classList.toggle('dark', dark)
  }, [theme])

  return (
    <>
      {children}
      <ToastViewport />
    </>
  )
}
