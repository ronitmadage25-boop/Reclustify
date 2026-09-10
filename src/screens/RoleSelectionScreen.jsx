import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function RoleSelectionScreen() {
  const { user, saveProfile, userProfile, setCurrentScreen } = useAuth()

  const handleSelectRole = (role) => {
    saveProfile({ ...userProfile, role }, role)
    if (role === 'student') {
      setCurrentScreen('college-selection')
    } else {
      setCurrentScreen('admin-details')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>STEP 01 / 03</span>
        <span className={styles.tagline}>IDENTITY & ROLE ASSIGNMENT</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>AUTHENTICATED</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </div>

        <div className={styles.cardContent}>
          <h2 className={styles.title}>
            SELECT YOUR
            <br />
            <span className={styles.titleAccent}>CAMPUS ROLE.</span>
          </h2>
          <p className={styles.subtitle}>
            Google authentication verifies your identity. Reclustify requires your campus role to configure your appropriate intelligence dashboard and data access.
          </p>

          <div className={styles.roleGrid}>
            {/* Student Role */}
            <button
              type="button"
              className={styles.roleCard}
              onClick={() => handleSelectRole('student')}
              aria-label="Select Student Role"
            >
              <div className={styles.roleHeader}>
                <span className={styles.roleNumber}>01</span>
                <span className={styles.roleTag}>STUDENT ACCESS</span>
              </div>
              <h3 className={styles.roleTitle}>STUDENT</h3>
              <p className={styles.roleDesc}>
                Report issues in plain language, track real-time resolution progress, and see when your complaints are clustered with fellow students into high-priority institutional signals.
              </p>
              <div className={styles.roleFooter}>
                <span>CONTINUE AS STUDENT</span>
                <span className={styles.roleArrow}>→</span>
              </div>
            </button>

            {/* Administrator Role */}
            <button
              type="button"
              className={`${styles.roleCard} ${styles.adminRoleCard}`}
              onClick={() => handleSelectRole('admin')}
              aria-label="Select Administrator Role"
            >
              <div className={styles.roleHeader}>
                <span className={`${styles.roleNumber} ${styles.adminNum}`}>02</span>
                <span className={styles.roleTag}>INSTITUTION ACCESS</span>
              </div>
              <h3 className={styles.roleTitle}>ADMINISTRATOR</h3>
              <p className={styles.roleDesc}>
                Access executive campus problem intelligence, view cross-department issue clusters, triage recurring problems by algorithmic severity, and manage institutional resolutions.
              </p>
              <div className={styles.roleFooter}>
                <span>CONTINUE AS ADMINISTRATOR</span>
                <span className={styles.roleArrow}>→</span>
              </div>
            </button>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span>RECLUSTIFY CAMPUS INTELLIGENCE SYSTEM</span>
          <span>ROLE VERIFICATION PROTOCOL</span>
        </div>
      </div>
    </div>
  )
}
