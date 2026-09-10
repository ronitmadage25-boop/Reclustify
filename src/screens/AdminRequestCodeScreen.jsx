import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminRequestCodeScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()
  const [collegeName, setCollegeName] = useState(userProfile.college || 'Massachusetts Institute of Technology')
  const [domain, setDomain] = useState('mit.edu')
  const [reason, setReason] = useState('Campus Infrastructure & Network Reliability Lead for Student Labs')

  const handleSubmitRequest = (e) => {
    e.preventDefault()
    saveProfile({
      ...userProfile,
      college: collegeName,
      adminDetails: {
        ...userProfile.adminDetails,
        domain,
        reason,
      },
    })
    setCurrentScreen('admin-request-submitted')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // 04</span>
        <span className={styles.tagline}>INSTITUTION SECURITY CLEARANCE</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>CODE DISPATCH</span>
          <span className={styles.badgeSub}>INSTITUTIONAL ACCESS KEY</span>
        </div>

        <form onSubmit={handleSubmitRequest} className={styles.cardContent}>
          <h2 className={styles.title}>
            REQUEST
            <br />
            <span className={styles.titleAccent}>INSTITUTION CODE.</span>
          </h2>
          <p className={styles.subtitle}>
            Every partner college possesses a unique 6-digit cryptographic security code. Request a code dispatch to your official registrar or campus administration office.
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>UNIVERSITY / INSTITUTION</label>
              <select
                className={styles.select}
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              >
                <option value="Massachusetts Institute of Technology">Massachusetts Institute of Technology</option>
                <option value="Stanford University">Stanford University</option>
                <option value="Harvard University">Harvard University</option>
                <option value="UC Berkeley">UC Berkeley</option>
                <option value="Indian Institute of Technology Bombay">Indian Institute of Technology Bombay</option>
                <option value="University of Oxford">University of Oxford</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>INSTITUTIONAL DOMAIN</label>
              <input
                type="text"
                className={styles.input}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. mit.edu"
                required
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>ADMINISTRATIVE PURPOSE / JUSTIFICATION</label>
              <textarea
                className={styles.textarea}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain your operational responsibility in managing student grievances and campus infrastructure..."
                required
              />
            </div>
          </div>

          <div className={styles.existingCodeNotice}>
            <span>ALREADY ISSUED A 6-DIGIT CODE BY YOUR INSTITUTION?</span>
            <button
              type="button"
              className={styles.linkBtn}
              onClick={() => setCurrentScreen('admin-enter-code')}
            >
              ENTER CODE DIRECTLY →
            </button>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('admin-proof')}
            >
              ← BACK
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              SUBMIT VERIFICATION REQUEST →
            </button>
          </div>
        </form>

        <div className={styles.cardFooter}>
          <span>DISPATCH WINDOW: INSTANT VIA OFFICIAL DOMAIN</span>
          <span>CAMPUS PARTNER: VERIFIED</span>
        </div>
      </div>
    </div>
  )
}
