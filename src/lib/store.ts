'use client'

import { useSyncExternalStore } from 'react'
import { coverageCatalog, demoScenarios, fileUploadConfig, STORAGE_KEY, subscriptionConfig } from './config'
import { evaluateCategoryC, serviceStateFromTrust } from './engine'
import { addMonthsISO, isPastPlan, monthKey } from './format'
import { uid } from './ids'
import { createEmptyState, createSeededState, migrateState } from './seed'
import type {
  AppState,
  Claim,
  ClaimCategory,
  ConsentSettings,
  DemoAttachment,
  DemoMode,
  Plan,
  ThemePreference,
  TrustInputs,
  UserProfile,
} from './types'

let state: AppState = createEmptyState()
const listeners = new Set<() => void>()
let hydrated = false

function emit() {
  listeners.forEach((l) => l())
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}

function setState(patch: Partial<AppState> | ((prev: AppState) => AppState)) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch }
  persist()
  emit()
}

function notify(title: string, body: string, href?: string) {
  const item = {
    id: uid('NTF'),
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
    href,
  }
  setState((s) => ({ ...s, notifications: [item, ...s.notifications].slice(0, 80) }))
}

function tx(
  type: AppState['transactions'][number]['type'],
  title: string,
  details: string,
  amount: number | null,
  relatedId: string | null = null,
) {
  const item = {
    id: uid('TX'),
    type,
    title,
    details,
    amount,
    createdAt: new Date().toISOString(),
    relatedId,
  }
  setState((s) => ({ ...s, transactions: [item, ...s.transactions] }))
}

export function hydrateStore() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = migrateState(JSON.parse(raw))
      if (parsed) {
        state = parsed
        remindUpcomingPayment()
        emit()
        return
      }
    }
  } catch {
    /* reset below */
  }
  state = createEmptyState()
  emit()
}

function remindUpcomingPayment() {
  const next = state.subscription.nextPaymentAt
  if (!next || state.subscription.status === 'none') return
  const days = Math.ceil((new Date(next).getTime() - Date.now()) / 86400000)
  if (days < 0 || days > 7) return
  if (state.notifications.some((n) => n.title === 'Приближается дата платежа')) return
  notify(
    'Приближается дата платежа',
    'В деможурнале запланировано следующее списание. Реальных денег нет — это напоминание учебного контура.',
    '/subscription',
  )
}

export function getState() {
  return state
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState() {
  return useSyncExternalStore(subscribe, getState, createEmptyState)
}

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => hydrated,
    () => false,
  )
}

