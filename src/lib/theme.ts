export const themePreferences = ['system', 'light', 'dark'] as const;

export type ThemePreference = (typeof themePreferences)[number];

export const themeStorageKey = 'learn-with-me-theme';

export const isThemePreference = (value: unknown): value is ThemePreference =>
  typeof value === 'string' && themePreferences.some((preference) => preference === value);

export const normalizeThemePreference = (value: unknown): ThemePreference =>
  isThemePreference(value) ? value : 'system';

