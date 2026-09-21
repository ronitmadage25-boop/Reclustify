import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function SubmissionSuccessScreen({ submittedReport }) {
  const { setCurrentScreen, setActiveTrackingReport } = useAuth()

  // submittedReport is always provided from the App.jsx flow.
  // If it's null (direct navigation), redirect back.
  const report = submittedReport
  if (!report) {
    setCurrentScreen('student-dashboard')
    return null
  }

  const handleTrack = () => {
    setActiveTrackingReport(report)
    setCurrentScreen('report-tracking')
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>CONFIRMATION // 03</span>
        <span className={styles.tagline}>REPORT CLUSTERED & ROUTED</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={`${styles.badge} ${styles.badgeResolved}`}>SUCCESSFULLY SUBMITTED</span>
          <span className={styles.badgeSub}>TICKET IDENTIFIER: {report.id}</span>
        </div>

        <div className={styles.formBody}>
          <div className={styles.successIconBox}>✓</div>

          <h2 className={styles.formTitle}>
            PROBLEM CLUSTERED
            <br />
            <span className={styles.titleAccent}>INTO SIGNAL.</span>
          </h2>

          <p className={styles.formSubtitle}>
            Your complaint has been submitted to campus administration.
            {report.clusterId
              ? ` It has been grouped into Cluster #${report.clusterId} with similar reports.`
              : ' It will be reviewed and grouped with similar reports shortly.'}
          </p>

          <div className={styles.ticketSummary}>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>YOUR REPORT ID</span>
              <span className={styles.ticketValue}>{report.id}</span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>LINKED CLUSTER</span>
              <span className={styles.ticketValue}>
                {report.clusterId ? `CLUSTER #${report.clusterId}` : 'PENDING CLUSTER ASSIGNMENT'}
              </span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>ASSIGNED TO</span>
              <span className={styles.ticketValue}>{report.clusterTitle || report.category || 'CAMPUS OPERATIONS'}</span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>CURRENT STATUS</span>
              <span className={`${styles.ticketValue} ${styles.ticketAccent}`}>{report.status || 'SUBMITTED'}</span>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={() => setCurrentScreen('student-dashboard')}
            >
              RETURN TO DASHBOARD
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleTrack}
            >
              TRACK STATUS PIPELINE →
            </button>
          </div>
        </div>

        <div className={styles.formCardFooter}>
          <span>AUTOMATED NOTIFICATIONS ENABLED</span>
          <span>CAMPUS INTELLIGENCE DISPATCH</span>
        </div>
      </div>
    </div>
  )
}
