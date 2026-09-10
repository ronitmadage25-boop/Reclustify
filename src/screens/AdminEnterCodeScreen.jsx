import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminEnterCodeScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()
  const [code, setCode] = useState('882910')
  const [error, setError] = useState('')

  const handleVerifyCode = (e) => {
    e.preventDefault()
    if (code.trim().length < 4) {
      setError('Please enter a valid institution security code.')
      return
    }

    saveProfile({
      ...userProfile,
      adminDetails: {
        ...userProfile.adminDetails,
        code: code.trim(),
      },
      onboardingComplete: true,
    })

    setCurrentScreen('admin-dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // FINAL STEP</span>
        <span className={styles.tagline}>AUTHORIZATION CODE UNLOCK</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>SECURITY AUTHENTICATION</span>
          <span className={styles.badgeSub}>{userProfile.college || 'CAMPUS NETWORK'}</span>
        </div>

        <form onSubmit={handleVerifyCode} className={styles.cardContent}>
          <h2 className={styles.title}>
            ENTER INSTITUTION
            <br />
            <span className={styles.titleAccent}>ACCESS KEY.</span>
          </h2>
          <p className={styles.subtitle}>
            Enter the 6-digit verification code provided to your department to complete administrative access provisioning.
          </p>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.codeInputWrapper}>
            <label className={styles.label}>6-DIGIT INSTITUTIONAL CODE</label>
            <input
              type="text"
              maxLength={6}
              className={styles.codeInput}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />
            <span className={styles.codeHint}>DEFAULT VERIFIED CODE: 882910</span>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('admin-request-submitted')}
            >
              ← BACK
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              VERIFY & UNLOCK DASHBOARD →
            </button>
          </div>
        </form>

        <div className={styles.cardFooter}>
          <span>TWO-FACTOR ADMINISTRATIVE ACCESS</span>
          <span>CAMPUS INSTANCE: PROTECTED</span>
        </div>
      </div>
    </div>
  )
}
