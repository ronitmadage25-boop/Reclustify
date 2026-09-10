import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

export default function AdminSettingsScreen() {
  const { user, userProfile, saveProfile, setCurrentScreen, signOut } = useAuth()
  const [collegeName, setCollegeName] = useState(userProfile.college || 'Massachusetts Institute of Technology')
  const [adminName, setAdminName] = useState(userProfile.adminDetails?.name || user?.user_metadata?.full_name || 'Dr. Eleanor Vance')
  const [savedNotice, setSavedNotice] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    saveProfile({
      ...userProfile,
      college: collegeName,
      adminDetails: {
        ...userProfile.adminDetails,
        name: adminName,
      },
    })
    setSavedNotice(true)
    setTimeout(() => setSavedNotice(false), 2000)
  }

  const handleResetOnboarding = () => {
    saveProfile({
      college: '',
      studentDetails: { name: '', id: '', dept: '', year: '' },
      adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
      onboardingComplete: false,
    }, null)
    setCurrentScreen('role-selection')
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>INSTITUTION CONFIGURATION // PREFERENCES</div>
          <h1 className={styles.bannerTitle}>CAMPUS SETTINGS & PROFILE</h1>
          <p className={styles.bannerSub}>
            MANAGE UNIVERSITY CREDENTIALS, ACCESS AUDITS, AND RECLUSTIFY TENANT SETTINGS.
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setCurrentScreen('admin-dashboard')}
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className={styles.updateAlert} role="status">
          ✓ INSTITUTION SETTINGS SAVED SUCCESSFULLY.
        </div>
      )}

      <div className={styles.settingsGrid}>
        {/* Left: General Settings */}
        <div className={styles.settingsCard}>
          <div className={styles.settingsHeader}>
            <span className={styles.settingsTitle}>INSTITUTION TENANT DETAILS</span>
            <span className={styles.settingsBadge}>CAMPUS INSTANCE</span>
          </div>

          <form onSubmit={handleSave} className={styles.settingsForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>COLLEGE / UNIVERSITY NAME</label>
              <input
                type="text"
                className={styles.formInput}
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>ADMINISTRATOR FULL NAME</label>
              <input
                type="text"
                className={styles.formInput}
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>AUTHENTICATED GOOGLE ACCOUNT</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.inputDisabled}`}
                value={user?.email || 'admin@university.edu'}
                disabled
              />
              <span className={styles.formHint}>Identity verified via Supabase Google OAuth</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>INSTITUTION ACCESS KEY (6-DIGIT)</label>
              <input
                type="text"
                className={`${styles.formInput} ${styles.inputDisabled}`}
                value={userProfile.adminDetails?.code || '882910'}
                disabled
              />
            </div>

            <button type="submit" className={styles.primaryBtn}>
              SAVE CONFIGURATION CHANGES
            </button>
          </form>
        </div>

        {/* Right: Security & Flow Utilities */}
        <div className={styles.settingsSide}>
          <div className={styles.settingsCard}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>ONBOARDING & FLOW CONTROL</span>
              <span className={styles.settingsBadge}>TESTING UTILITY</span>
            </div>

            <p className={styles.settingsDesc}>
              Want to re-test the complete student or administrator onboarding flow from scratch? Resetting clears your saved role and restarts the flow without logging out of Google.
            </p>

            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetOnboarding}
            >
              RESTART ONBOARDING FLOW ↺
            </button>
          </div>

          <div className={styles.settingsCard}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle}>SESSION MANAGEMENT</span>
              <span className={styles.settingsBadge}>AUTHENTICATION</span>
            </div>

            <p className={styles.settingsDesc}>
              Terminates your active Supabase session and returns you to the Reclustify Welcome / Landing page.
            </p>

            <button
              type="button"
              className={styles.signOutCardBtn}
              onClick={signOut}
            >
              SIGN OUT OF RECLUSTIFY →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
