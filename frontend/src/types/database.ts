// ============================================================
// TalonHire — Supabase Database Types (Manual)
// Replace with auto-generated types when project is healthy:
//   npx supabase gen types typescript --project-id zluwxdsjtvqhguxdhsxm > src/types/database.ts
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'candidate' | 'company' | 'admin_master' | 'admin_recruiter' | 'instructor'
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed' | 'filled'
export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'c_level'
export type CandidateStatus = 'active' | 'interviewing' | 'matched' | 'hired' | 'inactive' | 'blacklisted'
export type MatchStatus = 'pending' | 'sent_to_company' | 'viewed' | 'interview_requested' | 'rejected' | 'accepted' | 'hired'
export type InterviewStatus = 'pending' | 'questions_sent' | 'video_submitted' | 'transcribed' | 'scored' | 'approved' | 'rejected'
export type ContractType = 'fee_15pct' | 'service_markup_40pct'
export type ContractStatus = 'draft' | 'pending_signature' | 'signed' | 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'
export type NotificationChannel = 'email' | 'whatsapp' | 'push' | 'in_app'
export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          email: string
          avatar_url: string | null
          phone: string | null
          preferred_language: 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de'
          timezone: string | null
          lgpd_consent: boolean
          lgpd_consent_at: string | null
          gdpr_consent: boolean
          gdpr_consent_at: string | null
          data_retention_until: string | null
          last_active_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          email: string
          avatar_url?: string | null
          phone?: string | null
          preferred_language?: 'pt' | 'en' | 'es' | 'fr' | 'it' | 'de'
          timezone?: string | null
          lgpd_consent?: boolean
          gdpr_consent?: boolean
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      companies: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          email: string
          website: string | null
          logo_url: string | null
          country: string
          industry: string | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          description: string | null
          plan_tier: PlanTier
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          email: string
          website?: string | null
          logo_url?: string | null
          country?: string
          industry?: string | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          description?: string | null
          plan_tier?: PlanTier
        }
        Update: Partial<Database['public']['Tables']['companies']['Insert']>
      }
      candidates: {
        Row: {
          id: string
          profile_id: string
          linkedin_url: string | null
          linkedin_scraped_at: string | null
          linkedin_raw_json: Json | null
          location_city: string | null
          location_country: string
          relocation_willing: boolean
          relocation_countries: string[] | null
          primary_role: string | null
          tech_stack: string[]
          years_experience: number | null
          seniority: SeniorityLevel | null
          salary_expectation_min: number | null
          salary_expectation_max: number | null
          salary_currency: string | null
          cv_url: string | null
          cv_text: string | null
          cv_embedding: string | null
          profile_summary: string | null
          intro_video_url: string | null
          intro_video_transcript: string | null
          intro_video_translations: Json | null
          overall_score: number | null
          skills_score: number | null
          experience_score: number | null
          cultural_score: number | null
          status: CandidateStatus
          availability_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          linkedin_url?: string | null
          location_city?: string | null
          location_country?: string
          relocation_willing?: boolean
          relocation_countries?: string[] | null
          primary_role?: string | null
          tech_stack?: string[]
          years_experience?: number | null
          seniority?: SeniorityLevel | null
          salary_expectation_min?: number | null
          salary_expectation_max?: number | null
        }
        Update: Partial<Database['public']['Tables']['candidates']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          created_by: string
          title: string
          slug: string
          description: string | null
          seniority: SeniorityLevel
          required_stack: string[]
          nice_to_have_stack: string[] | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          benefits: Json | null
          remote: boolean
          location_city: string | null
          location_country: string | null
          relocation_support: boolean | null
          relocation_budget: number | null
          jd_pdf_url: string | null
          jd_source_url: string | null
          jd_extracted_text: string | null
          jd_embedding: string | null
          contract_type: ContractType
          fee_percentage: number | null
          monthly_markup_percentage: number | null
          custom_interview_questions: Json | null
          assessment_type: 'coding' | 'case_study' | 'sap_scenario' | 'marketing' | 'none' | null
          status: JobStatus
          published_at: string | null
          closes_at: string | null
          filled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          created_by: string
          title: string
          slug: string
          description?: string | null
          seniority?: SeniorityLevel
          required_stack?: string[]
          nice_to_have_stack?: string[] | null
          salary_min?: number | null
          salary_max?: number | null
          remote?: boolean
          contract_type?: ContractType
          status?: JobStatus
        }
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      matchings: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          score_overall: number
          score_semantic: number | null
          score_tech: number | null
          score_cultural: number | null
          score_seniority: number | null
          score_skills: number | null
          score_details: Json | null
          llm_models_used: string[] | null
          status: MatchStatus
          share_token: string | null
          share_expires_at: string | null
          share_viewed_at: string | null
          company_feedback: string | null
          rejection_reason: string | null
          rejection_category: string | null
          notified_candidate_at: string | null
          notified_company_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          score_overall?: number
          score_semantic?: number | null
          score_tech?: number | null
          score_cultural?: number | null
          score_seniority?: number | null
          score_skills?: number | null
          status?: MatchStatus
        }
        Update: Partial<Database['public']['Tables']['matchings']['Insert']>
      }
      interviews: {
        Row: {
          id: string
          matching_id: string | null
          candidate_id: string
          job_id: string | null
          questions: Json
          video_url: string | null
          video_duration_sec: number | null
          transcript_original: string | null
          transcript_language: string | null
          translations: Json | null
          ai_score: number | null
          ai_feedback: Json | null
          ai_model_used: string | null
          human_reviewer_id: string | null
          human_approved: boolean | null
          human_notes: string | null
          status: InterviewStatus
          deadline_at: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          candidate_id: string
          job_id?: string | null
          matching_id?: string | null
          questions?: Json
          status?: InterviewStatus
        }
        Update: Partial<Database['public']['Tables']['interviews']['Insert']>
      }
      contracts: {
        Row: {
          id: string
          job_id: string
          candidate_id: string
          company_id: string
          contract_type: ContractType
          fee_percentage: number | null
          fee_base_salary: number | null
          fee_total_amount: number | null
          fee_payment_schedule: Json | null
          monthly_salary: number | null
          monthly_markup_pct: number | null
          monthly_total: number | null
          relocation_fee: number | null
          docusign_envelope_id: string | null
          docusign_url: string | null
          signed_at: string | null
          guarantee_start: string | null
          guarantee_end: string | null
          guarantee_status: 'active' | 'passed' | 'replacement_needed' | null
          status: ContractStatus
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          candidate_id: string
          company_id: string
          contract_type: ContractType
          status?: ContractStatus
        }
        Update: Partial<Database['public']['Tables']['contracts']['Insert']>
      }
      payments: {
        Row: {
          id: string
          contract_id: string
          company_id: string
          stripe_payment_intent_id: string | null
          stripe_invoice_id: string | null
          payment_method: 'stripe' | 'pix' | 'revolut' | 'wise' | 'manual'
          revolut_transaction_id: string | null
          wise_transfer_id: string | null
          amount: number
          currency: string
          description: string | null
          is_recurring: boolean | null
          billing_period_start: string | null
          billing_period_end: string | null
          status: PaymentStatus
          paid_at: string | null
          failed_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contract_id: string
          company_id: string
          amount: number
          currency?: string
          payment_method?: 'stripe' | 'pix' | 'revolut' | 'wise' | 'manual'
          status?: PaymentStatus
        }
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          channel: NotificationChannel
          title: string
          body: string
          action_url: string | null
          metadata: Json | null
          sent_at: string | null
          delivered_at: string | null
          read_at: string | null
          failed_reason: string | null
          resend_message_id: string | null
          whatsapp_message_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          channel?: NotificationChannel
          title: string
          body: string
          action_url?: string | null
          metadata?: Json | null
        }
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      translations: {
        Row: {
          id: string
          key: string
          namespace: string
          pt: string | null
          en: string | null
          es: string | null
          fr: string | null
          it: string | null
          de: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          namespace?: string
          pt?: string | null
          en?: string | null
          es?: string | null
          fr?: string | null
          it?: string | null
          de?: string | null
        }
        Update: Partial<Database['public']['Tables']['translations']['Insert']>
      }
      activity_log: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Json | null
        }
        Update: Partial<Database['public']['Tables']['activity_log']['Insert']>
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          sidebar_collapsed: boolean | null
          notifications_enabled: boolean | null
          email_digest: 'realtime' | 'daily' | 'weekly' | 'off' | null
          preferences: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          sidebar_collapsed?: boolean | null
          notifications_enabled?: boolean | null
          email_digest?: 'realtime' | 'daily' | 'weekly' | 'off' | null
          preferences?: Json | null
        }
        Update: Partial<Database['public']['Tables']['user_preferences']['Insert']>
      }
    }
    Functions: {
      match_candidates_to_job: {
        Args: {
          job_embedding: string
          match_threshold?: number
          max_results?: number
        }
        Returns: {
          candidate_id: string
          candidate_name: string
          similarity: number
        }[]
      }
      generate_share_link: {
        Args: { p_matching_id: string }
        Returns: { token: string; expires_at: string }[]
      }
      validate_share_link: {
        Args: { p_token: string }
        Returns: {
          matching_id: string
          job_title: string
          candidate_name: string
          is_valid: boolean
        }[]
      }
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Profile = Tables<'profiles'>
export type Company = Tables<'companies'>
export type Candidate = Tables<'candidates'>
export type Job = Tables<'jobs'>
export type Matching = Tables<'matchings'>
export type Interview = Tables<'interviews'>
export type Contract = Tables<'contracts'>
export type Payment = Tables<'payments'>
export type Notification = Tables<'notifications'>
