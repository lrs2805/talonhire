import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { runMatching } from '../lib/edgeFunctions'
import type { Company, Job } from '../types/database'

interface CompanyStats {
  activeJobs: number
  totalCandidates: number
  closedContracts: number
  pendingMatches: number
}

export default function CompanyDashboard() {
  const { user, profile } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [stats, setStats] = useState<CompanyStats>({ activeJobs: 0, totalCandidates: 0, closedContracts: 0, pendingMatches: 0 })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])

  // Fetch company
  useEffect(() => {
    if (!user) return
    supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .single()
      .then(({ data }) => { if (data) setCompany(data) })
  }, [user])

  const load = useCallback(async () => {
    if (!company) return
    const { data: jobsList } = await supabase
      .from('jobs')
      .select('id, title, seniority, required_stack, remote, status, created_at')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })
    const activeCount = jobsList?.filter(j => j.status === 'active').length ?? 0
    const recentJobsList = (jobsList ?? []).slice(0, 5)
    setRecentJobs(recentJobsList as Job[])
    const jobIds = (jobsList ?? []).map(j => j.id)
    const pipelineStatuses = ['sent_to_company', 'viewed', 'interview_requested', 'accepted']
    const [contractsRes, matchingsRes] = await Promise.all([
      supabase.from('contracts').select('id', { count: 'exact', head: true }).eq('company_id', company.id).in('status', ['signed', 'active', 'completed']),
      jobIds.length > 0 ? supabase.from('matchings').select('id', { count: 'exact', head: true }).in('job_id', jobIds).in('status', pipelineStatuses) : { count: 0 },
    ])
    const pipelineCount = matchingsRes.count ?? 0
    setStats({ activeJobs: activeCount, totalCandidates: pipelineCount, pendingMatches: pipelineCount, closedContracts: contractsRes.count ?? 0 })
  }, [company])

  useEffect(() => {
    load()
  }, [load])

  const [matchingJobId, setMatchingJobId] = useState<string | null>(null)
  const [matchingMessage, setMatchingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const runMatchingForJob = useCallback(async (jobId: string) => {
    setMatchingJobId(jobId)
    setMatchingMessage(null)
    const result = await runMatching(jobId)
    setMatchingJobId(null)
    if (result.error) {
      setMatchingMessage({ type: 'error', text: result.error })
    } else {
      setMatchingMessage({ type: 'success', text: `Created ${result.created} new match(es).` })
      load()
    }
  }, [load])

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-400',
    draft: 'bg-gray-500/20 text-gray-400',
    paused: 'bg-yellow-500/20 text-yellow-400',
    closed: 'bg-red-500/20 text-red-400',
    filled: 'bg-cyan-500/20 text-cyan-400',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Orbitron']">
            {company?.name || 'Company Dashboard'}
          </h1>
          <p className="text-gray-400 mt-1">
            Plan: <span className="text-green-400 capitalize">{company?.plan_tier || 'free'}</span>
          </p>
        </div>
        <Link
          to="/company/jobs/new"
          className="px-6 py-3 bg-green-500 hover:bg-green-600 text-black font-semibold rounded-lg transition-colors"
        >
          + Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Jobs" value={stats.activeJobs} color="green" />
        <StatCard title="Candidates in Pipeline" value={stats.totalCandidates} color="cyan" />
        <StatCard title="Pending Matches" value={stats.pendingMatches} color="yellow" />
        <StatCard title="Closed Contracts" value={stats.closedContracts} color="purple" />
      </div>

      {/* Recent Jobs */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Your Jobs</h2>
        {recentJobs.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">No jobs posted yet. Create your first job to start receiving AI-matched candidates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matchingMessage && (
              <div role="alert" className={`px-4 py-2 rounded-lg text-sm ${matchingMessage.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {matchingMessage.text}
              </div>
            )}
            {recentJobs.map(job => (
              <div key={job.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-green-500/30 transition-colors">
                <div>
                  <h3 className="text-white font-medium">{job.title}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-400">
                    <span className="capitalize">{job.seniority}</span>
                    <span>{job.required_stack.slice(0, 3).join(', ')}</span>
                    {job.remote && <span className="text-green-400">Remote</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => runMatchingForJob(job.id)}
                    disabled={matchingJobId !== null}
                    className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {matchingJobId === job.id ? 'Running...' : 'Run matching'}
                  </button>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[job.status] || ''}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, color }: { title: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'border-cyan-500/20 text-cyan-400',
    green: 'border-green-500/20 text-green-400',
    yellow: 'border-yellow-500/20 text-yellow-400',
    purple: 'border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`bg-gray-800/50 border ${colorMap[color]} rounded-xl p-6`}>
      <p className="text-sm text-gray-400">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color]?.split(' ')[1]}`}>{value}</p>
    </div>
  )
}
