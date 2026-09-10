import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function StudentDashboardScreen() {
  const { userProfile, setCurrentScreen, studentReports, setActiveTrackingReport } = useAuth()

  const handleTrackReport = (report) => {
    setActiveTrackingReport(report)
    setCurrentScreen('report-tracking')
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
            CAMPUS: {userProfile.college?.toUpperCase() || 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY'}
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

      {/* Stats Bar */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>ACTIVE CLUSTERS</span>
          <span className={styles.statValue}>14</span>
          <span className={styles.statDetail}>3 IDENTIFIED TODAY</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>MY FILED REPORTS</span>
          <span className={styles.statValue}>{studentReports.length}</span>
          <span className={styles.statDetail}>TRACKED IN REAL TIME</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>CAMPUS RESOLUTION RATE</span>
          <span className={`${styles.statValue} ${styles.statAccent}`}>88%</span>
          <span className={styles.statDetail}>AVG 2.4 DAYS TO FIX</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>HIGH PRIORITY ISSUES</span>
          <span className={styles.statValue}>03</span>
          <span className={styles.statDetail}>UNDER INVESTIGATION</span>
        </div>
      </div>

      {/* Main Grid: Campus Clusters & My Reports */}
      <div className={styles.mainGrid}>
        {/* Left: Active Campus Clusters */}
        <div className={styles.colLeft}>
          <div className={styles.blockHeader}>
            <div>
              <h2 className={styles.blockTitle}>ACTIVE PROBLEM CLUSTERS</h2>
              <span className={styles.blockSub}>SIMILAR STUDENT COMPLAINTS GROUPED AUTOMATICALLY</span>
            </div>
            <span className={styles.liveIndicator}>LIVE INTELLIGENCE</span>
          </div>

          <div className={styles.clusterList}>
            <div className={styles.clusterItem}>
              <div className={styles.clusterMeta}>
                <span className={styles.clusterId}>CLUSTER #C-104</span>
                <span className={`${styles.badge} ${styles.badgeHigh}`}>HIGH PRIORITY</span>
              </div>
              <h3 className={styles.clusterTitle}>LAB 3 WI-FI CONNECTIVITY & DROPOUTS</h3>
              <p className={styles.clusterSummary}>
                4 student reports converged around science block lab network equipment over 48 hours.
              </p>
              <div className={styles.clusterBottom}>
                <span className={styles.clusterDept}>DEPT: IT INFRASTRUCTURE</span>
                <span className={styles.clusterStatus}>STATUS: IN PROGRESS</span>
              </div>
            </div>

            <div className={styles.clusterItem}>
              <div className={styles.clusterMeta}>
                <span className={styles.clusterId}>CLUSTER #C-098</span>
                <span className={`${styles.badge} ${styles.badgeMed}`}>MEDIUM PRIORITY</span>
              </div>
              <h3 className={styles.clusterTitle}>LIBRARY 3RD FLOOR HVAC OVERHEATING</h3>
              <p className={styles.clusterSummary}>
                7 complaints submitted regarding temperature controls in quiet study zone.
              </p>
              <div className={styles.clusterBottom}>
                <span className={styles.clusterDept}>DEPT: CAMPUS FACILITIES</span>
                <span className={styles.clusterStatus}>STATUS: ASSIGNED</span>
              </div>
            </div>

            <div className={styles.clusterItem}>
              <div className={styles.clusterMeta}>
                <span className={styles.clusterId}>CLUSTER #C-092</span>
                <span className={`${styles.badge} ${styles.badgeResolved}`}>RESOLVED</span>
              </div>
              <h3 className={styles.clusterTitle}>NORTH DORM WATER PRESSURE MALFUNCTION</h3>
              <p className={styles.clusterSummary}>
                5 student complaints resolved following plumbing valve replacement.
              </p>
              <div className={styles.clusterBottom}>
                <span className={styles.clusterDept}>DEPT: RESIDENTIAL HOUSING</span>
                <span className={styles.clusterStatus}>STATUS: RESOLVED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: My Reports */}
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
            {studentReports.map((report) => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportTop}>
                  <span className={styles.reportId}>{report.id}</span>
                  <span className={`${styles.badge} ${report.status === 'RESOLVED' ? styles.badgeResolved : styles.badgeProgress}`}>
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
          </div>

          {/* Prompt card */}
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
