import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function AIAnalysisPreviewScreen({ draftReport, onConfirm }) {
  const { setCurrentScreen, submitComplaintToDb } = useAuth()
  const [clustering, setClustering] = useState(false)
  const [saveError, setSaveError] = useState('')

  const activeDraft = draftReport || {
    id: 'REP-4091',
    title: 'Wi-Fi keeps dropping during practical sessions',
    category: 'IT & NETWORK',
    location: 'Science Block, Lab 3',
    description: 'Computers in row 2 and 4 cannot connect to the college network router.',
    severity: 'HIGH',
    submittedAt: 'Just now',
    status: 'IN PROGRESS',
  }

  const handleConfirm = async () => {
    setClustering(true)
    setSaveError('')

    try {
      // Save to Supabase (or demo fallback)
      // Pass imageFile as second argument so it gets uploaded with the complaint
      const saved = await submitComplaintToDb(
        {
          title: activeDraft.title,
          description: activeDraft.description,
          category: activeDraft.category,
          location: activeDraft.location,
          severity: activeDraft.severity,
        },
        activeDraft.imageFile || null
      )

      const finalReport = {
        ...activeDraft,
        id: saved?.ticket_number || activeDraft.id,
        clusterId: saved?.clusterKey || 'C-104',
        clusterTitle: saved?.clusterTitle || 'LAB 3 WI-FI CONNECTIVITY & DROPOUTS',
      }

      if (onConfirm) {
        onConfirm(finalReport)
      } else {
        setCurrentScreen('submission-success')
      }
    } catch (err) {
      console.error('Error confirming complaint:', err)
      setSaveError('Could not save report. Please try again.')
    } finally {
      setClustering(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>AI ANALYSIS // 02</span>
        <span className={styles.tagline}>PATTERN RECOGNITION & CLUSTER MATCH</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={`${styles.badge} ${styles.badgePulse}`}>RECLUSTIFY INTELLIGENCE ACTIVE</span>
          <span className={styles.badgeSub}>SEMANTIC EMBEDDING ENGINE</span>
        </div>

        <div className={styles.formBody}>
          <h2 className={styles.formTitle}>
            SIMILARITY
            <br />
            <span className={styles.titleAccent}>CLUSTER MATCHED.</span>
          </h2>
          <p className={styles.formSubtitle}>
            Reclustify compared your report against active campus problem signals. Instead of opening an isolated ticket, your complaint has been grouped with related student reports.
          </p>

          {/* Analysis Comparison Card */}
          <div className={styles.analysisGrid}>
            {/* Student's Report */}
            <div className={styles.analysisBox}>
              <span className={styles.boxTag}>YOUR NEW REPORT</span>
              <h4 className={styles.boxTitle}>{activeDraft.title}</h4>
              <p className={styles.boxDesc}>{activeDraft.description}</p>
              <div className={styles.boxMeta}>
                <span>LOCATION: {activeDraft.location}</span>
                <span>SEVERITY: {activeDraft.severity}</span>
              </div>
            </div>

            {/* Match Indicator */}
            <div className={styles.matchIndicator}>
              <div className={styles.matchScore}>89%</div>
              <div className={styles.matchLabel}>SEMANTIC SIMILARITY</div>
              <div className={styles.matchArrow}>→</div>
            </div>

            {/* Destination Cluster */}
            <div className={`${styles.analysisBox} ${styles.matchedClusterBox}`}>
              <div className={styles.clusterBadgeRow}>
                <span className={styles.clusterId}>CLUSTER MATCH</span>
                <span className={`${styles.badge} ${styles.badgeHigh}`}>HIGH PRIORITY</span>
              </div>
              <h4 className={styles.boxTitle}>{activeDraft.category} CLUSTER</h4>
              <p className={styles.boxDesc}>
                Related student complaints identified in this category. Your report will join or form a cluster for escalation.
              </p>
              <div className={styles.boxMeta}>
                <span>CATEGORY: {activeDraft.category}</span>
                <span>CLUSTER ALGORITHM: ACTIVE</span>
              </div>
            </div>
          </div>

          {/* Value callout */}
          <div className={styles.systemCallout}>
            <span className={styles.calloutTitle}>WHY THIS MATTERS</span>
            <p className={styles.calloutText}>
              By clustering your report, its institutional priority increases immediately. Campus staff will receive a consolidated problem brief instead of duplicate disjointed emails.
            </p>
          </div>

          {saveError && <div className={styles.formError}>{saveError}</div>}

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('report-problem')}
              disabled={clustering}
            >
              ← EDIT REPORT
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleConfirm}
              disabled={clustering}
            >
              {clustering ? 'SAVING TO CAMPUS SYSTEM...' : 'CONFIRM & JOIN CLUSTER →'}
            </button>
          </div>
        </div>

        <div className={styles.formCardFooter}>
          <span>CLUSTER ALGORITHM: COSINE VECTOR EMBEDDING</span>
          <span>CAMPUS ROUTING: AUTOMATED</span>
        </div>
      </div>
    </div>
  )
}
