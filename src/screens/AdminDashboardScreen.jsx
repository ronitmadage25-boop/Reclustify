import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

export default function AdminDashboardScreen({ onSelectCluster }) {
  const { userProfile, setCurrentScreen } = useAuth()

  const handleOpenCluster = (clusterId) => {
    if (onSelectCluster) {
      onSelectCluster(clusterId)
    }
    setCurrentScreen('admin-issue-details')
  }

  return (
    <div className={styles.dashboard}>
      {/* Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>ADMINISTRATIVE INTELLIGENCE // SECURE</div>
          <h1 className={styles.bannerTitle}>CAMPUS PROBLEM INTELLIGENCE</h1>
          <p className={styles.bannerSub}>
            INSTITUTION: {userProfile.college?.toUpperCase() || 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY'} · DEPT: {userProfile.adminDetails?.dept?.toUpperCase() || 'OPERATIONS'}
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setCurrentScreen('admin-all-issues')}
          >
            VIEW ALL ISSUES & CLUSTERS →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>TOTAL STUDENT COMPLAINTS</span>
          <span className={styles.metricValue}>142</span>
          <span className={styles.metricNote}>+18 LOGGED THIS WEEK</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>FORMED PROBLEM CLUSTERS</span>
          <span className={`${styles.metricValue} ${styles.metricAccent}`}>14</span>
          <span className={styles.metricNote}>10:1 COMPRESSION RATIO</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>AVG RESOLUTION CYCLE</span>
          <span className={styles.metricValue}>2.4d</span>
          <span className={styles.metricNote}>-38% FASTER WITH CLUSTERING</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>CRITICAL INFRASTRUCTURE ALERTS</span>
          <span className={styles.metricValue}>03</span>
          <span className={styles.metricNote}>HIGH RECURRENCE CONCENTRATION</span>
        </div>
      </div>

      {/* Main Multi-Column Section */}
      <div className={styles.mainGrid}>
        {/* Left: Priority Problem Clusters */}
        <div className={styles.colMain}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>HIGH-PRIORITY ISSUE CLUSTERS</h2>
              <span className={styles.sectionSub}>ALGORITHMICALLY GROUPED TICKETS REQUIRING ATTENTION</span>
            </div>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => setCurrentScreen('admin-all-issues')}
            >
              FULL REGISTRY →
            </button>
          </div>

          <div className={styles.clusterList}>
            <div className={styles.clusterCard}>
              <div className={styles.clusterHeader}>
                <span className={styles.clusterId}>CLUSTER #C-104</span>
                <span className={`${styles.statusBadge} ${styles.statusHigh}`}>HIGH PRIORITY (82/100)</span>
              </div>
              <h3 className={styles.clusterTitle}>LAB 3 WI-FI CONNECTIVITY & DROPOUTS</h3>
              <p className={styles.clusterDesc}>
                4 students filed independent reports regarding persistent network disconnects in Science Block Room 204.
              </p>
              <div className={styles.clusterMeta}>
                <span>DEPARTMENT: IT INFRASTRUCTURE</span>
                <span>SINCE: 2 DAYS</span>
                <span>REPORTS: 4 CONVERGED</span>
              </div>
              <div className={styles.clusterFooter}>
                <span className={styles.assignee}>LEAD ASSIGNEE: MARCUS VANCE (IT)</span>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleOpenCluster('C-104')}
                >
                  INSPECT CLUSTER DETAILS →
                </button>
              </div>
            </div>

            <div className={styles.clusterCard}>
              <div className={styles.clusterHeader}>
                <span className={styles.clusterId}>CLUSTER #C-098</span>
                <span className={`${styles.statusBadge} ${styles.statusMedium}`}>MEDIUM PRIORITY (64/100)</span>
              </div>
              <h3 className={styles.clusterTitle}>LIBRARY 3RD FLOOR HVAC OVERHEATING</h3>
              <p className={styles.clusterDesc}>
                7 complaints submitted by students studying in quiet cubicles. Temperature sensor suspected faulty.
              </p>
              <div className={styles.clusterMeta}>
                <span>DEPARTMENT: FACILITIES & HVAC</span>
                <span>SINCE: 4 DAYS</span>
                <span>REPORTS: 7 CONVERGED</span>
              </div>
              <div className={styles.clusterFooter}>
                <span className={styles.assignee}>LEAD ASSIGNEE: SARAH CHEN (FACILITIES)</span>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => handleOpenCluster('C-098')}
                >
                  INSPECT CLUSTER DETAILS →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Department Health & Quick Triage */}
        <div className={styles.colSide}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>DEPARTMENT STATUS</h2>
              <span className={styles.sectionSub}>WORKLOAD DISTRIBUTION</span>
            </div>
          </div>

          <div className={styles.deptStatusList}>
            <div className={styles.deptItem}>
              <div className={styles.deptItemTop}>
                <span className={styles.deptName}>IT INFRASTRUCTURE</span>
                <span className={styles.deptCount}>5 CLUSTERS</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '75%' }}></div>
              </div>
              <span className={styles.deptNote}>High volume in Science & Engineering labs</span>
            </div>

            <div className={styles.deptItem}>
              <div className={styles.deptItemTop}>
                <span className={styles.deptName}>CAMPUS FACILITIES</span>
                <span className={styles.deptCount}>6 CLUSTERS</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '60%' }}></div>
              </div>
              <span className={styles.deptNote}>HVAC and plumbing maintenance queued</span>
            </div>

            <div className={styles.deptItem}>
              <div className={styles.deptItemTop}>
                <span className={styles.deptName}>HOUSING & RESIDENTIAL</span>
                <span className={styles.deptCount}>2 CLUSTERS</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '30%' }}></div>
              </div>
              <span className={styles.deptNote}>Dorm water pressure issue resolved</span>
            </div>

            <div className={styles.deptItem}>
              <div className={styles.deptItemTop}>
                <span className={styles.deptName}>CAMPUS SAFETY</span>
                <span className={styles.deptCount}>1 CLUSTER</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '15%' }}></div>
              </div>
              <span className={styles.deptNote}>Path lighting repair scheduled</span>
            </div>
          </div>

          <div className={styles.quickActionsCard}>
            <span className={styles.cardHeaderSmall}>MANAGEMENT SHORTCUTS</span>
            <div className={styles.shortcutBtns}>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-analytics')}
              >
                CAMPUS ANALYTICS →
              </button>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-departments')}
              >
                MANAGE DEPARTMENTS →
              </button>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-settings')}
              >
                CAMPUS SETTINGS →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
