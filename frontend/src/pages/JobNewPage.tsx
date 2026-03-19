import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { generateEmbedding, runMatching } from '../lib/edgeFunctions'
import JobForm from '../components/JobForm'
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
    supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .single()
      .then(({ data }) => setCompany(data))
  }, [user])

  async function handleSubmit(form: JobFormData) {
    if (!company || !user) {
      setError('Company or user not found')
      return
    }
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const slug = form.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .slice(0, 100) || `job-${Date.now()}`

      const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
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
        })
        .select()
        .single()

      if (insertError) throw insertError
      if (!job) throw new Error('Job not created')

      const textForEmbedding = [form.title, form.description, form.required_stack.join(' ')].filter(Boolean).join('\n')
      if (textForEmbedding) {
        await generateEmbedding('jd', job.id, textForEmbedding)
      }
      if (runMatchingAfterCreate) {
        await runMatching(job.id)
      }

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
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/company/dashboard" className="text-gray-400 hover:text-white text-sm">
          ← Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-white font-['Orbitron'] mb-2">Post New Job</h1>
      <p className="text-gray-400 mb-6">Create a job to receive AI-matched candidates.</p>

      {success && (
        <div role="alert" className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={runMatchingAfterCreate}
          onChange={e => setRunMatchingAfterCreate(e.target.checked)}
          className="w-4 h-4 accent-green-500"
        />
        <span className="text-sm text-gray-300">Run AI matching after creating job</span>
      </label>

      <JobForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
