import './globals.css'
import { Syne, DM_Mono } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne' })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-mono' })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body className={syne.className}>{children}</body>
    </html>
  )
}