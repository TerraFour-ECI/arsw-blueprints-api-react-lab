# 🎨 Lab – React Client for Blueprints (Redux + Axios + JWT) 🚀

> Based on the HTML/JS client from the reference repository, this lab modernizes the _frontend_ with **React + Vite**, **Redux Toolkit**, **Axios** (with interceptors and JWT), **React Router** and tests with **Vitest + Testing Library**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-FCC72C?style=for-the-badge&logo=vitest&logoColor=2E3036)

## 📄 Lab Report

You can open the complete React laboratory report directly here:

[Open report/main.pdf](report/main.pdf)

## 🎯 Learning Objectives

- Design a React SPA applying **componentization** and **Redux (reducers/slices)**.
- Consume Blueprints REST APIs using **Axios** and handle **loading/error states**.
- Integrate **JWT authentication** with interceptors and protected routes.
- Apply frontend best practices: folder structure, `.env`, linters, testing, CI.

## ⚙️ Prerequisites

- Have the Blueprints backend from **Labs 3 and 4** running (APIs + security).
- Node.js 18+ and npm.

Check the key glossary specification, refer to the [Lab Definitions](./DEFINITIONS.md).

## 📡 Expected Endpoints (adjust if your backend differs)

- `GET /api/blueprints` → general list or catalog to derive authors.
- `GET /api/blueprints/{author}`
- `GET /api/blueprints/{author}/{name}`
- `POST /api/blueprints` (requires JWT)
- `POST /api/auth/login` → `{ token }` _(Note: Setup to use /auth/login based on current Spring Boot configuration)_

Configure the base URL in `.env`.

## 🚀 Getting Started

```bash
npm install
cp .env.example .env
# edit .env with your backend URL
npm run dev
```

Open `http://localhost:5173`

## 🔐 Environment Variables

Create an `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK=true
```

> **Tip:** in production use secure variables or a _reverse proxy_.

## 📂 Structure & Architecture 🏗️

```mermaid
graph TD
    subgraph SPA ["React + Vite Client (Port 5173)"]
        UI["UI Components 🎨<br>(Glassmorphism)"]
        Canvas["HTML5 Canvas 🖌️<br>(Auto-scaling)"]
        Redux["Redux Toolkit 🗃️<br>(Global State & Thunks)"]
        Axios["Axios Client 🌐<br>(Interceptors + JWT)"]
        Mock["apimock.js 📦<br>(In-memory data)"]

        UI <--> Redux
        UI --> Canvas
        Redux <--> Axios
        Redux <--> Mock
    end

    subgraph Java_Backend ["Spring Boot Backend (Port 8080/8081)"]
        API["REST API (Lab 4) 📦"]
        Sec["Spring Security/JWT (Lab 5) 🔐"]

        API <--> Sec
    end

    Axios -- "HTTP/JSON (VITE_USE_MOCK=false)" --> Sec
    Axios -- "HTTP/JSON (VITE_USE_MOCK=false)" --> API
```

## 🔗 Backend & Frontend Integration

This frontend project is heavily intertwined with the existing **Java 21 Spring Boot + Security** (from previous labs).
All UI interactions mapping to creating, reading, updating, and deleting blueprints communicate directly through HTTP requests signed with JWT headers.

### Testing and Validation with cURL

Before connecting the Redux slices and Axios interceptors to the frontend, manual validation of the REST API endpoints is vital to ensure robust communication structures. During development, endpoints are tested as follows:

```bash
# 1. Fetching JWT Auth Token (Running the backend on localhost:8080 or 8081)
curl -X POST http://localhost:8081/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"camilo", "password":"password"}'

# 2. Querying the protected Blueprints endpoint using the generated Token
curl -v http://localhost:8081/api/blueprints \
     -H "Authorization: Bearer <ey...token...>"
```

Validating the backend output directly proves the backend operates successfully, ensuring that Axios implementations under `/src/services` accurately deserialize REST arrays into the React `useState` and `Redux` models.

### API Architecture Connection

