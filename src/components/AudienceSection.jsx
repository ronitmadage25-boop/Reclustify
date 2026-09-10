import { useRef, useEffect, useState } from 'react'
import styles from './AudienceSection.module.css'

const STUDENT_POINTS = [
  'Report campus problems in plain language',
  'Track the progress of reported issues',
  'See when similar reports are grouped together',
  'Know that recurring problems become visible to decision-makers',
  'Understand the status of resolution',
]

const INSTITUTION_POINTS = [
  'Identify recurring campus problems automatically',
  'Prioritize issues based on frequency and severity',
  'Route issues to the responsible department',
  'Understand campus-wide problem trends over time',
  'Make data-driven operational decisions',
  'Learn from historical patterns to prevent recurrence',
]

export default function AudienceSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      id="for-institutions"
      aria-labelledby="audience-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>09</span>
        <span className={styles.sectionLine}></span>
        <span className={styles.sectionTag}>FOR STUDENTS & INSTITUTIONS</span>
      </div>

      <div className={styles.inner}>
        {/* Header */}
        <div className={`${styles.header} ${visible ? styles.revealed : ''}`}>
          <h2 id="audience-heading" className={styles.heading}>
            WHO IS<br />
            <span className={styles.headingAccent}>RECLUSTIFY</span><br />
            FOR?
          </h2>
          <p className={styles.subtext}>
            Reclustify serves two audiences simultaneously —
            and is more powerful because of the connection between them.
          </p>
        </div>

        {/* Two sides */}
        <div className={styles.sides}>
          {/* Students */}
          <div className={`${styles.side} ${styles.studentSide} ${visible ? styles.sideVisible : ''}`}>
            <div className={styles.sideHeader}>
              <div className={styles.sideTag}>FOR STUDENTS</div>
              <div className={styles.sideNumber}>01</div>
            </div>
            <div className={styles.sideDivider} aria-hidden="true"></div>
            <h3 className={styles.sideTitle}>
              YOUR VOICE
              <br />
              MATTERS.
            </h3>
            <p className={styles.sideDesc}>
              Students deserve to know that what they report is heard —
              and that when many students experience the same problem,
              it gets treated as the serious issue it is.
            </p>
            <ul className={styles.pointList} role="list">
              {STUDENT_POINTS.map((point, i) => (
                <li
                  key={i}
                  className={`${styles.point} ${visible ? styles.pointVisible : ''}`}
                  style={{ transitionDelay: `${0.15 + i * 0.08}s` }}
                >
                  <span className={styles.pointMarker} aria-hidden="true">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vertical divider */}
          <div className={styles.verticalDivider} aria-hidden="true">
            <div className={styles.dividerLine}></div>
            <div className={styles.dividerTag}>AND</div>
            <div className={styles.dividerLine}></div>
          </div>

          {/* Institutions */}
          <div className={`${styles.side} ${styles.institutionSide} ${visible ? styles.sideVisible : ''}`} style={{ transitionDelay: '0.15s' }}>
            <div className={styles.sideHeader}>
              <div className={styles.sideTag}>FOR INSTITUTIONS</div>
              <div className={styles.sideNumber}>02</div>
            </div>
            <div className={styles.sideDivider} aria-hidden="true"></div>
            <h3 className={styles.sideTitle}>
              CAMPUS
              <br />
              <span className={styles.sideTitleAccent}>INTELLIGENCE.</span>
            </h3>
            <p className={styles.sideDesc}>
              Institutions receive more than a list of complaints.
              They receive a structured understanding of what is actually
              wrong on campus — and what to fix first.
            </p>
            <ul className={styles.pointList} role="list">
              {INSTITUTION_POINTS.map((point, i) => (
                <li
                  key={i}
                  className={`${styles.point} ${visible ? styles.pointVisible : ''}`}
                  style={{ transitionDelay: `${0.25 + i * 0.07}s` }}
                >
                  <span className={`${styles.pointMarker} ${styles.pointMarkerRed}`} aria-hidden="true">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Multi-college */}
        <div className={`${styles.multiCollege} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.5s' }}>
          <div className={styles.mcLeft}>
            <span className={styles.mcLabel}>MULTI-COLLEGE DESIGN</span>
            <p className={styles.mcText}>
              Reclustify is designed for multiple institutions simultaneously.
              Each college maintains its own problem intelligence context.
              Complaints from one institution never affect another.
            </p>
          </div>
          <div className={styles.mcRight}>
            <div className={styles.mcDiagram} aria-label="Multi-college diagram: institutions feed into their own intelligence systems">
              {['COLLEGE A', 'COLLEGE B', 'COLLEGE C'].map((col, i) => (
                <div key={col} className={styles.mcInstitution}>
                  <div className={styles.mcInstitutionBox}>{col}</div>
                  <div className={styles.mcArrow} aria-hidden="true">↓</div>
                  <div className={styles.mcIntelligenceBox}>
                    <span>CAMPUS</span>
                    <span>INTELLIGENCE</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
