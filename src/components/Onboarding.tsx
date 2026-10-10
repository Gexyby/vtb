'use client'

import { ShieldCheck, Sparkles, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, Field, Input, ProgressBar } from '@/components/ui'
import { store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'

const steps = [
  {
    title: 'Планы в одном месте',
    text: 'Соберите поездки, встречи и события. SafeDay помогает защитить то, что вы запланировали — не только вещи.',
    icon: WalletCards,
  },
  {
    title: 'Защита и поддержка',
    text: 'Подберите демонстрационное покрытие. Неоднозначные случаи идут в программу поддержки SafeDay — это не гарантия выплаты.',
    icon: ShieldCheck,
  },
  {
    title: 'Как к вам обращаться',
    text: 'Имя нужно для приветствия и профиля. Банковский логин не требуется.',
    icon: Sparkles,
  },
]

export function Onboarding() {
  const s = useAppState()
  const [step, setStep] = useState(0)
  const [firstName, setFirstName] = useState(s.user.firstName === 'Демо' ? '' : s.user.firstName)
  const [city, setCity] = useState(s.user.city)
  const [error, setError] = useState('')

  function next() {
    if (step === 2) {
      if (!firstName.trim()) {
        setError('Укажите имя')
        return
      }
      store.updateProfile({ firstName: firstName.trim(), city: city.trim() || s.user.city })
      store.completeOnboarding()
      pushToast('success', 'Онбординг завершён', 'Можно подключить SafeDay и добавить первый план.')
      return
    }
    setStep((n) => n + 1)
  }

  const Icon = steps[step].icon

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-10">
      <Card className="w-full max-w-lg space-y-5">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--vtb-blue)]">VTB SafeDay · знакомство</p>
        <ProgressBar value={((step + 1) / steps.length) * 100} />
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vtb-tint)] text-[var(--vtb-blue)]">
          <Icon className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">{steps[step].title}</h1>
        <p className="text-sm text-slate-600">{steps[step].text}</p>
        {step === 2 ? (
          <div className="space-y-3">
            <Field label="Имя" error={error}>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Анна" />
            </Field>
            <Field label="Город">
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Москва" />
            </Field>
          </div>
        ) : null}
        <div className="flex justify-between gap-2">
          <Button variant="ghost" onClick={() => (step === 0 ? store.completeOnboarding() : setStep(step - 1))}>
            {step === 0 ? 'Пропустить' : 'Назад'}
          </Button>
          <Button onClick={next}>{step === 2 ? 'Начать работу' : 'Далее'}</Button>
        </div>
      </Card>
    </div>
  )
}
