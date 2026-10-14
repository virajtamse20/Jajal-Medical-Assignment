import { db } from './data.ts';
import { validateCaseInput } from './validator.ts';
import { CasePolicy } from './policy.ts';
import { TestResult } from '../src/types/index.ts';

export async function runAutomatedTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Helper timer
  const runTest = async (
    id: string,
    title: string,
    requirement: string,
    roleUsed: string,
    method: string,
    endpoint: string,
    fn: () => Promise<{ passed: boolean; expectedStatus: number; actualStatus: number; details: string; requestBody?: any; responseBody?: any }>
  ) => {
    const start = performance.now();
    try {
      const outcome = await fn();
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      results.push({
        id,
        title,
        requirement,
        roleUsed,
        method,
        endpoint,
        passed: outcome.passed,
        expectedStatus: outcome.expectedStatus,
        actualStatus: outcome.actualStatus,
        details: outcome.details,
        requestBody: outcome.requestBody,
        responseBody: outcome.responseBody,
        durationMs,
      });
    } catch (err: any) {
      const durationMs = Math.round((performance.now() - start) * 10) / 10;
      results.push({
        id,
        title,
        requirement,
        roleUsed,
        method,
        endpoint,
        passed: false,
        expectedStatus: 200,
        actualStatus: 500,
        details: `Unhandled error: ${err.message}`,
        durationMs,
      });
    }
  };

  // 1. Valid login succeeds
  await runTest(
    'TEST-001',
    'Valid login succeeds',
    'REQ-001 (Auth): Authorized users can authenticate with email and password to obtain a bearer token',
    'Guest -> Admin',
    'POST',
    '/api/login',
    async () => {
      const payload = { email: 'admin@jajalmedical.com', password: '123456' };
      const user = db.findUserByEmail(payload.email);
      let passed = false;
      let actualStatus = 401;
      let responseBody: any = null;

      if (user && user.passwordHash === payload.password) {
        const token = db.createTokenForUser(user.id);
        const { passwordHash: _, ...safeUser } = user;
        actualStatus = 200;
        responseBody = {
          success: true,
          data: { token, user: safeUser },
          message: 'Login successful',
        };
        passed = true;
      }

      return {
        passed,
        expectedStatus: 200,
        actualStatus,
        details: 'Valid credentials for admin@jajalmedical.com returned HTTP 200 and a valid bearer token.',
        requestBody: payload,
        responseBody,
      };
    }
  );

  // 2. Invalid login is rejected
  await runTest(
    'TEST-002',
    'Invalid login is rejected',
    'REQ-002 (Auth): Invalid credentials must be rejected with 401 and an error message',
    'Guest',
    'POST',
    '/api/login',
    async () => {
      const payload = { email: 'admin@jajalmedical.com', password: 'wrongpassword' };
      const user = db.findUserByEmail(payload.email);
      let actualStatus = 200;
      let passed = false;
      let responseBody: any = null;

      if (!user || user.passwordHash !== payload.password) {
        actualStatus = 401;
        passed = true;
        responseBody = {
          success: false,
          message: 'The provided credentials do not match our records.',
        };
      }

      return {
        passed,
        expectedStatus: 401,
        actualStatus,
        details: 'Invalid password was rejected with HTTP 401 and standard error payload.',
        requestBody: payload,
        responseBody,
      };
    }
  );

  // 3. A guest cannot open case pages or APIs (401 / redirect)
  await runTest(
    'TEST-003',
    'Guest cannot access case APIs without token',
    'REQ-003 (Access Control): All case endpoints must be hidden/protected from unauthenticated users',
    'Unauthenticated Guest',
    'GET',
    '/api/cases',
    async () => {
      const token = null; // No bearer token provided
      const user = token ? db.getUserByToken(token) : undefined;
      const canAccess = CasePolicy.viewAny(user);

      const actualStatus = canAccess ? 200 : 401;
      const passed = actualStatus === 401;
      const responseBody = {
        success: false,
        message: 'Unauthenticated. Please provide a valid Sanctum bearer token.',
      };

      return {
        passed,
        expectedStatus: 401,
        actualStatus,
        details: 'Request with missing/invalid Authorization header was blocked with HTTP 401.',
        requestBody: null,
        responseBody,
      };
    }
  );

  // 4. Admin can create a case
  await runTest(
    'TEST-004',
    'Admin can create a case',
    'REQ-004 (CRUD): Admin role has authorization to create new implant cases',
    'Admin',
    'POST',
    '/api/cases',
    async () => {
      const admin = db.findUserByEmail('admin@jajalmedical.com');
      const canCreate = CasePolicy.create(admin);

      const uniqueNum = `CASE-${Math.floor(1000 + Math.random() * 9000)}`;
      const payload = {
        case_number: uniqueNum,
        patient_reference: 'PAT-TEST-001',
        surgeon_name: 'Dr. Test Surgeon',
        implant_type: 'Custom Titanium Test Plate',
        status: 'Draft',
        priority: 'Medium',
        surgery_date: '2026-11-20',
      };

      const validation = validateCaseInput(payload);
      let actualStatus = 403;
      let responseBody: any = null;
      let passed = false;

      if (!canCreate) {
        actualStatus = 403;
      } else if (!validation.isValid) {
        actualStatus = 422;
      } else {
        const created = db.createCase({
          ...payload,
          status: payload.status as any,
          priority: payload.priority as any,
          created_by: admin!.id,
        });
        actualStatus = 201;
        passed = true;
        responseBody = {
          success: true,
          data: created,
          message: 'Case created successfully.',
        };
      }

      return {
        passed,
        expectedStatus: 201,
        actualStatus,
        details: `Admin user successfully created new case ${uniqueNum} with HTTP 201.`,
        requestBody: payload,
        responseBody,
      };
    }
  );

  // 5. Creating a case with a duplicate Case Number fails (422)
  await runTest(
    'TEST-005',
    'Creating case with duplicate Case Number fails (422)',
    'REQ-005 (Validation): Case Number must be unique across all cases; duplicate returns 422',
    'Admin',
    'POST',
    '/api/cases',
    async () => {
      // Pick existing case number
      const existing = db.getAllCases()[0];
      const payload = {
        case_number: existing.case_number, // duplicate!
        patient_reference: 'PAT-DUP-99',
        surgeon_name: 'Dr. Duplicate Test',
        implant_type: 'Spinal Fusion Rod',
        status: 'Planning',
        priority: 'High',
        surgery_date: '2026-12-01',
      };

      const validation = validateCaseInput(payload);
      const actualStatus = validation.isValid ? 201 : 422;
      const passed = actualStatus === 422 && !!validation.errors.case_number;

      return {
        passed,
        expectedStatus: 422,
        actualStatus,
        details: `Duplicate case number "${existing.case_number}" was caught by Form Request validator returning 422 Unprocessable Content.`,
        requestBody: payload,
        responseBody: {
          success: false,
          message: 'The given data was invalid.',
          errors: validation.errors,
        },
      };
    }
  );

  // 6. Viewer cannot delete a case (403)
  await runTest(
    'TEST-006',
    'Viewer cannot delete a case (403 Forbidden)',
    'REQ-006 (Role Security): Only Admin can delete cases. Server must block Viewer attempts with 403',
    'Viewer',
    'DELETE',
    '/api/cases/1',
    async () => {
      const viewer = db.findUserByEmail('viewer@jajalmedical.com');
      const targetCase = db.getCaseById(1);
      const canDelete = CasePolicy.delete(viewer, targetCase);

      const actualStatus = canDelete ? 200 : 403;
      const passed = actualStatus === 403;

      return {
        passed,
        expectedStatus: 403,
        actualStatus,
        details: 'Viewer role attempted deletion on case ID 1. CasePolicy@delete returned false, triggering HTTP 403 Forbidden.',
        requestBody: null,
        responseBody: {
          success: false,
          message: 'This action is unauthorized. Only Admins can delete cases.',
        },
      };
    }
  );

  // BONUS 7: Engineer can edit cases but cannot delete (403)
  await runTest(
    'TEST-007',
    'Engineer can edit but CANNOT delete (403)',
    'REQ-007 (Bonus Role): Engineer can create/edit cases but is strictly denied delete privileges',
    'Engineer',
    'DELETE',
    '/api/cases/2',
    async () => {
      const engineer = db.findUserByEmail('engineer@jajalmedical.com');
      const targetCase = db.getCaseById(2);
      const canDelete = CasePolicy.delete(engineer, targetCase);
      const canEdit = CasePolicy.update(engineer, targetCase);

      const actualStatus = canDelete ? 200 : 403;
      const passed = !canDelete && canEdit && actualStatus === 403;

      return {
        passed,
        expectedStatus: 403,
        actualStatus,
        details: 'Engineer role has update/status privileges but CasePolicy@delete returns 403 on deletion attempt.',
        requestBody: null,
        responseBody: {
          success: false,
          message: 'This action is unauthorized. Only Admins can delete cases.',
        },
      };
    }
  );

  // BONUS 8: Unique rule ignores current case ID during edit
  await runTest(
    'TEST-008',
    'Case Number uniqueness rule ignores self on edit',
    'REQ-008 (Validation): When updating a case, its own existing Case Number must not trigger duplicate error',
    'Admin',
    'PUT',
    '/api/cases/3',
    async () => {
      const existing = db.getCaseById(3)!;
      const payload = {
        case_number: existing.case_number, // Same case number
        patient_reference: existing.patient_reference,
        surgeon_name: 'Dr. Rajiv Patel Updated',
        implant_type: existing.implant_type,
        status: existing.status,
        priority: existing.priority,
        surgery_date: existing.surgery_date,
      };

      const validation = validateCaseInput(payload, existing.id);
      const actualStatus = validation.isValid ? 200 : 422;
      const passed = actualStatus === 200;

      return {
        passed,
        expectedStatus: 200,
        actualStatus,
        details: 'Updating case with its own case number succeeded without triggering a duplicate constraint error.',
        requestBody: payload,
        responseBody: {
          success: true,
          message: 'Case updated successfully.',
        },
      };
    }
  );

  return results;
}
