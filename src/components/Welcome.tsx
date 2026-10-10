'use client'

import { CalendarRange, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button, Card } from '@/components/ui'
import { hydrateStore, store, useAppState, useHydrated } from '@/lib/store'

const benefits = [
  {
    icon: CalendarRange,
    title: 'Мои планы',
    text: 'Соберите поездки, встречи и события в одном месте.',
  },
  {
    icon: ShieldCheck,
    title: 'Защита планов',
    text: 'Подберите демонстрационное покрытие под категорию события.',
  },
  {
    icon: Sparkles,
    title: 'Поддержка SafeDay',
    text: 'Отдельная программа для неоднозначных ситуаций — не гарантия выплаты.',
  },
  {
    icon: Users,
    title: 'Рефералы',
    text: 'Приглашайте друзей в учебном контуре и смотрите демостатистику.',
  },
]

export function Welcome() {
  const router = useRouter()
  const state = useAppState()
  const hydrated = useHydrated()

  useEffect(() => {
    hydrateStore()
  }, [])

  useEffect(() => {
    if (hydrated && state.session) router.replace('/overview')
  }, [hydrated, state.session, router])

  function enter(mode: 'seeded' | 'empty') {
    store.startDemo(mode)
    router.push('/overview')
  }

  return (
    <div className="min-h-screen bg-[var(--vtb-navy)] text-white">
      <div className="safeday-grid absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 sm:py-14">
        <p className="mb-6 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs tracking-wide text-sky-100">
          Демонстрационный MVP · не официальный сервис ВТБ
        </p>
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-medium text-sky-200">VTB SafeDay</p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
              Мы страхуем не только вещи. Мы помогаем защитить то, что человек запланировал.
            </h1>
            <p className="mt-4 max-w-lg text-base text-slate-200">
              Цифровая платформа защиты жизненных планов: поездки, мероприятия, учёба и важные встречи — в одном месте.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => enter('empty')} style={{ backgroundColor: 'white', color: '#001a4d' }} className="inline-flex items-center justify-center gap-2 rounded-xl font-medium h-12 px-5 text-base transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
                Попробовать SafeDay
              </button>
              <button onClick={() => enter('seeded')} className="border border-white/30 bg-transparent text-white inline-flex items-center justify-center gap-2 rounded-xl font-medium h-12 px-5 text-base transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
                Войти в деморежим
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-300">
              Без банковского логина, SMS и реальных карт. «Попробовать» — чистый профиль. «Деморежим» — заполнен демоданными.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: 'Поездка в Казань', d: '18 дней · Защищена', c: 'travel' },
              { t: 'Концерт', d: '9 дней · Подобрать защиту', c: 'event' },
              { t: 'Командировка', d: '4 дня · Ожидает оформления', c: 'work' },
              { t: 'Экзамен', d: '25 дней · Личный план', c: 'study' },
            ].map((p) => (
              <div key={p.t} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm font-medium">{p.t}</p>
                <p className="mt-1 text-xs text-sky-100/80">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <Card key={b.title} className="border-white/10 bg-white/95 text-slate-900">
              <b.icon className="mb-3 h-5 w-5 text-[var(--vtb-blue)]" />
              <p className="font-medium">{b.title}</p>
              <p className="mt-1 text-sm text-slate-500">{b.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
