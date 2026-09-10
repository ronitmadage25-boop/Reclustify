import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

const TIMELINE_STEPS = [
  {
    step: '01',
    label: 'IDENTIFIED',
    desc: 'Report submitted and clustered with 3 other matching student reports.',
    time: '2 days ago · 10:14 AM',
    completed: true,
  },
  {
    step: '02',
    label: 'PRIORITIZED',
    desc: 'Cluster marked HIGH PRIORITY (Score: 82/100) based on severity and room occupancy.',
    time: '2 days ago · 11:30 AM',
    completed: true,
  },
  {
    step: '03',
    label: 'ASSIGNED',
    desc: 'Dispatched to IT Infrastructure Department (Lead: Marcus Vance).',
    time: '1 day ago · 09:00 AM',
    completed: true,
  },
  {
    step: '04',
    label: 'IN PROGRESS',
    desc: 'Field technician deployed. Access point AP-04 firmware reset and cable replaced.',
    time: 'Today · 02:45 PM',
    completed: true,
    current: true,
  },
  {
    step: '05',
    label: 'RESOLVED',
    desc: 'System health confirmed. Student cluster resolution ping dispatched.',
    time: 'Pending technician sign-off',
    completed: false,
  },
]

export default function ReportTrackingScreen() {
  const { activeTrackingReport, setCurrentScreen } = useAuth()

  const report = activeTrackingReport || {
    id: 'REP-4091',
    clusterId: 'CLU-104',
    title: 'Lab 3 Wi-Fi dropping connection during practical sessions',
    location: 'Science Block, Lab 3',
    category: 'IT & NETWORK',
    submittedAt: '2 days ago',
    status: 'IN PROGRESS',
    severity: 'HIGH',
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>STATUS TRACKER // 05-STAGE PIPELINE</span>
        <span className={styles.tagline}>LIVE INSTITUTIONAL PROGRESS</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <div className={styles.trackingHeaderLeft}>
            <span className={styles.badge}>TRACKING TICKET: {report.id}</span>
            <span className={styles.clusterIdBadge}>CLUSTER #{report.clusterId || 'C-104'}</span>
          </div>
          <button
            type="button"
            className={styles.backBtnSm}
            onClick={() => setCurrentScreen('my-reports')}
          >
            ← BACK TO MY REPORTS
          </button>
        </div>

        <div className={styles.formBody}>
          <h2 className={styles.formTitle}>
            RESOLUTION
            <br />
            <span className={styles.titleAccent}>PROGRESS PIPELINE.</span>
          </h2>
          <p className={styles.formSubtitle}>
            "{report.title}" — Currently tracked in Cluster #{report.clusterId || 'C-104'}. Assigned to Campus IT.
          </p>

          {/* Timeline */}
          <div className={styles.timeline}>
            {TIMELINE_STEPS.map((item, i) => (
              <div
                key={item.step}
                className={`${styles.timelineItem} ${item.completed ? styles.timelineCompleted : ''} ${item.current ? styles.timelineCurrent : ''}`}
              >
                <div className={styles.timelineLeft}>
                  <div className={styles.timelineNode}>
                    {item.completed ? (item.current ? '●' : '✓') : item.step}
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className={`${styles.timelineLine} ${item.completed && !item.current ? styles.lineDone : ''}`}></div>
                  )}
                </div>

                <div className={styles.timelineContent}>
                  <div className={styles.timelineMeta}>
                    <span className={styles.timelineLabel}>{item.label}</span>
                    <span className={styles.timelineTime}>{item.time}</span>
                  </div>
                  <p className={styles.timelineDesc}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Assigned Department Info Card */}
          <div className={styles.deptCard}>
            <div className={styles.deptCardLeft}>
              <span className={styles.deptCardTag}>RESPONSIBLE UNIT</span>
              <h4 className={styles.deptCardName}>IT INFRASTRUCTURE & LAB NETWORKS</h4>
              <span className={styles.deptCardLocation}>MAIN OFFICE: BUILDING 4, ROOM 210</span>
            </div>
            <div className={styles.deptCardRight}>
              <span className={styles.slaBadge}>SLA: UNDER 48 HOURS</span>
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
              onClick={() => setCurrentScreen('report-problem')}
            >
              REPORT ANOTHER PROBLEM +
            </button>
          </div>
        </div>

        <div className={styles.formCardFooter}>
          <span>PROGRESS IS SYNCHRONIZED ACROSS CLUSTER PARTICIPANTS</span>
          <span>LAST UPDATED: 12 MINUTES AGO</span>
        </div>
      </div>
    </div>
  )
}
