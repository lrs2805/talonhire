import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Candidate } from '../types/database'

export function useCandidate(profileId: string | undefined) {
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profileId) {
      setLoading(false)
      return
    }

    supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', profileId)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError && fetchError.code !== 'PGRST116') {
          setError(fetchError.message)
        }
        setCandidate(data)
        setLoading(false)
      })
  }, [profileId])

  const updateCandidate = useCallback(async (updates: Partial<Candidate>) => {
    if (!candidate) throw new Error('No candidate record')
    const { data, error: updateError } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', candidate.id)
      .select()
      .single()
    if (updateError) throw updateError
    setCandidate(data)
    return data
  }, [candidate])

  const uploadCV = useCallback(async (file: File) => {
    if (!candidate) throw new Error('No candidate record')

    const filePath = `${candidate.profile_id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('cvs').getPublicUrl(filePath)

    await updateCandidate({ cv_url: publicUrl })
    return publicUrl
  }, [candidate, updateCandidate])

  return { candidate, loading, error, updateCandidate, uploadCV }
}
