import { subscriptionConfig } from './config'
import { addMonthsISO, todayISO } from './format'
import { uid } from './ids'
import { DATA_VERSION, type AppState, type UserProfile } from './types'

function plusDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  const z = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

export function emptyUser(): UserProfile {
  return {
    id: uid('USR'),
    firstName: 'Демо',
    lastName: 'Клиент',
    email: 'demo.client@safeday.test',
    phone: '+7 900 000-00-00',
    city: 'Москва',
    joinedAt: new Date().toISOString(),
    isNewClient: true,
  }
}

export function seededUser(): UserProfile {
  return {
    id: 'USR-ANNA',
    firstName: 'Анна',
    lastName: 'Соколова',
    email: 'anna.sokolova@safeday.test',
    phone: '+7 925 111-22-33',
    city: 'Москва',
    joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    isNewClient: false,
  }
}

function blankSubscription(): AppState['subscription'] {
  return {
    status: 'none',
    tariffId: subscriptionConfig.tariffId,
    startedAt: null,
    nextPaymentAt: null,
    endsAt: null,
    autoRenew: false,
    entryFeePaid: false,
  }
}

export function createEmptyState(): AppState {
  const user = emptyUser()
  return {
    version: DATA_VERSION,
    session: false,
    onboarded: false,
    demoMode: null,
    user,
    plans: [],
    claims: [],
    subscription: blankSubscription(),
    transactions: [],
    notifications: [],
    referral: { code: `SAFE-${user.id.slice(-4)}`, invites: [] },
    consents: {
      extraData: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    trust: {
      tenureMonths: 0,
      confirmedClaims: 0,
      contradictions: 0,
      violations: 0,
      usageScore: 4,
    },
    support: { payouts: [], totalPaid: 0 },
    theme: 'light',
  }
}

export function createSeededState(): AppState {
  const user = seededUser()
  const started = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20)
  const tripId = 'PLN-KZN'
  const concertId = 'PLN-CONCERT'
  const workId = 'PLN-SPB'
  const studyId = 'PLN-EXAM'

  const now = new Date().toISOString()

  return {
    version: DATA_VERSION,
    session: true,
    onboarded: true,
    demoMode: 'seeded',
    user,
    plans: [
      {
        id: tripId,
        title: 'Поездка в Казань',
        category: 'travel',
        date: plusDays(18),
        time: '08:40',
        location: 'Казань',
        description: 'Семейная поездка на выходные. Билеты куплены заранее.',
        expectedCost: 28600,
        protectionStatus: 'protected',
        coverageProductId: 'trip-protect',
        coverageStartedAt: started.toISOString(),
        lifecycle: 'upcoming',
        createdAt: started.toISOString(),
        notes: 'Демонстрационный защищённый план.',
      },
      {
        id: concertId,
        title: 'Концерт в Москва-Сити',
        category: 'event',
        date: plusDays(9),
        time: '19:30',
        location: 'Москва, «Башня Федерация»',
        description: 'Билеты на двоих, без оформленной защиты.',
        expectedCost: 7400,
        protectionStatus: 'unprotected',
        coverageProductId: null,
        coverageStartedAt: null,
        lifecycle: 'upcoming',
        createdAt: now,
        notes: '',
      },
      {
        id: workId,
        title: 'Командировка в Санкт-Петербург',
        category: 'work',
        date: plusDays(4),
        time: '06:15',
        location: 'Санкт-Петербург',
        description: 'Важная встреча с партнёрами. Нужна защита на случай транспортного сбоя.',
        expectedCost: 15200,
        protectionStatus: 'pending',
        coverageProductId: null,
        coverageStartedAt: null,
        lifecycle: 'upcoming',
        createdAt: now,
        notes: 'Клиент рассматривает оформление.',
      },
      {
        id: studyId,
        title: 'Сессия: итоговый экзамен',
        category: 'study',
        date: plusDays(25),
        time: '10:00',
        location: 'НИУ ВШЭ, Москва',
        description: 'Очный экзамен. При срыве транспорта нужна поддержка по правилам сервиса.',
        expectedCost: 0,
        protectionStatus: 'unprotected',
        coverageProductId: null,
        coverageStartedAt: null,
        lifecycle: 'upcoming',
        createdAt: now,
        notes: '',
      },
    ],
    claims: [],
    subscription: {
      status: 'active',
      tariffId: subscriptionConfig.tariffId,
      startedAt: started.toISOString(),
      nextPaymentAt: addMonthsISO(started, 1),
      endsAt: null,
      autoRenew: true,
      entryFeePaid: true,
    },
    transactions: [
      {
        id: uid('TX'),
        type: 'entry_fee',
        title: 'Вступительный платёж SafeDay',
        details: 'Демонстрационное зачисление в журнале MVP.',
        amount: -subscriptionConfig.entryFee,
        createdAt: started.toISOString(),
        relatedId: null,
      },
      {
        id: uid('TX'),
        type: 'subscription_connect',
        title: 'Подключена подписка SafeDay Стандарт',
        details: 'Деморежим. Реального списания нет.',
        amount: -subscriptionConfig.monthly,
        createdAt: started.toISOString(),
        relatedId: null,
      },
      {
        id: uid('TX'),
        type: 'coverage',
        title: 'Оформлена защита поездки',
        details: 'План «Поездка в Казань»',
        amount: 0,
        createdAt: started.toISOString(),
        relatedId: tripId,
      },
      {
        id: uid('TX'),
        type: 'monthly_charge',
        title: 'Ежемесячное списание SafeDay (демо)',
        details: 'Учебная запись. Банковского списания нет.',
        amount: -subscriptionConfig.monthly,
        createdAt: new Date(started.getTime() + 1000 * 60 * 60 * 24 * 18).toISOString(),
        relatedId: null,
      },
    ],
    notifications: [
      {
        id: uid('NTF'),
        title: 'Деморежим включён',
        body: 'Вы вошли как Анна Соколова. Данные учебные, банковские системы не подключены.',
        createdAt: now,
        read: false,
        href: '/overview',
      },
      {
        id: uid('NTF'),
        title: 'Есть незащищённый план',
        body: 'Для концерта в Москва-Сити ещё не подобрана защита.',
        createdAt: now,
        read: false,
        href: '/plans/PLN-CONCERT',
      },
    ],
    referral: {
      code: 'SAFE-ANNA-7K2',
      invites: [
        {
          id: uid('INV'),
          label: 'Демо-приглашение (не активировано)',
          status: 'invited',
          at: plusDays(-5) + 'T12:00:00.000Z',
        },
      ],
    },
    consents: {
      extraData: true,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    },
    trust: {
      tenureMonths: 1,
      confirmedClaims: 0,
      contradictions: 0,
      violations: 0,
      usageScore: 12,
    },
    support: { payouts: [], totalPaid: 0 },
    theme: 'light',
  }
}

export function migrateState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Partial<AppState>
  const base = createEmptyState()
  try {
    return {
      ...base,
      ...s,
      version: DATA_VERSION,
      user: { ...base.user, ...s.user },
      plans: Array.isArray(s.plans) ? s.plans : [],
      claims: Array.isArray(s.claims) ? s.claims : [],
      subscription: { ...base.subscription, ...s.subscription },
      transactions: Array.isArray(s.transactions) ? s.transactions : [],
      notifications: Array.isArray(s.notifications) ? s.notifications : [],
      referral: {
        code: s.referral?.code || base.referral.code,
        invites: Array.isArray(s.referral?.invites) ? s.referral!.invites : [],
      },
      consents: { ...base.consents, ...s.consents },
      trust: { ...base.trust, ...s.trust },
      support: {
        payouts: Array.isArray(s.support?.payouts) ? s.support!.payouts : [],
        totalPaid: s.support?.totalPaid ?? 0,
      },
      theme: s.theme ?? 'light',
      session: Boolean(s.session),
      onboarded: Boolean(s.onboarded),
      demoMode: s.demoMode ?? null,
    }
  } catch {
    return null
  }
}

export { todayISO }
