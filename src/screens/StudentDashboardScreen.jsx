import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchStudentDashboardStats, fetchAdminClusters } from '../services/db'
import styles from './StudentScreens.module.css'

export default function StudentDashboardScreen() {
  const { user, userProfile, setCurrentScreen, studentReports, setActiveTrackingReport } = useAuth()
  const [stats, setStats] = useState({ totalReports: 0, openReports: 0, inProgressReports: 0, resolvedReports: 0 })
  const [clusters, setClusters] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingClusters, setLoadingClusters] = useState(true)

  const institutionId = userProfile?.collegeId

  useEffect(() => {
    if (!user?.id) return
    setLoadingStats(true)
    fetchStudentDashboardStats(user.id)
      .then(setStats)
      .finally(() => setLoadingStats(false))
  }, [user?.id])

  useEffect(() => {
    if (!institutionId) {
      setLoadingClusters(false)
      return
    }
    setLoadingClusters(true)
    fetchAdminClusters(institutionId)
      .then((data) => {
        // Show top 3 non-resolved clusters by priority score
        const top = (data || [])
          .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
          .slice(0, 3)
        setClusters(top)
      })
      .finally(() => setLoadingClusters(false))
  }, [institutionId])

  const handleTrackReport = (report) => {
    setActiveTrackingReport(report)
    setCurrentScreen('report-tracking')
  }

  const priorityBadgeClass = (priority) => {
    if (priority === 'CRITICAL' || priority === 'HIGH') return styles.badgeHigh
    if (priority === 'MEDIUM') return styles.badgeMed
    return styles.badgeResolved
  }

  return (
    <div className={styles.dashboard}>
      {/* Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.studentBadge}>STUDENT DASHBOARD // VERIFIED</div>
          <h1 className={styles.bannerTitle}>
            HELLO, {userProfile.studentDetails?.name?.toUpperCase() || 'STUDENT'}
          </h1>
          <p className={styles.bannerSub}>
            CAMPUS: {userProfile.college?.toUpperCase() || 'YOUR INSTITUTION'}
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.reportBtn}
            onClick={() => setCurrentScreen('report-problem')}
            aria-label="Report a campus problem"
          >
            <span>REPORT A PROBLEM</span>
            <span className={styles.reportBtnIcon} aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {/* Stats Bar — Real Data */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>MY TOTAL REPORTS</span>
          <span className={styles.statValue}>{loadingStats ? '—' : stats.totalReports}</span>
          <span className={styles.statDetail}>ALL SUBMITTED</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>OPEN / AWAITING</span>
          <span className={styles.statValue}>{loadingStats ? '—' : stats.openReports}</span>
          <span className={styles.statDetail}>SUBMITTED + UNDER REVIEW</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>IN PROGRESS</span>
          <span className={`${styles.statValue} ${styles.statAccent}`}>{loadingStats ? '—' : stats.inProgressReports}</span>
          <span className={styles.statDetail}>ASSIGNED + ACTIVE</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>RESOLVED</span>
          <span className={styles.statValue}>{loadingStats ? '—' : stats.resolvedReports}</span>
          <span className={styles.statDetail}>CLOSED ISSUES</span>
        </div>
      </div>

      {/* Main Grid: Campus Clusters & My Reports */}
      <div className={styles.mainGrid}>
        {/* Left: Active Campus Clusters — Real Data */}
        <div className={styles.colLeft}>
          <div className={styles.blockHeader}>
            <div>
              <h2 className={styles.blockTitle}>ACTIVE PROBLEM CLUSTERS</h2>
              <span className={styles.blockSub}>SIMILAR STUDENT COMPLAINTS GROUPED BY CATEGORY</span>
            </div>
            <span className={styles.liveIndicator}>LIVE</span>
          </div>

          <div className={styles.clusterList}>
            {loadingClusters && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>
                LOADING CLUSTERS...
              </div>
            )}

            {!loadingClusters && clusters.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', border: '1px solid #000', display: 'inline-block', padding: '6px 14px', marginBottom: '12px' }}>
                  NO ACTIVE CLUSTERS
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  No open problem clusters for your institution yet.
                </p>
              </div>
            )}

            {!loadingClusters && clusters.map((cluster) => (
              <div key={cluster.id} className={styles.clusterItem}>
                <div className={styles.clusterMeta}>
                  <span className={styles.clusterId}>CLUSTER #{cluster.cluster_key}</span>
                  <span className={`${styles.badge} ${priorityBadgeClass(cluster.priority)}`}>
                    {cluster.priority} PRIORITY
                  </span>
                </div>
                <h3 className={styles.clusterTitle}>{cluster.title}</h3>
                <p className={styles.clusterSummary}>
                  {cluster.reports_count || 0} student report{(cluster.reports_count || 0) !== 1 ? 's' : ''} converged in {cluster.location || 'campus area'}.
                </p>
                <div className={styles.clusterBottom}>
                  <span className={styles.clusterDept}>DEPT: {cluster.department || 'CAMPUS OPERATIONS'}</span>
                  <span className={styles.clusterStatus}>STATUS: {cluster.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: My Reports — Real Data */}
        <div className={styles.colRight}>
          <div className={styles.blockHeader}>
            <div>
              <h2 className={styles.blockTitle}>MY FILED REPORTS</h2>
              <span className={styles.blockSub}>YOUR INDIVIDUAL TICKETS</span>
            </div>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => setCurrentScreen('my-reports')}
            >
              VIEW ALL →
            </button>
          </div>

          <div className={styles.myReportsList}>
            {studentReports.slice(0, 3).map((report) => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportTop}>
                  <span className={styles.reportId}>{report.id}</span>
                  <span className={`${styles.badge} ${report.status === 'RESOLVED' || report.status === 'CLOSED' ? styles.badgeResolved : styles.badgeProgress}`}>
                    {report.status}
                  </span>
                </div>
                <h4 className={styles.reportTitle}>{report.title}</h4>
                <div className={styles.reportInfo}>
                  <span>{report.location}</span>
                  <span>{report.submittedAt}</span>
                </div>
                <div className={styles.reportActions}>
                  <button
                    type="button"
                    className={styles.trackBtn}
                    onClick={() => handleTrackReport(report)}
                  >
                    TRACK STATUS PIPELINE →
                  </button>
                </div>
              </div>
            ))}

            {studentReports.length === 0 && (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', border: '1px solid #000', display: 'inline-block', padding: '6px 14px', marginBottom: '12px' }}>
                  NO REPORTS YET
                </div>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  You have not submitted any complaints yet.
                </p>
                <button
                  type="button"
                  className={styles.reportBtn}
                  style={{ marginTop: '16px', fontSize: '10px' }}
                  onClick={() => setCurrentScreen('report-problem')}
                >
                  <span>REPORT YOUR FIRST PROBLEM</span>
                  <span className={styles.reportBtnIcon} aria-hidden="true">+</span>
                </button>
              </div>
            )}
          </div>

          {/* Info card */}
          <div className={styles.helpCard}>
            <div className={styles.helpHeader}>CAMPUS INTELLIGENCE NOTICE</div>
            <p className={styles.helpText}>
              "One report is a voice. A cluster is a signal. A resolution is an outcome."
            </p>
            <span className={styles.helpSub}>Every report helps isolate systemic infrastructure issues.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
