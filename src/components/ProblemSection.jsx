import { useRef, useEffect, useState } from 'react'
import styles from './ProblemSection.module.css'

const ISOLATED_REPORTS = [
  { label: 'TICKET #0847', text: '"Wi-Fi issue"', dept: '— UNCLASSIFIED' },
  { label: 'TICKET #0901', text: '"Internet slow"', dept: '— UNCLASSIFIED' },
  { label: 'TICKET #0934', text: '"Network disconnected"', dept: '— UNCLASSIFIED' },
  { label: 'TICKET #0982', text: '"Lab 3 problem"', dept: '— UNCLASSIFIED' },
  { label: 'TICKET #1003', text: '"Cannot connect"', dept: '— UNCLASSIFIED' },
  { label: 'TICKET #1027', text: '"Wi-Fi down again"', dept: '— UNCLASSIFIED' },
]

export default function ProblemSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true) } },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      id="problem"
      aria-labelledby="problem-heading"
    >
      {/* Section identifier */}
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>01</span>
        <span className={styles.sectionLine}></span>
      </div>

      <div className={styles.inner}>
        {/* Left column — editorial text */}
        <div className={styles.leftCol}>
          <div className={`${styles.labelRow} ${visible ? styles.revealed : ''}`}>
            <span className={styles.labelTag}>THE PROBLEM</span>
          </div>

          <h2
            id="problem-heading"
            className={`${styles.heading} ${visible ? styles.revealed : ''}`}
            style={{ transitionDelay: '0.1s' }}
          >
            THOUSANDS OF
            <br />
            COMPLAINTS.
            <br />
            <span className={styles.headingAccent}>VERY LITTLE</span>
            <br />
            CONTEXT.
          </h2>

          <p className={`${styles.body} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.25s' }}>
            Traditional complaint systems receive thousands of individual
            tickets. Every report is treated as a unique, isolated problem.
            Nobody sees the pattern. Nobody understands the recurring issue
            behind the noise.
          </p>

          <div className={`${styles.statBlock} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.35s' }}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>6×</div>
              <div className={styles.statLabel}>MORE REPORTS<br />SAME UNDERLYING ISSUE</div>
            </div>
            <div className={styles.statDivider} aria-hidden="true"></div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>PATTERNS<br />DETECTED</div>
            </div>
          </div>

          <div className={`${styles.comparison} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.45s' }}>
            <div className={styles.comparisonRow}>
              <span className={styles.compOld}>TRADITIONAL SYSTEM</span>
              <span className={styles.compArrow}>→</span>
              <span className={styles.compIssue}>6 SEPARATE TICKETS</span>
            </div>
            <div className={styles.comparisonRow}>
              <span className={styles.compNew}>RECLUSTIFY</span>
              <span className={styles.compArrow}>→</span>
              <span className={`${styles.compIssue} ${styles.compSolution}`}>1 RECURRING ISSUE</span>
            </div>
          </div>
        </div>

        {/* Right column — fragmented report visualization */}
        <div className={styles.rightCol}>
          <div className={`${styles.vizHeader} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.1s' }}>
            <span className={styles.vizTitle}>TRADITIONAL SYSTEM VIEW</span>
            <span className={styles.vizSubtitle}>ISOLATED. UNRELATED. LOST.</span>
          </div>

          <div className={styles.reportGrid}>
            {ISOLATED_REPORTS.map((r, i) => (
              <div
                key={i}
                className={`${styles.reportCard} ${visible ? styles.cardVisible : ''}`}
                style={{ transitionDelay: `${0.15 + i * 0.08}s` }}
                aria-label={`${r.label}: ${r.text}`}
              >
                <div className={styles.cardLabel}>{r.label}</div>
                <div className={styles.cardText}>{r.text}</div>
                <div className={styles.cardDept}>{r.dept}</div>
              </div>
            ))}
          </div>

          <div className={`${styles.noiseLabel} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.7s' }}>
            <div className={styles.noiseLine} aria-hidden="true"></div>
            <span>ALL TREATED AS UNRELATED</span>
            <div className={styles.noiseLine} aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
