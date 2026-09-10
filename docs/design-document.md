# Expense Tracker — Design Document

**Version:** V1
**Status:** Design approved for implementation
**Repository:** `Kanagu23/expense-tracker-fullstack`

## 1. Purpose

Build a small but production-minded multi-user expense tracker as the first project in a progressive software-engineering learning path.

The project will be developed using the following engineering loop:

> **Design → Learn → Build → Inspect → Test → Improve → Deploy → Operate**

The goal is not only to produce an application, but to practice making engineering decisions, understanding trade-offs, inspecting AI-assisted implementation, and progressively taking the application toward production.

## 2. V1 Goals

The application should allow a user to:

1. Add an expense
2. View expenses
3. Edit an expense
4. Delete an expense
5. Filter expenses
6. Show total spending
7. Show available balance
8. Display expense data in a bar chart

V1 is intentionally small. Additional capabilities will be introduced in later versions as requirements grow.

## 3. Technology Direction

### Frontend

- Next.js
- TypeScript

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- MongoDB

### Testing

- Jest

The stack builds on existing experience with React/Next.js, Node.js/Express, MongoDB/MySQL, AWS S3, and Jest while providing opportunities to deepen software-engineering fundamentals.

## 4. High-Level Architecture

```text
                    Browser
                       |
                       v
              +-----------------+
              |     Next.js     |
              |    Frontend     |
              +--------+--------+
                       |
                    HTTP/REST
                       |
                       v
              +-----------------+
              |    Express.js   |
              |     Backend     |
              +--------+--------+
                       |
                       v
              +-----------------+
              |     MongoDB     |
              |                 |
              | users           |
              | expenses        |
              +-----------------+
```

Frontend and backend are separated into their own directories and environments.

```text
expense-tracker-fullstack/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.local
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
├── docs/
│   └── design-document.md
├── .gitignore
└── README.md
```

## 5. Environment Configuration

Frontend example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Backend example:

```env
PORT=5000
MONGODB_URI=...
```

Secrets belong only in the backend environment. Sensitive backend configuration must not be exposed through `NEXT_PUBLIC_*` variables.

Node.js provides built-in `.env` loading in modern versions. For this project, the backend uses Node's `--env-file=.env` option rather than adding a separate `dotenv` dependency.

Example start script:

```json
"start": "node --env-file=.env dist/server.js"
```

This loads variables from `.env` into `process.env` before the application starts.

## 6. Domain Model

V1 is a multi-user application.

### Relationship

```text
User 1 ──────────── N Expense
```

One user can have many expenses. Every expense belongs to exactly one user.

### User

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | ObjectId | Yes | MongoDB-generated unique identifier |
| `email` | String | Yes | Used to identify/authenticate the user; must be unique and normalized |
| `startingBalance` | Integer | Yes | Stored in the smallest currency unit (paise); must be >= 0 |

### Expense

| Field | Type | Required | Notes |
|---|---|---:|---|
| `_id` | ObjectId | Yes | MongoDB-generated unique identifier |
| `userId` | ObjectId | Yes | Identifies the owning user |
| `amount` | Integer | Yes | Stored in paise; must be > 0 |
| `category` | String | Yes | Must be one of the predefined V1 categories |
| `shopName` | String | No | Merchant/shop name; if provided, must be valid text |
| `date` | Date | Yes | Date the expense occurred; accepted API representation should be ISO-style |
| `notes` | String | No | Optional additional information |
| `paymentMethod` | String | Yes | Must be one of the predefined V1 payment methods |

MongoDB's `_id` is used instead of manually defining a separate `id` field.

## 7. Money Representation

JavaScript `number` uses IEEE-754 double-precision floating point and can produce decimal precision issues in monetary calculations.

V1 will store INR monetary values as integer paise rather than floating-point rupees.

Examples:

```text
₹150.75  -> 15075 paise
₹1,000   -> 100000 paise
```

The API contract should require an integer paise amount and reject invalid decimal numeric values rather than silently converting arbitrary input.

## 8. V1 Enumerations

### Categories

```text
Food
Travel
Shopping
Bills
Entertainment
Health
Education
Other
```

### Payment Methods

```text
Cash
UPI
Credit Card
Debit Card
Bank Transfer
Other
```

The backend must enforce these business values rather than accepting arbitrary strings.

## 9. Available Balance

V1 uses a starting balance supplied by the user.

```text
Available Balance = Starting Balance - Total Expenses
```

Example:

```text
Starting Balance       ₹50,000
Total Expenses         ₹10,000
Available Balance      ₹40,000
```

Starting balance is account-level data and therefore belongs to `User`, not `Expense`.

## 10. Database Collections

V1 uses two MongoDB collections:

```text
users
expenses
```

Expenses are stored as separate documents rather than being embedded in the User document.

### Reasoning

- Expense records can grow independently.
- Users may eventually have very large numbers of expenses.
- Expense filtering, date-range queries, pagination, and analytics are natural collection-level operations.
- User/account data and transaction data have different responsibilities.

