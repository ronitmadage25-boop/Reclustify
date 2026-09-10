import { useEffect, useRef, useState } from 'react'
import styles from './Hero.module.css'

// Individual report node for the clustering visualization
function ReportNode({ text, index, active, converging }) {
  return (
    <div
      className={`${styles.reportNode} ${active ? styles.nodeActive : ''} ${converging ? styles.nodeConverging : ''}`}
      style={{ '--delay': `${index * 0.15}s` }}
    >
      <div className={styles.nodeCorner} aria-hidden="true">R</div>
      <p className={styles.nodeText}>{text}</p>
      <div className={styles.nodeLine} aria-hidden="true"></div>
    </div>
  )
}

// Cluster result display
function ClusterResult({ visible }) {
  return (
    <div className={`${styles.clusterResult} ${visible ? styles.clusterVisible : ''}`} aria-live="polite">
      <div className={styles.clusterHeader}>
        <span className={styles.clusterBadge}>RECURRING ISSUE</span>
        <span className={styles.clusterCount}>3 REPORTS</span>
      </div>
      <div className={styles.clusterTitle}>LAB 3 WI-FI CONNECTIVITY</div>
      <div className={styles.clusterMeta}>
        <div className={styles.clusterMetaItem}>
          <span className={styles.metaLabel}>PRIORITY</span>
          <span className={`${styles.metaValue} ${styles.metaHigh}`}>HIGH</span>
        </div>
        <div className={styles.clusterMetaDivider} aria-hidden="true"></div>
        <div className={styles.clusterMetaItem}>
          <span className={styles.metaLabel}>DEPARTMENT</span>
          <span className={styles.metaValue}>IT</span>
        </div>
        <div className={styles.clusterMetaDivider} aria-hidden="true"></div>
        <div className={styles.clusterMetaItem}>
          <span className={styles.metaLabel}>STATUS</span>
          <span className={`${styles.metaValue} ${styles.metaAssigned}`}>ASSIGNED</span>
        </div>
      </div>
    </div>
  )
}

const REPORTS = [
  '"Wi-Fi not working in Lab 3"',
  '"Internet keeps disconnecting"',
  '"Cannot connect to college Wi-Fi"',
]

export default function Hero() {
  const [phase, setPhase] = useState(0) // 0: idle, 1: nodes active, 2: converging, 3: cluster formed
  const [hasStarted, setHasStarted] = useState(false)
  const sectionRef = useRef(null)
  const timeoutsRef = useRef([])

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  const addTimeout = (fn, delay) => {
    const id = setTimeout(fn, delay)
    timeoutsRef.current.push(id)
    return id
  }

  const runAnimation = () => {
    clearAllTimeouts()
    setPhase(0)
    addTimeout(() => setPhase(1), 300)
    addTimeout(() => setPhase(2), 2000)
    addTimeout(() => setPhase(3), 3200)
    addTimeout(() => {
      // Reset and loop
      setPhase(0)
      addTimeout(() => runAnimation(), 800)
    }, 6500)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          addTimeout(() => runAnimation(), 600)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      observer.disconnect()
      clearAllTimeouts()
    }
  }, [hasStarted])

  return (
    <section className={styles.hero} ref={sectionRef} aria-labelledby="hero-heading">
      {/* Background structural elements */}
      <div className={styles.heroBg} aria-hidden="true">
        <div className={styles.bgGrid}></div>
        <div className={styles.bgLine1}></div>
        <div className={styles.bgLine2}></div>
        <div className={styles.bgAccent}></div>
      </div>

      <div className={styles.heroContent}>
        {/* Left: Typography */}
        <div className={styles.heroLeft}>
          <div className={styles.heroLabel}>
            <span className={styles.labelDot} aria-hidden="true">●</span>
            CAMPUS PROBLEM INTELLIGENCE
          </div>

          <h1 id="hero-heading" className={styles.heroHeadline}>
            <span className={styles.headlineLine}>INDIVIDUAL</span>
            <span className={styles.headlineLine}>COMPLAINTS</span>
            <span className={`${styles.headlineLine} ${styles.headlineInvert}`}>
              <span>BECOME</span>
            </span>
            <span className={`${styles.headlineLine} ${styles.headlineOutline}`}>INTELLIGENCE.</span>
          </h1>

          <p className={styles.heroSubtext}>
            Students report real campus problems.
            Reclustify finds the patterns. Institutions solve
            the underlying issue — not just the symptom.
          </p>

          <div className={styles.heroCtas}>
            <button
              className={styles.heroPrimaryBtn}
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Get Started with Reclustify (coming soon)"
            >
              GET STARTED <span aria-hidden="true">→</span>
            </button>
            <a
              href="#how-it-works"
              className={styles.heroSecondaryBtn}
              onClick={(e) => {
                e.preventDefault()
                document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              SEE HOW IT WORKS ↓
            </a>
          </div>

          {/* Tagline */}
          <div className={styles.heroTagline} aria-label="Tagline: Report. Recluster. Resolve.">
            <span>REPORT</span>
            <span className={styles.taglineDot} aria-hidden="true">·</span>
            <span>RECLUSTER</span>
            <span className={styles.taglineDot} aria-hidden="true">·</span>
            <span>RESOLVE</span>
          </div>
        </div>

        {/* Right: Clustering visualization */}
        <div className={styles.heroRight} aria-label="Animated visualization showing reports clustering into a recurring issue">
          <div className={styles.vizContainer}>
            <div className={styles.vizHeader}>
              <span className={styles.vizLabel}>LIVE EXAMPLE</span>
              <div className={styles.vizIndicator} aria-hidden="true">
                <span className={styles.vizDot}></span>
                <span className={styles.vizDot}></span>
                <span className={styles.vizDot}></span>
              </div>
            </div>

            {/* Reports */}
            <div className={`${styles.reportNodes} ${phase >= 2 ? styles.nodesConverging : ''}`}>
              {REPORTS.map((text, i) => (
                <ReportNode
                  key={i}
                  text={text}
                  index={i}
                  active={phase >= 1}
                  converging={phase >= 2}
                />
              ))}
            </div>

            {/* Arrow */}
            <div className={`${styles.vizArrow} ${phase >= 2 ? styles.arrowVisible : ''}`} aria-hidden="true">
              <div className={styles.arrowLine}></div>
              <div className={styles.arrowLabel}>
                <span className={styles.arrowCount}>3 REPORTS</span>
                <span className={styles.arrowSub}>SEMANTIC SIMILARITY DETECTED</span>
              </div>
              <div className={styles.arrowHead}>↓</div>
            </div>

            {/* Result cluster */}
            <ClusterResult visible={phase >= 3} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <div className={styles.scrollLine}></div>
        <span className={styles.scrollText}>SCROLL</span>
      </div>
    </section>
  )
}
