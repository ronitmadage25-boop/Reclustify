import { useRef, useEffect, useState } from 'react'
import styles from './MethodSection.module.css'

const STEPS = [
  {
    num: '01',
    title: 'REPORT',
    desc: 'A student describes a real campus problem in plain language. No forms, no categories required.',
    icon: '↗',
    color: '#000',
  },
  {
    num: '02',
    title: 'UNDERSTAND',
    desc: 'The system interprets the problem semantically — understanding meaning, not just keywords.',
    icon: '◎',
    color: '#000',
  },
  {
    num: '03',
    title: 'RECLUSTER',
    desc: 'Similar reports are identified and connected. Isolated complaints become a collective signal.',
    icon: '⬡',
    color: '#ff3000',
  },
  {
    num: '04',
    title: 'PRIORITIZE',
    desc: 'Recurring, high-severity, and widely-reported problems rise to the surface automatically.',
    icon: '▲',
    color: '#000',
  },
  {
    num: '05',
    title: 'ASSIGN',
    desc: 'The right department receives the issue with full context — no manual routing required.',
    icon: '→',
    color: '#000',
  },
  {
    num: '06',
    title: 'RESOLVE',
    desc: 'Progress is tracked transparently. Students can see the status of real campus problems.',
    icon: '✓',
    color: '#000',
  },
  {
    num: '07',
    title: 'LEARN',
    desc: 'Historical data reveals recurring patterns. Institutions gain intelligence about systemic problems.',
    icon: '◈',
    color: '#000',
  },
]

export default function MethodSection() {
  const sectionRef = useRef(null)
  const [activeStep, setActiveStep] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          // Auto-step through steps on desktop
          let current = 0
          const interval = setInterval(() => {
            setActiveStep(current)
            current++
            if (current >= STEPS.length) {
              clearInterval(interval)
              setActiveStep(null)
            }
          }, 350)
        }
      },
      { threshold: 0.15 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      id="how-it-works"
      aria-labelledby="method-heading"
    >
      <div className={styles.sectionId} aria-hidden="true">
        <span className={styles.sectionNum}>02</span>
        <span className={styles.sectionLine}></span>
      </div>

      <div className={styles.inner}>
        {/* Header */}
        <div className={`${styles.header} ${visible ? styles.revealed : ''}`}>
          <div className={styles.labelTag}>THE RECLUSTIFY METHOD</div>
          <h2 id="method-heading" className={styles.heading}>
            FROM COMPLAINT<br />TO RESOLUTION.<br />
            <span className={styles.headingOutline}>SYSTEMATICALLY.</span>
          </h2>
          <p className={styles.subtext}>
            Seven stages. One integrated intelligence pipeline. No complaint falls through the cracks.
          </p>
        </div>

        {/* Steps */}
        <div className={styles.stepsContainer} role="list">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`${styles.step} ${visible ? styles.stepVisible : ''} ${activeStep === i || activeStep === null && visible ? styles.stepHighlight : ''}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
              onMouseEnter={() => setActiveStep(i)}
              onMouseLeave={() => setActiveStep(null)}
              role="listitem"
              tabIndex={0}
              aria-label={`Step ${step.num}: ${step.title} — ${step.desc}`}
            >
              <div className={styles.stepTop}>
                <span className={styles.stepNum}>{step.num}</span>
                <span
                  className={styles.stepIcon}
                  style={{ color: activeStep === i ? step.color : '#c0c0c0' }}
                  aria-hidden="true"
                >
                  {step.icon}
                </span>
              </div>
              <div className={styles.stepTitle}>{step.title}</div>
              <p className={styles.stepDesc}>{step.desc}</p>
              <div className={styles.stepBar} aria-hidden="true">
                <div
                  className={styles.stepBarFill}
                  style={{
                    width: activeStep === i ? '100%' : '0%',
                    background: step.color,
                  }}
                ></div>
              </div>

              {/* Connector arrow (not for last step) */}
              {i < STEPS.length - 1 && (
                <div className={styles.connector} aria-hidden="true">
                  <div className={styles.connectorLine}></div>
                  <div className={styles.connectorArrow}>→</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Flow summary */}
        <div className={`${styles.flowSummary} ${visible ? styles.revealed : ''}`} style={{ transitionDelay: '0.7s' }}>
          <div className={styles.flowText}>
            <span className={styles.flowLabel}>THE CORE IDEA</span>
            <p className={styles.flowBody}>
              Individual voices become collective signal. Collective signal becomes actionable intelligence.
              Actionable intelligence becomes campus-wide resolution.
            </p>
          </div>
          <div className={styles.flowTag}>
            <span>INDIVIDUAL VOICES</span>
            <span className={styles.flowArrow} aria-hidden="true">→</span>
            <span>COLLECTIVE SIGNAL</span>
            <span className={styles.flowArrow} aria-hidden="true">→</span>
            <span className={styles.flowEnd}>RESOLUTION</span>
          </div>
        </div>
      </div>
    </section>
  )
}
