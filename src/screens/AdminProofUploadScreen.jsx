import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminProofUploadScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()
  const [fileName, setFileName] = useState(userProfile.adminDetails?.proofName || 'faculty_id_scanned.pdf')
  const [fileSize, setFileSize] = useState('1.8 MB')
  const [uploading, setUploading] = useState(false)

  const handleSimulatedUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      setTimeout(() => {
        setFileName(file.name)
        setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`)
        setUploading(false)
      }, 500)
    }
  }

  const handleContinue = () => {
    saveProfile({
      ...userProfile,
      adminDetails: {
        ...userProfile.adminDetails,
        proofName: fileName,
      },
    })
    setCurrentScreen('admin-request-code')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // 03</span>
        <span className={styles.tagline}>FACULTY CREDENTIAL VERIFICATION</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>DOCUMENT VERIFICATION</span>
          <span className={styles.badgeSub}>PROOF OF AFFILIATION</span>
        </div>

        <div className={styles.cardContent}>
          <h2 className={styles.title}>
            UPLOAD
            <br />
            <span className={styles.titleAccent}>INSTITUTIONAL PROOF.</span>
          </h2>
          <p className={styles.subtitle}>
            To safeguard campus intelligence and prevent unauthorized privilege escalation, please provide an official Staff ID Card or Dean's Authorization Letter.
          </p>

          {/* Upload Box */}
          <div className={styles.uploadZone}>
            <input
              type="file"
              id="proofUpload"
              className={styles.fileInput}
              onChange={handleSimulatedUpload}
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <label htmlFor="proofUpload" className={styles.uploadLabel}>
              <div className={styles.uploadIcon}>↑</div>
              <div className={styles.uploadTitle}>
                {uploading ? 'UPLOADING DOCUMENT...' : 'DROP PROOF FILE HERE OR CLICK TO BROWSE'}
              </div>
              <div className={styles.uploadSubtitle}>
                SUPPORTED FORMATS: PDF, PNG, JPG (MAX 10 MB)
              </div>
            </label>
          </div>

          {fileName && (
            <div className={styles.uploadedFileRow}>
              <div className={styles.fileIcon}>PDF</div>
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>{fileName}</span>
                <span className={styles.fileSize}>{fileSize} · READY FOR INSTITUTIONAL AUDIT</span>
              </div>
              <span className={styles.verifiedTag}>ATTACHED ✓</span>
            </div>
          )}

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('admin-professional')}
            >
              ← BACK
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleContinue}
              disabled={uploading}
            >
              CONTINUE TO INSTITUTION CODE →
            </button>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span>ENCRYPTION: AES-256</span>
          <span>COMPLIANCE: INSTITUTIONAL FERPA PROTOCOL</span>
        </div>
      </div>
    </div>
  )
}
