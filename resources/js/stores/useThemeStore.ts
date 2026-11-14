'use client';

import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'tumbler-theme';

const THEME_COLORS: Record<ResolvedTheme, string> = {
  light: '#FBF3E8',
  dark: '#1E1611',
};

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Default is Light, not the OS preference: an empty storage key (or a storage
 * error) always resolves to `light`, regardless of the operating system.
 */
export function readStoredTheme(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : 'light';
  } catch {
    return 'light';
  }
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }

  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Single place that mirrors the resolved theme onto <html>: the data-theme
 * attribute drives both the CSS variables and Tailwind's `dark:` variant.
 */
export function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;

  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }

  meta.content = THEME_COLORS[resolved];
}

export function persistTheme(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Private mode / blocked storage: keep the in-memory choice only.
  }
}

interface ThemeState {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  syncFromStorage: () => void;
  followSystem: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'light',
  resolved: 'light',
  setPreference: (preference) => {
    const resolved = resolveTheme(preference);
    persistTheme(preference);
    applyTheme(resolved);
    set({ preference, resolved });
  },
  syncFromStorage: () => {
    const preference = readStoredTheme();
    const resolved = resolveTheme(preference);
    applyTheme(resolved);
    set({ preference, resolved });
  },
  followSystem: () => {
    if (get().preference !== 'system') {
      return;
    }

    const resolved = resolveTheme('system');
    applyTheme(resolved);
    set({ resolved });
  },
}));

/**
 * Runs once at boot (after the inline pre-paint script). The script has already
 * set the attribute; this hydrates the Zustand state from the same source so
 * React components agree with the document.
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') {
    return;
  }

  useThemeStore.getState().syncFromStorage();
}

/**
 * Live bindings: OS changes only affect an explicit "System" preference, and
 * storage changes from another tab re-read the stored value.
 */
export function watchTheme(onChange?: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let media: MediaQueryList | null = null;

  try {
    media = window.matchMedia('(prefers-color-scheme: dark)');
  } catch {
    media = null;
  }

  const handleMedia = () => {
    useThemeStore.getState().followSystem();
    onChange?.();
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
      return;
    }

    useThemeStore.getState().syncFromStorage();
    onChange?.();
  };

  media?.addEventListener('change', handleMedia);
  window.addEventListener('storage', handleStorage);

  return () => {
    media?.removeEventListener('change', handleMedia);
    window.removeEventListener('storage', handleStorage);
  };
}
