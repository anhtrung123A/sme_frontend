import { useState } from 'react'
import type { FormEvent } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { useAuth } from '../hooks'

export function LoginPage() {
  const { login, loginError, isSubmitting, clearLoginError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearLoginError()

    const resultAction = await login(email, password)
    if (resultAction.type.endsWith('/fulfilled')) {
      navigateTo('/dashboard', true)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon" />
          <span>EnglishCenter CRM</span>
        </div>

        <h1 className="auth-title">Sign in</h1>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <input
              type="email"
              className="ms-input"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field auth-field--sm">
            <input
              type="password"
              className="ms-input"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {loginError ? <p className="auth-error">{loginError}</p> : null}

          <div className="auth-links">
            <a href="#" onClick={(event) => event.preventDefault()}>
              Can't access your account?
            </a>
          </div>

          <div className="auth-actions">
            <button className="ms-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
