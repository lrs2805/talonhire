import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ParticlesBackground from '../components/ParticlesBackground'

interface AdminStats {
  totalCompanies: number
  totalCandidates: number
  activeJobs: number
  totalMatches: number
  activeContracts: number
  totalRevenue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalCompanies: 0,
    totalCandidates: 0,
    activeJobs: 0,
    totalMatches: 0,
    activeContracts: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('companies').select('id', { count: 'exact' }).limit(0),
      supabase.from('candidates').select('id', { count: 'exact' }).limit(0),
      supabase.from('jobs').select('id', { count: 'exact' }).eq('status', 'active').limit(0),
      supabase.from('matchings').select('id', { count: 'exact' }).limit(0),
      supabase.from('contracts').select('id', { count: 'exact' }).in('status', ['signed', 'active']).limit(0),
      supabase.from('payments').select('amount').eq('status', 'paid'),
    ]).then(([companies, candidates, jobs, matches, contracts, payments]) => {
      const revenue = (payments.data || []).reduce((sum, p) => sum + (p.amount || 0), 0)
      setStats({
        totalCompanies: companies.count || 0,
        totalCandidates: candidates.count || 0,
        activeJobs: jobs.count || 0,
        totalMatches: matches.count || 0,
        activeContracts: contracts.count || 0,
        totalRevenue: revenue / 100, // cents to EUR
      })
      setLoading(false)
    })
  }, [])

  const navLinks = [
    { to: '/admin/companies', label: 'Companies', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { to: '/admin/candidates', label: 'Candidates', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { to: '/admin/jobs', label: 'Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { to: '/admin/contracts', label: 'Contracts', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { to: '/admin/payments', label: 'Payments', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
  ]

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative scan-lines">
      <ParticlesBackground density={0.3} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-3xl font-bold text-white text-glow-cyan mb-8">Admin Dashboard</h1>

      {/* Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {navLinks.map(link => (
          <motion.div whileHover={{ scale: 1.05 }} key={link.to}>
          <Link
            key={link.to}
            to={link.to}
            className="card-neon horizons-card-hover rounded-xl p-4 text-center transition-colors group block"
          >
            <svg className="w-8 h-8 mx-auto text-gray-500 group-hover:text-[#00F0FF] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={link.icon} />
            </svg>
            <span className="font-body text-sm text-gray-400 group-hover:text-white mt-2 block">{link.label}</span>
          </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AdminStatCard label="Total Companies" value={stats.totalCompanies} loading={loading} />
        <AdminStatCard label="Total Candidates" value={stats.totalCandidates} loading={loading} />
        <AdminStatCard label="Active Jobs" value={stats.activeJobs} loading={loading} />
        <AdminStatCard label="Total Matches" value={stats.totalMatches} loading={loading} />
        <AdminStatCard label="Active Contracts" value={stats.activeContracts} loading={loading} />
        <AdminStatCard
          label="Total Revenue"
          value={stats.totalRevenue}
          loading={loading}
          format={(v) => `€${v.toLocaleString()}`}
          highlight
        />
      </div>

      {/* Conversion funnel hint */}
      {!loading && stats.totalMatches > 0 && stats.activeContracts > 0 && (
        <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover rounded-xl p-6">
          <h3 className="font-heading text-white font-medium mb-2">Conversion Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#00F0FF] to-[#39FF14] h-3 rounded-full transition-all"
                style={{ width: `${Math.min(100, (stats.activeContracts / stats.totalMatches) * 100)}%` }}
              />
            </div>
            <span className="font-heading text-[#00F0FF] text-glow-cyan font-bold">
              {((stats.activeContracts / stats.totalMatches) * 100).toFixed(1)}%
            </span>
          </div>
          <p className="font-body text-gray-500 text-sm mt-2">
            {stats.activeContracts} contracts from {stats.totalMatches} matches
          </p>
        </motion.div>
      )}
      </div>
    </div>
  )
}

function AdminStatCard({
  label,
  value,
  loading,
  format,
  highlight,
}: {
  label: string
  value: number
  loading: boolean
  format?: (v: number) => string
  highlight?: boolean
}) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} className={`card-neon horizons-card-hover border rounded-xl p-6 ${highlight ? 'card-neon-green horizons-card-hover-green border-[#39FF14]/30' : 'border-white/10'}`}>
      <p className="font-body text-sm text-gray-400">{label}</p>
      {loading ? (
        <div className="h-9 w-24 bg-white/10 animate-pulse rounded mt-1" />
      ) : (
        <p className={`font-heading text-3xl font-bold mt-1 ${highlight ? 'text-[#39FF14] text-glow-green' : 'text-white'}`}>
          {format ? format(value) : value.toLocaleString()}
        </p>
      )}
    </motion.div>
  )
}
