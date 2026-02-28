
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const languages = [
    { code: 'en', name: 'English' }, { code: 'pt', name: 'Português' },
    { code: 'es', name: 'Español' }, { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' }, { code: 'de', name: 'Deutsch' },
    { code: 'nl', name: 'Nederlands' }, { code: 'pl', name: 'Polski' },
    { code: 'ru', name: 'Русский' }, { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' }
  ];

  const changeLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    if (user) {
      await supabase.from('user_preferences').upsert({ user_id: user.id, language: lng }, { onConflict: 'user_id' });
    }
  };

  useEffect(() => {
    if (user) {
      supabase.from('user_preferences').select('language').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (data && data.language) {
            i18n.changeLanguage(data.language);
          }
        });
    }
  }, [user, i18n]);

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors">
        <Globe className="w-4 h-4" />
        <span className="text-sm uppercase">{i18n.language?.split('-')[0] || 'EN'}</span>
      </button>
      <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="max-h-64 overflow-y-auto py-1">
          {languages.map(lng => (
            <button
              key={lng.code}
              onClick={() => changeLanguage(lng.code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted ${i18n.language?.startsWith(lng.code) ? 'text-primary font-bold bg-primary/10' : ''}`}
            >
              {lng.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
