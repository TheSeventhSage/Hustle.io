import { Suspense, useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import {
  Home, Briefcase, MessageSquare,
  Settings, LogOut, Search, Bell, ChevronDown,
  SlidersHorizontal, Menu, X, Sun, Moon, Wallet
} from 'lucide-react'
import { useSignOut } from '../features/auth/auth.hooks.js'
import useAuthStore from '../features/auth/auth.store.js'
import { HustleLogo } from '../shared/components/HustleLogo.jsx'
import PageSkeleton from '../shared/components/PageSkeleton.jsx'
import ToastContainer from '../shared/components/ToastContainer.jsx'
import { NotificationPanel } from '../shared/components/NotificationPanel.jsx'
import { useTheme } from '../shared/hooks/useTheme.js'
import { useNotifications, useMarkNotificationRead } from '../features/notifications/notifications.hooks.js'

const NAV_ITEMS_COMPANY = [
  { to: '/feed', label: 'Home', icon: Home },
  { to: '/my-hustles', label: 'Hustle Posts', icon: Briefcase },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const NAV_ITEMS_ARTISAN = [
  { to: '/hustler', label: 'Home', icon: Home },
  { to: '/bookings', label: 'My Hustles', icon: Briefcase },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/wallet', label: 'My Wallet', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onNavClick, user, signOut, navItems }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-7 pt-9 pb-7">
        <Link to="/" className="flex items-center gap-2">
          <HustleLogo size={27} direction='row' color='white' fontSize='22px' gap='8px' text='HUSTLE' />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150 ${isActive
                ? 'bg-primary-sat text-white shadow-sm dark:bg-secondary dark:text-btn-dark'
                : 'text-mist hover:text-white hover:bg-white/5 dark:text-text-2 dark:hover:text-text-1 dark:hover:bg-mist'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-white dark:text-btn-dark' : 'text-current transition-colors group-hover:text-white dark:group-hover:text-text-1'}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-light dark:bg-btn-dark" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 mt-auto space-y-1">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 dark:bg-mist">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name || 'U'} ${user?.last_name || ''}`.trim())}&background=1E4D35&color=F6DE83&bold=true&size=64`}
            alt={`${user?.first_name || ''} ${user?.last_name || ''}`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-light/30 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight dark:text-text-1">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}</p>
            <p className="text-[11px] text-mist truncate leading-tight dark:text-text-3">{user?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 border border-primary-sat rounded-xl text-[14px] font-medium text-mist hover:text-white hover:bg-primary-sat transition-all group dark:text-text-2 dark:hover:text-btn-dark dark:hover:bg-secondary dark:hover:border-secondary"
        >
          <LogOut size={18} strokeWidth={1.8} className="group-hover:text-white transition-colors dark:group-hover:text-btn-dark" />
          Log out
        </button>
      </div>
    </div>
  )
}

function extractNotifications(response) {
  return response?.data?.data?.items ?? response?.data?.items ?? response?.items ?? []
}

function parseNotificationPayload(payload) {
  if (!payload) return null
  if (typeof payload === 'object') return payload

  try {
    return JSON.parse(payload)
  } catch {
    return null
  }
}

function formatNotificationTime(value) {
  if (!value) return 'Now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Now'

  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatNotificationDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AppShell() {
  const user = useAuthStore((s) => s.user)
  const { mutate: signOut } = useSignOut()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const drawerRef = useRef(null)
  const { isDark, toggle: toggleTheme } = useTheme()
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    isError: notificationsError,
    refetch: refetchNotifications,
  } = useNotifications()
  const markNotificationRead = useMarkNotificationRead()

  const navItems = user?.role === 'artisan' ? NAV_ITEMS_ARTISAN : NAV_ITEMS_COMPANY
  const notifications = extractNotifications(notificationsData).map((notification) => ({
    id: notification.id,
    type: notification.notification_type || 'general',
    title: notification.title || 'Notification',
    body: notification.body || '',
    time: formatNotificationTime(notification.delivered_at || notification.created_at),
    deliveredAt: formatNotificationDateTime(notification.delivered_at || notification.created_at),
    read: Boolean(notification.read_at),
    payload: parseNotificationPayload(notification.payload_json || notification.payload),
    raw: notification,
  }))
  const unreadCount = notifications.filter((notification) => !notification.read).length

  useEffect(() => {
    const handler = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification?.read && notification?.id) {
      await markNotificationRead.mutateAsync(notification.id)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mist dark:bg-bg">
      <aside className="hidden lg:flex w-[240px] xl:w-[260px] flex-col flex-shrink-0 bg-primary dark:bg-surface relative z-20 border-r border-transparent dark:border-border">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <SidebarContent
          user={user}
          signOut={signOut}
          onNavClick={() => { }}
          navItems={navItems}
        />
      </aside>

      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-primary dark:bg-surface z-50 flex flex-col transition-transform duration-300 ease-out lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-primary-light hover:text-white hover:bg-white/10 transition-all dark:hover:bg-mist dark:hover:text-text-1"
        >
          <X size={18} />
        </button>
        <SidebarContent
          user={user}
          signOut={signOut}
          onNavClick={() => setDrawerOpen(false)}
          navItems={navItems}
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex-shrink-0 h-16 lg:h-[72px] flex items-center justify-between px-2 sm:px-6 lg:px-8 bg-white dark:bg-surface border-b border-border z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-xl text-text-3 hover:bg-mist transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:block min-w-0">
              <p className="text-[15px] font-bold text-text-1 truncate">
                Welcome {user?.first_name || 'User'}
              </p>
            </div>
          </div>

          <div className="flex-1 max-[360px]:max-w-[170px] w-[182px] sm:max-w-[380px] max-[330px]:ml-1 ml-2 sm:mx-6">
            <label className="flex items-center gap-2.5 h-10 bg-mist dark:bg-mist rounded-2xl px-3.5 ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-surface transition-all cursor-text">
              <Search size={16} className="text-text-4 flex-shrink-0" strokeWidth={2} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search for hustlers"
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] sm:text-[14px] text-text-1 placeholder:text-text-4 font-medium"
              />
              <button className="flex-shrink-0 text-text-4 hover:text-primary transition-colors">
                <SlidersHorizontal size={15} strokeWidth={2} />
              </button>
            </label>
          </div>

          <div className="flex items-center max-[330px]:gap-[0px] gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-mist dark:hover:bg-mist transition-colors"
              aria-label="Open notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell size={19} strokeWidth={1.8} className="text-text-3 dark:text-text-2" />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white dark:ring-surface" />}
            </button>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-mist dark:hover:bg-mist transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <Sun size={18} strokeWidth={1.8} className="text-secondary" />
                : <Moon size={18} strokeWidth={1.8} className="text-text-3" />
              }
            </button>

            <div className="hidden sm:block w-px h-6 bg-border" />

            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity pl-0.5 group">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name || 'U'} ${user?.last_name || ''}`.trim())}&background=0A2318&color=F6DE83&bold=true&size=64`}
                alt={`${user?.first_name || ''} ${user?.last_name || ''}`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-primary/10 flex-shrink-0"
              />
              <div className="hidden md:block text-left">
                <p className="text-[13px] font-bold text-text-1 leading-tight">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}</p>
                <p className="text-[11px] text-text-4 leading-tight">{user?.email || ''}</p>
              </div>
              <ChevronDown size={15} strokeWidth={2} className="hidden md:block text-text-4 group-hover:text-text-1 transition-colors" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth [scrollbar-width:none] relative">
          <ToastContainer />
          <NotificationPanel
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            notifications={notifications}
            isLoading={notificationsLoading}
            isError={notificationsError}
            onRetry={refetchNotifications}
            onNotificationClick={handleNotificationClick}
            pendingNotificationId={markNotificationRead.variables ?? null}
          />
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
