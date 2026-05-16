import { useEffect, useState } from 'react'
import { getOverdueTasksApi, getTaskSummaryApi } from '../../dashboard/api'
import type { TaskOverdue, TaskSummary } from '../../dashboard/types'

export function TaskAnalyticsPage() {
  const [summary, setSummary] = useState<TaskSummary | null>(null)
  const [rows, setRows] = useState<TaskOverdue[]>([])
  useEffect(() => { void (async () => { setSummary(await getTaskSummaryApi()); setRows(await getOverdueTasksApi()) })() }, [])
  return (
    <>
      <div className="detail-grid">
        <div>Total: {summary?.totalTasks ?? 0}</div><div>Pending: {summary?.pendingTasks ?? 0}</div><div>Completed: {summary?.completedTasks ?? 0}</div><div>Overdue: {summary?.overdueTasks ?? 0}</div>
      </div>
      <table className="ms-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Title</th><th>Assigned To</th><th>Due At</th></tr></thead>
        <tbody>{rows.map((x)=><tr key={x.id}><td>{x.title}</td><td>{x.assignedToUserName}</td><td>{new Date(x.dueAt).toLocaleString()}</td></tr>)}</tbody>
      </table>
    </>
  )
}
