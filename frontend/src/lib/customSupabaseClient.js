import { createClient } from '@supabase/supabase-js';

// Usar environment variables se disponíveis, fallback para valores hardcoded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zluwxdsjtvqhguxdhsxm.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsdXd4ZHNqdHZxaGd1eGRoc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyOTQ5NDQsImV4cCI6MjA4Nzg3MDk0NH0.tWhRbz9yTzIzSnDZGmM92jnw5CFj8gLZPESox6K8ggY';

// Log para debug (remover em produção)
if (typeof window !== 'undefined') {
  console.log('Supabase Config:', {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'not set',
    hasEnvUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasEnvKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });
}

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
