import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

/**
 * Build the 5-stage resolution timeline based on the current complaint status.
 * Completed steps are derived from the status value so the UI always reflects DB state.
 */
function buildTimeline(status, report) {
  const now = report?.submittedAt || 'Recently'
  const dept = report?.department || 'Campus Operations'

  const STATUS_ORDER = ['IN PROGRESS', 'ASSIGNED', 'RESOLVED']
  const currentIdx = STATUS_ORDER.indexOf(status)

  const steps = [
    {
      step: '01',
      label: 'IDENTIFIED',
      desc: `Report submitted and clustered with related student reports into Cluster #${report?.clusterId || 'C-???'}.`,
      time: now,
      completed: true,
    },
    {
      step: '02',
      label: 'PRIORITIZED',
      desc: 'Cluster priority score calculated. High-severity reports escalate automatically.',
      time: status !== 'IN PROGRESS' || currentIdx >= 0 ? now : 'Pending',
      completed: true, // always completed once submitted
    },
    {
      step: '03',
      label: 'ASSIGNED',
      desc: `Dispatched to ${dept} department for review and field assessment.`,
      time: status === 'ASSIGNED' || status === 'RESOLVED' ? 'Assigned' : 'Pending assignment',
      completed: status === 'ASSIGNED' || status === 'RESOLVED',
      current: status === 'ASSIGNED',
    },
    {
      step: '04',
      label: 'IN PROGRESS',
      desc: 'Field team actively working on root cause resolution. Status synced campus-wide.',
      time: status === 'IN PROGRESS' || status === 'RESOLVED' ? 'Active' : 'Pending',
      completed: status === 'IN PROGRESS' || status === 'RESOLVED',
      current: status === 'IN PROGRESS',
    },
    {
      step: '05',
      label: 'RESOLVED',
      desc: status === 'RESOLVED'
        ? 'Issue confirmed resolved. All cluster participants notified.'
        : 'Pending technician sign-off and verification.',
      time: status === 'RESOLVED' ? 'Resolved' : 'Pending',
      completed: status === 'RESOLVED',
      current: status === 'RESOLVED',
    },
  ]

  return steps
}

export default function ReportTrackingScreen() {
  const { activeTrackingReport, setCurrentScreen } = useAuth()

  // If no report is being tracked, go back to my-reports
  const report = activeTrackingReport
  if (!report) {
    setCurrentScreen('my-reports')
    return null
  }

  const TIMELINE_STEPS = buildTimeline(report.status, report)

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
            <span className={styles.clusterIdBadge}>CLUSTER #{report.clusterId || 'C-???'}</span>
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
            "{report.title}" — Currently tracked in Cluster #{report.clusterId || 'C-???'}.
            {report.department ? ` Assigned to ${report.department}.` : ''}
          </p>

          {/* Status Badge */}
          <div style={{ marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.1em',
                padding: '6px 14px',
                border: '2px solid',
                borderColor: report.status === 'RESOLVED' ? '#00B85C' : '#FF3000',
                color: report.status === 'RESOLVED' ? '#00B85C' : '#FF3000',
              }}
            >
              CURRENT STATUS: {report.status}
            </span>
          </div>

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
              <h4 className={styles.deptCardName}>{report.department || 'CAMPUS OPERATIONS'}</h4>
              <span className={styles.deptCardLocation}>CATEGORY: {report.category}</span>
            </div>
            <div className={styles.deptCardRight}>
              <span className={styles.slaBadge}>
                {report.status === 'RESOLVED' ? 'RESOLVED ✓' : 'SLA: UNDER 48 HOURS'}
              </span>
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
          <span>STATUS: {report.status}</span>
        </div>
      </div>
    </div>
  )
}
