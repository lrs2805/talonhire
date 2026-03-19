// ============================================================
// TalonHire — Database Types (Public API)
//
// This file re-exports the auto-generated types from Supabase
// and adds convenient helper aliases used across the codebase.
//
// Regenerate the source of truth:
//   npm run supabase:types
// ============================================================

export type { Json, Database, Tables, TablesInsert, TablesUpdate } from './database.generated'
import type { Database } from './database.generated'

// ── Enum aliases ─────────────────────────────────────────────
export type UserRole = Database['public']['Enums']['user_role']
export type JobStatus = Database['public']['Enums']['job_status']
export type SeniorityLevel = Database['public']['Enums']['seniority_level']
export type CandidateStatus = Database['public']['Enums']['candidate_status']
export type MatchStatus = Database['public']['Enums']['match_status']
export type InterviewStatus = Database['public']['Enums']['interview_status']
export type ContractType = Database['public']['Enums']['contract_type']
export type ContractStatus = Database['public']['Enums']['contract_status']
export type PaymentStatus = Database['public']['Enums']['payment_status']
export type NotificationChannel = Database['public']['Enums']['notification_channel']
export type PlanTier = Database['public']['Enums']['plan_tier']

// ── Row type aliases ─────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Company = Database['public']['Tables']['companies']['Row']
export type Candidate = Database['public']['Tables']['candidates']['Row']
export type Job = Database['public']['Tables']['jobs']['Row']
export type Matching = Database['public']['Tables']['matchings']['Row']
export type Interview = Database['public']['Tables']['interviews']['Row']
export type Contract = Database['public']['Tables']['contracts']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type Translation = Database['public']['Tables']['translations']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type ActivityLog = Database['public']['Tables']['activity_log']['Row']

// ── Insert type aliases ──────────────────────────────────────
export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertCompany = Database['public']['Tables']['companies']['Insert']
export type InsertCandidate = Database['public']['Tables']['candidates']['Insert']
export type InsertJob = Database['public']['Tables']['jobs']['Insert']
export type InsertMatching = Database['public']['Tables']['matchings']['Insert']

// ── Function types ───────────────────────────────────────────
export type MatchCandidatesArgs = Database['public']['Functions']['match_candidates_to_job']['Args']
export type MatchCandidatesResult = Database['public']['Functions']['match_candidates_to_job']['Returns']
export type GenerateShareLinkArgs = Database['public']['Functions']['generate_share_link']['Args']
export type ValidateShareLinkArgs = Database['public']['Functions']['validate_share_link']['Args']
