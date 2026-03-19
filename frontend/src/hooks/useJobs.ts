import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Job } from '../types/database'

interface UseJobsOptions {
  companyId?: string
  status?: Job['status'][]
  limit?: number
  page?: number
}

export function useJobs(options: UseJobsOptions = {}) {
  const { companyId, status, limit = 20, page = 0 } = options
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1)

    if (companyId) query = query.eq('company_id', companyId)
    if (status?.length) query = query.in('status', status)

    const { data, error: fetchError, count: totalCount } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setJobs(data || [])
      setCount(totalCount || 0)
    }
    setLoading(false)
  }, [companyId, status, limit, page])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const createJob = useCallback(async (job: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single()
    if (error) throw error
    setJobs(prev => [data, ...prev])
    return data
  }, [])

  return { jobs, loading, error, count, refetch: fetchJobs, createJob }
}
