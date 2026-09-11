import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchClusterDetails, updateClusterStatus } from '../services/db'
import styles from './AdminScreens.module.css'

// Fallback seed data for the demo cluster C-104 (shown when navigating from AdminDashboard)
const FALLBACK_CLUSTER = {
  id: 'b0000000-0000-0000-0000-000000000001',
  cluster_key: 'C-104',
  title: 'LAB 3 WI-FI CONNECTIVITY & DROPOUTS',
  department: 'IT INFRASTRUCTURE',
  location: 'Science Complex, Lab 3',
  priority: 'HIGH',
  priority_score: 82,
  status: 'IN PROGRESS',
  reports_count: 4,
}

const FALLBACK_COMPLAINTS = [
  { id: 'REP-4091', text: '"Computers in row 2 and 4 cannot connect to the college network router."', time: '2 days ago', similarity: '94%' },
  { id: 'REP-4088', text: '"Wi-Fi disconnects every 5 minutes in computer lab 3 during python practicals."', time: '2 days ago · 03:22 PM', similarity: '91%' },
  { id: 'REP-4081', text: '"Cannot connect to campus Wi-Fi AP in science block lab 3."', time: '3 days ago · 11:05 AM', similarity: '88%' },
  { id: 'REP-4075', text: '"Frequent internet timeouts on lab desktop workstations."', time: '3 days ago · 09:40 AM', similarity: '85%' },
]

