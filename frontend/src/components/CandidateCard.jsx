
import React from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import Card from '@/components/Card';

export default function CandidateCard({ candidate }) {
  const { textClass, bgClass, glowClass } = useUserTypeColor();
  
  return (
    <Card className="flex flex-col space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-xl font-bold ${textClass}`}>{candidate.name || 'John Doe'}</h3>
          <p className="text-muted-foreground">{candidate.location || 'New York, USA'} • Willing to relocate</p>
        </div>
        <div className={`text-2xl font-bold ${textClass} ${glowClass} px-3 py-1 rounded-full border border-current`}>
          {candidate.score || 92}%
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {['React', 'TypeScript', 'Tailwind'].map(tech => (
          <span key={tech} className="text-xs bg-input px-2 py-1 rounded text-muted-foreground">{tech}</span>
        ))}
      </div>
      
      <div className="pt-4 flex gap-2 mt-auto">
        <button className={`flex-1 py-2 rounded font-bold transition-dynamic hover:scale-[1.02] ${bgClass}`}>
          Hire
        </button>
        <button className="flex-1 py-2 border border-input rounded text-muted-foreground hover:text-foreground">
          Watch Video
        </button>
        <button className="px-3 py-2 border border-destructive/50 text-destructive rounded hover:bg-destructive/10">
          Reject
        </button>
      </div>
    </Card>
  );
}
