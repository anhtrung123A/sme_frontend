import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type AppLayoutProps = {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div className="layout-container">
      <Sidebar />

      <main className="main-content">
        <Header title={title} />
        {children}
      </main>
    </div>
  )
}
