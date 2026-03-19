import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { rateLimit } from "../_shared/rateLimit.ts"
import { corsResponse, jsonResponse } from "../_shared/cors.ts"

// JWT disabled — this is accessed via public share links
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse()

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429)

  try {
    const { token, reason } = await req.json()
    if (!token) return jsonResponse({ error: 'token is required' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Find matching by share token
    const { data: matching, error: findError } = await supabase
      .from('matchings')
      .select('id, share_expires_at')
      .eq('share_token', token)
      .single()

    if (findError || !matching) {
      return jsonResponse({ error: 'Match not found for this token' }, 404)
    }

    // Check expiry
    if (matching.share_expires_at && new Date(matching.share_expires_at) < new Date()) {
      return jsonResponse({ error: 'This share link has expired' }, 410)
    }

    // Update status to rejected
    const updateData: Record<string, unknown> = {
      status: 'rejected',
      rejection_category: 'other',
    }
    if (reason) updateData.rejection_reason = reason

    const { error: updateError } = await supabase
      .from('matchings')
      .update(updateData)
      .eq('id', matching.id)

    if (updateError) throw updateError

    return jsonResponse({ success: true })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
