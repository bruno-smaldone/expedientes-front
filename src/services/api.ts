import config from '../config/environment';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  TrackExpedienteRequest,
  TrackExpedienteResponse,
  ExpedientesListResponse,
  ExpedienteDetailResponse,
  DashboardSummaryResponse,
} from '../types/api';

class ApiService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.apiKey = config.apiKey;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders(),
        ...options,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken();
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Token management
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async validateToken(): Promise<ApiResponse<{ user: User }>> {
    return this.makeRequest<{ user: User }>('/api/auth/validate');
  }

  logout(): void {
    this.clearToken();
  }

  // User endpoints
  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.makeRequest<User[]>('/api/users');
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    isAdmin?: boolean;
  }): Promise<ApiResponse<{ userId: string }>> {
    return this.makeRequest<{ userId: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUser(userId: string): Promise<ApiResponse<User>> {
    return this.makeRequest<User>(`/api/users/${userId}`);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Expedientes endpoints
  async trackExpediente(request: TrackExpedienteRequest): Promise<ApiResponse<TrackExpedienteResponse>> {
    return this.makeRequest<TrackExpedienteResponse>('/api/expedientes/track', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getExpedientes(): Promise<ApiResponse<ExpedientesListResponse>> {
    return this.makeRequest<ExpedientesListResponse>('/api/expedientes');
  }

  async getDashboardSummary(): Promise<ApiResponse<DashboardSummaryResponse>> {
    return this.makeRequest<DashboardSummaryResponse>('/api/dashboard/summary');
  }

  async getExpediente(
    iue: string,
    options: {
      includeMovements?: boolean;
      since?: string;
    } = {}
  ): Promise<ApiResponse<ExpedienteDetailResponse>> {
    const encodedIue = encodeURIComponent(iue);
    const queryParams = new URLSearchParams();
    
    if (options.includeMovements !== undefined) {
      queryParams.set('includeMovements', options.includeMovements.toString());
    }
    if (options.since) {
      queryParams.set('since', options.since);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/expedientes/${encodedIue}${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<ExpedienteDetailResponse>(endpoint);
  }

  async refreshExpedientes(request: {
    expedienteIds: string[];
    forceRefresh?: boolean;
  }): Promise<ApiResponse<{
    processedCount: number;
    updatedCount: number;
    errorCount: number;
    newMovementsCount: number;
    newDecretosCount: number;
    errors: string[];
  }>> {
    return this.makeRequest('/api/expedientes/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const apiService = new ApiService();
export default apiService;