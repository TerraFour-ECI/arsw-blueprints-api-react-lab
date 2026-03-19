import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { fireEvent, render, screen } from '@testing-library/react'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

const { getByAuthorAndNameMock, addPointMock } = vi.hoisted(() => ({
  getByAuthorAndNameMock: vi.fn(() => Promise.reject({ response: { status: 404 } })),
  addPointMock: vi.fn(() => Promise.resolve({ code: 202 })),
}))

vi.mock('../src/services/blueprintsService.js', () => ({
  isMockMode: false,
  default: {
    getByAuthorAndName: getByAuthorAndNameMock,
    addPoint: addPointMock,
  },
}))

vi.mock('../src/features/blueprints/blueprintsSlice.js', () => {
  const makeThunkResult = (payload, shouldReject = false) => {
    const result = Promise.resolve(payload)
    result.unwrap = () =>
      shouldReject ? Promise.reject(new Error('create rejected')) : Promise.resolve(payload)
    return () => result
  }

  return {
    createBlueprint: (payload) => makeThunkResult(payload, payload?.name === 'fail-create'),
    fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
    fetchByAuthor: (author) => makeThunkResult({ author, items: [] }),
    fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
    updateBlueprint: (payload) => makeThunkResult(payload),
    deleteBlueprint: (payload) => makeThunkResult(payload),
    addPointToCurrent: (payload) => ({ type: 'blueprints/addPointToCurrent', payload }),
  }
})

function makeStore() {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: ['john'],
      byAuthor: { john: [] },
      current: null,
      status: 'idle',
      error: null,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage create flow', () => {
  beforeEach(() => {
    getByAuthorAndNameMock.mockReset()
    getByAuthorAndNameMock.mockImplementation(() => Promise.reject({ response: { status: 404 } }))
    addPointMock.mockReset()
    addPointMock.mockResolvedValue({ code: 202 })
  })

  it('shows duplicate message and skips create when blueprint already exists', async () => {
    getByAuthorAndNameMock.mockResolvedValueOnce({ author: 'john', name: 'house', points: [] })
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'house' } })
    fireEvent.change(screen.getByLabelText(/Points/i), { target: { value: '[{"x":1,"y":2}]' } })
    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[0])

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument()
  })

  it('shows lookup error feedback when duplicate pre-check fails with non-404', async () => {
    getByAuthorAndNameMock.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Lookup service unavailable' } },
      message: 'Request failed with status code 500',
    })
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'new-shape' } })
    fireEvent.change(screen.getByLabelText(/Points/i), { target: { value: '[{"x":1,"y":2}]' } })
    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[0])

    expect(await screen.findByText(/Lookup service unavailable/i)).toBeInTheDocument()
  })

  it('shows success feedback after create form submit', async () => {
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'new-shape' } })
    fireEvent.change(screen.getByLabelText(/Points/i), { target: { value: '[{"x":1,"y":2}]' } })
    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[0])

    expect(await screen.findByText(/Blueprint created successfully/i)).toBeInTheDocument()
  })

  it('shows create error feedback when create thunk rejects', async () => {
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    fireEvent.change(screen.getByLabelText(/Author/i), { target: { value: 'john' } })
    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'fail-create' } })
    fireEvent.change(screen.getByLabelText(/Points/i), { target: { value: '[{"x":1,"y":2}]' } })
    fireEvent.click(screen.getAllByRole('button', { name: /^Save$/i })[0])

    expect(await screen.findByText(/create rejected/i)).toBeInTheDocument()
  })
})
