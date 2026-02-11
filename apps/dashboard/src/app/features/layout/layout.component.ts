import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors">
      <header class="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur">
        <div class="max-w-6xl mx-auto px-3 sm:px-4 flex items-center justify-between h-14 gap-2">
          <a routerLink="/tasks" class="font-semibold text-base sm:text-lg text-slate-800 dark:text-white truncate">Task Manager</a>
          <div class="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              (click)="theme.toggle()"
              class="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              @if (theme.isDark()) {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } @else {
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              }
            </button>
            @if (auth.user(); as user) {
              <span class="hidden sm:inline text-sm text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{{ user.email }}</span>
              <span class="text-xs sm:text-sm text-slate-400 dark:text-slate-500">({{ user.role }})</span>
              <button
                (click)="auth.logout()"
                class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Log out
              </button>
            }
          </div>
        </div>
      </header>
      <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  constructor(public auth: AuthService, public theme: ThemeService) {}
}
