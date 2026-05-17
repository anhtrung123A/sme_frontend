import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  Link,
  MessageBar,
  MessageBarBody,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { useAuth } from '../hooks'

const useStyles = makeStyles({
  root: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: tokens.spacingHorizontalXXL,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: tokens.spacingHorizontalXXL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
  },
  brandMark: {
    width: '28px',
    height: '28px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: tokens.spacingVerticalS,
  },
})

export function LoginPage() {
  const { login, loginError, isSubmitting, clearLoginError } = useAuth()
  const styles = useStyles()
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
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true" />
          <Text weight="semibold" size={500}>
            EnglishCenter CRM
          </Text>
        </div>

        <Text as="h1" size={800} weight="semibold">
          Sign in
        </Text>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field label="Email" required>
            <Input
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field label="Password" required>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          {loginError ? (
            <MessageBar intent="error">
              <MessageBarBody>{loginError}</MessageBarBody>
            </MessageBar>
          ) : null}

          <Link href="#" onClick={(event) => event.preventDefault()}>
            Can't access your account?
          </Link>

          <div className={styles.actions}>
            <Button appearance="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
