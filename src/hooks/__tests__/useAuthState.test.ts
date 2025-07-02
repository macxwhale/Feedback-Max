import { renderHook } from '@testing-library/react'
import { useAuthState } from '../useAuthState'
import { supabase } from '@/integrations/supabase/client'

vi.mock('@/integrations/supabase/client')

describe('useAuthState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAuthState())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it('should handle successful authentication', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: mockUser },
      error: null
    })

    const { result } = renderHook(() => useAuthState())

    // Wait for async state updates
    await new Promise(resolve => setTimeout(resolve, 300))

    expect(result.current.user).toEqual(mockUser)
  })

  it('should handle authentication error', async () => {
    const mockError = new Error('Authentication failed')
    
    vi.mocked(supabase.auth.getUser).mockResolvedValue({
      data: { user: null },
      error: mockError
    })

    const { result } = renderHook(() => useAuthState())

    // Wait for async state updates
    await new Promise(resolve => setTimeout(resolve, 300))

    expect(result.current.user).toBeNull()
  })
})