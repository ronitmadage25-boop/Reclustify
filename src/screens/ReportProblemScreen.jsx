import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function ReportProblemScreen({ onAnalyze }) {
  const { setCurrentScreen, userProfile } = useAuth()
  const [category, setCategory] = useState('IT & NETWORK')
  const [location, setLocation] = useState('Science Block, Lab 3')
  const [title, setTitle] = useState('Wi-Fi keeps dropping during practical sessions')
  const [description, setDescription] = useState('Computers in row 2 and 4 cannot connect to the college network router. Multiple students cannot complete assignment uploads.')
  const [severity, setSeverity] = useState('HIGH')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Please provide both an issue title and description.')
      return
    }

    const draftReport = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      severity,
      submittedAt: 'Just now',
      status: 'IN PROGRESS',
    }

    if (onAnalyze) {
      onAnalyze(draftReport)
    } else {
      setCurrentScreen('ai-analysis-preview')
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>REPORT PROTOCOL // 01</span>
        <span className={styles.tagline}>STRUCTURED COMPLAINT INTAKE</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={styles.badge}>NEW REPORT</span>
          <span className={styles.badgeSub}>{userProfile.college || 'CAMPUS NETWORK'}</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <h2 className={styles.formTitle}>
            REPORT A REAL
            <br />
            <span className={styles.titleAccent}>CAMPUS PROBLEM.</span>
          </h2>
          <p className={styles.formSubtitle}>
            Describe the problem in plain language. Reclustify will automatically parse the context, analyze semantic similarity against campus tickets, and cluster related reports together.
          </p>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.inputGrid}>
            {/* Category */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>CATEGORY</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="IT & NETWORK">IT & NETWORK</option>
                <option value="CAMPUS FACILITIES">CAMPUS FACILITIES</option>
                <option value="ACADEMIC LABS">ACADEMIC LABS</option>
                <option value="HOUSING & DORM">HOUSING & DORM</option>
                <option value="CAMPUS SAFETY">CAMPUS SAFETY</option>
              </select>
            </div>

            {/* Severity */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>ESTIMATED IMPACT / SEVERITY</label>
              <div className={styles.severityToggle}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`${styles.sevBtn} ${severity === lvl ? styles.sevActive : ''}`}
                    onClick={() => setSeverity(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>EXACT CAMPUS LOCATION</label>
              <input
                type="text"
                className={styles.input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Block, 2nd Floor, Lab 3"
                required
              />
            </div>

            {/* Title */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>PROBLEM SUMMARY</label>
              <input
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Internet disconnects every 5 minutes in computer lab"
                required
              />
            </div>

            {/* Description */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>DETAILED DESCRIPTION (PLAIN LANGUAGE)</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the recurring nature of the issue, who is affected, and any observable patterns..."
                required
              />
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('student-dashboard')}
            >
              ← CANCEL
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              RUN RECLUSTIFY ANALYSIS →
            </button>
          </div>
        </form>

        <div className={styles.formCardFooter}>
          <span>SEMANTIC ANALYSIS: ENABLED</span>
          <span>REPORTS ARE CLUSTERED ANONYMOUSLY</span>
        </div>
      </div>
    </div>
  )
}
