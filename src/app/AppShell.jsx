import { Suspense, useState, useEffect, useRef } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Home, Briefcase, MessageSquare, Wallet,
  Settings, LogOut, Search, Bell, ChevronDown,
  SlidersHorizontal, Menu, X, Sun, Moon
} from 'lucide-react'
import { useSignOut } from '../features/auth/auth.hooks.js'
import useAuthStore from '../features/auth/auth.store.js'
import PageSkeleton from '../shared/components/PageSkeleton.jsx'
import ToastContainer from '../shared/components/ToastContainer.jsx'
import { useTheme } from '../shared/hooks/useTheme.js'

const NAV_ITEMS = [
  { to: '/', label: 'My Feed', icon: Home },
  { to: '/my-hustles', label: 'My Hustles', icon: Briefcase },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/wallet', label: 'My Wallet', icon: Wallet },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/* ─── Sidebar inner content (shared between desktop + mobile drawer) ─── */
function SidebarContent({ onNavClick, user, signOut }) {
  return (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className="px-7 pt-9 pb-7">
        <span className="text-[22px] font-black tracking-tight text-white select-none">
          Hustle<span className="text-primary-light">.</span>io
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-150 ${isActive
                ? 'bg-primary-sat dark:bg-secondary text-white dark:text-primary shadow-sm'
                : 'text-mist dark:text-text-2 hover:text-white dark:hover:text-text-1 hover:bg-white/5 dark:hover:bg-white/8'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-mist dark:text-primary' : 'text-current transition-colors group-hover:text-mist'}
                />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-light" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="p-3 mt-auto space-y-1">
        {/* User micro-card */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
          <img
            src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name || 'U'} ${user?.last_name || ''}`.trim())}&background=1E4D35&color=4ADE80&bold=true&size=64`}
            alt={`${user?.first_name || ''} ${user?.last_name || ''}`}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-light/30 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-white truncate leading-tight">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}</p>
            <p className="text-[11px] text-mist dark:text-text-3 truncate leading-tight">{user?.email || ''}</p>
          </div>
        </div>

        {/* Log out */}
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 border border-primary-sat rounded-xl text-[14px] font-medium text-mist dark:text-text-3 hover:text-mist hover:bg-primary-sat transition-all group"
        >
          <LogOut size={18} strokeWidth={1.8} className="group-hover:text-mist transition-colors" />
          Log out
        </button>
      </div>
    </div>
  )
}

/* ─── Main AppShell ─────────────────────────────────────────────── */
export default function AppShell() {
  const user = useAuthStore((s) => s.user)
  const { mutate: signOut } = useSignOut()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const drawerRef = useRef(null)
  const { isDark, toggle: toggleTheme } = useTheme()

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerOpen && drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [drawerOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setDrawerOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-mist dark:bg-bg">

      {/* ══ DESKTOP SIDEBAR (hidden on mobile) ══════════════════════ */}
      <aside className="hidden lg:flex w-[240px] xl:w-[260px] flex-col flex-shrink-0 bg-primary dark:bg-surface relative z-20">
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <SidebarContent
          user={user}
          signOut={signOut}
          onNavClick={() => { }}
        />
      </aside>

      {/* ══ MOBILE DRAWER OVERLAY ════════════════════════════════════ */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ══ MOBILE DRAWER PANEL ══════════════════════════════════════ */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-primary dark:bg-[#1E1E1E] z-50 flex flex-col transition-transform duration-300 ease-out lg:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#7A9E8A] hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={18} />
        </button>
        <SidebarContent
          user={user}
          signOut={signOut}
          onNavClick={() => setDrawerOpen(false)}
        />
      </aside>

      {/* ══ MAIN CONTENT ═════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── TOP NAVBAR ─────────────────────────────────────────── */}
        <header className="flex-shrink-0 h-16 lg:h-[72px] flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#1E1E1E] border-b border-border dark:border-[#2E2E2E] z-10">

          {/* Left: hamburger (mobile) + welcome greeting */}
          <div className="flex items-center gap-3 min-w-0">

            {/* Hamburger — mobile only */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-text-3 hover:bg-mist transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            {/* Welcome text */}
            <div className="hidden sm:block min-w-0">
              <p className="text-[15px] font-bold text-text-1 truncate">
                Welcome {user?.first_name || 'User'} 👋
              </p>
            </div>
          </div>

          {/* Centre: Search bar */}
          <div className="flex-1 max-w-[380px] mx-3 sm:mx-6">
            <label className="flex items-center gap-2.5 h-10 bg-mist dark:bg-[#252525] rounded-2xl px-3.5
              ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white dark:focus-within:bg-[#2E2E2E] transition-all cursor-text">
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

          {/* Right: bell + divider + user */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {/* Notification bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-mist dark:hover:bg-white/10 transition-colors">
              <Bell size={19} strokeWidth={1.8} className="text-text-3 dark:text-[#CCCCCC]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-white dark:ring-[#1E1E1E]" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-mist dark:hover:bg-white/10 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark
                ? <Sun size={18} strokeWidth={1.8} className="text-secondary" />
                : <Moon size={18} strokeWidth={1.8} className="text-text-3" />
              }
            </button>

            <div className="hidden sm:block w-px h-6 bg-border dark:bg-[#2E2E2E]" />

            {/* User profile button */}
            <button className="flex items-center gap-2.5 hover:opacity-80 transition-opacity pl-0.5 group">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.first_name || 'U'} ${user?.last_name || ''}`.trim())}&background=0A2318&color=4ADE80&bold=true&size=64`}
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

        {/* ── PAGE CONTENT ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto scroll-smooth relative">
          <ToastContainer />
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </div>

      </main>
    </div >
  )
}
