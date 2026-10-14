# Jajal Medical - Medical Case Management System

A web application designed for a medical device company to track patient-matched surgical implant cases from draft to completion. Built according to the **Software Developer Intern Practical Assignment** requirements for **Jajal Medical (Oct 2026)**.

---

## 1. Project Overview & Tech Stack

This portal provides end-to-end case tracking for custom orthopedic, cranial, dental, and maxillofacial implants. The platform features strict role-based access control, responsive interfaces, backend validation, audit logging, and automated verification tests.

### Tech Stack
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend / REST API:** Node.js Express server with Vite middleware integration
- **Authentication:** Sanctum-style API Bearer token authentication
- **External Public API:** Nager.Date integration for surgical date public holiday conflict detection
- **Testing:** Automated Feature Test Suite with live assertion diagnostics
- **Build / Tooling:** Vite, TypeScript compiler (`tsc`)

---

## 2. Test Login Credentials

Seed users are provisioned with distinct permission boundaries:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@jajalmedical.com` | `123456` | View cases, Create cases, Edit cases, Change status, **Delete cases** |
| **Viewer** | `viewer@jajalmedical.com` | `viewer123` | **View cases only** (Cannot create, edit, change status, or delete) |
| **Engineer (Bonus)** | `engineer@jajalmedical.com` | `engineer123` | View cases, Create cases, Edit cases, Change status (**Cannot delete**) |

*Note: The login screen also features quick 1-click credential buttons for immediate reviewer testing.*

---

## 3. Setup & Installation Steps

### Running the App Locally:
```bash
# 1. Clone repository
git clone <repository_url>
cd jajal-medical-case-management

# 2. Install dependencies
npm install

# 3. Environment configuration
cp .env.example .env

# 4. Start full-stack development server (Express API + Vite on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 4. How to Run Automated Tests

The application includes automated feature tests covering all 6 mandatory requirements from Section 7 plus bonus tests:

1. **In-App Interactive Test Runner:**
   - Log into the application as any user.
   - Click **"Automated Tests"** in the top navigation bar or the footer link.
   - Click **"Rerun Suite"** to execute all feature tests against the live API and view status codes, request payloads, response bodies, and latency.

2. **Via API Endpoint / curl:**
   ```bash
   curl -s http://localhost:3000/api/tests/run | jq
   ```

### Tested Test Cases:
- `TEST-001`: Valid login succeeds with HTTP 200 and issues a Sanctum bearer token.
- `TEST-002`: Invalid login is rejected with HTTP 401 and an error message.
- `TEST-003`: A guest without a bearer token cannot access case APIs (HTTP 401).
- `TEST-004`: Admin user can create a case with HTTP 201.
- `TEST-005`: Creating a case with a duplicate `case_number` fails with HTTP 422 Unprocessable Content.
- `TEST-006`: Viewer role cannot delete a case (enforced server-side with HTTP 403 Forbidden).
- `TEST-007 (Bonus)`: Engineer role can edit and update status but cannot delete (HTTP 403 Forbidden).
- `TEST-008 (Bonus)`: On editing an existing case, the unique rule ignores the case's own ID.

---

## 5. REST API Endpoints Specification

All endpoints return a uniform JSON response envelope:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation description."
}
```

Validation errors return HTTP 422:
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "case_number": ["The case number has already been taken."]
  }
}
```

| Method | Endpoint | Description | Authorized Roles | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate user & issue token | Public (Anyone) | `200`, `401`, `422` |
| `POST` | `/api/logout` | Revoke current bearer token | Logged-in users | `200`, `401` |
| `GET` | `/api/cases` | List cases (paginated, filtered, sorted) | Admin, Viewer, Engineer | `200`, `401`, `403` |
| `POST` | `/api/cases` | Create a new implant case | Admin, Engineer | `201`, `401`, `403`, `422` |
| `GET` | `/api/cases/:id` | Retrieve single case with creator info | Admin, Viewer, Engineer | `200`, `401`, `403`, `404` |
| `PUT` | `/api/cases/:id` | Update case details or clinical status | Admin, Engineer | `200`, `401`, `403`, `404`, `422` |
| `DELETE` | `/api/cases/:id` | Delete case permanently | **Admin only** | `200`, `401`, `403`, `404` |
| `GET` | `/api/holidays` | Nager.Date Public Holiday verification | Public | `200`, `400` |
| `GET` | `/api/tests/run` | Execute automated test suite | Public | `200` |
| `GET` | `/api/export/postman` | Download Postman Collection JSON | Public | `200` |

---

## 6. Assumptions and Known Limitations

1. **Dummy Data Only:** No real Protected Health Information (PHI) or real patient names are used. Patient references follow synthetic identifiers (e.g., `PAT-8492`).
2. **Server-Side Policy Enforcement:** Hiding action buttons in the UI is considered insufficient; all write and delete operations are strictly protected by `CasePolicy` middleware on the server, returning `403 Forbidden` for unauthorized roles.
3. **External Holiday API Graceful Degradation:** The Nager.Date API integration enforces a 3.5-second timeout and falls back to internal holiday tables if the external network is unreachable or rate-limited.
4. **Data Persistence:** The demonstration runtime utilizes an in-memory relational store pre-seeded with 25 realistic implant cases and relational foreign keys (`created_by -> users.id`). A "Reset Seed" affordance allows reviewers to restore test data at any time.

---

## 7. Documentation Links
- **Database Schema & Entity Relationships:** [docs/database.md](docs/database.md)
- **Medical Software Traceability Matrix:** [docs/traceability.md](docs/traceability.md)
- **AWS Production Deployment Architecture:** [docs/deployment.md](docs/deployment.md)
- **Postman API Collection:** [postman_collection.json](postman_collection.json)
