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

    // Default clean state for this session
    setUserProfile((prev) => ({
      ...prev,
      studentDetails: { ...prev.studentDetails, name: googleName },
      adminDetails: { ...prev.adminDetails, name: googleName, email: googleEmail },
    }))

    // Query persistent Supabase PostgreSQL database as the single source of truth
    try {
      const remoteData = await fetchExistingOnboarding(authUser.id)
      const profile = remoteData?.profile

      if (profile && profile.onboarding_complete && profile.institution_id && profile.role) {
        const { studentProfile, adminRequest } = remoteData
        const role = profile.role

        const mergedProfile = {
          college: profile.institution?.name || '',
          collegeCode: profile.institution?.code || '',
          collegeId: profile.institution_id,
          role,
          onboardingComplete: true,
          studentDetails: {
            name: studentProfile?.enrollment_number ? (profile.full_name || googleName) : googleName,
            id: studentProfile?.enrollment_number || '',
            dept: studentProfile?.branch || '',
            year: studentProfile?.graduation_year || '',
          },
          adminDetails: {
            name: adminRequest?.full_name || profile.full_name || googleName,
            email: adminRequest?.email || profile.email || googleEmail,
            staffId: adminRequest?.staff_id || '',
            dept: adminRequest?.department || '',
            designation: adminRequest?.designation || '',
            office: adminRequest?.office_location || '',
            phone: adminRequest?.contact_number || '',
            scope: adminRequest?.jurisdiction_scope || '',
            proofName: adminRequest?.proof_document || '',
            code: adminRequest?.institution_code || '',
            reason: adminRequest?.reason || '',
            domain: adminRequest?.domain || '',
            status: adminRequest?.status || 'verified',
          },
        }

        setUserRole(role)
        setUserProfile(mergedProfile)
        try {
          localStorage.setItem(`reclustify_profile_${authUser.id}`, JSON.stringify(mergedProfile))
        } catch (err) {
          console.warn('Could not cache merged profile:', err)
        }

        // Navigate to appropriate dashboard
        setCurrentScreen(role === 'admin' ? 'admin-dashboard' : 'student-dashboard')

        // Load student reports if student
        if (role === 'student' && !authUser.id.startsWith('google-eval-')) {
          fetchStudentComplaints(authUser.id).then(setStudentReports).catch(() => {})
        }
      } else if (remoteData?.adminRequest && remoteData.adminRequest.status === 'pending') {
        // Administrator pending verification code entry
        const { adminRequest } = remoteData
        setUserRole('admin')
        setUserProfile((prev) => ({
          ...prev,
          role: 'admin',
          collegeId: adminRequest.institution_id || prev.collegeId || '',
          adminDetails: {
            ...prev.adminDetails,
            ...adminRequest,
            code: adminRequest.institution_code || '',
          },
        }))
        setCurrentScreen('admin-enter-code')
      } else {
        // BRAND NEW OR DELETED USER:
        // No valid Reclustify profile, or profile lacks institution assignment.
        // Strictly initiate fresh onboarding. Do NOT send to dashboard.
        try {
          localStorage.removeItem(`reclustify_profile_${authUser.id}`)
        } catch (e) {
          console.warn('Cache clear notice:', e)
        }
        setUserRole(null)
        setCurrentScreen('role-selection')

        // Ensure a base profile row exists for this auth user
        await upsertUserProfile(authUser.id, {
          full_name: googleName,
          email: googleEmail,
        })
      }
    } catch (err) {
      console.warn('Could not sync profile with Supabase backend, falling back to role selection:', err)
      setCurrentScreen('role-selection')
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
      college: additionalAdminDetails.college || userProfile.college || '',
      collegeCode: additionalAdminDetails.collegeCode || userProfile.collegeCode || '',
      collegeId: additionalAdminDetails.institutionId || userProfile.collegeId || '',
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
        collegeName: updated.college,
        collegeCode: updated.collegeCode,
        institutionId: updated.collegeId,
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
        collegeId: res.institutionId || userProfile.collegeId || '',
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
    const res = await submitComplaint(uid, instId, complaintData)
    if (!res || !res.success) {
      return res || { success: false, error: 'Database rejected complaint insertion.' }
    }

    const saved = res.data
    // Optimistically prepend while we refresh from DB
    const optimistic = {
      id: saved.ticket_number || complaintData.id,
      dbId: saved.id,
      clusterId: saved.cluster_id || null,
      clusterTitle: saved.title || complaintData.title,
      title: complaintData.title,
      location: complaintData.location,
      category: complaintData.category,
      severity: complaintData.severity,
      status: 'SUBMITTED',
      submittedAt: 'Just now',
      createdAt: new Date().toISOString(),
    }
    setStudentReports((prev) => [optimistic, ...prev])

    // If an image was selected, upload it and save the attachment record
    let imageUploadWarning = null
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
        } else {
          imageUploadWarning = 'Complaint saved, but evidence image could not be uploaded.'
        }
      } catch (imgErr) {
        console.warn('Image upload failed (complaint still saved):', imgErr)
        imageUploadWarning = 'Complaint saved, but evidence image upload encountered an error.'
      }
    }

    // Refresh from DB in background
    if (uid && !uid.startsWith('google-eval-')) {
      loadStudentComplaints(uid)
    }

    return {
      success: true,
      data: saved,
      warning: imageUploadWarning,
    }
  }

  // Refresh student reports on demand (e.g. when MyReports mounts)
  const refreshStudentReports = () => loadStudentComplaints(user?.id)

  // Permanently delete the account using a secure, defense-in-depth architecture:
  // 1. Storage cleanup: removes user-uploaded evidence in complaint-evidence/{uid}
  // 2. Primary: Postgres SECURITY DEFINER RPC `delete_own_account()`
  // 3. Fallback: Direct client-side cleanup of user rows in public tables (profiles, student_profiles, etc.)
  // 4. Cache purge: Removes all localStorage and sessionStorage keys
  // 5. Sign out: Destroys active session and redirects to welcome screen
  const deleteAccount = async () => {
    const uid = user?.id
    if (!uid) return { success: false, error: 'No active session' }

    try {
      // Step 1: Clean up storage files owned by the user
      try {
        const { data: storageFiles } = await supabase.storage
          .from('complaint-evidence')
          .list(uid, { limit: 1000 })

        if (storageFiles && storageFiles.length > 0) {
          const filePaths = []
          for (const item of storageFiles) {
            if (item.id === null) {
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
        console.warn('Storage cleanup notice (non-blocking):', storageErr)
      }

      // Step 2: Server-side account & user deletion via RPC delete_own_account
      let serverDeleted = false
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc('delete_own_account')
        if (!rpcError) {
          const parsed = typeof rpcResult === 'string' ? JSON.parse(rpcResult) : rpcResult
          if (!parsed || parsed.success !== false) {
            serverDeleted = true
          }
        }
      } catch (rpcErr) {
        console.warn('RPC delete_own_account notice:', rpcErr)
      }

      // Step 3: Client-side table wipe for user-owned records (RLS DELETE policies)
      try {
        await supabase.from('complaint_timeline').delete().eq('actor_id', uid)
        await supabase.from('complaint_attachments').delete().eq('uploaded_by', uid)
        await supabase.from('complaints').delete().eq('user_id', uid)
        await supabase.from('student_profiles').delete().eq('user_id', uid)
        await supabase.from('admin_requests').delete().eq('user_id', uid)
        await supabase.from('profiles').delete().eq('id', uid)
      } catch (dbErr) {
        console.warn('Direct database record cleanup notice:', dbErr)
      }

      // Step 4: Clear all local and session storage completely
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        console.warn('Storage clear notice:', e)
      }

      // Step 5: Reset React in-memory state
      setUserRole(null)
      setStudentReports([])
      setUserProfile({
        college: '',
        collegeCode: '',
        collegeId: '',
        studentDetails: { name: '', id: '', dept: '', year: '' },
        adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
        onboardingComplete: false,
      })

      // Step 6: Sign out from Supabase Auth
      try {
        await supabase.auth.signOut({ scope: 'global' })
      } catch (signOutErr) {
        console.warn('Sign out notice:', signOutErr)
      }

      // Step 7: Redirect to welcome screen
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
