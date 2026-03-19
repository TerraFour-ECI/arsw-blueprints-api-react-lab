import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

// Mock slice thunks so the test does not require a backend
vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  createBlueprint: (payload) => ({ type: 'blueprints/createBlueprint', payload }),
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
}))

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
})
