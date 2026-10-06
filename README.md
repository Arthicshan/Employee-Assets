# Employee Asset & Inventory Management System

A full-stack enterprise administration system to automate the manual lifecycle of company equipment from registration through assignment, return, repair, and retirement.

Built with **Next.js (App Router)**, **NestJS (Modular Monolith)**, **PostgreSQL**, and **Prisma ORM**.

---

## 🚀 System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Frontend                     │
│  (Thin Pages → Containers → Hooks → Domain Services)   │
└───────────────────────────┬────────────────────────────┘
                            │ Centralized API Client (Bearer JWT, RFC 7807)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    NestJS Backend                      │
│ (Controllers → DTO Validation → Services → Guard/Auth) │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma Transactions ($transaction)
                            ▼
┌────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                   │
│   (Relational Tables, Foreign Keys, Audit History)     │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | Next.js, React, Tailwind CSS | Modular containers, centralized API client, reusable UI primitives |
| **Backend** | NestJS (Modular Monolith) | Controllers, DTO runtime validation (`class-validator`), services |
| **Security** | Passport, JWT, BcryptJS | Role-Based Access Control (`ADMIN`, `MANAGER`, `EMPLOYEE`) |
| **Database** | PostgreSQL | ACID transactions, foreign keys, unique indexes |
| **ORM** | Prisma Client | Type-safe migrations and relational queries |
| **Errors** | RFC 7807 Problem Details | Standardized error contracts across all API responses |
| **Testing** | Jest | Service unit tests validating core business rules & edge cases |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v20+ (recommended v22+)
- **PostgreSQL**: Running locally or via Docker
- **npm**

---

### 2. Backend Setup

```bash
cd backend

# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
# Copy .env.example to .env and adjust your database connection:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/employee_assets?schema=public"
# JWT_SECRET="super-secret-jwt-key-change-in-production-2024"
# PORT=3001

# 3. Apply database migrations
npx prisma migrate deploy

# 4. Seed a NEW database only (this script clears existing inventory)
npx ts-node prisma/seed.ts

# 5. Build and start the backend API server
npm run build
npm run start:prod
# API runs at: http://localhost:3001
```

---

### 3. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Configure environment
# .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:3001

# 3. Build & start production server
npm run build
npm run start
# Web App runs at: http://localhost:3000
```

---

## 🔑 Default Demo Credentials

The database comes pre-seeded with 3 accounts representing each system role:

| Role | Email | Password | Access & Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@assetflow.com` | `admin123` | Full system access (Asset/category/employee/user management; assignment and returns; read-only audit history) |
| **Asset Manager** | `manager@assetflow.com` | `manager123` | Operational access (View inventory/employees, assign AVAILABLE assets to ACTIVE employees, process returns) |
| **Employee** | `employee@assetflow.com` | `employee123` | Self-Service Portal (View custody equipment, personal profile, assignment audit log) |

> **Tip:** The redesigned corporate login screen provides 1-click **Demo Access** buttons: `[ Admin ]` `[ Manager ]` `[ Employee ]` to pre-fill credentials for instant testing.

---

## 📖 Swagger / OpenAPI Documentation

Interactive Swagger documentation is available out of the box:
- **URL**: `http://localhost:3001/api/docs`
- **Features**: JWT Bearer token authentication, organized tags (`Auth`, `Assets`, `Categories`, `Employees`, `Assignments`, `Returns`, `Asset History`, `Dashboard`, `Employee Portal`, `Health`), request/response schema specifications.

---

## 🧪 Automated Testing Suite

The project includes both comprehensive unit tests and end-to-end integration tests:

### 1. Backend Unit Tests (20 Suites, 51 Tests)
```bash
cd backend
npm test
```
- ✅ `assignments.service.spec.ts` (Assignment business rules, inactive employee rejection, status validation)
- ✅ `returns.service.spec.ts` (Return condition handling, asset status transitions)
- ✅ `employee-portal.service.spec.ts` (Employee portal self-service endpoints)
- ✅ `employee.service.spec.ts`, `asset.service.spec.ts`, `health.service.spec.ts`, etc.

### 2. Backend E2E Tests (8 Suites, 63 Tests)
```bash
cd backend
npm run test:e2e
# Creates a temporary PostgreSQL schema, migrates and seeds it, runs tests, then removes it.
```
- ✅ `rbac-permissions.e2e-spec.ts` (Complete RBAC permission enforcement: Admin full access, Manager operational access, Manager 403 on category/employee/asset deletion, Employee 403 on administrative endpoints)
- ✅ `auth.e2e-spec.ts` (3-role authentication, JWT generation, invalid credentials handling)
- ✅ `core-flows.e2e-spec.ts` (GET /health, asset creation, employee creation, assignment, inactive employee rejection, return processing, history retrieval)
- ✅ `assets.e2e-spec.ts`, `assignments.e2e-spec.ts`, `returns.e2e-spec.ts`, `app.e2e-spec.ts`


---

## 🎬 Assessment Demo Walk-through

### 1. Happy Path Flow (End-to-End Asset Lifecycle)
1. **Login:** Navigate to `http://localhost:3000/login` and click **Admin** (or sign in with `admin@assetflow.com`).
2. **Dashboard Overview:** Review real-time status counts, category distribution, and recent activity.
3. **Register New Asset:**
   - Go to **Assets** → click **Register Asset**.
   - Input: Tag `LAP-099`, Name `MacBook Air M3`, Category `Laptops`, Status `Available`.
   - Asset appears in directory with green `Available` badge.
