
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserType } from '@/contexts/UserTypeContext';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import FormInput from '@/components/FormInput';
import Card from '@/components/Card';

export default function SignupPage() {
  const { userType, setUserType } = useUserType();
  const { textClass, bgClass, glowClass } = useUserTypeColor();
  const [formData, setFormData] = useState({ email: '', password: '', name: '', company_name: '', location: '', country: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const isCandidate = userType === 'candidate';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await signUp(formData.email, formData.password, userType, formData);
    
    if (error) {
      setError(error.message);
    } else {
      navigate(isCandidate ? '/candidate/dashboard' : '/company/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 transition-dynamic">
      <Card className="w-full max-w-md">
        <h2 className={`text-3xl font-bold mb-6 text-center transition-dynamic ${textClass}`}>{t('auth', 'signup_title')}</h2>
        
        <div className="flex mb-6 bg-input rounded p-1 transition-dynamic">
          <button type="button" onClick={() => setUserType('candidate')} className={`flex-1 py-2 text-sm rounded font-bold transition-dynamic ${isCandidate ? 'bg-primary text-primary-foreground glow-neon-blue' : 'text-muted-foreground'}`}>Candidate</button>
          <button type="button" onClick={() => setUserType('company')} className={`flex-1 py-2 text-sm rounded font-bold transition-dynamic ${!isCandidate ? 'bg-secondary text-secondary-foreground glow-neon-green' : 'text-muted-foreground'}`}>Company</button>
        </div>

        {error && <div className="bg-destructive/20 text-destructive p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isCandidate ? (
            <>
              <FormInput label="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <FormInput label="Location" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </>
          ) : (
            <>
              <FormInput label="Company Name" required value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} />
              <FormInput label="Country" required value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
            </>
          )}
          
          <FormInput label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <FormInput label="Password" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          <div className="flex items-start gap-2 mt-4">
            <input type="checkbox" required className="mt-1" />
            <span className="text-sm text-muted-foreground">{t('auth', 'consent')}</span>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-3 rounded font-bold hover:scale-[1.02] transition-dynamic disabled:opacity-50 mt-4 ${bgClass} ${glowClass}`}>
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
        </form>
      </Card>
    </div>
  );
}
