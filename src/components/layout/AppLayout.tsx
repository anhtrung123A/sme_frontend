import { useState } from 'react'
import type { ReactNode } from 'react'
import { Text, makeStyles, tokens } from '@fluentui/react-components'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type AppLayoutProps = {
  title: string
  children: ReactNode
}

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  },
  body: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXXL}`,
    '@media (max-width: 720px)': {
      padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalM}`,
    },
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalL,
    marginBottom: tokens.spacingVerticalL,
  },
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  eyebrow: {
    color: tokens.colorNeutralForeground3,
  },
})

export function AppLayout({ title, children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const styles = useStyles()

  return (
    <div className={styles.root}>
      <Header title={title} onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)} />

      <div className={styles.body}>
        <Sidebar isCollapsed={isSidebarCollapsed} />

        <main className={styles.content}>
          <header className={styles.header}>
            <div className={styles.titleBlock}>
              <Text className={styles.eyebrow} size={200} weight="semibold">
                Workspace
              </Text>
              <Text as="h1" size={800} weight="semibold">
                {title}
              </Text>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  )
}

