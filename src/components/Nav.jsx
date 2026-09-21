import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './Nav.module.css'

export default function Nav() {
  const { session, userRole, setCurrentScreen, setAuthModalOpen, signOut, userProfile } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const getDashboardScreen = () => {
    if (userProfile?.onboardingComplete && userProfile?.collegeId) {
      return userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard'
    }
    return 'role-selection'
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (e, href) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <nav className={styles.nav} aria-label="Main navigation">
        <div className={styles.navInner}>
          {/* Wordmark */}
          <a href="/" className={styles.wordmark} aria-label="Reclustify — Home">
            <span className={styles.wordmarkMain}>RECLUSTIFY</span>
            <span className={styles.wordmarkTag}>CAMPUS INTELLIGENCE</span>
          </a>

          {/* Desktop Links */}
          <ul className={styles.navLinks} role="list">
            <li>
              <a
                href="#how-it-works"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, '#how-it-works')}
              >
                HOW IT WORKS
              </a>
            </li>
            <li>
              <a
                href="#intelligence"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, '#intelligence')}
              >
                INTELLIGENCE
              </a>
            </li>
            <li>
              <a
                href="#for-institutions"
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, '#for-institutions')}
              >
                FOR INSTITUTIONS
              </a>
            </li>
          </ul>

          {/* CTA / Auth */}
          {session ? (
            <div className={styles.authNavGroup}>
              <button
                className={styles.ctaButton}
                onClick={() => setCurrentScreen(getDashboardScreen())}
                type="button"
                aria-label="Go to Dashboard"
              >
                DASHBOARD
                <span className={styles.ctaArrow} aria-hidden="true">→</span>
              </button>
              <button
                className={styles.signOutBtn}
                onClick={signOut}
                type="button"
                aria-label="Sign out"
              >
                SIGN OUT
              </button>
            </div>
          ) : (
            <div className={styles.authNavGroup}>
              <a
                href="/reclustify.apk"
                className={styles.downloadBtn}
                download="reclustify.apk"
                aria-label="Download Reclustify Android app"
              >
                ↓ GET THE APP
              </a>
              <button
                className={styles.ctaButton}
                onClick={() => setAuthModalOpen(true)}
                aria-label="Get Started with Reclustify"
                tabIndex={0}
                type="button"
              >
                GET STARTED
                <span className={styles.ctaArrow} aria-hidden="true">→</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className={`${styles.menuToggle} ${menuOpen ? styles.menuOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            <span className={styles.menuLine}></span>
            <span className={styles.menuLine}></span>
            <span className={styles.menuLine}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
      >
        <ul role="list">
          <li>
            <a href="#how-it-works" className={styles.mobileLink} onClick={(e) => handleNavClick(e, '#how-it-works')}>
              <span className={styles.mobileLinkNumber}>01</span>HOW IT WORKS
            </a>
          </li>
          <li>
            <a href="#intelligence" className={styles.mobileLink} onClick={(e) => handleNavClick(e, '#intelligence')}>
              <span className={styles.mobileLinkNumber}>02</span>INTELLIGENCE
            </a>
          </li>
          <li>
            <a href="#for-institutions" className={styles.mobileLink} onClick={(e) => handleNavClick(e, '#for-institutions')}>
              <span className={styles.mobileLinkNumber}>03</span>FOR INSTITUTIONS
            </a>
          </li>
          <li>
            {session ? (
              <button
                className={styles.mobileCtaButton}
                type="button"
                onClick={() => {
                  setCurrentScreen(getDashboardScreen())
                  setMenuOpen(false)
                }}
              >
                DASHBOARD →
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a
                  href="/reclustify.apk"
                  download="reclustify.apk"
                  className={styles.mobileDownloadBtn}
                  onClick={() => setMenuOpen(false)}
                >
                  ↓ GET THE APP
                </a>
                <button
                  className={styles.mobileCtaButton}
                  type="button"
                  onClick={() => {
                    setAuthModalOpen(true)
                    setMenuOpen(false)
                  }}
                >
                  GET STARTED →
                </button>
              </div>
            )}
          </li>
        </ul>
      </div>
    </header>
  )
}
