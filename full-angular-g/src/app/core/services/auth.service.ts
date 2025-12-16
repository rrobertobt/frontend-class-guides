import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../api.config';
import { User } from '../models';
import { firstValueFrom } from 'rxjs';

type AuthResponse = { user: User };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'auth_user';

  private _user = signal<User | null>(this.loadUserFromStorage());
  user = computed(() => this._user());

  isLoggedIn = computed(() => !!this._user());

  constructor(private http: HttpClient) {}

  private loadUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private saveUser(user: User | null) {
    this._user.set(user);
    if (user) localStorage.setItem(this.storageKey, JSON.stringify(user));
    else localStorage.removeItem(this.storageKey);
  }

  async login(email: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      )
    );
    this.saveUser(res.user);
    return res.user;
  }

  async logout(): Promise<void> {
    await firstValueFrom(
      this.http.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true })
    );
    this.saveUser(null);
  }

  // Al recargar la página. re-validemos la sesión con backend
  async refreshMe(): Promise<User> {
    const res = await firstValueFrom(
      this.http.get<AuthResponse>(`${API_BASE_URL}/me`, { withCredentials: true })
    );
    this.saveUser(res.user);
    return res.user;
  }

  async register(email: string, name: string, password: string): Promise<User> {
    const res = await firstValueFrom(
      this.http.post<{ user: User }>(`${API_BASE_URL}/auth/register`, { email, name, password }, { withCredentials: true })
    );
    this.saveUser(res.user);
    return res.user;
  }

  clearLocalUser() {
    this.saveUser(null);
  }
}
