import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
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

  // Fetch stats and jobs
  useEffect(() => {
    if (!company) return

    Promise.all([
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('status', 'active'),
      supabase
        .from('matchings')
        .select('id', { count: 'exact', head: true })
        .in('job_id', []) // will be filled with job IDs
        .in('status', ['sent_to_company', 'viewed', 'interview_requested', 'accepted']),
      supabase
        .from('contracts')
        .select('id', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .in('status', ['signed', 'active', 'completed']),
      supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([jobsRes, _matchesRes, contractsRes, recentRes]) => {
      setStats({
        activeJobs: jobsRes.count || 0,
        totalCandidates: 0, // calculated from matches
        closedContracts: contractsRes.count || 0,
        pendingMatches: 0,
      })
      if (recentRes.data) setRecentJobs(recentRes.data)
    })

    // Fetch candidate pipeline count separately (needs job IDs)
    supabase
      .from('jobs')
      .select('id')
      .eq('company_id', company.id)
      .then(({ data: jobData }) => {
        if (!jobData?.length) return
        const jobIds = jobData.map(j => j.id)
        supabase
          .from('matchings')
          .select('id', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .in('status', ['sent_to_company', 'viewed', 'interview_requested', 'accepted'])
          .then(({ count }) => {
            setStats(prev => ({ ...prev, totalCandidates: count || 0, pendingMatches: count || 0 }))
          })
      })
  }, [company])

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
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[job.status] || ''}`}>
                  {job.status}
                </span>
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
