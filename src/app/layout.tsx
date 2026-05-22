import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Parallels — Did their lives ever cross?',
  description: 'Place any two lives side by side across time and space.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full`} style={{ background: '#0A0A0F', color: '#F1F1F5' }}>
        {children}
      </body>
    </html>
  )
}
