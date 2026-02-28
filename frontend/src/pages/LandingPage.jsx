
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserType } from '@/contexts/UserTypeContext';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';

export default function LandingPage() {
  const { t } = useTranslation();
  const { userType, setUserType } = useUserType();
  const { bgClass, glowClass } = useUserTypeColor();

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden transition-dynamic">
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="https://zluwxdsjtvqhguxdhsxm.supabase.co/storage/v1/object/public/hero-video/hero-video.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60 z-1" />
      
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-float">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary transition-dynamic">
            {t('landing', 'hero_title')}
          </h1>
          
          <div className="flex justify-center items-center gap-4 bg-card p-2 rounded-full w-max mx-auto border border-border transition-dynamic">
            <button 
              onClick={() => setUserType('candidate')}
              className={`px-6 py-2 rounded-full transition-dynamic ${userType === 'candidate' ? 'bg-primary text-primary-foreground glow-neon-blue' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Candidate
            </button>
            <button 
              onClick={() => setUserType('company')}
              className={`px-6 py-2 rounded-full transition-dynamic ${userType === 'company' ? 'bg-secondary text-secondary-foreground glow-neon-green' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Company
            </button>
          </div>

          <Link 
            to="/auth/signup" 
            className={`inline-block px-8 py-4 rounded font-bold text-lg transition-dynamic hover:scale-105 ${bgClass} ${glowClass}`}
          >
            {userType === 'candidate' ? t('landing', 'candidate_btn') : t('landing', 'company_btn')}
          </Link>
        </div>
      </div>
    </div>
  );
}
