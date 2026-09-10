import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function SubmissionSuccessScreen({ submittedReport }) {
  const { setCurrentScreen, setActiveTrackingReport } = useAuth()

  const report = submittedReport || {
    id: 'REP-4091',
    clusterId: 'CLU-104',
    title: 'Lab 3 Wi-Fi dropping connection during practical sessions',
    location: 'Science Block, Lab 3',
    status: 'IN PROGRESS',
    severity: 'HIGH',
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
            Your complaint was verified and attached to active campus issue Cluster #{report.clusterId || 'C-104'}. The responsible department has been notified of this high-frequency recurrence.
          </p>

          <div className={styles.ticketSummary}>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>YOUR REPORT ID</span>
              <span className={styles.ticketValue}>{report.id}</span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>LINKED CLUSTER</span>
              <span className={styles.ticketValue}>CLUSTER #{report.clusterId || 'C-104'}</span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>ASSIGNED TO</span>
              <span className={styles.ticketValue}>IT INFRASTRUCTURE DEPARTMENT</span>
            </div>
            <div className={styles.ticketRow}>
              <span className={styles.ticketLabel}>CURRENT STATUS</span>
              <span className={`${styles.ticketValue} ${styles.ticketAccent}`}>IN PROGRESS</span>
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
