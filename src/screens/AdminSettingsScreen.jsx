import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

export default function AdminSettingsScreen() {
  const { user, userProfile, saveProfile, setCurrentScreen, signOut, deleteAccount } = useAuth()
  const [collegeName, setCollegeName] = useState(userProfile.college || 'Massachusetts Institute of Technology')
  const [adminName, setAdminName] = useState(userProfile.adminDetails?.name || user?.user_metadata?.full_name || 'Dr. Eleanor Vance')
  const [savedNotice, setSavedNotice] = useState(false)

  // Deletion dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return
    setDeleting(true)
    setDeleteError('')
    const result = await deleteAccount()
    if (!result.success) {
      setDeleteError(result.error || 'Deletion failed. Please try again.')
      setDeleting(false)
    }
    // On success, AuthContext resets all state + redirects to welcome
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

          {/* DELETE ACCOUNT CARD */}
          <div className={styles.settingsCard} style={{ borderTop: '3px solid #FF3000' }}>
            <div className={styles.settingsHeader}>
              <span className={styles.settingsTitle} style={{ color: '#FF3000' }}>DANGER ZONE</span>
              <span className={styles.settingsBadge} style={{ color: '#FF3000' }}>IRREVERSIBLE</span>
            </div>

            <p className={styles.settingsDesc}>
              Permanently deletes your Reclustify account and all associated personal data, onboarding records, and submitted reports. This action <strong>cannot be undone</strong>.
            </p>

            <button
              type="button"
              className={styles.deleteAccountBtn}
              onClick={() => { setShowDeleteDialog(true); setDeleteConfirmText(''); setDeleteError('') }}
            >
              DELETE ACCOUNT PERMANENTLY
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '3px solid #FF3000',
            maxWidth: '480px', width: '100%',
            padding: '0',
            fontFamily: 'inherit',
          }}>
            {/* Dialog Header */}
            <div style={{
              backgroundColor: '#FF3000', padding: '16px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', color: '#fff' }}>
                PERMANENT ACCOUNT DELETION // IRREVERSIBLE ACTION
              </span>
            </div>

            {/* Dialog Body */}
            <div style={{ padding: '28px 28px 0' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px', color: '#000' }}>
                DELETE ACCOUNT PERMANENTLY?
              </h2>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#444', marginBottom: '20px' }}>
                This will permanently delete your Reclustify account and all associated personal data — including your onboarding details, administrator profile, and submitted complaint records. Your uploaded evidence files will also be removed.
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#444', marginBottom: '8px' }}>
                <strong>This action cannot be undone.</strong> If you sign in again with the same Google account, you will start fresh as a new user with no existing data.
              </p>

              <div style={{
                backgroundColor: '#FFF5F5', border: '1px solid #FF3000',
                padding: '12px 16px', marginBottom: '20px', marginTop: '16px',
              }}>
                <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#FF3000', margin: 0 }}>
                  ⚠ DELETING: {user?.email || 'your account'}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '8px', color: '#000' }}>
                  TYPE "DELETE" TO CONFIRM
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  style={{
                    width: '100%', padding: '10px 14px', border: '2px solid #000',
                    fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em',
                    fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                    borderColor: deleteConfirmText === 'DELETE' ? '#FF3000' : '#000',
                  }}
                  autoComplete="off"
                />
              </div>

              {deleteError && (
                <div style={{
                  backgroundColor: '#FFF5F5', border: '1px solid #FF3000',
                  padding: '10px 14px', marginBottom: '16px',
                  fontSize: '12px', fontWeight: 700, color: '#FF3000',
                }}>
                  {deleteError}
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div style={{ padding: '0 28px 28px', display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText(''); setDeleteError('') }}
                disabled={deleting}
                style={{
                  flex: 1, padding: '12px', border: '2px solid #000', backgroundColor: 'transparent',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deleting}
                style={{
                  flex: 1, padding: '12px',
                  backgroundColor: deleteConfirmText === 'DELETE' && !deleting ? '#FF3000' : '#ccc',
                  border: '2px solid transparent',
                  color: '#fff', fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
                  cursor: deleteConfirmText === 'DELETE' && !deleting ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                }}
              >
                {deleting ? 'DELETING...' : 'CONFIRM DELETE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
