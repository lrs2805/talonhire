
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import { useUserType } from '@/contexts/UserTypeContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { textClass, borderClass, primaryColor, shadowColor } = useUserTypeColor();
  const { userType } = useUserType();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-dynamic">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className={`text-2xl font-bold font-[Orbitron] transition-dynamic ${textClass}`} style={{ textShadow: `0 0 10px ${primaryColor}` }}>
          TalonHire
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          {user && (
            <nav className="hidden md:flex gap-4 mr-4 text-sm font-medium">
              {userType === 'candidate' ? (
                <>
                  <Link to="/candidate/dashboard" className={`hover:${textClass} transition-colors`}>Dashboard</Link>
                  <Link to="/academy" className={`hover:${textClass} transition-colors`}>Academy</Link>
                  <Link to="/marketplace" className={`hover:${textClass} transition-colors`}>Marketplace</Link>
                </>
              ) : (
                <>
                  <Link to="/company/dashboard" className={`hover:${textClass} transition-colors`}>Dashboard</Link>
                  <Link to="/company/candidates" className={`hover:${textClass} transition-colors`}>Candidates</Link>
                </>
              )}
            </nav>
          )}

          <LanguageSwitcher />
          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-4 ml-2">
              <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              <button onClick={handleSignOut} className={`text-sm transition-dynamic hover:${textClass}`}>
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/auth/login" 
              className={`ml-2 px-4 py-2 text-sm sm:text-base rounded border transition-dynamic hover:bg-opacity-20 ${textClass} ${borderClass}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${primaryColor}20`;
                e.currentTarget.style.boxShadow = shadowColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {t('sign_in', 'Sign In')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
