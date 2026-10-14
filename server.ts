import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/data.ts';
import { validateCaseInput } from './server/validator.ts';
import { CasePolicy } from './server/policy.ts';
import { runAutomatedTests } from './server/testRunner.ts';
import { User, CasePriority, CaseStatus } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Extend express Request to include authenticated user
interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

// Authentication middleware using Sanctum-style Bearer tokens
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated. Please provide a valid Sanctum bearer token.',
    });
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthenticated. The token is invalid or has expired.',
    });
  }

  req.user = user;
  req.token = token;
  next();
};

/* ==========================================================================
   REST API Endpoints (Section 5)
   ========================================================================== */

// POST /api/login: Get an API token (Anyone)
app.post('/api/login', (req: Request, res: Response) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: {
        ...(!email ? { email: ['The email field is required.'] } : {}),
        ...(!password ? { password: ['The password field is required.'] } : {}),
      },
    });
  }

  const user = db.findUserByEmail(email);

  if (!user || user.passwordHash !== password) {
    return res.status(401).json({
      success: false,
      message: 'The provided credentials do not match our records.',
    });
  }

  const token = db.createTokenForUser(user.id);
  const { passwordHash: _, ...safeUser } = user;

  return res.status(200).json({
    success: true,
    data: {
      token,
      user: safeUser,
    },
    message: 'Login successful.',
  });
});

// POST /api/logout: Revoke token (Logged-in users)
app.post('/api/logout', authenticate, (req: AuthRequest, res: Response) => {
  if (req.token) {
    db.revokeToken(req.token);
  }
  return res.status(200).json({
    success: true,
    message: 'Token revoked successfully.',
  });
});

// GET /api/me: Current authenticated user
app.get('/api/me', authenticate, (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
});

// GET /api/cases: List cases (paginated, filtered, searched, sorted) - Admin, Viewer, Engineer
app.get('/api/cases', authenticate, (req: AuthRequest, res: Response) => {
  if (!CasePolicy.viewAny(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized.',
    });
  }

  let cases = db.getAllCases();

  // Search by Case Number or Surgeon Name
  const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : '';
  if (search) {
    cases = cases.filter(
      (c) =>
        c.case_number.toLowerCase().includes(search) ||
        c.surgeon_name.toLowerCase().includes(search) ||
        c.patient_reference.toLowerCase().includes(search) ||
        c.implant_type.toLowerCase().includes(search)
    );
  }

  // Filter by Status
  const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
  if (status && status !== 'All') {
    cases = cases.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }

  // Bonus: Filter by Priority
  const priority = typeof req.query.priority === 'string' ? req.query.priority.trim() : '';
  if (priority && priority !== 'All') {
    cases = cases.filter((c) => c.priority.toLowerCase() === priority.toLowerCase());
  }

  // Bonus: Column sorting
  const sortBy = typeof req.query.sort_by === 'string' ? req.query.sort_by : 'created_at';
  const sortOrder = req.query.sort_order === 'asc' ? 'asc' : 'desc';

  cases.sort((a, b) => {
    let valA: any = (a as any)[sortBy] ?? '';
    let valB: any = (b as any)[sortBy] ?? '';

    if (sortBy === 'surgery_date') {
      valA = valA || '9999-99-99';
      valB = valB || '9999-99-99';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination (10 per page default)
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
  const perPage = Math.max(1, parseInt(String(req.query.per_page || '10'), 10));
  const total = cases.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const paginatedCases = cases.slice((page - 1) * perPage, page * perPage);

  return res.status(200).json({
    success: true,
    data: {
      cases: paginatedCases,
      pagination: {
        total,
        page,
        per_page: perPage,
        total_pages: totalPages,
      },
      counts: db.getCounts(),
    },
    message: 'Cases retrieved successfully.',
  });
});

// POST /api/cases: Create a case - Admin, Engineer
app.post('/api/cases', authenticate, (req: AuthRequest, res: Response) => {
  if (!CasePolicy.create(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized. Only Admins and Engineers can create cases.',
    });
  }

  const validation = validateCaseInput(req.body);
  if (!validation.isValid) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  const createdCase = db.createCase({
    case_number: req.body.case_number.trim(),
    patient_reference: req.body.patient_reference.trim(),
    surgeon_name: req.body.surgeon_name.trim(),
    implant_type: req.body.implant_type.trim(),
    status: req.body.status as CaseStatus,
    priority: req.body.priority as CasePriority,
    surgery_date: req.body.surgery_date ? String(req.body.surgery_date).trim() : null,
    created_by: req.user!.id,
  });

  return res.status(201).json({
    success: true,
    data: createdCase,
    message: 'Case created successfully.',
  });
});

// GET /api/cases/:id: Get one case - Admin, Viewer, Engineer
app.get('/api/cases/:id', authenticate, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  const caseItem = db.getCaseById(id);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  if (!CasePolicy.view(req.user, caseItem)) {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized.',
    });
  }

  return res.status(200).json({
    success: true,
    data: caseItem,
    message: 'Case retrieved successfully.',
  });
});

