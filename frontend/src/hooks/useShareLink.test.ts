import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useShareLink } from './useShareLink'

const mockValidateResult = {
  matching_id: 'm-1',
  job_title: 'Senior Dev',
  candidate_name: 'Jane Doe',
  is_valid: true,
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: vi.fn((name: string, args: Record<string, string>) => {
      if (name === 'validate_share_link') {
        return Promise.resolve({ data: [mockValidateResult], error: null })
      }
      if (name === 'generate_share_link') {
        return Promise.resolve({ data: [{ token: 'abc123', expires_at: '2026-01-01T00:00:00Z' }], error: null })
      }
      return Promise.resolve({ data: null, error: { message: 'Unknown RPC' } })
    }),
  },
}))

describe('useShareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validateLink returns result when RPC succeeds', async () => {
    const { result } = renderHook(() => useShareLink())
    let data: unknown = null
    await act(async () => {
      data = await result.current.validateLink('token-xyz')
    })
    expect(data).toEqual(mockValidateResult)
  })

  it('generateLink returns token and expires_at when RPC succeeds', async () => {
    const { result } = renderHook(() => useShareLink())
    let data: unknown = null
    await act(async () => {
      data = await result.current.generateLink('matching-id-1')
    })
    expect(data).toMatchObject({ token: 'abc123', expires_at: expect.any(String) })
  })
})
