import api from './apiClient.js'
import * as apimock from './apimock.js'

const useMock = String(import.meta.env.VITE_USE_MOCK || 'false').toLowerCase() === 'true'

const unwrapApiResponse = (payload) => {
  // Backend can return plain payloads or envelopes like { code/message/data } or { status/message/data }.
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    ('code' in payload || 'status' in payload)
  ) {
    return payload.data
  }
  return payload
}

const apiclient = {
  async getAll() {
    const { data } = await api.get('/blueprints')
    return unwrapApiResponse(data)
  },
  async getByAuthor(author) {
    const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}`)
    return unwrapApiResponse(data)
  },
  async getByAuthorAndName(author, name) {
    const { data } = await api.get(
      `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return unwrapApiResponse(data)
  },
  async create(payload) {
    const { data } = await api.post('/blueprints', payload)
    return unwrapApiResponse(data)
  },
  async addPoint(author, name, point) {
    const payload = { x: Number(point?.x), y: Number(point?.y) }
    const { data } = await api.put(
      `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}/points`,
      payload,
    )
    return unwrapApiResponse(data)
  },
  async update(author, name, payload) {
    // Backward-compatible helper: when called with a full blueprint payload,
    // persist only the latest point through the API contract (/points).
    const latestPoint = Array.isArray(payload?.points) ? payload.points.at(-1) : payload
    return this.addPoint(author, name, latestPoint)
  },
  async remove(author, name) {
    const { data } = await api.delete(
      `/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`,
    )
    return unwrapApiResponse(data)
  },
}

export const isMockMode = useMock

const service = useMock ? apimock : apiclient
export default service
