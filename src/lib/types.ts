export const DATA_VERSION = 1

export type DemoMode = 'seeded' | 'empty'

export type PlanCategory =
  | 'travel'
  | 'event'
  | 'work'
  | 'study'
  | 'auto'
  | 'personal'
  | 'other'

export type ProtectionStatus = 'protected' | 'unprotected' | 'pending' | 'completed'

export type PlanLifecycle = 'upcoming' | 'completed' | 'cancelled'

export type ClaimCategory = 'A' | 'B' | 'C'
export type ClaimStatus =
  | 'draft'
  | 'submitted'
  | 'review'
  | 'need_info'
  | 'approved'
  | 'rejected'
  | 'completed'

export type SubscriptionStatus = 'none' | 'active' | 'cancelled'
export type ServiceState = 'standard' | 'accelerated' | 'need_info'
export type ThemePreference = 'light' | 'dark' | 'system'

export type TransactionType =
  | 'subscription_connect'
  | 'monthly_charge'
  | 'entry_fee'
  | 'coverage'
  | 'claim'
  | 'claim_decision'
  | 'support_c'
  | 'referral'
  | 'settings'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  joinedAt: string
  isNewClient: boolean
}

export interface Plan {
  id: string
  title: string
  category: PlanCategory
  date: string
  time: string
  location: string
  description: string
  expectedCost: number
  protectionStatus: ProtectionStatus
  coverageProductId: string | null
  coverageStartedAt: string | null
  lifecycle: PlanLifecycle
  createdAt: string
  notes: string
}

export interface CoverageProduct {
  id: string
  name: string
  short: string
  categories: PlanCategory[]
  eventCategories: ClaimCategory[]
  limits: string
  duration: string
  payoutLimit: number
  price: number
  confirmation: string
  exclusions: string[]
  details: string
}

export interface DemoAttachment {
  id: string
  name: string
  mime: string
  size: number
}

export interface TimelineEvent {
  id: string
  at: string
  title: string
  detail: string
}

export interface Claim {
  id: string
  type: string
  category: ClaimCategory
  planId: string | null
  createdAt: string
  updatedAt: string
  eventDate: string
  description: string
  requestedAmount: number | null
  attachments: DemoAttachment[]
  extraInfo: string
  status: ClaimStatus
  timeline: TimelineEvent[]
  decision: string | null
  decisionComment: string | null
  approvedAmount: number | null
  demoScenario: string | null
}

export interface Subscription {
  status: SubscriptionStatus
  tariffId: string
  startedAt: string | null
  nextPaymentAt: string | null
  endsAt: string | null
  autoRenew: boolean
  entryFeePaid: boolean
}

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  details: string
  amount: number | null
  createdAt: string
  relatedId: string | null
}

export interface ReferralInvite {
  id: string
  label: string
  status: 'invited' | 'activated'
  at: string
}

export interface ReferralProgram {
  code: string
  invites: ReferralInvite[]
}

export interface AppNotification {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
  href?: string
}

export interface ConsentSettings {
  extraData: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  smsNotifications: boolean
}

export interface TrustInputs {
  tenureMonths: number
  confirmedClaims: number
  contradictions: number
  violations: number
  usageScore: number
}

export interface CategoryCPayout {
  id: string
  month: string
  amount: number
  at: string
  claimId: string
}

export interface SupportState {
  payouts: CategoryCPayout[]
  totalPaid: number
}

export interface AppState {
  version: number
  session: boolean
  onboarded: boolean
  demoMode: DemoMode | null
  user: UserProfile
  plans: Plan[]
  claims: Claim[]
  subscription: Subscription
  transactions: Transaction[]
  notifications: AppNotification[]
  referral: ReferralProgram
  consents: ConsentSettings
  trust: TrustInputs
  support: SupportState
  theme: ThemePreference
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }
