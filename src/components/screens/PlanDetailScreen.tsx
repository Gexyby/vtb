'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PlanForm } from '@/components/PlanForm'
import { Badge, Button, Card, ConfirmDialog, Modal, PageMotion } from '@/components/ui'
import { coverageCatalog } from '@/lib/config'
import { formatDate, isPastPlan, money } from '@/lib/format'
import { planCategoryLabel, protectionLabel } from '@/lib/labels'
import { store, useAppState } from '@/lib/store'

export function PlanDetailScreen({ id }: { id: string }) {
  const s = useAppState()
  const router = useRouter()
  const plan = s.plans.find((p) => p.id === id)
  const [edit, setEdit] = useState(false)
  const [del, setDel] = useState(false)
  const product = coverageCatalog.find((c) => c.id === plan?.coverageProductId)

  if (!plan) {
    return (
      <Card>
        <p>План не найден.</p>
        <Button className="mt-4" onClick={() => router.push('/plans')}>
          К списку
        </Button>
      </Card>
    )
  }

  const past = isPastPlan(plan.date, plan.time)

  return (
    <PageMotion>
      <Button variant="ghost" onClick={() => router.push('/plans')}>
        Назад к планам
      </Button>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{plan.title}</h1>
          <p className="text-slate-500">
            {formatDate(plan.date)} · {plan.time} · {plan.location}
          </p>
        </div>
        <Badge tone={plan.protectionStatus === 'protected' ? 'green' : 'slate'}>
          {protectionLabel[plan.protectionStatus]}
        </Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="space-y-3">
          <p>
            <span className="text-slate-500">Категория:</span> {planCategoryLabel[plan.category]}
          </p>
          <p>
            <span className="text-slate-500">Описание:</span> {plan.description || '—'}
          </p>
          <p>
            <span className="text-slate-500">Расходы:</span> {money(plan.expectedCost)}
          </p>
          <p>
            <span className="text-slate-500">Дополнительно:</span> {plan.notes || '—'}
          </p>
          <p className="text-xs text-slate-400">ID {plan.id} · создан {formatDate(plan.createdAt)}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEdit(true)}>
              Редактировать
            </Button>
            <Button variant="danger" onClick={() => setDel(true)}>
              Удалить
            </Button>
          </div>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-semibold">Страховой статус (демо)</h2>
          {product ? (
            <>
              <p className="text-sm">{product.name}</p>
              <p className="text-xs text-slate-500">{product.short}</p>
              <p className="text-xs text-slate-500">Лимит выплаты (демо): {money(product.payoutLimit)}</p>
              <Button variant="outline" onClick={() => router.push(`/protection/${product.id}?planId=${plan.id}`)}>
                Подробнее о покрытии
              </Button>
              <Button variant="secondary" onClick={() => router.push(`/claims/new?planId=${plan.id}`)}>
                Создать обращение
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                {past
                  ? 'Событие уже наступило — оформить защиту задним числом нельзя.'
                  : 'План пока не защищён.'}
              </p>
              <Button disabled={past} onClick={() => router.push(`/protection?planId=${plan.id}`)}>
                Подобрать защиту
              </Button>
            </>
          )}
        </Card>
      </div>
      <Modal open={edit} onClose={() => setEdit(false)} title="Редактирование плана" wide>
        <PlanForm
          plan={plan}
          onDone={() => {
            setEdit(false)
          }}
        />
      </Modal>
      <ConfirmDialog
        open={del}
        danger
        title="Удалить план?"
        text="Карточка будет удалена из демоданных. Обращения, связанные с планом, останутся в истории."
        confirmLabel="Удалить"
        onClose={() => setDel(false)}
        onConfirm={() => {
          store.deletePlan(plan.id)
          setDel(false)
          router.push('/plans')
        }}
      />
    </PageMotion>
  )
}
