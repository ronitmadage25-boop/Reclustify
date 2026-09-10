import { useRef, useEffect, useState } from 'react'
import styles from './StatementSection.module.css'

export default function StatementSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.25 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="statement-heading"
    >
      {/* Background accent */}
      <div className={styles.bgAccent} aria-hidden="true"></div>
      <div className={styles.bgDotGrid} aria-hidden="true"></div>

      <div className={styles.inner}>
        <div className={styles.content}>
          {/* Section ID */}
          <div className={`${styles.sectionId} ${visible ? styles.revealed : ''}`} aria-hidden="true">
            <span className={styles.sectionNum}>08</span>
            <span className={styles.sectionLine}></span>
          </div>

          {/* Main statement */}
          <h2
            id="statement-heading"
            className={`${styles.statement} ${visible ? styles.statementVisible : ''}`}
            aria-label="One report is a voice. A cluster is a signal. A resolution is an outcome."
          >
            <span
              className={`${styles.line} ${styles.line1} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              ONE REPORT IS
            </span>
            <span
              className={`${styles.line} ${styles.lineAccent} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.25s' }}
            >
              A VOICE.
            </span>
            <span
              className={`${styles.lineSeparator} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.4s' }}
              aria-hidden="true"
            >
              <span></span>
            </span>
            <span
              className={`${styles.line} ${styles.line2} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.5s' }}
            >
              A CLUSTER IS
            </span>
            <span
              className={`${styles.line} ${styles.lineOutline} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.65s' }}
            >
              A SIGNAL.
            </span>
            <span
              className={`${styles.lineSeparator} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.8s' }}
              aria-hidden="true"
            >
              <span></span>
            </span>
            <span
              className={`${styles.line} ${styles.line3} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '0.9s' }}
            >
              A RESOLUTION IS
            </span>
            <span
              className={`${styles.line} ${styles.lineInvert} ${visible ? styles.lineVisible : ''}`}
              style={{ transitionDelay: '1.05s' }}
            >
              AN OUTCOME.
            </span>
          </h2>

          {/* Sub-tagline */}
          <div className={`${styles.subTagline} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '1.2s' }}>
            <div className={styles.taglineLeft}>
              <span className={styles.taglineLabel}>THE RECLUSTIFY PHILOSOPHY</span>
              <p className={styles.taglineText}>
                Individual complaints are the symptom. Reclustify identifies the disease.
              </p>
            </div>
            <div className={styles.taglineRight} aria-hidden="true">
              <div className={styles.taglineSymbol}>→</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