MongoDB does not provide a traditional relational foreign-key constraint for this relationship. The application must enforce ownership and authorization using `userId`.

## 11. Index Strategy

Indexes are driven by actual query patterns rather than indexing every field.

Initial candidate indexes:

```js
expensesSchema.index({ userId: 1, date: -1 });
expensesSchema.index({ userId: 1, category: 1 });
```

The `{ userId: 1, date: -1 }` index supports both user-scoped expense retrieval and queries such as:

```js
expenses.find({ userId: currentUserId })
  .sort({ date: -1 })
  .limit(20);
```

It also supports user-scoped date-range queries.

An amount index is not required for V1 because amount is not currently a primary query/filter pattern.

Additional indexes should be introduced only when query requirements or measured performance justify them.

## 12. API Design

### Endpoints

| Operation | Method | Endpoint |
|---|---|---|
| Create expense | POST | `/api/expenses` |
| Get expenses | GET | `/api/expenses` |
| Get one expense | GET | `/api/expenses/:id` |
| Update expense | PUT | `/api/expenses/:id` |
| Delete expense | DELETE | `/api/expenses/:id` |

### Authentication and ownership

`userId` must **not** be accepted from the client as a trusted ownership value.

The authenticated user identity should be established server-side and used to scope database operations.

For example, resource access should conceptually use:

```js
Expense.findOne({
  _id: req.params.id,
  userId: authenticatedUser.id
});
```

This prevents one user from accessing, modifying, or deleting another user's expenses.

Key distinction:

- **Authentication:** Who are you?
- **Authorization:** Are you allowed to access this resource?

## 13. Create Expense Request

`POST /api/expenses`

V1 request body:

```json
{
  "amount": 15000,
  "category": "Food",
  "shopName": "ABC Restaurant",
  "date": "2026-09-10",
  "notes": "Dinner",
  "paymentMethod": "UPI"
}
```

`userId` is intentionally excluded from the request body.

### Validation

| Field | Rules |
|---|---|
| `amount` | Required integer, > 0 |
| `category` | Required non-empty string and predefined V1 value |
| `shopName` | Optional string; if present, not only whitespace and subject to reasonable length limits |
| `date` | Required valid ISO-style date |
| `notes` | Optional string; if present, not only whitespace and subject to reasonable length limits |
| `paymentMethod` | Required non-empty string and predefined V1 value |

Backend validation must enforce both data types and business rules.

## 14. Create Expense Response

A successful create operation returns:

```http
201 Created
```

V1 may return the created resource so the frontend can update local state without immediately issuing another GET request.

Example:

```json
{
  "data": {
    "_id": "...",
    "amount": 15000,
    "category": "Food",
    "shopName": "ABC Restaurant",
    "date": "2026-09-10",
    "notes": "Dinner",
    "paymentMethod": "UPI"
  }
}
```

`userId` does not need to be returned to the frontend unless a specific client requirement emerges.

## 15. Get Expenses

`GET /api/expenses`

V1 response includes the expense data plus dashboard values because the application is intentionally keeping this simple at first.

Example:

```json
{
  "data": [
    {
      "_id": "...",
      "amount": 15000,
      "category": "Food",
      "shopName": "ABC Restaurant",
      "date": "2026-09-10",
      "notes": "Dinner",
      "paymentMethod": "UPI"
    }
  ],
  "totalSpending": 150000,
  "availableBalance": 4850000,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 157,
    "totalPages": 8
  }
}
```

A later version may split dashboard/analytics responsibilities into a dedicated endpoint if the application's complexity or performance requirements justify it.

## 16. Filtering

GET query parameters are used for filtering rather than a request body.

Examples:

```http
GET /api/expenses?category=Food
GET /api/expenses?paymentMethod=UPI
GET /api/expenses?category=Food&paymentMethod=UPI
GET /api/expenses?startDate=2026-09-01&endDate=2026-09-10
```

Query parameters express how a collection should be searched or filtered.

## 17. Pagination

V1 uses page/limit pagination:

```http
GET /api/expenses?page=1&limit=20
```

Examples:

```text
Page 1 → records 1–20
Page 2 → records 21–40
Page 3 → records 41–60
```

Pagination prevents large expense collections from being transferred and rendered in one request.

Offset pagination is acceptable for V1. Cursor-based pagination can be introduced later for larger datasets where page shifting and consistency become important concerns.

## 18. Date Semantics

The `date` field represents **when the expense occurred**, not necessarily when the record was entered into the application.

Example:

```text
Expense occurred: 2026-09-09
User entered it:  2026-09-10
```

These are different concepts. The V1 domain model should preserve expense occurrence date, while creation timestamps can be added separately during implementation (for example, `createdAt`/`updatedAt`).

## 19. Backend TypeScript and Express Foundation

### TypeScript compilation model

Node.js runs JavaScript, while TypeScript is compiled to JavaScript before Node executes it.

