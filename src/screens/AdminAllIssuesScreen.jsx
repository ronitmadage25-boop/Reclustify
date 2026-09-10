import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

const CLUSTERS = [
  {
    id: 'C-104',
    title: 'Lab 3 Wi-Fi Connectivity & Dropouts',
    department: 'IT INFRASTRUCTURE',
    location: 'Science Complex, Lab 3',
    reportsCount: 4,
    priorityScore: 82,
    priority: 'HIGH',
    status: 'IN PROGRESS',
    daysActive: 2,
  },
  {
    id: 'C-098',
    title: 'Library 3rd Floor HVAC Overheating',
    department: 'CAMPUS FACILITIES',
    location: 'Central Library, Zone B',
    reportsCount: 7,
    priorityScore: 64,
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    daysActive: 4,
  },
  {
    id: 'C-095',
    title: 'Lecture Hall 101 Microphone Feedback',
    department: 'AUDIO-VISUAL SUPPORT',
    location: 'Main Auditorium, LH 101',
    reportsCount: 3,
    priorityScore: 48,
    priority: 'LOW',
    status: 'IN PROGRESS',
    daysActive: 1,
  },
  {
    id: 'C-092',
    title: 'North Dorm Water Pressure Malfunction',
    department: 'RESIDENTIAL HOUSING',
    location: 'North Hall, Floors 2-4',
    reportsCount: 5,
    priorityScore: 78,
    priority: 'HIGH',
    status: 'RESOLVED',
    daysActive: 5,
  },
  {
    id: 'C-089',
    title: 'Chemistry Lab Fume Hood Airflow Fault',
    department: 'HEALTH & SAFETY',
    location: 'Chemistry Wing, Room 114',
    reportsCount: 2,
    priorityScore: 91,
    priority: 'HIGH',
    status: 'IN PROGRESS',
    daysActive: 1,
  },
  {
    id: 'C-084',
    title: 'Campus Perimeter Pathway Lighting Outage',
    department: 'CAMPUS FACILITIES',
    location: 'West Gate Walkway',
    reportsCount: 6,
    priorityScore: 70,
    priority: 'MEDIUM',
    status: 'ASSIGNED',
    daysActive: 3,
  },
]

export default function AdminAllIssuesScreen({ onSelectCluster }) {
  const { setCurrentScreen } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')

  const filtered = CLUSTERS.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter

    return matchesSearch && matchesStatus && matchesDept
  })

  const handleInspect = (clusterId) => {
    if (onSelectCluster) {
      onSelectCluster(clusterId)
    }
    setCurrentScreen('admin-issue-details')
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>CLUSTER REGISTRY // MASTER INDEX</div>
          <h1 className={styles.bannerTitle}>ALL CAMPUS PROBLEM CLUSTERS</h1>
          <p className={styles.bannerSub}>
            INSPECT ALGORITHMICALLY AGGREGATED TICKETS, ROUTING, AND RESOLUTION PROGRESS.
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

      {/* Filter and Search Bar */}
      <div className={styles.registryFilterBar}>
        <div className={styles.searchWrap}>
          <input
            type="text"
            className={styles.registrySearch}
            placeholder="Search clusters by ID, keyword, or room location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterDropdowns}>
          <select
            className={styles.selectFilter}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>

          <select
            className={styles.selectFilter}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            <option value="IT INFRASTRUCTURE">IT INFRASTRUCTURE</option>
            <option value="CAMPUS FACILITIES">CAMPUS FACILITIES</option>
            <option value="HEALTH & SAFETY">HEALTH & SAFETY</option>
            <option value="RESIDENTIAL HOUSING">RESIDENTIAL HOUSING</option>
          </select>
        </div>
      </div>

      {/* Cluster Table */}
      <div className={styles.tableCard}>
        <table className={styles.clusterTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>CLUSTER SUMMARY</th>
              <th>DEPARTMENT</th>
              <th>REPORTS</th>
              <th>PRIORITY SCORE</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cluster) => (
              <tr key={cluster.id}>
                <td className={styles.tableId}>#{cluster.id}</td>
                <td>
                  <div className={styles.tableTitle}>{cluster.title}</div>
                  <div className={styles.tableLocation}>{cluster.location}</div>
                </td>
                <td className={styles.tableDept}>{cluster.department}</td>
                <td className={styles.tableReports}>{cluster.reportsCount} REPORTS</td>
                <td>
                  <span className={`${styles.priorityBadge} ${cluster.priority === 'HIGH' ? styles.priHigh : cluster.priority === 'MEDIUM' ? styles.priMed : styles.priLow}`}>
                    {cluster.priorityScore}/100 ({cluster.priority})
                  </span>
                </td>
                <td>
                  <span className={`${styles.statusPill} ${cluster.status === 'RESOLVED' ? styles.pillResolved : styles.pillProgress}`}>
                    {cluster.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.tableInspectBtn}
                    onClick={() => handleInspect(cluster.id)}
                  >
                    INSPECT →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
