import { User, MedicalCase, CaseStatus, CasePriority } from '../src/types/index.ts';

export const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 1,
    name: 'Dr. Sarah Chen',
    email: 'admin@jajalmedical.com',
    role: 'admin',
    passwordHash: '123456',
    created_at: '2026-09-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Alex Rivera',
    email: 'viewer@jajalmedical.com',
    role: 'viewer',
    passwordHash: 'viewer123',
    created_at: '2026-09-02T09:30:00Z',
  },
  {
    id: 3,
    name: 'Devin Mehta',
    email: 'engineer@jajalmedical.com',
    role: 'engineer',
    passwordHash: 'engineer123',
    created_at: '2026-09-05T10:15:00Z',
  },
];

export const INITIAL_CASES: MedicalCase[] = [
  {
    id: 1,
    case_number: 'CASE-0001',
    patient_reference: 'PAT-8492',
    surgeon_name: 'Dr. Eleanor Vance',
    implant_type: 'Titanium Cranial Reconstruction Mesh',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-24',
    created_by: 1,
    created_at: '2026-10-01T09:15:00Z',
    updated_at: '2026-10-05T14:20:00Z',
  },
  {
    id: 2,
    case_number: 'CASE-0002',
    patient_reference: 'PAT-3391',
    surgeon_name: 'Dr. Marcus Thorne',
    implant_type: 'PEEK Lumbar Interbody Fusion Cage L4-L5',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-02',
    created_by: 1,
    created_at: '2026-10-02T10:30:00Z',
    updated_at: '2026-10-02T10:30:00Z',
  },
  {
    id: 3,
    case_number: 'CASE-0003',
    patient_reference: 'PAT-7724',
    surgeon_name: 'Dr. Rajiv Patel',
    implant_type: 'Ceramic-on-Ceramic Total Hip Acetabular Cup',
    status: 'Completed',
    priority: 'High',
    surgery_date: '2026-10-08',
    created_by: 1,
    created_at: '2026-09-20T11:00:00Z',
    updated_at: '2026-10-09T08:45:00Z',
  },
  {
    id: 4,
    case_number: 'CASE-0004',
    patient_reference: 'PAT-1185',
    surgeon_name: 'Dr. Clara Oswald',
    implant_type: 'Cobalt-Chrome Bicondylar Knee Femoral Component',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-10-28',
    created_by: 3,
    created_at: '2026-10-03T13:45:00Z',
    updated_at: '2026-10-06T16:10:00Z',
  },
  {
    id: 5,
    case_number: 'CASE-0005',
    patient_reference: 'PAT-6204',
    surgeon_name: 'Dr. Benjamin Hayes',
    implant_type: 'Trabecular Porous Glenoid Shoulder Anchor',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-11-12',
    created_by: 1,
    created_at: '2026-10-04T08:20:00Z',
    updated_at: '2026-10-07T09:30:00Z',
  },
  {
    id: 6,
    case_number: 'CASE-0006',
    patient_reference: 'PAT-9912',
    surgeon_name: 'Dr. Eleanor Vance',
    implant_type: 'Custom Mandibular Subperiosteal Reconstruction Plate',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-11-05',
    created_by: 3,
    created_at: '2026-10-04T15:00:00Z',
    updated_at: '2026-10-04T15:00:00Z',
  },
  {
    id: 7,
    case_number: 'CASE-0007',
    patient_reference: 'PAT-4402',
    surgeon_name: 'Dr. Samantha Wu',
    implant_type: 'Custom PEEK Orbital Floor Implant',
    status: 'In Review',
    priority: 'Medium',
    surgery_date: '2026-11-18',
    created_by: 1,
    created_at: '2026-10-05T09:00:00Z',
    updated_at: '2026-10-07T11:20:00Z',
  },
  {
    id: 8,
    case_number: 'CASE-0008',
    patient_reference: 'PAT-5531',
    surgeon_name: 'Dr. Marcus Thorne',
    implant_type: 'Polyaxial Cervical Spine Fixation Rod System C3-C5',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-06T10:15:00Z',
    updated_at: '2026-10-06T10:15:00Z',
  },
  {
    id: 9,
    case_number: 'CASE-0009',
    patient_reference: 'PAT-2088',
    surgeon_name: 'Dr. Rajiv Patel',
    implant_type: 'Modular Revision Hip Stem 14mm Standard Offset',
    status: 'Completed',
    priority: 'High',
    surgery_date: '2026-10-10',
    created_by: 1,
    created_at: '2026-09-25T14:10:00Z',
    updated_at: '2026-10-11T12:00:00Z',
  },
  {
    id: 10,
    case_number: 'CASE-0010',
    patient_reference: 'PAT-7019',
    surgeon_name: 'Dr. Clara Oswald',
    implant_type: 'Unicondylar Medial Knee Arthroplasty Spacer',
    status: 'Approved',
    priority: 'Low',
    surgery_date: '2026-11-20',
    created_by: 3,
    created_at: '2026-10-06T16:30:00Z',
    updated_at: '2026-10-08T10:00:00Z',
  },
  {
    id: 11,
    case_number: 'CASE-0011',
    patient_reference: 'PAT-8371',
    surgeon_name: 'Dr. Benjamin Hayes',
    implant_type: 'Reverse Total Shoulder Metaglene Plate',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-15',
    created_by: 1,
    created_at: '2026-10-07T11:45:00Z',
    updated_at: '2026-10-07T11:45:00Z',
  },
  {
    id: 12,
    case_number: 'CASE-0012',
    patient_reference: 'PAT-1934',
    surgeon_name: 'Dr. Samantha Wu',
    implant_type: 'Temporomandibular Joint (TMJ) Prosthesis Fossa Component',
    status: 'Cancelled',
    priority: 'Low',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-09-28T09:30:00Z',
    updated_at: '2026-10-02T13:15:00Z',
  },
  {
    id: 13,
    case_number: 'CASE-0013',
    patient_reference: 'PAT-4022',
    surgeon_name: 'Dr. Eleanor Vance',
    implant_type: 'Patient-Specific Frontal Bone Calvarial Graft Plate',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-10-30',
    created_by: 3,
    created_at: '2026-10-07T14:00:00Z',
    updated_at: '2026-10-09T17:20:00Z',
  },
  {
    id: 14,
    case_number: 'CASE-0014',
    patient_reference: 'PAT-6619',
    surgeon_name: 'Dr. Marcus Thorne',
    implant_type: 'Thoracolumbar Deformity Correction Hook Rod Construct',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-08',
    created_by: 1,
    created_at: '2026-10-08T08:30:00Z',
    updated_at: '2026-10-10T09:10:00Z',
  },
  {
    id: 15,
    case_number: 'CASE-0015',
    patient_reference: 'PAT-3105',
    surgeon_name: 'Dr. Rajiv Patel',
    implant_type: 'Bipolar Femoral Head Hemiarthroplasty Shell 48mm',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-25',
    created_by: 3,
    created_at: '2026-10-08T13:20:00Z',
    updated_at: '2026-10-08T13:20:00Z',
  },
  {
    id: 16,
    case_number: 'CASE-0016',
    patient_reference: 'PAT-9081',
    surgeon_name: 'Dr. Clara Oswald',
    implant_type: 'Rotating-Platform High-Flex Knee Tibial Baseplate',
    status: 'Draft',
    priority: 'Low',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-09T10:00:00Z',
    updated_at: '2026-10-09T10:00:00Z',
  },
  {
    id: 17,
    case_number: 'CASE-0017',
    patient_reference: 'PAT-2476',
    surgeon_name: 'Dr. Benjamin Hayes',
    implant_type: 'Anatomic Humeral Head Stemless Resurfacing Cap',
    status: 'Planning',
    priority: 'Low',
    surgery_date: '2026-12-01',
    created_by: 3,
    created_at: '2026-10-09T15:45:00Z',
    updated_at: '2026-10-09T15:45:00Z',
  },
  {
    id: 18,
    case_number: 'CASE-0018',
    patient_reference: 'PAT-5820',
    surgeon_name: 'Dr. Samantha Wu',
    implant_type: 'Custom Titanium Maxillary Sinus Augmentation Mesh',
    status: 'Approved',
    priority: 'Medium',
    surgery_date: '2026-11-10',
    created_by: 1,
    created_at: '2026-10-10T09:15:00Z',
    updated_at: '2026-10-12T11:00:00Z',
  },
  {
    id: 19,
    case_number: 'CASE-0019',
    patient_reference: 'PAT-7394',
    surgeon_name: 'Dr. Marcus Thorne',
    implant_type: 'Anterior Cervical Discectomy and Fusion (ACDF) Plate',
    status: 'Completed',
    priority: 'High',
    surgery_date: '2026-10-04',
    created_by: 1,
    created_at: '2026-09-18T14:30:00Z',
    updated_at: '2026-10-05T09:00:00Z',
  },
  {
    id: 20,
    case_number: 'CASE-0020',
    patient_reference: 'PAT-1502',
    surgeon_name: 'Dr. Eleanor Vance',
    implant_type: 'Bioabsorbable Craniofacial Osteosynthesis Screw Kit',
    status: 'Planning',
    priority: 'Medium',
    surgery_date: '2026-11-16',
    created_by: 3,
    created_at: '2026-10-10T16:20:00Z',
    updated_at: '2026-10-10T16:20:00Z',
  },
  {
    id: 21,
    case_number: 'CASE-0021',
    patient_reference: 'PAT-8819',
    surgeon_name: 'Dr. Rajiv Patel',
    implant_type: 'Tantalum Trabecular Metal Acetabular Augment Wedge',
    status: 'In Review',
    priority: 'High',
    surgery_date: '2026-11-04',
    created_by: 1,
    created_at: '2026-10-11T10:10:00Z',
    updated_at: '2026-10-12T14:30:00Z',
  },
  {
    id: 22,
    case_number: 'CASE-0022',
    patient_reference: 'PAT-4920',
    surgeon_name: 'Dr. Clara Oswald',
    implant_type: 'Hinged Revision Knee Modular Distal Femoral Sleeve',
    status: 'Planning',
    priority: 'High',
    surgery_date: '2026-11-28',
    created_by: 3,
    created_at: '2026-10-11T13:50:00Z',
    updated_at: '2026-10-11T13:50:00Z',
  },
  {
    id: 23,
    case_number: 'CASE-0023',
    patient_reference: 'PAT-6194',
    surgeon_name: 'Dr. Samantha Wu',
    implant_type: 'Titanium Zygomatic Implant Fixture 45mm',
    status: 'Draft',
    priority: 'Medium',
    surgery_date: null,
    created_by: 1,
    created_at: '2026-10-12T08:45:00Z',
    updated_at: '2026-10-12T08:45:00Z',
  },
  {
    id: 24,
    case_number: 'CASE-0024',
    patient_reference: 'PAT-3047',
    surgeon_name: 'Dr. Eleanor Vance',
    implant_type: 'Polyetheretherketone (PEEK) Customized Parietal Plate',
    status: 'Approved',
    priority: 'High',
    surgery_date: '2026-11-07',
    created_by: 1,
    created_at: '2026-10-12T11:30:00Z',
    updated_at: '2026-10-13T10:00:00Z',
  },
  {
    id: 25,
    case_number: 'CASE-0025',
    patient_reference: 'PAT-9731',
    surgeon_name: 'Dr. Benjamin Hayes',
    implant_type: 'Modular Bipolar Radial Head Prosthesis 22mm',
    status: 'In Review',
    priority: 'Low',
    surgery_date: '2026-12-05',
    created_by: 3,
    created_at: '2026-10-13T09:20:00Z',
    updated_at: '2026-10-13T15:10:00Z',
  },
];

