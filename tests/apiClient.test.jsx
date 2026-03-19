import { beforeEach, describe, expect, it, vi } from 'vitest'

const requestUse = vi.fn()
const responseUse = vi.fn()

const mockApiInstance = {
  interceptors: {
    request: { use: requestUse },
    response: { use: responseUse },
  },
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockApiInstance),
  },
}))

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.resetModules()
  })

  it('registers request and response interceptors', async () => {
    const { default: api } = await import('../src/services/apiClient.js')

    expect(api).toBe(mockApiInstance)
    expect(requestUse).toHaveBeenCalledTimes(1)
    expect(responseUse).toHaveBeenCalledTimes(1)
  })

  it('injects Authorization header when token exists', async () => {
    localStorage.setItem('token', 'abc123')
    await import('../src/services/apiClient.js')

    const requestHandler = requestUse.mock.calls[0][0]
    const config = { headers: {} }
    const updated = requestHandler(config)

    expect(updated.headers.Authorization).toBe('Bearer abc123')
  })

  it('removes token on 401 responses', async () => {
    localStorage.setItem('token', 'abc123')
    await import('../src/services/apiClient.js')

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 401 } })).rejects.toEqual({
      response: { status: 401 },
    })
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('keeps token on non-401 response errors', async () => {
    localStorage.setItem('token', 'abc123')
    await import('../src/services/apiClient.js')

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ response: { status: 500 } })).rejects.toEqual({
      response: { status: 500 },
    })
    expect(localStorage.getItem('token')).toBe('abc123')
  })

  it('keeps token when error has no response payload', async () => {
    localStorage.setItem('token', 'abc123')
    await import('../src/services/apiClient.js')

    const responseErrorHandler = responseUse.mock.calls[0][1]

    await expect(responseErrorHandler({ message: 'network error' })).rejects.toEqual({
      message: 'network error',
    })
    expect(localStorage.getItem('token')).toBe('abc123')
  })
})