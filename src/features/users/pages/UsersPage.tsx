import { navigateTo } from '../../../lib/navigation'

type UserRecord = {
  id: string
  fullName: string
  email: string
  role: string
  status: 'active' | 'inactive'
}

const users: UserRecord[] = [
  {
    id: '1',
    fullName: 'Nguyen Van A',
    email: 'nva.teacher@sme.edu.vn',
    role: 'Teacher',
    status: 'active',
  },
  {
    id: '2',
    fullName: 'Tran Thi B',
    email: 'ttb.admin@sme.edu.vn',
    role: 'Admin',
    status: 'active',
  },
  {
    id: '3',
    fullName: 'Le Van C',
    email: 'lvc.student@sme.edu.vn',
    role: 'Student',
    status: 'inactive',
  },
]

export function UsersPage() {
  return (
    <>
      <div className="command-bar">
        <button className="ms-button" type="button" onClick={() => navigateTo('/users/create')}>
          + Add user
        </button>
        <button className="ms-button ms-button--secondary" type="button">
          Export to Excel
        </button>
        <div className="spacer" />
        <div className="search-wrap">
          <input type="text" className="ms-input" placeholder="Search name, email..." />
        </div>
      </div>

      <table className="ms-table">
        <thead>
          <tr>
            <th>Full name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status-badge ${user.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                  {user.status === 'active' ? 'Active' : 'Suspended'}
                </span>
              </td>
              <td>
                <a
                  href={`/users/${user.id}/edit`}
                  className="table-link"
                  onClick={(event) => {
                    event.preventDefault()
                    navigateTo(`/users/${user.id}/edit`)
                  }}
                >
                  Edit
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
