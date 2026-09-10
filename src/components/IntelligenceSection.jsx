import { useRef, useEffect, useState } from 'react'
import styles from './IntelligenceSection.module.css'

const MODULES = [
  {
    num: 'A',
    title: 'PROBLEM CLASSIFICATION',
    desc: 'Reports are categorized into problem types — infrastructure, academic, administrative, safety — based on their content.',
    tag: 'SEMANTIC',
  },
  {
    num: 'B',
    title: 'SEMANTIC SIMILARITY',
    desc: 'Different wordings of the same problem are recognized as related, regardless of how each student describes it.',
    tag: 'NLP',
  },
  {
    num: 'C',
    title: 'RECURRING ISSUE DETECTION',
    desc: 'Problems that appear repeatedly across multiple reports and time periods are flagged as systemic issues.',
    tag: 'PATTERN',
  },
  {
    num: 'D',
    title: 'SEVERITY RECOMMENDATION',
    desc: 'The system evaluates impact, frequency, and affected areas to suggest an appropriate severity level.',
    tag: 'ANALYSIS',
  },
  {
    num: 'E',
    title: 'DEPARTMENT ROUTING',
    desc: 'Each cluster is matched to the most responsible department based on problem type and institutional structure.',
    tag: 'ROUTING',
  },
  {
    num: 'F',
    title: 'PRIORITY CALCULATION',
    desc: 'A structured score based on severity, recurrence, number of reports, and time pending determines issue priority.',
    tag: 'SCORING',
  },
]

export default function IntelligenceSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [activeModule, setActiveModule] = useState(0)

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
      id="intelligence"
      aria-labelledby="intelligence-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>04</span>
        <span className={styles.sectionLine}></span>
        <span className={styles.sectionTag}>INTELLIGENCE LAYER</span>
      </div>

      <div className={styles.inner}>
        <div className={styles.headerRow}>
          <div className={`${styles.headerLeft} ${visible ? styles.revealed : ''}`}>
            <span className={styles.labelTag}>INTELLIGENCE</span>
            <h2 id="intelligence-heading" className={styles.heading}>
              NOT MAGIC.
              <br />
              <span className={styles.headingOutline}>STRUCTURED</span>
              <br />
              ANALYSIS.
            </h2>
          </div>
          <div className={`${styles.headerRight} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.15s' }}>
            <p className={styles.subtext}>
              Reclustify does not claim to be an all-knowing system. It applies
              systematic analytical methods to help institutions understand what
              students are experiencing — and what deserves attention first.
            </p>
            <div className={styles.principle}>
              <span className={styles.principleLabel}>DESIGN PRINCIPLE</span>
              <p className={styles.principleText}>
                "Transparent reasoning. Not black-box AI."
              </p>
            </div>
          </div>
        </div>

        {/* Modules grid */}
        <div className={styles.modulesGrid} role="list">
          {MODULES.map((mod, i) => (
            <div
              key={mod.num}
              className={`${styles.module} ${visible ? styles.moduleVisible : ''} ${activeModule === i ? styles.moduleActive : ''}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
              onMouseEnter={() => setActiveModule(i)}
              onFocus={() => setActiveModule(i)}
              role="listitem"
              tabIndex={0}
              aria-label={`Module ${mod.num}: ${mod.title} — ${mod.desc}`}
            >
              <div className={styles.moduleTop}>
                <div className={styles.moduleNum}>{mod.num}</div>
                <div className={styles.moduleTag}>{mod.tag}</div>
              </div>
              <div className={styles.moduleTitle}>{mod.title}</div>
              <p className={styles.moduleDesc}>{mod.desc}</p>
              <div className={styles.moduleCorner} aria-hidden="true">
                <div className={styles.cornerLine1}></div>
                <div className={styles.cornerLine2}></div>
              </div>
            </div>
          ))}
        </div>

        {/* System diagram */}
        <div className={`${styles.systemDiagram} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.5s' }}>
          <div className={styles.diagramLabel}>SYSTEM PIPELINE</div>
          <div className={styles.pipeline} aria-label="System pipeline: Report → Classify → Cluster → Score → Route → Resolve">
            {['REPORT', 'CLASSIFY', 'CLUSTER', 'SCORE', 'ROUTE', 'RESOLVE'].map((step, i) => (
              <div key={step} className={styles.pipelineStep}>
                <div className={styles.pipelineNode}>
                  <span>{step}</span>
                </div>
                {i < 5 && <div className={styles.pipelineArrow} aria-hidden="true">→</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
