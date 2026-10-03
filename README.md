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

# 4. Seed initial data (users, categories, employees, assets)
npm run prisma db seed

# 5. Start the backend API server
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
| **Administrator** | `admin@assetflow.com` | `admin123` | Full access (Assets, Categories, Employees, Assignments, Users) |
| **Asset Manager** | `manager@assetflow.com` | `manager123` | Equipment assignment, return processing, viewing inventory & history |
| **Employee** | `employee@assetflow.com` | `employee123` | View assigned assets and personal profile |

> **Tip:** The login screen provides 1-click **Quick Demo Account** buttons to instantly fill and sign in with any role.

---

## 🧪 Running Automated Tests

Run the backend unit tests validating assignment and return business rules:

```bash
cd backend
npm test src/assignments/assignments.service.spec.ts src/returns/returns.service.spec.ts
```

**Covered Test Scenarios:**
- ✅ Successful assignment of available asset to active employee in a transaction
- ❌ Rejection if asset is not `AVAILABLE` (`BadRequestException`)
- ❌ Rejection if asset already has an active assignment (`BadRequestException`)
- ❌ Rejection if employee or asset does not exist (`NotFoundException`)
- ✅ Creation of immutable `AssetHistory` audit entry on assignment
- ✅ Return processing: transitions asset condition to `available` on `GOOD`
- ✅ Return processing: transitions asset condition to `damaged` on `DAMAGED`
- ❌ Rejection if returning an already-returned assignment (`BadRequestException`)

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
