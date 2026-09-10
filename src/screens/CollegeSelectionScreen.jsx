import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

const COLLEGES = [
  { id: 'mit', name: 'Massachusetts Institute of Technology', code: 'MIT', city: 'Cambridge, MA', activeClusters: 14 },
  { id: 'stanford', name: 'Stanford University', code: 'STANFORD', city: 'Stanford, CA', activeClusters: 19 },
  { id: 'harvard', name: 'Harvard University', code: 'HARVARD', city: 'Cambridge, MA', activeClusters: 11 },
  { id: 'berkeley', name: 'UC Berkeley', code: 'UCB', city: 'Berkeley, CA', activeClusters: 23 },
  { id: 'iitb', name: 'Indian Institute of Technology Bombay', code: 'IITB', city: 'Mumbai, IN', activeClusters: 16 },
  { id: 'oxford', name: 'University of Oxford', code: 'OXON', city: 'Oxford, UK', activeClusters: 8 },
  { id: 'uw', name: 'University of Washington', code: 'UW', city: 'Seattle, WA', activeClusters: 15 },
  { id: 'cmu', name: 'Carnegie Mellon University', code: 'CMU', city: 'Pittsburgh, PA', activeClusters: 12 },
]

export default function CollegeSelectionScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState(userProfile.collegeId || 'mit')

  const filtered = COLLEGES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleContinue = () => {
    const chosen = COLLEGES.find((c) => c.id === selectedId) || COLLEGES[0]
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
