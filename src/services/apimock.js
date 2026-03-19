const seedBlueprints = [
  {
    author: 'john',
    name: 'house',
    points: [
      { x: 25, y: 30 },
      { x: 150, y: 30 },
      { x: 150, y: 140 },
      { x: 25, y: 140 },
      { x: 25, y: 30 },
    ],
  },
  {
    author: 'john',
    name: 'kite',
    points: [
      { x: 90, y: 20 },
      { x: 160, y: 110 },
      { x: 90, y: 190 },
      { x: 20, y: 110 },
      { x: 90, y: 20 },
    ],
  },
  {
    author: 'maria',
    name: 'bridge',
    points: [
      { x: 20, y: 130 },
      { x: 80, y: 60 },
      { x: 140, y: 130 },
      { x: 200, y: 60 },
      { x: 260, y: 130 },
    ],
  },
]

const db = structuredClone(seedBlueprints)

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))

const clone = (value) => structuredClone(value)

const normalizePoints = (points) =>
  Array.isArray(points)
    ? points.map((point) => ({
        x: Number(point.x),
        y: Number(point.y),
      }))
    : []

const findIndexByKey = (author, name) =>
  db.findIndex((bp) => bp.author === author && bp.name === name)

export async function getAll() {
  await delay()
  return clone(db)
}

export async function getByAuthor(author) {
  await delay()
  const result = db.filter((bp) => bp.author === author)
  return clone(result)
}

export async function getByAuthorAndName(author, name) {
  await delay()
  const bp = db.find((item) => item.author === author && item.name === name)
  if (!bp) {
    throw new Error('Blueprint not found')
  }
  return clone(bp)
}

export async function create(payload) {
  await delay()
  const author = payload?.author?.trim()
  const name = payload?.name?.trim()
  const points = normalizePoints(payload?.points)

  if (!author || !name) {
    throw new Error('Author and name are required')
  }

  if (findIndexByKey(author, name) >= 0) {
    throw new Error('A blueprint with this author and name already exists')
  }

  const blueprint = { author, name, points }
  db.push(blueprint)
  return clone(blueprint)
}
