import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types/database'

type SignupRole = 'candidate' | 'company'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState<SignupRole>('candidate')
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
      navigate(role === 'candidate' ? '/candidate/dashboard' : '/company/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white font-['Orbitron'] text-center mb-2">
            Join TalonHire
          </h1>
          <p className="text-gray-400 text-center mb-6">Create your account</p>

          {/* Role Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('candidate')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === 'candidate'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-gray-900/50 text-gray-500 border border-gray-700 hover:border-gray-600'
              }`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('company')}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === 'company'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-gray-900/50 text-gray-500 border border-gray-700 hover:border-gray-600'
              }`}
            >
              Company
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role-specific fields */}
            {role === 'candidate' ? (
              <>
                <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="João Silva" required />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="City" value={locationCity} onChange={setLocationCity} placeholder="São Paulo" />
                  <div>
                    <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                    <select
                      value={locationCountry}
                      onChange={e => setLocationCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
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
                <Field label="Company Name" value={companyName} onChange={setCompanyName} placeholder="Acme Tech" required />
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Country</label>
                  <select
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
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

            {/* Common fields */}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 6 characters" required minLength={6} />

            {/* LGPD/GDPR Consent */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-1 w-4 h-4 accent-cyan-500"
              />
              <span className="text-xs text-gray-400 leading-relaxed">
                I authorize TalonHire to store and process my personal data for recruitment purposes for up to 90 days, in compliance with LGPD and GDPR regulations. I can request deletion at any time.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !consent}
              className={`w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                role === 'candidate'
                  ? 'bg-cyan-500 hover:bg-cyan-600 text-black'
                  : 'bg-green-500 hover:bg-green-600 text-black'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-cyan-400 hover:text-cyan-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({
  label, type = 'text', value, onChange, placeholder, required, minLength,
}: {
  label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; minLength?: number
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
        placeholder={placeholder}
      />
    </div>
  )
}
