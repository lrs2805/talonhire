import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useMatches } from '../hooks/useMatches'
import type { Candidate, Interview } from '../types/database'

interface DashboardStats {
  activeMatches: number
  pendingInterviews: number
  recordedVideos: number
}

export default function CandidateDashboard() {
  const { user, profile } = useAuth()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [stats, setStats] = useState<DashboardStats>({ activeMatches: 0, pendingInterviews: 0, recordedVideos: 0 })
  const [recentInterviews, setRecentInterviews] = useState<Interview[]>([])

  // Fetch candidate record
  useEffect(() => {
    if (!user) return
    supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', user.id)
      .single()
      .then(({ data }) => { if (data) setCandidate(data) })
  }, [user])

  const { matches, loading: matchesLoading } = useMatches({
    candidateId: candidate?.id,
    status: ['pending', 'sent_to_company', 'viewed', 'interview_requested', 'accepted'],
  })

  // Fetch stats
  useEffect(() => {
    if (!candidate) return

    Promise.all([
      supabase
        .from('matchings')
        .select('id', { count: 'exact', head: true })
        .eq('candidate_id', candidate.id)
        .in('status', ['pending', 'sent_to_company', 'viewed', 'interview_requested', 'accepted']),
      supabase
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('candidate_id', candidate.id)
        .in('status', ['pending', 'questions_sent']),
      supabase
        .from('interviews')
        .select('id', { count: 'exact', head: true })
        .eq('candidate_id', candidate.id)
        .not('video_url', 'is', null),
      supabase
        .from('interviews')
        .select('*')
        .eq('candidate_id', candidate.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then(([matchRes, interviewRes, videoRes, recentRes]) => {
      setStats({
        activeMatches: matchRes.count || 0,
        pendingInterviews: interviewRes.count || 0,
        recordedVideos: videoRes.count || 0,
      })
      if (recentRes.data) setRecentInterviews(recentRes.data)
    })
  }, [candidate])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-['Orbitron']">
          Welcome, {profile?.full_name || 'Candidate'}
        </h1>
        <p className="text-gray-400 mt-1">
          {candidate?.status === 'active' ? 'Your profile is active and visible to companies.' : 'Complete your profile to start receiving matches.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Active Matches"
          value={stats.activeMatches}
          icon="M13 10V3L4 14h7v7l9-11h-7z"
          color="cyan"
        />
        <StatCard
          title="Pending Interviews"
          value={stats.pendingInterviews}
          icon="M15 10l4.553-2.276A1 1 0 0021 6.618V17.382a1 1 0 01-1.447.894L15 16M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          color="green"
        />
        <StatCard
          title="Recorded Videos"
          value={stats.recordedVideos}
          icon="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          color="purple"
        />
      </div>

      {/* Profile Completion */}
      {candidate && (
        <ProfileCompletion candidate={candidate} />
      )}

      {/* Recent Matches */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Matches</h2>
        {matchesLoading ? (
          <div className="text-gray-400">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
            <p className="text-gray-400">No matches yet. Complete your profile and upload your CV to start receiving AI-powered matches.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <div key={match.id} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-colors">
                <div>
                  <h3 className="text-white font-medium">{match.job?.title || 'Unknown Position'}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-gray-400">
                    <span>{match.job?.seniority}</span>
                    {match.job?.remote && <span className="text-green-400">Remote</span>}
                    {match.job?.salary_min && match.job?.salary_max && (
                      <span>{match.job.salary_min}-{match.job.salary_max} EUR</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyan-400">{Math.round(match.score_overall)}%</div>
                  <div className="text-xs text-gray-500 capitalize">{match.status.replace('_', ' ')}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
  }
  const classes = colorMap[color] || colorMap.cyan

  return (
    <div className={`bg-gradient-to-br ${classes} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
    </div>
  )
}

function ProfileCompletion({ candidate }: { candidate: Candidate }) {
  const steps = [
    { label: 'LinkedIn', done: !!candidate.linkedin_url },
    { label: 'CV Upload', done: !!candidate.cv_url },
    { label: 'Tech Stack', done: candidate.tech_stack.length > 0 },
    { label: 'Intro Video', done: !!candidate.intro_video_url },
    { label: 'Salary Range', done: !!candidate.salary_expectation_min },
  ]
  const completed = steps.filter(s => s.done).length
  const pct = Math.round((completed / steps.length) * 100)

  if (pct === 100) return null

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">Profile Completion</h3>
        <span className="text-cyan-400 font-bold">{pct}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
        <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map(step => (
          <span
            key={step.label}
            className={`px-3 py-1 rounded-full text-xs ${
              step.done
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'bg-gray-700 text-gray-500'
            }`}
          >
            {step.done ? '✓' : '○'} {step.label}
          </span>
        ))}
      </div>
    </div>
  )
}