// PUT /api/cases/:id: Update a case - Admin, Engineer
app.put('/api/cases/:id', authenticate, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  const caseItem = db.getCaseById(id);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  if (!CasePolicy.update(req.user, caseItem)) {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized. Only Admins and Engineers can edit cases.',
    });
  }

  const validation = validateCaseInput(req.body, id);
  if (!validation.isValid) {
    return res.status(422).json({
      success: false,
      message: 'The given data was invalid.',
      errors: validation.errors,
    });
  }

  const updatedCase = db.updateCase(id, {
    case_number: req.body.case_number.trim(),
    patient_reference: req.body.patient_reference.trim(),
    surgeon_name: req.body.surgeon_name.trim(),
    implant_type: req.body.implant_type.trim(),
    status: req.body.status as CaseStatus,
    priority: req.body.priority as CasePriority,
    surgery_date: req.body.surgery_date ? String(req.body.surgery_date).trim() : null,
  });

  return res.status(200).json({
    success: true,
    data: updatedCase,
    message: 'Case updated successfully.',
  });
});

// DELETE /api/cases/:id: Delete a case - Admin ONLY
app.delete('/api/cases/:id', authenticate, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  const caseItem = db.getCaseById(id);
  if (!caseItem) {
    return res.status(404).json({
      success: false,
      message: 'Medical case not found.',
    });
  }

  // Strict: Delete must work for Admin only! Viewer or Engineer gets 403 Forbidden.
  if (!CasePolicy.delete(req.user, caseItem)) {
    return res.status(403).json({
      success: false,
      message: 'This action is unauthorized. Only Admins can delete cases.',
    });
  }

  db.deleteCase(id);

  return res.status(200).json({
    success: true,
    message: 'Case deleted successfully.',
  });
});

// GET /api/holidays: Nager.Date Public Holiday integration (Bonus task)
app.get('/api/holidays', async (req: Request, res: Response) => {
  const dateStr = typeof req.query.date === 'string' ? req.query.date.trim() : '';
  const countryCode = typeof req.query.country === 'string' ? req.query.country.trim().toUpperCase() : 'US';

  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid date parameter in YYYY-MM-DD format.',
    });
  }

  const year = dateStr.split('-')[0];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const apiRes = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      throw new Error(`Public Holiday API returned ${apiRes.status}`);
    }

    const holidays: any[] = await apiRes.json();
    const matchingHoliday = holidays.find((h) => h.date === dateStr);

    return res.status(200).json({
      success: true,
      data: {
        isHoliday: !!matchingHoliday,
        holiday: matchingHoliday || null,
        allHolidaysCount: holidays.length,
      },
      message: matchingHoliday
        ? `Note: ${dateStr} is a public holiday (${matchingHoliday.name}). Operating rooms may have restricted scheduling.`
        : `${dateStr} is a standard working day.`,
    });
  } catch (err: any) {
    // Graceful fallback with static major holiday detection
    const monthDay = dateStr.substring(5);
    const knownHolidays: Record<string, string> = {
      '01-01': "New Year's Day",
      '07-04': 'Independence Day',
      '11-11': 'Veterans Day',
      '12-25': 'Christmas Day',
    };
    const fallbackName = knownHolidays[monthDay];

    return res.status(200).json({
      success: true,
      data: {
        isHoliday: !!fallbackName,
        holiday: fallbackName ? { name: fallbackName, date: dateStr } : null,
        fallbackMode: true,
      },
      message: fallbackName
        ? `Scheduled date coincides with ${fallbackName}.`
        : 'Standard working schedule.',
    });
  }
});

