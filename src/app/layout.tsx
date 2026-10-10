import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import { Providers } from '@/components/Providers'
import './globals.css'

const sans = Manrope({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
})

export const metadata: Metadata = {
  title: 'VTB SafeDay — демонстрационный MVP',
  description:
    'Концептуальный MVP защиты жизненных планов. Не является официальным приложением банка ВТБ и не выполняет реальных платежей.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={sans.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
