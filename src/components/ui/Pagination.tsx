import { Button, Text, makeStyles, tokens } from '@fluentui/react-components'
import { ChevronLeft24Regular, ChevronRight24Regular } from '@fluentui/react-icons'

type PaginationProps = {
  page: number
  pageSize: number
  totalCount: number
  onPageChange: (page: number) => void
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  text: {
    color: tokens.colorNeutralForeground3,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
  },
})

export function Pagination({ page, pageSize, totalCount, onPageChange }: PaginationProps) {
  const styles = useStyles()
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const canPrev = page > 1
  const canNext = page < totalPages
  const handlePageChange = (nextPage: number) => {
    onPageChange(nextPage)
    if (typeof window !== 'undefined') {
      const scrollRoot = document.querySelector<HTMLElement>('[data-app-scroll-root="true"]')
      if (scrollRoot) {
        scrollRoot.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <div className={styles.root}>
      <Text className={styles.text} size={200}>
        Page {page} / {totalPages} - Total {totalCount}
      </Text>
      <div className={styles.actions}>
        <Button
          appearance="secondary"
          icon={<ChevronLeft24Regular />}
          disabled={!canPrev}
          onClick={() => handlePageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          appearance="secondary"
          icon={<ChevronRight24Regular />}
          iconPosition="after"
          disabled={!canNext}
          onClick={() => handlePageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
