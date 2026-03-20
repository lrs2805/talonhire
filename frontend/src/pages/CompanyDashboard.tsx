import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { runMatching, type MatchingTopCandidate } from '../lib/edgeFunctions'
import ParticlesBackground from '../components/ParticlesBackground'
import JobCard from '../components/JobCard'
import type { Company, Contract, Job } from '../types/database'

interface CompanyStats {
  activeJobs: number
  totalCandidates: number
  closedContracts: number
  pendingMatches: number
}

export default function CompanyDashboard() {
  const { user } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)
  const [companyLoadError, setCompanyLoadError] = useState<string | null>(null)
  const [stats, setStats] = useState<CompanyStats>({ activeJobs: 0, totalCandidates: 0, closedContracts: 0, pendingMatches: 0 })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [contractsToSign, setContractsToSign] = useState<Contract[]>([])

  useEffect(() => {
    if (!user) {
      setCompanyLoading(false)
      return
    }
    setCompanyLoading(true)
    setCompanyLoadError(null)
    void supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        setCompanyLoading(false)
        if (error) {
          setCompanyLoadError(error.message)
          setCompany(null)
          return
        }
        setCompany(data ?? null)
      })
  }, [user])

  const load = useCallback(async () => {
    if (!company) return
    const { data: jobsList } = await supabase.from('jobs').select('id, title, seniority, required_stack, remote, status, created_at').eq('company_id', company.id).order('created_at', { ascending: false })
    const activeCount = jobsList?.filter((j) => j.status === 'active').length ?? 0
    setRecentJobs((jobsList ?? []).slice(0, 5) as Job[])
    const jobIds = (jobsList ?? []).map((j) => j.id)

    let pipelineCount = 0
    if (jobIds.length > 0) {
      const { data: rpcData, error: rpcErr } = await supabase.rpc('count_matchings_pipeline_for_jobs', {
        p_job_ids: jobIds,
      })
      if (!rpcErr && rpcData != null) {
        pipelineCount = Number(rpcData)
      } else {
        const { count } = await supabase
          .from('matchings')
          .select('id', { count: 'exact' })
          .in('job_id', jobIds)
          .in('status', ['sent_to_company', 'viewed', 'interview_requested', 'accepted'])
          .limit(0)
        pipelineCount = count ?? 0
      }
    }

    const [contractsRes, contractsList] = await Promise.all([
      supabase.from('contracts').select('id', { count: 'exact' }).eq('company_id', company.id).in('status', ['signed', 'active', 'completed']).limit(0),
      supabase
        .from('contracts')
        .select('*')
        .eq('company_id', company.id)
        .in('status', ['draft', 'pending_signature'])
        .order('created_at', { ascending: false })
        .limit(3),
    ])
    setStats({ activeJobs: activeCount, totalCandidates: pipelineCount, pendingMatches: pipelineCount, closedContracts: contractsRes.count ?? 0 })
    setContractsToSign((contractsList.data ?? []) as Contract[])
  }, [company])

  useEffect(() => { load() }, [load])

  const [matchingJobId, setMatchingJobId] = useState<string | null>(null)
  const [matchingMessage, setMatchingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [matchingTop5, setMatchingTop5] = useState<{ jobId: string; items: MatchingTopCandidate[] } | null>(null)
  const runMatchingForJob = useCallback(async (jobId: string) => {
    setMatchingJobId(jobId)
    setMatchingMessage(null)
    setMatchingTop5(null)
    const result = await runMatching(jobId)
    setMatchingJobId(null)
    if (result.error) setMatchingMessage({ type: 'error', text: result.error })
    else {
      const base = `Horizons: ${result.created}/${result.total} match(es) scored (multi-LLM).`
      setMatchingMessage({ type: 'success', text: result.message ? `${base} ${result.message}` : base })
      if (result.top5?.length) setMatchingTop5({ jobId, items: result.top5 })
      load()
    }
  }, [load])

  const statusColors: Record<string, string> = {
    active: 'bg-[#39FF14]/20 text-[#39FF14]',
    draft: 'bg-white/10 text-gray-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    closed: 'bg-red-500/20 text-red-400',
    filled: 'bg-[#00F0FF]/20 text-[#00F0FF]',
  }

  if (companyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <p className="font-body text-gray-400">Loading...</p>
      </div>
    )
  }

  if (companyLoadError) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative">
        <ParticlesBackground density={0.4} />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-16 text-center">
          <p className="font-heading text-white mb-2">Could not load company data</p>
          <p className="font-body text-red-400 text-sm mb-4">{companyLoadError}</p>
          <p className="font-body text-gray-500 text-xs">
            Supabase REST 500 on <code className="text-gray-400">companies</code> / <code className="text-gray-400">profiles</code> is often RLS recursion on admin policies. Apply{' '}
            <code className="text-gray-400">setup-rls-fix-profiles-recursion.sql</code> in the Supabase SQL editor.
          </p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] relative">
        <ParticlesBackground density={0.4} />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-16 text-center">
          <p className="font-body text-gray-400">No company profile found for this account. If you just signed up, wait a moment or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative">
      <ParticlesBackground density={0.4} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white text-glow-green">
              {company?.name || 'Company Dashboard'}
            </h1>
            <p className="font-body text-gray-400 mt-1 text-sm sm:text-base">
              Plan: <span className="text-[#39FF14] capitalize">{company?.plan_tier || 'free'}</span>
            </p>
          </div>
          <Link
            to="/company/jobs/new"
            className="btn-cta-green px-6 py-3 font-heading text-sm sm:text-base w-full sm:w-auto text-center"
          >
            + Post New Job
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            { title: 'Active Jobs', value: stats.activeJobs, color: 'green' },
            { title: 'Candidates in Pipeline', value: stats.totalCandidates, color: 'cyan' },
            { title: 'Pending Matches', value: stats.pendingMatches, color: 'yellow' },
            { title: 'Closed Contracts', value: stats.closedContracts, color: 'purple' },
          ].map((s) => (
            <motion.div key={s.title} whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover card-neon-green horizons-card-hover-green p-4 sm:p-6">
              <p className="font-body text-xs sm:text-sm text-gray-400">{s.title}</p>
              <p className={`font-heading text-2xl sm:text-3xl font-bold mt-1 ${s.color === 'cyan' ? 'text-[#00F0FF] text-glow-cyan' : s.color === 'green' ? 'text-[#39FF14] text-glow-green' : s.color === 'yellow' ? 'text-yellow-400' : 'text-purple-400'}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-4 text-glow-green">Your Jobs</h2>
          {recentJobs.length === 0 ? (
            <div className="card-neon horizons-card-hover card-neon-green horizons-card-hover-green p-6 sm:p-8 text-center">
              <p className="font-body text-gray-400 text-sm sm:text-base">No jobs posted yet. Create your first job to start receiving AI-matched candidates.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingMessage && (
                <div role="alert" className={`px-4 py-2 rounded-lg text-sm font-body ${matchingMessage.type === 'success' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {matchingMessage.text}
                </div>
              )}
              {matchingTop5 && matchingTop5.items.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover card-neon-green horizons-card-hover-green p-4 sm:p-5 mb-3">
                  <h3 className="font-heading text-white text-glow-green mb-3">Top 5 — Horizons (para a empresa)</h3>
                  <p className="font-body text-gray-500 text-xs mb-4">Scores: 0.35×semantic + 0.25×tech (GPT-4o) + 0.20×cultural (Claude) + 0.10×seniority/salary (Gemini) + 0.10×especializado (Deepseek R1).</p>
                  <ul className="space-y-4">
                    {matchingTop5.items.map((t, i) => (
                      <li key={t.candidateId} className="border border-white/10 rounded-lg p-3 bg-[#0A0A0A]/40">
                        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                          <span className="font-heading text-[#00F0FF]">{i + 1}. {t.candidateName}</span>
                          <span className="font-heading text-[#39FF14] text-lg">{t.scoreOverall.toFixed(1)}</span>
                        </div>
                        <pre className="font-body text-gray-300 text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto">{t.explanation}</pre>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="btn-cta-cyan mt-4 px-4 py-2 font-heading text-sm">
                    Ver Top Matches
                  </button>
                </motion.div>
              )}
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  running={matchingJobId !== null}
                  onRunMatching={runMatchingForJob}
                  statusClass={statusColors[job.status] || ''}
                />
              ))}
            </div>
          )}
        </div>

        {contractsToSign.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading text-lg sm:text-xl font-semibold text-white mb-4 text-glow-cyan">Contratos pendentes de assinatura</h2>
            <div className="space-y-3">
              {contractsToSign.map((contract) => (
                <motion.div key={contract.id} whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div>
                    <p className="font-heading text-white text-sm sm:text-base">
                      {contract.contract_type === 'fee_15pct' ? 'Fee 15%' : 'Prestacao de Servico (markup 40%)'}
                    </p>
                    <p className="font-body text-xs text-gray-400 mt-1">
                      Empresa: {contract.company_signed_at ? '✓ assinado' : 'pendente'} • Candidato:{' '}
                      {contract.candidate_signed_at ? '✓ assinado' : 'pendente'} • ID: {contract.id.slice(0, 8)}
                    </p>
                  </div>
                  <Link
                    to={`/contract/sign/${contract.id}`}
                    className="btn-cta-cyan px-4 py-2 font-heading text-sm text-center inline-block"
                  >
                    {contract.company_signed_at ? 'Ver assinatura' : 'Assinar contrato (Supabase)'}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
