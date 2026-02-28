
import { useUserType } from '@/contexts/UserTypeContext';

export function useUserTypeColor() {
  const { userType } = useUserType();
  const isCandidate = userType === 'candidate';

  return {
    primaryColor: isCandidate ? '#00d9ff' : '#00ff88',
    glowColor: isCandidate ? 'rgba(0, 217, 255, 0.5)' : 'rgba(0, 255, 136, 0.5)',
    hoverColor: isCandidate ? '#00b3cc' : '#00cc6a',
    borderColor: isCandidate ? '#00d9ff' : '#00ff88',
    shadowColor: isCandidate ? '0 0 10px rgba(0,217,255,0.7), 0 0 20px rgba(0,217,255,0.5)' : '0 0 10px rgba(0,255,136,0.7), 0 0 20px rgba(0,255,136,0.5)',
    
    // Helper classes for easier integration
    textClass: isCandidate ? 'text-primary' : 'text-secondary',
    bgClass: isCandidate ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground',
    borderClass: isCandidate ? 'border-primary' : 'border-secondary',
    glowClass: isCandidate ? 'glow-neon-blue' : 'glow-neon-green',
  };
}
