
import React, { useState, useEffect } from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import MatchCard from '@/components/MatchCard';

export default function CandidateMatchesPage() {
  const { textClass } = useUserTypeColor();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Mock matches
    setMatches([
      { id: 1, job_id: '101', job_title: 'Frontend Developer', company_name: 'TechFlow', score: 95 },
      { id: 2, job_id: '102', job_title: 'Fullstack Engineer', company_name: 'InnovateX', score: 88 },
      { id: 3, job_id: '103', job_title: 'React Specialist', company_name: 'WebSolutions', score: 82 },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className={`text-3xl font-bold ${textClass}`}>Your Job Matches</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