class MemoryDatabase {
  private users: (User & { passwordHash: string })[] = [];
  private cases: MedicalCase[] = [];
  private tokens: Map<string, number> = new Map(); // token -> userId
  private nextCaseId: number = 26;

  constructor() {
    this.reset();
  }

  public reset() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
    this.tokens.clear();
    this.nextCaseId = 26;

    // Pre-seed known test tokens for Sanctum emulation
    this.tokens.set('sanctum_admin_token_2026', 1);
    this.tokens.set('sanctum_viewer_token_2026', 2);
    this.tokens.set('sanctum_engineer_token_2026', 3);
  }

  public findUserByEmail(email: string) {
    return this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  }

  public findUserById(id: number): User | undefined {
    const user = this.users.find((u) => u.id === id);
    if (!user) return undefined;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  public createTokenForUser(userId: number): string {
    const randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const token = `${userId}|sanc_${randomHex}`;
    this.tokens.set(token, userId);
    return token;
  }

  public revokeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  public getUserByToken(token: string): User | undefined {
    const userId = this.tokens.get(token);
    if (!userId) return undefined;
    return this.findUserById(userId);
  }

  public getAllCases(): MedicalCase[] {
    return this.cases.map((c) => this.attachCreator(c));
  }

  public getCaseById(id: number): MedicalCase | undefined {
    const c = this.cases.find((item) => item.id === id);
    if (!c) return undefined;
    return this.attachCreator(c);
  }

  public getCaseByNumber(caseNumber: string): MedicalCase | undefined {
    return this.cases.find(
      (item) => item.case_number.trim().toUpperCase() === caseNumber.trim().toUpperCase()
    );
  }

  public createCase(data: Omit<MedicalCase, 'id' | 'created_at' | 'updated_at'>): MedicalCase {
    const now = new Date().toISOString();
    const newCase: MedicalCase = {
      ...data,
      id: this.nextCaseId++,
      created_at: now,
      updated_at: now,
    };
    this.cases.unshift(newCase);
    return this.attachCreator(newCase);
  }

  public updateCase(
    id: number,
    data: Partial<Omit<MedicalCase, 'id' | 'created_at' | 'created_by'>>
  ): MedicalCase | undefined {
    const index = this.cases.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    const existing = this.cases[index];
    const updated: MedicalCase = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString(),
    };
    this.cases[index] = updated;
    return this.attachCreator(updated);
  }

  public deleteCase(id: number): boolean {
    const index = this.cases.findIndex((c) => c.id === id);
    if (index === -1) return false;
    this.cases.splice(index, 1);
    return true;
  }

  public getCounts() {
    return {
      total: this.cases.length,
      draft: this.cases.filter((c) => c.status === 'Draft').length,
      planning: this.cases.filter((c) => c.status === 'Planning').length,
      in_review: this.cases.filter((c) => c.status === 'In Review').length,
      approved: this.cases.filter((c) => c.status === 'Approved').length,
      completed: this.cases.filter((c) => c.status === 'Completed').length,
      cancelled: this.cases.filter((c) => c.status === 'Cancelled').length,
    };
  }

  private attachCreator(item: MedicalCase): MedicalCase {
    const creator = this.findUserById(item.created_by);
    return {
      ...item,
      creator: creator
        ? {
            id: creator.id,
            name: creator.name,
            email: creator.email,
            role: creator.role,
          }
        : undefined,
    };
  }
}

export const db = new MemoryDatabase();
