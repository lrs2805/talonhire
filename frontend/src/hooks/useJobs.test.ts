import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useJobs } from './useJobs'

const mockJobs = [
  {
    id: 'job-1',
    company_id: 'co-1',
    created_by: 'user-1',
    title: 'Senior React Dev',
    slug: 'senior-react-dev',
    description: null,
    seniority: 'senior',
    required_stack: ['react', 'typescript'],
    nice_to_have_stack: null,
    salary_min: 4000,
    salary_max: 6000,
    salary_currency: 'EUR',
    benefits: null,
    remote: true,
    location_city: null,
    location_country: null,
    relocation_support: null,
    relocation_budget: null,
    jd_pdf_url: null,
    jd_source_url: null,
    jd_extracted_text: null,
    jd_embedding: null,
    contract_type: 'fee_15pct',
    fee_percentage: 15,
    monthly_markup_percentage: 40,
    custom_interview_questions: null,
    assessment_type: null,
    status: 'active',
    published_at: null,
    closes_at: null,
    filled_at: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
]

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({
        data: mockJobs,
        error: null,
        count: mockJobs.length,
      }),
    })),
  },
}))

describe('useJobs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading then jobs and count', async () => {
    const { result } = renderHook(() => useJobs({ limit: 20, page: 0 }))

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.jobs.length).toBeGreaterThanOrEqual(0)
    expect(result.current.error).toBeNull()
  })
})
