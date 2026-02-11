import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 transition-colors relative">
      <button
        (click)="theme.toggle()"
        class="absolute top-4 right-4 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        @if (theme.isDark()) {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        } @else {
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        }
      </button>
      <div class="w-full max-w-sm">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-6">Task Manager</h1>
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            @if (error) {
              <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
            }
            <button
              type="submit"
              [disabled]="loading"
              class="w-full rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed px-4 py-2 font-medium text-white transition"
            >
              {{ loading ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Demo: owner&#64;acme.com / admin&#64;acme.com / viewer.eng&#64;acme.com — password: password123
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    public theme: ThemeService
  ) {}

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/tasks']);
    }
  }

  onSubmit() {
    this.error = '';
    this.loading = true;
    this.auth
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: () => this.router.navigate(['/tasks']),
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message ?? 'Invalid email or password';
        },
        complete: () => (this.loading = false),
      });
  }
}
