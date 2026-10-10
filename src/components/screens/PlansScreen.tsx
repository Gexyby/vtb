'use client'

import { CalendarDays, LayoutGrid, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { PlanForm } from '@/components/PlanForm'
import { Badge, Button, Card, EmptyState, Input, Modal, PageMotion, Select } from '@/components/ui'
import { formatDate, formatShortDate } from '@/lib/format'
import { planCategories, planCategoryLabel, protectionLabel } from '@/lib/labels'
import { useAppState } from '@/lib/store'
import type { PlanCategory, ProtectionStatus } from '@/lib/types'

export function PlansScreen() {
  const s = useAppState()
  const router = useRouter()
  const params = useSearchParams()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<PlanCategory | 'all'>('all')
  const [st, setSt] = useState<ProtectionStatus | 'all'>('all')
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [cal, setCal] = useState(() => {
    const d = new Date()
    return { y: d.getFullYear(), m: d.getMonth() }
  })
  const openNew = params.get('new') === '1'
  const [modal, setModal] = useState(openNew)

  useEffect(() => {
    if (openNew) setModal(true)
  }, [openNew])

  const list = useMemo(() => {
    return s.plans
      .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
      .filter((p) => cat === 'all' || p.category === cat)
      .filter((p) => st === 'all' || p.protectionStatus === st)
      .sort((a, b) => (sort === 'asc' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)))
  }, [s.plans, q, cat, st, sort])

  const year = cal.y
  const mo = cal.m
  const monthDate = new Date(year, mo, 1)
  const first = monthDate.getDay() || 7
  const days = new Date(year, mo + 1, 0).getDate()

  return (
    <PageMotion>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Мои планы</h1>
          <p className="text-sm text-slate-500">Создавайте события и подбирайте к ним защиту.</p>
        </div>
        <Button onClick={() => setModal(true)}>
          <Plus className="h-4 w-4" /> Добавить план
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input className="pl-9" placeholder="Поиск по названию" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={cat} onChange={(e) => setCat(e.target.value as PlanCategory | 'all')}>
          <option value="all">Все категории</option>
          {planCategories.map((c) => (
            <option key={c} value={c}>
              {planCategoryLabel[c]}
            </option>
          ))}
        </Select>
        <Select value={st} onChange={(e) => setSt(e.target.value as ProtectionStatus | 'all')}>
          <option value="all">Все статусы</option>
          <option value="protected">Защищён</option>
          <option value="unprotected">Не защищён</option>
          <option value="pending">Ожидает оформления</option>
          <option value="completed">Завершён</option>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={sort} onChange={(e) => setSort(e.target.value as 'asc' | 'desc')} className="w-auto">
          <option value="asc">Сначала ближайшие</option>
          <option value="desc">Сначала дальние</option>
        </Select>
        <div className="ml-auto flex rounded-xl bg-slate-100 p-1">
          <button className={`rounded-lg px-3 py-1.5 text-sm ${view === 'list' ? 'bg-white shadow-sm' : ''}`} onClick={() => setView('list')}>
            <LayoutGrid className="mr-1 inline h-4 w-4" />
            Список
          </button>
          <button className={`rounded-lg px-3 py-1.5 text-sm ${view === 'calendar' ? 'bg-white shadow-sm' : ''}`} onClick={() => setView('calendar')}>
            <CalendarDays className="mr-1 inline h-4 w-4" />
            Календарь
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={<Plus className="h-5 w-5" />}
          title="Планов пока нет"
          text="Создайте первый план — он появится здесь и на главной."
          action={<Button onClick={() => setModal(true)}>Добавить план</Button>}
        />
      ) : view === 'list' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((p) => (
            <Card key={p.id} hover>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(p.date)} · {p.time} · {p.location}
                  </p>
                </div>
                <Badge tone={p.protectionStatus === 'protected' ? 'green' : p.protectionStatus === 'pending' ? 'amber' : 'slate'}>
                  {protectionLabel[p.protectionStatus]}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <Badge>{planCategoryLabel[p.category]}</Badge>
                {p.coverageProductId ? <span>Есть покрытие</span> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/plans/${p.id}`}>
                  <Button size="sm" variant="secondary">
                    Подробнее
                  </Button>
                </Link>
                {p.protectionStatus !== 'protected' && p.protectionStatus !== 'completed' ? (
                  <Link href={`/protection?planId=${p.id}`}>
                    <Button size="sm">Подобрать защиту</Button>
                  </Link>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCal((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))}
            >
              Назад
            </Button>
            <p className="text-sm font-medium capitalize">
              {monthDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
            </p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCal((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))}
            >
              Вперёд
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400">
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: first - 1 }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const day = i + 1
              const iso = `${year}-${String(mo + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const items = list.filter((p) => p.date === iso)
              return (
                <div key={iso} className="min-h-16 rounded-lg border border-slate-100 p-1 text-left">
                  <p className="text-xs text-slate-500">{day}</p>
                  {items.map((p) => (
                    <Link key={p.id} href={`/plans/${p.id}`} className="mt-0.5 block truncate rounded bg-[var(--vtb-tint)] px-1 text-[10px] text-[var(--vtb-blue-deep)]">
                      {formatShortDate(p.date)} {p.title}
                    </Link>
                  ))}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Modal
        open={modal}
        wide
        title="Новый план"
        onClose={() => {
          setModal(false)
          router.replace('/plans')
        }}
      >
        <PlanForm
          onDone={(id) => {
            setModal(false)
            router.replace(id ? `/plans/${id}` : '/plans')
          }}
        />
      </Modal>
    </PageMotion>
  )
}
