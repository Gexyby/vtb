import { Suspense } from 'react'
import { ProtectionScreen } from '@/components/screens/ProtectionScreen'
import { ScreenFallback } from '@/components/ScreenFallback'

export default function Page() {
  return (
    <Suspense fallback={<ScreenFallback />}>
      <ProtectionScreen />
    </Suspense>
  )
}
