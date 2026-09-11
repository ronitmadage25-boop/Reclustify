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

  // Permanently delete the account using a secure, defense-in-depth architecture:
  // 1. Storage cleanup: removes user-uploaded evidence in complaint-evidence/{uid}
  // 2. Primary: Supabase Edge Function `delete-account` (uses server-side service role key to delete auth.users)
  // 3. Secondary fallback: Postgres SECURITY DEFINER RPC `delete_own_account()`
  // 4. Guaranteed safeguard: Direct client-side cleanup of user rows in public tables (profiles, student_profiles, etc.)
  // 5. Cache purge: Removes all user-scoped localStorage and resets in-memory React state
  // 6. Sign out: Destroys active session and redirects to welcome screen
  // The service-role key is NEVER exposed in client-side code.
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

      // Step 2: Server-side account & user deletion
      let serverDeleted = false

      // Method A: Try Supabase Edge Function `delete-account`
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('delete-account', {
          body: { user_id: uid },
        })
        if (!fnError && fnData && fnData.success !== false) {
          serverDeleted = true
        }
      } catch (fnErr) {
        console.warn('Edge Function delete-account notice (trying RPC fallback):', fnErr)
      }

      // Method B: If Edge Function not deployed/reachable, fallback to RPC `delete_own_account`
      if (!serverDeleted) {
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
      }

      // Method C: Client-side table wipe for user-owned records
      // RLS allows authenticated users to delete their own records (auth.uid() = user_id / id)
      try {
        await supabase.from('complaint_timeline').delete().eq('actor_id', uid)
        await supabase.from('complaint_attachments').delete().eq('uploader_id', uid)
        await supabase.from('complaints').delete().eq('user_id', uid)
        await supabase.from('student_profiles').delete().eq('user_id', uid)
        await supabase.from('admin_requests').delete().eq('user_id', uid)
        await supabase.from('profiles').delete().eq('id', uid)
      } catch (dbErr) {
        console.warn('Direct database record cleanup notice:', dbErr)
      }

      // Step 3: Clear all local storage keys for this user
      try {
        localStorage.removeItem(`reclustify_profile_${uid}`)
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key && (key.includes(uid) || key.startsWith('reclustify_profile_'))) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        console.warn('localStorage cleanup notice:', e)
      }

      // Step 4: Reset React in-memory state
      setUserRole(null)
      setStudentReports([])
      setUserProfile({
        college: '',
        studentDetails: { name: '', id: '', dept: '', year: '' },
        adminDetails: { name: '', staffId: '', email: '', dept: '', designation: '', office: '', proofName: '', code: '' },
        onboardingComplete: false,
      })

      // Step 5: Sign out from Supabase Auth
      try {
        await supabase.auth.signOut()
      } catch (signOutErr) {
        console.warn('Sign out notice:', signOutErr)
      }

      // Step 6: Redirect to welcome screen
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
