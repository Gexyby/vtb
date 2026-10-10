'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '@/lib/cn'
import { dismissToast, useToasts } from '@/lib/toast'

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}) {
  const variants = {
    primary:
      'bg-[var(--vtb-blue)] text-white shadow-[0_8px_24px_rgba(0,87,184,0.28)] hover:bg-[var(--vtb-blue-deep)]',
    secondary:
      'bg-[var(--surface)] text-[var(--vtb-navy)] border border-[var(--border)] hover:border-[var(--vtb-blue)] hover:text-[var(--vtb-blue)]',
    ghost: 'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)]',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    outline:
      'border border-[var(--vtb-blue)] text-[var(--vtb-blue)] bg-[var(--surface)] hover:bg-[var(--vtb-tint)]',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)] disabled:cur[...]',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  )
}

const fieldClass =
  'w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var[...]'

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  const id = useId()
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; 'aria-invalid'?: boolean }>, {
        id,
        'aria-invalid': Boolean(error) || undefined,
      })
    : children
  return (
    <div className="block space-y-1.5">
      <label className="text-sm font-medium text-[var(--foreground)]" htmlFor={id}>
        {label}
      </label>
      <div className="[&_input]:scroll-mt-24 [&_select]:scroll-mt-24 [&_textarea]:scroll-mt-24">
        {control}
      </div>
      {error ? (
        <span className="flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </div>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, props.className)} {...props} />
}

export function DatePicker(props: InputHTMLAttributes<HTMLInputElement>) {
  return <Input type="date" {...props} />
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, props.className)} {...props} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, 'min-h-28 resize-y', props.className)} {...props} />
}

export function Card({
  className,
  hover,
  children,
}: {
  className?: string
  hover?: boolean
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_10px_40px_rgba(15,40,80,0.04)] text-[var(--foreground)]',
        hover &&
          'transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,40,80,0.08)] motion-reduce:transform-none',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Badge({
  tone = 'slate',
  children,
}: {
  tone?: 'slate' | 'blue' | 'green' | 'amber' | 'rose' | 'violet'
  children: ReactNode
}) {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-[var(--vtb-tint)] text-[var(--vtb-blue-deep)]',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-800',
    rose: 'bg-rose-50 text-rose-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', map[tone])}>
      {children}
    </span>
  )
}

export function StatusIndicator({
  tone,
  label,
}: {
  tone: 'green' | 'amber' | 'rose' | 'blue' | 'slate'
  label: string
}) {
  return <StatusDot tone={tone} label={label} />
}

export function StatusDot({
  tone,
  label,
}: {
  tone: 'green' | 'amber' | 'rose' | 'blue' | 'slate'
  label: string
}) {
  const map = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    blue: 'bg-[var(--vtb-blue)]',
    slate: 'bg-slate-400',
  }
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-700">
      <span className={cn('h-2 w-2 rounded-full', map[tone])} />
      {label}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vtb-tint)] text-[var(--vtb-blue)]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-500">{text}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-[var(--surface-2)]', className)} />
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.18 }}
        >
          <button className="absolute inset-0 bg-slate-950/40" aria-label="Закрыть" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-[var(--surface)] p-5 shadow-2xl sm:rounded-3xl sm:p-6',
              wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
            )}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: 16, opacity: 0 }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              <button
                className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                onClick={onClose}
                aria-label="Закрыть окно"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-slate-950/40" aria-label="Закрыть" onClick={onClose} />
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[var(--surface)] shadow-2xl"
            initial={{ x: 40 }}
            animate={{ x: 0 }}
            exit={{ x: 40 }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold">{title}</h2>
              <button className="rounded-lg p-1 hover:bg-slate-100" onClick={onClose} aria-label="Закрыть">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = 'Подтвердить',
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  text: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-slate-600">{text}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export function FileUpload({
  files,
  onAdd,
  onRemove,
  note,
}: {
  files: { id: string; name: string; size: number }[]
  onAdd: (file: File) => void
  onRemove: (id: string) => void
  note: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600 hover:border-[var(--vtb-blue)] hover:bg-[var(--v[...]"
      >
        <Upload className="mb-2 h-5 w-5 text-[var(--vtb-blue)]" />
        Выберите файл (PDF, JPG, PNG, WEBP)
      </button>
      <input
        ref={ref}
        type="file"
        className="sr-only"
        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onAdd(f)
          e.target.value = ''
        }}
      />
      <p className="text-xs text-slate-500">{note}</p>
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="truncate">
              {f.name} · {(f.size / 1024).toFixed(0)} КБ
            </span>
            <button type="button" className="text-rose-600" onClick={() => onRemove(f.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Timeline({
  items,
}: {
  items: { id: string; at: string; title: string; detail: string }[]
}) {
  return (
    <ol className="space-y-4 border-l border-slate-200 pl-4">
      {items.map((i) => (
        <li key={i.id} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--vtb-blue)]" />
          <p className="text-sm font-medium text-slate-900">{i.title}</p>
          <p className="text-xs text-slate-500">{new Date(i.at).toLocaleString('ru-RU')}</p>
          <p className="mt-1 text-sm text-slate-600">{i.detail}</p>
        </li>
      ))}
    </ol>
  )
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[var(--vtb-blue)] to-sky-400"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 text-xs text-white group-hover:block[...]">
        {label}
      </span>
    </span>
  )
}

export function ToastViewport() {
  const items = useToasts()
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl"
          >
            {t.kind === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            ) : t.kind === 'error' ? (
              <AlertCircle className="h-5 w-5 text-rose-600" />
            ) : (
              <Info className="h-5 w-5 text-[var(--vtb-blue)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{t.title}</p>
              {t.message ? <p className="text-xs text-slate-500">{t.message}</p> : null}
            </div>
            <button className="text-slate-400" onClick={() => dismissToast(t.id)} aria-label="Закрыть уведомление">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

const TabsCtx = createContext<{ value: string; set: (v: string) => void } | null>(null)

export function Tabs({
  value,
  onChange,
  children,
}: {
  value: string
  onChange: (v: string) => void
  children: ReactNode
}) {
  return <TabsCtx.Provider value={{ value, set: onChange }}>{children}</TabsCtx.Provider>
}

export function TabList({ items }: { items: { id: string; label: string }[] }) {
  const ctx = useContext(TabsCtx)!
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-[var(--surface-2)] p-1">
      {items.map((i) => (
        <button
          key={i.id}
          onClick={() => ctx.set(i.id)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm transition',
            ctx.value === i.id ? 'bg-white font-medium text-[var(--vtb-blue)] shadow-sm' : 'text-slate-600',
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}

export function PageMotion({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {children}
    </motion.div>
  )
}
