-- ============================================================
-- TalonHire — Supabase Schema Completo (Melhorado)
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- busca fuzzy por texto

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('candidate', 'company', 'admin_master', 'admin_recruiter', 'instructor');
CREATE TYPE job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'filled');
CREATE TYPE seniority_level AS ENUM ('junior', 'mid', 'senior', 'lead', 'principal', 'c_level');
CREATE TYPE candidate_status AS ENUM ('active', 'interviewing', 'matched', 'hired', 'inactive', 'blacklisted');
CREATE TYPE match_status AS ENUM ('pending', 'sent_to_company', 'viewed', 'interview_requested', 'rejected', 'accepted', 'hired');
CREATE TYPE interview_status AS ENUM ('pending', 'questions_sent', 'video_submitted', 'transcribed', 'scored', 'approved', 'rejected');
CREATE TYPE contract_type AS ENUM ('fee_15pct', 'service_markup_40pct');
CREATE TYPE contract_status AS ENUM ('draft', 'pending_signature', 'signed', 'active', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'paid', 'failed', 'refunded');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'push', 'in_app');
CREATE TYPE plan_tier AS ENUM ('free', 'starter', 'professional', 'enterprise');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'candidate',
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'pt' CHECK (preferred_language IN ('pt','en','es','fr','it','de')),
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  lgpd_consent BOOLEAN NOT NULL DEFAULT FALSE,
  lgpd_consent_at TIMESTAMPTZ,
  gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE,
  gdpr_consent_at TIMESTAMPTZ,
  data_retention_until TIMESTAMPTZ, -- auto-delete após 90 dias inatividade
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_data_retention ON profiles(data_retention_until) WHERE data_retention_until IS NOT NULL;

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- para empresa.talonhire.com/{slug}
  email TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  country TEXT NOT NULL DEFAULT 'PT',
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10','11-50','51-200','201-500','500+')),
  description TEXT,
  plan_tier plan_tier NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_country ON companies(country);
