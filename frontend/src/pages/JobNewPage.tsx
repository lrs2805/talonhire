import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateEmbedding, runMatching } from '../lib/edgeFunctions'
import JobForm from '../components/JobForm'
import ParticlesBackground from '../components/ParticlesBackground'
import type { Company } from '../types/database'
import type { JobFormData } from '../components/JobForm'

export default function JobNewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [runMatchingAfterCreate, setRunMatchingAfterCreate] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('companies').select('*').eq('owner_id', user.id).single().then(({ data }) => setCompany(data))
  }, [user])

  async function handleSubmit(form: JobFormData) {
    if (!company || !user) { setError('Company or user not found'); return }
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const slug = form.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 100) || `job-${Date.now()}`
      const { data: job, error: insertError } = await supabase.from('jobs').insert({
        company_id: company.id,
        created_by: user.id,
        title: form.title,
        slug,
        description: form.description || null,
        seniority: form.seniority,
        required_stack: form.required_stack,
        nice_to_have_stack: form.nice_to_have_stack?.length ? form.nice_to_have_stack : null,
        salary_min: form.salary_min,
        salary_max: form.salary_max,
        remote: form.remote,
        location_city: form.location_city || null,
        location_country: form.location_country || null,
        relocation_support: form.relocation_support,
        contract_type: form.contract_type,
        assessment_type: form.assessment_type,
        status: 'active',
      }).select().single()
      if (insertError) throw insertError
      if (!job) throw new Error('Job not created')
      const textForEmbedding = [form.title, form.description, form.required_stack.join(' ')].filter(Boolean).join('\n')
      if (textForEmbedding) await generateEmbedding('jd', job.id, textForEmbedding)
      if (runMatchingAfterCreate) await runMatching(job.id)
      setSuccess('Job published. AI matching has been run.')
      setTimeout(() => navigate('/company/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setLoading(false)
    }
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="font-body text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <ParticlesBackground density={0.3} />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <Link to="/company/dashboard" className="font-body text-sm text-gray-400 hover:text-[#39FF14] transition-colors inline-block mb-4">
          ← Dashboard
        </Link>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white text-glow-green mb-2">Post New Job</h1>
        <p className="font-body text-gray-400 mb-6 text-sm sm:text-base">Create a job to receive AI-matched candidates.</p>

        {success && (
          <div role="alert" className="bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] px-4 py-3 rounded-lg mb-6 font-body">
            {success}
          </div>
        )}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 font-body">
            {error}
          </div>
        )}

        <label className="flex items-center gap-2 mb-4 cursor-pointer font-body text-sm text-gray-300">
          <input type="checkbox" checked={runMatchingAfterCreate} onChange={e => setRunMatchingAfterCreate(e.target.checked)} className="w-4 h-4 accent-[#39FF14]" />
          Run AI matching after creating job
        </label>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          className="card-neon horizons-card-hover card-neon-green horizons-card-hover-green p-4 sm:p-6"
        >
          <JobForm onSubmit={handleSubmit} loading={loading} />
        </motion.div>
      </div>
    </div>
  )
}
