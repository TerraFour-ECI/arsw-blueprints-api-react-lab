import { beforeEach, describe, expect, it, vi } from 'vitest'

const loadModule = async () => import('../src/services/apimock.js')

describe('apimock service', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns blueprints by author', async () => {
    const apimock = await loadModule()
    const result = await apimock.getByAuthor('john')

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((bp) => bp.author === 'john')).toBe(true)
  })

  it('returns all seed blueprints', async () => {
    const apimock = await loadModule()
    const all = await apimock.getAll()

    expect(all.length).toBeGreaterThanOrEqual(3)
  })

  it('returns a blueprint by author and name when it exists', async () => {
    const apimock = await loadModule()
    const bp = await apimock.getByAuthorAndName('john', 'house')

    expect(bp.author).toBe('john')
    expect(bp.name).toBe('house')
  })

  it('creates, updates and deletes a blueprint', async () => {
    const apimock = await loadModule()
    const created = await apimock.create({
      author: 'qa',
      name: 'integration-shape',
      points: [{ x: 1, y: 1 }],
    })

    const updated = await apimock.update(created.author, created.name, {
      points: [{ x: 1, y: 1 }, { x: 3, y: 4 }],
    })

    expect(updated.points).toHaveLength(2)

    const removed = await apimock.remove(created.author, created.name)
    expect(removed).toBe(true)

    await expect(apimock.getByAuthorAndName(created.author, created.name)).rejects.toThrow(
      /Blueprint not found/i,
    )
  })

  it('rejects duplicate blueprint creation', async () => {
    const apimock = await loadModule()

    await expect(
      apimock.create({
        author: 'john',
        name: 'house',
        points: [],
      }),
    ).rejects.toThrow(/already exists/i)
  })

  it('rejects creation when author or name are missing', async () => {
    const apimock = await loadModule()

    await expect(
      apimock.create({
        author: '',
        name: 'shape',
        points: [],
      }),
    ).rejects.toThrow(/required/i)

    await expect(
      apimock.create({
        author: 'john',
        name: '',
        points: [],
      }),
    ).rejects.toThrow(/required/i)
  })

  it('rejects when getByAuthorAndName target does not exist', async () => {
    const apimock = await loadModule()
    await expect(apimock.getByAuthorAndName('nobody', 'nothing')).rejects.toThrow(/not found/i)
  })

  it('rejects update and remove for unknown blueprint', async () => {
    const apimock = await loadModule()

    await expect(apimock.update('ghost', 'shape', { points: [] })).rejects.toThrow(/not found/i)
    await expect(apimock.remove('ghost', 'shape')).rejects.toThrow(/not found/i)
  })

  it('normalizes non-array points into empty points list', async () => {
    const apimock = await loadModule()

    const created = await apimock.create({
      author: 'qa',
      name: 'normalize-points',
      points: 'not-an-array',
    })

    expect(created.points).toEqual([])

    await apimock.remove(created.author, created.name)
  })
})