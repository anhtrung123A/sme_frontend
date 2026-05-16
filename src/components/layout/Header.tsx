import { useState } from 'react'
import {
  Bell,
  Menu,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../../features/auth/hooks'
import { navigateTo } from '../../lib/navigation'

type HeaderProps = {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
      <header className="top-navbar">
        <div className="top-navbar-left">
          <button className="icon-btn" type="button" aria-label="Toggle sidebar" onClick={onToggleSidebar}>
            <Menu size={16} />
          </button>
          <div className="top-brand">SME CRM</div>
          <div className="top-divider">|</div>
          <div className="top-page">Home</div>
        </div>

        <div className="top-navbar-center">
          <label className={`top-search ${isSearchOpen ? 'focused' : ''}`}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search"
              value={searchValue}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            {searchValue ? (
              <button type="button" className="search-clear" onClick={() => setSearchValue('')}>
                <X size={16} />
              </button>
            ) : null}
          </label>

          {isSearchOpen ? (
            <div className="search-dropdown">
              <div className="search-empty">No results found</div>
            </div>
          ) : null}
        </div>

        <div className="top-navbar-right">
          <button className="icon-btn" type="button" aria-label="Notifications">
            <Bell size={16} />
          </button>
          <button className="icon-btn" type="button" aria-label="Settings">
            <Settings size={16} />
          </button>
          <button
            className="avatar-btn"
            type="button"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            aria-label="Open profile panel"
          >
            {currentUser?.fullName?.charAt(0).toUpperCase() ?? 'U'}
          </button>
        </div>
      </header>

      {isSearchOpen ? <button type="button" className="search-backdrop" onClick={() => setIsSearchOpen(false)} /> : null}

      {isProfileOpen ? (
        <aside className="profile-drawer">
          <div className="profile-header">
            <h2>Profile</h2>
            <button type="button" className="icon-btn" onClick={() => setIsProfileOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="profile-user-block">
            <div className="profile-avatar">{currentUser?.fullName?.charAt(0).toUpperCase() ?? 'U'}</div>
            <div>
              <div className="profile-name">{currentUser?.fullName ?? 'Unknown user'}</div>
              <div className="profile-email">{currentUser?.email ?? '-'}</div>
            </div>
          </div>

          <div className="profile-meta">
            <div className="profile-label">Branch Name</div>
            <div>{currentUser?.branchName ?? 'SME English Center'}</div>
          </div>

          <div className="profile-actions">
            <button className="ms-button ms-button--secondary" type="button" onClick={() => navigateTo('/profile')}>
              View profile
            </button>
            <button
              className="ms-button"
              type="button"
              onClick={async () => {
                await logout()
                navigateTo('/login', true)
              }}
            >
              Sign out
            </button>
          </div>
        </aside>
      ) : null}
    </>
  )
}