```text
TypeScript (.ts)
      ↓ tsc
JavaScript (.js)
      ↓ Node.js
Runtime
```

The backend uses `rootDir` as the source root and `outDir` as the compiled-output directory. For example:

```text
src/index.ts
    ↓ tsc
dist/index.js
```

### Important TypeScript compiler settings

The backend uses modern Node/ES module settings:

```json
"module": "nodenext",
"target": "esnext",
"strict": true
```

Mental model:

- `target` controls the JavaScript language level TypeScript generates.
- `module` controls how TypeScript handles JavaScript modules such as `import` and `export`.
- `strict` enables strict type-checking so unsafe assumptions are caught earlier.

The project uses `"type": "module"` in `package.json` to align Node's module behavior with the modern ESM setup.

### Node.js type definitions

Installing:

```bash
npm install -D @types/node
```

does not install Node.js itself and does not compile TypeScript. Node.js is the runtime; `typescript` (`tsc`) is the compiler; `@types/node` supplies type definitions that allow TypeScript to understand Node APIs such as `process`, `Buffer`, `fs`, and `path`.

### Express type definitions

Similarly:

```bash
npm install express
npm install -D @types/express
```

`express` is the runtime package. `@types/express` provides TypeScript type definitions so the compiler understands Express APIs.

### Environment variables

The application reads configuration such as the port from the environment rather than hard-coding it:

```ts
const port = process.env.PORT ?? 3000;
```

The important distinction is:

```text
Application code → uses process.env.PORT
Environment       → decides the actual PORT value
```

This allows development, staging, and production environments to provide different configuration without changing application code.

Modern Node.js can load `.env` files directly using the `--env-file` option. This project uses that built-in capability rather than adding `dotenv`.

### Express health endpoint

The first endpoint is:

```http
GET /health
```

with a response such as:

```json
{
  "status": "ok"
}
```

This provides a simple way to verify that the HTTP server and application are running.

### Contextual typing in Express

A route handler can be written without explicitly annotating `req` and `res`:

```ts
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
```

Express's `app.get()` API provides the expected handler type, so TypeScript can infer the types of `req` and `res` from that context. This is called **contextual typing** and is a form of type inference.

### Application vs server startup separation

The Express application and the HTTP server startup are intentionally separated:

```text
src/
├── app.ts
└── server.ts
```

`app.ts` owns the Express application configuration, middleware, and routes. It exports the configured application:

```ts
export default app;
```

`server.ts` imports the application and owns HTTP server startup:

```ts
import app from "./app.js";

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Server will run on port ${port}`);
});
```

The distinction is:

```text
app.ts
  → What does the application do?

server.ts
  → How do we start the HTTP server?
```

This separation keeps application configuration independent from the mechanism used to start the HTTP server and gives us a cleaner foundation for testing and future architecture changes.

### API Gateway consideration

An API Gateway is useful when a system has multiple backend services and needs a single entry point for concerns such as routing, authentication, rate limiting, logging, or API versioning.

The V1 Expense Tracker has a single Express backend, so introducing a separate API Gateway now would add complexity without a current requirement.

The current separation of `app.ts` and `server.ts` is a useful foundation, but it is **not** an API Gateway. A future architecture could look like:

```text
Client
  ↓
API Gateway
  ├── User Service
  ├── Expense Service
  └── Analytics Service
```

The project will introduce such architectural complexity only when actual requirements justify it.

## 20. Engineering Principles

The project should follow these principles throughout implementation:

1. Keep V1 simple; avoid premature abstraction.
2. Make architectural decisions intentionally.
3. Separate type validation from business validation.
4. Never trust client-supplied ownership identifiers.
5. Prefer measured performance improvements over speculative optimization.
6. Keep secrets out of the frontend.
7. Use AI as an implementation accelerator, not as a replacement for engineering judgment.
8. Inspect AI-generated code for correctness, maintainability, security, performance, and edge cases.
9. Test failure scenarios, not only happy paths.
10. Evolve the architecture when actual requirements demand it.

## 21. Development Method

Every feature should follow this cycle:

```text
Design
  ↓
Learn
  ↓
Build
  ↓
Inspect
  ↓
Test
  ↓
Improve
  ↓
Deploy
  ↓
Operate
```

The learning progression will also move from small to large:

```text
V1 Small CRUD application
        ↓
Multi-user application
        ↓
Real-world SaaS capabilities
        ↓
AI-enabled application
        ↓
Production-grade deployment
        ↓
Large-scale system design
```

## 22. Initial Implementation Milestone

The first build milestone is project setup:

1. Create frontend and backend directories.
2. Initialize Next.js frontend with TypeScript.
3. Initialize Express backend with TypeScript.
4. Configure separate environment files.
5. Configure `.gitignore`.
6. Create a basic Express server.
7. Create a backend health-check endpoint.
8. Create the basic Next.js application.
9. Commit the initial setup.

After setup, implementation proceeds feature-by-feature, beginning with the backend foundation and database connection before implementing the Expense CRUD workflow.
