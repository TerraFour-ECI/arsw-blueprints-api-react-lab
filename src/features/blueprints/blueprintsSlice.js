import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk('blueprints/fetchAuthors', async () => {
  const data = await blueprintsService.getAll()
  const authors = [...new Set(data.map((bp) => bp.author))]
  return authors
})

export const fetchByAuthor = createAsyncThunk('blueprints/fetchByAuthor', async (author) => {
  const data = await blueprintsService.getByAuthor(author)
  return { author, items: data || [] }
})

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const data = await blueprintsService.getByAuthorAndName(author, name)
    return data
  },
)

export const createBlueprint = createAsyncThunk('blueprints/createBlueprint', async (payload) => {
  const data = await blueprintsService.create(payload)
  return data
})

export const updateBlueprint = createAsyncThunk(
  'blueprints/updateBlueprint',
  async ({ author, name, payload }) => {
    const data = await blueprintsService.update(author, name, payload)
    return data
  },
)

export const deleteBlueprint = createAsyncThunk(
  'blueprints/deleteBlueprint',
  async ({ author, name }) => {
    await blueprintsService.remove(author, name)
    return { author, name }
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    addPointToCurrent(state, action) {
      if (state.current) {
        if (!state.current.points) state.current.points = []
        state.current.points.push(action.payload)
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchAuthors.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.authors = a.payload
      })
      .addCase(fetchAuthors.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to load authors'
      })
      .addCase(fetchByAuthor.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.byAuthor[a.payload.author] = a.payload.items
        if (!s.authors.includes(a.payload.author)) {
          s.authors.push(a.payload.author)
        }
      })
      .addCase(fetchByAuthor.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to load blueprints for this author'
      })
      .addCase(fetchBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(fetchBlueprint.fulfilled, (s, a) => {
        s.status = 'succeeded'
        s.current = a.payload
      })
      .addCase(fetchBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to load blueprint details'
      })
      .addCase(createBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(createBlueprint.fulfilled, (s, a) => {
        s.status = 'succeeded'
        const bp = a.payload
        if (!s.byAuthor[bp.author]) {
          s.byAuthor[bp.author] = []
        }
        s.byAuthor[bp.author].push(bp)
        s.current = bp
        if (!s.authors.includes(bp.author)) {
          s.authors.push(bp.author)
        }
      })
      .addCase(createBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to create blueprint'
      })
      .addCase(updateBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(updateBlueprint.fulfilled, (s, a) => {
        s.status = 'succeeded'
        const bp = a.payload
        if (s.byAuthor[bp.author]) {
          const idx = s.byAuthor[bp.author].findIndex((i) => i.name === bp.name)
          if (idx !== -1) {
            s.byAuthor[bp.author][idx] = bp
          }
        }
        if (s.current && s.current.name === bp.name && s.current.author === bp.author) {
          s.current = bp
        }
      })
      .addCase(updateBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to update blueprint'
      })
      .addCase(deleteBlueprint.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(deleteBlueprint.fulfilled, (s, a) => {
        s.status = 'succeeded'
        const { author, name } = a.payload
        if (s.byAuthor[author]) {
          s.byAuthor[author] = s.byAuthor[author].filter((bp) => bp.name !== name)
        }
        if (s.current && s.current.name === name && s.current.author === author) {
          s.current = null
        }
      })
      .addCase(deleteBlueprint.rejected, (s, a) => {
        s.status = 'failed'
        s.error = a.error.message || 'Unable to delete blueprint'
      })
  },
})

export const { addPointToCurrent } = slice.actions
export default slice.reducer
