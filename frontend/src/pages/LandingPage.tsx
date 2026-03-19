import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold font-['Orbitron'] mb-6">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-green-400 bg-clip-text text-transparent">
                {t('landing.hero.title')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4 font-['Rajdhani']">
              {t('landing.hero.tagline')}
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              {t('landing.hero.subtitle')} Perfect matches in hours, not weeks.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-black font-bold rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(0,217,255,0.3)]"
            >
              {t('landing.hero.ctaCandidate')}
            </Link>
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]"
            >
              {t('landing.hero.ctaCompany')}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white font-['Orbitron'] mb-16">
            {t('landing.howItWorks')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-colors"
              >
                <span
                  className={`text-4xl font-bold font-['Orbitron'] opacity-30 ${
                    item.color === 'cyan'
                      ? 'text-cyan-400'
                      : item.color === 'green'
                        ? 'text-green-400'
                        : 'text-purple-400'
                  }`}
                >
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">{t(`landing.steps.${item.step}.title`)}</h3>
                <p className="text-gray-400 leading-relaxed">{t(`landing.steps.${item.step}.desc`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '40-60%', labelKey: 'landing.stats.savings' },
            { value: '48h', labelKey: 'landing.stats.matchTime' },
            { value: '6', labelKey: 'landing.stats.languages' },
            { value: '4', labelKey: 'landing.stats.aiModels' },
          ].map(s => (
            <div key={s.labelKey}>
              <div className="text-3xl font-bold text-cyan-400 font-['Orbitron']">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-800 text-center text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} TalonHire. AI-powered recruitment.
      </footer>
    </div>
  )
}
