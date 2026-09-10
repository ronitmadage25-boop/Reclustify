import { useRef, useEffect, useState } from 'react'
import styles from './PrioritySection.module.css'

const FACTORS = [
  { label: 'SEVERITY', weight: 30, value: 'HIGH', fill: 85 },
  { label: 'RELATED REPORTS', weight: 25, value: '4 REPORTS', fill: 70 },
  { label: 'RECURRENCE', weight: 20, value: 'REPEAT', fill: 80 },
  { label: 'AFFECTED LOCATION', weight: 15, value: 'LAB 3', fill: 60 },
  { label: 'TIME PENDING', weight: 10, value: '2 DAYS', fill: 50 },
]

export default function PrioritySection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [barsActive, setBarsActive] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setTimeout(() => setBarsActive(true), 600)
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const totalScore = barsActive ? 82 : 0

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="priority-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>05</span>
        <span className={styles.sectionLine}></span>
        <span className={styles.sectionTag}>PRIORITY ENGINE</span>
      </div>

      <div className={styles.inner}>
        <div className={styles.layout}>
          {/* Left */}
          <div className={styles.leftCol}>
            <div className={`${styles.headerBlock} ${visible ? styles.revealed : ''}`}>
              <span className={styles.labelTag}>PRIORITY</span>
              <h2 id="priority-heading" className={styles.heading}>
                NOT ALL
                <br />
                PROBLEMS
                <br />
                <span className={styles.headingAccent}>ARE EQUAL.</span>
              </h2>
              <p className={styles.subtext}>
                Reclustify does not treat complaints on a first-come-first-served basis.
                Priority is determined by a structured combination of factors — transparent,
                consistent, and explainable.
              </p>
            </div>

            {/* Example high priority card */}
            <div className={`${styles.exampleCard} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.25s' }}>
              <div className={styles.exampleHeader}>
                <span className={styles.exampleBadge}>EXAMPLE</span>
                <span className={styles.examplePriority} aria-label="High Priority">HIGH PRIORITY</span>
              </div>
              <div className={styles.exampleContent}>
                <div className={styles.exampleStat}>
                  <span className={styles.statNum}>4</span>
                  <span className={styles.statLabel}>students reported<br />the same problem</span>
                </div>
                <div className={styles.exampleStat}>
                  <span className={styles.statNum}>2</span>
                  <span className={styles.statLabel}>days<br />pending</span>
                </div>
              </div>
              <p className={styles.exampleNote}>
                "LAB 3 WI-FI CONNECTIVITY" — 4 related reports in the last 2 days.
                Classified HIGH. Assigned to IT Department.
              </p>
            </div>
          </div>

          {/* Right — Factor breakdown */}
          <div className={styles.rightCol}>
            <div className={`${styles.factorsHeader} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.1s' }}>
              <span className={styles.factorsTitle}>PRIORITY FACTORS</span>
              <span className={styles.factorsSub}>ILLUSTRATIVE EXAMPLE</span>
            </div>

            <div className={styles.factors} role="list">
              {FACTORS.map((factor, i) => (
                <div
                  key={factor.label}
                  className={`${styles.factor} ${visible ? styles.factorVisible : ''}`}
                  style={{ transitionDelay: `${0.2 + i * 0.1}s` }}
                  role="listitem"
                  aria-label={`${factor.label}: ${factor.value}, weight ${factor.weight}%`}
                >
                  <div className={styles.factorTop}>
                    <span className={styles.factorLabel}>{factor.label}</span>
                    <span className={styles.factorValue}>{factor.value}</span>
                  </div>
                  <div className={styles.factorBarContainer}>
                    <div
                      className={styles.factorBar}
                      style={{
                        width: barsActive ? `${factor.fill}%` : '0%',
                        transitionDelay: `${0.3 + i * 0.1}s`,
                      }}
                      role="progressbar"
                      aria-valuenow={barsActive ? factor.fill : 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${factor.label} score`}
                    ></div>
                  </div>
                  <div className={styles.factorWeight}>WEIGHT: {factor.weight}%</div>
                </div>
              ))}
            </div>

            {/* Total score */}
            <div className={`${styles.totalScore} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.8s' }}>
              <div className={styles.scoreLabel}>PRIORITY SCORE</div>
              <div className={styles.scoreValue}>
                <span
                  className={styles.scoreNum}
                  style={{
                    transition: 'all 1s ease 0.8s',
                    opacity: barsActive ? 1 : 0,
                  }}
                >
                  {barsActive ? '82' : '—'}
                </span>
                <span className={styles.scoreMax}>/100</span>
              </div>
              <div className={`${styles.scoreBadge} ${barsActive ? styles.badgeHigh : ''}`}>
                {barsActive ? 'HIGH PRIORITY' : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
