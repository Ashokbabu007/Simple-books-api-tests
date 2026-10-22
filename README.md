# Simple Books API – Playwright API Tests

API test suite for the public **Simple Books API** (`https://simple-books-api.click`) built with **Playwright Test** (TypeScript).

Covers the full set of operations including the “tricky” authenticated flows:

| Method | Endpoint              | Auth? | Covered |
|--------|-----------------------|-------|---------|
| GET    | `/status`             | No    | ✅      |
| GET    | `/books`              | No    | ✅ (+ filters) |
| GET    | `/books/:bookId`      | No    | ✅      |
| POST   | `/api-clients/`       | No    | ✅ (token generation) |
| POST   | `/orders`             | Yes   | ✅      |
| GET    | `/orders`             | Yes   | ✅      |
| GET    | `/orders/:orderId`    | Yes   | ✅      |
| PATCH  | `/orders/:orderId`    | Yes   | ✅      |
| DELETE | `/orders/:orderId`    | Yes   | ✅      |

---

## Project Structure

```
simple-books-api-tests/
├── src/
│   ├── api/
│   │   └── BooksApi.ts          # Typed API helper (all endpoints)
│   ├── data/
│   │   └── test-data.ts         # Unique client generator, constants
│   └── fixtures/
│       └── api-fixtures.ts      # booksApi + authToken fixtures
├── tests/
│   ├── status-and-books.spec.ts # Public endpoints
│   ├── authentication.spec.ts   # Client registration & token
│   └── orders-crud.spec.ts      # Full CRUD lifecycle + negative cases
├── playwright.config.ts
├── package.json
└── README.md
```

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Run all API tests
npm test

# 3. View HTML report
npm run report
```

No browsers are required – these are pure API tests using Playwright’s `APIRequestContext`.

---

## Key Design Choices

1. **Custom fixtures**
   - `booksApi` – injects a typed helper for every test
   - `authToken` – automatically registers a unique client and yields a fresh Bearer token (avoids 409 conflicts)

2. **Unique clients every run**  
   `uniqueClient()` generates timestamp + random email so parallel workers never collide.

3. **Full lifecycle test** (`@e2e`)  
   Create → Get → Patch → List → Delete → Verify 404 – all in one test with clear steps.

4. **Negative cases**  
   401 without token, 400 missing fields, 404 unknown resources.

5. **Parallel-safe**  
   `fullyParallel: true` + unique data = safe concurrent execution.

---

## Useful Commands

| Command                    | Description                          |
|----------------------------|--------------------------------------|
| `npm test`                 | Run all tests                        |
| `npm run test:smoke`       | Only `@smoke` tagged tests           |
| `npx playwright test -g "lifecycle"` | Run the full CRUD journey   |
| `npm run report`           | Open Playwright HTML report          |

---

## API Reference (summary)

- **Base URL:** `https://simple-books-api.click`
- **Auth:** Register via `POST /api-clients/` → receive `accessToken` (valid 7 days)
- **Protected endpoints** require header: `Authorization: Bearer <token>`

---

## License

MIT
