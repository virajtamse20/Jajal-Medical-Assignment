import { ApiResponse, CasesListResponse, MedicalCase, TestResult, User } from '../types/index.ts';

const TOKEN_KEY = 'jajal_medical_sanctum_token';
const USER_KEY = 'jajal_medical_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  let data: any = null;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { success: response.ok, message: text };
  }

  if (!response.ok && response.status === 401) {
    // Session expired or unauthorized
    authStorage.clear();
  }

  return {
    ...data,
    success: response.ok && data?.success !== false,
    _status: response.status,
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const res = await apiRequest<{ token: string; user: User }>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (res.success && res.data?.token) {
      authStorage.setToken(res.data.token);
      authStorage.setUser(res.data.user);
    }
    return res;
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
    } finally {
      authStorage.clear();
    }
    return { success: true, message: 'Logged out successfully' };
  },

  async getMe(): Promise<ApiResponse<User>> {
    return apiRequest<User>('/api/me');
  },

  // Cases CRUD
  async getCases(params: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    priority?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  } = {}): Promise<ApiResponse<CasesListResponse>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.per_page) query.set('per_page', String(params.per_page));
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.sort_by) query.set('sort_by', params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);

    return apiRequest<CasesListResponse>(`/api/cases?${query.toString()}`);
  },

  async getCase(id: number): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>(`/api/cases/${id}`);
  },

  async createCase(data: {
    case_number: string;
    patient_reference: string;
    surgeon_name: string;
    implant_type: string;
    status: string;
    priority: string;
    surgery_date: string | null;
  }): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>('/api/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCase(
    id: number,
    data: {
      case_number: string;
      patient_reference: string;
      surgeon_name: string;
      implant_type: string;
      status: string;
      priority: string;
      surgery_date: string | null;
    }
  ): Promise<ApiResponse<MedicalCase>> {
    return apiRequest<MedicalCase>(`/api/cases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCase(id: number): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/cases/${id}`, {
      method: 'DELETE',
    });
  },

  // Public Holiday check (Bonus)
  async checkHoliday(date: string, country: string = 'US'): Promise<ApiResponse<any>> {
    return apiRequest<any>(`/api/holidays?date=${encodeURIComponent(date)}&country=${encodeURIComponent(country)}`);
  },

  // Automated Tests
  async runTests(): Promise<ApiResponse<{
    allPassed: boolean;
    totalTests: number;
    passedCount: number;
    failedCount: number;
    results: TestResult[];
  }>> {
    return apiRequest('/api/tests/run');
  },

  // Reset DB
  async resetData(): Promise<ApiResponse<any>> {
    return apiRequest('/api/reset-data', { method: 'POST' });
  },
};
