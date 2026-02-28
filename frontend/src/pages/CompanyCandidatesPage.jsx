
import React, { useState, useEffect } from 'react';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import CandidateCard from '@/components/CandidateCard';

export default function CompanyCandidatesPage() {
  const { textClass } = useUserTypeColor();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // Mock candidates
    setCandidates([
      { id: 1, name: 'Alex Smith', location: 'London, UK', score: 96 },
      { id: 2, name: 'Maria Garcia', location: 'Madrid, ES', score: 89 },
      { id: 3, name: 'James Wilson', location: 'Toronto, CA', score: 85 },
    ]);
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <h1 className={`text-3xl font-bold ${textClass}`}>Candidate Pipeline</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
    </div>
  );
}
