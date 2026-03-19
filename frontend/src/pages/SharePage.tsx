import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useShareLink } from '../hooks/useShareLink'
import { rejectMatchByToken, fetchShareMatchMedia } from '../lib/edgeFunctions'
import LoadingSpinner from '../components/LoadingSpinner'
import ParticlesBackground from '../components/ParticlesBackground'

export default function SharePage() {
  const { token } = useParams<{ token: string }>()
  const { t } = useTranslation()
  const { validateLink, loading, error } = useShareLink()
  const [result, setResult] = useState<{ matching_id: string; job_title: string; candidate_name: string; is_valid: boolean } | null>(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectLoading, setRejectLoading] = useState(false)
  const [rejectDone, setRejectDone] = useState(false)
  const [media, setMedia] = useState<{
    video_signed_url: string | null
    transcript_original: string | null
    translations: Record<string, string> | null
  } | null>(null)
  const [langTab, setLangTab] = useState<'original' | 'en' | 'es' | 'fr' | 'it' | 'de'>('en')

  useEffect(() => {
    if (!token) return
    validateLink(token).then(data => setResult(data ?? null))
  }, [token, validateLink])

  useEffect(() => {
    if (!token || !result?.is_valid) return
    fetchShareMatchMedia(token).then((r) => {
      if (!r.error) {
        setMedia({
          video_signed_url: r.video_signed_url ?? null,
          transcript_original: r.transcript_original ?? null,
          translations: r.translations ?? null,
        })
      }
    })
  }, [token, result?.is_valid])

  async function handleReject() {
    if (!token) return
    setRejectLoading(true)
    const res = await rejectMatchByToken(token, rejectReason.trim() || undefined)
    setRejectLoading(false)
    if (res.success) { setRejectModalOpen(false); setRejectDone(true) }
  }

  if (loading || (token && result === null && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="card-neon horizons-card-hover p-6 sm:p-8 max-w-md text-center">
          <h1 className="font-heading text-xl font-bold text-white text-glow-cyan mb-2">{t('share.title')}</h1>
          <p className="font-body text-gray-400 mb-6">{t('share.invalid')}</p>
          <Link to="/" className="text-[#00F0FF] hover:text-[#00F0FF]/80 font-body">
            {t('common.reload')} → Home
          </Link>
        </div>
      </div>
    )
  }

  if (result && !result.is_valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="card-neon horizons-card-hover p-6 sm:p-8 max-w-md text-center">
          <h1 className="font-heading text-xl font-bold text-white mb-2">{t('share.title')}</h1>
          <p className="font-body text-gray-400 mb-6">{t('share.expired')}</p>
          <Link to="/" className="text-[#00F0FF] hover:text-[#00F0FF]/80">→ Home</Link>
        </div>
      </div>
    )
  }

  if (rejectDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
        <div className="card-neon horizons-card-hover p-6 sm:p-8 max-w-md text-center">
          <h1 className="font-heading text-xl font-bold text-white mb-2">{t('share.title')}</h1>
          <p className="font-body text-gray-400 mb-6">This candidate has been marked as rejected. Thank you for your feedback.</p>
          <Link to="/" className="text-[#00F0FF] hover:text-[#00F0FF]/80">→ Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative px-4 py-8 sm:py-12">
      <ParticlesBackground density={0.4} />
      <div className="relative z-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileHover={{ scale: 1.05 }} animate={{ opacity: 1, y: 0 }} className="card-neon horizons-card-hover card-neon-green horizons-card-hover-green p-6 sm:p-8">
          <h1 className="font-heading text-2xl font-bold text-white text-glow-green mb-2">{t('share.title')}</h1>
          <p className="font-body text-gray-400 mb-6">
            {t('share.candidateFor')}: <span className="text-[#00F0FF] font-medium">{result?.job_title}</span>
          </p>
          <p className="font-heading text-lg sm:text-xl text-white mb-6">{result?.candidate_name}</p>

          {media?.video_signed_url && (
            <div className="mb-6 rounded-xl overflow-hidden border border-white/10 bg-black">
              <video src={media.video_signed_url} controls className="w-full max-h-[360px]" playsInline />
              <p className="font-body text-xs text-gray-500 px-3 py-2">Signed URL expires in ~1h. Regenerate share link if needed.</p>
            </div>
          )}

          {(media?.transcript_original || media?.translations) && (
            <div className="mb-8">
              <h2 className="font-heading text-sm text-[#00F0FF] mb-2">Transcript</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {(['original', 'en', 'es', 'fr', 'it', 'de'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setLangTab(k)}
                    className={`px-3 py-1 rounded-lg text-xs font-heading uppercase ${
                      langTab === k ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40' : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {k === 'original' ? 'Original' : k}
                  </button>
                ))}
              </div>
              <div className="font-body text-sm text-gray-300 bg-[#0A0A0A]/80 border border-white/10 rounded-lg p-4 max-h-64 overflow-y-auto whitespace-pre-wrap">
                {langTab === 'original' && (media.transcript_original || '—')}
                {langTab !== 'original' && (media.translations?.[langTab] || '—')}
              </div>
            </div>
          )}

          {!media?.video_signed_url && !media?.transcript_original && (
            <p className="font-body text-sm text-gray-500 mb-8">
              Video / transcript not available yet — candidate may still need to record, or link preview will update after upload.
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              to={`/company/dashboard?matching=${result?.matching_id}`}
              className="btn-cta-green flex-1 py-3 font-heading text-center text-sm sm:text-base"
            >
              Aprovar
            </Link>
            <button
              type="button"
              onClick={() => setRejectModalOpen(true)}
              className="flex-1 py-3 border border-white/20 text-gray-300 font-heading font-semibold rounded-xl hover:bg-white/5 hover:border-red-500/30 transition-all text-sm sm:text-base"
            >
              Rejeitar
            </button>
          </div>
          <p className="font-body text-gray-500 text-sm text-center mt-6">
            <Link to="/" className="text-[#00F0FF] hover:text-[#00F0FF]/80">TalonHire</Link>
          </p>
        </motion.div>
      </div>

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileHover={{ scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="card-neon horizons-card-hover p-6 max-w-md w-full">
            <h2 id="reject-modal-title" className="font-heading text-lg font-semibold text-white mb-2">Reject this candidate?</h2>
            <p className="font-body text-gray-400 text-sm mb-4">Optional: add a reason (used to improve future matches).</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Seniority mismatch, different stack..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-gray-500 font-body focus:outline-none focus:ring-2 focus:ring-[#00F0FF] focus:border-[#00F0FF]/50 mb-4"
              aria-label="Rejection reason (optional)"
            />
            <div className="flex gap-3">
              <button type="button" onClick={() => setRejectModalOpen(false)} className="flex-1 py-2 border border-white/20 text-gray-300 font-body rounded-lg hover:bg-white/5">
                Cancel
              </button>
              <button type="button" onClick={handleReject} disabled={rejectLoading} className="flex-1 py-2 bg-red-500/20 text-red-400 font-body rounded-lg hover:bg-red-500/30 disabled:opacity-50">
                {rejectLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
