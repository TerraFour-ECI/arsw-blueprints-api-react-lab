import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createBlueprint,
  fetchAuthors,
  fetchByAuthor,
  fetchBlueprint,
  updateBlueprint,
  deleteBlueprint,
  addPointToCurrent,
} from '../features/blueprints/blueprintsSlice.js'
import BlueprintCanvas from '../components/BlueprintCanvas.jsx'
import BlueprintForm from '../components/BlueprintForm.jsx'
import { isMockMode } from '../services/blueprintsService.js'

export default function BlueprintsPage() {
  const dispatch = useDispatch()
  const { authors, byAuthor, current, status, error } = useSelector((s) => s.blueprints)
  const [authorInput, setAuthorInput] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [submitStatus, setSubmitStatus] = useState('')
  const items = byAuthor[selectedAuthor] || []

  useEffect(() => {
    dispatch(fetchAuthors())
  }, [dispatch])

  const totalPoints = useMemo(
    () => items.reduce((acc, bp) => acc + (bp.points?.length || 0), 0),
    [items],
  )

  const getBlueprints = () => {
    const author = authorInput.trim()
    if (!author) return

    setSubmitStatus('')
    setSelectedAuthor(author)
    dispatch(fetchByAuthor(author))
  }

  const openBlueprint = (bp) => {
    setSubmitStatus('')
    dispatch(fetchBlueprint({ author: bp.author, name: bp.name }))
  }

  const createNewBlueprint = async (payload) => {
    setSubmitStatus('')
    try {
      const result = await dispatch(createBlueprint(payload)).unwrap()
      setSelectedAuthor(result.author)
      setAuthorInput(result.author)
      await dispatch(fetchByAuthor(result.author)).unwrap()
      setSubmitStatus('Blueprint created successfully.')
    } catch (e) {
      setSubmitStatus(e?.message || 'Unable to create blueprint.')
      throw e
    }
  }

  return (
    <div className="page-stack">
      <section className="hero card">
        <div>
          <p className="hero-kicker">Lab #6 - Part 3</p>
          <h2 style={{ marginTop: 0, marginBottom: 6 }}>Blueprint Explorer UI</h2>
          <p className="muted" style={{ margin: 0 }}>
            Query authors, visualize selected blueprints, and create new ones with Redux Toolkit.
          </p>
        </div>
        <div className="mode-badge" aria-label="service mode badge">
          {isMockMode ? 'Running in MOCK mode' : 'Running in API CLIENT mode'}
        </div>
      </section>

      <div className="grid layout-2col">
      <section className="grid" style={{ gap: 16 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Blueprints</h2>
          <div className="toolbar-row">
            <input
              className="input"
              list="authors-list"
              placeholder="Author"
              value={authorInput}
              onChange={(e) => setAuthorInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') getBlueprints()
              }}
            />
            <button className="btn primary" onClick={getBlueprints}>
              Get blueprints
            </button>
          </div>
          {!!authors.length && (
            <datalist id="authors-list">
              {authors.map((author) => (
                <option key={author} value={author} />
              ))}
            </datalist>
          )}
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {selectedAuthor ? `${selectedAuthor}'s blueprints:` : 'Results'}
          </h3>
          {status === 'loading' && <p>Loading...</p>}
          {!items.length && status !== 'loading' && <p>No results.</p>}
          {!!items.length && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: 'left',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Blueprint name
                    </th>
                    <th
                      style={{
                        textAlign: 'right',
                        padding: '8px',
                        borderBottom: '1px solid #334155',
                      }}
                    >
                      Number of points
                    </th>
                    <th style={{ padding: '8px', borderBottom: '1px solid #334155' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((bp) => (
                    <tr key={bp.name}>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        {bp.name}
                      </td>
                      <td
                        style={{
                          padding: '8px',
                          textAlign: 'right',
                          borderBottom: '1px solid #1f2937',
                        }}
                      >
                        {bp.points?.length || 0}
                      </td>
                      <td style={{ padding: '8px', borderBottom: '1px solid #1f2937' }}>
                        <button className="btn" onClick={() => openBlueprint(bp)}>
                          Open
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p style={{ marginTop: 12, fontWeight: 700 }}>Total user points: {totalPoints}</p>
        </div>

        <BlueprintForm onSubmit={createNewBlueprint} isSubmitting={status === 'loading'} />
        {submitStatus && (
          <p className={submitStatus.includes('successfully') ? 'form-success' : 'form-error'}>
            {submitStatus}
          </p>
        )}
      </section>

      <section className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ marginTop: 0, marginBottom: 0 }}>Current blueprint: {current?.name || '—'}</h3>
          {current && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                className="btn primary" 
                onClick={() => {
                  setSubmitStatus('');
                  dispatch(updateBlueprint({ author: current.author, name: current.name, payload: current }))
                    .unwrap()
                    .then(() => setSubmitStatus('Blueprint updated successfully.'))
                    .catch(e => setSubmitStatus('Failed to update blueprint: ' + e.message));
                }}
              >
                Save
              </button>
              <button 
                className="btn" 
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
                onClick={() => {
                  setSubmitStatus('');
                  dispatch(deleteBlueprint({ author: current.author, name: current.name }))
                    .unwrap()
                    .then(() => setSubmitStatus('Blueprint deleted successfully.'))
                    .catch(e => setSubmitStatus('Failed to delete blueprint: ' + e.message));
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
        <BlueprintCanvas 
          points={current?.points || []} 
          onAddPoint={current ? (pt) => dispatch(addPointToCurrent(pt)) : undefined}
        />
        <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>
          {current 
            ? "Click on the canvas to add a new point." 
            : "Select a blueprint from the table to render it on the canvas."}
        </p>
      </section>
      </div>
    </div>
  )
}
