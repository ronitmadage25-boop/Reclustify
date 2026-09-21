import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchAdminAllComplaints, subscribeToInstitutionComplaints } from '../services/db'
import styles from './AdminScreens.module.css'

const STATUS_COLORS = {
  'SUBMITTED':    { bg: '#E8F5E9', color: '#1B5E20', label: 'SUBMITTED' },
  'UNDER REVIEW': { bg: '#FFF9C4', color: '#5D4037', label: 'UNDER REVIEW' },
  'ASSIGNED':     { bg: '#E3F2FD', color: '#0D47A1', label: 'ASSIGNED' },
  'IN PROGRESS':  { bg: '#FFF3E0', color: '#BF360C', label: 'IN PROGRESS' },
  'RESOLVED':     { bg: '#F1F8E9', color: '#33691E', label: 'RESOLVED' },
  'CLOSED':       { bg: '#F5F5F5', color: '#616161', label: 'CLOSED' },
}

const PRIORITY_COLORS = {
  'CRITICAL': '#FF3000',
  'HIGH':     '#FF6B00',
  'MEDIUM':   '#000000',
  'LOW':      '#808080',
}

export default function AdminAllIssuesScreen({ onSelectCluster }) {
  const { setCurrentScreen, userProfile } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  const institutionId = userProfile?.collegeId
  const channelRef = useRef(null)

  useEffect(() => {
    if (!institutionId) {
      setLoading(false)
      return
    }
    fetchAdminAllComplaints(institutionId)
      .then(setComplaints)
      .finally(() => setLoading(false))

    // Realtime subscription: refresh list when new complaints arrive or are updated
    const channel = subscribeToInstitutionComplaints(
      institutionId,
      // onInsert
      () => {
        fetchAdminAllComplaints(institutionId).then(setComplaints)
      },
      // onUpdate
      () => {
        fetchAdminAllComplaints(institutionId).then(setComplaints)
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

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority
  })

  const handleInspectComplaint = (complaint) => {
    if (complaint.clusterDbId && onSelectCluster) {
      // Navigate to cluster details view
      onSelectCluster(complaint.clusterId, complaint.clusterDbId)
    }
    // Always navigate to issue details (even for complaints without a cluster)
    setCurrentScreen('admin-issue-details')
  }

  const categories = [...new Set(complaints.map((c) => c.category).filter(Boolean))]

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>INSTITUTION COMPLAINTS // FULL REGISTRY</div>
          <h1 className={styles.bannerTitle}>ALL CAMPUS ISSUES</h1>
          <p className={styles.bannerSub}>
            ALL COMPLAINTS SUBMITTED FOR {userProfile.college?.toUpperCase() || 'THIS INSTITUTION'}.
            INSTITUTION-ISOLATED. REAL DATA.
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setCurrentScreen('admin-dashboard')}
          >
            ← DASHBOARD
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.registryFilterBar}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="SEARCH TITLE, TICKET, LOCATION, DESCRIPTION..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search complaints"
        />
        <div className={styles.filterDropdowns}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">ALL STATUS</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="UNDER REVIEW">UNDER REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="ALL">ALL CATEGORIES</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            aria-label="Filter by priority"
          >
            <option value="ALL">ALL PRIORITY</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', color: '#808080', marginBottom: '16px' }}>
        {loading ? 'LOADING...' : `${filtered.length} OF ${complaints.length} COMPLAINTS`}
      </div>

      {/* Complaints list */}
      {loading && (
        <div style={{ padding: '64px', textAlign: 'center', color: '#999', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>
          LOADING INSTITUTION COMPLAINTS...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ padding: '64px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#FF3000', border: '1px solid #000', display: 'inline-block', padding: '6px 14px', marginBottom: '12px' }}>
            {complaints.length === 0 ? 'NO COMPLAINTS SUBMITTED YET' : 'NO MATCHING COMPLAINTS'}
          </div>
          {complaints.length === 0 && (
            <p style={{ fontSize: '12px', color: '#808080', marginTop: '8px' }}>
              When students from {userProfile.college || 'your institution'} submit complaints,<br />
              they will appear here in real-time.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: filtered.length > 0 ? '2px solid #000' : 'none', backgroundColor: '#000' }}>
        {filtered.map((complaint, idx) => {
          const statusStyle = STATUS_COLORS[complaint.status] || STATUS_COLORS['SUBMITTED']
          const priorityColor = PRIORITY_COLORS[complaint.priority] || '#000'

          return (
            <div
              key={complaint.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderBottom: idx < filtered.length - 1 ? '1px solid #000' : 'none',
                padding: '0',
              }}
            >
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.12em', color: '#FF3000' }}>
                    {complaint.ticketNumber || '—'}
                  </span>
                  <span style={{
                    display: 'inline-block', padding: '3px 8px',
                    backgroundColor: statusStyle.bg, color: statusStyle.color,
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                  }}>
                    {statusStyle.label}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em', color: priorityColor }}>
                    ● {complaint.priority}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: '#666' }}>
                    {complaint.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '9px', color: '#999', fontWeight: 600, letterSpacing: '0.08em' }}>
                    {complaint.submittedAt}
                  </span>
                  {complaint.clusterDbId && (
                    <button
                      type="button"
                      onClick={() => handleInspectComplaint(complaint)}
                      style={{
                        fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em',
                        backgroundColor: '#000', color: '#fff',
                        border: 'none', padding: '5px 12px', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      INSPECT →
                    </button>
                  )}
                  {!complaint.clusterDbId && (
                    <button
                      type="button"
                      onClick={() => handleInspectComplaint(complaint)}
                      style={{
                        fontSize: '9px', fontWeight: 800, letterSpacing: '0.12em',
                        backgroundColor: '#808080', color: '#fff',
                        border: 'none', padding: '5px 12px', cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      VIEW →
                    </button>
                  )}
                </div>
              </div>

              {/* Content row */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '-0.01em', marginBottom: '4px', color: '#000' }}>
                  {complaint.title}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px', letterSpacing: '0.05em' }}>
                  📍 {complaint.location || 'Location not specified'} · {complaint.department || '—'}
                </div>
                {complaint.description && (
                  <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{complaint.description.length > 120 ? complaint.description.slice(0, 120) + '...' : complaint.description}"
                  </div>
                )}
                {complaint.resolution_notes && (
                  <div style={{ marginTop: '8px', fontSize: '10px', fontWeight: 700, color: '#1B5E20', letterSpacing: '0.05em' }}>
                    ✓ RESOLUTION: {complaint.resolution_notes}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