export default function AdminIssueDetailsScreen({ clusterId = 'C-104', clusterDbId = null }) {
  const { setCurrentScreen } = useAuth()
  const [clusterData, setClusterData] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('IN PROGRESS')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusUpdated, setStatusUpdated] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)

      // Use the UUID if available, otherwise try to resolve from seed data
      const dbId = clusterDbId || (clusterId === 'C-104' ? 'b0000000-0000-0000-0000-000000000001' : null)

      if (dbId) {
        const result = await fetchClusterDetails(dbId)
        if (result?.cluster) {
          setClusterData(result.cluster)
          setCurrentStatus(result.cluster.status || 'IN PROGRESS')
          setComplaints(result.complaints || [])
          setLoading(false)
          return
        }
      }

      // Fallback to seed data if DB fetch fails or no UUID known
      setClusterData(FALLBACK_CLUSTER)
      setCurrentStatus(FALLBACK_CLUSTER.status)
      setComplaints(FALLBACK_COMPLAINTS)
      setLoading(false)
    }

    load()
  }, [clusterDbId, clusterId])

  const handleUpdateStatus = async (newStatus) => {
    if (statusUpdating) return
    setStatusUpdating(true)
    setCurrentStatus(newStatus)

    const dbId = clusterData?.id || clusterDbId
    if (dbId) {
      await updateClusterStatus(dbId, newStatus)
    }

    setStatusUpdating(false)
    setStatusUpdated(true)
    setTimeout(() => setStatusUpdated(false), 2500)
  }

  const cluster = clusterData || FALLBACK_CLUSTER
  const priorityScore = cluster.priority_score || 82
  const reportCount = cluster.reports_count || complaints.length

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>CLUSTER INTELLIGENCE DOSSIER // #{cluster.cluster_key || clusterId}</div>
          <h1 className={styles.bannerTitle}>{cluster.title || 'LOADING...'}</h1>
          <p className={styles.bannerSub}>
            {cluster.location ? `${cluster.location.toUpperCase()} · ` : ''}
            ASSIGNED TO {cluster.department || 'CAMPUS OPERATIONS'} · {reportCount} CONVERGED REPORTS
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

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '64px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#999' }}>
            LOADING CLUSTER DOSSIER...
          </span>
        </div>
      )}

      {/* Main Grid */}
      {!loading && (
        <div className={styles.mainGrid}>
          {/* Left: Reports & Semantic Similarity */}
          <div className={styles.colMain}>
            <div className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>CONVERGED STUDENT COMPLAINTS ({reportCount})</h2>
                <span className={styles.sectionSub}>PLAIN LANGUAGE REPORTS GROUPED BY SEMANTIC VECTOR MATCH</span>
              </div>
              <span className={styles.badgeHigh}>RECURRING SIGNAL</span>
            </div>

            <div className={styles.reportsConvergenceList}>
              {complaints.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  NO INDIVIDUAL COMPLAINT RECORDS FOUND
                </div>
              )}
              {complaints.map((item) => (
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
                <span className={styles.hypoConfidence}>CONFIDENCE: {Math.min(98, 70 + reportCount * 4)}%</span>
              </div>
              <p className={styles.hypoText}>
                Cluster analysis suggests a recurring pattern in {cluster.location || 'this location'}.
                {reportCount >= 3
                  ? ` With ${reportCount} converged reports, a systemic root cause is likely — infrastructure inspection recommended to resolve all complaints simultaneously.`
                  : ' Monitor for additional reports to identify a systemic root cause.'}
              </p>
            </div>
          </div>

          {/* Right: Priority Engine & Status Management */}
          <div className={styles.colSide}>
            {/* Priority Factor Breakdown */}
            <div className={styles.priorityBox}>
              <div className={styles.priorityBoxHeader}>
                <span className={styles.priHeaderTitle}>PRIORITY SCORE BREAKDOWN</span>
                <span className={styles.priHeaderScore}>{priorityScore} / 100</span>
              </div>

              <div className={styles.factorsList}>
                <div className={styles.factorRow}>
                  <span className={styles.factorName}>SEVERITY (WEIGHT 30%)</span>
                  <span className={styles.factorVal}>{cluster.priority || 'MEDIUM'} ({Math.round(priorityScore * 1.05)}%)</span>
                </div>
                <div className={styles.factorBarWrap}>
                  <div className={styles.factorBarFill} style={{ width: `${Math.min(100, priorityScore + 5)}%` }}></div>
                </div>

                <div className={styles.factorRow}>
                  <span className={styles.factorName}>REPORTS VOLUME (WEIGHT 25%)</span>
                  <span className={styles.factorVal}>{reportCount} REPORTS ({Math.min(100, reportCount * 18)}%)</span>
                </div>
                <div className={styles.factorBarWrap}>
                  <div className={styles.factorBarFill} style={{ width: `${Math.min(100, reportCount * 18)}%` }}></div>
                </div>

                <div className={styles.factorRow}>
                  <span className={styles.factorName}>RECURRENCE (WEIGHT 20%)</span>
                  <span className={styles.factorVal}>{reportCount >= 3 ? 'PERSISTENT' : 'EARLY'} ({Math.min(100, priorityScore - 5)}%)</span>
                </div>
                <div className={styles.factorBarWrap}>
                  <div className={styles.factorBarFill} style={{ width: `${Math.min(100, priorityScore - 5)}%` }}></div>
                </div>

                <div className={styles.factorRow}>
                  <span className={styles.factorName}>LOCATION IMPACT (WEIGHT 15%)</span>
                  <span className={styles.factorVal}>CAMPUS AREA ({Math.round(priorityScore * 0.7)}%)</span>
                </div>
                <div className={styles.factorBarWrap}>
                  <div className={styles.factorBarFill} style={{ width: `${Math.round(priorityScore * 0.7)}%` }}></div>
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
                  disabled={statusUpdating}
                >
                  MARK ASSIGNED
                </button>
                <button
                  type="button"
                  className={`${styles.statusActionBtn} ${currentStatus === 'IN PROGRESS' ? styles.statusBtnActive : ''}`}
                  onClick={() => handleUpdateStatus('IN PROGRESS')}
                  disabled={statusUpdating}
                >
                  MARK IN PROGRESS
                </button>
                <button
                  type="button"
                  className={`${styles.statusActionBtn} ${currentStatus === 'RESOLVED' ? styles.statusBtnResolved : ''}`}
                  onClick={() => handleUpdateStatus('RESOLVED')}
                  disabled={statusUpdating}
                >
                  {statusUpdating ? 'SAVING...' : 'MARK RESOLVED ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
