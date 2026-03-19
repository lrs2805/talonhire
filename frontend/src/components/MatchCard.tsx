import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import type { Matching, Job, Candidate } from '../types/database'

interface MatchCardProps {
  match: Matching & {
    job?: Pick<Job, 'title' | 'salary_min' | 'salary_max' | 'remote' | 'required_stack' | 'seniority' | 'location_country'>
    candidate?: Pick<Candidate, 'primary_role' | 'tech_stack' | 'seniority' | 'location_country'>
  }
  viewAs: 'candidate' | 'company'
  onAction?: (matchId: string, action: 'accept' | 'reject') => void
}

export default function MatchCard({ match, viewAs, onAction }: MatchCardProps) {
  const score = Math.round(match.score_overall)
  const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'

  const isExpired = match.share_expires_at && new Date(match.share_expires_at) < new Date()

  return (
    <motion.div whileHover={{ scale: 1.05 }} className="card-neon horizons-card-hover p-5">
      <div className="flex items-start justify-between">
        {/* Left: Info */}
        <div className="flex-1">
          {viewAs === 'candidate' && match.job && (
            <>
              <h3 className="font-heading text-lg font-semibold text-white text-glow-cyan">{match.job.title}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Tag>{match.job.seniority}</Tag>
                {match.job.remote && <Tag color="green">Remote</Tag>}
                {match.job.location_country && <Tag>{match.job.location_country}</Tag>}
              </div>
              {match.job.salary_min && match.job.salary_max && (
                <p className="font-body text-sm text-gray-400 mt-2">
                  {match.job.salary_min.toLocaleString()} - {match.job.salary_max.toLocaleString()} EUR/mo
                </p>
              )}
              {match.job.required_stack && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.job.required_stack.slice(0, 5).map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-[#00F0FF]/10 text-[#00F0FF] text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {viewAs === 'company' && match.candidate && (
            <>
              <h3 className="font-heading text-lg font-semibold text-white capitalize text-glow-green">
                {match.candidate.primary_role || 'Developer'}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <Tag>{match.candidate.seniority}</Tag>
                <Tag>{match.candidate.location_country}</Tag>
              </div>
              {match.candidate.tech_stack && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {match.candidate.tech_stack.slice(0, 5).map(tech => (
                    <span key={tech} className="px-2 py-0.5 bg-[#39FF14]/10 text-[#39FF14] text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Score */}
        <div className="text-right ml-4">
          <div className={`font-heading text-3xl font-bold ${scoreColor}`}>{score}%</div>
          <div className="font-body text-xs text-gray-500 capitalize mt-1">{match.status.replace(/_/g, ' ')}</div>
          {isExpired && <div className="text-xs text-red-400 mt-1">Link expired</div>}
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/10">
        <ScoreBar label="Tech" value={match.score_tech} />
        <ScoreBar label="Cultural" value={match.score_cultural} />
        <ScoreBar label="Seniority" value={match.score_seniority} />
        <ScoreBar label="Skills" value={match.score_skills} />
      </div>

      {/* Actions */}
      {onAction && match.status === 'sent_to_company' && viewAs === 'company' && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          <button
            onClick={() => onAction(match.id, 'accept')}
            className="btn-cta-green flex-1 py-2 text-sm font-heading"
          >
            Request Interview
          </button>
          <button
            onClick={() => onAction(match.id, 'reject')}
            className="flex-1 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-heading"
          >
            Pass
          </button>
        </div>
      )}
    </motion.div>
  )
}

function Tag({ children, color = 'gray' }: { children: ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    gray: 'bg-white/10 text-gray-300',
    green: 'bg-[#39FF14]/20 text-[#39FF14]',
    cyan: 'bg-[#00F0FF]/20 text-[#00F0FF]',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs capitalize font-body ${colorMap[color] || colorMap.gray}`}>
      {children}
    </span>
  )
}

function ScoreBar({ label, value }: { label: string; value: number | null }) {
  const pct = value ? Math.round(value) : 0
  return (
    <div className="text-center">
      <div className="text-xs text-gray-500 mb-1 font-body">{label}</div>
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <div
          className="bg-[#00F0FF] h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1 font-body">{pct}%</div>
    </div>
  )
}
