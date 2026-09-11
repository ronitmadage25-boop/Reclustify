import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function MyReportsScreen() {
  const { studentReports, reportsLoading, refreshStudentReports, setCurrentScreen, setActiveTrackingReport } = useAuth()
  const [filter, setFilter] = useState('ALL')

  // Refresh complaints from Supabase when this screen mounts
  useEffect(() => {
    refreshStudentReports()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredReports = studentReports.filter((rep) => {
    if (filter === 'ALL') return true
    if (filter === 'IN PROGRESS') return rep.status === 'IN PROGRESS'
    if (filter === 'RESOLVED') return rep.status === 'RESOLVED'
    return true
  })

  const handleTrack = (report) => {
    setActiveTrackingReport(report)
    setCurrentScreen('report-tracking')
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.studentBadge}>REPORTS DIRECTORY // ARCHIVE</div>
          <h1 className={styles.bannerTitle}>MY SUBMITTED REPORTS</h1>
          <p className={styles.bannerSub}>
            TRACK ALL TICKETS AND OBSERVE HOW CLUSTERS PROGRESS TOWARD OUTCOMES.
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.reportBtn}
            onClick={() => setCurrentScreen('report-problem')}
          >
            <span>REPORT NEW PROBLEM</span>
            <span className={styles.reportBtnIcon} aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterBar}>
        <div className={styles.filterTabs}>
          {['ALL', 'IN PROGRESS', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.filterTab} ${filter === tab ? styles.filterTabActive : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab} ({tab === 'ALL' ? studentReports.length : studentReports.filter(r => r.status === tab).length})
            </button>
          ))}
        </div>
        <span className={styles.filterCount}>SHOWING {filteredReports.length} REPORTS</span>
      </div>

      {/* Loading State */}
      {reportsLoading && (
        <div className={styles.reportsGrid}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.detailedReportCard} style={{ opacity: 0.5, minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', letterSpacing: '0.1em', fontWeight: 700, color: '#999' }}>
                LOADING REPORTS...
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!reportsLoading && filteredReports.length === 0 && (
        <div style={{ padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', marginBottom: '16px', border: '1px solid #000', display: 'inline-block', padding: '6px 14px' }}>
            NO REPORTS FILED
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
            You have not submitted any campus problem reports yet.
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            style={{ marginTop: '24px' }}
            onClick={() => setCurrentScreen('report-problem')}
          >
            REPORT YOUR FIRST PROBLEM →
          </button>
        </div>
      )}

      {/* Reports Grid */}
      {!reportsLoading && filteredReports.length > 0 && (
        <div className={styles.reportsGrid}>
          {filteredReports.map((report) => (
            <div key={report.id} className={styles.detailedReportCard}>
              <div className={styles.reportCardHeader}>
                <div className={styles.reportCardIds}>
                  <span className={styles.reportId}>{report.id}</span>
                  <span className={styles.clusterIdBadge}>CLUSTER #{report.clusterId || 'C-???'}</span>
                </div>
                <span className={`${styles.badge} ${report.status === 'RESOLVED' ? styles.badgeResolved : styles.badgeProgress}`}>
                  {report.status}
                </span>
              </div>

              <h3 className={styles.detailedReportTitle}>{report.title}</h3>
              <p className={styles.detailedReportLoc}>LOCATION: {report.location}</p>

              <div className={styles.metaRow}>
                <span>CATEGORY: {report.category}</span>
                <span>SUBMITTED: {report.submittedAt}</span>
                <span>SEVERITY: {report.severity}</span>
              </div>

              <div className={styles.detailedReportFooter}>
                <span className={styles.clusterNotice}>
                  {report.department ? `DEPT: ${report.department}` : 'Part of a multi-student cluster'}
                </span>
                <button
                  type="button"
                  className={styles.primaryBtnSm}
                  onClick={() => handleTrack(report)}
                >
                  OPEN PIPELINE TRACKER →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
