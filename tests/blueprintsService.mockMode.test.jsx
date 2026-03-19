import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/services/apimock.js', () => ({
  getAll: vi.fn(async () => [{ author: 'mock', name: 'bp', points: [] }]),
}))

describe('blueprintsService (mock mode)', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('uses apimock when VITE_USE_MOCK=true', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')

    const serviceModule = await import('../src/services/blueprintsService.js')
    const service = serviceModule.default

    const all = await service.getAll()

    expect(serviceModule.isMockMode).toBe(true)
    expect(all[0].author).toBe('mock')
    vi.unstubAllEnvs()
  })
})