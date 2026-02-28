
import React from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import Card from '@/components/Card';
import { Link } from 'react-router-dom';

export default function MatchCard({ match }) {
  const { textClass, bgClass, glowClass } = useUserTypeColor();
  
  return (
    <Card className="flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-xl font-bold ${textClass}`}>{match.job_title || 'Software Engineer'}</h3>
          <p className="text-muted-foreground">{match.company_name || 'Tech Corp'} • {match.location || 'Remote'}</p>
        </div>
        <div className={`text-2xl font-bold ${textClass} ${glowClass} px-3 py-1 rounded-full border border-current`}>
          {match.score || 85}%
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {['React', 'Node.js', 'Supabase'].map(tech => (
          <span key={tech} className="text-xs bg-input px-2 py-1 rounded text-muted-foreground">{tech}</span>
        ))}
      </div>
      
      <div className="pt-4 flex gap-2 mt-auto">
        <Link to={`/candidate/interview/${match.job_id || '123'}`} className={`flex-1 text-center py-2 rounded font-bold transition-dynamic hover:scale-[1.02] ${bgClass}`}>
          Record Video
        </Link>
        <button className="px-4 py-2 border border-input rounded text-muted-foreground hover:text-foreground">
          Details
        </button>
      </div>
    </Card>
  );
}
