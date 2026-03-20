import { useEffect, useState, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useMatches } from '../hooks/useMatches'
import { generateEmbedding, scrapeLinkedIn, type ScrapedLinkedInProfile } from '../lib/edgeFunctions'
import ParticlesBackground from '../components/ParticlesBackground'
import type { Candidate, Contract, Interview } from '../types/database'

interface DashboardStats {
  activeMatches: number
  pendingInterviews: number
  recordedVideos: number
}

export default function CandidateDashboard() {
  const { user, profile } = useAuth()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ activeMatches: 0, pendingInterviews: 0, recordedVideos: 0 })
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([])
  const [pendingContracts, setPendingContracts] = useState<Contract[]>([])

  useEffect(() => {
    if (!user) return
    supabase.from('candidates').select('*').eq('profile_id', user.id).single().then(({ data }) => { if (data) setCandidate(data) })
  }, [user])

  const { matches, loading: matchesLoading } = useMatches({
    candidateId: candidate?.id,
    status: ['pending', 'sent_to_company', 'viewed', 'interview_requested', 'accepted'],
  })

  const [embeddingLoading, setEmbeddingLoading] = useState(false)
  const [embeddingMessage, setEmbeddingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const runEmbedding = useCallback(async () => {
    if (!candidate?.id || !candidate?.cv_text) {
      setEmbeddingMessage({ type: 'error', text: 'Add CV text first (e.g. paste or extract from PDF).' })
      return
    }
    setEmbeddingLoading(true)
    setEmbeddingMessage(null)
    const result = await generateEmbedding('cv', candidate.id, candidate.cv_text)
    setEmbeddingLoading(false)
    if (result.success) setEmbeddingMessage({ type: 'success', text: 'AI profile updated. You will appear in more matches.' })
    else setEmbeddingMessage({ type: 'error', text: result.error || 'Failed to update.' })
  }, [candidate?.id, candidate?.cv_text])

  const location = useLocation()
  const [linkedinInput, setLinkedinInput] = useState('')
  const [scrapeLoading, setScrapeLoading] = useState(false)
  const [scrapeMessage, setScrapeMessage] = useState<{ type: 'success' | 'error' | 'partial'; text: string } | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedLinkedInProfile | null>(null)
  const [showFallbackForm, setShowFallbackForm] = useState(false)

  useEffect(() => {
    const state = location.state as { linkedin_url?: string } | null
    if (state?.linkedin_url) setLinkedinInput(state.linkedin_url)
  }, [location.state])

  const runScrapeLinkedIn = useCallback(async () => {
    if (!candidate?.id || !linkedinInput.trim()) {
      setScrapeMessage({ type: 'error', text: 'Enter your LinkedIn profile URL.' })
      return
    }
    setScrapeLoading(true)
    setScrapeMessage(null)
    setScrapedData(null)
    setShowFallbackForm(false)
    const result = await scrapeLinkedIn(linkedinInput.trim(), candidate.id)
    setScrapeLoading(false)
    if (result.success) {
      const { data: c } = await supabase.from('candidates').select('*').eq('id', candidate.id).single()
      if (c) setCandidate(c)
      if (result.embeddingText) {
        setEmbeddingLoading(true)
        const emb = await generateEmbedding('cv', candidate.id, result.embeddingText)
        setEmbeddingLoading(false)
        if (emb.success) setEmbeddingMessage({ type: 'success', text: 'Profile imported and AI updated.' })
      }
      setScrapeMessage({
        type: result.partial ? 'partial' : 'success',
        text: result.partial ? 'Partially imported (LinkedIn may require login). Review and save below if needed.' : 'LinkedIn profile imported. AI profile updated.',
      })
      if (result.partial && result.data) {
        setScrapedData(result.data)
        setShowFallbackForm(true)
      }
    } else {
      setScrapeMessage({ type: 'error', text: result.error || 'Import failed.' })
      if (result.data) {
        setScrapedData(result.data)
        setShowFallbackForm(true)
      }
    }
  }, [candidate?.id, linkedinInput])

  const refetchCandidate = useCallback(() => {
    if (!user) return
    supabase.from('candidates').select('*').eq('profile_id', user.id).single().then(({ data }) => { if (data) setCandidate(data) })
  }, [user])

  useEffect(() => {
    if (!candidate) return
    Promise.all([
      supabase.from('matchings').select('id', { count: 'exact' }).eq('candidate_id', candidate.id).in('status', ['pending', 'sent_to_company', 'viewed', 'interview_requested', 'accepted']).limit(0),
      supabase.from('interviews').select('id', { count: 'exact' }).eq('candidate_id', candidate.id).in('status', ['pending', 'questions_sent']).limit(0),
      supabase.from('interviews').select('id', { count: 'exact' }).eq('candidate_id', candidate.id).not('video_url', 'is', null).limit(0),
      supabase.from('interviews').select('*').eq('candidate_id', candidate.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([matchRes, interviewRes, videoRes, recentRes]) => {
      setStats({ activeMatches: matchRes.count || 0, pendingInterviews: interviewRes.count || 0, recordedVideos: videoRes.count || 0 })
      if (recentRes.data) setRecentInterviews(recentRes.data)
    })
  }, [candidate])

  useEffect(() => {
    if (!candidate?.id) {
      setPendingContracts([])
      return
    }
    void supabase
      .from('contracts')
      .select('*')
      .eq('candidate_id', candidate.id)
      .is('candidate_signed_at', null)
      .not('status', 'eq', 'cancelled')
      .not('status', 'eq', 'completed')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setPendingContracts((data ?? []) as Contract[])
      })
  }, [candidate?.id])

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <ParticlesBackground density={0.4} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white text-glow-cyan">
            Welcome, {profile?.full_name || 'Candidate'}
          </h1>
          <p className="font-body text-gray-400 mt-1 text-sm sm:text-base">
            {candidate?.status === 'active' ? 'Your profile is active and visible to companies.' : 'Complete your profile to start receiving matches.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { title: 'Active Matches', value: stats.activeMatches, color: 'cyan', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { title: 'Pending Interviews', value: stats.pendingInterviews, color: 'green', icon: 'M15 10l4.553-2.276A1 1 0 0021 6.618V17.382a1 1 0 01-1.447.894L15 16M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
            { title: 'Recorded Videos', value: stats.recordedVideos, color: 'purple', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z' },
          ].map((s) => (
            <motion.div key={s.title} whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-xs sm:text-sm text-gray-400">{s.title}</p>
                  <p className={`font-heading text-2xl sm:text-3xl font-bold mt-1 ${s.color === 'cyan' ? 'text-[#00F0FF] text-glow-cyan' : s.color === 'green' ? 'text-[#39FF14] text-glow-green' : 'text-purple-400'}`}>{s.value}</p>
                </div>
                <svg className="w-8 h-8 sm:w-10 sm:h-10 opacity-40 text-[#00F0FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={s.icon} /></svg>
              </div>
            </motion.div>
          ))}
        </div>

        {pendingContracts.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-4 text-glow-green">Contratos por assinar</h2>
            <p className="font-body text-sm text-gray-400 mb-3">
              Assinatura eletrónica (DIY) no Supabase — hash e registo de prova. Completa quando estiveres pronto.
            </p>
            <div className="space-y-3">
              {pendingContracts.map((c) => (
                <motion.div
                  key={c.id}
                  whileHover={{ scale: 1.02 }}
                  className="card-neon horizons-card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div>
                    <p className="font-heading text-white text-sm sm:text-base">
                      {c.contract_type === 'fee_15pct' ? 'Fee 15%' : 'Prestação de serviço (markup)'}
                    </p>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      Empresa: {c.company_signed_at ? '✓ já assinou' : 'aguarda assinatura'} • ID: {c.id.slice(0, 8)}
                    </p>
                  </div>
                  <Link
                    to={`/contract/sign/${c.id}`}
                    className="btn-cta-green px-4 py-2 font-heading text-sm text-center inline-block shrink-0"
                  >
                    Assinar contrato
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {candidate && (
          <>
            <LinkedInImport
              candidateId={candidate.id}
              linkedinInput={linkedinInput}
              setLinkedinInput={setLinkedinInput}
              scrapeLoading={scrapeLoading}
              scrapeMessage={scrapeMessage}
              onScrape={runScrapeLinkedIn}
              scrapedData={scrapedData}
              showFallbackForm={showFallbackForm}
              setShowFallbackForm={setShowFallbackForm}
              onSaved={refetchCandidate}
            />
            <ProfileCompletion candidate={candidate} />
            {(candidate.cv_text || candidate.cv_url) && (
              <motion.div layout whileHover={{ scale: 1.05 }} className="mt-4 card-neon horizons-card-hover p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="font-body text-gray-300 text-sm">Update your AI profile so you appear in job matches.</p>
                <button
                  type="button"
                  onClick={runEmbedding}
                  disabled={embeddingLoading || !candidate.cv_text}
                  className="btn-cta-cyan px-4 py-2 font-heading text-sm disabled:opacity-50 shrink-0"
                >
                  {embeddingLoading ? 'Updating...' : 'Update AI profile'}
                </button>
              </motion.div>
            )}
            {embeddingMessage && (
              <div role="alert" className={`mt-2 px-4 py-2 rounded-lg text-sm font-body ${embeddingMessage.type === 'success' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {embeddingMessage.text}
              </div>
            )}
          </>
        )}

        <div className="mt-6 sm:mt-8">
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-4 text-glow-cyan">Recent Matches</h2>
          {matchesLoading ? (
            <div className="font-body text-gray-400">Loading matches...</div>
          ) : matches.length === 0 ? (
            <div className="card-neon horizons-card-hover p-6 sm:p-8 text-center">
              <p className="font-body text-gray-400 text-sm sm:text-base">No matches yet. Complete your profile and upload your CV to start receiving AI-powered matches.</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {matches.map((match) => (
                <motion.div
                  key={match.id}
                  whileHover={{ scale: 1.05 }}
                  className="card-neon horizons-card-hover p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h3 className="font-heading text-white font-medium truncate">{match.job?.title || 'Unknown Position'}</h3>
                    <div className="flex flex-wrap gap-2 mt-1 text-xs sm:text-sm text-gray-400 font-body">
                      <span>{match.job?.seniority}</span>
                      {match.job?.remote && <span className="text-[#39FF14]">Remote</span>}
                      {match.job?.salary_min != null && match.job?.salary_max != null && (
                        <span>{match.job.salary_min}-{match.job.salary_max} EUR</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-heading text-xl sm:text-2xl font-bold text-[#00F0FF] text-glow-cyan">{Math.round(match.score_overall)}%</span>
                    <Link
                      to={`/candidate/interview/${match.id}`}
                      className="btn-cta-cyan px-4 py-2 font-heading text-xs sm:text-sm"
                    >
                      Gravar Vídeo Match
                    </Link>
                    <span className="font-body text-xs text-gray-500 capitalize">{match.status.replace('_', ' ')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LinkedInImport({
  candidateId,
  linkedinInput,
  setLinkedinInput,
  scrapeLoading,
  scrapeMessage,
  onScrape,
  scrapedData,
  showFallbackForm,
  setShowFallbackForm,
  onSaved,
}: {
  candidateId: string
  linkedinInput: string
  setLinkedinInput: (v: string) => void
  scrapeLoading: boolean
  scrapeMessage: { type: 'success' | 'error' | 'partial'; text: string } | null
  onScrape: () => void
  scrapedData: ScrapedLinkedInProfile | null
  showFallbackForm: boolean
  setShowFallbackForm: (v: boolean) => void
  onSaved: () => void
}) {
  const { user } = useAuth()
  const [fallbackSaving, setFallbackSaving] = useState(false)
  const [fallbackForm, setFallbackForm] = useState<ScrapedLinkedInProfile | null>(null)

  useEffect(() => {
    if (scrapedData) setFallbackForm(JSON.parse(JSON.stringify(scrapedData)))
  }, [scrapedData])

  function buildCvTextFromProfile(p: ScrapedLinkedInProfile): string {
    const parts: string[] = []
    if (p.name) parts.push(p.name)
    if (p.headline) parts.push(p.headline)
    if (p.location) parts.push(`Location: ${p.location}`)
    if (p.about) parts.push(p.about)
    p.experience.forEach((e) => parts.push([e.title, e.company, e.dates, e.description].filter(Boolean).join(' — ')))
    if (p.skills.length) parts.push('Skills: ' + p.skills.join(', '))
    p.education.forEach((e) => parts.push([e.school, e.degree, e.dates, e.description].filter(Boolean).join(' — ')))
    p.projects.forEach((p) => parts.push([p.name, p.description, p.url].filter(Boolean).join(' — ')))
    return parts.filter(Boolean).join('\n\n').slice(0, 50000)
  }

  async function handleSaveFallback() {
    if (!fallbackForm) return
    setFallbackSaving(true)
    const cvText = buildCvTextFromProfile(fallbackForm)
    await supabase
      .from('candidates')
      .update({ cv_text: cvText || null, updated_at: new Date().toISOString() })
      .eq('id', candidateId)
    if (fallbackForm.name && user?.id) {
      await supabase.from('profiles').update({ full_name: fallbackForm.name }).eq('id', user.id)
    }
    if (cvText) await generateEmbedding('cv', candidateId, cvText)
    setFallbackSaving(false)
    setShowFallbackForm(false)
    onSaved()
  }

  return (
    <motion.div layout whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover p-4 sm:p-6 mb-4">
      <h3 className="font-heading text-white font-medium mb-3">Importar Perfil LinkedIn</h3>
      <p className="font-body text-gray-400 text-sm mb-3">Cole seu LinkedIn (ex: linkedin.com/in/seu-usuario) para extrair nome, experiência, skills e educação.</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <input
          type="url"
          value={linkedinInput}
          onChange={(e) => setLinkedinInput(e.target.value)}
          placeholder="linkedin.com/in/..."
          className="flex-1 px-4 py-2.5 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20"
        />
        <button
          type="button"
          onClick={onScrape}
          disabled={scrapeLoading || !linkedinInput.trim()}
          className={`btn-cta-cyan px-4 py-2.5 font-heading text-sm shrink-0 disabled:opacity-50 ${scrapeLoading ? 'animate-pulse' : ''}`}
        >
          {scrapeLoading ? 'Importando com IA...' : 'Importar Perfil com IA'}
        </button>
      </div>
      {scrapeMessage && (
        <div
          role="alert"
          className={`mt-3 px-4 py-2 rounded-lg text-sm font-body ${
            scrapeMessage.type === 'success' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' :
            scrapeMessage.type === 'partial' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {scrapeMessage.text}
        </div>
      )}
      {showFallbackForm && fallbackForm && (
        <div className="mt-4 p-4 rounded-xl border border-white/10 bg-[#0A0A0A]/50">
          <h4 className="font-heading text-white text-sm mb-3">Revisar dados extraídos (edite e salve)</h4>
          <div className="space-y-3 text-sm">
            <div>
              <label className="font-body text-gray-400 block mb-1">Nome</label>
              <input value={fallbackForm.name ?? ''} onChange={(e) => setFallbackForm((p) => p ? { ...p, name: e.target.value } : null)} className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body" />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Headline</label>
              <input value={fallbackForm.headline ?? ''} onChange={(e) => setFallbackForm((p) => p ? { ...p, headline: e.target.value } : null)} className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body" />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Sobre</label>
              <textarea value={fallbackForm.about ?? ''} onChange={(e) => setFallbackForm((p) => p ? { ...p, about: e.target.value } : null)} rows={3} className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body resize-none" />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Skills (separadas por vírgula)</label>
              <input value={(fallbackForm.skills || []).join(', ')} onChange={(e) => setFallbackForm((p) => p ? { ...p, skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } : null)} className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body" />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Localização</label>
              <input value={fallbackForm.location ?? ''} onChange={(e) => setFallbackForm((p) => p ? { ...p, location: e.target.value } : null)} className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body" />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Experiência (uma por linha)</label>
              <textarea
                value={(fallbackForm.experience || []).map((e) => [e.title, e.company, e.dates, e.description].filter(Boolean).join(' — ')).join('\n')}
                onChange={(e) =>
                  setFallbackForm((p) =>
                    p
                      ? {
                          ...p,
                          experience: e.target.value
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => ({ description: line })),
                        }
                      : null
                  )
                }
                rows={4}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body resize-none"
              />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Educação (uma por linha)</label>
              <textarea
                value={(fallbackForm.education || []).map((e) => [e.school, e.degree, e.dates, e.description].filter(Boolean).join(' — ')).join('\n')}
                onChange={(e) =>
                  setFallbackForm((p) =>
                    p
                      ? {
                          ...p,
                          education: e.target.value
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => ({ description: line })),
                        }
                      : null
                  )
                }
                rows={3}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body resize-none"
              />
            </div>
            <div>
              <label className="font-body text-gray-400 block mb-1">Projetos (uma por linha)</label>
              <textarea
                value={(fallbackForm.projects || []).map((p) => [p.name, p.description, p.url].filter(Boolean).join(' — ')).join('\n')}
                onChange={(e) =>
                  setFallbackForm((p) =>
                    p
                      ? {
                          ...p,
                          projects: e.target.value
                            .split('\n')
                            .map((line) => line.trim())
                            .filter(Boolean)
                            .map((line) => ({ description: line })),
                        }
                      : null
                  )
                }
                rows={3}
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-white/10 rounded text-white font-body resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={handleSaveFallback} disabled={fallbackSaving} className="btn-cta-cyan px-4 py-2 font-heading text-sm disabled:opacity-50">
              {fallbackSaving ? 'Salvando...' : 'Salvar e atualizar AI'}
            </button>
            <button type="button" onClick={() => setShowFallbackForm(false)} className="px-4 py-2 border border-white/20 text-gray-400 font-body text-sm rounded-lg hover:bg-white/5">
              Fechar
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

function ProfileCompletion({ candidate }: { candidate: Candidate }) {
  const steps = [
    { label: 'LinkedIn', done: !!candidate.linkedin_url },
    { label: 'CV Upload', done: !!candidate.cv_url },
    { label: 'Tech Stack', done: candidate.tech_stack.length > 0 },
    { label: 'Intro Video', done: !!candidate.intro_video_url },
    { label: 'Salary Range', done: !!candidate.salary_expectation_min },
  ]
  const completed = steps.filter((s) => s.done).length
  const pct = Math.round((completed / steps.length) * 100)
  if (pct === 100) return null

  return (
    <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-white font-medium">Profile Completion</h3>
        <span className="font-heading text-[#00F0FF] font-bold text-glow-cyan">{pct}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mb-4">
        <motion.div className="h-2 rounded-full bg-[#00F0FF]" style={{ width: `${pct}%`, boxShadow: '0 0 15px rgba(0,240,255,0.5)' }} transition={{ duration: 0.5 }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((step) => (
          <span key={step.label} className={`px-3 py-1 rounded-full text-xs font-body ${step.done ? 'bg-[#00F0FF]/20 text-[#00F0FF]' : 'bg-white/10 text-gray-500'}`}>
            {step.done ? '✓' : '○'} {step.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
