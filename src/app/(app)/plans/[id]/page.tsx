import { PlanDetailScreen } from '@/components/screens/PlanDetailScreen'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PlanDetailScreen id={id} />
}
