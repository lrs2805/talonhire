import { motion } from 'framer-motion'
import type { Job } from '../types/database'

interface JobCardProps {
  job: Job
  actions?: React.ReactNode
}

const statusColors: Record<string, string> = {
  active: 'bg-[#39FF14]/20 text-[#39FF14]',
  draft: 'bg-white/10 text-gray-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-red-500/20 text-red-400',
  filled: 'bg-[#00F0FF]/20 text-[#00F0FF]',
}

export default function JobCard({ job, actions }: JobCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="card-neon p-4 flex items-center justify-between"
    >
      <div>
        <h3 className="font-heading text-white font-medium">{job.title}</h3>
        <div className="flex gap-3 mt-1 text-sm font-body text-gray-400">
          <span className="capitalize">{job.seniority}</span>
          <span>{job.required_stack.slice(0, 3).join(', ')}</span>
          {job.remote && <span className="text-[#39FF14]">Remote</span>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <span className={`px-3 py-1 rounded-full text-xs font-heading font-medium capitalize ${statusColors[job.status] || ''}`}>
          {job.status}
        </span>
      </div>
    </motion.div>
  )
}
