import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background glow effects */}
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
                TalonHire
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-4 font-['Rajdhani']">
              AI-powered recruitment that captures the perfect talent with surgical precision.
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              Connect LATAM tech talent with European & US companies.
              Perfect matches in hours, not weeks.
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
              I'm a Candidate
            </Link>
            <Link
              to="/auth/signup"
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl text-lg transition-all hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]"
            >
              I'm Hiring
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white font-['Orbitron'] mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                desc: 'Upload your CV or paste your LinkedIn URL. Our AI extracts your skills, experience, and tech stack automatically.',
                color: 'cyan',
              },
              {
                step: '02',
                title: 'AI Matching',
                desc: 'Multi-LLM scoring engine (GPT-4o, Claude, Gemini) evaluates technical fit, cultural alignment, and seniority.',
                color: 'green',
              },
              {
                step: '03',
                title: 'Get Hired',
                desc: 'Receive match notifications, record video interviews, and get hired. 40-60% cost savings for companies.',
                color: 'purple',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/30 transition-colors"
              >
                <span className={`text-4xl font-bold font-['Orbitron'] opacity-30 text-${item.color}-400`}>
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mt-4 mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '40-60%', label: 'Cost Savings' },
            { value: '48h', label: 'Avg. Match Time' },
            { value: '6', label: 'Languages' },
            { value: '4', label: 'AI Models' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-cyan-400 font-['Orbitron']">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
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
