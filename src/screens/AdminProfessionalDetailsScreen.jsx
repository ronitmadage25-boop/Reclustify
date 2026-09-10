import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './FlowScreens.module.css'

export default function AdminProfessionalDetailsScreen() {
  const { userProfile, saveProfile, setCurrentScreen } = useAuth()

  const [designation, setDesignation] = useState(userProfile.adminDetails?.designation || 'Director of Campus Infrastructure')
  const [office, setOffice] = useState(userProfile.adminDetails?.office || 'Admin Block, Suite 402')
  const [phone, setPhone] = useState(userProfile.adminDetails?.phone || '+1 (617) 555-0198')
  const [scope, setScope] = useState('Campus-Wide Facilities & IT Triage')

  const handleSubmit = (e) => {
    e.preventDefault()
    saveProfile({
      ...userProfile,
      adminDetails: {
        ...userProfile.adminDetails,
        designation,
        office,
        phone,
        scope,
      },
    })
    setCurrentScreen('admin-proof')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.stepNum}>ADMIN ONBOARDING // 02</span>
        <span className={styles.tagline}>PROFESSIONAL POSTING & SCOPE</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={`${styles.badge} ${styles.badgeAdmin}`}>PROFESSIONAL DETAILS</span>
          <span className={styles.badgeSub}>AUTHORIZATION VERIFICATION</span>
        </div>

        <form onSubmit={handleSubmit} className={styles.cardContent}>
          <h2 className={styles.title}>
            CAMPUS
            <br />
            <span className={styles.titleAccent}>RESPONSIBILITY SCOPE.</span>
          </h2>
          <p className={styles.subtitle}>
            Specify your official title and campus workstation to facilitate automated work-order routing and ticket escalation.
          </p>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>OFFICIAL DESIGNATION / TITLE</label>
              <input
                type="text"
                className={styles.input}
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Dean of Facilities"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>CAMPUS OFFICE / DESK LOCATION</label>
              <input
                type="text"
                className={styles.input}
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                placeholder="e.g. Building 10, Room 312"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>DIRECT TELEPHONE EXTENSION</label>
              <input
                type="text"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +1 (555) 234-5678"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ADMINISTRATIVE JURISDICTION</label>
              <input
                type="text"
                className={styles.input}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Science Complex & Digital Labs"
                required
              />
            </div>
          </div>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setCurrentScreen('admin-details')}
            >
              ← BACK
            </button>
            <button
              type="submit"
              className={styles.primaryBtn}
            >
              CONTINUE TO PROOF UPLOAD →
            </button>
          </div>
        </form>

        <div className={styles.cardFooter}>
          <span>ROLE: {userProfile.adminDetails?.dept || 'OPERATIONS'}</span>
          <span>COMPLIANCE: FERPA READY</span>
        </div>
      </div>
    </div>
  )
}
