import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { HustleLogo } from '../../../shared/components/HustleLogo'
import '../css/PublicNavbar.css'

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Who we are', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export default function PublicNavbar({ className = '' }) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''

    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const isNavItemActive = (item) => (
    location.pathname === item.path
    || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`))
  )

  return (
    <>
      <header className={`public-navbar ${className}`}>
        <div className="public-navbar__inner">
          <Link to="/" className="public-navbar__logo" aria-label="Hustle home">
            <HustleLogo />
          </Link>

          <nav className="public-navbar__nav" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const active = isNavItemActive(item)

              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`public-navbar__link ${active ? 'is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="public-navbar__auth">
            <Link to="/sign-in" className="public-navbar__auth-link">
              Login
            </Link>
            <Link to="/sign-up" className="public-navbar__auth-link">
              Register
            </Link>
          </div>

          <div className="public-navbar__mobile-actions">
            <Link to="/sign-in" className="public-navbar__mobile-auth-link">
              Login
            </Link>
            <Link to="/sign-up" className="public-navbar__mobile-auth-link public-navbar__mobile-auth-link--primary">
              Register
            </Link>

            <button
              className="public-navbar__menu-button"
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={28} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <button
          className="public-navbar__overlay"
          type="button"
          onClick={closeMobileMenu}
          aria-label="Close menu"
        />
      )}

      <aside className={`public-navbar__drawer ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden={!mobileMenuOpen}>
        <div className="public-navbar__drawer-header">
          <HustleLogo color="white" />
          <button
            className="public-navbar__drawer-close"
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            <X size={28} strokeWidth={2.5} />
          </button>
        </div>

        <nav className="public-navbar__drawer-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item)

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`public-navbar__drawer-link ${active ? 'is-active' : ''}`}
                onClick={closeMobileMenu}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="public-navbar__drawer-footer">
          <Link to="/sign-in" className="public-navbar__drawer-auth public-navbar__drawer-auth--ghost" onClick={closeMobileMenu}>
            Login
          </Link>
          <Link to="/sign-up" className="public-navbar__drawer-auth" onClick={closeMobileMenu}>
            Join Free
          </Link>
        </div>
      </aside>
    </>
  )
}
