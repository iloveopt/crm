import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Steve CRM',
  description: 'Personal CRM for Steve Wang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