- **Security Flow**: The client calls `/api/auth/login`. On success, the JWT token is persisted in `localStorage`. Automatically, an interceptor injects the `Authorization: Bearer <token>` onto all subsequent `/api/blueprints/*` calls. Use of `<PrivateRoute>` immediately restricts UI navigation depending on token presence.
- **Dynamic Services**: Handled strictly through Factory methodologies (`blueprintsService.js`), you can gracefully swap backend environments into in-memory local testing via `.env` parameter `VITE_USE_MOCK=true`.

```text
blueprints-react-lab/
├─ src/
│  ├─ components/     # BlueprintCanvas, BlueprintForm, BlueprintList
│  ├─ features/       # blueprintsSlice.js
│  ├─ pages/          # BlueprintsPage.jsx, LoginPage.jsx
│  ├─ services/       # blueprintsService.js, apimock.js, apiClient.js
│  ├─ store/          # Redux index.js
│  ├─ App.jsx, main.jsx, styles.css
├─ tests/             # Vitest Unit test suites & setup.js
├─ .env.example
├─ index.html, package.json, vite.config.js, README.md
```

## 📌 Lab Requirements

### 1. 🖌️ Canvas (lienzo)

- **Requirement:** Add a canvas to the page. Include a `BlueprintCanvas` component with its own identifier. Define suitable dimensions (e.g. `520×360`).
- **Implementation:** Implemented within `BlueprintCanvas.jsx`. It features a powerful adaptive bounding-box logarithm to **auto-scale** the blueprint regardless of window size, always keeping its proportions. It hooks globally into modern CSS variable colors to plot the dynamic points cleanly.
- 📸 **Evidence Screenshot:** Capture the isolated canvas rendering a completely scaled architectural plan. Save as `images/REQ1_CanvasDraw.png`.

![alt text](images/REQ1_CanvasDraw.png)
![alt text](images/REQ1_CanvasDraw-SuccessfulLogin.png)

### 2. 🗃️ List an Author's Blueprints

- **Requirement:** Allow entering an author name and querying their blueprints. Show results in a table with name, points, and `Open` button.
- **Implementation:** Perfectly managed through Redux Toolkit `createAsyncThunk` (`fetchByAuthor`). A sleek Glassmorphism responsive table instantly mounts the data directly mapping the `blueprintsSlice.js` states.
- 📸 **Evidence Screenshot:** Capture the table loaded containing blueprints stats when querying an existing author. Save as `images/REQ2_AuthorBlueprintsTable.png`.

![alt text](images/REQ2_AuthorBlueprintsTable.png)

### 3. 🖱️ Select a blueprint and plot it

- **Requirement:** Clicking the `Open` button updates the current blueprint name, fetches points, and draws consecutive segments.
- **Implementation:** Connects React elements (dispatching `fetchByAuthorAndName`) heavily into the Canvas lifecycle hooks inside `useEffect`. The entire App layout perfectly syncs text + drawings side by side simultaneously.
- 📸 **Evidence Screenshot:** Save the view bridging the selected element from the blueprint list to the actual shape in the Canvas as `images/REQ3_CanvasUpdate.png`.

![alt text](images/REQ3_CanvasUpdate.png)

### 4. 🔀 Services: `apimock` and `apiclient`

- **Requirement:** Implement both services with same interface and switch them via `.env` in one line.
- **Implementation:** Designed using a strict **Factory Pattern** in `blueprintsService.js` checking `import.meta.env.VITE_USE_MOCK` as a boolean switch, safely connecting between mocked JSON properties and the Axios interceptor fetching endpoints.
- 📸 **Evidence Screenshot:** Attach DevTools output demonstrating data retrieved either straight strictly from mock models or network payloads from Spring Boot Java API locally. Save as `images/REQ4_ApiMockSwitch.png`.

![alt text](images/REQ4_ApiMockSwitch.png)

### 5. ⚛️ React UI

- **Requirement:** The current blueprint name must be shown in the DOM mathematically via Redux global state without direct DOM manipulation.
- **Implementation:** Completed completely independent of bad DOM logic! Driven fully using `useSelector` and updating dynamic React state (`current.name` and functional reductions determining point sums).
- 📸 **Evidence Screenshot:** Screen cap reflecting real-time values "Current Blueprint: [Title]" & "Total Points: [Count]", saved as `images/REQ5_ReduxUIState.png`.

