'use client'

import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Badge, Button, Card, Modal, PageMotion, Select } from '@/components/ui'
import { coverageCatalog, subscriptionConfig } from '@/lib/config'
import { isPastPlan, money } from '@/lib/format'
import { planCategoryLabel } from '@/lib/labels'
import { store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'

export function ProtectionScreen() {
  const s = useAppState()
  const params = useSearchParams()
  const prePlan = params.get('planId')
  const [productId, setProductId] = useState<string | null>(null)
  const product = coverageCatalog.find((p) => p.id === productId)

  return (
    <PageMotion>
      <div>
        <h1 className="text-2xl font-semibold">Защита и покрытия</h1>
        <p className="text-sm text-slate-500">
          Каталог демонстрационных продуктов. {subscriptionConfig.demoNote}
        </p>
      </div>
      {s.subscription.status === 'none' ? (
        <Card className="border-amber-200 bg-amber-50 text-sm text-amber-950">
          Подписка не подключена. Оформление защиты станет доступно после подключения SafeDay.{' '}
          <Link href="/subscription" className="underline">
            Перейти к подписке
          </Link>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {coverageCatalog.map((p) => (
          <Card key={p.id} hover className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-semibold">{p.name}</h2>
              <Badge tone="blue">{money(p.payoutLimit)} лимит</Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-slate-600">{p.short}</p>
            <p className="mt-3 text-xs text-slate-500">
              Категории: {p.categories.map((c) => planCategoryLabel[c]).join(', ')}
            </p>
            <p className="text-xs text-slate-500">Срок: {p.duration}</p>
            <p className="text-xs text-slate-400">Стоимость в демоконтуре: включено в подписку</p>
            <div className="mt-4 flex gap-2">
              <Link href={`/protection/${p.id}${prePlan ? `?planId=${prePlan}` : ''}`}>
                <Button size="sm" variant="secondary">
                  Подробнее
                </Button>
              </Link>
              <Button size="sm" onClick={() => setProductId(p.id)} disabled={s.subscription.status === 'none'}>
                Подключить
              </Button>
            </div>
          </Card>
        ))}
      </div>
      {product ? (
        <ConnectModal
          productName={product.name}
          productId={product.id}
          presetPlanId={prePlan}
          onClose={() => setProductId(null)}
        />
      ) : null}
    </PageMotion>
  )
}

export function ConnectModal({
  productId,
  productName,
  presetPlanId,
  onClose,
}: {
  productId: string
  productName: string
  presetPlanId: string | null
  onClose: () => void
}) {
  const s = useAppState()
  const router = useRouter()
  const product = coverageCatalog.find((p) => p.id === productId)!
  const [planId, setPlanId] = useState(presetPlanId ?? '')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const eligible = s.plans.filter(
    (p) => !isPastPlan(p.date, p.time) && p.lifecycle !== 'completed' && product.categories.includes(p.category),
  )

  async function submit() {
    if (!planId) {
      pushToast('error', 'Выберите план')
      return
    }
    if (!agreed) {
      pushToast('error', 'Подтвердите ознакомление с условиями')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    const res = store.connectCoverage(planId, productId)
    setLoading(false)
    if (!res.ok) {
      pushToast('error', 'Нельзя оформить защиту', res.error)
      return
    }
    setDone(true)
    pushToast('success', 'Защита оформлена')
  }

  return (
    <Modal open onClose={onClose} title={`Подключение: ${productName}`} wide>
      {done ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p>Демонстрационное покрытие подключено. Статус плана обновлён на «Защищён».</p>
          <div className="flex justify-center gap-2">
            <Button onClick={() => router.push(`/plans/${planId}`)}>К плану</Button>
            <Button variant="secondary" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{product.details}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {product.exclusions.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500">Подтверждение: {product.confirmation}</p>
          <p className="text-xs text-slate-500">Ограничения: {product.limits}</p>
          <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            <option value="">Выберите план</option>
            {eligible.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {p.date}
              </option>
            ))}
          </Select>
          {eligible.length === 0 ? (
            <p className="text-sm text-amber-800">
              Нет подходящих будущих планов этой категории. Создайте план или выберите другой продукт.
            </p>
          ) : null}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
            Я ознакомился с демонстрационными условиями. Это не официальный страховой договор ВТБ.
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={submit} loading={loading} disabled={!agreed}>
              Подтвердить оформление
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
