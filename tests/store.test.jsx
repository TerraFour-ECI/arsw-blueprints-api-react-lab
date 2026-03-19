import { describe, expect, it } from 'vitest'
import store from '../src/store/index.js'

describe('redux store', () => {
  it('exposes blueprints slice state', () => {
    const state = store.getState()
    expect(state).toHaveProperty('blueprints')
    expect(state.blueprints).toHaveProperty('authors')
    expect(state.blueprints).toHaveProperty('status')
  })

  it('allows dispatching plain actions', () => {
    const result = store.dispatch({ type: 'unknown/action' })
    expect(result).toEqual({ type: 'unknown/action' })
  })
})