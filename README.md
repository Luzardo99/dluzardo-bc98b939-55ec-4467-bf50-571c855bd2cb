# Secure Task Management System

A full-stack task management application built with an Nx monorepo, featuring JWT authentication, role-based access control (RBAC), organization-scoped data, and audit logging.

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
- [Running the Application](#running-the-application)
- [Data Model](#data-model)
- [API Reference](#api-reference)
- [Access Control](#access-control)
- [Future Considerations](#future-considerations)

---

## Architecture

The project is structured as an **Nx monorepo** with shared libraries and two applications:

```
├── apps/
│   ├── api/              # NestJS REST API (backend)
│   ├── api-e2e/          # End-to-end API tests
│   └── dashboard/        # Angular SPA (frontend)
├── libs/
│   ├── auth/             # RBAC decorators, guards, org-scope helpers
│   └── data/             # Shared entities, DTOs, enums
```

**Backend (API)**  
NestJS with TypeORM and SQLite. Handles authentication (JWT), RBAC, task CRUD, and audit logging. All protected routes require a valid JWT; create/update/delete operations additionally enforce role checks (Owner/Admin only).

**Frontend (Dashboard)**  
Angular 21 SPA with TailwindCSS. Login flow, JWT storage, and HTTP interceptor for auth. Kanban board with drag-and-drop status changes, filtering, sorting, completion chart, and dark/light mode.

**Shared Libraries**  
- `@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data`: TypeORM entities (User, Organization, Task, AuditLog), DTOs, enums.  
- `@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/auth`: `@Roles()` decorator, `RolesGuard`, `getAccessibleOrgIds()` for organization hierarchy.

---

## Tech Stack

| Layer    | Technologies                                                |
| -------- | ----------------------------------------------------------- |
| Monorepo | Nx 22                                                       |
| Backend  | NestJS 11, TypeORM, SQLite, Passport JWT, bcrypt            |
| Frontend | Angular 21, TailwindCSS 3, Angular CDK (drag-drop)          |
| Auth     | JWT (RS256/symmetric), HTTP-only-style storage in frontend  |

---

## Setup

### Prerequisites

- Node.js 18+  
- npm 9+

### Installation

```bash
# Clone and install dependencies
npm install
```

### Environment Configuration

Copy the example env file and set values:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```
JWT_SECRET=your-jwt-secret-here-minimum-32-characters
JWT_EXPIRATION=24h
PORT=3000
NODE_ENV=development
```

---

## Running the Application

### 1. Seed the database (optional but recommended)

Seed creates organizations, users, and sample tasks:

```bash
curl -X POST http://localhost:3000/api/seed
```

Or run after the API is up (see step 2).

### 2. Start the API

```bash
npx nx serve api
```

API runs at `http://localhost:3000`.

### 3. Start the dashboard

```bash
npx nx serve dashboard
```

Dashboard runs at `http://localhost:4200`. The dev server proxies `/api` to the API.

### Demo credentials (after seed)

| Email               | Password   | Role   |
| ------------------- | ---------- | ------ |
| owner@acme.com      | password123| Owner  |
| admin@acme.com      | password123| Admin  |
| admin.eng@acme.com  | password123| Admin  |
| viewer.eng@acme.com | password123| Viewer |

---

## Data Model

### Entity Relationship Diagram (Conceptual)

```
Organization (1) ──< (N) User
Organization (1) ──< (N) Task
Organization (1) ──< (N) AuditLog

User (1) ──< (N) Task  (owner)
```

- **Organization**: Hierarchical (`parentId`). Acme Corp → Engineering, Marketing.
- **User**: `email`, `passwordHash`, `role` (owner/admin/viewer), `organizationId`.
- **Task**: `title`, `description`, `status` (todo/in_progress/done), `category` (work/personal), `ownerId`, `organizationId`.
- **AuditLog**: `userId`, `action` (create/update/delete), `resourceType`, `resourceId`, `organizationId`, `metadata`, `timestamp`.

---

## API Reference

Base URL: `http://localhost:3000/api`

### Auth

| Method | Endpoint      | Auth | Description                    |
| ------ | ------------- | ---- | ------------------------------ |
| POST   | `/auth/login` | No   | Login. Body: `{ email, password }` |

**Response:** `{ access_token, user: { id, email, role, organizationId } }`

### Tasks

| Method | Endpoint     | Auth | Roles    | Description        |
| ------ | ------------ | ---- | -------- | ------------------ |
| GET    | `/tasks`     | Yes  | Any      | List tasks (org-scoped) |
| GET    | `/tasks/:id` | Yes  | Any      | Get task by ID     |
| POST   | `/tasks`     | Yes  | Owner, Admin | Create task    |
| PUT    | `/tasks/:id` | Yes  | Owner, Admin | Update task    |
| DELETE | `/tasks/:id` | Yes  | Owner, Admin | Delete task    |

All task endpoints are scoped by the user’s organization(s). Owners at a parent org see tasks for that org and its children.

### Audit Log

| Method | Endpoint       | Auth | Roles      | Description                   |
| ------ | -------------- | ---- | ---------- | ----------------------------- |
| GET    | `/audit-log`   | Yes  | Owner, Admin | Paginated audit logs (org-scoped) |

**Query params:** `limit` (default 50, max 100), `offset` (default 0).

### Seed

| Method | Endpoint | Auth | Description              |
| ------ | -------- | ---- | ------------------------ |
| POST   | `/seed`  | No   | Clear DB and seed data   |

---

## Access Control

### Roles and hierarchy

- **Owner** – Full access in their org; if at parent org, sees data for parent and child orgs.
- **Admin** – Same as Owner for create/update/delete of tasks; scoped to their org.
- **Viewer** – Read-only; scoped to their org.

### Enforcement

1. **JwtAuthGuard** – Validates JWT on protected routes. `@Public()` skips it (e.g. login, seed).
2. **RolesGuard** – Used with `@Roles(UserRole.OWNER, UserRole.ADMIN)` on write endpoints.
3. **Organization scoping** – Services use `getAccessibleOrgIds()` to restrict queries to the user’s accessible orgs.

### Frontend

- JWT stored in `localStorage` and sent via `Authorization: Bearer` header.
- Route guard redirects unauthenticated users to `/login`.
- Create/Edit/Delete UI hidden for Viewers; API still enforces permissions.

---

## Future Considerations

- **Refresh tokens** – Long-lived refresh token flow for better security and UX.
- **Tests** – Unit/integration tests for auth, RBAC, and services; e2e for critical flows.
- **Audit UI** – Dedicated page for audit logs in the dashboard.
- **Task ordering** – Persisted `sortOrder` for drag-and-drop reordering.
- **Backend filters** – Pass status/category/sort query params to the API instead of filtering in the frontend.
- **Database** – Migrate to PostgreSQL for production use.

---

## Useful commands

```bash
# Build all
npx nx run-many -t build

# Lint
npx nx run-many -t lint

# Run tests
npx nx run-many -t test
```
