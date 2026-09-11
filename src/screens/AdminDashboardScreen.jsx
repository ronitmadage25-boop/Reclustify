import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminClusters, fetchAdminDashboardStats } from '../services/db'
import styles from './AdminScreens.module.css'

export default function AdminDashboardScreen({ onSelectCluster }) {
  const { userProfile, setCurrentScreen } = useAuth()
  const [topClusters, setTopClusters] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const institutionId = userProfile?.collegeId || 'a0000000-0000-0000-0000-000000000001'

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [clustersData, statsData] = await Promise.all([
        fetchAdminClusters(institutionId),
        fetchAdminDashboardStats(institutionId),
      ])
      // Show top 2 non-resolved clusters by priority
      const top = (clustersData || [])
        .filter((c) => c.status !== 'RESOLVED')
        .slice(0, 2)
      setTopClusters(top)
      setStats(statsData)
      setLoading(false)
    }
    load()
  }, [institutionId])

  const handleOpenCluster = (clusterKey, clusterDbId) => {
    if (onSelectCluster) {
      onSelectCluster(clusterKey, clusterDbId)
    }
    setCurrentScreen('admin-issue-details')
  }

  const displayStats = {
    totalComplaints: stats?.totalComplaints ?? 142,
    totalClusters: stats?.totalClusters ?? 14,
    resolvedClusters: stats?.resolvedClusters ?? 0,
    criticalAlerts: stats?.criticalAlerts ?? 3,
  }

  const resolutionRate = displayStats.totalClusters > 0
    ? Math.round((displayStats.resolvedClusters / displayStats.totalClusters) * 100)
    : 0

  return (
    <div className={styles.dashboard}>
      {/* Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>ADMINISTRATIVE INTELLIGENCE // SECURE</div>
          <h1 className={styles.bannerTitle}>CAMPUS PROBLEM INTELLIGENCE</h1>
          <p className={styles.bannerSub}>
            INSTITUTION: {userProfile.college?.toUpperCase() || 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY'} · DEPT: {userProfile.adminDetails?.dept?.toUpperCase() || 'OPERATIONS'}
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setCurrentScreen('admin-all-issues')}
          >
            VIEW ALL ISSUES & CLUSTERS →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>TOTAL STUDENT COMPLAINTS</span>
          <span className={styles.metricValue}>{loading ? '—' : displayStats.totalComplaints}</span>
          <span className={styles.metricNote}>ACROSS ALL ACTIVE CLUSTERS</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>FORMED PROBLEM CLUSTERS</span>
          <span className={`${styles.metricValue} ${styles.metricAccent}`}>{loading ? '—' : displayStats.totalClusters}</span>
          <span className={styles.metricNote}>ALGORITHMICALLY GROUPED TICKETS</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>RESOLUTION RATE</span>
          <span className={styles.metricValue}>{loading ? '—' : `${resolutionRate}%`}</span>
          <span className={styles.metricNote}>{loading ? '' : `${displayStats.resolvedClusters} OF ${displayStats.totalClusters} CLUSTERS RESOLVED`}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>CRITICAL INFRASTRUCTURE ALERTS</span>
          <span className={styles.metricValue}>{loading ? '—' : String(displayStats.criticalAlerts).padStart(2, '0')}</span>
          <span className={styles.metricNote}>HIGH/CRITICAL PRIORITY, UNRESOLVED</span>
        </div>
      </div>

      {/* Main Multi-Column Section */}
      <div className={styles.mainGrid}>
        {/* Left: Priority Problem Clusters */}
        <div className={styles.colMain}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>HIGH-PRIORITY ISSUE CLUSTERS</h2>
              <span className={styles.sectionSub}>ALGORITHMICALLY GROUPED TICKETS REQUIRING ATTENTION</span>
            </div>
            <button
              type="button"
              className={styles.textBtn}
              onClick={() => setCurrentScreen('admin-all-issues')}
            >
              FULL REGISTRY →
            </button>
          </div>

          <div className={styles.clusterList}>
            {loading && (
              <div style={{ padding: '32px', textAlign: 'center', color: '#999', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>
                LOADING ACTIVE CLUSTERS...
              </div>
            )}

            {!loading && topClusters.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', border: '1px solid #000', display: 'inline-block', padding: '6px 14px', marginBottom: '12px' }}>
                  NO ACTIVE CLUSTERS
                </div>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '8px' }}>
                  All clusters are resolved, or no reports have been filed yet.
                </p>
              </div>
            )}

            {!loading && topClusters.map((cluster) => (
              <div key={cluster.id} className={styles.clusterCard}>
                <div className={styles.clusterHeader}>
                  <span className={styles.clusterId}>CLUSTER #{cluster.cluster_key}</span>
                  <span className={`${styles.statusBadge} ${
                    cluster.priority === 'HIGH' || cluster.priority === 'CRITICAL'
                      ? styles.statusHigh
                      : cluster.priority === 'MEDIUM'
                      ? styles.statusMedium
                      : styles.statusLow
                  }`}>
                    {cluster.priority} PRIORITY ({cluster.priority_score}/100)
                  </span>
                </div>
                <h3 className={styles.clusterTitle}>{cluster.title}</h3>
                <p className={styles.clusterDesc}>
                  {cluster.reports_count || 0} students filed independent reports regarding this issue in {cluster.location || 'campus'}.
                </p>
                <div className={styles.clusterMeta}>
                  <span>DEPARTMENT: {cluster.department || 'CAMPUS OPERATIONS'}</span>
                  <span>STATUS: {cluster.status}</span>
                  <span>REPORTS: {cluster.reports_count || 0} CONVERGED</span>
                </div>
                <div className={styles.clusterFooter}>
                  <span className={styles.assignee}>CATEGORY: {cluster.category || 'GENERAL'}</span>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleOpenCluster(cluster.cluster_key, cluster.id)}
                  >
                    INSPECT CLUSTER DETAILS →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Department Health & Quick Triage */}
        <div className={styles.colSide}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>MANAGEMENT SHORTCUTS</h2>
              <span className={styles.sectionSub}>QUICK ACCESS NAVIGATION</span>
            </div>
          </div>

          <div className={styles.quickActionsCard}>
            <span className={styles.cardHeaderSmall}>MANAGEMENT SHORTCUTS</span>
            <div className={styles.shortcutBtns}>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-all-issues')}
              >
                ALL CLUSTERS & ISSUES →
              </button>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-analytics')}
              >
                CAMPUS ANALYTICS →
              </button>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-departments')}
              >
                MANAGE DEPARTMENTS →
              </button>
              <button
                type="button"
                className={styles.shortcutBtn}
                onClick={() => setCurrentScreen('admin-settings')}
              >
                CAMPUS SETTINGS →
              </button>
            </div>
          </div>

          {/* Stats summary card */}
          {!loading && stats && (
            <div className={styles.statusControlCard} style={{ marginTop: '16px' }}>
              <span className={styles.cardHeaderSmall}>CAMPUS STATUS OVERVIEW</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  <span>TOTAL COMPLAINTS</span>
                  <span style={{ color: '#FF3000' }}>{displayStats.totalComplaints}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  <span>ACTIVE CLUSTERS</span>
                  <span>{displayStats.totalClusters - displayStats.resolvedClusters}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  <span>RESOLVED CLUSTERS</span>
                  <span style={{ color: '#00B85C' }}>{displayStats.resolvedClusters}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  <span>CRITICAL ALERTS</span>
                  <span style={{ color: '#FF3000' }}>{displayStats.criticalAlerts}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
