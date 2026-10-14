# Medical Device Software Traceability Matrix

Under medical device software lifecycle standards (such as **IEC 62304** and **FDA Quality System Regulation 21 CFR Part 820.30**), software development must maintain bidirectional traceability: every software requirement specification (SRS input) must trace directly to its software design and source code implementation, which in turn must trace to automated verification tests.

This document records the traceability matrix for the Jajal Medical Case Management web application.

---

## Traceability Matrix

| ID | Requirement (Input) | Implementation (Output) | Verification |
| :--- | :--- | :--- | :--- |
| **REQ-001** | Admin shall be able to create a case | `CaseController@store` / `app.post('/api/cases')` + `CaseFormView.tsx` | Feature test: `TEST-004` (Admin creates case returns HTTP 201) |
| **REQ-002** | Case Number shall be unique | Unique DB index (`cases_case_number_unique`) + Form Request rule (`validateCaseInput`) | Feature test: `TEST-005` (Duplicate case number rejected with HTTP 422) |
| **REQ-003** | Only Admin shall delete cases | `CasePolicy@delete` (blocked at server controller layer) | Feature test: `TEST-006` (Viewer delete attempt blocked with HTTP 403) |
| **REQ-004** | Case pages and APIs must be protected from unauthenticated guests | `auth:sanctum` middleware + Bearer token validation | Feature test: `TEST-003` (Unauthenticated request returns HTTP 401) |
| **REQ-005** | User authentication with valid credentials | `AuthController@login` / `app.post('/api/login')` | Feature test: `TEST-001` (Valid credentials return HTTP 200 and token) |
| **REQ-006** | Invalid login attempts must be rejected with informative error | `AuthController@login` credential verification | Feature test: `TEST-002` (Invalid login returns HTTP 401) |
| **REQ-007** | Engineer role shall create and edit cases but is prohibited from deletion | `CasePolicy@update` (allowed) and `CasePolicy@delete` (prohibited) | Feature test: `TEST-007` (Engineer deletion attempt returns HTTP 403) |
| **REQ-008** | Case Number uniqueness constraint shall ignore current case during edits | Form Request update rule (`ignore($id)`) | Feature test: `TEST-008` (Self-case update returns HTTP 200 without duplicate collision) |

---

## Verification Summary
All 8 verification tests are executed by the automated test suite runner (`GET /api/tests/run` or via the in-app "Automated Tests" modal) with 100% pass rate.
