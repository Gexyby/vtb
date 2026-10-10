import { ClaimDetailScreen } from '@/components/screens/ClaimsScreens'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ClaimDetailScreen id={id} />
}
