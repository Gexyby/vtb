'use client'

import Link from 'next/link'
import { Button, Card, PageMotion, ProgressBar } from '@/components/ui'
import { subscriptionConfig, supportConfig } from '@/lib/config'
import { loyaltyLevel, maxFirstSupport } from '@/lib/engine'
import { formatDateTime, money } from '@/lib/format'
import { useAppState } from '@/lib/store'

export function SupportScreen() {
  const s = useAppState()
  const level = loyaltyLevel(s.trust.tenureMonths)
  const month = new Date().toISOString().slice(0, 7)
  const used = s.support.payouts.some((p) => p.month === month)
  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">Программа поддержки SafeDay</h1>
      <p className="text-sm text-slate-500">
        Категория C — отдельная клиентская программа. Это не автоматическое страховое покрытие и не гарантированная выплата.
      </p>
      <Card className="space-y-3 text-sm">
        <p>Правила перед подачей обращения:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Поддержка рассматривается индивидуально.</li>
          <li>Действует ограничение: не более {supportConfig.monthlyLimit} выплаты в календарный месяц.</li>
          <li>Размер зависит от правил программы и уровня лояльности, а не от текста обращения.</li>
          <li>Подача обращения не означает автоматического одобрения.</li>
          <li>
            Первая поддержка нового клиента не превышает {Math.round(supportConfig.firstPayoutPercent * 100)}% вступительного
            платежа ({money(maxFirstSupport())} при взносе {money(subscriptionConfig.entryFee)}).
          </li>
          <li>Переоформление подписки не сбрасывает историю и месячный лимит.</li>
        </ul>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Уровень лояльности</p>
          <p className="text-lg font-semibold">{level.name}</p>
          <p className="text-xs text-slate-500">Потолок уровня: {money(level.cap)}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Лимит месяца</p>
          <p className="text-lg font-semibold">{used ? 'Использован' : 'Доступен'}</p>
          <ProgressBar value={used ? 100 : 0} />
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Выплачено всего (демо)</p>
          <p className="text-lg font-semibold">{money(s.support.totalPaid)}</p>
          <p className="text-xs text-slate-500">Общий лимит {money(supportConfig.globalCap)}</p>
        </Card>
      </div>
      <Link href="/claims/new?category=C">
        <span className="inline-flex h-11 items-center rounded-xl bg-[var(--vtb-blue)] px-4 text-sm font-medium text-white">
          Подать обращение в программу
        </span>
      </Link>
    </PageMotion>
  )
}
