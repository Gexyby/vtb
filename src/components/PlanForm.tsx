'use client'

import { useState } from 'react'
import { Button, DatePicker, Field, Input, Select, Textarea } from '@/components/ui'
import { cn } from '@/lib/cn'
import { todayISO } from '@/lib/format'
import { planCategories, planCategoryLabel } from '@/lib/labels'
import { store } from '@/lib/store'
import { pushToast } from '@/lib/toast'
import type { Plan, PlanCategory } from '@/lib/types'

type Form = {
  title: string
  category: PlanCategory
  date: string
  time: string
  location: string
  description: string
  expectedCost: string
  notes: string
}

function fromPlan(p?: Plan): Form {
  return {
    title: p?.title ?? '',
    category: p?.category ?? 'travel',
    date: p?.date ?? '',
    time: p?.time ?? '10:00',
    location: p?.location ?? '',
    description: p?.description ?? '',
    expectedCost: p ? String(p.expectedCost) : '',
    notes: p?.notes ?? '',
  }
}

export function PlanForm({
  plan,
  onDone,
}: {
  plan?: Plan
  onDone: (id?: string) => void
}) {
  const [form, setForm] = useState<Form>(fromPlan(plan))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const lockedDate = Boolean(plan?.coverageProductId && plan.lifecycle === 'completed')

  function validate() {
    const e: Record<string, string> = {}
    if (!form.title.trim()) e.title = 'Укажите название'
    if (!form.date) e.date = 'Укажите дату'
    else if (Number.isNaN(new Date(`${form.date}T${form.time || '12:00'}:00`).getTime())) e.date = 'Некорректная дата'
    if (!form.location.trim()) e.location = 'Укажите место'
    if (form.expectedCost && Number(form.expectedCost) < 0) e.expectedCost = 'Сумма не может быть отрицательной'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 350))
    const payload = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time || '10:00',
      location: form.location.trim(),
      description: form.description.trim(),
      expectedCost: Number(form.expectedCost || 0),
      notes: form.notes.trim(),
    }
    if (plan) {
      const res = store.updatePlan(plan.id, payload)
      setLoading(false)
      if (!res.ok) {
        pushToast('error', 'Не удалось сохранить', res.error)
        return
      }
      pushToast('success', 'План обновлён')
      onDone(plan.id)
      return
    }
    const res = store.addPlan(payload)
    setLoading(false)
    if (!res.ok) {
      pushToast('error', 'Не удалось создать план', res.error)
      return
    }
    pushToast('success', 'План создан', res.data.title)
    onDone(res.data.id)
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Field label="Название" error={errors.title}>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например, поездка в Сочи" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Категория">
          <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as PlanCategory })}>
            {planCategories.map((c) => (
              <option key={c} value={c}>
                {planCategoryLabel[c]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Место" error={errors.location}>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Дата" error={errors.date} hint={lockedDate ? 'Дата наступившего защищённого события заблокирована' : undefined}>
          <DatePicker
            disabled={lockedDate}
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </Field>
        <Field label="Время">
          <Input type="time" disabled={lockedDate} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>
      </div>
      <Field label="Описание">
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Что запланировано и почему это важно" />
      </Field>
      <Field label="Предполагаемые расходы, ₽" error={errors.expectedCost} hint="Демонстрационная сумма, не банковская операция">
        <Input type="number" min={0} value={form.expectedCost} onChange={(e) => setForm({ ...form, expectedCost: e.target.value })} />
      </Field>
      <Field label="Дополнительные сведения">
        <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </Field>
      {form.date && form.date < todayISO() ? (
        <p className={cn('rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900')}>
          Дата в прошлом: защиту оформить нельзя, статус плана станет «Завершён».
        </p>
      ) : null}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={() => onDone()}>
          Отмена
        </Button>
        <Button type="submit" loading={loading}>
          {plan ? 'Сохранить' : 'Создать план'}
        </Button>
      </div>
    </form>
  )
}
