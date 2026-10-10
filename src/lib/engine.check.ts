import assert from 'node:assert/strict'
import { computeTrustScore, evaluateCategoryC, maxFirstSupport, serviceStateFromTrust } from './engine'
import { subscriptionConfig, supportConfig } from './config'
import { createEmptyState, createSeededState } from './seed'

const firstCap = maxFirstSupport()
assert.equal(firstCap, Math.floor(subscriptionConfig.entryFee * supportConfig.firstPayoutPercent))
assert.ok(firstCap <= subscriptionConfig.entryFee * 0.8)

const empty = createEmptyState()
empty.session = true
empty.subscription.status = 'active'
empty.subscription.entryFeePaid = true
empty.user.isNewClient = true

const first = evaluateCategoryC(empty, 10_000)
assert.equal(first.ok, true)
if (first.ok) {
  assert.ok(first.amount <= firstCap, 'первая поддержка нового клиента не должна превышать 80% вступительного платежа')
}

empty.support.payouts.push({
  id: 'C-1',
  month: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
  amount: first.ok ? first.amount : 0,
  at: new Date().toISOString(),
  claimId: 'CLM-1',
})
empty.support.totalPaid = first.ok ? first.amount : 0

const second = evaluateCategoryC(empty, 100)
assert.equal(second.ok, false)

const afterReup = { ...empty, subscription: { ...empty.subscription, startedAt: new Date().toISOString() } }
const stillBlocked = evaluateCategoryC(afterReup, 100)
assert.equal(stillBlocked.ok, false, 'переоформление не сбрасывает месячный лимит C')

const pending = createEmptyState()
pending.subscription.status = 'active'
pending.user.isNewClient = true
pending.claims.push({
  id: 'CLM-OPEN',
  type: 'Поддержка',
  category: 'C',
  planId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  eventDate: new Date().toISOString().slice(0, 10),
  description: 'Открытое обращение поддержки в этом месяце',
  requestedAmount: 200,
  attachments: [],
  extraInfo: '',
  status: 'review',
  timeline: [],
  decision: null,
  decisionComment: null,
  approvedAmount: null,
  demoScenario: null,
})
const blockedByOpen = evaluateCategoryC(pending, 200)
assert.equal(blockedByOpen.ok, false, 'повторная подача C в том же месяце блокируется до выплаты')
const resolveOpen = evaluateCategoryC(pending, 200, 'CLM-OPEN')
assert.equal(resolveOpen.ok, true, 'рассмотрение текущего обращения C не блокируется собственным лимитом подачи')

const trustLow = serviceStateFromTrust({
  tenureMonths: 0,
  confirmedClaims: 0,
  contradictions: 0,
  violations: 0,
  usageScore: 1,
})
assert.equal(trustLow, 'standard')

const trustNeed = serviceStateFromTrust({
  tenureMonths: 12,
  confirmedClaims: 4,
  contradictions: 1,
  violations: 0,
  usageScore: 20,
})
assert.equal(trustNeed, 'need_info')

assert.ok(computeTrustScore({ tenureMonths: 12, confirmedClaims: 3, contradictions: 0, violations: 0, usageScore: 10 }) >= 70)

const seeded = createSeededState()
assert.ok(seeded.plans.some((p) => p.protectionStatus === 'protected'))
assert.ok(seeded.plans.some((p) => p.protectionStatus === 'unprotected'))

console.log('engine checks passed')
