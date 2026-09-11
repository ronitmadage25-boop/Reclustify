import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './StudentScreens.module.css'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function ReportProblemScreen({ onAnalyze }) {
  const { setCurrentScreen, userProfile } = useAuth()
  const [category, setCategory] = useState('IT & NETWORK')
  const [location, setLocation] = useState('Science Block, Lab 3')
  const [title, setTitle] = useState('Wi-Fi keeps dropping during practical sessions')
  const [description, setDescription] = useState('Computers in row 2 and 4 cannot connect to the college network router. Multiple students cannot complete assignment uploads.')
  const [severity, setSeverity] = useState('HIGH')
  const [error, setError] = useState('')

  // Image upload state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    setImageError('')

    if (!file) {
      setImageFile(null)
      setImagePreview(null)
      return
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Invalid file type. Please upload JPG, JPEG, PNG, or WEBP.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setImageError('File too large. Maximum size is 5 MB.')
      e.target.value = ''
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      setError('Please provide both an issue title and description.')
      return
    }

    const draftReport = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      severity,
      submittedAt: 'Just now',
      status: 'IN PROGRESS',
      // Pass the selected image file through to AIAnalysisPreviewScreen
      imageFile: imageFile || null,
    }

    if (onAnalyze) {
      onAnalyze(draftReport)
    } else {
      setCurrentScreen('ai-analysis-preview')
    }
  }

  return (
    <div className={styles.formContainer}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>REPORT PROTOCOL // 01</span>
        <span className={styles.tagline}>STRUCTURED COMPLAINT INTAKE</span>
      </div>

      <div className={styles.formCard}>
        <div className={styles.formCardHeader}>
          <span className={styles.badge}>NEW REPORT</span>
          <span className={styles.badgeSub}>{userProfile.college || 'CAMPUS NETWORK'}</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.formBody}>
          <h2 className={styles.formTitle}>
            REPORT A REAL
            <br />
            <span className={styles.titleAccent}>CAMPUS PROBLEM.</span>
          </h2>
          <p className={styles.formSubtitle}>
            Describe the problem in plain language. Reclustify will automatically parse the context, analyze semantic similarity against campus tickets, and cluster related reports together.
          </p>

          {error && <div className={styles.formError}>{error}</div>}

          <div className={styles.inputGrid}>
            {/* Category */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>CATEGORY</label>
              <select
                className={styles.select}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="IT & NETWORK">IT & NETWORK</option>
                <option value="CAMPUS FACILITIES">CAMPUS FACILITIES</option>
                <option value="ACADEMIC LABS">ACADEMIC LABS</option>
                <option value="HOUSING & DORM">HOUSING & DORM</option>
                <option value="CAMPUS SAFETY">CAMPUS SAFETY</option>
              </select>
            </div>

            {/* Severity */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>ESTIMATED IMPACT / SEVERITY</label>
              <div className={styles.severityToggle}>
                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    className={`${styles.sevBtn} ${severity === lvl ? styles.sevActive : ''}`}
                    onClick={() => setSeverity(lvl)}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>EXACT CAMPUS LOCATION</label>
              <input
                type="text"
                className={styles.input}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Science Block, 2nd Floor, Lab 3"
                required
              />
            </div>

            {/* Title */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>PROBLEM SUMMARY</label>
              <input
                type="text"
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Internet disconnects every 5 minutes in computer lab"
                required
              />
            </div>

            {/* Description */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>DETAILED DESCRIPTION (PLAIN LANGUAGE)</label>
              <textarea
                className={styles.textarea}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the recurring nature of the issue, who is affected, and any observable patterns..."
                required
              />
            </div>

            {/* Evidence Image Upload */}
            <div className={`${styles.inputGroup} ${styles.fullRow}`}>
              <label className={styles.label}>
                EVIDENCE / PHOTO
                <span style={{
                  display: 'inline-block', marginLeft: '8px', fontSize: '9px',
                  fontWeight: 700, letterSpacing: '0.1em', color: '#808080',
                  border: '1px solid #ccc', padding: '2px 6px',
                }}>
                  OPTIONAL
                </span>
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #ccc',
                    borderRadius: '0',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                    backgroundColor: '#FAFAFA',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#000'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ccc'}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📎</div>
                  <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#333' }}>
                    UPLOAD IMAGE
                  </div>
                  <div style={{ fontSize: '11px', color: '#808080', marginTop: '4px' }}>
                    JPG, JPEG, PNG, WEBP · MAX 5 MB
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', border: '2px solid #000' }}>
                  <img
                    src={imagePreview}
                    alt="Evidence preview"
                    style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    padding: '8px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#fff' }}>
                      {imageFile?.name} · {(imageFile?.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        background: 'transparent', border: '1px solid #fff',
                        color: '#fff', padding: '2px 8px', cursor: 'pointer',
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
                        fontFamily: 'inherit',
                      }}
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="evidence-upload"
              />

              {imageError && (
                <div className={styles.formError} style={{ marginTop: '8px' }}>{imageError}</div>
              )}

              {imageFile && (
                <div style={{ fontSize: '11px', color: '#00B85C', fontWeight: 700, marginTop: '6px', letterSpacing: '0.05em' }}>
                  ✓ EVIDENCE ATTACHED — WILL BE UPLOADED WITH COMPLAINT
                </div>
              )}
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('student-dashboard')}
            >
              ← CANCEL
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              RUN RECLUSTIFY ANALYSIS →
            </button>
          </div>
        </form>

        <div className={styles.formCardFooter}>
          <span>SEMANTIC ANALYSIS: ENABLED</span>
          <span>REPORTS ARE CLUSTERED ANONYMOUSLY</span>
        </div>
      </div>
    </div>
  )
}
