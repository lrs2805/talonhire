import { useMemo } from 'react'
import { motion } from 'framer-motion'

const PARTICLE_COUNT = 50
const NEON_CYAN = 'rgba(0, 240, 255, 0.4)'
const NEON_GREEN = 'rgba(57, 255, 20, 0.3)'

function useParticles() {
  return useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      color: Math.random() > 0.5 ? NEON_CYAN : NEON_GREEN,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 2,
    }))
  }, [])
}

interface ParticlesBackgroundProps {
  className?: string
  density?: number
}

export default function ParticlesBackground({ className = '', density = 1 }: ParticlesBackgroundProps) {
  const particles = useParticles()
  const count = Math.max(20, Math.floor(PARTICLE_COUNT * density))

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {particles.slice(0, count).map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, Math.sin(p.id) * 10, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
          }}
        />
      ))}
    </div>
  )
}
