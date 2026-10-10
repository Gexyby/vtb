'use client'

import { Copy, Share2 } from 'lucide-react'
import { Badge, Button, Card, PageMotion } from '@/components/ui'
import { formatDateTime } from '@/lib/format'
import { referralLink, store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'

export function ReferralScreen() {
  const s = useAppState()
  const link = referralLink(s.referral.code)
  const invited = s.referral.invites.length
  const activated = s.referral.invites.filter((i) => i.status === 'activated').length

  async function copy() {
    try {
      await navigator.clipboard.writeText(link)
      store.copiedReferralLink()
      pushToast('success', 'Ссылка скопирована')
    } catch {
      pushToast('error', 'Не удалось скопировать', 'Разрешите доступ к буферу обмена')
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: 'VTB SafeDay', text: 'Демоприглашение в SafeDay', url: link })
      return
    }
    await copy()
  }

  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">Реферальная программа</h1>
      <p className="text-sm text-slate-500">
        Учебный контур. Реферальная активность не повышает страховую выплату и не доказывает страховое событие.
      </p>
      <Card className="bg-gradient-to-br from-[var(--vtb-navy)] to-[#123a7a] text-white">
        <p className="text-sm text-sky-100">Персональный код</p>
        <p className="mt-2 font-mono text-3xl tracking-wide">{s.referral.code}</p>
        <p className="mt-3 break-all text-sm text-sky-100">{link}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button className="bg-white text-[var(--vtb-navy)] hover:bg-sky-50" onClick={copy}>
            <Copy className="h-4 w-4" /> Скопировать ссылку
          </Button>
          <Button variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10" onClick={share}>
            <Share2 className="h-4 w-4" /> Поделиться
          </Button>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-slate-500">Приглашено</p>
          <p className="text-2xl font-semibold">{invited}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Активировано</p>
          <p className="text-2xl font-semibold">{activated}</p>
        </Card>
        <Card>
          <p className="text-xs text-slate-500">Демобонус</p>
          <p className="text-2xl font-semibold">{activated * 0} ₽</p>
          <p className="text-xs text-slate-500">Бонусы не конвертируются в страховую выплату</p>
        </Card>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-medium">История приглашений</h2>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => store.simulateInvite()}>
              Demo: приглашение
            </Button>
            <Button size="sm" variant="outline" onClick={() => store.simulateActivation()}>
              Demo: активация
            </Button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Кнопки Demo специально обозначены и не создают реальных пользователей.</p>
        <ul className="mt-4 space-y-2">
          {s.referral.invites.length === 0 ? <li className="text-sm text-slate-500">Пока нет приглашений.</li> : null}
          {s.referral.invites.map((i) => (
            <li key={i.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span>
                {i.label}
                <span className="ml-2 text-xs text-slate-400">{formatDateTime(i.at)}</span>
              </span>
              <Badge tone={i.status === 'activated' ? 'green' : 'slate'}>
                {i.status === 'activated' ? 'Активировано' : 'Приглашено'}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </PageMotion>
  )
}
