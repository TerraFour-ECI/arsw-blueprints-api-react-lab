# 📖 Core Definitions

## Back to [README](./README.md)

## 🔹 Vite

A modern tool for frontend application development.

- Works as a **fast development server** and as a **production bundler**.
- Supports **Hot Module Replacement (HMR)** without reloading the entire page.

👉 In this lab, we use it to **run the React SPA** and package the final project.

---

## 🔹 React

A JavaScript library for building user interfaces.

- Uses reusable **components**.
- Enables dynamic applications with a single HTML page (**Single Page Application**).

👉 In this lab, we build UI components such as tables, forms, and a drawing canvas.

---

## 🔹 Redux Toolkit

A set of utilities to manage **global state** in React applications.

- Centralizes app state in a **store**.
- Uses **slices and reducers** to update state.
- Includes **thunks** to handle asynchronous requests.

👉 In this lab, Redux manages:

- The list of authors and their blueprints.
- The blueprint currently open in the canvas.
- Loading and error states for API calls.

---

## 🔹 Axios

An HTTP client for consuming APIs from the frontend.

- Simplifies `GET`, `POST`, `PUT`, and `DELETE` calls.
- Supports **interceptors** to add the JWT token to each request.
- Handles errors in a centralized way.

👉 Here we use it to connect to the Blueprints backend (Labs 3 and 4).

---

## 🔹 Canvas

The HTML `<canvas>` element for drawing 2D/3D graphics with JavaScript.

- Useful for visualizing shapes, charts, and diagrams.
- In this lab, it is used to **draw blueprint points** and their connections.

---

## 🔹 JWT (JSON Web Token)

A standard for authenticating users between client and server.

- The server issues a signed token when the user signs in.
- The client stores that token (for example in `localStorage`) and sends it with each request.
- The backend validates the token before granting access to protected resources.

👉 Here it is used to **protect blueprint creation**.

---

## 🔹 Linter (ESLint)

A tool that analyzes code to detect errors, poor practices, and inconsistent style.

- Detects unused variables, invalid imports, and duplicated code.
- Ensures consistency across the team.

👉 This lab uses **ESLint 9 (Flat Config)** to keep submissions clean and maintainable.

---

## 🔹 Vitest + Testing Library

A testing setup for unit and component tests in modern React projects.

- **Vitest** runs tests in Node using the `jsdom` environment.
- **Testing Library** renders components and simulates user interactions.

👉 In this lab, these tools validate that components (`Canvas`, `Form`, `Page`) work correctly.
