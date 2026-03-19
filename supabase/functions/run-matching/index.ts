import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { rateLimit } from "../_shared/rateLimit.ts"
import { corsResponse, jsonResponse } from "../_shared/cors.ts"

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return corsResponse()

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  if (!rateLimit(ip)) return jsonResponse({ error: 'Rate limit exceeded' }, 429)

  try {
    const { jobId, matchThreshold = 0.7, maxResults = 50 } = await req.json()
    if (!jobId) return jsonResponse({ error: 'jobId is required' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Get job embedding
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, jd_embedding')
      .eq('id', jobId)
      .single()
    if (jobError || !job) return jsonResponse({ error: 'Job not found' }, 404)
    if (!job.jd_embedding) {
      return jsonResponse({ error: 'Job has no embedding. Generate embedding first.' }, 400)
    }

    // Call pgvector matching function
    const { data: candidates, error: matchError } = await supabase.rpc(
      'match_candidates_to_job',
      {
        job_embedding: job.jd_embedding,
        match_threshold: matchThreshold,
        max_results: maxResults,
      },
    )
    if (matchError) throw matchError

    // Deduplicate: skip candidates already matched to this job
    const { data: existingMatches } = await supabase
      .from('matchings')
      .select('candidate_id')
      .eq('job_id', jobId)
    const existingIds = new Set((existingMatches ?? []).map(m => m.candidate_id))

    const newMatches = (candidates ?? []).filter(
      (c: { candidate_id: string }) => !existingIds.has(c.candidate_id),
    )

    // Insert new matches
    let created = 0
    for (const candidate of newMatches) {
      const { error: insertError } = await supabase.from('matchings').insert({
        job_id: jobId,
        candidate_id: candidate.candidate_id,
        score_overall: Math.round(candidate.similarity * 100),
        score_semantic: Math.round(candidate.similarity * 100),
        status: 'pending',
      })
      if (!insertError) created++
    }

    return jsonResponse({ created, total: (candidates ?? []).length })
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500)
  }
})
