import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isCandidate = profile?.role === 'candidate'
  const isCompany = profile?.role === 'company'
  const isAdmin = profile?.role === 'admin_master' || profile?.role === 'admin_recruiter'

  const accentColor = isCompany ? 'green' : 'cyan'

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className={`text-xl font-bold font-['Orbitron'] text-${accentColor}-400 drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]`}>
            TalonHire
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              {isCandidate && (
                <>
                  <NavLink to="/candidate/dashboard">Dashboard</NavLink>
                  <NavLink to="/candidate/matches">Matches</NavLink>
                  <NavLink to="/candidate/interviews">Interviews</NavLink>
                </>
              )}
              {isCompany && (
                <>
                  <NavLink to="/company/dashboard">Dashboard</NavLink>
                  <NavLink to="/company/jobs/new">Post Job</NavLink>
                </>
              )}
              {isAdmin && (
                <>
                  <NavLink to="/admin/dashboard">Dashboard</NavLink>
                  <NavLink to="/admin/companies">Companies</NavLink>
                  <NavLink to="/admin/candidates">Candidates</NavLink>
                </>
              )}

              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm text-gray-400 hidden lg:block">{profile?.full_name}</span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink to="/auth/login">Sign In</NavLink>
              <Link
                to="/auth/signup"
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-medium rounded-lg text-sm transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-400 hover:text-white"
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
        <div className="md:hidden border-t border-gray-800 bg-gray-950/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                {isCandidate && (
                  <>
                    <MobileLink to="/candidate/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                    <MobileLink to="/candidate/matches" onClick={() => setMenuOpen(false)}>Matches</MobileLink>
                    <MobileLink to="/candidate/interviews" onClick={() => setMenuOpen(false)}>Interviews</MobileLink>
                  </>
                )}
                {isCompany && (
                  <>
                    <MobileLink to="/company/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                    <MobileLink to="/company/jobs/new" onClick={() => setMenuOpen(false)}>Post Job</MobileLink>
                  </>
                )}
                {isAdmin && (
                  <>
                    <MobileLink to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
                    <MobileLink to="/admin/companies" onClick={() => setMenuOpen(false)}>Companies</MobileLink>
                  </>
                )}
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false) }}
                  className="w-full text-left text-gray-500 hover:text-white py-2 text-sm"
                >
                  Sign Out ({profile?.full_name})
                </button>
              </>
            ) : (
              <>
                <MobileLink to="/auth/login" onClick={() => setMenuOpen(false)}>Sign In</MobileLink>
                <MobileLink to="/auth/signup" onClick={() => setMenuOpen(false)}>Get Started</MobileLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="text-sm text-gray-400 hover:text-white transition-colors">
      {children}
    </Link>
  )
}

function MobileLink({ to, onClick, children }: { to: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link to={to} onClick={onClick} className="block text-gray-300 hover:text-white py-2 text-sm">
      {children}
    </Link>
  )
}