4. **Assign Equipment (Transaction):**
   - Go to **Assignments** → click **Assign Equipment**.
   - Select asset `MacBook Air M3 (LAP-099)` and employee `Alice Johnson (EMP-001)`.
   - Click **Confirm Assignment**.
   - The asset transitions to `Assigned` and an immutable `AssetHistory` record is created.
5. **Inspect Asset Audit Timeline:**
   - Click the eye icon on the asset to open its detail page (`/assets/[id]`).
   - Observe the **Asset Lifecycle & Audit History** timeline showing the `ASSIGNED` event.
6. **Process Return (Transaction):**
   - Go to **Assignments** → locate the active assignment → click **Process Return**.
   - Select condition `Good` and enter remarks `Returned in great condition`.
   - Confirm return. The assignment status changes to `RETURNED`, the asset returns to `Available`, and a new audit event is logged.

### 2. Intentionally Rejected Invalid Flows (Business Rules Integrity)
- **Prevent Duplicate Assignment:**
  - Attempt to assign an asset that is currently `Assigned` or `Damaged`.
  - The API responds with HTTP 409 Conflict (`Problem Details` format) and the UI displays: *"Only available assets can be assigned"* or *"This asset already has an active assignment"*.
- **Prevent Duplicate Return:**
  - Attempting to return an already completed assignment is rejected with HTTP 400 Bad Request.
- **Unauthenticated Access:**
  - Direct API requests to `/assets` without `Authorization: Bearer <token>` are rejected with HTTP 401 Problem Details.

---

## 📂 Project Structure

```
Employee_Asset_Inventory_Management/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # Database schema (PostgreSQL)
│   │   ├── migrations/                # Migration history
│   │   └── seed.ts                    # Seed script for users, assets, categories
│   ├── src/
│   │   ├── auth/                      # JWT auth, Passport strategy, guards
│   │   ├── common/                    # ProblemDetailsFilter, @Roles(), @Public(), @CurrentUser()
│   │   ├── asset/                     # Asset module (controller, service, DTOs)
│   │   ├── categories/                # Asset categories module
│   │   ├── employee/                  # Employee directory module
│   │   ├── assignments/               # Assignment transaction & business rules
│   │   ├── returns/                   # Return transaction & condition transitions
│   │   ├── asset-history/             # Immutable audit log module
│   │   ├── dashboard/                 # Aggregated metrics & activity summary
│   │   ├── health/                    # Database connectivity health check
│   │   └── main.ts                    # Application bootstrap & global pipes/filters
│   └── .env.example                   # Environment documentation
│
└── frontend/
    ├── src/
    │   ├── app/                       # Thin Next.js route entry points
    │   ├── containers/                # Feature screens & orchestration hooks
    │   │   ├── login-page/
    │   │   ├── dashboard-page/
    │   │   ├── assets-page/
    │   │   ├── asset-detail-page/     # Asset specs & chronological history timeline
    │   │   ├── categories-page/
    │   │   ├── employees-page/
    │   │   ├── employee-detail-page/
    │   │   └── assignments-page/      # Assignment & return modals
    │   ├── components/                # Reusable UI primitives (AppShell, Button, Table, Modal)
    │   ├── libs/api/                  # Centralized ApiClient & SessionManager
    │   ├── services/                  # Domain API service modules
    │   └── types/                     # Shared TypeScript contracts
    └── .env.local                     # Frontend environment config
```

## Assessment fixes and verified behavior

See [ASSESSMENT_AUDIT.md](ASSESSMENT_AUDIT.md) for the requirement matrix, fixes, and verification results.

- `/assets/:id/history` and both PUT/PATCH asset updates are supported.
- Asset DELETE retires the asset and retains its audit trail. Return an actively assigned asset first.
- Employees referenced by assignment/history records are deactivated when deleted; unused employee records can be deleted.
- Referenced categories cannot be deleted. Rename cascades to assets; deactivate a category to prevent new registrations.
- Assignment and return checks run inside serializable transactions. A database unique index prevents two active assignments for one asset.
- Return condition and return notes are stored separately from original assignment notes.
- Managers can change lifecycle status using `PATCH /assets/:id/status`; creating or clearing an assignment must use the assignment/return workflow.
- Assets, employees, categories and users support `page`, `limit`, `search`, `sortBy`, `sortOrder` queries. Without pagination these endpoints retain their array response for existing screens.
- Assignments always return `{data, meta}` and support search/filtering/sorting across pages.
- Inventory additionally supports status, exact category, and employee filters; employee search includes code, name, email, department and position.
- Asset status remains lowercase in the established API contract; condition and assignment status are uppercase.
- Returns are available at `/returns`; assignments retain their existing return controls.
- Roles are ADMIN, MANAGER and EMPLOYEE, managed on the Users screen. Audit history is read-only.

`npm run test:e2e` uses the configured PostgreSQL server with a unique temporary `assessment_test_<timestamp>` schema. An optional `TEST_DATABASE_URL` can target a separate test database. It does not seed or reset the app's working schema. Tests must use this runner. Directly running the existing seed script resets inventory, so use it only for a new/disposable database.

## About the Project

Employee Asset & Inventory Management System is a full-stack application designed to help organizations manage company assets efficiently.

### Key Features

- Asset registration and management
- Employee management
- Asset assignment and return tracking
- Asset status and condition monitoring
- Assignment history
- Dashboard and inventory overview
- Role-based access control
- Search and filtering

### Technology Stack

- Next.js
- NestJS
- PostgreSQL
- Prisma ORM