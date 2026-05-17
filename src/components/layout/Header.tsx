import { useState } from 'react'
import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerHeaderTitle,
  SearchBox,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import {
  Alert24Regular,
  Dismiss24Regular,
  Navigation24Regular,
  Settings24Regular,
} from '@fluentui/react-icons'
import { useAuth } from '../../features/auth/hooks'
import { navigateTo } from '../../lib/navigation'

type HeaderProps = {
  title: string
  onToggleSidebar: () => void
}

const useStyles = makeStyles({
  root: {
    height: '56px',
    flexShrink: 0,
    display: 'grid',
    gridTemplateColumns: 'minmax(240px, auto) minmax(240px, 520px) minmax(180px, auto)',
    alignItems: 'center',
    gap: tokens.spacingHorizontalL,
    padding: `0 ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow2,
    zIndex: 10,
    '@media (max-width: 840px)': {
      gridTemplateColumns: '1fr auto',
    },
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  brandBlock: {
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    lineHeight: tokens.lineHeightBase200,
  },
  brand: {
    color: tokens.colorBrandForeground1,
  },
  page: {
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  search: {
    justifySelf: 'center',
    width: '100%',
    '@media (max-width: 840px)': {
      display: 'none',
    },
  },
  right: {
    justifySelf: 'end',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalXS,
  },
  drawerBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  profileBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  meta: {
    display: 'grid',
    gap: tokens.spacingVerticalXXS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
})

export function Header({ title, onToggleSidebar }: HeaderProps) {
  const { currentUser, logout } = useAuth()
  const styles = useStyles()

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  return (
    <>
      <header className={styles.root}>
        <div className={styles.left}>
          <Button
            appearance="subtle"
            icon={<Navigation24Regular />}
            aria-label="Toggle sidebar"
            onClick={onToggleSidebar}
          />
          <div className={styles.brandBlock}>
            <Text className={styles.brand} weight="semibold">
              EnglishCenter CRM
            </Text>
            <Text className={styles.page} size={200}>
              {title}
            </Text>
          </div>
        </div>

        <SearchBox
          className={styles.search}
          aria-label="Search workspace"
          placeholder="Search students, leads, classes"
          value={searchValue}
          onChange={(_, data) => setSearchValue(data.value)}
        />

        <div className={styles.right}>
          <Button appearance="subtle" icon={<Alert24Regular />} aria-label="Notifications" />
          <Button appearance="subtle" icon={<Settings24Regular />} aria-label="Settings" />
          <Button
            appearance="subtle"
            icon={<Avatar name={currentUser?.fullName ?? currentUser?.email ?? 'User'} size={28} />}
            aria-label="Open profile panel"
            onClick={() => setIsProfileOpen(true)}
          />
        </div>
      </header>

      <Drawer
        type="overlay"
        position="end"
        open={isProfileOpen}
        onOpenChange={(_, data) => setIsProfileOpen(data.open)}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close profile panel"
                icon={<Dismiss24Regular />}
                onClick={() => setIsProfileOpen(false)}
              />
            }
          >
            Profile
          </DrawerHeaderTitle>
        </DrawerHeader>
        <DrawerBody className={styles.drawerBody}>
          <div className={styles.profileBlock}>
            <Avatar name={currentUser?.fullName ?? currentUser?.email ?? 'User'} size={56} />
            <div>
              <Text weight="semibold" size={500}>
                {currentUser?.fullName ?? 'Unknown user'}
              </Text>
              <Text className={styles.muted} block>
                {currentUser?.email ?? '-'}
              </Text>
            </div>
          </div>

          <div className={styles.meta}>
            <Text className={styles.muted} size={200} weight="semibold">
              Tenant
            </Text>
            <Text>{currentUser?.branchName ?? 'SME English Center'}</Text>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <Button
            appearance="secondary"
            onClick={() => {
              setIsProfileOpen(false)
              navigateTo('/profile')
            }}
          >
            View profile
          </Button>
          <Button
            appearance="primary"
            onClick={async () => {
              await logout()
              navigateTo('/login', true)
            }}
          >
            Sign out
          </Button>
        </DrawerFooter>
      </Drawer>
    </>
  )
}
