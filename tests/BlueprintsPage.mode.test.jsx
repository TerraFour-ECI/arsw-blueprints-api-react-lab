import { describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import BlueprintsPage from '../src/pages/BlueprintsPage.jsx'

vi.mock('../src/services/blueprintsService.js', () => ({
  isMockMode: true,
  default: {},
}))

vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  createBlueprint: (payload) => ({ type: 'blueprints/createBlueprint', payload }),
  fetchAuthors: () => ({ type: 'blueprints/fetchAuthors' }),
  fetchByAuthor: (author) => ({ type: 'blueprints/fetchByAuthor', payload: author }),
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
  updateBlueprint: () => () => {
    const result = Promise.resolve({})
    result.unwrap = () => Promise.resolve({})
    return result
  },
  deleteBlueprint: () => () => {
    const result = Promise.resolve({})
    result.unwrap = () => Promise.resolve({})
    return result
  },
  addPointToCurrent: (payload) => ({ type: 'blueprints/addPointToCurrent', payload }),
}))

function makeStore() {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current: null,
      status: 'idle',
      error: null,
    },
    reducers: {},
  })
  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintsPage mode badge', () => {
  it('shows MOCK mode badge when service is in mock mode', () => {
    const store = makeStore()

    render(
      <Provider store={store}>
        <BlueprintsPage />
      </Provider>,
    )

    expect(screen.getByText(/Running in MOCK mode/i)).toBeInTheDocument()
  })
})