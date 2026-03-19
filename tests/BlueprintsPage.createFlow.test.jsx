import { describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { fireEvent, render, screen } from '@testing-library/react'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

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
