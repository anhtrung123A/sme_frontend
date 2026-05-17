import type { PropsWithChildren, ReactNode } from 'react'
import { Card, Text, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'

type KpiCardProps = {
  label: string
  value: ReactNode
}

const useStyles = makeStyles({
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  kpiCard: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  filters: {
    display: 'flex',
    alignItems: 'end',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  filterItem: {
    minWidth: '180px',
  },
  tableCard: {
    padding: 0,
    overflowX: 'auto',
  },
  tableHeader: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  tableFooter: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  empty: {
    display: 'grid',
    placeItems: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalXXXL,
    textAlign: 'center',
  },
  detailGrid: {
    padding: tokens.spacingHorizontalL,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
})

export function PageStack({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <div className={styles.stack}>{children}</div>
}

export function KpiGrid({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <section className={styles.kpiGrid}>{children}</section>
}

export function KpiCard({ label, value }: KpiCardProps) {
  const styles = useStyles()
  return (
    <Card className={styles.kpiCard}>
      <Text className={styles.muted} size={200} weight="semibold">
        {label}
      </Text>
      <Text size={700} weight="semibold">
        {value}
      </Text>
    </Card>
  )
}

export function PageToolbar({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <div className={styles.toolbar}>{children}</div>
}

export function FilterGroup({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <div className={styles.filters}>{children}</div>
}

export function FilterItem({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <div className={styles.filterItem}>{children}</div>
}

export function TableCard({ title, subtitle, children, footer }: PropsWithChildren<{ title?: string; subtitle?: string; footer?: ReactNode }>) {
  const styles = useStyles()
  return (
    <Card className={styles.tableCard}>
      {title || subtitle ? (
        <div className={styles.tableHeader}>
          <div>
            {title ? <Text weight="semibold">{title}</Text> : null}
            {subtitle ? <Text className={styles.muted} block size={200}>{subtitle}</Text> : null}
          </div>
        </div>
      ) : null}
      {children}
      {footer ? <div className={styles.tableFooter}>{footer}</div> : null}
    </Card>
  )
}

export function TableActions({ children }: PropsWithChildren) {
  const styles = useStyles()
  return <div className={styles.actions}>{children}</div>
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  const styles = useStyles()
  return (
    <div className={styles.empty}>
      <Text size={500} weight="semibold">{title}</Text>
      {description ? <Text className={styles.muted}>{description}</Text> : null}
      {action}
    </div>
  )
}

export function DetailCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  const styles = useStyles()
  return <Card className={mergeClasses(styles.detailGrid, className)}>{children}</Card>
}
