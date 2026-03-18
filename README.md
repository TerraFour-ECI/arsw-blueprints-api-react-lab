# Lab - React Client for Blueprints (Redux + Axios + JWT)

> Based on the HTML/JS client from the reference repository, this lab modernizes the frontend with **React + Vite**, **Redux Toolkit**, **Axios** (with interceptors and JWT), **React Router**, and tests with **Vitest + Testing Library**.

## Learning Objectives

- Design a React SPA using **component-based architecture** and **Redux (reducers/slices)**.
- Consume Blueprints REST APIs with **Axios** and handle **loading/error states**.
- Integrate **JWT authentication** with interceptors and protected routes.
- Apply best practices for folder structure, `.env`, linting, testing, and CI.

## Prerequisites

- Have the Blueprints backend from **Labs 3 and 4** running (API + security).
- Node.js 18+ and npm.

For the key glossary, see [Lab Definitions](./DEFINITIONS.md).

## Expected Endpoints (adjust if your backend differs)

- `GET /api/blueprints` -> general list or catalog to derive authors.
- `GET /api/blueprints/{author}`
- `GET /api/blueprints/{author}/{name}`
- `POST /api/blueprints` (requires JWT)
- `POST /api/auth/login` -> `{ token }`

Set the base URL in `.env`.

## Getting Started

```bash
npm install
cp .env.example .env
# edit .env with your backend URL
npm run dev
```

Open `http://localhost:5173`

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> Tip: in production, use secure variables or a reverse proxy.

## Structure

```text
blueprints-react-lab/
|- src/
|  |- components/
|  |- features/blueprints/blueprintsSlice.js
|  |- pages/
|  |- services/apiClient.js   # axios + JWT interceptors
|  |- store/index.js          # Redux Toolkit
|  |- App.jsx, main.jsx, styles.css
|- tests/
|- .github/workflows/ci.yml
|- index.html, package.json, vite.config.js, README.md
```

## Lab Requirements

## 1. Canvas

- Add a canvas to the page.
- Include a `BlueprintCanvas` component with its own identifier.
- Define suitable dimensions (for example `520x360`) so it does not fill the entire screen but still allows drawing blueprints.

## 2. List an Author's Blueprints

- Allow entering an author name and querying their blueprints from the backend (or mock).
- Show results in a table with these columns:
- Blueprint name
- Number of points
- `Open` button

## 3. Select and Render a Blueprint

When clicking the `Open` button, the app should:

- Update a text field with the current blueprint name.
- Fetch the corresponding blueprint points.
- Draw line segments in sequence on the canvas and mark each point.

## 4. Services: `apimock` and `apiclient`

- Implement two services with the same interface:
- `apimock`: returns in-memory sample data.
- `apiclient`: consumes the real REST API via Axios.
- Both should expose these methods:
- `getAll`
- `getByAuthor`
- `getByAuthorAndName`
- `create`
- Enable switching between `apimock` and `apiclient` with one line:
- Create `blueprintsService.js` that imports one or the other based on an `.env` variable.
- Example in `.env` (Vite):

```env
VITE_USE_MOCK=true
```

- `VITE_USE_MOCK=true` uses mock service.
- `VITE_USE_MOCK=false` uses real API service.

## 5. React UI

- The current blueprint name should be rendered from global Redux state.
- Avoid direct DOM manipulation; use components, props, and state.

## 6. Styles

- Add styles to improve presentation.
- You can use Bootstrap or any other CSS framework.
- Adjust table, buttons, and cards to align with the reference mock.

## 7. Unit Tests

- Add tests with Vitest + Testing Library for:
- Canvas rendering.
- Form submission.
- Basic Redux interactions (for example, dispatching `fetchByAuthor`).

---

### Quick Notes and Recommendations

- For canvas tests in jsdom, add a mock for `HTMLCanvasElement.prototype.getContext` in `tests/setup.js`.
- To use `@testing-library/jest-dom` with Vitest, import `import '@testing-library/jest-dom'` in `tests/setup.js` and ensure Vitest provides the global `expect` (`test: { globals: true, setupFiles: './tests/setup.js' }` in `vitest.config.js`).
- For Vite service switching, use `import.meta.env.VITE_USE_MOCK` to read the runtime variable.

## Suggested Activities

1. **Advanced Redux**
- [ ] Add per-thunk `loading/error` states and display them in the UI.
- [ ] Implement memo selectors to derive a top-5 blueprints list by points count.
2. **Protected Routes**
- [ ] Create a `<PrivateRoute>` component and protect create/edit routes.
3. **Complete CRUD**
- [ ] Implement `PUT /api/blueprints/{author}/{name}` and `DELETE ...` in the slice and UI.
- [ ] Add optimistic updates (rollback on failure).
4. **Interactive Drawing**
- [ ] Replace `svg` with a canvas where users click to add points.
- [ ] Add a `Save` button to send the blueprint.
5. **Errors and Retry**
- [ ] If `GET` fails, show a banner and a **Retry** button that dispatches the thunk.
6. **Testing**
- [ ] Add `blueprintsSlice` reducer tests.
- [ ] Add component tests with Testing Library (render and interaction).
7. **CI/Lint/Format**
- [ ] Enable **GitHub Actions** (included workflow) for lint + test + build.
8. **Docker (optional)**
- [ ] Create a `Dockerfile` (+ compose) for frontend + backend.

## Evaluation Criteria

- Functionality and case coverage (30%)
- Code quality and architecture (Redux, components, services) (25%)
- State management, error handling, and UX (15%)
- Automated testing (15%)
- Security (JWT/interceptors/protected routes) (10%)
- CI/Lint/Format (5%)

## Scripts

- `npm run dev` - Vite development server
- `npm run build` - production build
- `npm run preview` - preview the build
- `npm run lint` - ESLint
- `npm run format` - Prettier
- `npm test` - Vitest

---

### Optional Challenge Extensions

- **Redux Toolkit Query** for request caching.
- **MSW** for backend-free mocks.
- **Dark mode** and responsive design.

> This project is a starting point for evolving the classic Blueprints client into a modern SPA with industry practices.
