export default function BlueprintList({ items = [], onSelect }) {
  if (!items.length) return <p>No blueprints found for this author.</p>
  return (
    <div className="grid">
      {items.map((bp) => (
        <div key={bp.name} className="card">
          <h3 style={{ marginTop: 0 }}>{bp.name}</h3>
          <p>
            <strong>Author:</strong> {bp.author}
          </p>
          <p>
            <strong>Points:</strong> {bp.points ? bp.points.length : 0}
          </p>
          <button className="btn primary" onClick={() => onSelect(bp)}>
            View details
          </button>
        </div>
      ))}
    </div>
  )
}
