const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: 'Request failed',
      }));
      throw new Error(error.error || `HTTP error ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Auth
  async signup(data: { email: string; password: string; name: string }) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Training Plans
  async createTrainingPlan(data: {
    goal: string;
    startDate: string;
    raceDate: string;
  }) {
    return this.request('/api/training/plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getActiveTrainingPlan() {
    return this.request('/api/training/plan/active');
  }

  async getWeeklyWorkouts(week: number) {
    return this.request(`/api/training/plan/week/${week}`);
  }

  // Workouts
  async logWorkout(data: any) {
    return this.request('/api/workouts/log', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWorkoutLogs(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return this.request(`/api/workouts/logs${query ? `?${query}` : ''}`);
  }

  async updateWorkoutLog(id: string, data: any) {
    return this.request(`/api/workouts/log/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWorkoutLog(id: string) {
    return this.request(`/api/workouts/log/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Adjustments
  async adjustWeeklyPlan(weekNumber?: number) {
    return this.request('/api/ai/adjust', {
      method: 'POST',
      body: JSON.stringify({ weekNumber }),
    });
  }

  async getAdjustmentHistory() {
    return this.request('/api/ai/history');
  }
}

export const apiClient = new ApiClient(API_URL);
