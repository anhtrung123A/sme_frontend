import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Textarea,
  makeStyles,
} from '@fluentui/react-components'
import { MoreHorizontalRegular } from '@fluentui/react-icons'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { getSalesUsersApi } from '../../leads/api'
import type { UserLite } from '../../leads/types'
import {
  approveLeadCandidateApi,
  convertLeadCandidateApi,
  getLeadCandidateDetailApi,
  getLeadCandidatesApi,
  ignoreLeadCandidateApi,
  rejectLeadCandidateApi,
} from '../api'
import { CandidateStatusBadge, DecisionBadge, IntentBadge, ScoreView, SourceBadge } from '../components/LeadCandidateBadges'
import type { LeadCandidateDetail, LeadCandidateListItem } from '../types'

const statusOptions = ['Pending', 'Approved', 'Rejected', 'ConvertedToLead', 'Ignored']
const decisionOptions = ['AutoCreateLead', 'NeedsReview', 'Ignore']
const intentOptions = ['CourseInquiry', 'PriceInquiry', 'TrialRequest', 'RegistrationIntent', 'ScheduleInquiry', 'LocationInquiry', 'SupportExisting', 'Complaint', 'Spam', 'Irrelevant', 'EngagementOnly']
const sourcePlatforms = ['Facebook', 'Website', 'ChatWidget']
const sourceTypes = ['Comment', 'Message', 'FormSubmit', 'ChatMessage']

const useStyles = makeStyles({
  actionHeadWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
  actionCellWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
  ellipsis: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' },
  wrap2: {
    display: '-webkit-box',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.35',
    maxHeight: '2.7em',
  },
})

