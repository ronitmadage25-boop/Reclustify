import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminDetailsScreen() {
  const { user, userProfile, saveProfile, setCurrentScreen } = useAuth()

  const defaultName = userProfile.adminDetails?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const defaultEmail = userProfile.adminDetails?.email || user?.email || ''

  const [name, setName] = useState(defaultName)
  const [email] = useState(defaultEmail)
  const [staffId, setStaffId] = useState(userProfile.adminDetails?.staffId || 'ADM-8092')
  const [dept, setDept] = useState(userProfile.adminDetails?.dept || 'IT & Campus Infrastructure')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide your full legal name.')
      return
    }

    saveProfile({
      ...userProfile,
      adminDetails: {
        ...userProfile.adminDetails,
        name: name.trim(),
        email,
        staffId: staffId.trim(),
        dept: dept.trim(),
      },
    })

    setCurrentScreen('admin-professional')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // 01</span>
        <span className={styles.tagline}>ADMINISTRATOR CREDENTIALS</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>ADMIN VERIFICATION</span>
          <span className={styles.badgeSub}>INSTITUTIONAL ACCESS</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.cardContent}>
          <h2 className={styles.title}>
            ADMINISTRATOR
            <br />
            <span className={styles.titleAccent}>BASIC DETAILS.</span>
          </h2>
          <p className={styles.subtitle}>
            Enter your official credentials. Administrative accounts have access to campus-wide intelligence data, resolution dispatch, and cross-department triage.
          </p>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>FULL NAME (FROM GOOGLE PROFILE)</label>
              <input
                type="text"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>OFFICIAL / GOOGLE EMAIL</label>
              <input
                type="email"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={email}
                disabled
                readOnly
              />
              <span className={styles.inputNote}>Verified via Google OAuth</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>STAFF / FACULTY IDENTIFICATION ID</label>
              <input
                type="text"
                className={styles.input}
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="e.g. FAC-2024-912"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>PRIMARY ADMINISTRATIVE DEPARTMENT</label>
              <select
                className={styles.select}
                value={dept}
                onChange={(e) => setDept(e.target.value)}
              >
                <option value="IT & Campus Infrastructure">IT & Campus Infrastructure</option>
                <option value="Campus Facilities & Maintenance">Campus Facilities & Maintenance</option>
                <option value="Dean of Student Affairs">Dean of Student Affairs</option>
                <option value="Campus Safety & Security">Campus Safety & Security</option>
                <option value="Academic Labs Management">Academic Labs Management</option>
              </select>
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('role-selection')}
            >
              ← BACK
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              CONTINUE TO PROFESSIONAL DETAILS →
            </button>
          </div>
        </form>

        <div className={styles.cardFooter}>
          <span>ROLE: ADMINISTRATOR</span>
          <span>SECURITY LEVEL: AUDITED</span>
        </div>
      </div>
    </div>
  )
}
