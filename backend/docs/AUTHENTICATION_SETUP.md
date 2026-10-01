# Authentication & Authorization Setup (AssetFlow)

This document describes the security architecture, role-based access control (RBAC), and authentication flow implemented for the Employee Asset & Inventory Management System.

---

## 1. Security Architecture Overview
- **Protocol:** JSON Web Tokens (JWT) signed via HMAC-SHA256 (`HS256`).
- **Password Storage:** Salted and hashed using `bcryptjs` with 10 salt rounds.
- **Transport Security:** Bearer tokens transmitted in the `Authorization: Bearer <token>` header.
- **RFC 7807 Problem Details:** Authentication errors and permission rejections return RFC 7807 compliant JSON problem responses.

---

## 2. Roles & Permissions (RBAC)

| Role | Intended User | Permissions & Capabilities |
| :--- | :--- | :--- |
| `ADMIN` | System Administrator / IT Director | Full access to all modules: register/modify/retire assets, manage categories, manage employees, assign/return equipment, view audit history, create system users. |
| `MANAGER` | Asset / Inventory Manager | Operational access: assign available assets, process equipment returns, view asset catalogs, employees, and inventory reports. |
| `EMPLOYEE` | Company Staff | Read-only access: view company inventory and personal equipment currently in custody. |

---

## 3. Seed Accounts & Credentials

The database comes pre-seeded with accounts for testing every role:

```text
ADMIN:
  Email:    admin@assetflow.com
  Password: admin123

MANAGER:
  Email:    manager@assetflow.com
  Password: manager123

EMPLOYEE:
  Email:    employee@assetflow.com
  Password: employee123
```

---

## 4. Authentication Endpoints

### 4.1 Login
- **Endpoint:** `POST /auth/login`
- **Headers:** `Content-Type: application/json`
- **Request Payload:**
```json
{
  "email": "admin@assetflow.com",
  "password": "admin123"
}
```
- **Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@assetflow.com",
    "role": "ADMIN",
    "firstName": "System",
    "lastName": "Administrator"
  }
}
```
- **Error Response (401 Unauthorized / RFC 7807):**
```json
{
  "type": "https://api.assetflow.local/problems/unauthorized",
  "title": "Unauthorized",
  "status": 401,
  "detail": "Invalid credentials provided",
  "timestamp": "2026-10-01T14:30:00.000Z",
  "path": "/auth/login"
}
```
