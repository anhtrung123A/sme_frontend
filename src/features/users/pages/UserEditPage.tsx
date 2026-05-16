import { navigateTo } from '../../../lib/navigation'

type UserEditPageProps = {
  userId: string
}

export function UserEditPage({ userId }: UserEditPageProps) {
  return (
    <div>
      <p>Editing user with ID: {userId}</p>
      <div className="command-bar" style={{ marginTop: '16px' }}>
        <button className="ms-button ms-button--secondary" type="button" onClick={() => navigateTo('/users')}>
          Back to Users
        </button>
      </div>
    </div>
  )
}
