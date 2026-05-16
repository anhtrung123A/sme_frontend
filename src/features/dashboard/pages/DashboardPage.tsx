import { navigateTo } from '../../../lib/navigation'

export function DashboardPage() {
  return (
    <div>
      <p>Welcome to SME CRM Central.</p>
      <div className="command-bar" style={{ marginTop: '16px' }}>
        <button className="ms-button" type="button" onClick={() => navigateTo('/users')}>
          Go to Users
        </button>
      </div>
    </div>
  )
}