// GET /api/tests/run: Execute the 6 required automated tests
app.get('/api/tests/run', async (_req: Request, res: Response) => {
  const results = await runAutomatedTests();
  const allPassed = results.every((r) => r.passed);

  return res.status(200).json({
    success: true,
    data: {
      allPassed,
      totalTests: results.length,
      passedCount: results.filter((r) => r.passed).length,
      failedCount: results.filter((r) => !r.passed).length,
      results,
    },
    message: allPassed
      ? 'All automated feature tests passed successfully.'
      : 'Some automated tests failed.',
  });
});

// POST /api/reset-data: Reset data back to default seed
app.post('/api/reset-data', authenticate, (_req: AuthRequest, res: Response) => {
  db.reset();
  return res.status(200).json({
    success: true,
    message: 'Database reset to initial 25 dummy medical cases.',
    data: db.getCounts(),
  });
});

// GET /api/export/postman: Download Postman / Thunder Client collection
app.get('/api/export/postman', (_req: Request, res: Response) => {
  const collection = {
    info: {
      name: 'Jajal Medical Case Management API',
      description: 'REST API collection for Jajal Medical Implant Case Management with Sanctum Bearer tokens and role access.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    item: [
      {
        name: 'Auth - Login (Admin)',
        request: {
          method: 'POST',
          url: '{{baseUrl}}/api/login',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ email: 'admin@jajalmedical.com', password: '123456' }, null, 2),
          },
        },
      },
      {
        name: 'Auth - Login (Viewer)',
        request: {
          method: 'POST',
          url: '{{baseUrl}}/api/login',
          header: [{ key: 'Content-Type', value: 'application/json' }],
          body: {
            mode: 'raw',
            raw: JSON.stringify({ email: 'viewer@jajalmedical.com', password: 'viewer123' }, null, 2),
          },
        },
      },
      {
        name: 'Cases - List Cases (Paginated)',
        request: {
          method: 'GET',
          url: '{{baseUrl}}/api/cases?page=1&per_page=10&status=Planning',
          header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        },
      },
      {
        name: 'Cases - Create Case (Admin/Engineer)',
        request: {
          method: 'POST',
          url: '{{baseUrl}}/api/cases',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{token}}' },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                case_number: 'CASE-0099',
                patient_reference: 'PAT-9900',
                surgeon_name: 'Dr. Marcus Thorne',
                implant_type: 'Titanium Cranial Reconstruction Mesh',
                status: 'Planning',
                priority: 'High',
                surgery_date: '2026-11-15',
              },
              null,
              2
            ),
          },
        },
      },
      {
        name: 'Cases - Get One Case',
        request: {
          method: 'GET',
          url: '{{baseUrl}}/api/cases/1',
          header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        },
      },
      {
        name: 'Cases - Update Case',
        request: {
          method: 'PUT',
          url: '{{baseUrl}}/api/cases/1',
          header: [
            { key: 'Content-Type', value: 'application/json' },
            { key: 'Authorization', value: 'Bearer {{token}}' },
          ],
          body: {
            mode: 'raw',
            raw: JSON.stringify(
              {
                case_number: 'CASE-0001',
                patient_reference: 'PAT-8492',
                surgeon_name: 'Dr. Eleanor Vance',
                implant_type: 'Titanium Cranial Reconstruction Mesh',
                status: 'Approved',
                priority: 'High',
                surgery_date: '2026-10-24',
              },
              null,
              2
            ),
          },
        },
      },
      {
        name: 'Cases - Delete Case (Admin only)',
        request: {
          method: 'DELETE',
          url: '{{baseUrl}}/api/cases/1',
          header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        },
      },
      {
        name: 'Bonus - Nager.Date Public Holidays',
        request: {
          method: 'GET',
          url: '{{baseUrl}}/api/holidays?date=2026-11-26&country=US',
        },
      },
    ],
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="jajal_medical_api.postman_collection.json"');
  return res.send(JSON.stringify(collection, null, 2));
});

// GET /api/export/bundle: Download complete Git repository bundle
app.get('/api/export/bundle', (_req: Request, res: Response) => {
  const bundlePath = path.resolve(__dirname, 'jajal-medical-case-management.bundle');
  res.download(bundlePath, 'jajal-medical-case-management.bundle');
});

// GET /api/export/zip: Download project ZIP archive
app.get('/api/export/zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'jajal-medical-case-management.zip');
  res.download(zipPath, 'jajal-medical-case-management.zip');
});

/* ==========================================================================
   Vite & Static Server Handling
   ========================================================================== */

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jajal Medical Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
