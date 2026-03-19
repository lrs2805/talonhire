import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SharePage from './SharePage'

const mockValidate = vi.fn((token: string) =>
  Promise.resolve(
    token === 'valid-token'
      ? { matching_id: 'm1', job_title: 'Engineer', candidate_name: 'John', is_valid: true }
      : token === 'expired-token'
        ? { matching_id: 'm2', job_title: 'Dev', candidate_name: 'Jane', is_valid: false }
        : null
  )
)

vi.mock('../hooks/useShareLink', () => ({
  useShareLink: () => ({
    validateLink: mockValidate,
    loading: false,
    error: null,
  }),
}))

vi.mock('../lib/edgeFunctions', () => ({
  rejectMatchByToken: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: {} }),
}))

function renderWithRouter(token: string) {
  return render(
    <MemoryRouter initialEntries={[`/share/${token}`]}>
      <Routes>
        <Route path="/share/:token" element={<SharePage />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('SharePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows candidate and job when token is valid', async () => {
    renderWithRouter('valid-token')
    await screen.findByText(/John/)
    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText(/Engineer/)).toBeInTheDocument()
  })

  it('shows expired state when token is expired', async () => {
    renderWithRouter('expired-token')
    await screen.findByText(/share.expired/)
    expect(screen.getByText(/share.expired/)).toBeInTheDocument()
  })
})
