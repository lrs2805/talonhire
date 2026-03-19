import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import ParticlesBackground from '../components/ParticlesBackground'

export default function LoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const profile = await signIn(email, password)
      if (profile?.role === 'company') navigate('/company/dashboard')
      else if (profile?.role === 'admin_master' || profile?.role === 'admin_recruiter') navigate('/admin/dashboard')
      else navigate('/candidate/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#0A0A0A] relative scan-lines">
      <ParticlesBackground density={0.35} />
      <div className="w-full max-w-md relative z-10">
        <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover rounded-2xl p-8">
          <h1 className="font-heading text-2xl font-bold text-white text-center mb-2 text-glow-cyan">
            {t('auth.welcomeBack')}
          </h1>
          <p className="font-body text-gray-400 text-center mb-8">{t('auth.signInToAccount')}</p>

          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-sm text-gray-400 mb-1.5 font-body">{t('auth.email')}</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/30 transition-colors"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm text-gray-400 mb-1.5 font-body">{t('auth.password')}</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:border-[#00F0FF] focus:ring-2 focus:ring-[#00F0FF]/30 transition-colors"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cta-cyan w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed font-heading font-semibold"
            >
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <p className="font-body text-gray-500 text-sm text-center mt-6">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/auth/signup" className="text-[#00F0FF] hover:text-[#00F0FF]/80">
              {t('auth.signUp')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
