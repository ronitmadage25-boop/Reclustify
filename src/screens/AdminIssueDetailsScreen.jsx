import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

export default function AdminIssueDetailsScreen({ clusterId = 'C-104' }) {
  const { setCurrentScreen } = useAuth()
  const [currentStatus, setCurrentStatus] = useState('IN PROGRESS')
  const [statusUpdated, setStatusUpdated] = useState(false)

  const handleUpdateStatus = (newStatus) => {
    setCurrentStatus(newStatus)
    setStatusUpdated(true)
    setTimeout(() => setStatusUpdated(false), 2500)
  }

  const studentReports = [
    { id: 'REP-4091', text: '"Computers in row 2 and 4 cannot connect to the college network router."', time: 'Today · 10:14 AM', similarity: '94%' },
    { id: 'REP-4088', text: '"Wi-Fi disconnects every 5 minutes in computer lab 3 during python practicals."', time: 'Yesterday · 03:22 PM', similarity: '91%' },
    { id: 'REP-4081', text: '"Cannot connect to campus Wi-Fi AP in science block lab 3."', time: '2 days ago · 11:05 AM', similarity: '88%' },
    { id: 'REP-4075', text: '"Frequent internet timeouts on lab desktop workstations."', time: '2 days ago · 09:40 AM', similarity: '85%' },
  ]

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>CLUSTER INTELLIGENCE DOSSIER // #{clusterId}</div>
          <h1 className={styles.bannerTitle}>LAB 3 WI-FI CONNECTIVITY & DROPOUTS</h1>
          <p className={styles.bannerSub}>
            SCIENCE BLOCK ROOM 204 · ASSIGNED TO IT INFRASTRUCTURE · 4 CONVERGED REPORTS
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setCurrentScreen('admin-all-issues')}
          >
            ← BACK TO ALL ISSUES
          </button>
        </div>
      </div>

      {statusUpdated && (
        <div className={styles.updateAlert} role="status">
          ✓ CLUSTER STATUS UPDATED TO "{currentStatus}". AFFECTED STUDENTS NOTIFIED.
        </div>
      )}

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left: Reports & Semantic Similarity */}
        <div className={styles.colMain}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>CONVERGED STUDENT COMPLAINTS (4)</h2>
              <span className={styles.sectionSub}>PLAIN LANGUAGE REPORTS GROUPED BY SEMANTIC VECTOR MATCH</span>
            </div>
            <span className={styles.badgeHigh}>RECURRING SIGNAL</span>
          </div>

          <div className={styles.reportsConvergenceList}>
            {studentReports.map((item, i) => (
              <div key={item.id} className={styles.convergedReportCard}>
                <div className={styles.convergedTop}>
                  <span className={styles.convergedId}>{item.id}</span>
                  <span className={styles.similarityScore}>{item.similarity} SIMILARITY MATCH</span>
                </div>
                <p className={styles.convergedText}>{item.text}</p>
                <div className={styles.convergedTime}>{item.time}</div>
              </div>
            ))}
          </div>

          {/* Root Cause Hypothesis */}
          <div className={styles.hypothesisCard}>
            <div className={styles.hypothesisHeader}>
              <span className={styles.hypoTag}>AI PATTERN HYPOTHESIS</span>
              <span className={styles.hypoConfidence}>CONFIDENCE: 92%</span>
            </div>
            <p className={styles.hypoText}>
              Cluster analysis indicates a hardware DHCP lease exhaustion on Access Point AP-SB-204 rather than student device faults. Single access point replacement recommended to resolve all 4 complaints simultaneously.
            </p>
          </div>
        </div>

        {/* Right: Priority Engine & Status Management */}
        <div className={styles.colSide}>
          {/* Priority Factor Breakdown */}
          <div className={styles.priorityBox}>
            <div className={styles.priorityBoxHeader}>
              <span className={styles.priHeaderTitle}>PRIORITY SCORE BREAKDOWN</span>
              <span className={styles.priHeaderScore}>82 / 100</span>
            </div>

            <div className={styles.factorsList}>
              <div className={styles.factorRow}>
                <span className={styles.factorName}>SEVERITY (WEIGHT 30%)</span>
                <span className={styles.factorVal}>HIGH (85%)</span>
              </div>
              <div className={styles.factorBarWrap}>
                <div className={styles.factorBarFill} style={{ width: '85%' }}></div>
              </div>

              <div className={styles.factorRow}>
                <span className={styles.factorName}>REPORTS VOLUME (WEIGHT 25%)</span>
                <span className={styles.factorVal}>4 REPORTS (70%)</span>
              </div>
              <div className={styles.factorBarWrap}>
                <div className={styles.factorBarFill} style={{ width: '70%' }}></div>
              </div>

              <div className={styles.factorRow}>
                <span className={styles.factorName}>RECURRENCE (WEIGHT 20%)</span>
                <span className={styles.factorVal}>PERSISTENT (80%)</span>
              </div>
              <div className={styles.factorBarWrap}>
                <div className={styles.factorBarFill} style={{ width: '80%' }}></div>
              </div>

              <div className={styles.factorRow}>
                <span className={styles.factorName}>LOCATION IMPACT (WEIGHT 15%)</span>
                <span className={styles.factorVal}>ACADEMIC LAB (60%)</span>
              </div>
              <div className={styles.factorBarWrap}>
                <div className={styles.factorBarFill} style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>

          {/* Status Control Card */}
          <div className={styles.statusControlCard}>
            <span className={styles.cardHeaderSmall}>STATUS & DISPATCH CONTROL</span>
            <div className={styles.currentStatusDisplay}>
              CURRENT: <strong>{currentStatus}</strong>
            </div>

            <div className={styles.statusButtons}>
              <button
                type="button"
                className={`${styles.statusActionBtn} ${currentStatus === 'ASSIGNED' ? styles.statusBtnActive : ''}`}
                onClick={() => handleUpdateStatus('ASSIGNED')}
              >
                MARK ASSIGNED
              </button>
              <button
                type="button"
                className={`${styles.statusActionBtn} ${currentStatus === 'IN PROGRESS' ? styles.statusBtnActive : ''}`}
                onClick={() => handleUpdateStatus('IN PROGRESS')}
              >
                MARK IN PROGRESS
              </button>
              <button
                type="button"
                className={`${styles.statusActionBtn} ${currentStatus === 'RESOLVED' ? styles.statusBtnResolved : ''}`}
                onClick={() => handleUpdateStatus('RESOLVED')}
              >
                MARK RESOLVED ✓
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
