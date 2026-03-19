import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Matching, Job, Candidate } from '../types/database'

interface MatchWithDetails extends Matching {
  job?: Pick<Job, 'id' | 'title' | 'company_id' | 'salary_min' | 'salary_max' | 'remote' | 'required_stack' | 'seniority'>
  candidate?: Pick<Candidate, 'id' | 'profile_id' | 'primary_role' | 'tech_stack' | 'seniority' | 'location_country'>
}

interface UseMatchesOptions {
  jobId?: string
  candidateId?: string
  status?: Matching['status'][]
  limit?: number
  page?: number
}

export function useMatches(options: UseMatchesOptions = {}) {
  const { jobId, candidateId, status, limit = 20, page = 0 } = options
  const [matches, setMatches] = useState<MatchWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const fetchMatches = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('matchings')
      .select(`
        *,
        job:jobs(id, title, company_id, salary_min, salary_max, remote, required_stack, seniority),
        candidate:candidates(id, profile_id, primary_role, tech_stack, seniority, location_country)
      `, { count: 'exact' })
      .order('score_overall', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (jobId) query = query.eq('job_id', jobId)
    if (candidateId) query = query.eq('candidate_id', candidateId)
    if (status?.length) query = query.in('status', status)

    const { data, error: fetchError, count: totalCount } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setMatches((data as MatchWithDetails[]) || [])
      setCount(totalCount || 0)
    }
    setLoading(false)
  }, [jobId, candidateId, status, limit, page])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  return { matches, loading, error, count, refetch: fetchMatches }
}
