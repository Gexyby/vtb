'use client'

import { FileText } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  FileUpload,
  Input,
  PageMotion,
  Select,
  Textarea,
  Timeline,
} from '@/components/ui'
import { demoScenarios, fileUploadConfig, supportConfig } from '@/lib/config'
import { evaluateCategoryC, maxFirstSupport } from '@/lib/engine'
import { money } from '@/lib/format'
import { claimCategoryHint, claimCategoryLabel, claimStatusLabel } from '@/lib/labels'
import { getState, store, useAppState } from '@/lib/store'
import { pushToast } from '@/lib/toast'
import type { ClaimCategory, ClaimStatus, DemoAttachment } from '@/lib/types'

const tone: Record<ClaimStatus, 'slate' | 'blue' | 'green' | 'amber' | 'rose' | 'violet'> = {
  draft: 'slate',
  submitted: 'blue',
  review: 'violet',
  need_info: 'amber',
  approved: 'green',
  rejected: 'rose',
  completed: 'slate',
}

export function ClaimsScreen() {
  const s = useAppState()
  const [q, setQ] = useState('')
  const [st, setSt] = useState<'all' | ClaimStatus>('all')
  const [cat, setCat] = useState<'all' | ClaimCategory>('all')
  const list = useMemo(
    () =>
      s.claims
        .filter(
          (c) =>
            c.type.toLowerCase().includes(q.toLowerCase()) ||
            c.id.toLowerCase().includes(q.toLowerCase()) ||
            c.description.toLowerCase().includes(q.toLowerCase()),
        )
        .filter((c) => st === 'all' || c.status === st)
        .filter((c) => cat === 'all' || c.category === cat),
    [s.claims, q, st, cat],
  )
  return (
    <PageMotion>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Обращения</h1>
          <p className="text-sm text-slate-500">Категории A, B и программа поддержки C. Решения учебные.</p>
        </div>
        <Link href="/claims/new">
          <Button>Новое обращение</Button>
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Input placeholder="Поиск по типу, описанию или ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={st} onChange={(e) => setSt(e.target.value as typeof st)}>
          <option value="all">Все статусы</option>
          {Object.entries(claimStatusLabel).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)}>
          <option value="all">Все категории</option>
          <option value="A">Категория A</option>
          <option value="B">Категория B</option>
          <option value="C">Программа поддержки</option>
        </Select>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Обращений нет"
          text="После отправки заявки она появится здесь со статусом и таймлайном."
          action={
            <Link href="/claims/new">
              <Button>Создать обращение</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <Link key={c.id} href={`/claims/${c.id}`}>
              <Card hover className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{c.type}</p>
                  <p className="text-xs text-slate-500">
                    {c.id} · {claimCategoryLabel[c.category]}
                  </p>
                </div>
                <Badge tone={tone[c.status]}>{claimStatusLabel[c.status]}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </PageMotion>
  )
}