CREATE UNIQUE INDEX idx_companies_stripe ON companies(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- ============================================================
-- CANDIDATES
-- ============================================================

CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,

  -- LinkedIn & Scraping
  linkedin_url TEXT,
  linkedin_scraped_at TIMESTAMPTZ,
  linkedin_raw_json JSONB, -- dados extraídos do LinkedIn

  -- Localização & Relocação
  location_city TEXT,
  location_country TEXT NOT NULL DEFAULT 'BR',
  relocation_willing BOOLEAN NOT NULL DEFAULT FALSE,
  relocation_countries TEXT[], -- países que aceita relocar

  -- Skills & Stack
  primary_role TEXT, -- ex: 'full-stack', 'data-engineer', 'devops'
  tech_stack TEXT[] NOT NULL DEFAULT '{}', -- ex: {'react','node','python','aws'}
  years_experience INTEGER DEFAULT 0,
  seniority seniority_level DEFAULT 'mid',

  -- Salário
  salary_expectation_min INTEGER, -- EUR/mês
  salary_expectation_max INTEGER,
  salary_currency TEXT DEFAULT 'EUR',

  -- IA & Embeddings
  cv_url TEXT, -- Supabase Storage
  cv_text TEXT, -- texto extraído do CV
  cv_embedding vector(3072), -- text-embedding-3-large = 3072 dims
  profile_summary TEXT, -- resumo gerado por IA

  -- Vídeo
  intro_video_url TEXT,
  intro_video_transcript TEXT,
  intro_video_translations JSONB, -- {"en": "...", "es": "...", ...}

  -- Scores
  overall_score NUMERIC(5,2) DEFAULT 0,
  skills_score NUMERIC(5,2) DEFAULT 0,
  experience_score NUMERIC(5,2) DEFAULT 0,
  cultural_score NUMERIC(5,2) DEFAULT 0,

  -- Status
  status candidate_status NOT NULL DEFAULT 'active',
  availability_date DATE, -- quando pode começar

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice vetorial para semantic search
CREATE INDEX idx_candidates_embedding ON candidates
  USING ivfflat (cv_embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_candidates_profile ON candidates(profile_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_location ON candidates(location_country);
CREATE INDEX idx_candidates_seniority ON candidates(seniority);
CREATE INDEX idx_candidates_stack ON candidates USING GIN(tech_stack);
CREATE INDEX idx_candidates_role ON candidates(primary_role);

-- ============================================================
-- JOBS (Vagas)
-- ============================================================

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),

  -- Detalhes da vaga
  title TEXT NOT NULL,
  slug TEXT NOT NULL, -- URL-friendly
  description TEXT,
  seniority seniority_level NOT NULL DEFAULT 'mid',
  required_stack TEXT[] NOT NULL DEFAULT '{}',
  nice_to_have_stack TEXT[] DEFAULT '{}',

  -- Salário & Benefícios
  salary_min INTEGER, -- EUR/mês
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'EUR',
  benefits JSONB, -- {"remote": true, "equity": "0.1-0.5%", ...}

  -- Localização
  remote BOOLEAN NOT NULL DEFAULT TRUE,
  location_city TEXT,
  location_country TEXT,
  relocation_support BOOLEAN DEFAULT FALSE,
  relocation_budget INTEGER DEFAULT 0, -- EUR

  -- JD Upload
  jd_pdf_url TEXT, -- Supabase Storage
  jd_source_url TEXT, -- LinkedIn/Indeed URL
  jd_extracted_text TEXT, -- texto extraído por IA
  jd_embedding vector(3072), -- embedding do JD para matching

  -- Contrato
  contract_type contract_type NOT NULL DEFAULT 'fee_15pct',
  fee_percentage NUMERIC(5,2) DEFAULT 15.00,
  monthly_markup_percentage NUMERIC(5,2) DEFAULT 40.00,

  -- IA Interview Config
  custom_interview_questions JSONB, -- perguntas específicas da empresa
  assessment_type TEXT CHECK (assessment_type IN ('coding', 'case_study', 'sap_scenario', 'marketing', 'none')),

  -- Status
  status job_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  filled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(company_id, slug)
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_seniority ON jobs(seniority);
CREATE INDEX idx_jobs_stack ON jobs USING GIN(required_stack);
CREATE INDEX idx_jobs_remote ON jobs(remote);
CREATE INDEX idx_jobs_embedding ON jobs
  USING ivfflat (jd_embedding vector_cosine_ops) WITH (lists = 100);

-- ============================================================
-- MATCHINGS (IA Match Results)
-- ============================================================

CREATE TABLE matchings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  -- Scores Multi-LLM
  score_overall NUMERIC(5,2) NOT NULL DEFAULT 0,
  score_semantic NUMERIC(5,2) DEFAULT 0, -- cosine similarity (pgvector)
  score_tech NUMERIC(5,2) DEFAULT 0,     -- GPT-4o: fit técnico
  score_cultural NUMERIC(5,2) DEFAULT 0, -- Claude: fit cultural
  score_seniority NUMERIC(5,2) DEFAULT 0,-- Gemini: senioridade/salário
  score_skills NUMERIC(5,2) DEFAULT 0,   -- Deepseek: skills específicas

  -- Score breakdown (audit trail)
  score_details JSONB, -- detalhamento completo dos scores
  llm_models_used TEXT[], -- quais LLMs participaram

  -- Status
  status match_status NOT NULL DEFAULT 'pending',

  -- Link temporário 48h
  share_token TEXT UNIQUE, -- token para link de 48h
  share_expires_at TIMESTAMPTZ,
  share_viewed_at TIMESTAMPTZ,

  -- Feedback
  company_feedback TEXT,
  rejection_reason TEXT,
  rejection_category TEXT CHECK (rejection_category IN (
    'salary_mismatch', 'seniority_mismatch', 'stack_mismatch',
    'location_mismatch', 'cultural_mismatch', 'other'
  )),

  -- Timestamps
  notified_candidate_at TIMESTAMPTZ,
  notified_company_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(job_id, candidate_id) -- evita matches duplicados
);

CREATE INDEX idx_matchings_job ON matchings(job_id);
CREATE INDEX idx_matchings_candidate ON matchings(candidate_id);
CREATE INDEX idx_matchings_status ON matchings(status);
CREATE INDEX idx_matchings_score ON matchings(score_overall DESC);
CREATE INDEX idx_matchings_share ON matchings(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_matchings_expiry ON matchings(share_expires_at) WHERE share_expires_at IS NOT NULL;

-- ============================================================
-- INTERVIEWS (Entrevistas IA)
-- ============================================================

CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matching_id UUID REFERENCES matchings(id) ON DELETE SET NULL,
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Perguntas geradas por IA
  questions JSONB NOT NULL DEFAULT '[]',
  -- [{"q": "...", "type": "technical|behavioral|motivation", "duration_sec": 60}]

  -- Respostas em vídeo
  video_url TEXT, -- Supabase Storage
  video_duration_sec INTEGER,

  -- Transcrição & Tradução
  transcript_original TEXT,
  transcript_language TEXT DEFAULT 'pt',
  translations JSONB, -- {"en": "...", "es": "...", "fr": "...", "it": "...", "de": "..."}

  -- IA Scoring
  ai_score NUMERIC(5,2),
  ai_feedback JSONB, -- {"strengths": [...], "weaknesses": [...], "recommendation": "..."}
  ai_model_used TEXT,

  -- Human Review
  human_reviewer_id UUID REFERENCES profiles(id),
  human_approved BOOLEAN,
  human_notes TEXT,

  -- Status
  status interview_status NOT NULL DEFAULT 'pending',
  deadline_at TIMESTAMPTZ, -- prazo para gravar vídeo
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX idx_interviews_job ON interviews(job_id);
CREATE INDEX idx_interviews_status ON interviews(status);

-- ============================================================
-- ASSESSMENTS (Testes Técnicos)
-- ============================================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,

  -- Challenge
  type TEXT NOT NULL CHECK (type IN ('coding', 'case_study', 'sap_scenario', 'marketing')),
  challenge_description TEXT NOT NULL,
  challenge_generated_by TEXT, -- qual LLM gerou

  -- Submission
  submission_url TEXT, -- GitHub repo, link, etc
  submission_text TEXT,
  submitted_at TIMESTAMPTZ,

  -- IA Evaluation
  ai_score NUMERIC(5,2),
  ai_evaluation JSONB,
  -- coding: {"functionality": 8, "clean_code": 7, "performance": 9, "comments": "..."}
  -- marketing: {"strategy": 8, "roi_estimate": "...", "creativity": 7}

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'evaluating', 'completed')),
  deadline_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_candidate ON assessments(candidate_id);
