import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { rateLimit } from "../_shared/rateLimit.ts"
import { corsHeaders, corsResponse, jsonResponse } from "../_shared/cors.ts"

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse()

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429)

  try {
    const { type, entityId, text } = await req.json()
    if (!type || !entityId || !text) {
      return jsonResponse({ error: 'type, entityId, and text are required' }, 400)
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return jsonResponse({ error: 'OPENAI_API_KEY not configured' }, 500)
    }

    // Generate embedding via OpenAI
    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'text-embedding-3-large', input: text.slice(0, 8191) }),
    })
    const embeddingData = await embeddingRes.json()
    if (!embeddingRes.ok) {
      return jsonResponse({ error: embeddingData.error?.message ?? 'OpenAI error' }, 502)
    }
    const embedding = embeddingData.data[0].embedding

    // Store in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    if (type === 'cv') {
      const { error } = await supabase
        .from('candidates')
        .update({ cv_embedding: JSON.stringify(embedding) })
        .eq('id', entityId)
      if (error) throw error
    } else if (type === 'jd') {
      const { error } = await supabase
        .from('jobs')
        .update({ jd_embedding: JSON.stringify(embedding) })
        .eq('id', entityId)
      if (error) throw error
    } else {
      return jsonResponse({ error: 'type must be cv or jd' }, 400)
    }

    return jsonResponse({ success: true })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
