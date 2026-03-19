import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import ParticlesBackground from '../components/ParticlesBackground'

export default function LandingPage() {
  const { t } = useTranslation()
  const [toggle, setToggle] = useState<'candidate' | 'company'>('candidate')
  const [glitch, setGlitch] = useState(false)

  const handleToggle = (value: 'candidate' | 'company') => {
    setGlitch(true)
    setToggle(value)
    setTimeout(() => setGlitch(false), 300)
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero with video-style background + particles */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden scan-lines">
        {/* Dark base */}
        <div className="absolute inset-0 bg-[#0A0A0A]" />

        {/* Futuristic video background + overlays */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        >
          <source src="https://cdn.coverr.co/videos/coverr-aerial-view-of-city-at-night-1579557436530?download=1080p" type="video/mp4" />
        </video>

        {/* Video-style gradient (futurista: grid + glow) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#0d1117] to-[#0A0A0A]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 240, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#00F0FF]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-[#39FF14]/10 blur-[120px]" />

        <ParticlesBackground density={0.8} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text-neon text-glow-cyan">
                {t('landing.hero.title')}
              </span>
            </h1>
            <p className="font-body text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4" style={{ textShadow: '0 0 20px rgba(0,240,255,0.2)' }}>
              {t('landing.hero.tagline')}
            </p>
            <p className="font-body text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-10 sm:mb-12">
              {t('landing.hero.subtitle')} Perfect matches in hours, not weeks.
            </p>
          </motion.div>

          {/* Toggle Candidato / Empresa com glitch */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <div
              className={`inline-flex p-1 rounded-xl border border-white/10 bg-white/[0.02] ${glitch ? 'animate-glitch' : ''}`}
              style={{ boxShadow: '0 0 20px rgba(0,240,255,0.1)' }}
            >
              <button
                type="button"
                onClick={() => handleToggle('candidate')}
                className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-heading font-bold text-sm sm:text-lg transition-all duration-300 ${
                  toggle === 'candidate'
                    ? 'bg-[#00F0FF] text-[#0A0A0A] shadow-[0_0_30px_#00F0FF]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('landing.hero.ctaCandidate')}
              </button>
              <button
                type="button"
                onClick={() => handleToggle('company')}
                className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-heading font-bold text-sm sm:text-lg transition-all duration-300 ${
                  toggle === 'company'
                    ? 'bg-[#39FF14] text-[#0A0A0A] shadow-[0_0_30px_#39FF14]'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {t('landing.hero.ctaCompany')}
              </button>
            </div>
            <Link
              to="/auth/signup"
              state={{ role: toggle }}
              className={`btn-cta-cyan px-8 py-4 font-heading text-lg w-full max-w-xs sm:max-w-none sm:w-auto ${toggle === 'company' ? 'btn-cta-green' : ''}`}
              style={toggle === 'company' ? { background: '#39FF14', boxShadow: '0 0 20px rgba(57,255,20,0.4)' } : undefined}
            >
              <AnimatePresence mode="wait">
                {toggle === 'candidate' ? t('landing.hero.ctaCandidate') : t('landing.hero.ctaCompany')}
              </AnimatePresence>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works - cards com hover scale + neon */}
      <section className="py-16 sm:py-24 px-4 relative bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-12 sm:mb-16 text-glow-cyan">
            {t('landing.howItWorks')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { step: '01', color: 'cyan' as const },
              { step: '02', color: 'green' as const },
              { step: '03', color: 'purple' as const },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`card-neon horizons-card-hover p-6 sm:p-8 ${item.color === 'green' ? 'card-neon-green horizons-card-hover-green' : ''}`}
              >
                <span
                  className={`font-heading text-3xl sm:text-4xl font-bold opacity-40 ${
                    item.color === 'cyan'
                      ? 'text-[#00F0FF]'
                      : item.color === 'green'
                        ? 'text-[#39FF14]'
                        : 'text-purple-400'
                  }`}
                >
                  {item.step}
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-white mt-4 mb-3">
                  {t(`landing.steps.${item.step}.title`)}
                </h3>
                <p className="font-body text-gray-400 leading-relaxed text-sm sm:text-base">
                  {t(`landing.steps.${item.step}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 px-4 border-t border-white/10 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { value: '40-60%', labelKey: 'landing.stats.savings' },
            { value: '48h', labelKey: 'landing.stats.matchTime' },
            { value: '6', labelKey: 'landing.stats.languages' },
            { value: '4', labelKey: 'landing.stats.aiModels' },
          ].map((s) => (
            <div key={s.labelKey}>
              <div className="font-heading text-2xl sm:text-3xl font-bold text-[#00F0FF] text-glow-cyan">
                {s.value}
              </div>
              <div className="font-body text-xs sm:text-sm text-gray-500 mt-1">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-6 sm:py-8 px-4 border-t border-white/10 text-center text-gray-500 font-body text-sm bg-[#0A0A0A]">
        &copy; {new Date().getFullYear()} TalonHire. AI-powered recruitment.
      </footer>
    </div>
  )
}
