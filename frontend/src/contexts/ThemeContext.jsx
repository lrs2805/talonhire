
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [customColors, setCustomColors] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);

    if (theme === 'custom' && customColors) {
      Object.entries(customColors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
      });
    } else {
      // Reset inline styles if not custom
      document.documentElement.style = '';
    }

    if (user) {
      supabase.from('user_preferences').upsert({ 
        user_id: user.id, 
        theme,
        custom_colors: customColors 
      }, { onConflict: 'user_id' }).then();
    }
  }, [theme, customColors, user]);

  useEffect(() => {
    if (user) {
      supabase.from('user_preferences').select('theme, custom_colors').eq('user_id', user.id).single()
        .then(({ data }) => {
          if (data) {
            if (data.theme) setTheme(data.theme);
            if (data.custom_colors) setCustomColors(data.custom_colors);
          }
        });
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
