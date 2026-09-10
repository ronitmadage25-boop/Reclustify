import { useRef, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FinalCTA.module.css'

export default function FinalCTA() {
  const { session, userRole, setCurrentScreen, setAuthModalOpen } = useAuth()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="cta-heading"
    >
      {/* Background */}
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgGrid}></div>
        <div className={styles.bgRedBar}></div>
        <div className={styles.bgWhiteBar}></div>
      </div>

      <div className={styles.inner}>
        {/* Main CTA content */}
        <div className={styles.ctaContent}>
          <div className={`${styles.topLabel} ${visible ? styles.revealed : ''}`}>
            <span className={styles.labelLine} aria-hidden="true"></span>
            <span className={styles.labelText}>RECLUSTIFY</span>
            <span className={styles.labelLine} aria-hidden="true"></span>
          </div>

          <h2
            id="cta-heading"
            className={`${styles.heading} ${visible ? styles.headingVisible : ''}`}
          >
            <span
              className={`${styles.headingLine} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              SEE THE PROBLEM
            </span>
            <span
              className={`${styles.headingLine} ${styles.headingLineAccent} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.25s' }}
            >
              BEHIND THE REPORT.
            </span>
          </h2>

          <div className={`${styles.ctaRow} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.5s' }}>
            {session ? (
              <button
                className={styles.ctaButton}
                type="button"
                onClick={() => setCurrentScreen(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                aria-label="Enter Dashboard"
              >
                <span>ENTER DASHBOARD</span>
                <span className={styles.ctaArrow} aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                className={styles.ctaButton}
                type="button"
                onClick={() => setAuthModalOpen(true)}
                aria-label="Get Started with Reclustify"
              >
                <span>GET STARTED</span>
                <span className={styles.ctaArrow} aria-hidden="true">→</span>
              </button>
            )}
            <div className={styles.ctaNote}>
              <span className={styles.ctaNoteTag}>AUTHENTICATION ENABLED</span>
              <p className={styles.ctaNoteText}>
                Connect instantly with your Google account.
              </p>
            </div>
          </div>

          {/* Tagline */}
          <div className={`${styles.tagline} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.65s' }}>
            <span>REPORT</span>
            <span className={styles.taglineSep} aria-hidden="true">·</span>
            <span>RECLUSTER</span>
            <span className={styles.taglineSep} aria-hidden="true">·</span>
            <span>RESOLVE</span>
          </div>
        </div>

        {/* Geometric accent */}
        <div className={styles.accentBlock} aria-hidden="true">
          <div className={styles.accentSquare}></div>
          <div className={styles.accentLines}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.accentLine} style={{ transitionDelay: `${i * 0.1}s` }}></div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer strip */}
      <div className={styles.footerStrip}>
        <div className={styles.footerInner}>
          <div className={styles.footerWordmark}>RECLUSTIFY</div>
          <div className={styles.footerTagline}>CAMPUS PROBLEM INTELLIGENCE</div>
          <div className={styles.footerYear}>© 2025</div>
        </div>
      </div>
    </section>
  )
}
