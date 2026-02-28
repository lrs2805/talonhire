
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';
import { useUserTypeColor } from '@/hooks/useUserTypeColor';
import FormInput from '@/components/FormInput';
import Card from '@/components/Card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { textClass, bgClass, glowClass } = useUserTypeColor();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { data, error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else if (data?.user) {
      const type = data.user.user_metadata?.user_type;
      navigate(type === 'company' ? '/company/dashboard' : '/candidate/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 transition-dynamic">
      <Card className="w-full max-w-md">
        <h2 className={`text-3xl font-bold mb-6 text-center transition-dynamic ${textClass}`}>{t('auth', 'login_title')}</h2>
        
        {error && <div className="bg-destructive/20 text-destructive p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput 
            label="Email" 
            type="email" 
            required 
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <FormInput 
            label="Password" 
            type="password" 
            required 
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 rounded font-bold hover:scale-[1.02] transition-dynamic disabled:opacity-50 mt-2 ${bgClass} ${glowClass}`}
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/auth/signup" className={`transition-dynamic hover:underline ${textClass}`}>Sign up</Link>
        </div>
      </Card>
    </div>
  );
}
