import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchInstitutions, FALLBACK_INSTITUTIONS } from '../services/db'
import styles from './FlowScreens.module.css'

export default function CollegeSelectionScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()
  const [colleges, setColleges] = useState(FALLBACK_INSTITUTIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(userProfile.collegeId || FALLBACK_INSTITUTIONS[0].id)

  useEffect(() => {
    let mounted = true
    fetchInstitutions().then((data) => {
      if (mounted && data?.length) {
        setColleges(data)
        if (!userProfile.collegeId) {
          setSelectedId(data[0].id)
        }
      }
    })
    return () => {
      mounted = false
    }
  }, [userProfile.collegeId])

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleContinue = () => {
    const chosen = colleges.find((c) => c.id === selectedId) || colleges[0]
    saveProfile({
      ...userProfile,
      college: chosen.name,
      collegeCode: chosen.code,
      collegeId: chosen.id,
    })
    setCurrentScreen('student-details')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>STEP 02 / 03</span>
        <span className={styles.tagline}>INSTITUTIONAL PARTITIONING</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.badge}>CAMPUS NETWORK</span>
          <span className={styles.badgeSub}>STUDENT ONBOARDING</span>
        </div>

        <div className={styles.cardContent}>
          <h2 className={styles.title}>
            SELECT YOUR
            <br />
            <span className={styles.titleAccent}>COLLEGE CAMPUS.</span>
          </h2>
          <p className={styles.subtitle}>
            Reclustify partitions problem intelligence by institution. Your reports will exclusively form clusters within your university's active network.
          </p>

          {/* Search box */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">⌕</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search college name, code, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search college campus"
            />
          </div>

          {/* Colleges list */}
          <div className={styles.collegeGrid} role="radiogroup" aria-label="Available campuses">
            {filtered.map((college) => {
              const isSelected = selectedId === college.id
              return (
                <div
                  key={college.id}
                  className={`${styles.collegeItem} ${isSelected ? styles.collegeSelected : ''}`}
                  onClick={() => setSelectedId(college.id)}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedId(college.id)
                    }
                  }}
                >
                  <div className={styles.collegeTop}>
                    <span className={styles.collegeCode}>{college.code}</span>
                    <span className={styles.collegeClusters}>{college.activeClusters} ACTIVE CLUSTERS</span>
                  </div>
                  <div className={styles.collegeName}>{college.name}</div>
                  <div className={styles.collegeCity}>{college.city}</div>
                </div>
              )
            })}
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
              type="button"
              className={styles.primaryBtn}
              onClick={handleContinue}
            >
              CONTINUE TO DETAILS →
            </button>
          </div>
        </div>

        <div className={styles.cardFooter}>
          <span>DATA ISOLATION: STRICT MULTI-TENANCY</span>
          <span>CAMPUS ID: #{selectedId.toUpperCase()}</span>
        </div>
      </div>
    </div>
  )
}
