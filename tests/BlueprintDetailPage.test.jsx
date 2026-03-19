import { describe, expect, it, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore, createSlice } from '@reduxjs/toolkit'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import BlueprintDetailPage from '../src/pages/BlueprintDetailPage.jsx'

vi.mock('../src/features/blueprints/blueprintsSlice.js', () => ({
  fetchBlueprint: (payload) => ({ type: 'blueprints/fetchBlueprint', payload }),
}))

function makeStore(current = null) {
  const slice = createSlice({
    name: 'blueprints',
    initialState: {
      authors: [],
      byAuthor: {},
      current,
      status: 'idle',
      error: null,
    },
    reducers: {},
  })

  return configureStore({ reducer: { blueprints: slice.reducer } })
}

describe('BlueprintDetailPage', () => {
  it('shows loading state when current blueprint is null', () => {
    const store = makeStore(null)

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/blueprints/john/house']}>
          <Routes>
            <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('renders blueprint details and points', () => {
    const current = {
      author: 'john',
      name: 'house',
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 20 },
      ],
    }
    const store = makeStore(current)

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/blueprints/john/house']}>
          <Routes>
            <Route path="/blueprints/:author/:name" element={<BlueprintDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

    expect(screen.getByText('house')).toBeInTheDocument()
    expect(screen.getByText(/Author:/i)).toBeInTheDocument()
    expect(screen.getByText(/Points:/i)).toBeInTheDocument()
    expect(document.querySelectorAll('circle')).toHaveLength(2)
  })
})