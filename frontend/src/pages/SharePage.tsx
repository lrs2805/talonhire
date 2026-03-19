import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShareLink } from '../hooks/useShareLink'
import { rejectMatchByToken } from '../lib/edgeFunctions'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const { validateLink, loading, error } = useShareLink()
  const [result, setResult] = useState<{
    matching_id: string
    job_title: string
    candidate_name: string
    is_valid: boolean
  } | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectDone, setRejectDone] = useState(false)

  useEffect(() => {
    if (!token) return
    validateLink(token).then(data => setResult(data ?? null))
  }, [token, validateLink])

  async function handleReject() {
    if (!token) return
    setRejectLoading(true)
    const res = await rejectMatchByToken(token, rejectReason.trim() || undefined)
    setRejectLoading(false)
    if (res.success) {
      setRejectModalOpen(false)
      setRejectDone(true)
    }
  }

  if (loading || (token && result === null && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-white font-['Orbitron'] mb-2">{t('share.title')}</h1>
          <p className="text-gray-400 mb-6">{t('share.invalid')}</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            {t('common.reload')} → Home
          </Link>
        </div>
      </div>
    )
  }

  if (result && !result.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-white font-['Orbitron'] mb-2">{t('share.title')}</h1>
          <p className="text-gray-400 mb-6">{t('share.expired')}</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            → Home
          </Link>
        </div>
      </div>
    )
  }

  if (rejectDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-white font-['Orbitron'] mb-2">{t('share.title')}</h1>
          <p className="text-gray-400 mb-6">This candidate has been marked as rejected. Thank you for your feedback.</p>
          <Link to="/" className="text-cyan-400 hover:text-cyan-300">
            → Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">{t('share.title')}</h1>
          <p className="text-gray-400 mb-6">
            {t('share.candidateFor')}: <span className="text-cyan-400 font-medium">{result?.job_title}</span>
          </p>
          <p className="text-lg text-white mb-8">
            {result?.candidate_name}
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Video and transcript can be shown here when available. For now, use the company dashboard to view full match details.
          </p>
          <div className="flex gap-4">
            <Link
              to={`/company/dashboard?matching=${result?.matching_id}`}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg text-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              {t('share.hire')}
            </Link>
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              {t('share.reject')}
            </button>
          </div>
          <p className="text-gray-500 text-sm text-center mt-6">
            <Link to="/" className="text-cyan-400 hover:text-cyan-300">TalonHire</Link>
          </p>
        </div>
      </div>

      {/* Reject modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h2 id="reject-modal-title" className="text-lg font-semibold text-white mb-2">Reject this candidate?</h2>
            <p className="text-gray-400 text-sm mb-4">Optional: add a reason (used to improve future matches).</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Seniority mismatch, different stack..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-4"
              aria-label="Rejection reason (optional)"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={rejectLoading}
                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {rejectLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
