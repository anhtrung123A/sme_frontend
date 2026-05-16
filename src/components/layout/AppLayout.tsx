import { useState } from 'react'
import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type AppLayoutProps = {
  title: string
  children: ReactNode
}

export function AppLayout({ title, children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Header        onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      <div className="app-body">
        <Sidebar isCollapsed={isSidebarCollapsed} />

        <main className="page-content">
          <div className="page-header">
            <h1 className="page-title">{title}</h1>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

