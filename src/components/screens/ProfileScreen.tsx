'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Card, ConfirmDialog, Field, Input, PageMotion, Select } from '@/components/ui'
import { serviceStateFromTrust } from '@/lib/engine'
import { serviceStateLabel } from '@/lib/labels'
import { store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'
import type { ThemePreference } from '@/lib/types'

export function ProfileScreen() {
  const s = useAppState()
  const router = useRouter()
  const [form, setForm] = useState({
    firstName: s.user.firstName,
    lastName: s.user.lastName,
    email: s.user.email,
    phone: s.user.phone,
    city: s.user.city,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resetOpen, setResetOpen] = useState(false)
  const [outOpen, setOutOpen] = useState(false)
  const service = serviceStateFromTrust(s.trust)

  function save() {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = 'Укажите имя'
    if (!form.lastName.trim()) e.lastName = 'Укажите фамилию'
    if (!form.email.includes('@')) e.email = 'Некорректная почта'
    setErrors(e)
    if (Object.keys(e).length) return
    store.updateProfile(form)
    pushToast('success', 'Профиль сохранён')
  }

  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">Профиль и настройки</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <Field label="Имя" error={errors.firstName}>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </Field>
          <Field label="Фамилия" error={errors.lastName}>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label="Электронная почта" error={errors.email}>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Телефон (демоформат)">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Город">
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </Field>
          <Button onClick={save}>Сохранить</Button>
        </Card>
        <div className="space-y-4">
          <Card className="space-y-3">
            <h2 className="font-medium">Уведомления</h2>
            {(['emailNotifications', 'pushNotifications', 'smsNotifications'] as const).map((k) => (
              <label key={k} className="flex items-center justify-between text-sm">
                <span>
                  {k === 'emailNotifications' ? 'Email' : k === 'pushNotifications' ? 'В приложении' : 'SMS (демо)'}
                </span>
                <input
                  type="checkbox"
                  checked={s.consents[k]}
                  onChange={(e) => store.setConsents({ [k]: e.target.checked })}
                />
              </label>
            ))}
          </Card>
          <Card className="space-y-3">
            <h2 className="font-medium">Согласие на demo-данные</h2>
            <p className="text-sm text-slate-600">
              Сервису могут понадобиться дополнительные сведения для персонализации сценариев. В MVP это только переключатель:
              банковские системы не подключаются.
            </p>
            <p className="text-xs text-slate-500">
              Моделируемые категории: календарь планов, статусы обращений, учебный журнал операций. Не используется реальная
              история покупок.
            </p>
            <label className="flex items-center justify-between text-sm">
              <span>Демосогласие включено</span>
              <input
                type="checkbox"
                checked={s.consents.extraData}
                onChange={(e) => {
                  store.setConsents({ extraData: e.target.checked })
                  pushToast('info', e.target.checked ? 'Согласие включено' : 'Согласие отозвано')
                }}
              />
            </label>
            {!s.consents.extraData ? (
              <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-950">
                Персонализация ограничена: mock-анализ дополнительных данных не выполняется.
              </p>
            ) : (
              <p className="text-xs text-slate-500">Статус: согласие активно. Анализ остаётся учебным.</p>
            )}
            <p className="text-sm">
              Состояние обслуживания: <b>{serviceStateLabel[service]}</b>
            </p>
            <p className="text-xs text-slate-400">
              Числовой рейтинг надёжности скрыт. Он не определяет реальное страховое решение.
            </p>
          </Card>
          <Card>
            <Field label="Тема">
              <Select value={s.theme} onChange={(e) => store.setTheme(e.target.value as ThemePreference)}>
                <option value="light">Светлая</option>
                <option value="dark">Тёмная</option>
                <option value="system">Системная</option>
              </Select>
            </Field>
          </Card>
        </div>
      </div>
      <Card className="flex flex-wrap gap-3 text-sm">
        <Link className="text-[var(--vtb-blue)]" href="/legal/rules">
          Правила сервиса
        </Link>
        <Link className="text-[var(--vtb-blue)]" href="/legal/categories">
          Категории A / B / C
        </Link>
        <Link className="text-[var(--vtb-blue)]" href="/legal/privacy">
          Приватность
        </Link>
        <Link className="text-[var(--vtb-blue)]" href="/support">
          Программа поддержки
        </Link>
      </Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setOutOpen(true)}>
          Выйти из деморежима
        </Button>
        <Button variant="danger" onClick={() => setResetOpen(true)}>
          Сбросить демоданные
        </Button>
      </div>
      <ConfirmDialog
        open={outOpen}
        title="Выйти из деморежима?"
        text="Сессия закроется, данные в браузере сохранятся — можно войти снова."
        onClose={() => setOutOpen(false)}
        onConfirm={() => {
          store.logout()
          router.push('/')
        }}
      />
      <ConfirmDialog
        open={resetOpen}
        danger
        title="Сбросить все демоданные?"
        text="Будут удалены планы, обращения, подписка и история в этом браузере."
        confirmLabel="Сбросить"
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          store.resetDemo()
          router.push('/')
        }}
      />
    </PageMotion>
  )
}

export function LegalScreen({ kind }: { kind: 'rules' | 'privacy' | 'categories' }) {
  const content = {
    rules: {
      t: 'Правила сервиса',
      p: [
        'VTB SafeDay в этой сборке — концептуальный MVP для демонстрации пользовательских сценариев.',
        'Подписка, платежи и выплаты существуют только как записи локального журнала.',
        'Не передавайте банковские пароли, CVV и коды из SMS — сервис их не запрашивает.',
      ],
    },
    privacy: {
      t: 'Приватность',
      p: [
        'Данные хранятся в localStorage вашего браузера и не отправляются на сервер банка.',
        'Согласие на дополнительные demo-данные можно отозвать в профиле.',
        'Вложения обращений не сохраняются между сессиями — только имя файла.',
      ],
    },
    categories: {
      t: 'Категории A, B и C',
      p: [
        'A — объективно подтверждаемые события (отмена транспорта или мероприятия по правилам). Возможна автоматическая проверка тестового сценария.',
        'B — нужны дополнительные подтверждения, документы и описание. Отправка и одобрение — разные этапы.',
        'C — программа поддержки SafeDay: индивидуальное рассмотрение, лимит раз в календарный месяц, потолок первой поддержки для нового клиента.',
      ],
    },
  }[kind]
  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">{content.t}</h1>
      <Card className="space-y-3 text-sm text-slate-600">
        {content.p.map((x) => (
          <p key={x}>{x}</p>
        ))}
      </Card>
    </PageMotion>
  )
}
