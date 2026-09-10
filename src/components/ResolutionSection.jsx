import { useRef, useEffect, useState } from 'react'
import styles from './ResolutionSection.module.css'

const STATUS_STEPS = [
  { step: '01', label: 'IDENTIFIED', sub: 'Cluster formed from 4 reports', active: true },
  { step: '02', label: 'PRIORITIZED', sub: 'Marked HIGH priority', active: true },
  { step: '03', label: 'ASSIGNED', sub: 'IT Department notified', active: true },
  { step: '04', label: 'IN PROGRESS', sub: 'Work order opened', active: true },
  { step: '05', label: 'RESOLVED', sub: 'Issue confirmed fixed', active: false },
]

export default function ResolutionSection() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true)
          let step = 0
          const interval = setInterval(() => {
            setCurrentStep(step)
            step++
            if (step >= STATUS_STEPS.length) clearInterval(interval)
          }, 500)
        }
      },
      { threshold: 0.2 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [visible])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      id="resolution"
      aria-labelledby="resolution-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>06</span>
        <span className={styles.sectionLine}></span>
        <span className={styles.sectionTag}>FROM ISSUE TO RESOLUTION</span>
      </div>

      <div className={styles.inner}>
        <div className={styles.layout}>
          {/* Left */}
          <div className={styles.leftCol}>
            <div className={`${styles.header} ${visible ? styles.revealed : ''}`}>
              <span className={styles.labelTag}>RESOLUTION TRACKING</span>
              <h2 id="resolution-heading" className={styles.heading}>
                FROM
                <br />
                PROBLEM
                <br />
                <span className={styles.headingAccent}>TO OUTCOME.</span>
              </h2>
              <p className={styles.subtext}>
                Once a cluster is formed and assigned, progress is tracked at every stage.
                Students see movement. Institutions stay accountable.
                Nothing disappears into a void.
              </p>
            </div>

            {/* Issue card */}
            <div className={`${styles.issueCard} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.2s' }}>
              <div className={styles.issueHeader}>
                <span className={styles.issueBadge}>CLUSTER</span>
                <span className={styles.issueReports}>4 REPORTS</span>
              </div>
              <div className={styles.issueName}>LAB 3 WI-FI CONNECTIVITY</div>
              <div className={styles.issueMeta}>
                <div className={styles.issueMetaItem}>
                  <span className={styles.issueMetaLabel}>PRIORITY</span>
                  <span className={`${styles.issueMetaValue} ${styles.metaHigh}`}>HIGH</span>
                </div>
                <div className={styles.issueMetaItem}>
                  <span className={styles.issueMetaLabel}>DEPARTMENT</span>
                  <span className={styles.issueMetaValue}>IT</span>
                </div>
                <div className={styles.issueMetaItem}>
                  <span className={styles.issueMetaLabel}>SINCE</span>
                  <span className={styles.issueMetaValue}>2 DAYS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Status pipeline */}
          <div className={styles.rightCol}>
            <div className={`${styles.pipelineHeader} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.1s' }}>
              <span className={styles.pipelineTitle}>RESOLUTION PIPELINE</span>
              <span className={styles.pipelineSub}>LIVE STATUS TRACKING</span>
            </div>

            <div className={styles.statusPipeline} role="list" aria-label="Resolution status steps">
              {STATUS_STEPS.map((s, i) => (
                <div
                  key={s.step}
                  className={`${styles.statusStep} ${i <= currentStep ? styles.stepActive : ''} ${i === currentStep ? styles.stepCurrent : ''}`}
                  style={{ transitionDelay: `${i * 0.1}s` }}
                  role="listitem"
                  aria-current={i === currentStep ? 'step' : undefined}
                  aria-label={`Step ${s.step}: ${s.label} — ${s.sub}`}
                >
                  <div className={styles.stepLeft}>
                    <div className={styles.stepIndicator} aria-hidden="true">
                      <div className={styles.stepCircle}>
                        {i <= currentStep ? (
                          <span className={styles.checkmark}>✓</span>
                        ) : (
                          <span className={styles.stepNumLabel}>{s.step}</span>
                        )}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`${styles.stepConnector} ${i < currentStep ? styles.connectorActive : ''}`}></div>
                      )}
                    </div>
                  </div>
                  <div className={styles.stepContent}>
                    <div className={styles.stepLabel}>{s.label}</div>
                    <div className={styles.stepSub}>{s.sub}</div>
                  </div>
                  {i === currentStep && (
                    <div className={styles.stepCurrentTag} aria-hidden="true">CURRENT</div>
                  )}
                </div>
              ))}
            </div>

            {/* Department assignment */}
            <div className={`${styles.assignmentCard} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.8s' }}>
              <div className={styles.assignmentArrow} aria-hidden="true">↓</div>
              <div className={styles.assignmentLabel}>ASSIGNED TO</div>
              <div className={styles.assignmentDept}>IT DEPARTMENT</div>
              <div className={styles.assignmentStatus}>
                <span className={styles.assignmentDot} aria-hidden="true"></span>
                IN PROGRESS
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
