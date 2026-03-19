import { useState } from 'react'

export default function BlueprintForm({ onSubmit, isSubmitting = false }) {
  const [author, setAuthor] = useState('')
  const [name, setName] = useState('')
  const [pointsJSON, setPointsJSON] = useState('[{"x":10,"y":10},{"x":40,"y":60}]')
  const [error, setError] = useState('')

  const resetForm = () => {
    setAuthor('')
    setName('')
    setPointsJSON('[{"x":10,"y":10},{"x":40,"y":60}]')
  }

  const handle = async (e) => {
    e.preventDefault()
    setError('')

    if (!author.trim() || !name.trim()) {
      setError('Author and name are required.')
      return
    }

    try {
      const points = JSON.parse(pointsJSON)
      if (!Array.isArray(points)) {
        setError('Points must be a JSON array.')
        return
      }

      await onSubmit({ author: author.trim(), name: name.trim(), points })
      resetForm()
    } catch (e) {
      setError('Invalid points JSON.')
    }
  }

  return (
    <form onSubmit={handle} className="card">
      <h3 style={{ marginTop: 0 }}>Create Blueprint</h3>
      <div className="grid cols-2">
        <div>
          <label htmlFor="author">Author</label>
          <input
            id="author"
            className="input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="john"
          />
        </div>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="new-blueprint"
          />
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <label htmlFor="points-json">Points (JSON)</label>
        <textarea
          id="points-json"
          className="input"
          rows="5"
          value={pointsJSON}
          onChange={(e) => setPointsJSON(e.target.value)}
        />
      </div>
      {error && <p className="form-error">{error}</p>}
      <div style={{ marginTop: 12 }}>
        <button className="btn primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
