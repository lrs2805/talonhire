import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { scrapeLinkedIn, generateEmbedding, type ScrapedLinkedInProfile } from '../lib/edgeFunctions'
import ParticlesBackground from '../components/ParticlesBackground'
import type { UserRole } from '../types/database'

type SignupRole = 'candidate' | 'company'

export default function SignupPage() {
  const { t } = useTranslation()
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<SignupRole>('candidate')

  useEffect(() => {
    const fromLanding = (location.state as { role?: SignupRole })?.role
    if (fromLanding === 'candidate' || fromLanding === 'company') setRole(fromLanding)
  }, [location.state])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Common fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [consent, setConsent] = useState(false)

  // Candidate fields
  const [fullName, setFullName] = useState('')
  const [locationCity, setLocationCity] = useState('')
  const [locationCountry, setLocationCountry] = useState('BR')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [linkedinImportRequested, setLinkedinImportRequested] = useState(false)
  const [linkedinImportLoading, setLinkedinImportLoading] = useState(false)
  const [linkedinFallback, setLinkedinFallback] = useState<ScrapedLinkedInProfile | null>(null)
  const [showLinkedinFallback, setShowLinkedinFallback] = useState(false)
  const [candidateIdForFallback, setCandidateIdForFallback] = useState<string | null>(null)

  // Company fields
  const [companyName, setCompanyName] = useState('')
  const [country, setCountry] = useState('PT')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!consent) {
      setError('You must agree to the LGPD/GDPR data processing terms.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const metadata = role === 'candidate'
        ? { full_name: fullName, location_city: locationCity, location_country: locationCountry }
        : { full_name: companyName, company_name: companyName, country }

      await signUp(email, password, role as UserRole, metadata)
      if (role === 'candidate' && linkedinUrl.trim() && linkedinImportRequested) {
        setLinkedinImportLoading(true)
        const { data: { user: u } } = await supabase.auth.getUser()
        if (u) {
          const { data: cand } = await supabase.from('candidates').select('id').eq('profile_id', u.id).single()
          if (cand) {
            setCandidateIdForFallback(cand.id)
            const res = await scrapeLinkedIn(linkedinUrl.trim(), cand.id)
            if (res.success) {
              const text = res.embeddingText || res.plainText || ''
              if (text) await generateEmbedding('cv', cand.id, text)
              setLinkedinImportLoading(false)
              navigate('/candidate/dashboard', { state: { linkedin_url: linkedinUrl.trim() } })
              return
            }
            setLinkedinImportLoading(false)
            if (res.data) {
              setLinkedinFallback(res.data)
              setShowLinkedinFallback(true)
              setError(res.error || 'LinkedIn import partially failed. Review and save fields manually.')
              return
            }
            setError(res.error || 'LinkedIn import failed.')
          }
        }
        setLinkedinImportLoading(false)
        navigate('/candidate/dashboard', { state: { linkedin_url: linkedinUrl.trim() } })
      } else {
        navigate(role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-[#0A0A0A] relative scan-lines">
      <ParticlesBackground density={0.35} />
      <div className="w-full max-w-md relative z-10">
        <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover rounded-2xl p-6 sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-white text-center mb-2 text-glow-cyan">
            {t('auth.join')}
          </h1>
          <p className="font-body text-gray-400 text-center mb-6">{t('auth.createAccount')}</p>

          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex-1 py-3 rounded-xl font-heading font-medium transition-all ${
                role === 'candidate'
                  ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                  : 'bg-[#0A0A0A]/80 text-gray-500 border border-white/10 hover:border-white/20'
              }`}
            >
              {t('auth.candidate')}
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex-1 py-3 rounded-xl font-heading font-medium transition-all ${
                role === 'company'
                  ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/40 shadow-[0_0_20px_rgba(57,255,20,0.2)]'
                  : 'bg-[#0A0A0A]/80 text-gray-500 border border-white/10 hover:border-white/20'
              }`}
            >
              {t('auth.company')}
            </button>
          </div>

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role-specific fields */}
            {role === 'candidate' ? (
              <>
                <Field id="signup-fullName" label={t('auth.fullName')} value={fullName} onChange={setFullName} placeholder="João Silva" required />
                <Field id="signup-linkedin" label="Cole seu LinkedIn (opcional)" value={linkedinUrl} onChange={setLinkedinUrl} placeholder="linkedin.com/in/seu-usuario" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!linkedinUrl.trim()}
                    onClick={() => setLinkedinImportRequested(true)}
                    className={`btn-cta-cyan px-4 py-2 text-xs sm:text-sm font-heading disabled:opacity-50 ${linkedinImportRequested ? 'ring-2 ring-[#00F0FF]/40' : ''} ${linkedinImportLoading ? 'animate-pulse' : ''}`}
                  >
                    {linkedinImportLoading ? 'Importando com IA...' : 'Importar Perfil com IA'}
                  </button>
                  <span className="font-body text-xs text-gray-500">
                    {linkedinImportRequested ? 'Será importado automaticamente após criar a conta.' : 'Opcional'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="signup-city" label={t('auth.city')} value={locationCity} onChange={setLocationCity} placeholder="São Paulo" />
                  <div>
                    <label htmlFor="signup-country" className="block text-sm text-gray-400 mb-1.5 font-body">{t('auth.country')}</label>
                    <select
                      id="signup-country"
                      value={locationCountry}
                      onChange={e => setLocationCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20"
                    >
                      <option value="BR">Brazil</option>
                      <option value="AR">Argentina</option>
                      <option value="CO">Colombia</option>
                      <option value="MX">Mexico</option>
                      <option value="CL">Chile</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Field id="signup-companyName" label={t('auth.companyName')} value={companyName} onChange={setCompanyName} placeholder="Acme Tech" required />
                <div>
                  <label htmlFor="signup-company-country" className="block text-sm text-gray-400 mb-1.5 font-body">{t('auth.country')}</label>
                  <select
                    id="signup-company-country"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
                  >
                    <option value="PT">Portugal</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="US">USA</option>
                    <option value="UK">UK</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <Field id="signup-email" label={t('auth.email')} type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <Field id="signup-password" label={t('auth.password')} type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" required minLength={6} />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#00F0FF]"
              />
              <span className="text-xs text-gray-400 leading-relaxed font-body">{t('auth.consent')}</span>
            </label>

            <button
              type="submit"
              disabled={loading || linkedinImportLoading || !consent}
              className={`w-full py-3 font-heading font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                role === 'candidate' ? 'btn-cta-cyan' : 'btn-cta-green'
              }`}
            >
              {loading || linkedinImportLoading ? t('auth.creating') : t('auth.createAccountButton')}
            </button>
          </form>

          {showLinkedinFallback && linkedinFallback && (
            <div className="mt-5 p-4 rounded-xl border border-white/10 bg-[#0A0A0A]/60">
              <p className="font-heading text-sm text-white mb-3">Fallback manual do LinkedIn</p>
              <div className="space-y-3">
                <Field id="li-fb-name" label="Nome" value={linkedinFallback.name ?? ''} onChange={(v) => setLinkedinFallback((p) => p ? { ...p, name: v } : null)} />
                <Field id="li-fb-headline" label="Headline" value={linkedinFallback.headline ?? ''} onChange={(v) => setLinkedinFallback((p) => p ? { ...p, headline: v } : null)} />
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-body">Sobre</label>
                  <textarea value={linkedinFallback.about ?? ''} onChange={(e) => setLinkedinFallback((p) => p ? { ...p, about: e.target.value } : null)} rows={3} className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5 font-body">Localização</label>
                  <input value={linkedinFallback.location ?? ''} onChange={(e) => setLinkedinFallback((p) => p ? { ...p, location: e.target.value } : null)} className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition-colors" />
                </div>
                <button
                  type="button"
                  className="btn-cta-cyan px-4 py-2 font-heading text-sm"
                  onClick={async () => {
                    if (!candidateIdForFallback || !linkedinFallback) return
                    const text = [
                      linkedinFallback.name,
                      linkedinFallback.headline,
                      linkedinFallback.location ? `Location: ${linkedinFallback.location}` : '',
                      linkedinFallback.about,
                      ...(linkedinFallback.experience || []).map((e) => [e.title, e.company, e.dates, e.description].filter(Boolean).join(' — ')),
                      linkedinFallback.skills?.length ? `Skills: ${linkedinFallback.skills.join(', ')}` : '',
                      ...(linkedinFallback.education || []).map((e) => [e.school, e.degree, e.dates, e.description].filter(Boolean).join(' — ')),
                      ...(linkedinFallback.projects || []).map((p) => [p.name, p.description, p.url].filter(Boolean).join(' — ')),
                    ].filter(Boolean).join('\n\n')
                    await supabase.from('candidates').update({
                      cv_text: text.slice(0, 50000),
                      linkedin_raw_json: linkedinFallback as unknown as Record<string, unknown>,
                      linkedin_scraped_at: new Date().toISOString(),
                      profile_scraped: true,
                      updated_at: new Date().toISOString(),
                    }).eq('id', candidateIdForFallback)
                    await generateEmbedding('cv', candidateIdForFallback, text)
                    navigate('/candidate/dashboard', { state: { linkedin_url: linkedinUrl.trim() } })
                  }}
                >
                  Salvar fallback e continuar
                </button>
              </div>
            </div>
          )}

          <p className="font-body text-gray-500 text-sm text-center mt-6">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/auth/login" className="text-[#00F0FF] hover:text-[#00F0FF]/80 font-body">
              {t('auth.signIn')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Field({
  id, label, type = 'text', value, onChange, placeholder, required, minLength,
}: {
  id: string; label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; minLength?: number
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-gray-400 mb-1.5 font-body">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/20 transition-colors"
        placeholder={placeholder}
        aria-required={required}
      />
    </div>
  )
}
