import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock action creators so the test does not require a backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => {
  const makeAsyncThunkResult = (payload, shouldReject = false) => {
    const actionResult = Promise.resolve(payload)
    actionResult.unwrap = () =>
      shouldReject ? Promise.reject(new Error('mock thunk failure')) : Promise.resolve(payload)
    return () => actionResult
  }

  return {
    createBlueprint: (payload) => ({ type: 'blueprints/createBlueprint', payload }),
    fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
    fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
    fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
    updateBlueprint: (payload) => makeAsyncThunkResult(payload, payload?.name === 'fail-update'),
    deleteBlueprint: (payload) => makeAsyncThunkResult(payload, payload?.name === 'fail-delete'),
    addPointToCurrent: (payload) => ({ type: 'blueprints/addPointToCurrent', payload }),
  }
})

function makeStore(preloaded) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
      ...preloaded,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage', () => {
  it('dispatches fetchByAuthor when clicking Get blueprints', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'JohnConnor' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'JohnConnor' })
  })

  it('does not dispatch fetchByAuthor when author input is empty', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.click(screen.getByText(/Get blueprints/i))

    const fetchByAuthorCalls = spy.mock.calls.filter(
      (call) => call?.[0]?.type === 'blueprints/fetchByAuthor',
    )
    expect(fetchByAuthorCalls).toHaveLength(0)
  })

  it('dispatches fetchByAuthor when pressing Enter in author input', () => {
    const store = makeStore()
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const input = screen.getByPlaceholderText(/Author/i)
    fireEvent.change(input, { target: { value: 'john' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    expect(spy).toHaveBeenCalledWith({ type: 'blueprints/fetchByAuthor', payload: 'john' })
  })

  it('dispatches fetchBlueprint when clicking Open in table', () => {
    const store = makeStore({
      byAuthor: {
        john: [{ author: 'john', name: 'house', points: [{ x: 1, y: 2 }] }],
      },
    })
    const spy = vi.spyOn(store, 'dispatch')
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'john' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))
    fireEvent.click(screen.getByText(/Open/i))

    expect(spy).toHaveBeenCalledWith({
      type: 'blueprints/fetchBlueprint',
      payload: { author: 'john', name: 'house' },
    })
  })

  it('dispatches addPointToCurrent when clicking on canvas and current blueprint exists', () => {
    const store = makeStore({
      current: {
        author: 'john',
        name: 'house',
        points: [{ x: 10, y: 10 }],
      },
    })
    const spy = vi.spyOn(store, 'dispatch')
    const { container } = render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    const canvas = container.querySelector('canvas')
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 520, height: 360 })
    fireEvent.click(canvas, { clientX: 110, clientY: 110 })

    expect(spy).toHaveBeenCalledWith({
      type: 'blueprints/addPointToCurrent',
      payload: expect.objectContaining({ x: expect.any(Number), y: expect.any(Number) }),
    })
  })

  it('dispatches updateBlueprint flow when clicking Save', async () => {
    const store = makeStore({
      current: {
        author: 'john',
        name: 'house',
        points: [{ x: 1, y: 2 }],
      },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[1])

    expect(await screen.findByText(/Blueprint updated successfully/i)).toBeInTheDocument()
  })

  it('dispatches deleteBlueprint flow when clicking Delete', async () => {
    const store = makeStore({
      current: {
        author: 'john',
        name: 'house',
        points: [{ x: 1, y: 2 }],
      },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))

    expect(await screen.findByText(/Blueprint deleted successfully/i)).toBeInTheDocument()
  })

  it('shows update error feedback when save fails', async () => {
    const store = makeStore({
      current: {
        author: 'john',
        name: 'fail-update',
        points: [{ x: 1, y: 2 }],
      },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[1])
    expect(await screen.findByText(/Failed to update blueprint/i)).toBeInTheDocument()
  })

  it('shows delete error feedback when delete fails', async () => {
    const store = makeStore({
      current: {
        author: 'john',
        name: 'fail-delete',
        points: [{ x: 1, y: 2 }],
      },
    })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.click(screen.getByRole('button', { name: /Delete/i }))
    expect(await screen.findByText(/Failed to delete blueprint/i)).toBeInTheDocument()
  })

  it('renders service error message from slice state', () => {
    const store = makeStore({ error: 'backend unavailable' })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/backend unavailable/i)).toBeInTheDocument()
  })

  it('renders loading indicator when status is loading', () => {
    const store = makeStore({ status: 'loading' })
    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('renders authors datalist and zero points fallback in table', () => {
    const store = makeStore({
      authors: ['john'],
      byAuthor: {
        john: [{ author: 'john', name: 'empty-shape' }],
      },
    })

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByPlaceholderText(/Author/i), { target: { value: 'john' } })
    fireEvent.click(screen.getByText(/Get blueprints/i))

    expect(document.getElementById('authors-list')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
