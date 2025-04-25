import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Shop Assistant',
  description: 'commercetools AI Shop Assistant',
  generator: 'commercetools'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
