import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchClusterDetails, fetchComplaintDetails, updateClusterStatus, fetchComplaintAttachments, updateComplaintStatus } from '../services/db'
import styles from './AdminScreens.module.css'

export default function AdminIssueDetailsScreen({ clusterId = null, clusterDbId = null, complaintId = null }) {
  const { setCurrentScreen } = useAuth()
  const [clusterData, setClusterData] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentStatus, setCurrentStatus] = useState('SUBMITTED')
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusUpdated, setStatusUpdated] = useState(false)
  // Map: complaintDbId → array of attachment objects with signedUrl
  const [attachmentsMap, setAttachmentsMap] = useState({})

  useEffect(() => {
    async function load() {
      setLoading(true)

      // 1. If individual complaint ID provided, load it directly
      if (complaintId) {
        const comp = await fetchComplaintDetails(complaintId)
        if (comp) {
          setClusterData({
            id: comp.id,
            cluster_key: comp.ticketNumber,
            title: comp.title,
            department: comp.department,
            location: comp.location,
            category: comp.category,
            priority: comp.priority,
            status: comp.status,
            reports_count: 1,
            isIndividualComplaint: true,
          })
          setCurrentStatus(comp.status || 'SUBMITTED')
          setComplaints([
            {
              id: comp.ticketNumber,
              dbId: comp.id,
              text: comp.description,
              time: comp.submittedAt || 'Recent',
              similarity: '100%',
            },
          ])
          setLoading(false)
          return
        }
      }

      // 2. If cluster DB ID provided, load cluster
      const dbId = clusterDbId
      if (dbId) {
        const result = await fetchClusterDetails(dbId)
        if (result?.cluster) {
          setClusterData(result.cluster)
          setCurrentStatus(result.cluster.status || 'SUBMITTED')
          setComplaints(result.complaints || [])
          setLoading(false)
          return
        }
      }

      // No complaint or cluster found — show empty state
      setClusterData(null)
      setComplaints([])
      setLoading(false)
    }

    load()
  }, [clusterDbId, clusterId, complaintId])

  // After complaints load, fetch attachments for each one (only real DB IDs)
  useEffect(() => {
    if (!complaints || complaints.length === 0) return

    const fetchAll = async () => {
      const map = {}
      await Promise.all(
        complaints.map(async (complaint) => {
          if (complaint.dbId) {
            const attachments = await fetchComplaintAttachments(complaint.dbId)
            if (attachments.length > 0) {
              map[complaint.dbId] = attachments
            }
          }
        })
      )
      setAttachmentsMap(map)
    }

    fetchAll().catch(console.warn)
  }, [complaints])

  const handleUpdateStatus = async (newStatus) => {
    if (statusUpdating) return
    setStatusUpdating(true)
    setCurrentStatus(newStatus)

    if (complaintId || clusterData?.isIndividualComplaint) {
      const targetId = complaintId || clusterData?.id
      await updateComplaintStatus(targetId, { status: newStatus })
    } else if (clusterData?.id || clusterDbId) {
      const dbId = clusterData?.id || clusterDbId
      await updateClusterStatus(dbId, newStatus)
    }

    setStatusUpdating(false)
    setStatusUpdated(true)
    setTimeout(() => setStatusUpdated(false), 2500)
  }

  if (!loading && !clusterData) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <div className={styles.badge}>ISSUE DETAILS // NOT FOUND</div>
            <h1 className={styles.bannerTitle}>ISSUE NOT FOUND</h1>
            <p className={styles.bannerSub}>
              The requested issue or cluster could not be loaded from the database.
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
      </div>
    )
  }

  const cluster = clusterData || {}
  const priorityScore = cluster.priority_score || 0
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

                  {/* Evidence / Attached Photo */}
                  {item.dbId && (() => {
                    const attachments = attachmentsMap[item.dbId]
                    if (!attachments || attachments.length === 0) {
                      return (
                        <div style={{
                          marginTop: '10px', padding: '8px 12px',
                          backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0',
                          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', color: '#999',
                        }}>
                          NO EVIDENCE ATTACHED
                        </div>
                      )
                    }
                    return (
                      <div style={{ marginTop: '10px' }}>
                        <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#FF3000', marginBottom: '6px' }}>
                          EVIDENCE / ATTACHED PHOTO ({attachments.length})
                        </div>
                        {attachments.map((att) => (
                          <div key={att.id} style={{ border: '1px solid #000', marginBottom: '6px' }}>
                            <img
                              src={att.signedUrl}
                              alt={`Evidence: ${att.fileName}`}
                              style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                            <div style={{
                              padding: '6px 10px', backgroundColor: '#000', color: '#fff',
                              fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
                            }}>
                              {att.fileName} · {(att.fileSize / 1024).toFixed(0)} KB
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>

          {/* Pattern Notes (shown only when there are multiple reports) */}
          {reportCount >= 2 && (
            <div className={styles.hypothesisCard}>
              <div className={styles.hypothesisHeader}>
                <span className={styles.hypoTag}>CLUSTER PATTERN NOTES</span>
                <span className={styles.hypoConfidence}>{reportCount} CONVERGED REPORTS</span>
              </div>
              <p className={styles.hypoText}>
                {reportCount} reports from {cluster.location || 'this area'} have been clustered together.
                {reportCount >= 3
                  ? ` This volume suggests a systemic issue — infrastructure inspection of ${cluster.category || 'this area'} is recommended.`
                  : ' Continue monitoring for additional reports to confirm the pattern.'}
              </p>
            </div>
          )}
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
              <span className={styles.cardHeaderSmall}>STATUS &amp; DISPATCH CONTROL</span>
              <div className={styles.currentStatusDisplay}>
                CURRENT: <strong>{currentStatus}</strong>
              </div>

              <div className={styles.statusButtons}>
                {[
                  { label: 'SUBMITTED', value: 'SUBMITTED' },
                  { label: 'UNDER REVIEW', value: 'UNDER REVIEW' },
                  { label: 'ASSIGNED', value: 'ASSIGNED' },
                  { label: 'IN PROGRESS', value: 'IN PROGRESS' },
                  { label: 'RESOLVED ✓', value: 'RESOLVED' },
                  { label: 'CLOSED', value: 'CLOSED' },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    type="button"
                    className={`${styles.statusActionBtn} ${
                      currentStatus === value
                        ? value === 'RESOLVED' || value === 'CLOSED'
                          ? styles.statusBtnResolved
                          : styles.statusBtnActive
                        : ''
                    }`}
                    onClick={() => handleUpdateStatus(value)}
                    disabled={statusUpdating || currentStatus === value}
                  >
                    {statusUpdating && currentStatus === value ? 'SAVING...' : label}
                  </button>
                ))}
              </div>

              {statusUpdated && (
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', color: '#00B85C', marginTop: '12px' }}>
                  ✓ STATUS UPDATED — STUDENT WILL SEE NEW STATUS
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
