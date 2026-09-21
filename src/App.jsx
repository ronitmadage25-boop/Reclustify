import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import MethodSection from './components/MethodSection'
import ReclusterSection from './components/ReclusterSection'
import IntelligenceSection from './components/IntelligenceSection'
import PrioritySection from './components/PrioritySection'
import ResolutionSection from './components/ResolutionSection'
import StatementSection from './components/StatementSection'
import AudienceSection from './components/AudienceSection'
import FinalCTA from './components/FinalCTA'
import AuthModal from './components/AuthModal'
import AppHeader from './components/AppHeader'

// Onboarding screens
import RoleSelectionScreen from './screens/RoleSelectionScreen'
import CollegeSelectionScreen from './screens/CollegeSelectionScreen'
import StudentDetailsScreen from './screens/StudentDetailsScreen'
import AdminDetailsScreen from './screens/AdminDetailsScreen'
import AdminProfessionalDetailsScreen from './screens/AdminProfessionalDetailsScreen'
import AdminProofUploadScreen from './screens/AdminProofUploadScreen'
import AdminRequestCodeScreen from './screens/AdminRequestCodeScreen'
import AdminRequestSubmittedScreen from './screens/AdminRequestSubmittedScreen'
import AdminEnterCodeScreen from './screens/AdminEnterCodeScreen'

// Student screens
import StudentDashboardScreen from './screens/StudentDashboardScreen'
import ReportProblemScreen from './screens/ReportProblemScreen'
import AIAnalysisPreviewScreen from './screens/AIAnalysisPreviewScreen'
import SubmissionSuccessScreen from './screens/SubmissionSuccessScreen'
import MyReportsScreen from './screens/MyReportsScreen'
import ReportTrackingScreen from './screens/ReportTrackingScreen'
import StudentSettingsScreen from './screens/StudentSettingsScreen'

// Admin screens
import AdminDashboardScreen from './screens/AdminDashboardScreen'
import AdminAllIssuesScreen from './screens/AdminAllIssuesScreen'
import AdminIssueDetailsScreen from './screens/AdminIssueDetailsScreen'
import AdminAnalyticsScreen from './screens/AdminAnalyticsScreen'
import AdminDepartmentsScreen from './screens/AdminDepartmentsScreen'
import AdminSettingsScreen from './screens/AdminSettingsScreen'

import './App.css'

