import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface ShareLinkResult {
  token: string
  expires_at: string
}

interface ValidateResult {
  matching_id: string
  job_title: string
  candidate_name: string
  is_valid: boolean
}

export function useShareLink() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateLink = useCallback(async (matchingId: string): Promise<ShareLinkResult | null> => {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase
      .rpc('generate_share_link', { p_matching_id: matchingId })

    setLoading(false)

    if (rpcError) {
      setError(rpcError.message)
      return null
    }

    return data?.[0] || null
  }, [])

  const validateLink = useCallback(async (token: string): Promise<ValidateResult | null> => {
    setLoading(true)
    setError(null)

    const { data, error: rpcError } = await supabase
      .rpc('validate_share_link', { p_token: token })

    setLoading(false)

    if (rpcError) {
      setError(rpcError.message)
      return null
    }

    return data?.[0] || null
  }, [])

  return { generateLink, validateLink, loading, error }
}
