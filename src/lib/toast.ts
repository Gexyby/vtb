'use client'

import { useSyncExternalStore } from 'react'
import { uid } from './ids'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  kind: ToastKind
  title: string
  message?: string
}

let toasts: ToastItem[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function pushToast(kind: ToastKind, title: string, message?: string) {
  const item = { id: uid('TST'), kind, title, message }
  toasts = [...toasts, item]
  emit()
  window.setTimeout(() => dismissToast(item.id), 4200)
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => toasts,
    () => [] as ToastItem[],
  )
}
