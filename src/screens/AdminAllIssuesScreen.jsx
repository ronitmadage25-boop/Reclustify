import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminClusters } from '../services/db'
import styles from './AdminScreens.module.css'

export default function AdminAllIssuesScreen({ onSelectCluster }) {
  const { setCurrentScreen, userProfile } = useAuth()
  const [clusters, setClusters] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const [selectedClusterDbId, setSelectedClusterDbId] = useState(null)

  useEffect(() => {
    const institutionId = userProfile?.collegeId
    if (!institutionId) {
      // Fallback: use MIT seed data institution for demo/admin users without ID
      fetchAdminClusters('a0000000-0000-0000-0000-000000000001')
        .then(setClusters)
        .finally(() => setLoading(false))
      return
    }
    fetchAdminClusters(institutionId)
      .then(setClusters)
      .finally(() => setLoading(false))
  }, [userProfile?.collegeId])

  const filtered = clusters.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cluster_key?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    const matchesDept = deptFilter === 'ALL' || c.department === deptFilter

    return matchesSearch && matchesStatus && matchesDept
  })

  const handleInspect = (cluster) => {
    setSelectedClusterDbId(cluster.id)
    if (onSelectCluster) {
      onSelectCluster(cluster.cluster_key, cluster.id)
    }
    setCurrentScreen('admin-issue-details')
  }

  const departments = [...new Set(clusters.map((c) => c.department).filter(Boolean))]

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
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.tableCard} style={{ padding: '48px', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#999' }}>
            LOADING CLUSTER REGISTRY...
          </span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className={styles.tableCard} style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', border: '1px solid #000', display: 'inline-block', padding: '6px 14px', marginBottom: '12px' }}>
            NO CLUSTERS FOUND
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
            {searchTerm || statusFilter !== 'ALL' || deptFilter !== 'ALL'
              ? 'No clusters match the current filters.'
              : 'No problem clusters have been formed yet.'}
          </p>
        </div>
      )}

      {/* Cluster Table */}
      {!loading && filtered.length > 0 && (
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
                  <td className={styles.tableId}>#{cluster.cluster_key}</td>
                  <td>
                    <div className={styles.tableTitle}>{cluster.title}</div>
                    <div className={styles.tableLocation}>{cluster.location}</div>
                  </td>
                  <td className={styles.tableDept}>{cluster.department || '—'}</td>
                  <td className={styles.tableReports}>{cluster.reports_count || 0} REPORTS</td>
                  <td>
                    <span className={`${styles.priorityBadge} ${cluster.priority === 'HIGH' || cluster.priority === 'CRITICAL' ? styles.priHigh : cluster.priority === 'MEDIUM' ? styles.priMed : styles.priLow}`}>
                      {cluster.priority_score}/100 ({cluster.priority || 'LOW'})
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
                      onClick={() => handleInspect(cluster)}
                    >
                      INSPECT →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
