import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  fetchAdminClusters,
  fetchAdminDashboardStats,
  fetchAdminRecentComplaints,
  subscribeToInstitutionComplaints,
} from '../services/db'
import styles from './AdminScreens.module.css'

const STATUS_COLORS = {
  'SUBMITTED':    { bg: '#E8F5E9', color: '#1B5E20' },
  'UNDER REVIEW': { bg: '#FFF9C4', color: '#5D4037' },
  'ASSIGNED':     { bg: '#E3F2FD', color: '#0D47A1' },
  'IN PROGRESS':  { bg: '#FFF3E0', color: '#BF360C' },
  'RESOLVED':     { bg: '#F1F8E9', color: '#33691E' },
  'CLOSED':       { bg: '#F5F5F5', color: '#616161' },
}

export default function AdminDashboardScreen({ onSelectCluster }) {
  const { userProfile, setCurrentScreen } = useAuth()
  const [topClusters, setTopClusters] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newComplaintAlert, setNewComplaintAlert] = useState(false)
  const channelRef = useRef(null)

  const institutionId = userProfile?.collegeId

  async function loadData(instId) {
    if (!instId) return
    setLoading(true)
    const [clustersData, statsData, recentData] = await Promise.all([
      fetchAdminClusters(instId),
      fetchAdminDashboardStats(instId),
      fetchAdminRecentComplaints(instId, 5),
    ])
    // Show top 2 non-resolved clusters by priority
    const top = (clustersData || [])
      .filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED')
      .slice(0, 2)
    setTopClusters(top)
    setStats(statsData)
    setRecentComplaints(recentData || [])
    setLoading(false)
  }

  useEffect(() => {
    if (!institutionId) {
      setLoading(false)
      return
    }

    loadData(institutionId)

    // Set up Supabase Realtime subscription
    const channel = subscribeToInstitutionComplaints(
      institutionId,
      // onInsert: new complaint arrived
      (_newComplaint) => {
        setNewComplaintAlert(true)
        // Refresh data from DB
        loadData(institutionId)
        // Auto-clear alert after 8 seconds
        setTimeout(() => setNewComplaintAlert(false), 8000)
      },
      // onUpdate: complaint status changed
      (_updatedComplaint) => {
        loadData(institutionId)
      }
    )
    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [institutionId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenCluster = (clusterKey, clusterDbId) => {
    if (onSelectCluster) {
      onSelectCluster(clusterKey, clusterDbId)
    }
    setCurrentScreen('admin-issue-details')
  }

  const displayStats = {
    totalComplaints: stats?.totalComplaints ?? 0,
    openComplaints: stats?.openComplaints ?? 0,
    submittedComplaints: stats?.submittedComplaints ?? 0,
    underReviewComplaints: stats?.underReviewComplaints ?? 0,
    assignedComplaints: stats?.assignedComplaints ?? 0,
    inProgressComplaints: stats?.inProgressComplaints ?? 0,
    resolvedComplaints: stats?.resolvedComplaints ?? 0,
    criticalAlerts: stats?.criticalAlerts ?? 0,
    totalClusters: stats?.totalClusters ?? 0,
    resolvedClusters: stats?.resolvedClusters ?? 0,
  }

  const resolutionRate = displayStats.totalComplaints > 0
    ? Math.round((displayStats.resolvedComplaints / displayStats.totalComplaints) * 100)
    : 0

  // Show warning if admin has no institution
  if (!loading && !institutionId) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <div className={styles.badge}>ADMINISTRATIVE DASHBOARD // ERROR</div>
            <h1 className={styles.bannerTitle}>NO INSTITUTION ASSIGNED</h1>
            <p className={styles.bannerSub}>
              Your administrator account is not linked to an institution. Please complete onboarding.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* New complaint realtime alert */}
      {newComplaintAlert && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FF3000',
            color: '#fff',
            padding: '10px 20px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>⚡ NEW COMPLAINT RECEIVED — DASHBOARD UPDATED IN REAL-TIME</span>
          <button
            type="button"
            onClick={() => setNewComplaintAlert(false)}
            style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '2px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 800, fontFamily: 'inherit' }}
          >
            DISMISS
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>ADMINISTRATIVE INTELLIGENCE // SECURE</div>
          <h1 className={styles.bannerTitle}>CAMPUS PROBLEM INTELLIGENCE</h1>
          <p className={styles.bannerSub}>
            INSTITUTION: {userProfile.college?.toUpperCase() || '—'} · DEPT: {userProfile.adminDetails?.dept?.toUpperCase() || 'OPERATIONS'}
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => setCurrentScreen('admin-all-issues')}
          >
            VIEW ALL ISSUES →
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>TOTAL COMPLAINTS</span>
          <span className={styles.metricValue}>{loading ? '—' : displayStats.totalComplaints}</span>
          <span className={styles.metricNote}>ALL SUBMITTED THIS INSTITUTION</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>OPEN / AWAITING REVIEW</span>
          <span className={`${styles.metricValue} ${styles.metricAccent}`}>{loading ? '—' : displayStats.openComplaints}</span>
          <span className={styles.metricNote}>SUBMITTED + UNDER REVIEW</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>RESOLUTION RATE</span>
          <span className={styles.metricValue}>{loading ? '—' : `${resolutionRate}%`}</span>
          <span className={styles.metricNote}>{loading ? '' : `${displayStats.resolvedComplaints} OF ${displayStats.totalComplaints} RESOLVED`}</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>CRITICAL / HIGH PRIORITY</span>
          <span className={styles.metricValue}>{loading ? '—' : String(displayStats.criticalAlerts).padStart(2, '0')}</span>
          <span className={styles.metricNote}>HIGH/CRITICAL PRIORITY, OPEN</span>
        </div>
      </div>

      {/* Main Multi-Column Section */}
      <div className={styles.mainGrid}>
        {/* Left: Priority Problem Clusters */}
        <div className={styles.colMain}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>HIGH-PRIORITY ISSUE CLUSTERS</h2>
              <span className={styles.sectionSub}>COMPLAINTS GROUPED BY CATEGORY AND LOCATION</span>
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

            {/* Recent Individual Complaints */}
            {!loading && recentComplaints.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#808080', marginBottom: '12px', borderTop: '1px solid #000', paddingTop: '16px' }}>
                  RECENT COMPLAINTS — LAST {recentComplaints.length} SUBMITTED
                </div>
                {recentComplaints.map((c) => {
                  const statusStyle = STATUS_COLORS[c.status] || STATUS_COLORS['SUBMITTED']
                  return (
                    <div key={c.id} style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#000' }}>{c.title}</span>
                        <span style={{ fontSize: '10px', color: '#808080', letterSpacing: '0.05em' }}>{c.ticketNumber} · {c.category} · {c.submittedAt}</span>
                      </div>
                      <span style={{ display: 'inline-block', padding: '3px 8px', backgroundColor: statusStyle.bg, color: statusStyle.color, fontSize: '9px', fontWeight: 800, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                        {c.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Management Shortcuts & Status Overview */}
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

          {/* Real Stats Summary Card */}
          {!loading && stats && (
            <div className={styles.statusControlCard} style={{ marginTop: '16px' }}>
              <span className={styles.cardHeaderSmall}>STATUS BREAKDOWN — REAL DATA</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                {[
                  { label: 'SUBMITTED', count: displayStats.submittedComplaints, color: '#1B5E20' },
                  { label: 'UNDER REVIEW', count: displayStats.underReviewComplaints, color: '#5D4037' },
                  { label: 'ASSIGNED', count: displayStats.assignedComplaints, color: '#0D47A1' },
                  { label: 'IN PROGRESS', count: displayStats.inProgressComplaints, color: '#BF360C' },
                  { label: 'RESOLVED / CLOSED', count: displayStats.resolvedComplaints, color: '#00B85C' },
                  { label: 'CRITICAL ALERTS', count: displayStats.criticalAlerts, color: '#FF3000' },
                ].map(({ label, count, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>
                    <span>{label}</span>
                    <span style={{ color }}>{count}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #000', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em' }}>
                  <span>TOTAL CLUSTERS</span>
                  <span>{displayStats.totalClusters - displayStats.resolvedClusters} ACTIVE / {displayStats.totalClusters} TOTAL</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