CREATE INDEX idx_assessments_status ON assessments(status);

-- ============================================================
-- CONTRACTS
-- ============================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES candidates(id),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Tipo
  contract_type contract_type NOT NULL,

  -- Valores Fee 15%
  fee_percentage NUMERIC(5,2),
  fee_base_salary INTEGER, -- salário base para cálculo
  fee_total_amount INTEGER, -- fee calculado
  fee_payment_schedule JSONB, -- parcelas: [{"due": "2026-04-01", "amount": 1500, "status": "pending"}]

  -- Valores Prestação Serviço
  monthly_salary INTEGER,
  monthly_markup_pct NUMERIC(5,2) DEFAULT 40.00,
  monthly_total INTEGER, -- salary + markup
  relocation_fee INTEGER DEFAULT 0, -- 1000 EUR

  -- DocuSign
  docusign_envelope_id TEXT,
  docusign_url TEXT,
  signed_at TIMESTAMPTZ,

  -- Garantia 90 dias
  guarantee_start DATE,
  guarantee_end DATE,
  guarantee_status TEXT DEFAULT 'active' CHECK (guarantee_status IN ('active', 'passed', 'replacement_needed')),

  -- Status
  status contract_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_job ON contracts(job_id);
CREATE INDEX idx_contracts_candidate ON contracts(candidate_id);
CREATE INDEX idx_contracts_company ON contracts(company_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_guarantee ON contracts(guarantee_end) WHERE guarantee_status = 'active';

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  company_id UUID NOT NULL REFERENCES companies(id),

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,

  -- Alternativas
  payment_method TEXT NOT NULL DEFAULT 'stripe' CHECK (payment_method IN ('stripe', 'pix', 'revolut', 'wise', 'manual')),
  revolut_transaction_id TEXT,
  wise_transfer_id TEXT,

  -- Valores
  amount INTEGER NOT NULL, -- centavos EUR
  currency TEXT NOT NULL DEFAULT 'EUR',
  description TEXT,

  -- Recorrência (para prestação de serviço)
  is_recurring BOOLEAN DEFAULT FALSE,
  billing_period_start DATE,
  billing_period_end DATE,

  -- Status
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  failed_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_contract ON payments(contract_id);
CREATE INDEX idx_payments_company ON payments(company_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe ON payments(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  channel notification_channel NOT NULL DEFAULT 'in_app',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT, -- deep link
  metadata JSONB, -- dados extras

  -- Delivery
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_reason TEXT,

  -- External IDs
  resend_message_id TEXT,
  whatsapp_message_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_unread ON notifications(recipient_id, read_at) WHERE read_at IS NULL;

-- ============================================================
-- TRANSLATIONS (i18n manual)
-- ============================================================

CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE, -- ex: 'landing.hero.title'
  namespace TEXT NOT NULL DEFAULT 'common', -- agrupamento
  pt TEXT,
  en TEXT,
  es TEXT,
  fr TEXT,
  it TEXT,
  de TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_translations_key ON translations(key);
CREATE INDEX idx_translations_namespace ON translations(namespace);

-- ============================================================
-- ACTIVITY LOG (Audit Trail)
-- ============================================================

CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'match.created', 'interview.completed', etc
  entity_type TEXT NOT NULL, -- 'candidate', 'job', 'matching', etc
  entity_id UUID,
  metadata JSONB, -- detalhes da ação
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_actor ON activity_log(actor_id);
CREATE INDEX idx_activity_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- ============================================================
-- USER PREFERENCES (Theme, UI)
-- ============================================================

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_digest TEXT DEFAULT 'daily' CHECK (email_digest IN ('realtime', 'daily', 'weekly', 'off')),
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE matchings ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter'))
);

-- Companies: owner full access, public read for active
CREATE POLICY "companies_select_public" ON companies FOR SELECT USING (verified = TRUE);
CREATE POLICY "companies_owner_all" ON companies FOR ALL USING (owner_id = auth.uid());
CREATE POLICY "companies_admin_all" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter'))
);

-- Candidates: own profile only, companies see matched candidates
CREATE POLICY "candidates_select_own" ON candidates FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "candidates_update_own" ON candidates FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "candidates_admin_all" ON candidates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter'))
);
CREATE POLICY "candidates_company_view_matched" ON candidates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM matchings m
    JOIN jobs j ON m.job_id = j.id
    JOIN companies c ON j.company_id = c.id
    WHERE m.candidate_id = candidates.id
    AND c.owner_id = auth.uid()
    AND m.status IN ('sent_to_company', 'viewed', 'interview_requested', 'accepted')
  )
);

