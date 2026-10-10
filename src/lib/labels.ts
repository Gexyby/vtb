import type {
  ClaimCategory,
  ClaimStatus,
  PlanCategory,
  ProtectionStatus,
  ServiceState,
  SubscriptionStatus,
  TransactionType,
} from './types'

export const planCategoryLabel: Record<PlanCategory, string> = {
  travel: 'Путешествия',
  event: 'Мероприятия',
  work: 'Работа',
  study: 'Учёба',
  auto: 'Автомобиль',
  personal: 'Личные события',
  other: 'Другое',
}

export const protectionLabel: Record<ProtectionStatus, string> = {
  protected: 'Защищён',
  unprotected: 'Не защищён',
  pending: 'Ожидает оформления',
  completed: 'Завершён',
}

export const claimStatusLabel: Record<ClaimStatus, string> = {
  draft: 'Черновик',
  submitted: 'Отправлено',
  review: 'На проверке',
  need_info: 'Нужны дополнительные данные',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  completed: 'Завершено',
}

export const claimCategoryLabel: Record<ClaimCategory, string> = {
  A: 'Категория A',
  B: 'Категория B',
  C: 'Программа поддержки SafeDay',
}

export const claimCategoryHint: Record<ClaimCategory, string> = {
  A: 'Объективно подтверждаемые события. Возможна автоматическая проверка.',
  B: 'События, которые требуют дополнительных подтверждений.',
  C: 'Индивидуальная поддержка. Подача обращения не означает автоматического одобрения.',
}

export const serviceStateLabel: Record<ServiceState, string> = {
  standard: 'Стандартное обслуживание',
  accelerated: 'Ускоренное рассмотрение',
  need_info: 'Требуются дополнительные сведения',
}

export const subscriptionLabel: Record<SubscriptionStatus, string> = {
  none: 'Не подключена',
  active: 'Активна',
  cancelled: 'Автопродление отключено',
}

export const transactionLabel: Record<TransactionType, string> = {
  subscription_connect: 'Подключение подписки',
  monthly_charge: 'Ежемесячное списание (демо)',
  entry_fee: 'Вступительный платёж (демо)',
  coverage: 'Оформление покрытия',
  claim: 'Обращение',
  claim_decision: 'Решение по обращению',
  support_c: 'Программа поддержки',
  referral: 'Реферальная программа',
  settings: 'Настройки',
}

export const planCategories = Object.keys(planCategoryLabel) as PlanCategory[]
