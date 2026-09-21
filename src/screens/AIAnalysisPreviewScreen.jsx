import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function AIAnalysisPreviewScreen({ draftReport, onConfirm }) {
  const { setCurrentScreen, submitComplaintToDb } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [saveError, setSaveError] = useState('')

  // draftReport must always be provided via the ReportProblem → this screen flow
  const activeDraft = draftReport

  // If somehow landed here with no draft, redirect back
  if (!activeDraft) {
    setCurrentScreen('report-problem')
    return null
  }

  const SEVERITY_COLORS = {
    CRITICAL: '#FF3000',
    HIGH: '#FF6B00',
    MEDIUM: '#000000',
    LOW: '#808080',
  }

  const handleConfirm = async () => {
    setSubmitting(true)
    setSaveError('')

    try {
      // Submit complaint to Supabase. Validates authenticated student & institution.
      const res = await submitComplaintToDb(
        {
          title: activeDraft.title,
          description: activeDraft.description,
          category: activeDraft.category,
          location: activeDraft.location,
          severity: activeDraft.severity,
        },
        activeDraft.imageFile || null
      )

      if (!res || !res.success) {
        const errorMsg = res?.error || 'Could not save your complaint to the database. Please check your connection and try again.'
        console.error('Complaint submission failed:', res)
        setSaveError(errorMsg)
        return
      }

      const saved = res.data
      const finalReport = {
        ...activeDraft,
        id: saved.ticket_number || activeDraft.id,
        status: 'SUBMITTED',
        clusterId: saved.cluster_id || null,
        clusterTitle: saved.title || activeDraft.title,
      }

      if (onConfirm) {
        onConfirm(finalReport)
      } else {
        setCurrentScreen('submission-success')
      }
    } catch (err) {
      console.error('Error confirming complaint:', err)
      setSaveError(err.message || 'Unexpected exception while saving report. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>REVIEW & SUBMIT // 02</span>
        <span className={styles.tagline}>CONFIRM YOUR COMPLAINT DETAILS</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={styles.badge}>REVIEW COMPLAINT</span>
          <span className={styles.badgeSub}>CONFIRM BEFORE SUBMITTING</span>
        </div>

        <div className={styles.formBody}>
          <h2 className={styles.formTitle}>
            CONFIRM &
            <br />
            <span className={styles.titleAccent}>SUBMIT COMPLAINT.</span>
          </h2>
          <p className={styles.formSubtitle}>
            Review the details below before submitting. Your complaint will be saved to the system and visible to administrators at your institution.
          </p>

          {/* Complaint Details Review Card */}
          <div className={styles.analysisGrid}>
            {/* Summary */}
            <div className={styles.analysisBox} style={{ flex: 1 }}>
              <span className={styles.boxTag}>YOUR COMPLAINT</span>
              <h4 className={styles.boxTitle}>{activeDraft.title}</h4>
              <p className={styles.boxDesc}>{activeDraft.description}</p>
              <div className={styles.boxMeta}>
                <span>LOCATION: {activeDraft.location || '—'}</span>
                <span style={{ color: SEVERITY_COLORS[activeDraft.severity] || '#000' }}>
                  SEVERITY: {activeDraft.severity}
                </span>
              </div>
            </div>

            {/* Category & Status */}
            <div className={`${styles.analysisBox} ${styles.matchedClusterBox}`}>
              <div className={styles.clusterBadgeRow}>
                <span className={styles.clusterId}>COMPLAINT DETAILS</span>
              </div>
              <h4 className={styles.boxTitle}>{activeDraft.category}</h4>
              <p className={styles.boxDesc}>
                Your complaint will be submitted to the campus administration team and grouped with related reports from your institution.
              </p>
              <div className={styles.boxMeta}>
                <span>CATEGORY: {activeDraft.category}</span>
                <span>STATUS: WILL BE SET TO SUBMITTED</span>
              </div>
            </div>
          </div>

          {/* Image preview if attached */}
          {activeDraft.imageFile && (
            <div style={{ marginTop: '16px', border: '1px solid #000' }}>
              <div style={{ padding: '8px 12px', backgroundColor: '#000', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' }}>
                ✓ EVIDENCE IMAGE ATTACHED — WILL UPLOAD WITH COMPLAINT
              </div>
              <div style={{ padding: '8px 12px', fontSize: '11px', color: '#666' }}>
                {activeDraft.imageFile.name} · {(activeDraft.imageFile.size / 1024).toFixed(0)} KB
              </div>
            </div>
          )}

          {/* Info callout */}
          <div className={styles.systemCallout}>
            <span className={styles.calloutTitle}>WHAT HAPPENS NEXT</span>
            <p className={styles.calloutText}>
              Your complaint will be saved with status SUBMITTED. Administrators at your institution will review it and update the status. You can track progress in My Reports.
            </p>
          </div>

          {saveError && <div className={styles.formError}>{saveError}</div>}

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('report-problem')}
              disabled={submitting}
            >
              ← EDIT REPORT
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'SUBMITTING...' : 'CONFIRM & SUBMIT COMPLAINT →'}
            </button>
          </div>
        </div>

        <div className={styles.formCardFooter}>
          <span>COMPLAINT STORED SECURELY IN SUPABASE</span>
          <span>INSTITUTION-ISOLATED · RLS ENFORCED</span>
        </div>
      </div>
    </div>
  )
}
