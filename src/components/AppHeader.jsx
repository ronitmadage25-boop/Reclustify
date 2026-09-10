import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AppHeader.module.css'

export default function AppHeader() {
  const { user, userRole, currentScreen, setCurrentScreen, userProfile, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isStudent = userRole === 'student'
  const isAdmin = userRole === 'admin'

  const handleNav = (screen) => {
    setCurrentScreen(screen)
    setMobileMenuOpen(false)
  }

  const collegeDisplay = userProfile.college || 'CAMPUS INTELLIGENCE'

  return (
    <header className={styles.header} role="banner">
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.left}>
          <button
            type="button"
            className={styles.brandBtn}
            onClick={() => handleNav(isAdmin ? 'admin-dashboard' : 'student-dashboard')}
            aria-label="Reclustify Dashboard Home"
          >
            <span className={styles.wordmark}>RECLUSTIFY</span>
            <span className={styles.campusTag}>{collegeDisplay}</span>
          </button>

          {userRole && (
            <span className={`${styles.roleBadge} ${isAdmin ? styles.adminBadge : styles.studentBadge}`}>
              {isAdmin ? 'ADMINISTRATOR' : 'STUDENT'}
            </span>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Application navigation">
          {isStudent && userProfile.onboardingComplete && (
            <ul className={styles.navList} role="list">
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'student-dashboard' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('student-dashboard')}
                >
                  OVERVIEW
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'report-problem' || currentScreen === 'ai-analysis-preview' || currentScreen === 'submission-success' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('report-problem')}
                >
                  REPORT A PROBLEM +
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'my-reports' || currentScreen === 'report-tracking' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('my-reports')}
                >
                  MY REPORTS
                </button>
              </li>
            </ul>
          )}

          {isAdmin && userProfile.onboardingComplete && (
            <ul className={styles.navList} role="list">
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'admin-dashboard' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('admin-dashboard')}
                >
                  OVERVIEW
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'admin-all-issues' || currentScreen === 'admin-issue-details' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('admin-all-issues')}
                >
                  ALL ISSUES
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'admin-analytics' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('admin-analytics')}
                >
                  ANALYTICS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'admin-departments' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('admin-departments')}
                >
                  DEPARTMENTS
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`${styles.navBtn} ${currentScreen === 'admin-settings' ? styles.activeNav : ''}`}
                  onClick={() => handleNav('admin-settings')}
                >
                  SETTINGS
                </button>
              </li>
            </ul>
          )}
        </nav>

        {/* User / Actions */}
        <div className={styles.right}>
          <button
            type="button"
            className={styles.landingBtn}
            onClick={() => handleNav('welcome')}
            title="View Public Landing Page"
          >
            VIEW LANDING
          </button>

          <div className={styles.userInfo} title={user?.email || 'Authenticated user'}>
            <div className={styles.avatar}>
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <span className={styles.userEmail}>{user?.email || 'Google User'}</span>
          </div>

          <button
            type="button"
            className={styles.signOutBtn}
            onClick={signOut}
            aria-label="Sign out"
          >
            SIGN OUT
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className={`${styles.mobileMenuBtn} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={styles.line}></span>
            <span className={styles.line}></span>
            <span className={styles.line}></span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileMeta}>
            <span className={styles.mobileRole}>{userRole ? userRole.toUpperCase() : 'USER'}</span>
            <span className={styles.mobileEmail}>{user?.email}</span>
          </div>
          <ul className={styles.mobileList} role="list">
            {isStudent && userProfile.onboardingComplete && (
              <>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('student-dashboard')}>
                    OVERVIEW
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('report-problem')}>
                    REPORT A PROBLEM +
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('my-reports')}>
                    MY REPORTS
                  </button>
                </li>
              </>
            )}

            {isAdmin && userProfile.onboardingComplete && (
              <>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('admin-dashboard')}>
                    OVERVIEW
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('admin-all-issues')}>
                    ALL ISSUES
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('admin-analytics')}>
                    ANALYTICS
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('admin-departments')}>
                    DEPARTMENTS
                  </button>
                </li>
                <li>
                  <button type="button" className={styles.mobileItem} onClick={() => handleNav('admin-settings')}>
                    SETTINGS
                  </button>
                </li>
              </>
            )}

            <li>
              <button type="button" className={styles.mobileItem} onClick={() => handleNav('welcome')}>
                VIEW LANDING PAGE
              </button>
            </li>
            <li>
              <button type="button" className={`${styles.mobileItem} ${styles.mobileSignOut}`} onClick={signOut}>
                SIGN OUT
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