export default function App() {
  const { session, loading, currentScreen, setCurrentScreen, userRole } = useAuth()
  const [draftReport, setDraftReport] = useState(null)
  const [submittedReport, setSubmittedReport] = useState(null)
  const [selectedClusterId, setSelectedClusterId] = useState('C-104')
  const [selectedClusterDbId, setSelectedClusterDbId] = useState(null)
  const [selectedComplaintId, setSelectedComplaintId] = useState(null)

  // Unauthenticated route protection
  useEffect(() => {
    if (!loading && !session && currentScreen !== 'welcome') {
      setCurrentScreen('welcome')
    }
  }, [loading, session, currentScreen, setCurrentScreen])

  // Loading state during initial Supabase session retrieval
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          color: '#000000',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#FF3000',
            marginBottom: '16px',
            border: '1px solid #000000',
            padding: '6px 14px',
            textTransform: 'uppercase',
            display: 'inline-block',
          }}
        >
          RECLUSTIFY // SYSTEM
        </div>
        <div style={{ fontSize: '18px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
          INITIALIZING SESSION...
        </div>
      </div>
    )
  }

  // Render Public Landing Page
  if (currentScreen === 'welcome' || !session) {
    return (
      <>
        <Nav />
        <main id="main-content">
          <Hero />
          <ProblemSection />
          <MethodSection />
          <ReclusterSection />
          <IntelligenceSection />
          <PrioritySection />
          <ResolutionSection />
          <StatementSection />
          <AudienceSection />
          <FinalCTA />
        </main>
        <AuthModal />
      </>
    )
  }

  // Render Authenticated Flow & Application Screens
  const renderScreen = () => {
    switch (currentScreen) {
      // Role & Onboarding
      case 'role-selection':
        return <RoleSelectionScreen />
      case 'college-selection':
        return <CollegeSelectionScreen />
      case 'student-details':
        return <StudentDetailsScreen />

      case 'student-settings':
        return <StudentSettingsScreen />

      // Admin Onboarding
      case 'admin-details':
        return <AdminDetailsScreen />
      case 'admin-professional':
        return <AdminProfessionalDetailsScreen />
      case 'admin-proof':
        return <AdminProofUploadScreen />
      case 'admin-request-code':
        return <AdminRequestCodeScreen />
      case 'admin-request-submitted':
        return <AdminRequestSubmittedScreen />
      case 'admin-enter-code':
        return <AdminEnterCodeScreen />

      // Student Flow
      case 'student-dashboard':
        return <StudentDashboardScreen />
      case 'report-problem':
        return (
          <ReportProblemScreen
            onAnalyze={(draft) => {
              setDraftReport(draft)
              setCurrentScreen('ai-analysis-preview')
            }}
          />
        )
      case 'ai-analysis-preview':
        return (
          <AIAnalysisPreviewScreen
            draftReport={draftReport}
            onConfirm={(finalRep) => {
              setSubmittedReport(finalRep)
              setCurrentScreen('submission-success')
            }}
          />
        )
      case 'submission-success':
        return <SubmissionSuccessScreen submittedReport={submittedReport} />
      case 'my-reports':
        return <MyReportsScreen />
      case 'report-tracking':
        return <ReportTrackingScreen />

      // Admin Flow
      case 'admin-dashboard':
        return (
          <AdminDashboardScreen
            onSelectCluster={(cKey, cDbId) => {
              setSelectedClusterId(cKey)
              setSelectedClusterDbId(cDbId || null)
              setSelectedComplaintId(null)
              setCurrentScreen('admin-issue-details')
            }}
            onSelectComplaint={(cId) => {
              setSelectedComplaintId(cId)
              setSelectedClusterId(null)
              setSelectedClusterDbId(null)
              setCurrentScreen('admin-issue-details')
            }}
          />
        )
      case 'admin-all-issues':
        return (
          <AdminAllIssuesScreen
            onSelectCluster={(cKey, cDbId) => {
              setSelectedClusterId(cKey)
              setSelectedClusterDbId(cDbId || null)
              setSelectedComplaintId(null)
              setCurrentScreen('admin-issue-details')
            }}
            onSelectComplaint={(cId) => {
              setSelectedComplaintId(cId)
              setSelectedClusterId(null)
              setSelectedClusterDbId(null)
              setCurrentScreen('admin-issue-details')
            }}
          />
        )
      case 'admin-issue-details':
        return (
          <AdminIssueDetailsScreen
            clusterId={selectedClusterId}
            clusterDbId={selectedClusterDbId}
            complaintId={selectedComplaintId}
          />
        )
      case 'admin-analytics':
        return <AdminAnalyticsScreen />
      case 'admin-departments':
        return <AdminDepartmentsScreen />
      case 'admin-settings':
        return <AdminSettingsScreen />

      default:
        return userRole === 'admin' ? (
          <AdminDashboardScreen
            onSelectCluster={(cKey, cDbId) => {
              setSelectedClusterId(cKey)
              setSelectedClusterDbId(cDbId || null)
              setSelectedComplaintId(null)
              setCurrentScreen('admin-issue-details')
            }}
            onSelectComplaint={(cId) => {
              setSelectedComplaintId(cId)
              setSelectedClusterId(null)
              setSelectedClusterDbId(null)
              setCurrentScreen('admin-issue-details')
            }}
          />
        ) : (
          <StudentDashboardScreen />
        )
    }
  }

  return (
    <>
      <AppHeader />
      <main id="app-content" style={{ minHeight: 'calc(100vh - 65px)', backgroundColor: '#FFFFFF' }}>
        {renderScreen()}
      </main>
      <AuthModal />
    </>
  )
}