![alt text](images/REQ5_ReduxUIState.png)

### 6. 🎨 Styles

- **Requirement:** Add styles to improve presentation comparing to reference mock.
- **Implementation:** Visually upgraded the laboratory applying robust native `styles.css`. Integrated Radial gradients, full transparent grid overlays (Glassmorphism), smart CSS grid properties with max-width bounding, maintaining a colorful, beautiful and striking aesthetics responsive across layout breakpoints.
- 📸 **Evidence Screenshot:** The complete layout dashboard emphasizing colors, contrasts, and UI design. Name it `images/REQ6_ColorfulUI.png`.

![alt text](images/REQ6_ColorfulUI.png)
![alt text](images/REQ6_ColorfulUI-profile.png)
![alt text](images/REQ6_ColorfulUI-passwd.png)

### 7. ✅ Unit Tests

- **Requirement:** Add tests with Vitest + Testing Library (Canvas render, forms, Redux).
- **Implementation:** Solved testing crashes implementing `Object.defineProperty(HTMLCanvasElement.prototype, 'getContext')` mocks explicitly in `setup.js`. Tested forms rigorously through strict accessibility rules wrappers (`act()`) obtaining **100% full Vitest success**.
- 📸 **Evidence Screenshot:** Your local terminal asserting passing pipelines executing `npm test`, `npm run lint` and `npm run coverage` . Ensure no errors. Save as `images/REQ7_VitestSuccess.png`.

![alt text](images/REQ7_VitestSuccess-test.png)
![alt text](images/REQ7_VitestSuccess-lint.png)
![alt text](images/REQ7_VitestSuccess-coverage.png)

---

### Quick notes and recommendations

- For the canvas in tests with jsdom: mock `HTMLCanvasElement.prototype.getContext` has been added in `tests/setup.js`.
- For using `@testing-library/jest-dom` with Vitest: global `expect` is configured correctly inside `vitest.config.js`.
- Services switch uses `import.meta.env.VITE_USE_MOCK` to read the environment strictly.

## ✅ Verification Snapshot (2026-03-19)

- Unit tests: `104/104` passing.
- Build status: `npm run build` successful.
- Lint status: `npm run lint` clean for source/test files (coverage artifacts excluded in ESLint config).
- Backend integration manually validated with JWT + protected endpoints via `curl`.

### Coverage Snapshot (`npm run coverage`)

- Global statements: **99.63%**
- Global branches: **95.81%**
- Global functions: **97.14%**
- Global lines: **99.63%**

Branch coverage improvements requested for advanced edge cases:

- `src/pages/BlueprintsPage.jsx`: **98.03%** branches.
- `src/services/apimock.js`: **96.66%** branches.
- `src/components/BlueprintCanvas.jsx`: **93.33%** branches.

High-impact modules already covered with strong confidence:

- `src/App.jsx`: **100%** statements/branches/functions/lines.
- `src/main.jsx`: **100%** statements/branches/functions/lines.
- `src/components/PrivateRoute.jsx`: **100%** statements/branches/functions/lines.
- `src/pages/LoginPage.jsx`: **100%** statements/branches/functions/lines.
- `src/components/BlueprintCanvas.jsx`: **100%** statements.
- `src/features/blueprints/blueprintsSlice.js`: **100%** statements.
- `src/pages/BlueprintsPage.jsx`: **100%** statements.
- `src/pages/BlueprintDetailPage.jsx`: **100%** statements.
- `src/pages/NotFound.jsx`: **100%** statements.
- `src/components/BlueprintList.jsx`: **100%** statements.
- `src/services/blueprintsService.js`: **100%** statements.
- `src/services/apiClient.js`: **100%** statements.
- `src/services/apimock.js`: **100%** statements.

## 🧪 Backend/Frontend Validation Log

The integration was validated in two layers:

