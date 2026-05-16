import { navigateTo } from '../../../lib/navigation'

export function UserCreatePage() {
  return (
    <div>
      <p>Create a new user (form will be implemented in next phase).</p>
      <div className="command-bar" style={{ marginTop: '16px' }}>
        <button className="ms-button ms-button--secondary" type="button" onClick={() => navigateTo('/users')}>
          Back to Users
        </button>
      </div>
    </div>
  )
}
