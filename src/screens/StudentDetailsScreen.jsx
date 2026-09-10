import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function StudentDetailsScreen() {
  const { user, userProfile, saveProfile, setCurrentScreen } = useAuth()

  const defaultName = userProfile.studentDetails?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const [name, setName] = useState(defaultName)
  const [studentId, setStudentId] = useState(userProfile.studentDetails?.id || 'STU-2026-8819')
  const [department, setDepartment] = useState(userProfile.studentDetails?.dept || 'Computer Science & Engineering')
  const [year, setYear] = useState(userProfile.studentDetails?.year || '3rd Year (Class of 2027)')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please provide your full legal or campus name.')
      return
    }

    saveProfile({
      ...userProfile,
      studentDetails: {
        name: name.trim(),
        id: studentId.trim(),
        dept: department.trim(),
        year: year.trim(),
      },
      onboardingComplete: true,
    })

    setCurrentScreen('student-dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>STEP 03 / 03</span>
        <span className={styles.tagline}>ACADEMIC PROFILE VERIFICATION</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>STUDENT DETAILS</span>
          <span className={styles.badgeSub}>{userProfile.college || 'CAMPUS ASSIGNED'}</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.cardContent}>
          <h2 className={styles.title}>
            COMPLETE YOUR
            <br />
            <span className={styles.titleAccent}>STUDENT PROFILE.</span>
          </h2>
          <p className={styles.subtitle}>
            Your profile allows department officials to verify authentic reports and notify you when recurring clusters are resolved.
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
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>AUTHENTICATED EMAIL</label>
              <input
                type="email"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={user?.email || 'student@university.edu'}
                disabled
                readOnly
              />
              <span className={styles.inputNote}>Verified via Google OAuth identity</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>STUDENT / ROLL ID</label>
              <input
                type="text"
                className={styles.input}
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. 23CS0194"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ACADEMIC DEPARTMENT / MAJOR</label>
              <input
                type="text"
                className={styles.input}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Electrical Engineering"
                required
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>YEAR OF STUDY / BATCH</label>
              <input
                type="text"
                className={styles.input}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 3rd Year / 2026 Batch"
                required
              />
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('college-selection')}
            >
              ← BACK
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              LAUNCH STUDENT DASHBOARD →
            </button>
          </div>
        </form>

        <div className={styles.cardFooter}>
          <span>PRIVACY: ANONYMIZED IN PUBLIC CLUSTERS</span>
          <span>CAMPUS: {userProfile.collegeCode || 'GLOBAL'}</span>
        </div>
      </div>
    </div>
  )
}
