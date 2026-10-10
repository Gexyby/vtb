import { Suspense } from 'react'
import { ClaimFormScreen } from '@/components/screens/ClaimsScreens'
import { ScreenFallback } from '@/components/ScreenFallback'

export default function Page() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <ClaimFormScreen />
    </Suspense>
  )
}