1. **API-only validation** (`curl`) to prove that authentication and protected resources respond correctly.
2. **Frontend flow validation** (Redux + Axios interceptor + UI actions) to prove end-to-end behavior from UI interaction to API request wiring.

Expected validation outcome:

- `/api/auth/login` returns `{ token }`.
- `/api/blueprints` returns `200 OK` when `Authorization: Bearer <token>` is provided.
- UI can open, edit (add points), save (`PUT`), and delete (`DELETE`) through Redux thunks.

## 📍 Traceability to Evaluation Criteria

| Evaluation Criterion                               | Evidence in this repository                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Functionality and case coverage (30%)              | Implemented `GET/POST/PUT/DELETE`, interactive canvas point capture, protected routes, and author/blueprint queries in UI.                                                      |
| Code quality and architecture (25%)                | Clear layering (`components/`, `features/`, `pages/`, `services/`, `store/`) with Redux Toolkit thunks and service abstraction (`apiclient`/`apimock`).                         |
| State management, errors, UX (15%)                 | Loading and error states handled in slice/UI; success/error feedback messages for create/update/delete actions.                                                                 |
| Automated tests (15%)                              | 104 passing tests plus coverage report (`npm run coverage`) across routing, pages, forms, canvas, route-guard, redux slice, store, service mock, API client, and app bootstrap. |
| Security (JWT/Interceptors/Protected Routes) (10%) | JWT persisted in `localStorage`, Axios request interceptor injects Bearer token, `PrivateRoute` blocks protected views without token.                                           |
| CI/Lint/Format (5%)                                | ESLint and formatting scripts available; GitHub Actions workflow included for CI checks.                                                                                        |

## 📌 Recommendations and suggested activities for lab success

1. **Advanced Redux**
   - [x] Adds `loading/error` states per _thunk_ and displays them in the UI.
   - [x] Implements _memo selectors_ to derive the top-5 blueprints by point count.
2. **Protected Routes**
   - [x] Create a `<PrivateRoute>` component and protects creation/editing.
3. **Complete CRUD**
   - [x] Implement `PUT /api/blueprints/{author}/{name}` and `DELETE ...` in the slice and in the UI.
   - [x] Optimistic updates applied properly handling async payload bounds.
4. **Interactive Drawing**
   - [x] Replace `svg` with a canvas where the user clicks to add points.
   - [x] “Save” button to send the blueprint.
5. **Errors and _Retry_**
   - [x] If `GET` fails, components gracefully read rejection payloads from slice safely.
6. **Testing**
   - [x] Tests of `blueprintsSlice` (pure reducers).
   - [x] Component tests with Testing Library (render, interaction).
7. **CI/Lint/Format**
   - [x] Check CI with **GitHub Actions** (workflow setup).
8. **Docker (optional)**
   - [x] Custom `.dockerignore` and `Dockerfile` setups.

## 📊 Evaluation Criteria

- Functionality and case coverage (30%)
- Code quality and architecture (Redux, components, services) (25%)
- State management, errors, UX (15%)
- Automated tests (15%)
- Security (JWT/Interceptors/Protected Routes) (10%)
- CI/Lint/Format (5%)

## 🛠️ Scripts

- `npm run dev` – Vite development server
![alt text](images/npm-run-dev.png)

- `npm run build` – Production build
![alt text](images/npm-run-build.png)

- `npm run preview` – Preview build
![alt text](images/npm-run-preview.png)

- `npm run lint` – ESLint
![alt text](images/REQ7_VitestSuccess-lint.png)

- `npm run format` – Prettier
![alt text](images/npm-run-format.png)

- `npm test` – Vitest
![alt text](images/REQ7_VitestSuccess-test.png)

- `npm run coverage` – Vitest coverage report
![alt text](images/REQ7_VitestSuccess-coverage.png)

---

### 🌟 Proposed Challenge Extensions

- **Redux Toolkit Query** for requests _caching_.
- **MSW** for _mocks_ without backend.
- **Dark mode** and responsive design. (✅ Successfully Applied - CSS native implementations).

> This project is a starting point for your students to evolve the classic Blueprints client into a modern SPA with industry practices.