-- Jobs: company owner manages, public reads active
CREATE POLICY "jobs_select_active" ON jobs FOR SELECT USING (status = 'active');
CREATE POLICY "jobs_company_all" ON jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM companies WHERE id = jobs.company_id AND owner_id = auth.uid())
);
CREATE POLICY "jobs_admin_all" ON jobs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter'))
);

-- Matchings: candidate sees own, company sees own jobs
CREATE POLICY "matchings_candidate_own" ON matchings FOR SELECT USING (
  EXISTS (SELECT 1 FROM candidates WHERE id = matchings.candidate_id AND profile_id = auth.uid())
);
CREATE POLICY "matchings_company_own" ON matchings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM jobs j JOIN companies c ON j.company_id = c.id
    WHERE j.id = matchings.job_id AND c.owner_id = auth.uid()
  )
);
CREATE POLICY "matchings_admin_all" ON matchings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin_master', 'admin_recruiter'))
);

-- Notifications: only own
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (recipient_id = auth.uid());

-- User preferences: only own
CREATE POLICY "preferences_own" ON user_preferences FOR ALL USING (user_id = auth.uid());

-- Activity log: admin only
CREATE POLICY "activity_admin" ON activity_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin_master')
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_candidates_updated BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_matchings_updated BEFORE UPDATE ON matchings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_interviews_updated BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_contracts_updated BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'candidate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-set data retention (90 dias LGPD)
CREATE OR REPLACE FUNCTION set_data_retention()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lgpd_consent = TRUE AND OLD.lgpd_consent IS DISTINCT FROM TRUE THEN
    NEW.data_retention_until = NOW() + INTERVAL '90 days';
    NEW.lgpd_consent_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_lgpd_retention BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_data_retention();