export function ClaimFormScreen() {
  const s = useAppState()
  const router = useRouter()
  const params = useSearchParams()
  const paramCategory = params.get('category')
  const draftId = params.get('draftId')
  const [claimId, setClaimId] = useState<string | undefined>(draftId || undefined)
  const [category, setCategory] = useState<ClaimCategory>(
    paramCategory === 'A' || paramCategory === 'B' || paramCategory === 'C' ? paramCategory : 'A',
  )
  const [planId, setPlanId] = useState(params.get('planId') || '')
  const [type, setType] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [extra, setExtra] = useState('')
  const [files, setFiles] = useState<DemoAttachment[]>([])
  const [scenario, setScenario] = useState(demoScenarios.categoryA.id)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const evalC = evaluateCategoryC(s, amount ? Number(amount) : null, claimId)
  const protectedPlans = s.plans.filter((p) => p.protectionStatus === 'protected')

  useEffect(() => {
    if (!draftId) return
    const c = getState().claims.find((x) => x.id === draftId)
    if (!c) return
    setClaimId(c.id)
    setCategory(c.category)
    setPlanId(c.planId || '')
    setType(c.type)
    setEventDate(c.eventDate)
    setDescription(c.description)
    setAmount(c.requestedAmount != null ? String(c.requestedAmount) : '')
    setExtra(c.extraInfo)
    setFiles(c.attachments)
    if (c.demoScenario) setScenario(c.demoScenario)
  }, [draftId])

  function validate() {
    const e: Record<string, string> = {}
    if (!type.trim()) e.type = 'Укажите тип'
    if (!eventDate) e.eventDate = 'Укажите дату события'
    if (description.trim().length < 12) e.description = 'Опишите ситуацию подробнее'
    if (category !== 'C' && !planId) e.planId = 'Выберите защищённый план'
    if (category === 'B' && files.length === 0) e.files = 'Приложите файл'
    setErrors(e)
    return !Object.keys(e).length
  }

  const payload = () => ({
    id: claimId,
    category,
    planId: category === 'C' ? planId || null : planId,
    type: type.trim(),
    eventDate,
    description,
    requestedAmount: amount ? Number(amount) : null,
    attachments: files,
    extraInfo: extra,
    demoScenario: category === 'A' ? scenario : category === 'B' ? demoScenarios.categoryB.id : null,
  })

  async function send() {
    if (!validate()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    const res = store.submitClaim(payload())
    setLoading(false)
    if (!res.ok) {
      pushToast('error', 'Не удалось отправить', res.error)
      return
    }
    pushToast('success', 'Обращение отправлено')
    router.push(`/claims/${res.data.id}`)
  }

  function draft() {
    const res = store.saveClaimDraft(payload())
    if (res.ok) {
      pushToast('success', 'Черновик сохранён')
      router.push(`/claims/${res.data.id}`)
    }
  }

  return (
    <PageMotion>
      <h1 className="text-2xl font-semibold">Новое обращение</h1>
      <Card className="space-y-4">
        {s.subscription.status === 'none' && category !== 'C' ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Категории A и B доступны после подключения подписки.{' '}
            <Link href="/subscription" className="underline">
              Открыть подписку
            </Link>
          </p>
        ) : null}
        <Field label="Категория" hint={claimCategoryHint[category]}>
          <Select value={category} onChange={(e) => setCategory(e.target.value as ClaimCategory)}>
            <option value="A">A — подтверждаемые события</option>
            <option value="B">B — нужны документы</option>
            <option value="C">C — программа поддержки SafeDay</option>
          </Select>
        </Field>
        {category !== 'C' ? (
          <Field label="Связанный план" error={errors.planId}>
            <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
              <option value="">Выберите план</option>
              {protectedPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <div className="rounded-xl bg-violet-50 p-3 text-sm text-violet-950">
            <p className="font-medium">Это не страховая выплата.</p>
            <ul className="mt-2 list-disc pl-4 text-xs">
              <li>Рассматривается индивидуально, одобрение не гарантировано.</li>
              <li>Не более {supportConfig.monthlyLimit} выплаты C в календарный месяц.</li>
              <li>
                Для нового клиента первая поддержка ≤ {Math.round(supportConfig.firstPayoutPercent * 100)}% вступительного
                платежа ({money(maxFirstSupport())}).
              </li>
            </ul>
            {!evalC.ok ? <p className="mt-2 text-rose-700">{evalC.error}</p> : <p className="mt-2">{evalC.note} Ориентир: {money(evalC.amount)}</p>}
          </div>
        )}
        <Field label="Тип обращения" error={errors.type}>
          <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Например, отмена рейса" />
        </Field>
        {category === 'A' ? (
          <Field label="Демосценарий проверки" hint={demoScenarios.categoryA.hint}>
            <Select value={scenario} onChange={(e) => setScenario(e.target.value)}>
              <option value={demoScenarios.categoryA.id}>{demoScenarios.categoryA.label}</option>
              <option value="manual">Обычная проверка без автоподтверждения</option>
            </Select>
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Дата события" error={errors.eventDate}>
            <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
          </Field>
          <Field label="Запрошенная сумма, ₽" hint="Для C учитываются лимиты программы">
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
        </div>
        <Field label="Обстоятельства" error={errors.description}>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        {category === 'B' || category === 'C' ? (
          <Field label="Подтверждения" error={errors.files} hint={fileUploadConfig.persistNote}>
            <FileUpload
              files={files}
              note={fileUploadConfig.persistNote}
              onAdd={(file) => {
                const res = store.validateAttachment(file)
                if (!res.ok) {
                  pushToast('error', 'Файл отклонён', res.error)
                  return
                }
                setFiles((x) => [...x, res.data])
              }}
              onRemove={(id) => setFiles((x) => x.filter((f) => f.id !== id))}
            />
          </Field>
        ) : (
          <p className="text-xs text-slate-500">
            Для категории A допустимы: статус рейса перевозчика, уведомление организатора, отмена по правилам покрытия.
          </p>
        )}
        {category === 'B' ? (
          <Field label="Комментарий к документам">
            <Textarea value={extra} onChange={(e) => setExtra(e.target.value)} />
          </Field>
        ) : null}
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" onClick={draft}>
            Сохранить черновик
          </Button>
          <Button
            onClick={send}
            loading={loading}
            disabled={(category === 'C' && !evalC.ok) || (category !== 'C' && s.subscription.status === 'none')}
          >
            Отправить
          </Button>
        </div>
      </Card>
    </PageMotion>
  )
}

export function ClaimDetailScreen({ id }: { id: string }) {
  const s = useAppState()
  const router = useRouter()
  const claim = s.claims.find((c) => c.id === id)
  const [extra, setExtra] = useState('')
  if (!claim) return <p>Обращение не найдено.</p>
  const plan = s.plans.find((p) => p.id === claim.planId)
  return (
    <PageMotion>
      <Link href="/claims" className="text-sm text-[var(--vtb-blue)]">
        К списку
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{claim.type}</h1>
        <Badge tone={tone[claim.status]}>{claimStatusLabel[claim.status]}</Badge>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-2 text-sm">
          <p>ID: {claim.id}</p>
          <p>{claimCategoryLabel[claim.category]}</p>
          <p>План: {plan?.title || '—'}</p>
          <p>Дата события: {claim.eventDate}</p>
          <p>{claim.description}</p>
          {claim.requestedAmount ? <p>Запрошено: {money(claim.requestedAmount)}</p> : null}
          {claim.approvedAmount ? <p>Демозачисление в журнале: {money(claim.approvedAmount)}</p> : null}
          {claim.decisionComment ? <p className="text-slate-600">{claim.decisionComment}</p> : null}
          {claim.attachments.length ? (
            <p>Файлы (только имена): {claim.attachments.map((a) => a.name).join(', ')}</p>
          ) : null}
          {claim.status === 'draft' ? (
            <Button onClick={() => router.push(`/claims/new?draftId=${claim.id}`)}>Продолжить черновик</Button>
          ) : null}
        </Card>
        <Card>
          <h2 className="mb-3 font-medium">Таймлайн</h2>
          <Timeline items={claim.timeline} />
        </Card>
      </div>
      {claim.status === 'need_info' ? (
        <Card className="space-y-3">
          <p className="font-medium">Нужны дополнительные данные</p>
          <Textarea value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Уточните обстоятельства" />
          <Button
            onClick={() => {
              const res = store.continueClaim(claim.id, extra)
              if (!res.ok) pushToast('error', res.error)
              else pushToast('success', 'Данные отправлены')
            }}
          >
            Продолжить рассмотрение
          </Button>
        </Card>
      ) : null}
      {claim.category === 'C' && ['submitted', 'review'].includes(claim.status) ? (
        <Card className="space-y-3">
          <p className="text-sm">
            Демонстрационное рассмотрение. Отправка заявки не означает одобрения. Выберите учебный исход.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const res = store.resolveSupportC(claim.id, true)
                if (!res.ok) pushToast('error', 'Нельзя одобрить', res.error)
                else pushToast('success', 'Поддержка отражена в журнале')
              }}
            >
              Учебно одобрить
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                store.resolveSupportC(claim.id, false)
                pushToast('info', 'Отказ зафиксирован')
              }}
            >
              Учебно отказать
            </Button>
          </div>
        </Card>
      ) : null}
    </PageMotion>
  )
}
