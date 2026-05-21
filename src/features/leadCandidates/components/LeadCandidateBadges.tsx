import { Badge, Text, makeStyles } from '@fluentui/react-components'
import { formatStatusLabel } from '../../../lib/formatStatus'

const useStyles = makeStyles({
  scoreText: { fontWeight: 600 },
})

function normalize(raw: string) {
  return raw.replace(/[_\s-]+/g, '').toLowerCase()
}

export function SourceBadge({ value }: { value: string }) {
  const v = normalize(value)
  const color = v.includes('facebook') ? 'informative' : v.includes('website') ? 'success' : 'brand'
  return <Badge appearance="filled" color={color}>{formatStatusLabel(value)}</Badge>
}

export function IntentBadge({ value }: { value: string }) {
  const v = normalize(value)
  const color = (v.includes('spam') || v.includes('complaint')) ? 'danger'
    : (v.includes('support') || v.includes('irrelevant') || v.includes('engagement')) ? 'subtle'
      : (v.includes('price') || v.includes('schedule') || v.includes('location')) ? 'warning'
        : 'informative'
  return <Badge appearance="filled" color={color}>{formatStatusLabel(value)}</Badge>
}

export function DecisionBadge({ value }: { value: string }) {
  const v = normalize(value)
  const color = v.includes('autocreatelead') ? 'success' : v.includes('needsreview') ? 'warning' : 'subtle'
  return <Badge appearance="filled" color={color}>{formatStatusLabel(value)}</Badge>
}

export function CandidateStatusBadge({ value }: { value: string }) {
  const v = normalize(value)
  const color = v.includes('converted') ? 'success'
    : v.includes('approved') ? 'brand'
      : v.includes('rejected') ? 'danger'
        : v.includes('ignored') ? 'subtle'
          : 'warning'
  return <Badge appearance="filled" color={color}>{formatStatusLabel(value)}</Badge>
}

export function ScoreView({ score }: { score: number }) {
  const styles = useStyles()
  const clamped = Math.max(0, Math.min(100, score))
  const tone = clamped >= 80 ? '#117865' : clamped >= 50 ? '#b38600' : '#b42318'
  return <Text size={200} className={styles.scoreText} style={{ color: tone }}>{clamped} / 100</Text>
}
