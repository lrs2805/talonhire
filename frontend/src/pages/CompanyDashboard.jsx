
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import Card from '@/components/Card';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function CompanyDashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { textClass, glowClass } = useUserTypeColor();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6 transition-dynamic">
      <h1 className={`text-3xl font-bold transition-dynamic ${textClass}`}>{t('dashboard', 'company_title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Active Jobs</h3>
          <p className={`text-4xl font-bold w-max transition-dynamic ${textClass} ${glowClass}`}>4</p>
        </Card>
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Candidates in Pipeline</h3>
          <p className={`text-4xl font-bold transition-dynamic ${textClass}`}>28</p>
        </Card>
        <Card>
          <h3 className="text-lg text-muted-foreground mb-2">Closed Contracts</h3>
          <p className={`text-4xl font-bold transition-dynamic ${textClass}`}>2</p>
        </Card>
      </div>
    </div>
  );
}
