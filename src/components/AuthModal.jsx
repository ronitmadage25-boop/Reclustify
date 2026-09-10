import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import GoogleAuthButton from './GoogleAuthButton'
import styles from './AuthModal.module.css'

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen } = useAuth()
  const modalRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModalOpen) {
        setAuthModalOpen(false)
      }
    }
    if (authModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [authModalOpen, setAuthModalOpen])

  if (!authModalOpen) return null

  return (
    <div className={styles.backdrop} onClick={() => setAuthModalOpen(false)} role="dialog" aria-modal="true">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Header Bar */}
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderLeft}>
            <span className={styles.modalIndex}>AUTH // 01</span>
            <span className={styles.modalTag}>GOOGLE AUTHENTICATION</span>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setAuthModalOpen(false)}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          <div className={styles.badge}>RECLUSTIFY ACCESS</div>

          <h3 className={styles.heading}>
            ACCESS CAMPUS
            <br />
            <span className={styles.headingAccent}>PROBLEM INTELLIGENCE.</span>
          </h3>

          <p className={styles.subtext}>
            Connect with your Google account. Whether you are a student reporting issues or an administrator managing campus operations, Reclustify routes you to your campus network.
          </p>

          <div className={styles.actionBlock}>
            <GoogleAuthButton fullWidth={true} />
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureItem}>
              <span className={styles.featureNum}>01</span>
              <span className={styles.featureText}>Secure OAuth verification via Supabase</span>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureNum}>02</span>
              <span className={styles.featureText}>Role assigned during onboarding</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <span className={styles.footerNote}>REPORT. RECLUSTER. RESOLVE.</span>
          <span className={styles.footerBrand}>RECLUSTIFY SYSTEM</span>
        </div>
      </div>
    </div>
  )
}
