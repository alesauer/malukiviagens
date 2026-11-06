import {
  User,
  FamilyGroup,
  Trip,
  Destination,
  Attraction,
  Activity,
  Reservation,
  DocumentItem,
  Expense,
  FinancialSummary,
  ChecklistItem,
  LuggageItem,
  EmergencyContact,
  NotificationItem
} from '../types';
import { offlineStorage } from './offline';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3025/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('tm_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('tm_token', token);
    } else {
      localStorage.removeItem('tm_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        this.setToken(null);
        window.dispatchEvent(new Event('auth-unauthorized'));
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Erro na requisição' }));
        throw new Error(err.detail || `Erro HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (!navigator.onLine) {
        // Attempt reading cached read operations
        if (!options.method || options.method === 'GET') {
          const cached = offlineStorage.getCachedData<T>(endpoint);
          if (cached) return cached;
        }
      }
      throw error;
    }
  }

  // ---------------- Auth ----------------
  async login(email: string, password: string):Promise<{ access_token: string; user: User }> {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Falha no login' }));
      throw new Error(err.detail || 'E-mail ou senha inválidos');
    }

    const data = await res.json();
    this.setToken(data.access_token);
    offlineStorage.cacheData('user_profile', data.user);
    return data;
  }

  async register(name: string, email: string, password: string, phone?: string): Promise<{ access_token: string; user: User }> {
    const data = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone })
    });
    this.setToken(data.access_token);
    offlineStorage.cacheData('user_profile', data.user);
    return data;
  }

  async getMe(): Promise<User> {
    const user = await this.request<User>('/auth/me');
    offlineStorage.cacheData('user_profile', user);
    return user;
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('tm_user_profile');
    window.location.reload();
  }

  // ---------------- Families ----------------
  async getCurrentFamily(): Promise<FamilyGroup> {
    const fam = await this.request<FamilyGroup>('/families/current');
    offlineStorage.cacheData('current_family', fam);
    return fam;
  }

  async inviteFamilyMember(email: string) {
    return await this.request('/families/invites', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // ---------------- Trips ----------------
  async getTrips(category?: string, status?: string): Promise<Trip[]> {
    let url = '/trips/';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (status) params.append('trip_status', status);
    if (params.toString()) url += `?${params.toString()}`;

    const trips = await this.request<Trip[]>(url);
    offlineStorage.cacheData('trips', trips);
    return trips;
  }

  async getTrip(id: number): Promise<Trip> {
    const trip = await this.request<Trip>(`/trips/${id}`);
    offlineStorage.cacheData(`trip_${id}`, trip);
    return trip;
  }

  async createTrip(tripData: Partial<Trip>): Promise<Trip> {
    return await this.request<Trip>('/trips/', {
      method: 'POST',
      body: JSON.stringify(tripData)
    });
  }

  async updateTrip(id: number, tripData: Partial<Trip>): Promise<Trip> {
    return await this.request<Trip>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tripData)
    });
  }

  async finishTrip(id: number, general_rating?: number, review_comments?: string): Promise<Trip> {
    let url = `/trips/${id}/finish`;
    const params = new URLSearchParams();
    if (general_rating) params.append('general_rating', general_rating.toString());
    if (review_comments) params.append('review_comments', review_comments);
    if (params.toString()) url += `?${params.toString()}`;

    return await this.request<Trip>(url, { method: 'POST' });
  }

  async deleteTrip(id: number) {
    return await this.request(`/trips/${id}`, { method: 'DELETE' });
  }

  // ---------------- Destinations & Catalog ----------------
  async getDestinations(tripId?: number): Promise<Destination[]> {
    const url = tripId ? `/destinations/?trip_id=${tripId}` : '/destinations/';
    return await this.request<Destination[]>(url);
  }

  async getCatalogDestinations(): Promise<Destination[]> {
    return await this.request<Destination[]>('/destinations/catalog');
  }

  async createDestination(dest: Partial<Destination>): Promise<Destination> {
    return await this.request<Destination>('/destinations/', {
      method: 'POST',
      body: JSON.stringify(dest)
    });
  }

  async updateDestination(id: number, dest: Partial<Destination>): Promise<Destination> {
    return await this.request<Destination>(`/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dest)
    });
  }

  async deleteDestination(id: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/destinations/${id}`, {
      method: 'DELETE'
    });
  }

  // ---------------- Attractions & Reviews ----------------
  async getAttractions(destinationId?: number, category?: string, isFavorite?: boolean): Promise<Attraction[]> {
    const params = new URLSearchParams();
    if (destinationId) params.append('destination_id', destinationId.toString());
    if (category) params.append('category', category);
    if (isFavorite !== undefined) params.append('is_favorite', isFavorite.toString());
    const url = `/attractions/?${params.toString()}`;
    return await this.request<Attraction[]>(url);
  }

  async createAttraction(data: Partial<Attraction>): Promise<Attraction> {
    return await this.request<Attraction>('/attractions/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async addReview(attractionId: number, rating: number, comment?: string) {
    return await this.request(`/attractions/${attractionId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    });
  }

  // ---------------- Activities & Itinerary ----------------
  async getActivities(tripId: number, unscheduledOnly?: boolean): Promise<Activity[]> {
    let url = `/activities/trip/${tripId}`;
    if (unscheduledOnly) url += '?unscheduled_only=true';
    const activities = await this.request<Activity[]>(url);
    offlineStorage.cacheData(`activities_${tripId}`, activities);
    return activities;
  }

  async createActivity(activity: Partial<Activity>): Promise<Activity> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'activity',
        action: 'create',
        payload: activity
      });
      return {
        id: Date.now(),
        trip_id: activity.trip_id!,
        title: activity.title || '',
        category: activity.category || 'passeio',
        estimated_cost: activity.estimated_cost || 0,
        is_completed: false,
        order_index: 0
      } as Activity;
    }
    return await this.request<Activity>('/activities/', {
      method: 'POST',
      body: JSON.stringify(activity)
    });
  }

  async updateActivity(id: number, data: Partial<Activity>): Promise<Activity> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'activity',
        action: 'update',
        payload: { id, ...data }
      });
      return { id, ...data } as Activity;
    }
    return await this.request<Activity>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteActivity(id: number): Promise<{ message: string }> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'activity',
        action: 'delete',
        payload: { id }
      });
      return { message: 'Excluído localmente (offline).' };
    }
    return await this.request<{ message: string }>(`/activities/${id}`, {
      method: 'DELETE'
    });
  }

  // ---------------- Reservations ----------------
  async getReservations(tripId: number, resType?: string): Promise<Reservation[]> {
    let url = `/reservations/trip/${tripId}`;
    if (resType) url += `?res_type=${resType}`;
    return await this.request<Reservation[]>(url);
  }

  async createReservation(res: Partial<Reservation>, autoCreateExpense = true): Promise<Reservation> {
    return await this.request<Reservation>(`/reservations/?auto_create_expense=${autoCreateExpense}`, {
      method: 'POST',
      body: JSON.stringify(res)
    });
  }

  async updateReservation(id: number, res: Partial<Reservation>): Promise<Reservation> {
    return await this.request<Reservation>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(res)
    });
  }

  async deleteReservation(id: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/reservations/${id}`, {
      method: 'DELETE'
    });
  }

  // ---------------- Finances ----------------
  async getExpenses(tripId: number): Promise<Expense[]> {
    const expenses = await this.request<Expense[]>(`/finances/trip/${tripId}/expenses`);
    offlineStorage.cacheData(`expenses_${tripId}`, expenses);
    return expenses;
  }

  async createExpense(expense: Partial<Expense>): Promise<Expense> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'expense',
        action: 'create',
        payload: expense
      });
      return {
        id: Date.now(),
        trip_id: expense.trip_id!,
        title: expense.title || '',
        category: expense.category || 'outras',
        amount: expense.amount || 0,
        date: expense.date || new Date().toISOString().split('T')[0],
        payment_status: expense.payment_status || 'pago'
      } as Expense;
    }
    return await this.request<Expense>('/finances/expenses', {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  }

  async updateExpense(id: number, data: Partial<Expense>): Promise<Expense> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'expense',
        action: 'update',
        payload: { id, ...data }
      });
      return { id, ...data } as Expense;
    }
    return await this.request<Expense>(`/finances/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteExpense(id: number): Promise<{ message: string }> {
    if (!navigator.onLine) {
      offlineStorage.enqueue({
        entity_type: 'expense',
        action: 'delete',
        payload: { id }
      });
      return { message: 'Excluído localmente (offline).' };
    }
    return await this.request<{ message: string }>(`/finances/expenses/${id}`, {
      method: 'DELETE'
    });
  }

  async getFinancialSummary(tripId: number): Promise<FinancialSummary> {
    return await this.request<FinancialSummary>(`/finances/trip/${tripId}/summary`);
  }

  // ---------------- Documents ----------------
  async getFamilyDocuments(familyId: number): Promise<DocumentItem[]> {
    return await this.request<DocumentItem[]>(`/documents/family/${familyId}`);
  }

  async getTripDocuments(tripId: number): Promise<DocumentItem[]> {
    return await this.request<DocumentItem[]>(`/documents/trip/${tripId}`);
  }

  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    return await this.request<DocumentItem>('/documents/upload', {
      method: 'POST',
      body: formData
    });
  }

  getDocumentDownloadUrl(docId: number): string {
    return `${API_BASE_URL}/documents/${docId}/download`;
  }

  // ---------------- Checklists & Luggage ----------------
  async getChecklists(tripId: number): Promise<ChecklistItem[]> {
    return await this.request<ChecklistItem[]>(`/checklists/trip/${tripId}`);
  }

  async createChecklistItem(item: Partial<ChecklistItem>): Promise<ChecklistItem> {
    return await this.request<ChecklistItem>('/checklists/', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateChecklistItem(id: number, data: Partial<ChecklistItem>): Promise<ChecklistItem> {
    return await this.request<ChecklistItem>(`/checklists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteChecklistItem(id: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/checklists/${id}`, {
      method: 'DELETE'
    });
  }

  async getLuggageItems(tripId: number, userId?: number): Promise<LuggageItem[]> {
    let url = `/checklists/luggage/${tripId}`;
    if (userId) url += `?user_id=${userId}`;
    return await this.request<LuggageItem[]>(url);
  }

  async createLuggageItem(item: Partial<LuggageItem>): Promise<LuggageItem> {
    return await this.request<LuggageItem>('/checklists/luggage', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateLuggageItem(id: number, data: Partial<LuggageItem>): Promise<LuggageItem> {
    return await this.request<LuggageItem>(`/checklists/luggage/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteLuggageItem(id: number): Promise<{ message: string }> {
    return await this.request<{ message: string }>(`/checklists/luggage/${id}`, {
      method: 'DELETE'
    });
  }

  // ---------------- Emergency Contacts ----------------
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return await this.request<EmergencyContact[]>('/emergency/');
  }

  async createEmergencyContact(contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    return await this.request<EmergencyContact>('/emergency/', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
  }

  // ---------------- AI Assistant ----------------
  async chatAI(prompt: string, tripId?: number): Promise<{ reply: string; sources?: string[]; suggested_actions?: any[] }> {
    return await this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, trip_id: tripId })
    });
  }

  async parseDocumentAI(formData: FormData) {
    return await this.request('/ai/parse-document', {
      method: 'POST',
      body: formData
    });
  }

  // ---------------- Integrations ----------------
  async getWeather(city: string) {
    return await this.request(`/integrations/weather?city=${encodeURIComponent(city)}`);
  }

  getCalendarIcsUrl(tripId: number) {
    return `${API_BASE_URL}/integrations/calendar/export-ics/${tripId}`;
  }

  // ---------------- Reports & Backups ----------------
  getPdfReportUrl(tripId: number) {
    return `${API_BASE_URL}/reports/trip/${tripId}/pdf`;
  }

  getExcelReportUrl(tripId: number) {
    return `${API_BASE_URL}/reports/trip/${tripId}/excel`;
  }

  getJsonExportUrl(tripId: number) {
    return `${API_BASE_URL}/reports/trip/${tripId}/json`;
  }

  async createBackup(): Promise<{ message: string; detail: string }> {
    return await this.request('/backup/create', { method: 'POST' });
  }

  async listBackups(): Promise<string[]> {
    return await this.request<string[]>('/backup/list');
  }

  getBackupDownloadUrl(filename: string): string {
    return `${API_BASE_URL}/backup/download/${encodeURIComponent(filename)}`;
  }

  // ---------------- Offline Sync ----------------
  async syncBatch() {
    const queue = offlineStorage.getQueue();
    if (queue.length === 0) return { processed_count: 0, conflicts: [] };

    const res = await this.request<{ processed_count: number; conflicts: any[] }>('/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ operations: queue })
    });

    offlineStorage.clearQueue();
    return res;
  }
}

export const api = new ApiClient();