export const store = {
  startDemo(mode: DemoMode) {
    const next = mode === 'seeded' ? createSeededState() : createEmptyState()
    next.session = true
    next.onboarded = true
    next.demoMode = mode
    if (mode === 'empty') {
      next.onboarded = false
      next.notifications = [
        {
          id: uid('NTF'),
          title: 'Чистый демопрофиль',
          body: 'Можно пройти путь нового клиента: подключить SafeDay и добавить первый план.',
          createdAt: new Date().toISOString(),
          read: false,
          href: '/subscription',
        },
      ]
      next.referral.code = `SAFE-${next.user.id.slice(-4).toUpperCase()}`
    }
    state = next
    persist()
    emit()
  },

  completeOnboarding() {
    setState({ onboarded: true })
  },

  logout() {
    setState({ session: false })
  },

  resetDemo() {
    localStorage.removeItem(STORAGE_KEY)
    state = createEmptyState()
    persist()
    emit()
  },

  updateProfile(patch: Partial<UserProfile>) {
    setState((s) => ({ ...s, user: { ...s.user, ...patch } }))
    tx('settings', 'Обновлён профиль', 'Демонстрационные данные клиента изменены.', null)
    notify('Профиль сохранён', 'Изменения останутся после перезагрузки страницы.', '/profile')
  },

  setTheme(theme: ThemePreference) {
    setState({ theme })
  },

  setConsents(patch: Partial<ConsentSettings>) {
    setState((s) => ({ ...s, consents: { ...s.consents, ...patch } }))
    tx('settings', 'Изменены согласия', 'Настройки демо-данных и уведомлений обновлены.', null)
  },

  setTrustInputs(patch: Partial<TrustInputs>) {
    setState((s) => ({ ...s, trust: { ...s.trust, ...patch } }))
    tx(
      'settings',
      'Обновлены параметры обслуживания (демо)',
      'Изменены учебные входы модели. Числовой рейтинг скрыт от клиента и не является страховым решением.',
      null,
    )
  },

  addPlan(input: Omit<Plan, 'id' | 'createdAt' | 'protectionStatus' | 'coverageProductId' | 'coverageStartedAt' | 'lifecycle'>) {
    if (!input.title.trim()) return { ok: false as const, error: 'Укажите название плана.' }
    if (!input.date) return { ok: false as const, error: 'Укажите дату.' }
    const dt = new Date(`${input.date}T${input.time || '12:00'}:00`)
    if (Number.isNaN(dt.getTime())) return { ok: false as const, error: 'Некорректная дата или время.' }
    const past = isPastPlan(input.date, input.time)
    const plan: Plan = {
      ...input,
      id: uid('PLN'),
      createdAt: new Date().toISOString(),
      protectionStatus: past ? 'completed' : 'unprotected',
      coverageProductId: null,
      coverageStartedAt: null,
      lifecycle: past ? 'completed' : 'upcoming',
    }
    setState((s) => ({ ...s, plans: [plan, ...s.plans] }))
    notify('План создан', `«${plan.title}» добавлен в ваши планы.`, `/plans/${plan.id}`)
    return { ok: true as const, data: plan }
  },

  updatePlan(id: string, patch: Partial<Plan>) {
    const current = state.plans.find((p) => p.id === id)
    if (!current) return { ok: false as const, error: 'План не найден.' }
    const nextDate = patch.date ?? current.date
    const nextTime = patch.time ?? current.time
    if (current.coverageProductId && isPastPlan(current.date, current.time)) {
      if (patch.date && patch.date !== current.date) {
        return {
          ok: false as const,
          error: 'Нельзя менять дату наступившего события, чтобы оформить защиту задним числом.',
        }
      }
    }
    if (current.coverageProductId && patch.date && isPastPlan(nextDate, nextTime)) {
      return { ok: false as const, error: 'Защищённый план нельзя перенести в прошлое.' }
    }
    const past = isPastPlan(nextDate, nextTime)
    setState((s) => ({
      ...s,
      plans: s.plans.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              id: p.id,
              createdAt: p.createdAt,
              lifecycle: past ? 'completed' : p.lifecycle === 'cancelled' ? 'cancelled' : 'upcoming',
              protectionStatus:
                past && p.protectionStatus !== 'protected' ? 'completed' : p.protectionStatus,
            }
          : p,
      ),
    }))
    notify('План обновлён', 'Изменения сохранены.', `/plans/${id}`)
    return { ok: true as const }
  },

  deletePlan(id: string) {
    setState((s) => ({ ...s, plans: s.plans.filter((p) => p.id !== id) }))
    notify('План удалён', 'Карточка больше не отображается в списке.', '/plans')
  },

  connectCoverage(planId: string, productId: string) {
    if (state.subscription.status === 'none') {
      return { ok: false as const, error: 'Сначала подключите подписку SafeDay.' }
    }
    const plan = state.plans.find((p) => p.id === planId)
    if (!plan) return { ok: false as const, error: 'План не найден.' }
    if (isPastPlan(plan.date, plan.time) || plan.lifecycle === 'completed') {
      return { ok: false as const, error: 'Нельзя оформить защиту на уже прошедшее событие.' }
    }
    const product = coverageCatalog.find((p) => p.id === productId)
    if (!product) return { ok: false as const, error: 'Продукт не найден.' }
    if (!product.categories.includes(plan.category)) {
      return { ok: false as const, error: 'Этот продукт не подходит к категории выбранного плана.' }
    }
    setState((s) => ({
      ...s,
      plans: s.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              protectionStatus: 'protected',
              coverageProductId: productId,
              coverageStartedAt: new Date().toISOString(),
            }
          : p,
      ),
    }))
    tx('coverage', `Оформлена защита: ${product.name}`, `План «${plan.title}». Демонстрационное покрытие.`, 0, planId)
    notify('Защита оформлена', `План «${plan.title}» теперь защищён.`, `/plans/${planId}`)
    return { ok: true as const }
  },

  connectSubscription() {
    const now = new Date()
    const alreadyHad = Boolean(state.subscription.startedAt) || state.support.payouts.length > 0
    setState((s) => ({
      ...s,
      subscription: {
        status: 'active',
        tariffId: subscriptionConfig.tariffId,
        startedAt: s.subscription.startedAt ?? now.toISOString(),
        nextPaymentAt: addMonthsISO(now, 1),
        endsAt: null,
        autoRenew: true,
        entryFeePaid: true,
      },
    }))
    if (!alreadyHad && !state.transactions.some((t) => t.type === 'entry_fee')) {
      tx('entry_fee', 'Вступительный платёж (демо)', subscriptionConfig.demoNote, -subscriptionConfig.entryFee)
    }
    tx(
      'subscription_connect',
      alreadyHad ? 'Подписка переоформлена' : 'Подписка SafeDay подключена',
      alreadyHad
        ? 'История обращений и лимит категории C сохранены.'
        : subscriptionConfig.demoNote,
      -subscriptionConfig.monthly,
    )
    notify(
      alreadyHad ? 'Подписка переоформлена' : 'SafeDay подключён',
      alreadyHad
        ? 'История и месячные ограничения программы поддержки не сброшены.'
        : 'Демонстрационная подписка активна. Реальных списаний нет.',
      '/subscription',
    )
    return { ok: true as const }
  },

  setAutoRenew(on: boolean) {
    if (state.subscription.status === 'none' && !state.subscription.startedAt) {
      return { ok: false as const, error: 'Подписка ещё не подключалась.' }
    }
    setState((s) => ({
      ...s,
      subscription: {
        ...s.subscription,
        autoRenew: on,
        status: on ? 'active' : 'cancelled',
        endsAt: on ? null : addMonthsISO(new Date(), 1),
        nextPaymentAt: on ? addMonthsISO(new Date(), 1) : s.subscription.nextPaymentAt,
      },
    }))
    tx(
      'settings',
      on ? 'Автопродление включено' : 'Автопродление отключено',
      on ? 'Следующий демоплатёж запланирован.' : 'Доступ сохранится до конца оплаченного периода (демо).',
      null,
    )
    notify(
      on ? 'Автопродление включено' : 'Автопродление отключено',
      on ? 'Подписка снова активна.' : 'Статус и дата окончания обновлены.',
      '/subscription',
    )
    return { ok: true as const }
  },

  saveClaimDraft(input: Partial<Claim> & { category: ClaimCategory }) {
    const id = input.id ?? uid('CLM')
    const existing = state.claims.find((c) => c.id === id)
    const claim: Claim = {
      id,
      type: input.type || 'Обращение',
      category: input.category,
      planId: input.planId ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eventDate: input.eventDate || '',
      description: input.description || '',
      requestedAmount: input.requestedAmount ?? null,
      attachments: input.attachments ?? existing?.attachments ?? [],
      extraInfo: input.extraInfo || '',
      status: 'draft',
      timeline: existing?.timeline?.length
        ? existing.timeline
        : [
            {
              id: uid('TL'),
              at: new Date().toISOString(),
              title: 'Черновик создан',
              detail: 'Заявка сохранена локально и ещё не отправлена на рассмотрение.',
            },
          ],
      decision: null,
      decisionComment: null,
      approvedAmount: null,
      demoScenario: input.demoScenario ?? null,
    }
    setState((s) => ({
      ...s,
      claims: existing ? s.claims.map((c) => (c.id === id ? claim : c)) : [claim, ...s.claims],
    }))
    notify('Черновик сохранён', 'Вы можете вернуться к заполнению позже.', `/claims/${id}`)
    return { ok: true as const, data: claim }
  },

  submitClaim(input: {
    id?: string
    category: ClaimCategory
    planId: string | null
    type: string
    eventDate: string
    description: string
    requestedAmount: number | null
    attachments: DemoAttachment[]
    extraInfo: string
    demoScenario: string | null
  }) {
    if (!input.type.trim()) return { ok: false as const, error: 'Укажите тип обращения.' }
    if (!input.eventDate) return { ok: false as const, error: 'Укажите дату события.' }
    if (!input.description.trim() || input.description.trim().length < 12) {
      return { ok: false as const, error: 'Опишите обстоятельства — не менее 12 символов.' }
    }
    if (state.subscription.status === 'none' && (input.category === 'A' || input.category === 'B')) {
      return { ok: false as const, error: 'Для категорий A и B сначала подключите подписку SafeDay.' }
    }
    if (input.category !== 'C' && !input.planId) {
      return { ok: false as const, error: 'Выберите связанный план.' }
    }
    const plan = input.planId ? state.plans.find((p) => p.id === input.planId) : null
    if (input.category !== 'C' && plan && plan.protectionStatus !== 'protected') {
      return { ok: false as const, error: 'Для категорий A и B нужен защищённый план.' }
    }
    if (input.category === 'B' && input.attachments.length === 0) {
      return { ok: false as const, error: 'Для категории B приложите демонстрационное подтверждение.' }
    }
    if (input.category === 'C') {
      const evalC = evaluateCategoryC(state, input.requestedAmount, input.id)
      if (!evalC.ok) return evalC
    }

    const id = input.id ?? uid('CLM')
    const existing = state.claims.find((c) => c.id === id)
    const now = new Date().toISOString()
    const timeline = [
      ...(existing?.timeline ?? []),
      {
        id: uid('TL'),
        at: now,
        title: 'Отправлено',
        detail: 'Обращение принято в демонстрационный контур. Это не решение страховщика.',
      },
    ]

    let status: Claim['status'] = 'submitted'
    let decision: string | null = null
    let decisionComment: string | null = null
    let approvedAmount: number | null = null
    const extraTimeline = [...timeline]
    const service = serviceStateFromTrust(state.trust)

    if (input.category === 'A') {
      const auto = input.demoScenario === demoScenarios.categoryA.id
      extraTimeline.push({
        id: uid('TL'),
        at: now,
        title: auto ? 'Автоматическая проверка' : 'Проверка по категории A',
        detail: auto
          ? 'Тестовое событие подтверждено демодвижком. Решение учебное.'
          : service === 'accelerated'
            ? 'Событие принято в ускоренное рассмотрение. В демо оно остаётся на проверке.'
            : 'Требуется сверка с допустимыми подтверждениями.',
      })
      if (auto) {
        status = 'approved'
        decision = 'approved'
        approvedAmount = Math.min(plan ? Math.round(plan.expectedCost * 0.3) || 3500 : 3500, 8000)
        decisionComment =
          'Демонстрационное одобрение тестового сценария категории A. Зачисление отражено только в журнале MVP.'
        extraTimeline.push({
          id: uid('TL'),
          at: now,
          title: 'Одобрено (демо)',
          detail: decisionComment,
        })
      } else {
        status = 'review'
      }
    } else if (input.category === 'B') {
      status = 'need_info'
      extraTimeline.push({
        id: uid('TL'),
        at: now,
        title: 'Нужны дополнительные данные',
        detail: 'Типовой демосценарий категории B: заявка принята, требуется уточнение. Отправка и одобрение — разные этапы.',
      })
    } else {
      const evalC = evaluateCategoryC(state, input.requestedAmount, input.id)
      if (!evalC.ok) return evalC
      status = 'review'
      extraTimeline.push({
        id: uid('TL'),
        at: now,
        title: 'Принято в программу поддержки',
        detail: `${evalC.note} Рассмотрение индивидуальное, одобрение не гарантировано.`,
      })
    }

    const claim: Claim = {
      id,
      type: input.type,
      category: input.category,
      planId: input.planId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      eventDate: input.eventDate,
      description: input.description,
      requestedAmount: input.requestedAmount,
      attachments: input.attachments,
      extraInfo: input.extraInfo,
      status,
      timeline: extraTimeline,
      decision,
      decisionComment,
      approvedAmount,
      demoScenario: input.demoScenario,
    }

    setState((s) => ({
      ...s,
      claims: existing ? s.claims.map((c) => (c.id === id ? claim : c)) : [claim, ...s.claims],
      trust: {
        ...s.trust,
        usageScore: s.trust.usageScore + 1,
        confirmedClaims: status === 'approved' ? s.trust.confirmedClaims + 1 : s.trust.confirmedClaims,
      },
    }))

    tx('claim', `Обращение ${id}`, `Категория ${input.category}. Статус: отправлено.`, null, id)
    if (status === 'approved' && approvedAmount) {
      tx(
        'claim_decision',
        'Демонстрационное зачисление',
        'Учебная запись журнала. Денежные средства не переводятся.',
        approvedAmount,
        id,
      )
    }
    notify(
      status === 'approved' ? 'Обращение одобрено (демо)' : 'Обращение отправлено',
      status === 'need_info'
        ? 'Нужны дополнительные сведения — откройте карточку обращения.'
        : 'Статус обновлён. Решение и отправка — разные этапы.',
      `/claims/${id}`,
    )
    return { ok: true as const, data: claim }
  },

  continueClaim(id: string, extraInfo: string) {
    const claim = state.claims.find((c) => c.id === id)
    if (!claim) return { ok: false as const, error: 'Обращение не найдено.' }
    if (claim.status !== 'need_info' && claim.status !== 'draft') {
      return { ok: false as const, error: 'Сейчас нельзя дополнить это обращение.' }
    }
    if (extraInfo.trim().length < 8) {
      return { ok: false as const, error: 'Добавьте пояснение — не менее 8 символов.' }
    }
    const now = new Date().toISOString()
    const nextStatus: Claim['status'] = claim.category === 'B' ? 'review' : 'review'
    setState((s) => ({
      ...s,
      claims: s.claims.map((c) =>
        c.id === id
          ? {
              ...c,
              extraInfo: `${c.extraInfo}\n${extraInfo}`.trim(),
              status: nextStatus,
              updatedAt: now,
              timeline: [
                ...c.timeline,
                {
                  id: uid('TL'),
                  at: now,
                  title: 'Дополнительные данные получены',
                  detail: 'Заявка возвращена на проверку. Одобрение по-прежнему не автоматическое.',
                },
              ],
            }
          : c,
      ),
    }))
    notify('Данные отправлены', 'Обращение снова на проверке.', `/claims/${id}`)
    return { ok: true as const }
  },

  resolveSupportC(id: string, approve: boolean) {
    const claim = state.claims.find((c) => c.id === id)
    if (!claim || claim.category !== 'C') return { ok: false as const, error: 'Обращение поддержки не найдено.' }
    if (claim.status === 'approved' || claim.status === 'rejected' || claim.status === 'completed') {
      return { ok: false as const, error: 'По этому обращению уже есть решение.' }
    }
    const now = new Date().toISOString()
    if (!approve) {
      setState((s) => ({
        ...s,
        claims: s.claims.map((c) =>
          c.id === id
            ? {
                ...c,
                status: 'rejected' as const,
                decision: 'rejected',
                decisionComment: 'Демонстрационный отказ. Подача не равна одобрению.',
                updatedAt: now,
                timeline: [
                  ...c.timeline,
                  { id: uid('TL'), at: now, title: 'Отклонено', detail: 'Индивидуальное рассмотрение завершено отказом (демо).' },
                ],
              }
            : c,
        ),
      }))
      tx('support_c', 'Решение по поддержке: отказ', 'Демонстрационная запись.', null, id)
      return { ok: true as const }
    }
    const evalC = evaluateCategoryC(state, claim.requestedAmount, claim.id)
    if (!evalC.ok) return evalC
    setState((s) => ({
      ...s,
      user: { ...s.user, isNewClient: false },
      claims: s.claims.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'approved' as const,
              decision: 'approved',
              approvedAmount: evalC.amount,
              decisionComment: evalC.note,
              updatedAt: now,
              timeline: [
                ...c.timeline,
                {
                  id: uid('TL'),
                  at: now,
                  title: 'Поддержка одобрена (демо)',
                  detail: `${evalC.note} Сумма отражена только в журнале приложения.`,
                },
              ],
            }
          : c,
      ),
      support: {
        totalPaid: s.support.totalPaid + evalC.amount,
        payouts: [
          ...s.support.payouts,
          { id: uid('C'), month: monthKey(), amount: evalC.amount, at: now, claimId: id },
        ],
      },
    }))
    tx('support_c', 'Демонстрационная поддержка', evalC.note, evalC.amount, id)
    notify('Поддержка одобрена (демо)', `В журнале отражена сумма. Это не банковский перевод.`, `/claims/${id}`)
    return { ok: true as const }
  },

  markNotificationRead(id: string) {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }))
  },

  markAllRead() {
    setState((s) => ({
      ...s,
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }))
  },

  simulateMonthlyCharge() {
    if (state.subscription.status === 'none') {
      return { ok: false as const, error: 'Сначала подключите подписку.' }
    }
    tx(
      'monthly_charge',
      'Ежемесячное списание (демо)',
      'Учебная запись журнала. Банковского списания нет.',
      -subscriptionConfig.monthly,
    )
    setState((s) => ({
      ...s,
      subscription: {
        ...s.subscription,
        nextPaymentAt: addMonthsISO(new Date(), 1),
      },
    }))
    notify('Демоплатёж отражён', 'В истории появилось ежемесячное списание. Реальных денег нет.', '/history')
    return { ok: true as const }
  },

  copiedReferralLink() {
    notify('Ссылка скопирована', 'Демонстрационная реферальная ссылка скопирована в буфер обмена.', '/referral')
  },

  simulateInvite() {
    const invite = {
      id: uid('INV'),
      label: `Демо-приглашение ${state.referral.invites.length + 1}`,
      status: 'invited' as const,
      at: new Date().toISOString(),
    }
    setState((s) => ({ ...s, referral: { ...s.referral, invites: [invite, ...s.referral.invites] } }))
    tx('referral', 'Симулировано приглашение', 'Demo-инструмент. Реальных регистраций нет.', null)
    notify('Приглашение добавлено', 'Это учебная запись реферальной программы.', '/referral')
  },

  simulateActivation() {
    const pending = state.referral.invites.find((i) => i.status === 'invited')
    if (!pending) {
      this.simulateInvite()
    }
    setState((s) => {
      const idx = s.referral.invites.findIndex((i) => i.status === 'invited')
      if (idx < 0) return s
      const copy = [...s.referral.invites]
      copy[idx] = { ...copy[idx], status: 'activated' }
      return { ...s, referral: { ...s.referral, invites: copy } }
    })
    tx('referral', 'Симулирована активация', 'Не влияет на страховую выплату и не подтверждает событие.', null)
    notify('Активация (демо)', 'Счётчик активированных приглашений обновлён.', '/referral')
  },

  validateAttachment(file: File) {
    const okType = fileUploadConfig.accept.includes(file.type) || file.type === ''
    if (!okType && !/\.(pdf|png|jpe?g|webp)$/i.test(file.name)) {
      return { ok: false as const, error: 'Допустимы PDF, JPG, PNG и WEBP.' }
    }
    if (file.size > fileUploadConfig.maxSizeMb * 1024 * 1024) {
      return { ok: false as const, error: `Файл больше ${fileUploadConfig.maxSizeMb} МБ.` }
    }
    return {
      ok: true as const,
      data: { id: uid('FILE'), name: file.name, mime: file.type || 'application/octet-stream', size: file.size },
    }
  },
}

export function referralLink(code: string) {
  if (typeof window === 'undefined') return `https://safeday.demo/r/${code}`
  return `${window.location.origin}/?ref=${encodeURIComponent(code)}`
}
