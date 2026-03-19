import { beforeEach, describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import reducer, {
  addPointToCurrent,
  createBlueprint,
  deleteBlueprint,
  fetchAuthors,
  fetchBlueprint,
  fetchByAuthor,
  updateBlueprint,
} from '../src/features/blueprints/blueprintsSlice.js'
import blueprintsService from '../src/services/blueprintsService.js'

vi.mock('../src/services/blueprintsService.js', () => ({
  default: {
    getAll: vi.fn(),
    getByAuthor: vi.fn(),
    getByAuthorAndName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}))

const makeStore = () => configureStore({ reducer: { blueprints: reducer } })

describe('blueprints slice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with expected defaults', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.authors).toEqual([])
    expect(state.byAuthor).toEqual({})
    expect(state.current).toBeNull()
    expect(state.status).toBe('idle')
  })

  it('adds a point to current blueprint', () => {
    const initial = {
      authors: [],
      byAuthor: {},
      current: { author: 'john', name: 'house', points: [{ x: 1, y: 2 }] },
      status: 'idle',
      error: null,
    }
    const next = reducer(initial, addPointToCurrent({ x: 10, y: 20 }))
    expect(next.current.points).toEqual([
      { x: 1, y: 2 },
      { x: 10, y: 20 },
    ])
  })

  it('initializes points array when current exists without points', () => {
    const initial = {
      authors: [],
      byAuthor: {},
      current: { author: 'john', name: 'house' },
      status: 'idle',
      error: null,
    }

    const next = reducer(initial, addPointToCurrent({ x: 7, y: 9 }))
    expect(next.current.points).toEqual([{ x: 7, y: 9 }])
  })

  it('ignores addPointToCurrent when there is no current blueprint', () => {
    const initial = {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    }

    const next = reducer(initial, addPointToCurrent({ x: 7, y: 9 }))
    expect(next.current).toBeNull()
  })

  it('fetchAuthors stores unique authors and sets succeeded state', async () => {
    blueprintsService.getAll.mockResolvedValue([
      { author: 'john' },
      { author: 'john' },
      { author: 'maria' },
    ])
    const store = makeStore()

    await store.dispatch(fetchAuthors())

    const state = store.getState().blueprints
    expect(state.status).toBe('succeeded')
    expect(state.authors).toEqual(['john', 'maria'])
  })

  it('fetchAuthors handles non-array payloads defensively', async () => {
    blueprintsService.getAll.mockResolvedValue({ unexpected: true })
    const store = makeStore()

    await store.dispatch(fetchAuthors())

    const state = store.getState().blueprints
    expect(state.authors).toEqual([])
    expect(state.status).toBe('succeeded')
  })

  it('fetchByAuthor stores items keyed by author', async () => {
    blueprintsService.getByAuthor.mockResolvedValue([
      { author: 'john', name: 'house', points: [] },
      { author: 'john', name: 'kite', points: [] },
    ])
    const store = makeStore()

    await store.dispatch(fetchByAuthor('john'))

    const state = store.getState().blueprints
    expect(state.status).toBe('succeeded')
    expect(state.byAuthor.john).toHaveLength(2)
    expect(state.authors).toContain('john')
  })

  it('fetchByAuthor stores empty list when payload is not an array', async () => {
    blueprintsService.getByAuthor.mockResolvedValue({ wrapped: true })
    const store = makeStore()

    await store.dispatch(fetchByAuthor('john'))

    const state = store.getState().blueprints
    expect(state.byAuthor.john).toEqual([])
  })

  it('fetchBlueprint handles rejection and sets error', async () => {
    blueprintsService.getByAuthorAndName.mockRejectedValue(new Error('network down'))
    const store = makeStore()

    await store.dispatch(fetchBlueprint({ author: 'john', name: 'house' }))

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('network down')
  })

  it('fetchBlueprint sets current on fulfilled response', async () => {
    const bp = { author: 'john', name: 'house', points: [{ x: 1, y: 2 }] }
    blueprintsService.getByAuthorAndName.mockResolvedValue(bp)
    const store = makeStore()

    await store.dispatch(fetchBlueprint({ author: 'john', name: 'house' }))

    const state = store.getState().blueprints
    expect(state.status).toBe('succeeded')
    expect(state.current).toEqual(bp)
  })

  it('createBlueprint inserts blueprint and updates current', async () => {
    const created = { author: 'john', name: 'new-home', points: [{ x: 1, y: 1 }] }
    blueprintsService.create.mockResolvedValue(created)
    const store = makeStore()

    await store.dispatch(createBlueprint(created))

    const state = store.getState().blueprints
    expect(state.current).toEqual(created)
    expect(state.byAuthor.john).toEqual([created])
    expect(state.authors).toContain('john')
  })

  it('updateBlueprint replaces matching byAuthor element and current', async () => {
    const store = makeStore()
    blueprintsService.create.mockResolvedValue({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 1 }],
    })
    await store.dispatch(
      createBlueprint({ author: 'john', name: 'house', points: [{ x: 1, y: 1 }] }),
    )
    blueprintsService.update.mockResolvedValue({
      author: 'john',
      name: 'house',
      points: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    })

    await store.dispatch(
      updateBlueprint({
        author: 'john',
        name: 'house',
        payload: {
          points: [
            { x: 1, y: 1 },
            { x: 2, y: 2 },
          ],
        },
      }),
    )

    const state = store.getState().blueprints
    expect(state.byAuthor.john[0].points).toHaveLength(2)
    expect(state.current.points).toHaveLength(2)
  })

  it('updateBlueprint does not mutate byAuthor when author bucket does not exist', async () => {
    const store = makeStore()
    blueprintsService.update.mockResolvedValue({
      author: 'ghost',
      name: 'none',
      points: [{ x: 1, y: 1 }],
    })

    await store.dispatch(
      updateBlueprint({ author: 'ghost', name: 'none', payload: { points: [{ x: 1, y: 1 }] } }),
    )

    const state = store.getState().blueprints
    expect(state.byAuthor.ghost).toBeUndefined()
  })

  it('updateBlueprint keeps byAuthor element when name is not found in existing author bucket', async () => {
    const store = makeStore()
    blueprintsService.create.mockResolvedValue({
      author: 'john',
      name: 'house',
      points: [{ x: 1, y: 1 }],
    })
    await store.dispatch(
      createBlueprint({ author: 'john', name: 'house', points: [{ x: 1, y: 1 }] }),
    )

    blueprintsService.update.mockResolvedValue({
      author: 'john',
      name: 'another-shape',
      points: [{ x: 9, y: 9 }],
    })

    await store.dispatch(
      updateBlueprint({
        author: 'john',
        name: 'another-shape',
        payload: { points: [{ x: 9, y: 9 }] },
      }),
    )

    const state = store.getState().blueprints
    expect(state.byAuthor.john).toHaveLength(1)
    expect(state.byAuthor.john[0].name).toBe('house')
  })

  it('deleteBlueprint removes blueprint and clears current when same element', async () => {
    const store = makeStore()
    blueprintsService.create.mockResolvedValue({
      author: 'john',
      name: 'to-delete',
      points: [],
    })
    blueprintsService.remove.mockResolvedValue(true)
    await store.dispatch(createBlueprint({ author: 'john', name: 'to-delete', points: [] }))

    await store.dispatch(deleteBlueprint({ author: 'john', name: 'to-delete' }))

    const state = store.getState().blueprints
    expect(state.byAuthor.john).toEqual([])
    expect(state.current).toBeNull()
  })

  it('deleteBlueprint leaves current when payload does not match current blueprint', async () => {
    const store = makeStore()
    blueprintsService.create.mockResolvedValue({
      author: 'john',
      name: 'house',
      points: [],
    })
    blueprintsService.remove.mockResolvedValue(true)
    await store.dispatch(createBlueprint({ author: 'john', name: 'house', points: [] }))

    await store.dispatch(deleteBlueprint({ author: 'john', name: 'other' }))

    const state = store.getState().blueprints
    expect(state.current?.name).toBe('house')
  })

  it('fetchAuthors handles rejection', async () => {
    blueprintsService.getAll.mockRejectedValue(new Error('authors failure'))
    const store = makeStore()

    await store.dispatch(fetchAuthors())

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('authors failure')
  })

  it('fetchByAuthor handles rejection', async () => {
    blueprintsService.getByAuthor.mockRejectedValue(new Error('author failure'))
    const store = makeStore()

    await store.dispatch(fetchByAuthor('john'))

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('author failure')
  })

  it('createBlueprint handles rejection', async () => {
    blueprintsService.create.mockRejectedValue(new Error('create failure'))
    const store = makeStore()

    await store.dispatch(createBlueprint({ author: 'john', name: 'x', points: [] }))

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('create failure')
  })

  it('updateBlueprint handles rejection', async () => {
    blueprintsService.update.mockRejectedValue(new Error('update failure'))
    const store = makeStore()

    await store.dispatch(
      updateBlueprint({ author: 'john', name: 'house', payload: { points: [] } }),
    )

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('update failure')
  })

  it('deleteBlueprint handles rejection', async () => {
    blueprintsService.remove.mockRejectedValue(new Error('delete failure'))
    const store = makeStore()

    await store.dispatch(deleteBlueprint({ author: 'john', name: 'house' }))

    const state = store.getState().blueprints
    expect(state.status).toBe('failed')
    expect(state.error).toContain('delete failure')
  })

  it('uses default rejected messages when thunk error message is missing', () => {
    const initial = reducer(undefined, { type: '@@INIT' })

    let state = reducer(initial, { type: fetchAuthors.rejected.type, error: {} })
    expect(state.error).toBe('Unable to load authors')

    state = reducer(initial, { type: fetchByAuthor.rejected.type, error: {} })
    expect(state.error).toBe('Unable to load blueprints for this author')

    state = reducer(initial, { type: fetchBlueprint.rejected.type, error: {} })
    expect(state.error).toBe('Unable to load blueprint details')

    state = reducer(initial, { type: createBlueprint.rejected.type, error: {} })
    expect(state.error).toBe('Unable to create blueprint')

    state = reducer(initial, { type: updateBlueprint.rejected.type, error: {} })
    expect(state.error).toBe('Unable to update blueprint')

    state = reducer(initial, { type: deleteBlueprint.rejected.type, error: {} })
    expect(state.error).toBe('Unable to delete blueprint')
  })
})
