import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import {
  fetchExistingOnboarding,
  upsertUserProfile,
  saveStudentOnboardingData,
  saveAdminRequestData,
  verifyAdminSecurityCode,
  submitComplaint,
  fetchStudentComplaints,
  uploadComplaintImage,
  saveComplaintAttachment,
} from '../services/db'

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

  // Student reports state — populated from Supabase
  const [studentReports, setStudentReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(false)

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

  // Helper to load user profile from storage, Google metadata, and Supabase PostgreSQL
  async function loadUserProfile(authUser) {
    if (!authUser) return

    const googleName = authUser.user_metadata?.full_name || authUser.user_metadata?.name || ''
    const googleEmail = authUser.email || ''

    // 1. Optimistic load from local storage
    let loadedFromLocal = false
    try {
      const saved = localStorage.getItem(`reclustify_profile_${authUser.id}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserRole(parsed.role || null)
        setUserProfile(parsed)
        loadedFromLocal = true
        if (parsed.onboardingComplete) {
          setCurrentScreen(parsed.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
        } else {
          setCurrentScreen(parsed.role ? (parsed.role === 'admin' ? (parsed.adminDetails?.code ? 'admin-enter-code' : 'admin-details') : 'college-selection') : 'role-selection')
        }
      }
    } catch (e) {
      console.warn('Error reading stored profile:', e)
    }

    if (!loadedFromLocal) {
      setUserProfile((prev) => ({
        ...prev,
        studentDetails: { ...prev.studentDetails, name: googleName },
        adminDetails: { ...prev.adminDetails, name: googleName, email: googleEmail },
      }))
      setCurrentScreen('role-selection')
    }


    // 2. Query persistent Supabase PostgreSQL database
    try {
      const remoteData = await fetchExistingOnboarding(authUser.id)
      if (remoteData?.profile) {
        const { profile, studentProfile, adminRequest } = remoteData
        const role = profile.role || null
        const isComplete = profile.onboarding_complete || false

        const mergedProfile = {
          college: profile.institution?.name || userProfile.college || '',
          collegeCode: profile.institution?.code || userProfile.collegeCode || '',
          collegeId: profile.institution_id || userProfile.collegeId || '',
          role,
          onboardingComplete: isComplete,
          studentDetails: {
            name: studentProfile?.enrollment_number ? (profile.full_name || googleName) : (userProfile.studentDetails?.name || googleName),
            id: studentProfile?.enrollment_number || userProfile.studentDetails?.id || '',
            dept: studentProfile?.branch || userProfile.studentDetails?.dept || '',
            year: studentProfile?.graduation_year || userProfile.studentDetails?.year || '',
          },
          adminDetails: {
            name: adminRequest?.full_name || profile.full_name || userProfile.adminDetails?.name || googleName,
            email: adminRequest?.email || profile.email || googleEmail,
            staffId: adminRequest?.staff_id || userProfile.adminDetails?.staffId || '',
            dept: adminRequest?.department || userProfile.adminDetails?.dept || '',
            designation: adminRequest?.designation || userProfile.adminDetails?.designation || '',
            office: adminRequest?.office_location || userProfile.adminDetails?.office || '',
            phone: adminRequest?.contact_number || userProfile.adminDetails?.phone || '',
            scope: adminRequest?.jurisdiction_scope || userProfile.adminDetails?.scope || '',
            proofName: adminRequest?.proof_document || userProfile.adminDetails?.proofName || '',
            code: adminRequest?.institution_code || userProfile.adminDetails?.code || '',
            reason: adminRequest?.reason || userProfile.adminDetails?.reason || '',
            domain: adminRequest?.domain || userProfile.adminDetails?.domain || '',
            status: adminRequest?.status || 'pending',
          },
        }

        setUserRole(role)
        setUserProfile(mergedProfile)
        try {
          localStorage.setItem(`reclustify_profile_${authUser.id}`, JSON.stringify(mergedProfile))
        } catch (err) {
          console.warn('Could not cache merged profile:', err)
        }

        if (isComplete) {
          setCurrentScreen(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')
          // Load student complaints after profile confirms student role
          if (role === 'student' && !authUser.id.startsWith('google-eval-')) {
            fetchStudentComplaints(authUser.id).then(setStudentReports).catch(() => {})
          }
        } else if (adminRequest && adminRequest.status === 'pending') {
          setCurrentScreen('admin-enter-code')
        } else if (role === 'student' && studentProfile) {
          setCurrentScreen('student-dashboard')
        } else if (role) {
          setCurrentScreen(role === 'admin' ? 'admin-details' : 'college-selection')
        }
      } else {
        // Upsert basic user record in profiles table
        await upsertUserProfile(authUser.id, {
          full_name: googleName,
          email: googleEmail,
        })
      }
    } catch (err) {
      console.warn('Could not sync profile with Supabase backend:', err)
    }
  }

  // Save profile helper
  const saveProfile = (updatedProfile, updatedRole) => {
    const roleToSave = updatedRole !== undefined ? updatedRole : userRole
    const dataToSave = { ...updatedProfile, role: roleToSave }
    setUserProfile(dataToSave)
    if (updatedRole !== undefined) {
      setUserRole(updatedRole)
    }
    const currentUserId = user?.id
    if (currentUserId) {
      try {
        localStorage.setItem(`reclustify_profile_${currentUserId}`, JSON.stringify(dataToSave))
      } catch (e) {
        console.warn('Could not persist profile:', e)
      }
      // Async sync to Supabase
      upsertUserProfile(currentUserId, {
        role: roleToSave,
        onboarding_complete: dataToSave.onboardingComplete || false,
        full_name: dataToSave.studentDetails?.name || dataToSave.adminDetails?.name || undefined,
      }).catch((e) => console.warn('Could not sync profile update to DB:', e))
    }
  }

  // Dedicated Student Onboarding Persistence
  const saveStudentOnboarding = async (studentDetails) => {
    const currentUserId = user?.id
    const updated = {
      ...userProfile,
      role: 'student',
      studentDetails,
      onboardingComplete: true,
    }
    setUserProfile(updated)
    setUserRole('student')

    if (currentUserId) {
      try {
        localStorage.setItem(`reclustify_profile_${currentUserId}`, JSON.stringify(updated))
      } catch (e) {
        console.warn('Could not persist to local storage:', e)
      }

      await saveStudentOnboardingData(currentUserId, {
        institutionId: userProfile.collegeId,
        studentDetails,
        collegeName: userProfile.college,
        collegeCode: userProfile.collegeCode,
      })
    }

    setCurrentScreen('student-dashboard')
  }

  // Dedicated Admin Onboarding Request Persistence
  const saveAdminOnboarding = async (additionalAdminDetails = {}) => {
    const currentUserId = user?.id
    const mergedAdminDetails = {
      ...userProfile.adminDetails,
      ...additionalAdminDetails,
    }

    const updated = {
      ...userProfile,
      role: 'admin',
      adminDetails: mergedAdminDetails,
    }
    setUserProfile(updated)
    setUserRole('admin')

    if (currentUserId) {
      try {
        localStorage.setItem(`reclustify_profile_${currentUserId}`, JSON.stringify(updated))
      } catch (e) {
        console.warn('Could not persist to local storage:', e)
      }

      await saveAdminRequestData(currentUserId, {
        adminDetails: mergedAdminDetails,
        collegeName: userProfile.college,
        collegeCode: userProfile.collegeCode,
        institutionId: userProfile.collegeId,
      })
    }

    setCurrentScreen('admin-request-submitted')
  }

  // Dedicated Admin Verification Code Confirmation
  const verifyAdminCode = async (enteredCode) => {
    const currentUserId = user?.id
    const res = await verifyAdminSecurityCode(currentUserId, enteredCode)

    if (res.verified) {
      const updated = {
        ...userProfile,
        adminDetails: {
          ...userProfile.adminDetails,
          code: enteredCode,
          status: 'verified',
        },
        onboardingComplete: true,
      }
      setUserProfile(updated)
      if (currentUserId) {
        try {
          localStorage.setItem(`reclustify_profile_${currentUserId}`, JSON.stringify(updated))
        } catch (e) {
          console.warn('Could not persist to local storage:', e)
        }
      }
      setCurrentScreen('admin-dashboard')
      return { success: true }
    }

    return { success: false, error: res.error || 'Verification code does not match.' }
  }

  // Helper to determine OAuth redirect URL
  const getRedirectUrl = () => {
    const siteUrl = import.meta.env.VITE_SITE_URL
    if (siteUrl) {
      return siteUrl.replace(/\/+$/, '')
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin
    }
    return 'https://reclustify.vercel.app'
  }

  // Trigger Google OAuth
  const signInWithGoogle = async () => {
    try {
      setIsAuthenticating(true)
      setAuthError(null)

      const redirectTo = getRedirectUrl()

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
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

  // Load student complaints from Supabase
  const loadStudentComplaints = useCallback(async (uid) => {
    const id = uid || user?.id
    if (!id || id.startsWith('google-eval-')) return
    setReportsLoading(true)
    try {
      const data = await fetchStudentComplaints(id)
      setStudentReports(data)
    } finally {
      setReportsLoading(false)
    }
  }, [user?.id])

  // Submit a complaint to Supabase and optionally upload an evidence image
  const submitComplaintToDb = async (complaintData, imageFile = null) => {
    const uid = user?.id
    const instId = userProfile?.collegeId
    const saved = await submitComplaint(uid, instId, complaintData)
    if (saved) {
      // Optimistically prepend while we refresh from DB
      const optimistic = {
        id: saved.ticket_number || complaintData.id,
        dbId: saved.id,
        clusterId: saved.clusterKey || 'C-NEW',
        clusterTitle: saved.clusterTitle || complaintData.title,
        title: complaintData.title,
        location: complaintData.location,
        category: complaintData.category,
        severity: complaintData.severity,
        status: 'IN PROGRESS',
        submittedAt: 'Just now',
        createdAt: new Date().toISOString(),
      }
      setStudentReports((prev) => [optimistic, ...prev])

      // If an image was selected, upload it and save the attachment record
      if (imageFile && saved.id && uid && !uid.startsWith('google-eval-')) {
        try {
          const uploaded = await uploadComplaintImage(uid, saved.id, imageFile)
          if (uploaded) {
            await saveComplaintAttachment(
              saved.id,
              uid,
              uploaded.storagePath,
              imageFile.name,
              imageFile.type,
              imageFile.size
            )
          }
        } catch (imgErr) {
          console.warn('Image upload failed (complaint still saved):', imgErr)
        }
      }

      // Refresh from DB in background
      if (uid && !uid.startsWith('google-eval-')) {
        loadStudentComplaints(uid)
      }
    }
    return saved
  }

  // Refresh student reports on demand (e.g. when MyReports mounts)
  const refreshStudentReports = () => loadStudentComplaints(user?.id)

  // Permanently delete the account via a Postgres SECURITY DEFINER RPC.
  // The delete_own_account() function runs server-side with postgres privileges,
  // verifies auth.uid() === the account being deleted,
  // and DELETEs from auth.users (cascading to all profile/complaint data).
  // The service-role key is NEVER used in the browser.
  const deleteAccount = async () => {
    const uid = user?.id
    if (!uid) return { success: false, error: 'No active session' }

    try {
      // First, clean up storage files the user owns (using their own session)
      // This runs with the user's permissions — only their own files per RLS
      try {
        const { data: storageFiles } = await supabase.storage
          .from('complaint-evidence')
          .list(uid, { limit: 1000 })

        if (storageFiles && storageFiles.length > 0) {
          // Handle both flat files and sub-folders
          const filePaths = []
          for (const item of storageFiles) {
            if (item.id === null) {
              // It's a folder — list contents
              const { data: subFiles } = await supabase.storage
                .from('complaint-evidence')
                .list(`${uid}/${item.name}`, { limit: 1000 })
              if (subFiles) {
                subFiles.forEach((sf) => filePaths.push(`${uid}/${item.name}/${sf.name}`))
              }
            } else {
              filePaths.push(`${uid}/${item.name}`)
            }
          }
          if (filePaths.length > 0) {
            await supabase.storage.from('complaint-evidence').remove(filePaths)
          }
        }
      } catch (storageErr) {
        // Storage cleanup failure should not block account deletion
        console.warn('Storage cleanup warning (non-fatal):', storageErr)
      }

      // Call the Postgres SECURITY DEFINER function.
      // This runs as the postgres superuser server-side,
      // verifies auth.uid() = calling user, deletes from auth.users.
      // Cascade: auth.users → profiles → student_profiles/admin_requests/complaints
      const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_own_account')

      if (rpcError) {
        console.error('delete_own_account RPC error:', rpcError)
        return { success: false, error: rpcError.message || 'Account deletion failed' }
      }

      // rpcResult is JSON: { success: true } or { success: false, error: '...' }
      const parsed = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult
      if (parsed && parsed.success === false) {
        return { success: false, error: parsed.error || 'Deletion failed on server' }
      }

      // Clear all local state and localStorage
      try {
        localStorage.removeItem(`reclustify_profile_${uid}`)
      } catch (e) {
        // ignore
      }

      // Reset React state first
      setUserRole(null)
      setStudentReports([])
      setUserProfile({
        college: '',
        studentDetails: { name: '', id: '', dept: '', year: '' },
        adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
        onboardingComplete: false,
      })

      // Sign out — this clears the JWT locally (server-side session already gone)
      await supabase.auth.signOut()

      // Navigate to welcome
      setSession(null)
      setUser(null)
      setCurrentScreen('welcome')

      return { success: true }
    } catch (err) {
      console.error('deleteAccount error:', err)
      return { success: false, error: err.message || 'Unexpected error during deletion' }
    }
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
    saveStudentOnboarding,
    saveAdminOnboarding,
    verifyAdminCode,
    signInWithGoogle,
    signOut,
    studentReports,
    reportsLoading,
    submitComplaintToDb,
    refreshStudentReports,
    deleteAccount,
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
