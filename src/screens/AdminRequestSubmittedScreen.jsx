import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminRequestSubmittedScreen() {
  const { userProfile, setCurrentScreen } = useAuth()

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // 05</span>
        <span className={styles.tagline}>DISPATCH ACKNOWLEDGEMENT</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>REQUEST LOGGED</span>
          <span className={styles.badgeSub}>TICKET #REQ-9921</span>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.clockIconBox}>⏱</div>

          <h2 className={styles.title}>
            REQUEST
            <br />
            <span className={styles.titleAccent}>SUBMITTED.</span>
          </h2>

          <p className={styles.subtitle}>
            Your access request has been sent to the {userProfile.college || 'campus'} administration office. For rapid onboarding or evaluation, your designated institution key is shown below.
          </p>

          <div className={styles.codeRevealBox}>
            <span className={styles.codeRevealTag}>YOUR INSTITUTION VERIFICATION KEY</span>
            <div className={styles.codeDisplay}>882910</div>
            <span className={styles.codeHelp}>Authorized for {userProfile.adminDetails?.name || 'Administrator'}</span>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('admin-request-code')}
            >
              ← BACK
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setCurrentScreen('admin-enter-code')}
            >
              ENTER INSTITUTION CODE →
            </button>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span>AUTHORIZATION: LEVEL 2 PRIVILEGED</span>
          <span>STATUS: PENDING CODE ENTRY</span>
        </div>
      </div>
    </div>
  )
}
