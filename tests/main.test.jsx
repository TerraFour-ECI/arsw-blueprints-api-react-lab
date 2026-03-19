import { beforeEach, describe, expect, it, vi } from 'vitest'

const renderMock = vi.fn()
const createRootMock = vi.fn(() => ({ render: renderMock }))

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: createRootMock,
  },
}))

vi.mock('../src/App.jsx', () => ({
  default: () => <div>app shell</div>,
}))

vi.mock('../src/store', () => ({
  default: {
    getState: () => ({}),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}))

describe('main entrypoint', () => {
  beforeEach(() => {
    vi.resetModules()
    renderMock.mockClear()
    createRootMock.mockClear()
    document.body.innerHTML = '<div id="root"></div>'
  })

  it('mounts app into root container', async () => {
    await import('../src/main.jsx')

    const rootEl = document.getElementById('root')
    expect(createRootMock).toHaveBeenCalledWith(rootEl)
    expect(renderMock).toHaveBeenCalledTimes(1)
  })
})