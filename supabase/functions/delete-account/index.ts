// Supabase Edge Function: delete-account
// Runtime: Deno
// Deployed at: /functions/v1/delete-account
//
// SECURITY:
// - Validates the caller's JWT via Supabase Auth
// - Only deletes the account that matches the verified JWT (no cross-user deletion)
// - Uses SUPABASE_SERVICE_ROLE_KEY (server-side only, never exposed to browser)
//
// Deploy with:
//   supabase functions deploy delete-account --no-verify-jwt
// Then set the secret:
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    // 1. Extract and verify the caller's JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const jwt = authHeader.replace('Bearer ', '')

    // Create a regular (anon key) client to verify the JWT and get the user
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    })

    // Verify JWT by calling getUser() — this validates the token signature
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.id

    // 2. Parse request body (optional: allow explicit user_id for double-check)
    let body: { user_id?: string } = {}
    try {
      body = await req.json()
    } catch {
      // body is optional
    }

    // Security: if user_id is provided, it MUST match the verified JWT user
    if (body.user_id && body.user_id !== userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized: user_id mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Create admin client (service role — server-side only)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // 4. Delete the user's storage files (complaint-evidence/{userId}/)
    //    List all files in the user's storage folder
    const { data: storageFiles, error: listError } = await supabaseAdmin.storage
      .from('complaint-evidence')
      .list(userId, { limit: 1000, offset: 0, sortBy: { column: 'name', order: 'asc' } })

    if (!listError && storageFiles && storageFiles.length > 0) {
      // Build full paths and delete in batches
      const filePaths = storageFiles.map((f) => `${userId}/${f.name}`)
      await supabaseAdmin.storage.from('complaint-evidence').remove(filePaths)

      // Also try to remove sub-folders (complaint_id sub-paths)
      for (const file of storageFiles) {
        if (file.id === null) {
          // It's a "folder" — list recursively
          const { data: subFiles } = await supabaseAdmin.storage
            .from('complaint-evidence')
            .list(`${userId}/${file.name}`, { limit: 1000 })
          if (subFiles && subFiles.length > 0) {
            const subPaths = subFiles.map((sf) => `${userId}/${file.name}/${sf.name}`)
            await supabaseAdmin.storage.from('complaint-evidence').remove(subPaths)
          }
        }
      }
    }

    // 5. Clear localStorage-equivalent server-side profile cache
    //    (The profiles, student_profiles, admin_requests, complaints rows
    //    will cascade-delete automatically when auth.users is deleted.)

    // 6. Delete the auth user — this cascades to all profile/data tables
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error deleting user:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete account', details: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, deleted_user_id: userId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('Unexpected error in delete-account function:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
