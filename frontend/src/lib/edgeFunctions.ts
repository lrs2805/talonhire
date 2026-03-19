import { supabase } from './supabase'

export type EmbeddingType = 'cv' | 'jd'

export async function generateEmbedding(
  type: EmbeddingType,
  entityId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  if (!text?.trim()) {
    return { success: false, error: 'Text is required for embedding' }
  }
  const { data, error } = await supabase.functions.invoke('generate-embedding', {
    body: { type, entityId, text: text.slice(0, 8191) },
  })
  if (error) return { success: false, error: error.message }
  if (data?.error) return { success: false, error: data.error }
  return { success: true }
}

export async function runMatching(
  jobId: string,
  options?: { matchThreshold?: number; maxResults?: number }
): Promise<{ created: number; total: number; error?: string }> {
  const { data, error } = await supabase.functions.invoke('run-matching', {
    body: { jobId, ...options },
  })
  if (error) return { created: 0, total: 0, error: error.message }
  if (data?.error) return { created: 0, total: 0, error: data.error }
  return {
    created: data?.created ?? 0,
    total: data?.total ?? 0,
  }
}

export async function rejectMatchByToken(token: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('reject-match', {
    body: { token, reason },
  })
  if (error) return { success: false, error: error.message }
  if (data?.error) return { success: false, error: data.error }
  return { success: true }
}
