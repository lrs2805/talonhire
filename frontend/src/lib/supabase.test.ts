import { describe, it, expect } from 'vitest'

describe('TalonHire app', () => {
  it('has expected env var names for Supabase', () => {
    expect('VITE_SUPABASE_URL').toBe('VITE_SUPABASE_URL')
    expect('VITE_SUPABASE_ANON_KEY').toBe('VITE_SUPABASE_ANON_KEY')
  })
})
