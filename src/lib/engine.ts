import { subscriptionConfig, supportConfig, trustConfig } from './config'
import type { AppState, ServiceState, TrustInputs } from './types'

export function computeTrustScore(input: TrustInputs) {
  const raw =
    input.tenureMonths * 4 +
    input.confirmedClaims * 10 +
    input.usageScore * 3 -
    input.contradictions * 15 -
    input.violations * 25
  return Math.max(0, Math.min(100, raw))
}

export function serviceStateFromTrust(input: TrustInputs): ServiceState {
  if (
    input.violations >= trustConfig.needInfoIfViolations ||
    input.contradictions >= trustConfig.needInfoIfContradictions
  ) {
    return 'need_info'
  }
  if (computeTrustScore(input) >= trustConfig.acceleratedFrom) {
    return 'accelerated'
  }
  return 'standard'
}

export function loyaltyLevel(tenureMonths: number) {
  const sorted = [...supportConfig.loyalty].sort((a, b) => b.minMonths - a.minMonths)
  return sorted.find((l) => tenureMonths >= l.minMonths) ?? supportConfig.loyalty[0]
}

export function maxFirstSupport() {
  return Math.floor(subscriptionConfig.entryFee * supportConfig.firstPayoutPercent)
}

export function evaluateCategoryC(state: AppState, requested: number | null, exceptClaimId?: string) {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthlyCount = state.support.payouts.filter((p) => p.month === month).length
  const monthlyRequests = state.claims.filter(
    (c) =>
      c.category === 'C' &&
      c.id !== exceptClaimId &&
      c.status !== 'draft' &&
      c.status !== 'rejected' &&
      c.createdAt.slice(0, 7) === month,
  ).length

  if (state.subscription.status === 'none') {
    return {
      ok: false as const,
      error:
        'Программа поддержки доступна после подключения SafeDay. Оформите подписку, затем подайте обращение.',
    }
  }

  if (monthlyCount >= supportConfig.monthlyLimit || monthlyRequests >= supportConfig.monthlyLimit) {
    return {
      ok: false as const,
      error: `В этом календарном месяце уже использован лимит программы поддержки (${supportConfig.monthlyLimit}). Следующее обращение — в новом месяце.`,
    }
  }

  if (state.support.totalPaid >= supportConfig.globalCap) {
    return {
      ok: false as const,
      error: 'Достигнут общий демонстрационный лимит программы поддержки.',
    }
  }

  const firstCap = maxFirstSupport()
  const loyalty = loyaltyLevel(state.trust.tenureMonths)
  const remainingGlobal = supportConfig.globalCap - state.support.totalPaid
  let amount = requested && requested > 0 ? requested : supportConfig.defaultAmount

  amount = Math.min(amount, loyalty.cap, remainingGlobal)

  const isFirstPayout = state.support.payouts.length === 0
  if (state.user.isNewClient && isFirstPayout) {
    amount = Math.min(amount, firstCap)
  }

  amount = Math.max(0, Math.floor(amount))
  if (amount <= 0) {
    return {
      ok: false as const,
      error: 'Рассчитанный размер поддержки равен нулю. Проверьте лимиты программы.',
    }
  }

  return {
    ok: true as const,
    amount,
    month,
    firstCap,
    loyalty,
    note:
      state.user.isNewClient && isFirstPayout
        ? `Для нового клиента первая поддержка не превышает ${Math.round(supportConfig.firstPayoutPercent * 100)}% вступительного платежа.`
        : `Уровень программы лояльности: ${loyalty.name}. Это не страховая выплата.`,
  }
}