-- Semantic search function (matching candidatos x vagas)
CREATE OR REPLACE FUNCTION match_candidates_to_job(
  job_embedding vector(3072),
  match_threshold FLOAT DEFAULT 0.7,
  max_results INT DEFAULT 50
)
RETURNS TABLE (
  candidate_id UUID,
  candidate_name TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    p.full_name,
    1 - (c.cv_embedding <=> job_embedding) AS similarity
  FROM candidates c
  JOIN profiles p ON c.profile_id = p.id
  WHERE c.status = 'active'
    AND c.cv_embedding IS NOT NULL
    AND 1 - (c.cv_embedding <=> job_embedding) > match_threshold
  ORDER BY c.cv_embedding <=> job_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Função para links expirados 48h
CREATE OR REPLACE FUNCTION generate_share_link(p_matching_id UUID)
RETURNS TABLE (token TEXT, expires_at TIMESTAMPTZ) AS $$
DECLARE
  v_token TEXT;
  v_expires TIMESTAMPTZ;
BEGIN
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := NOW() + INTERVAL '48 hours';

  UPDATE matchings
  SET share_token = v_token, share_expires_at = v_expires
  WHERE id = p_matching_id;

  RETURN QUERY SELECT v_token, v_expires;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate share link (não expirado)
CREATE OR REPLACE FUNCTION validate_share_link(p_token TEXT)
RETURNS TABLE (
  matching_id UUID,
  job_title TEXT,
  candidate_name TEXT,
  is_valid BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    j.title,
    p.full_name,
    (m.share_expires_at > NOW()) AS is_valid
  FROM matchings m
  JOIN jobs j ON m.job_id = j.id
  JOIN candidates c ON m.candidate_id = c.id
  JOIN profiles p ON c.profile_id = p.id
  WHERE m.share_token = p_token;

  -- Marca como visualizado
  UPDATE matchings SET share_viewed_at = NOW()
  WHERE share_token = p_token AND share_viewed_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CRON JOBS (via pg_cron ou Supabase Edge Functions)
-- ============================================================

-- Cleanup: expirar links de 48h (rodar a cada hora)
-- SELECT cron.schedule('expire-share-links', '0 * * * *', $$
--   UPDATE matchings SET status = 'rejected', share_token = NULL
--   WHERE share_expires_at < NOW() AND status = 'sent_to_company';
-- $$);

-- LGPD: auto-delete dados expirados (rodar diariamente)
-- SELECT cron.schedule('lgpd-cleanup', '0 3 * * *', $$
--   DELETE FROM profiles WHERE data_retention_until < NOW();
-- $$);

-- ============================================================
-- STORAGE BUCKETS (configurar no Dashboard Supabase)
-- ============================================================

-- Criar via Dashboard ou API:
-- 1. 'cvs' — PDFs de currículos (private, 10MB max)
-- 2. 'videos' — Vídeos de entrevistas (private, 100MB max)
-- 3. 'jds' — PDFs de Job Descriptions (private, 10MB max)
-- 4. 'avatars' — Fotos de perfil (public, 5MB max)
-- 5. 'company-logos' — Logos de empresas (public, 5MB max)

-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('cvs', 'cvs', false),
--   ('videos', 'videos', false),
--   ('jds', 'jds', false),
--   ('avatars', 'avatars', true),
--   ('company-logos', 'company-logos', true);
