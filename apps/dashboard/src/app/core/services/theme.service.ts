import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeSignal = signal<Theme>(this.getStoredTheme());

  theme = this.themeSignal.asReadonly();
  isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    this.applyTheme(this.themeSignal());
  }

  private getStoredTheme(): Theme {
    if (typeof localStorage === 'undefined') return 'dark';
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  private applyTheme(theme: Theme) {
    const doc = typeof document !== 'undefined' ? document.documentElement : null;
    if (doc) {
      doc.classList.remove('light', 'dark');
      doc.classList.add(theme);
    }
  }

  setTheme(theme: Theme) {
    this.themeSignal.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  toggle() {
    const next = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }
}
