import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import type { AuthResponse, LoginRequest } from '../../models/auth.model';

const API = '/api';
const TOKEN_KEY = 'access_token';
const USER_KEY = 'user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<AuthResponse['user'] | null>(this.getStoredUser());

  token = this.tokenSignal.asReadonly();
  user = this.userSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${API}/auth/login`, credentials).pipe(
      tap((res) => {
        this.tokenSignal.set(res.access_token);
        this.userSignal.set(res.user);
        localStorage.setItem(TOKEN_KEY, res.access_token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
      })
    );
  }

  logout() {
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthResponse['user'] | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  canEditTasks(): boolean {
    const u = this.userSignal();
    return u ? ['owner', 'admin'].includes(u.role) : false;
  }
}
