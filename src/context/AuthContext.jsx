import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // User Profile & Application Flow State
  const [userRole, setUserRole] = useState(null) // 'student' | 'admin' | null
  const [currentScreen, setCurrentScreen] = useState('welcome')
  const [userProfile, setUserProfile] = useState({
    college: '',
    studentDetails: { name: '', id: '', dept: '', year: '' },
    adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
    onboardingComplete: false,
  })

  // Student reports state
  const [studentReports, setStudentReports] = useState([
    {
      id: 'REP-4091',
      clusterId: 'CLU-104',
      title: 'Lab 3 Wi-Fi dropping connection during practical sessions',
      location: 'Science Block, Lab 3',
      category: 'IT & NETWORK',
      submittedAt: '2 days ago',
      status: 'IN PROGRESS',
      severity: 'HIGH',
    },
    {
      id: 'REP-3904',
      clusterId: 'CLU-088',
      title: 'Water filter leaking on 2nd floor corridor',
      location: 'Engineering Wing, 2nd Floor',
      category: 'FACILITIES',
      submittedAt: '5 days ago',
      status: 'RESOLVED',
      severity: 'MEDIUM',
    }
  ])

  // Active report for status tracking screen
  const [activeTrackingReport, setActiveTrackingReport] = useState(null)

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true

    // Check existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      if (error) {
        console.error('Error fetching session:', error)
      }
      if (session?.user) {
        setSession(session)
        setUser(session.user)
        loadUserProfile(session.user)
      } else {
        const params = new URLSearchParams(window.location.search)
        const demo = params.get('demo')
        if (demo) {
          const isAdm = demo === 'admin'
          const mockUser = {
            id: isAdm ? 'google-eval-admin-id' : 'google-eval-student-id',
            email: isAdm ? 'eleanor.vance@mit.edu' : 'alex.morgan@mit.edu',
            user_metadata: {
              full_name: isAdm ? 'Dr. Eleanor Vance' : 'Alex Morgan',
            },
          }
          const mockSession = { user: mockUser, access_token: 'eval-token' }
          setSession(mockSession)
          setUser(mockUser)
          loadUserProfile(mockUser)
        } else {
          setSession(null)
          setUser(null)
        }
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_IN' && newSession?.user) {
          setAuthError(null)
          setAuthModalOpen(false)
          loadUserProfile(newSession.user)
        } else if (event === 'SIGNED_OUT') {
          setUserRole(null)
          setCurrentScreen('welcome')
          setUserProfile({
            college: '',
            studentDetails: { name: '', id: '', dept: '', year: '' },
            adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
            onboardingComplete: false,
          })
        }
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Helper to load user profile from storage or Google metadata
  const loadUserProfile = (authUser) => {
    try {
      const saved = localStorage.getItem(`reclustify_profile_${authUser.id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserRole(parsed.role || null)
        setUserProfile(parsed)
        if (parsed.onboardingComplete) {
          setCurrentScreen(parsed.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
        } else {
          setCurrentScreen(parsed.role ? (parsed.role === 'admin' ? 'admin-details' : 'college-selection') : 'role-selection')
        }
        return
      }
    } catch (e) {
      console.warn('Error reading stored profile:', e)
    }

    // Default pre-fill from Google account metadata
    const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
    const googleEmail = authUser.email || ''

    setUserProfile((prev) => ({
      ...prev,
      studentDetails: { ...prev.studentDetails, name: googleName },
      adminDetails: { ...prev.adminDetails, name: googleName, email: googleEmail },
    }))

    setCurrentScreen('role-selection')
  }

  // Save profile helper
  const saveProfile = (updatedProfile, updatedRole) => {
    const roleToSave = updatedRole !== undefined ? updatedRole : userRole
    const dataToSave = { ...updatedProfile, role: roleToSave }
    setUserProfile(dataToSave)
    if (updatedRole !== undefined) {
      setUserRole(updatedRole)
    }
    if (user?.id) {
      try {
        localStorage.setItem(`reclustify_profile_${user.id}`, JSON.stringify(dataToSave))
      } catch (e) {
        console.warn('Could not persist profile:', e)
      }
    }
  }

  // Trigger Google OAuth
  const signInWithGoogle = async () => {
    try {
      setIsAuthenticating(true)
      setAuthError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Supabase Google OAuth Error:', err)
      if (err.message && err.message.toLowerCase().includes('cancel')) {
        setAuthError('Authentication was cancelled.')
      } else {
        setAuthError('Google sign-in failed. Please try again.')
      }
    } finally {
      setIsAuthenticating(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    } finally {
      setSession(null)
      setUser(null)
      setUserRole(null)
      setCurrentScreen('welcome')
      setAuthModalOpen(false)
    }
  }

  // Add a new student report
  const addStudentReport = (newReport) => {
    setStudentReports((prev) => [newReport, ...prev])
  }

  const value = {
    session,
    user,
    loading,
    isAuthenticating,
    authError,
    setAuthError,
    authModalOpen,
    setAuthModalOpen,
    userRole,
    setUserRole,
    currentScreen,
    setCurrentScreen,
    userProfile,
    saveProfile,
    signInWithGoogle,
    signOut,
    studentReports,
    addStudentReport,
    activeTrackingReport,
    setActiveTrackingReport,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
