'use client'

import { ArrowRight, CalendarPlus, CreditCard, FileText, Shield } from 'lucide-react'
import Link from 'next/link'
import { Badge, Card, EmptyState, PageMotion, StatusDot } from '@/components/ui'
import { coverageCatalog, subscriptionConfig } from '@/lib/config'
import { serviceStateFromTrust } from '@/lib/engine'
import { formatDate, formatShortDate, money } from '@/lib/format'
import { protectionLabel, serviceStateLabel, subscriptionLabel } from '@/lib/labels'
import { useAppState } from '@/lib/store'

export function OverviewScreen() {
  const s = useAppState()
  const upcoming = s.plans
    .filter((p) => p.lifecycle !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)
  const activeCount = s.plans.filter((p) => p.lifecycle !== 'cancelled').length
  const protectedCount = s.plans.filter((p) => p.protectionStatus === 'protected').length
  const suggest = s.consents.extraData
    ? s.plans.find((p) => p.protectionStatus !== 'protected' && p.protectionStatus !== 'completed')
    : null
  const unread = s.notifications.filter((n) => !n.read)
  const service = serviceStateFromTrust(s.trust)
  const cThisMonth = s.support.payouts.filter((p) => p.month === new Date().toISOString().slice(0, 7)).length

  return (
    <PageMotion>
      <section className="overflow-hidden rounded-3xl bg-[var(--vtb-navy)] p-6 text-white sm:p-8">
        <p className="text-sm text-sky-200">
          Здравствуйте, {s.user.firstName}
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">
          Планы меняются. Ваша защита остаётся рядом.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-slate-200">
          {s.subscription.status === 'none'
            ? 'Подключите демонстрационную подписку SafeDay, чтобы открыть защиту планов и программу поддержки.'
            : `Подписка: ${subscriptionLabel[s.subscription.status]}. ${subscriptionConfig.demoNote}`}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/plans?new=1">
            <button style={{ backgroundColor: 'white', color: '#001a4d' }} className="inline-flex items-center justify-center gap-2 rounded-xl font-medium h-11 px-4 text-sm transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
              <CalendarPlus className="h-4 w-4" /> Добавить план
            </button>
          </Link>
          <Link href="/protection">
            <button className="border border-white/30 bg-transparent text-white inline-flex items-center justify-center gap-2 rounded-xl font-medium h-11 px-4 text-sm transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
              <Shield className="h-4 w-4" /> Защитить план
            </button>
          </Link>
          <Link href="/claims">
            <button className="border border-white/30 bg-transparent text-white inline-flex items-center justify-center gap-2 rounded-xl font-medium h-11 px-4 text-sm transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
              <FileText className="h-4 w-4" /> Открыть мои обращения
            </button>
          </Link>
          <Link href="/subscription">
            <button className="border border-white/30 bg-transparent text-white inline-flex items-center justify-center gap-2 rounded-xl font-medium h-11 px-4 text-sm transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
              <CreditCard className="h-4 w-4" /> Управлять подпиской
            </button>
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-xs text-slate-500">Подписка</p>
          <p className="mt-1 text-lg font-semibold">{subscriptionLabel[s.subscription.status]}</p>
          <p className="text-xs text-slate-500">
            Следующий платёж:{' '}
            {s.subscription.nextPaymentAt ? formatDate(s.subscription.nextPaymentAt) : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Планы</p>
          <p className="mt-1 text-lg font-semibold">{activeCount} активных карточек</p>
          <p className="text-xs text-slate-500">Защищено: {protectedCount}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Обращения</p>
          <p className="mt-1 text-lg font-semibold">{s.claims.length}</p>
          <p className="text-xs text-slate-500">Обслуживание: {serviceStateLabel[service]}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Поддержка SafeDay</p>
          <p className="mt-1 text-lg font-semibold">{cThisMonth === 0 ? 'Лимит месяца свободен' : 'Лимит месяца использован'}</p>
          <Link href="/support" className="text-xs text-[var(--vtb-blue)]">
            Правила программы
          </Link>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ваши планы на ближайшее время</h2>
            <Link href="/plans" className="text-sm text-[var(--vtb-blue)]">
              Все планы
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarPlus className="h-5 w-5" />}
              title="Пока нет планов"
              text="Добавьте поездку, встречу или событие — так сервис покажет ценность защиты."
              action={
                <Link href="/plans?new=1">
                  <button className="inline-flex items-center justify-center gap-2 rounded-xl font-medium h-11 px-4 text-sm transition bg-[var(--vtb-blue)] text-white shadow-[0_8px_24px_rgba(0,87,184,0.28)] hover:bg-[var(--vtb-blue-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vtb-blue)]">
                    Добавить план
                  </button>
                </Link>
              }
            />
          ) : (
            <div className="grid gap-3">
              {upcoming.map((p) => (
                <Link key={p.id} href={`/plans/${p.id}`}>
                  <Card hover className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{p.title}</p>
                      <p className="text-sm text-slate-500">
                        {formatShortDate(p.date)} · {p.location}
                      </p>
                    </div>
                    <Badge
                      tone={
                        p.protectionStatus === 'protected'
                          ? 'green'
                          : p.protectionStatus === 'pending'
                            ? 'amber'
                            : 'slate'
                      }
                    >
                      {protectionLabel[p.protectionStatus]}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-4">
          <Card>
            <h3 className="font-semibold">Новые уведомления</h3>
            {unread.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Нет непрочитанных сообщений.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {unread.slice(0, 4).map((n) => (
                  <li key={n.id} className="text-sm">
                    <Link href={n.href || '/overview'} className="hover:text-[var(--vtb-blue)]">
                      <p className="font-medium">{n.title}</p>
                      <p className="text-slate-500">{n.body}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="bg-gradient-to-br from-[var(--vtb-tint)] to-white">
            <h3 className="font-semibold">Реферальная программа</h3>
            <p className="mt-1 text-sm text-slate-600">Код {s.referral.code}</p>
            <p className="text-xs text-slate-500">
              Приглашено: {s.referral.invites.length} · Активировано:{' '}
              {s.referral.invites.filter((i) => i.status === 'activated').length}
            </p>
            <Link href="/referral" className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--vtb-blue)]">
              Открыть <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
          {suggest ? (
            <Card>
              <h3 className="font-semibold">Подсказка по планам</h3>
              <p className="mt-1 text-sm text-slate-600">
                «{suggest.title}» ещё без защиты. Подберите демонстрационное покрытие, пока дата в будущем.
              </p>
              <Link href={`/protection?planId=${suggest.id}`} className="mt-2 inline-flex text-sm text-[var(--vtb-blue)]">
                Подобрать защиту
              </Link>
            </Card>
          ) : !s.consents.extraData ? (
            <Card>
              <h3 className="font-semibold">Персонализация ограничена</h3>
              <p className="mt-1 text-sm text-slate-600">
                Демосогласие на дополнительные данные выключено — учебные подсказки по незащищённым планам скрыты.
              </p>
              <Link href="/profile" className="mt-2 inline-flex text-sm text-[var(--vtb-blue)]">
                Открыть настройки
              </Link>
            </Card>
          ) : null}
          <Card>
            <StatusDot
              tone={s.subscription.status === 'active' ? 'green' : s.subscription.status === 'cancelled' ? 'amber' : 'slate'}
              label={`Тариф «${subscriptionConfig.tariffName}» · ${money(subscriptionConfig.monthly)} / мес (демо)`}
            />
            {s.plans.find((p) => p.coverageProductId) ? (
              <p className="mt-2 text-xs text-slate-500">
                Активное покрытие:{' '}
                {coverageCatalog.find((c) => c.id === s.plans.find((p) => p.coverageProductId)?.coverageProductId)?.name}
              </p>
            ) : null}
          </Card>
        </div>
      </div>
    </PageMotion>
  )
}
