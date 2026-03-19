import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Header() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isCandidate = profile?.role === 'candidate'
  const isCompany = profile?.role === 'company'
  const isAdmin = profile?.role === 'admin_master' || profile?.role === 'admin_recruiter'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/85 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`text-xl font-heading font-bold ${isCompany ? 'text-[#39FF14] text-glow-green' : 'text-[#00F0FF] text-glow-cyan'}`}>
            TalonHire
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {isCandidate && (
                <NavLink to="/candidate/dashboard">{t('nav.dashboard')}</NavLink>
              )}
              {isCompany && (
                <>
                  <NavLink to="/company/dashboard">{t('nav.dashboard')}</NavLink>
                  <NavLink to="/company/jobs/new">{t('nav.postJob')}</NavLink>
                </>
              )}
              {isAdmin && (
                <NavLink to="/admin/dashboard">{t('nav.dashboard')}</NavLink>
              )}

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-white/10">
                <span className="text-sm font-body text-gray-400 hidden lg:block">{profile?.full_name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm font-body text-gray-500 hover:text-white transition-colors"
                >
                  {t('nav.signOut')}
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/auth/login">{t('auth.signIn')}</NavLink>
              <Link
                to="/auth/signup"
                className="btn-cta-cyan px-4 py-2 font-heading rounded-lg text-sm"
              >
                {t('nav.getStarted')}
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                {isCandidate && (
                  <MobileLink to="/candidate/dashboard" onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</MobileLink>
                )}
                {isCompany && (
                  <>
                    <MobileLink to="/company/dashboard" onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</MobileLink>
                    <MobileLink to="/company/jobs/new" onClick={() => setMenuOpen(false)}>{t('nav.postJob')}</MobileLink>
                  </>
                )}
                {isAdmin && (
                  <MobileLink to="/admin/dashboard" onClick={() => setMenuOpen(false)}>{t('nav.dashboard')}</MobileLink>
                )}
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false) }}
                  className="w-full text-left text-gray-500 hover:text-white py-2 text-sm font-body"
                >
                  {t('nav.signOut')} ({profile?.full_name})
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/auth/login" onClick={() => setMenuOpen(false)}>{t('auth.signIn')}</MobileLink>
                <MobileLink to="/auth/signup" onClick={() => setMenuOpen(false)}>{t('nav.getStarted')}</MobileLink>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm font-body text-gray-400 hover:text-[#00F0FF] transition-colors">
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block font-body text-gray-300 hover:text-[#00F0FF] py-2 text-sm">
      {children}
    </Link>
  )
}