export function LeadCandidateListPage({ candidateId }: { candidateId?: string }) {
  const styles = useStyles()
  const pageSize = 20
  const [items, setItems] = useState<LeadCandidateListItem[]>([])
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [users, setUsers] = useState<UserLite[]>([])
  const [detail, setDetail] = useState<LeadCandidateDetail | null>(null)
  const [openDetail, setOpenDetail] = useState(false)
  const [openConvert, setOpenConvert] = useState(false)
  const [busyAction, setBusyAction] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [keyword, setKeyword] = useState('')
  const [sourcePlatform, setSourcePlatform] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [intent, setIntent] = useState('')
  const [decision, setDecision] = useState('')
  const [status, setStatus] = useState('')
  const [contact, setContact] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [manualNote, setManualNote] = useState('')
  const convertNotePreview = `Created from AI Lead Candidate\n\nSource: ${detail?.sourcePlatform ?? '-'} ${detail?.sourceType ?? ''}\nDetected intent: ${formatStatusLabel(detail?.detectedIntent ?? '-')}\nCandidate score: ${detail?.candidateScore ?? 0}\nCourse interest: ${detail?.courseInterest ?? '-'}\n\nOriginal message:\n${detail?.rawInteraction?.rawText ?? detail?.normalizedText ?? '-'}`

  const query = useMemo(() => {
    const mappedStatus = status || undefined
    const mappedDecision = decision || undefined
    return {
      page,
      pageSize,
      keyword: keyword || undefined,
      sourcePlatform: sourcePlatform || undefined,
      sourceType: sourceType || undefined,
      intent: intent || undefined,
      decision: mappedDecision,
      status: mappedStatus,
      hasPhone: contact === 'has_phone' ? true : contact === 'missing_contact' ? false : undefined,
      hasEmail: contact === 'has_email' ? true : contact === 'missing_contact' ? false : undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    }
  }, [page, keyword, sourcePlatform, sourceType, intent, decision, status, contact, fromDate, toDate])

  const load = async () => {
    try {
      setError(null)
      const data = await getLeadCandidatesApi(query)
      setItems(data.items)
      setTotalCount(data.totalCount)
      setPage(data.pageNumber)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead candidates')
    }
  }

  const openReview = async (id: number) => {
    const data = await getLeadCandidateDetailApi(id)
    setDetail(data)
    setOpenDetail(true)
    navigateTo(`/leads/candidates/${id}`)
  }

  const runAction = async (id: number, action: 'approve' | 'reject' | 'ignore' | 'convert') => {
    setBusyAction(id)
    try {
      if (action === 'approve') await approveLeadCandidateApi(id)
      if (action === 'reject') await rejectLeadCandidateApi(id)
      if (action === 'ignore') await ignoreLeadCandidateApi(id)
      if (action === 'convert') await convertLeadCandidateApi(id)
      if (detail?.id === id) setDetail(await getLeadCandidateDetailApi(id))
      await load()
    } finally {
      setBusyAction(null)
    }
  }

  useEffect(() => { void getSalesUsersApi().then(setUsers).catch(() => setUsers([])) }, [])
  useEffect(() => { void load() }, [query])
  useEffect(() => {
    if (candidateId) {
      void openReview(Number(candidateId))
    }
  }, [candidateId])
  useEffect(() => {
    if (openConvert) setManualNote(convertNotePreview)
  }, [openConvert, convertNotePreview])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem><Field label="Search"><Input value={keyword} placeholder="Search by name, phone, email, message..." onChange={(_, d) => setKeyword(d.value)} /></Field></FilterItem>
          <FilterItem><Field label="Source Platform"><Select value={sourcePlatform} onChange={(e) => setSourcePlatform(e.currentTarget.value)}><option value="">All</option>{sourcePlatforms.map((x) => <option key={x}>{x}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Source Type"><Select value={sourceType} onChange={(e) => setSourceType(e.currentTarget.value)}><option value="">All</option>{sourceTypes.map((x) => <option key={x}>{x}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Intent"><Select value={intent} onChange={(e) => setIntent(e.currentTarget.value)}><option value="">All</option>{intentOptions.map((x) => <option key={x}>{formatStatusLabel(x)}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Decision"><Select value={decision} onChange={(e) => setDecision(e.currentTarget.value)}><option value="">All</option>{decisionOptions.map((x) => <option key={x}>{formatStatusLabel(x)}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Status"><Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}><option value="">All</option>{statusOptions.map((x) => <option key={x}>{formatStatusLabel(x)}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Contact"><Select value={contact} onChange={(e) => setContact(e.currentTarget.value)}><option value="">All</option><option value="has_phone">Has phone</option><option value="has_email">Has email</option><option value="missing_contact">Missing contact</option></Select></Field></FilterItem>
          <FilterItem><Field label="From"><Input type="date" value={fromDate} onChange={(_, d) => setFromDate(d.value)} /></Field></FilterItem>
          <FilterItem><Field label="To"><Input type="date" value={toDate} onChange={(_, d) => setToDate(d.value)} /></Field></FilterItem>
          <Button appearance="secondary" onClick={() => { setPage(1); void load() }}>Apply</Button>
        </FilterGroup>
      </PageToolbar>

      <TableCard title="Lead Candidates" subtitle={`${totalCount.toLocaleString()} total candidates`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={setPage} />}>
        {error ? <Text>{error}</Text> : null}
        {items.length === 0 ? <EmptyState title="No candidates found" description="Try changing filters or tab." /> : (
          <Table aria-label="Lead candidates table">
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Customer</TableHeaderCell>
                <TableHeaderCell>Interaction</TableHeaderCell>
                <TableHeaderCell>Intent</TableHeaderCell>
                <TableHeaderCell>Score</TableHeaderCell>
                <TableHeaderCell>Decision</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>
                  <div className={styles.actionHeadWrap}>Actions</div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((x) => (
                <TableRow key={x.id}>
                  <TableCell>{x.id}</TableCell>
                  <TableCell><SourceBadge value={x.sourcePlatform} /></TableCell>
                  <TableCell><span className={styles.ellipsis}>{x.customerName ?? '-'}</span></TableCell>
                  <TableCell><span className={styles.wrap2}>{(x.normalizedText ?? '') || '-'}</span></TableCell>
                  <TableCell><IntentBadge value={x.detectedIntent} /></TableCell>
                  <TableCell><ScoreView score={x.candidateScore} /></TableCell>
                  <TableCell><DecisionBadge value={x.decision} /></TableCell>
                  <TableCell><CandidateStatusBadge value={x.status} /></TableCell>
                  <TableCell>
                    <div className={styles.actionCellWrap}>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button
                            size="small"
                            appearance="subtle"
                            icon={<MoreHorizontalRegular />}
                            aria-label="More actions"
                          />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => void openReview(x.id)}>Review</MenuItem>
                            {(x.status === 'Pending' || x.status === 'Approved') ? (
                              <MenuItem disabled={busyAction === x.id} onClick={() => void runAction(x.id, 'approve')}>Approve</MenuItem>
                            ) : null}
                            {(x.status === 'Pending' || x.status === 'Approved') ? (
                              <MenuItem disabled={busyAction === x.id} onClick={() => void runAction(x.id, 'reject')}>Reject</MenuItem>
                            ) : null}
                            {(x.status === 'Pending' || x.status === 'Approved') ? (
                              <MenuItem disabled={busyAction === x.id} onClick={() => void runAction(x.id, 'ignore')}>Ignore</MenuItem>
                            ) : null}
                            {(x.status === 'Pending' || x.status === 'Approved') ? (
                              <MenuItem disabled={busyAction === x.id} onClick={() => { setDetail(x as LeadCandidateDetail); setOpenConvert(true) }}>Convert to Lead</MenuItem>
                            ) : null}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </TableActions>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={openDetail} onOpenChange={(_, d) => { setOpenDetail(d.open); if (!d.open) navigateTo('/leads/candidates') }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Lead Candidate Detail</DialogTitle>
            <DialogContent>
              {!detail ? <Text>Loading...</Text> : (
                <PageStack>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <SourceBadge value={`${detail.sourcePlatform} ${detail.sourceType}`} />
                    <DecisionBadge value={detail.decision} />
                    <CandidateStatusBadge value={detail.status} />
                  </div>
                  <Text weight="semibold">{detail.customerName ?? 'Unknown customer'}</Text>
                  <ScoreView score={detail.candidateScore} />
                  <Text weight="semibold">Original interaction</Text>
                  <Text>{detail.rawInteraction?.rawText ?? detail.normalizedText ?? '-'}</Text>
                  <Text weight="semibold">AI extraction</Text>
                  <Text>Intent: {formatStatusLabel(detail.detectedIntent)} · Confidence: {detail.intentConfidence}</Text>
                  <Text>Course interest: {detail.courseInterest ?? '-'}</Text>
                  <Text>Contact: {detail.phone ?? '-'} · {detail.email ?? '-'}</Text>
                  <Text weight="semibold">Decision reason</Text>
                  <Textarea readOnly value={detail.decisionReasonJson ?? ''} />
                  <Text weight="semibold">Advanced details</Text>
                  <Text>Raw Interaction ID: {detail.rawInteractionId} · External ID: {detail.rawInteraction?.externalId ?? '-'}</Text>
                  <Text>Model: {detail.latestPrediction?.modelVersion ?? '-'} · Predicted at: {detail.latestPrediction?.predictedAt ? new Date(detail.latestPrediction.predictedAt).toLocaleString() : '-'}</Text>
                  {detail.createdLeadId ? <Button appearance="secondary" onClick={() => navigateTo(`/leads/${detail.createdLeadId}`)}>View Lead</Button> : null}
                </PageStack>
              )}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Close</Button></DialogTrigger>
              {detail && (detail.status === 'Pending' || detail.status === 'Approved') ? <Button appearance="secondary" onClick={() => void runAction(detail.id, 'approve')}>Approve</Button> : null}
              {detail && (detail.status === 'Pending' || detail.status === 'Approved') ? <Button appearance="secondary" onClick={() => void runAction(detail.id, 'reject')}>Reject</Button> : null}
              {detail && (detail.status === 'Pending' || detail.status === 'Approved') ? <Button appearance="secondary" onClick={() => void runAction(detail.id, 'ignore')}>Ignore</Button> : null}
              {detail && (detail.status === 'Pending' || detail.status === 'Approved') ? <Button appearance="primary" onClick={() => setOpenConvert(true)}>Convert to Lead</Button> : null}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={openConvert} onOpenChange={(_, d) => setOpenConvert(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Convert Candidate to Lead</DialogTitle>
            <DialogContent>
              <Field label="Full Name"><Input value={detail?.customerName ?? ''} readOnly /></Field>
              <Field label="Phone"><Input value={detail?.phone ?? ''} readOnly /></Field>
              <Field label="Email"><Input value={detail?.email ?? ''} readOnly /></Field>
              <Field label="Course"><Input value={detail?.courseInterest ?? ''} readOnly /></Field>
              <Field label="Assigned To"><Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.currentTarget.value)}><option value="">Select Sales</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field>
              <Field label="Demand Note Preview">
                <Textarea
                  value={manualNote}
                  onChange={(_, d) => setManualNote(d.value)}
                />
              </Field>
              {!(detail?.phone || detail?.email) ? <Text>This candidate has no phone or email. You can still create a lead.</Text> : null}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => {
                if (!detail) return
                await runAction(detail.id, 'convert')
                setOpenConvert(false)
                setManualNote('')
              }}>Create Lead</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}


