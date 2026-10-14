export type UserRole = 'admin' | 'viewer' | 'engineer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type CaseStatus =
  | 'Draft'
  | 'Planning'
  | 'In Review'
  | 'Approved'
  | 'Completed'
  | 'Cancelled';

export type CasePriority = 'Low' | 'Medium' | 'High';

export interface MedicalCase {
  id: number;
  case_number: string;
  patient_reference: string;
  surgeon_name: string;
  implant_type: string;
  status: CaseStatus;
  priority: CasePriority;
  surgery_date: string | null;
  created_by: number;
  creator?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  created_at: string;
  updated_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface CasesListResponse {
  cases: MedicalCase[];
  pagination: PaginationMeta;
  counts: {
    total: number;
    draft: number;
    planning: number;
    in_review: number;
    approved: number;
    completed: number;
    cancelled: number;
  };
}

export interface TestResult {
  id: string;
  title: string;
  requirement: string;
  passed: boolean;
  expectedStatus: number;
  actualStatus: number;
  method: string;
  endpoint: string;
  roleUsed: string;
  details: string;
  requestBody?: any;
  responseBody?: any;
  durationMs: number;
}

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
}
