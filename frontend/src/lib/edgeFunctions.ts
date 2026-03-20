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

export interface MatchingTopCandidate {
  candidateId: string
  candidateName: string
  scoreOverall: number
  explanation: string
  explanationJson?: Record<string, unknown> | null
  scores?: {
    semantic: number
    tech: number
    cultural: number
    seniority: number
    specialized: number
  }
}

export async function runMatching(
  jobId: string,
  options?: { matchThreshold?: number; maxResults?: number }
): Promise<{
  created: number
  total: number
  error?: string
  top5?: MatchingTopCandidate[]
  message?: string
}> {
  const { data, error } = await supabase.functions.invoke('run-matching', {
    body: { jobId, ...options },
  })
  if (error) return { created: 0, total: 0, error: error.message }
  if (data?.error) return { created: 0, total: 0, error: data.error }
  return {
    created: data?.created ?? 0,
    total: data?.total ?? 0,
    top5: data?.top5,
    message: data?.message,
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

export interface ScrapedLinkedInProfile {
  name: string | null
  headline: string | null
  about: string | null
  location: string | null
  experience: { title?: string; company?: string; dates?: string; description?: string }[]
  skills: string[]
  education: { school?: string; degree?: string; dates?: string; description?: string }[]
  projects: { name?: string; description?: string; url?: string }[]
}

export async function prepareCandidateInterview(matchingId: string): Promise<{
  interviewId?: string
  questions?: unknown[]
  reused?: boolean
  error?: string
}> {
  const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
    body: { matchingId },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return {
    interviewId: data?.interviewId,
    questions: data?.questions,
    reused: data?.reused,
  }
}

export async function transcribeInterviewVideo(
  interviewId: string,
  storagePath: string,
  durationSec?: number
): Promise<{ success: boolean; error?: string; transcript?: string }> {
  const { data, error } = await supabase.functions.invoke('transcribe-video', {
    body: { interviewId, storagePath, durationSec },
  })
  if (error) return { success: false, error: error.message }
  if (data?.error) return { success: false, error: data.error }
  return { success: true, transcript: data?.transcript }
}

export async function fetchShareMatchMedia(token: string): Promise<{
  video_signed_url?: string | null
  transcript_original?: string | null
  translations?: Record<string, string> | null
  error?: string
}> {
  const { data, error } = await supabase.functions.invoke('share-match-media', {
    body: { token },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return {
    video_signed_url: data?.video_signed_url,
    transcript_original: data?.transcript_original,
    translations: data?.translations,
  }
}

export async function scrapeLinkedIn(
  linkedinUrl: string,
  candidateId: string
): Promise<{
  success: boolean
  error?: string
  partial?: boolean
  data?: ScrapedLinkedInProfile
  embeddingText?: string
  plainText?: string
}> {
  const { data, error } = await supabase.functions.invoke('scrape-linkedin', {
    body: { linkedin_url: linkedinUrl, candidate_id: candidateId },
  })
  if (error) return { success: false, error: error.message }
  if (data?.error && !data?.partial) return { success: false, error: data.error, data: data.data }
  if (data?.error && data?.partial) return { success: false, error: data.error, partial: true, data: data.data }
  return {
    success: true,
    data: data?.data,
    embeddingText: data?.embeddingText,
    plainText: data?.plainText,
    partial: data?.partial,
  }
}

export async function signContract(contractId: string, consentText?: string): Promise<{
  success?: boolean
  bothSigned?: boolean
  pdfHash?: string
  error?: string
}> {
  const { data, error } = await supabase.functions.invoke('contract-sign', {
    body: { contractId, consentText: consentText || 'I agree to the terms of this contract.' },
  })
  if (error) return { error: error.message }
  if (data?.error) return { error: data.error }
  return {
    success: data?.success,
    bothSigned: data?.bothSigned,
    pdfHash: data?.pdfHash,
  }
}
