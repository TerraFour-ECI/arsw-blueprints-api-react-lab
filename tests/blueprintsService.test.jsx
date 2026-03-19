import { beforeEach, describe, expect, it, vi } from 'vitest'
import service, { isMockMode } from '../src/services/blueprintsService.js'
import api from '../src/services/apiClient.js'

vi.mock('../src/services/apiClient.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('blueprintsService (api mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exposes API client mode when mock flag is disabled', () => {
    expect(isMockMode).toBe(false)
  })

  it('gets all blueprints', async () => {
    api.get.mockResolvedValue({ data: [{ name: 'house' }] })

    const data = await service.getAll()

    expect(api.get).toHaveBeenCalledWith('/blueprints')
    expect(data).toEqual([{ name: 'house' }])
  })

  it('gets by author and by author+name with encoded path params', async () => {
    api.get.mockResolvedValueOnce({ data: [{ author: 'john doe' }] })
    api.get.mockResolvedValueOnce({ data: { author: 'john doe', name: 'my house' } })

    const byAuthor = await service.getByAuthor('john doe')
    const one = await service.getByAuthorAndName('john doe', 'my house')

    expect(api.get).toHaveBeenNthCalledWith(1, '/blueprints/john%20doe')
    expect(api.get).toHaveBeenNthCalledWith(2, '/blueprints/john%20doe/my%20house')
    expect(byAuthor).toHaveLength(1)
    expect(one.name).toBe('my house')
  })

  it('creates, updates and removes using REST endpoints', async () => {
    const payload = { author: 'john', name: 'house', points: [] }
    api.post.mockResolvedValue({ data: payload })
    api.put.mockResolvedValue({ data: { ...payload, points: [{ x: 1, y: 1 }] } })
    api.delete.mockResolvedValue({ data: true })

    const created = await service.create(payload)
    const updated = await service.update('john', 'house', { points: [{ x: 1, y: 1 }] })
    const removed = await service.remove('john', 'house')

    expect(api.post).toHaveBeenCalledWith('/blueprints', payload)
    expect(api.put).toHaveBeenCalledWith('/blueprints/john/house', { points: [{ x: 1, y: 1 }] })
    expect(api.delete).toHaveBeenCalledWith('/blueprints/john/house')
    expect(created.name).toBe('house')
    expect(updated.points).toHaveLength(1)
    expect(removed).toBe(true)
  })
})
