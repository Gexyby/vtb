'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Badge, Button, Card, ConfirmDialog, PageMotion, ProgressBar } from '@/components/ui'
import { subscriptionConfig } from '@/lib/config'
import { formatDate, money } from '@/lib/format'
import { subscriptionLabel } from '@/lib/labels'
import { store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'

export function SubscriptionScreen() {
  const s = useAppState()
  const [rules, setRules] = useState(false)
  const [confirmOn, setConfirmOn] = useState(false)
  const [confirmOff, setConfirmOff] = useState(false)
  const [reup, setReup] = useState(false)
  const payments = s.transactions.filter((t) =>
    ['entry_fee', 'monthly_charge', 'subscription_connect'].includes(t.type),
  )

  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">Подписка</h1>
      <p className="text-sm text-slate-500">{subscriptionConfig.demoNote}</p>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Текущий тариф</p>
              <p className="text-xl font-semibold">{subscriptionConfig.tariffName}</p>
            </div>
            <Badge tone={s.subscription.status === 'active' ? 'green' : s.subscription.status === 'cancelled' ? 'amber' : 'slate'}>
              {subscriptionLabel[s.subscription.status]}
            </Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm">
            <p>Подключение: {s.subscription.startedAt ? formatDate(s.subscription.startedAt) : 'ещё не оформлялась'}</p>
            <p>Следующий платёж: {s.subscription.nextPaymentAt ? formatDate(s.subscription.nextPaymentAt) : '—'}</p>
            <p>Вступительный платёж: {money(subscriptionConfig.entryFee)}</p>
            <p>Ежемесячно: {money(subscriptionConfig.monthly)}</p>
            <p>Автопродление: {s.subscription.autoRenew ? 'включено' : 'выключено'}</p>
            <p>Окончание: {s.subscription.endsAt ? formatDate(s.subscription.endsAt) : 'при автопродлении не задано'}</p>
          </div>
          <ProgressBar value={s.subscription.status === 'none' ? 8 : s.subscription.autoRenew ? 72 : 40} />
          <ul className="list-disc pl-5 text-sm text-slate-600">
            <li>Каталог защиты жизненных планов</li>
            <li>Обращения категорий A и B</li>
            <li>Доступ к программе поддержки SafeDay (C)</li>
            <li>История операций и уведомления</li>
          </ul>
          <div className="flex flex-wrap gap-2">
            {s.subscription.status === 'none' ? (
              <Button onClick={() => setConfirmOn(true)}>Подключить в деморежиме</Button>
            ) : (
              <>
                {s.subscription.autoRenew ? (
                  <Button variant="secondary" onClick={() => setConfirmOff(true)}>
                    Отключить автопродление
                  </Button>
                ) : (
                  <Button onClick={() => store.setAutoRenew(true)}>Возобновить автопродление</Button>
                )}
                <Button variant="outline" onClick={() => setReup(true)}>
                  Переоформить подписку
                </Button>
              </>
            )}
            <Button variant="ghost" onClick={() => setRules(true)}>
              Правила
            </Button>
            {s.subscription.status !== 'none' ? (
              <Button
                variant="outline"
                onClick={() => {
                  const res = store.simulateMonthlyCharge()
                  if (!res.ok) pushToast('error', res.error)
                  else pushToast('success', 'Демосписание добавлено в журнал')
                }}
              >
                Demo: ежемесячное списание
              </Button>
            ) : null}
          </div>
        </Card>
        <Card>
          <h2 className="font-medium">История платежей (деможурнал)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {payments.length === 0 ? <li className="text-slate-500">Пока нет записей.</li> : null}
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between gap-2 border-b border-slate-100 py-2">
                <span>{p.title}</span>
                <span>{p.amount ? money(p.amount) : '—'}</span>
              </li>
            ))}
          </ul>
          <Link href="/history" className="mt-3 inline-block text-sm text-[var(--vtb-blue)]">
            Полная история операций
          </Link>
        </Card>
      </div>
      <Card className="text-sm text-slate-600">
        Отмена автопродления не стирает обращения и лимит категории C. Повторное оформление тоже сохраняет историю.
      </Card>
      <ConfirmDialog
        open={confirmOn}
        title="Подключить SafeDay?"
        text={`Будут добавлены учебные записи: вступительный платёж ${money(subscriptionConfig.entryFee)} и первый месяц ${money(subscriptionConfig.monthly)}. Деньги не списываются.`}
        confirmLabel="Подтвердить"
        onClose={() => setConfirmOn(false)}
        onConfirm={() => {
          store.connectSubscription()
          setConfirmOn(false)
          pushToast('success', 'SafeDay подключён')
        }}
      />
      <ConfirmDialog
        open={confirmOff}
        title="Отключить автопродление?"
        text="Доступ сохранится до конца демопериода. История обращений не сбросится."
        confirmLabel="Отключить"
        onClose={() => setConfirmOff(false)}
        onConfirm={() => {
          store.setAutoRenew(false)
          setConfirmOff(false)
          pushToast('info', 'Автопродление отключено')
        }}
      />
      <ConfirmDialog
        open={reup}
        title="Переоформить подписку?"
        text="История обращений и месячные ограничения категории C будут сохранены."
        confirmLabel="Переоформить"
        onClose={() => setReup(false)}
        onConfirm={() => {
          store.connectSubscription()
          setReup(false)
          pushToast('success', 'Подписка переоформлена, лимиты C сохранены')
        }}
      />
      <ConfirmDialog
        open={rules}
        title="Правила демонстрационной подписки"
        text="MVP имитирует подключение, списания и отмену. Это не договор, не оферта ВТБ и не реальное страхование. Повторное оформление не обнуляет программу поддержки."
        confirmLabel="Понятно"
        onClose={() => setRules(false)}
        onConfirm={() => setRules(false)}
      />
    </PageMotion>
  )
}
