'use client'

import { useMemo, useState } from 'react'
import { Card, EmptyState, Input, PageMotion, Select } from '@/components/ui'
import { formatDateTime, money } from '@/lib/format'
import { transactionLabel } from '@/lib/labels'
import { useAppState } from '@/lib/store'
import type { TransactionType } from '@/lib/types'

export function HistoryScreen() {
  const s = useAppState()
  const [q, setQ] = useState('')
  const [type, setType] = useState<TransactionType | 'all'>('all')
  const [sort, setSort] = useState<'new' | 'old'>('new')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const list = useMemo(() => {
    return s.transactions
      .filter((t) => type === 'all' || t.type === type)
      .filter((t) => `${t.title} ${t.details}`.toLowerCase().includes(q.toLowerCase()))
      .filter((t) => !from || t.createdAt.slice(0, 10) >= from)
      .filter((t) => !to || t.createdAt.slice(0, 10) <= to)
      .sort((a, b) => (sort === 'new' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)))
  }, [s.transactions, q, type, sort, from, to])

  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">История операций</h1>
      <p className="text-sm text-slate-500">Записи появляются только после ваших действий в MVP.</p>
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Input placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={type} onChange={(e) => setType(e.target.value as typeof type)}>
          <option value="all">Все типы</option>
          {Object.entries(transactionLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
          <option value="new">Сначала новые</option>
          <option value="old">Сначала старые</option>
        </Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Дата с" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Дата по" />
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<span>•</span>} title="История пуста" text="Подключите подписку, создайте план или отправьте обращение." />
      ) : (
        <div className="space-y-2">
          {list.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-sm text-slate-500">{t.details}</p>
                  <p className="text-xs text-slate-400">
                    {transactionLabel[t.type]} · {formatDateTime(t.createdAt)}
                  </p>
                </div>
                <p className="font-medium">{t.amount === null ? '—' : money(t.amount)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageMotion>
  )
}
