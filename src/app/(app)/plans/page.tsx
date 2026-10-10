import { Suspense } from 'react'
import { PlansScreen } from '@/components/screens/PlansScreen'
import { ScreenFallback } from '@/components/ScreenFallback'

export default function Page() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <PlansScreen />
    </Suspense>
  )
}
