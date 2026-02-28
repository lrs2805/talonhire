
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import Card from '@/components/Card';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { textClass, glowClass } = useUserTypeColor();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 transition-dynamic">
      <h1 className={`text-3xl font-bold transition-dynamic ${textClass}`}>{t('dashboard', 'candidate_title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Active Matches</h3>
          <p className={`text-4xl font-bold w-max transition-dynamic ${textClass} ${glowClass}`}>12</p>
        </Card>
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Recorded Videos</h3>
          <p className={`text-4xl font-bold transition-dynamic ${textClass}`}>3</p>
        </Card>
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Pending Interviews</h3>
          <p className={`text-4xl font-bold transition-dynamic ${textClass}`}>1</p>
        </Card>
      </div>
    </div>
  );
}
