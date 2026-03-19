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

  it('unwraps backend ApiResponse envelope payloads', async () => {
    api.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: [{ name: 'wrapped-house' }],
      },
    })

    const data = await service.getAll()
    expect(data).toEqual([{ name: 'wrapped-house' }])
  })

  it('unwraps backend ApiResponse using code/message/data format', async () => {
    api.get.mockResolvedValue({
      data: {
        code: 200,
        message: 'execute ok',
        data: [{ author: 'alice', name: 'office', points: [] }],
      },
    })

    const data = await service.getByAuthor('alice')
    expect(data).toEqual([{ author: 'alice', name: 'office', points: [] }])
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

  it('creates, adds points, updates (compat) and removes using REST endpoints', async () => {
    const payload = { author: 'john', name: 'house', points: [] }
    api.post.mockResolvedValue({ data: payload })
    api.put.mockResolvedValue({ data: { code: 202, message: 'point added', data: null } })
    api.delete.mockResolvedValue({ data: true })

    const created = await service.create(payload)
    await service.addPoint('john', 'house', { x: 1, y: 1 })
    const updated = await service.update('john', 'house', { points: [{ x: 1, y: 1 }] })
    const removed = await service.remove('john', 'house')

    expect(api.post).toHaveBeenCalledWith('/blueprints', payload)
    expect(api.put).toHaveBeenNthCalledWith(1, '/blueprints/john/house/points', { x: 1, y: 1 })
    expect(api.put).toHaveBeenNthCalledWith(2, '/blueprints/john/house/points', { x: 1, y: 1 })
    expect(api.delete).toHaveBeenCalledWith('/blueprints/john/house')
    expect(created.name).toBe('house')
    expect(updated).toBeNull()
    expect(removed).toBe(true)
  })
})
