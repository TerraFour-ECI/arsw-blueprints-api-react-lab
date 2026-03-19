import api from './apiClient.js'
import * as apimock from './apimock.js'

const useMock = String(import.meta.env.VITE_USE_MOCK || 'false').toLowerCase() === 'true'

const apiclient = {
  async getAll() {
    const { data } = await api.get('/blueprints')
    return data
  },
  async getByAuthor(author) {
    const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}`)
    return data
  },
  async getByAuthorAndName(author, name) {
    const { data } = await api.get(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
    return data
  },
  async create(payload) {
    const { data } = await api.post('/blueprints', payload)
    return data
  },
  async update(author, name, payload) {
    const { data } = await api.put(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`, payload)
    return data
  },
  async remove(author, name) {
    const { data } = await api.delete(`/blueprints/${encodeURIComponent(author)}/${encodeURIComponent(name)}`)
    return data
  }
}

export const isMockMode = useMock

const service = useMock ? apimock : apiclient
export default service