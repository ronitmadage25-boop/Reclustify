import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

export default function StudentSettingsScreen() {
  const { user, userProfile, setCurrentScreen, signOut, deleteAccount } = useAuth()

  // Deletion dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ACCOUNT // SETTINGS</span>
        <span className={styles.tagline}>SESSION & ACCOUNT MANAGEMENT</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={styles.badge}>STUDENT ACCOUNT</span>
          <span className={styles.badgeSub}>{userProfile.college?.toUpperCase() || 'CAMPUS NETWORK'}</span>
        </div>

        <div className={styles.formBody}>
          <h2 className={styles.formTitle}>
            ACCOUNT
            <br />
            <span className={styles.titleAccent}>MANAGEMENT.</span>
          </h2>

          {/* Account info */}
          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #e0e0e0', backgroundColor: '#FAFAFA' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.15em', color: '#808080', marginBottom: '8px' }}>
              AUTHENTICATED IDENTITY
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700 }}>{user?.email || 'Google User'}</div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
              {userProfile.studentDetails?.name || ''} · STUDENT
            </div>
          </div>

          {/* Sign Out */}
          <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #000' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '8px' }}>
              SESSION MANAGEMENT
            </div>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: 1.5 }}>
              Terminates your active session and returns you to the Reclustify landing page.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={signOut}
              style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
            >
              SIGN OUT OF RECLUSTIFY →
            </button>
          </div>

          {/* Delete Account */}
          <div style={{ padding: '20px', border: '2px solid #FF3000', backgroundColor: '#FFF5F5' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', marginBottom: '8px', color: '#FF3000' }}>
              ⚠ DANGER ZONE — IRREVERSIBLE
            </div>
            <p style={{ fontSize: '13px', color: '#444', marginBottom: '16px', lineHeight: 1.5 }}>
              Permanently deletes your Reclustify account, all personal data, and submitted complaints. <strong>This action cannot be undone.</strong>
            </p>
            <button
              type="button"
              onClick={() => { setShowDeleteDialog(true); setDeleteConfirmText(''); setDeleteError('') }}
              style={{
                width: '100%', padding: '12px', border: '2px solid #FF3000',
                backgroundColor: 'transparent', color: '#FF3000',
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.15em',
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'uppercase',
              }}
            >
              DELETE ACCOUNT PERMANENTLY
            </button>
          </div>

          <div className={styles.buttonRow} style={{ marginTop: '24px' }}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('student-dashboard')}
            >
              ← BACK TO DASHBOARD
            </button>
          </div>
        </div>

        <div className={styles.formCardFooter}>
          <span>RECLUSTIFY // ACCOUNT SECURITY</span>
          <span>GOOGLE OAUTH</span>
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
            fontFamily: 'inherit',
          }}>
            <div style={{
              backgroundColor: '#FF3000', padding: '16px 24px',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.15em', color: '#fff' }}>
                PERMANENT ACCOUNT DELETION // IRREVERSIBLE ACTION
              </span>
            </div>

            <div style={{ padding: '28px 28px 0' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '12px', color: '#000' }}>
                DELETE ACCOUNT PERMANENTLY?
              </h2>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#444', marginBottom: '12px' }}>
                This will permanently delete your Reclustify account and all associated personal data — your student profile, onboarding details, complaint history, and any uploaded evidence photos.
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#444', marginBottom: '8px' }}>
                <strong>This action cannot be undone.</strong> Signing in with the same Google account afterwards will create a completely fresh Reclustify account with no history.
              </p>

              <div style={{
                backgroundColor: '#FFF5F5', border: '1px solid #FF3000',
                padding: '12px 16px', margin: '16px 0',
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
