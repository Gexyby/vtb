import { Suspense } from 'react'
import { ProductDetailScreen } from '@/components/screens/ProductDetailScreen'
import { ScreenFallback } from '@/components/ScreenFallback'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<ScreenFallback />}>
      <ProductDetailScreen id={id} />
    </Suspense>
  )
}
