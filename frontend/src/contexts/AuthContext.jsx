
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email, password, user_type, extraData) => {
    const res = await supabase.auth.signUp({
      email,
      password,
      options: { data: { user_type } }
    });
    
    if (res.data?.user && !res.error) {
      if (user_type === 'candidate') {
        await supabase.from('candidates').insert({ id: res.data.user.id, name: extraData.name, location: extraData.location });
      } else {
        await supabase.from('companies').insert({ id: res.data.user.id, company_name: extraData.company_name, country: extraData.country });
      }
    }
    return res;
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
