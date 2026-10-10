'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ConnectModal } from '@/components/screens/ProtectionScreen'
import { Badge, Button, Card, PageMotion } from '@/components/ui'
import { coverageCatalog, subscriptionConfig } from '@/lib/config'
import { money } from '@/lib/format'
import { claimCategoryLabel, planCategoryLabel } from '@/lib/labels'
import { useAppState } from '@/lib/store'

export function ProductDetailScreen({ id }: { id: string }) {
  const product = coverageCatalog.find((p) => p.id === id)
  const params = useSearchParams()
  const s = useAppState()
  const [open, setOpen] = useState(false)
  if (!product) return <p>Продукт не найден</p>
  return (
    <PageMotion>
      <Link href="/protection" className="text-sm text-[var(--vtb-blue)]">
        Назад к каталогу
      </Link>
      <h1 className="text-2xl font-semibold">{product.name}</h1>
      <p className="text-slate-600">{product.details}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-2 text-sm">
          <p>
            <b>Категории планов:</b> {product.categories.map((c) => planCategoryLabel[c]).join(', ')}
          </p>
          <p>
            <b>Категории событий:</b> {product.eventCategories.map((c) => claimCategoryLabel[c]).join(', ')}
          </p>
          <p>
            <b>Срок:</b> {product.duration}
          </p>
          <p>
            <b>Лимит (демо):</b> {money(product.payoutLimit)}
          </p>
          <p>
            <b>Стоимость:</b> включено в подписку SafeDay
          </p>
          <p>
            <b>Подтверждение:</b> {product.confirmation}
          </p>
          <p>
            <b>Ограничения:</b> {product.limits}
          </p>
        </Card>
        <Card>
          <p className="font-medium">Исключения</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            {product.exclusions.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-slate-500">{subscriptionConfig.demoNote}</p>
          <Button className="mt-4" disabled={s.subscription.status === 'none'} onClick={() => setOpen(true)}>
            Подключить
          </Button>
        </Card>
      </div>
      <div className="flex gap-2">
        <Badge tone="blue">Категория A: возможна автоматическая проверка</Badge>
        <Badge tone="amber">Категория B: документы</Badge>
      </div>
      {open ? (
        <ConnectModal
          productId={product.id}
          productName={product.name}
          presetPlanId={params.get('planId')}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </PageMotion>
  )
}
