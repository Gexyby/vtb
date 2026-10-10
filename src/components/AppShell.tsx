'use client'

import {
  Bell,
  CreditCard,
  FileText,
  Gift,
  History,
  LayoutDashboard,
  Menu,
  Shield,
  UserRound,
  WalletCards,
  HeartHandshake,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Onboarding } from '@/components/Onboarding'
import { Badge, Drawer, Skeleton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { hydrateStore, store, useAppState, useHydrated } from '@/lib/store'

const nav = [
  { href: '/overview', label: 'Обзор', icon: LayoutDashboard },
  { href: '/plans', label: 'Мои планы', icon: WalletCards },
  { href: '/protection', label: 'Защита', icon: Shield },
  { href: '/claims', label: 'Обращения', icon: FileText },
  { href: '/support', label: 'Поддержка', icon: HeartHandshake },
  { href: '/subscription', label: 'Подписка', icon: CreditCard },
  { href: '/referral', label: 'Рефералы', icon: Gift },
  { href: '/history', label: 'История', icon: History },
  { href: '/profile', label: 'Профиль', icon: UserRound },
]

const mobileMain = [nav[0], nav[1], nav[3], nav[5]]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const state = useAppState()
  const hydratedFlag = useHydrated()
  const [more, setMore] = useState(false)
  const [notes, setNotes] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    hydrateStore()
  }, [])

  useEffect(() => {
    if (!hydratedFlag) return
    if (!state.session) router.replace('/')
  }, [hydratedFlag, state.session, router])

  const unread = state.notifications.filter((n) => !n.read).length

  if (!hydratedFlag) {
    return (
      <div className="mx-auto grid max-w-6xl gap-4 p-6 lg:grid-cols-[240px_1fr]">
        <Skeleton className="hidden h-[80vh] lg:block" />
        <div className="space-y-3">
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!state.session) return null

  if (!state.onboarded) {
    return <Onboarding />
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-950">
        Демонстрационный MVP VTB SafeDay. Не является официальным приложением банка и не выполняет реальных платежей.
      </div>
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
          <Link href="/overview" className="mb-8 flex items-center gap-2 px-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--vtb-navy)] text-sm font-bold text-white">
              SD
            </span>
            <div>
              <p className="text-sm font-semibold text-[var(--vtb-navy)]">VTB SafeDay</p>
              <p className="text-[11px] text-slate-500">Защита жизненных планов</p>
            </div>
          </Link>
          <nav className="flex flex-1 flex-col gap-1">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition',
                    active
                      ? 'bg-[var(--vtb-tint)] font-medium text-[var(--vtb-blue-deep)]'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <p className="px-2 text-xs text-slate-400">
            {state.user.firstName} {state.user.lastName}
          </p>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-8">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 py-3 backdrop-blur lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <button className="rounded-lg p-2 hover:bg-slate-100" onClick={() => setMenu(true)} aria-label="Меню">
                <Menu className="h-5 w-5" />
              </button>
              <span className="font-semibold text-[var(--vtb-navy)]">SafeDay</span>
            </div>
            <div className="hidden text-sm text-slate-500 lg:block">
              Планы меняются. Ваша защита остаётся рядом.
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                className="relative rounded-xl p-2 hover:bg-slate-100"
                onClick={() => setNotes(true)}
                aria-label="Уведомления"
              >
                <Bell className="h-5 w-5" />
                {unread ? (
                  <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-rose-500 px-1 text-center text-[10px] text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                ) : null}
              </button>
            </div>
          </header>
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--surface)] px-1 py-2 lg:hidden">
        {mobileMain.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg py-1 text-[11px]',
                active ? 'text-[var(--vtb-blue)]' : 'text-slate-500',
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
        <button
          className="flex flex-col items-center gap-1 py-1 text-[11px] text-slate-500"
          onClick={() => setMore(true)}
        >
          <Menu className="h-5 w-5" />
          Ещё
        </button>
      </nav>

      <Drawer open={menu} onClose={() => setMenu(false)} title="Навигация">
        <div className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenu(false)}
              className="block rounded-xl px-3 py-3 hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Drawer>
      <Drawer open={more} onClose={() => setMore(false)} title="Ещё">
        <div className="space-y-1">
          {nav
            .filter((i) => !mobileMain.includes(i))
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMore(false)}
                className="block rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          <Link href="/legal/categories" onClick={() => setMore(false)} className="block rounded-xl px-3 py-3 hover:bg-slate-50">
            Категории A / B / C
          </Link>
        </div>
      </Drawer>
      <Drawer open={notes} onClose={() => setNotes(false)} title="Уведомления">
        <div className="mb-3 flex justify-end">
          <button className="text-sm text-[var(--vtb-blue)]" onClick={() => store.markAllRead()}>
            Прочитать все
          </button>
        </div>
        {state.notifications.length === 0 ? (
          <p className="text-sm text-slate-500">Пока нет уведомлений — они появятся после ваших действий.</p>
        ) : (
          <ul className="space-y-2">
            {state.notifications.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href || '/overview'}
                  onClick={() => {
                    store.markNotificationRead(n.id)
                    setNotes(false)
                  }}
                  className={cn('block rounded-xl border p-3', n.read ? 'border-slate-100' : 'border-[var(--vtb-tint)] bg-[var(--vtb-tint)]')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read ? <Badge tone="blue">новое</Badge> : null}
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{n.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Drawer>
    </div>
  )
}

export function Guard({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
