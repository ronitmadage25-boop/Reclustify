import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

const DEPARTMENTS = [
  {
    id: 'it',
    name: 'IT INFRASTRUCTURE & NETWORKS',
    head: 'Marcus Vance, Chief Information Officer',
    email: 'it-infrastructure@campus.edu',
    location: 'Building 4, Room 210',
    activeClusters: 5,
    assignedStaff: 12,
    slaHours: 48,
  },
  {
    id: 'facilities',
    name: 'CAMPUS FACILITIES & MAINTENANCE',
    head: 'Sarah Chen, VP of Facilities',
    email: 'facilities@campus.edu',
    location: 'Physical Plant, Suite 100',
    activeClusters: 6,
    assignedStaff: 24,
    slaHours: 72,
  },
  {
    id: 'safety',
    name: 'CAMPUS SAFETY & EMERGENCY SERVICES',
    head: 'Capt. Robert Hayes, Director of Safety',
    email: 'safety-dispatch@campus.edu',
    location: 'Security HQ, Gate 1',
    activeClusters: 1,
    assignedStaff: 18,
    slaHours: 24,
  },
  {
    id: 'housing',
    name: 'RESIDENTIAL LIFE & HOUSING OPERATIONS',
    head: 'Dr. Priya Nair, Dean of Residential Life',
    email: 'housing-ops@campus.edu',
    location: 'Student Union, Room 304',
    activeClusters: 2,
    assignedStaff: 15,
    slaHours: 48,
  },
]

export default function AdminDepartmentsScreen() {
  const { setCurrentScreen } = useAuth()
  const [selectedDept, setSelectedDept] = useState(DEPARTMENTS[0])

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>ORGANIZATIONAL MANAGEMENT // DISPATCH</div>
          <h1 className={styles.bannerTitle}>CAMPUS OPERATIONAL DEPARTMENTS</h1>
          <p className={styles.bannerSub}>
            CONFIGURE WORK ORDER ROUTING, ESCALATION POLICIES, AND DEPARTMENTAL LEADS.
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

      <div className={styles.deptManagementGrid}>
        {/* Left: Department List */}
        <div className={styles.deptCardList}>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selectedDept.id === dept.id
            return (
              <div
                key={dept.id}
                className={`${styles.deptManageItem} ${isSelected ? styles.deptManageSelected : ''}`}
                onClick={() => setSelectedDept(dept)}
              >
                <div className={styles.deptManageTop}>
                  <span className={styles.deptCode}>{dept.id.toUpperCase()}</span>
                  <span className={styles.deptClustersBadge}>{dept.activeClusters} ACTIVE CLUSTERS</span>
                </div>
                <h3 className={styles.deptTitleText}>{dept.name}</h3>
                <div className={styles.deptHeadText}>LEAD: {dept.head}</div>
              </div>
            )
          })}
        </div>

        {/* Right: Department Details & Routing Configuration */}
        <div className={styles.deptDetailBox}>
          <div className={styles.deptDetailHeader}>
            <div>
              <span className={styles.detailTag}>DEPARTMENT CONFIGURATION</span>
              <h2 className={styles.detailTitle}>{selectedDept.name}</h2>
            </div>
            <span className={styles.statusHigh}>ROUTING ACTIVE</span>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>PRIMARY CONTACT</span>
              <span className={styles.detailValue}>{selectedDept.head}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>DISPATCH INBOX</span>
              <span className={styles.detailValue}>{selectedDept.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>DISPATCH HEADQUARTERS</span>
              <span className={styles.detailValue}>{selectedDept.location}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>ACTIVE FIELD TECHNICIANS</span>
              <span className={styles.detailValue}>{selectedDept.assignedStaff} PERSONNEL</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>SERVICE LEVEL AGREEMENT (SLA)</span>
              <span className={styles.detailValue}>UNDER {selectedDept.slaHours} HOURS</span>
            </div>
          </div>

          <div className={styles.routingRulesBox}>
            <span className={styles.rulesTitle}>AUTOMATED INTAKE ROUTING RULES</span>
            <ul className={styles.rulesList}>
              <li>✓ Automatically receive clusters tagged with relevant infrastructure categories</li>
              <li>✓ Urgent severity tickets escalate to departmental email immediately</li>
              <li>✓ Resolution pings dispatched to affected student groups upon cluster completion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
