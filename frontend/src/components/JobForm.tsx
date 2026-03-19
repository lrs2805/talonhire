import { useState, type FormEvent } from 'react'
import type { Job, SeniorityLevel, ContractType } from '../types/database'

export type JobFormData = Pick<Job,
  'title' | 'description' | 'seniority' | 'required_stack' | 'nice_to_have_stack' |
  'salary_min' | 'salary_max' | 'remote' | 'location_city' | 'location_country' |
  'relocation_support' | 'contract_type' | 'assessment_type'
>

interface JobFormProps {
  onSubmit: (data: JobFormData) => Promise<void>
  initialData?: Partial<JobFormData>
  loading?: boolean
}

export default function JobForm({ onSubmit, initialData, loading }: JobFormProps) {
  const [form, setForm] = useState<JobFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    seniority: initialData?.seniority || 'mid',
    required_stack: initialData?.required_stack || [],
    nice_to_have_stack: initialData?.nice_to_have_stack || [],
    salary_min: initialData?.salary_min || null,
    salary_max: initialData?.salary_max || null,
    remote: initialData?.remote ?? true,
    location_city: initialData?.location_city || '',
    location_country: initialData?.location_country || '',
    relocation_support: initialData?.relocation_support || false,
    contract_type: initialData?.contract_type || 'fee_15pct',
    assessment_type: initialData?.assessment_type || 'none',
  })

  const [stackInput, setStackInput] = useState('')
  const [error, setError] = useState('')

  function addStack(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const tech = stackInput.trim().toLowerCase()
      if (tech && !form.required_stack.includes(tech)) {
        setForm(prev => ({ ...prev, required_stack: [...prev.required_stack, tech] }))
      }
      setStackInput('')
    }
  }

  function removeStack(tech: string) {
    setForm(prev => ({ ...prev, required_stack: prev.required_stack.filter(t => t !== tech) }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    if (form.required_stack.length === 0) {
      setError('Add at least one required technology')
      return
    }

    try {
      await onSubmit(form)
    } catch (err: any) {
      setError(err.message || 'Failed to save job')
    }
  }

  const seniorityOptions: SeniorityLevel[] = ['junior', 'mid', 'senior', 'lead', 'principal', 'c_level']
  const contractOptions: { value: ContractType; label: string }[] = [
    { value: 'fee_15pct', label: 'Fee 15% (on hire)' },
    { value: 'service_markup_40pct', label: 'Service + 40% markup (monthly)' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-body">Job Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
          placeholder="Senior Full-Stack Developer"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-body">Description</label>
        <textarea
          value={form.description || ''}
          onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
          rows={4}
          className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 resize-none"
          placeholder="Describe the role, responsibilities, and ideal candidate..."
        />
      </div>

      {/* Seniority + Remote */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-body">Seniority</label>
          <select
            value={form.seniority}
            onChange={e => setForm(prev => ({ ...prev, seniority: e.target.value as SeniorityLevel }))}
            className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
          >
            {seniorityOptions.map(s => (
              <option key={s} value={s} className="capitalize">{s.replace('_', '-')}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remote}
              onChange={e => setForm(prev => ({ ...prev, remote: e.target.checked }))}
              className="w-4 h-4 accent-[#39FF14]"
            />
            <span className="text-sm text-gray-300">Remote</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.relocation_support || false}
              onChange={e => setForm(prev => ({ ...prev, relocation_support: e.target.checked }))}
              className="w-4 h-4 accent-[#39FF14]"
            />
            <span className="text-sm text-gray-300">Relocation</span>
          </label>
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-body">Required Tech Stack *</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.required_stack.map(tech => (
            <span key={tech} className="px-3 py-1 bg-[#39FF14]/20 text-[#39FF14] rounded-full text-sm font-body flex items-center gap-1">
              {tech}
              <button type="button" onClick={() => removeStack(tech)} className="hover:text-white ml-1">&times;</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={stackInput}
          onChange={e => setStackInput(e.target.value)}
          onKeyDown={addStack}
          className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
          placeholder="Type a technology and press Enter (e.g. react, python, aws)"
        />
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-body">Min Salary (EUR/mo)</label>
          <input
            type="number"
            value={form.salary_min || ''}
            onChange={e => setForm(prev => ({ ...prev, salary_min: e.target.value ? parseInt(e.target.value) : null }))}
            className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
            placeholder="2500"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5 font-body">Max Salary (EUR/mo)</label>
          <input
            type="number"
            value={form.salary_max || ''}
            onChange={e => setForm(prev => ({ ...prev, salary_max: e.target.value ? parseInt(e.target.value) : null }))}
            className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
            placeholder="5000"
          />
        </div>
      </div>

      {/* Contract Type */}
      <div>
        <label className="block text-sm text-gray-400 mb-1.5 font-body">Contract Model</label>
        <select
          value={form.contract_type}
          onChange={e => setForm(prev => ({ ...prev, contract_type: e.target.value as ContractType }))}
          className="w-full px-4 py-3 bg-[#0A0A0A]/80 border border-white/10 rounded-lg text-white font-body focus:outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20"
        >
          {contractOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn-cta-green w-full py-3 font-heading font-semibold disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Publish Job'}
      </button>
    </form>
  )
}
