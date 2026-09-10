import { useState, useEffect } from 'react'
import styles from './Nav.module.css'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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

          {/* CTA */}
          <button
            className={styles.ctaButton}
            aria-label="Get Started with Reclustify (coming soon)"
            tabIndex={0}
            type="button"
            disabled
            aria-disabled="true"
          >
            GET STARTED
            <span className={styles.ctaArrow} aria-hidden="true">→</span>
          </button>

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
            <button
              className={styles.mobileCtaButton}
              type="button"
              disabled
              aria-disabled="true"
            >
              GET STARTED →
            </button>
          </li>
        </ul>
      </div>
    </header>
  )
}
