import { useRef, useEffect, useState } from 'react'
import styles from './ReclusterSection.module.css'

const REPORTS_DATA = [
  { id: 'r1', text: '"Wi-Fi doesn\'t work in Lab 3"', student: 'STUDENT A', time: '2 DAYS AGO' },
  { id: 'r2', text: '"Internet keeps dropping in Lab 3"', student: 'STUDENT B', time: '2 DAYS AGO' },
  { id: 'r3', text: '"Can\'t connect to college Wi-Fi"', student: 'STUDENT C', time: '1 DAY AGO' },
]

export default function ReclusterSection() {
  const sectionRef = useRef(null)
  const [phase, setPhase] = useState(0)
  const [visible, setVisible] = useState(false)
  const timeoutsRef = useRef([])

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  const clearAll = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const runLoop = () => {
    clearAll()
    setPhase(0)
    addTimeout(() => setPhase(1), 400)
    addTimeout(() => setPhase(2), 2000)
    addTimeout(() => setPhase(3), 3500)
    addTimeout(() => {
      setPhase(0)
      addTimeout(runLoop, 1000)
    }, 7000)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true)
          addTimeout(runLoop, 500)
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => { observer.disconnect(); clearAll() }
  }, [visible])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      id="recluster"
      aria-labelledby="recluster-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>03</span>
        <span className={styles.sectionLine}></span>
        <span className={styles.sectionTag}>CORE DIFFERENTIATOR</span>
      </div>

      <div className={styles.inner}>
        {/* Label */}
        <div className={`${styles.headerRow} ${visible ? styles.revealed : ''}`}>
          <div>
            <span className={styles.labelTag}>FROM REPORTS TO ONE REAL PROBLEM</span>
            <h2 id="recluster-heading" className={styles.heading}>
              3 VOICES.<br />
              <span className={styles.headingAccent}>1 SIGNAL.</span>
            </h2>
          </div>
          <p className={styles.subtext}>
            When Reclustify sees multiple students describing variations of the same problem,
            it identifies the underlying recurring issue — and surfaces it as a single,
            high-priority, actionable cluster.
          </p>
        </div>

        {/* Visualization */}
        <div className={styles.vizArea} aria-live="polite" aria-label="Animated clustering visualization">
          {/* Reports side */}
          <div className={styles.reportsCol}>
            <div className={`${styles.colHeader} ${visible ? styles.revealed : ''}`}>
              <span className={styles.colNum}>3</span>
              <span className={styles.colLabel}>INDIVIDUAL REPORTS</span>
            </div>
            {REPORTS_DATA.map((report, i) => (
              <div
                key={report.id}
                className={`${styles.reportCard} ${phase >= 1 ? styles.cardActive : ''} ${phase >= 2 ? styles.cardConverging : ''}`}
                style={{ transitionDelay: `${i * 0.12}s` }}
                aria-label={`Report from ${report.student}: ${report.text}`}
              >
                <div className={styles.cardMeta}>
                  <span className={styles.cardStudent}>{report.student}</span>
                  <span className={styles.cardTime}>{report.time}</span>
                </div>
                <p className={styles.cardText}>{report.text}</p>
                {/* Connection line */}
                <div
                  className={`${styles.connectionLine} ${phase >= 2 ? styles.lineActive : ''}`}
                  style={{ transitionDelay: `${i * 0.1 + 0.3}s` }}
                  aria-hidden="true"
                ></div>
              </div>
            ))}
          </div>

          {/* Center arrow */}
          <div className={styles.centerArrow} aria-hidden="true">
            <div className={`${styles.arrowContainer} ${phase >= 2 ? styles.arrowActive : ''}`}>
              <div className={styles.arrowTop}>
                <div className={styles.arrowLine}></div>
              </div>
              <div className={styles.arrowMid}>
                <span className={styles.arrowText}>SEMANTIC ANALYSIS</span>
                <span className={styles.arrowSub}>SIMILARITY DETECTED</span>
              </div>
              <div className={styles.arrowBottom}>
                <div className={styles.arrowLine}></div>
                <div className={styles.arrowHead}>↓</div>
              </div>
            </div>
          </div>

          {/* Cluster result */}
          <div className={styles.clusterCol}>
            <div className={`${styles.colHeader} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.2s' }}>
              <span className={styles.colNum}>1</span>
              <span className={styles.colLabel}>RECURRING ISSUE</span>
            </div>

            <div className={`${styles.clusterCard} ${phase >= 3 ? styles.clusterActive : ''}`}>
              <div className={styles.clusterBadgeRow}>
                <span className={styles.clusterBadge}>CLUSTER FORMED</span>
                <span className={styles.clusterReports}>3 REPORTS</span>
              </div>
              <div className={styles.clusterName}>
                LAB 3 WI-FI CONNECTIVITY
              </div>

              <div className={styles.clusterMetrics}>
                <div className={styles.metric}>
                  <div className={styles.metricBar}>
                    <div className={`${styles.metricFill} ${phase >= 3 ? styles.fillHigh : ''}`}></div>
                  </div>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricLabel}>PRIORITY</span>
                    <span className={`${styles.metricValue} ${styles.metricHigh}`}>HIGH</span>
                  </div>
                </div>
                <div className={styles.metricDivider} aria-hidden="true"></div>
                <div className={styles.metric}>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricLabel}>DEPARTMENT</span>
                    <span className={styles.metricValue}>IT</span>
                  </div>
                </div>
                <div className={styles.metricDivider} aria-hidden="true"></div>
                <div className={styles.metric}>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricLabel}>RELATED</span>
                    <span className={styles.metricValue}>3 REPORTS</span>
                  </div>
                </div>
              </div>

              <div className={styles.clusterStatus}>
                <div className={styles.statusDot} aria-hidden="true"></div>
                <span>ASSIGNED TO IT DEPARTMENT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom statement */}
        <div className={`${styles.bottomStatement} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.4s' }}>
          <span className={styles.statementLabel}>THE PRINCIPLE</span>
          <p className={styles.statement}>
            Individual voices become collective signal.
          </p>
        </div>
      </div>
    </section>
  )
}
