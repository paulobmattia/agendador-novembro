'use client';

const USER_NAME_STORAGE_KEY = 'agendador_user_name';
const USER_NAME_COOKIE_KEY = 'agendador_user_name';

export function getStoredUserName(): string {
  if (typeof window === 'undefined') return '';

  // Try LocalStorage first
  try {
    const ls = localStorage.getItem(USER_NAME_STORAGE_KEY);
    if (ls && ls.trim()) return ls.trim();
  } catch (e) {
    console.warn('LocalStorage not available', e);
  }

  // Fallback to cookie
  try {
    const match = document.cookie.match(new RegExp(`(^| )${USER_NAME_COOKIE_KEY}=([^;]+)`));
    if (match && match[2]) {
      return decodeURIComponent(match[2]).trim();
    }
  } catch (e) {
    console.warn('Cookie reading failed', e);
  }

  return '';
}

export function saveStoredUserName(name: string): void {
  if (typeof window === 'undefined') return;
  const clean = name.trim();

  // Save to LocalStorage
  try {
    if (clean) {
      localStorage.setItem(USER_NAME_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(USER_NAME_STORAGE_KEY);
    }
  } catch (e) {
    console.warn('LocalStorage save failed', e);
  }

  // Save to Cookie (valid for 365 days)
  try {
    const maxAge = clean ? 60 * 60 * 24 * 365 : 0;
    document.cookie = `${USER_NAME_COOKIE_KEY}=${encodeURIComponent(clean)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (e) {
    console.warn('Cookie save failed', e);
  }
}

const AVAILABILITY_STORAGE_PREFIX = 'agendador_availability_';

export function getStoredAvailability(name: string): Record<string, 'none' | 'can' | 'if_needed'> | null {
  if (typeof window === 'undefined' || !name) return null;
  try {
    const raw = localStorage.getItem(`${AVAILABILITY_STORAGE_PREFIX}${name.trim().toLowerCase()}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage availability read failed', e);
  }
  return null;
}

export function saveStoredAvailability(name: string, availability: Record<string, any>): void {
  if (typeof window === 'undefined' || !name) return;
  try {
    localStorage.setItem(
      `${AVAILABILITY_STORAGE_PREFIX}${name.trim().toLowerCase()}`,
      JSON.stringify(availability)
    );
  } catch (e) {
    console.warn('LocalStorage availability save failed', e);
  }
}

// Tactile feedback (Vibration API)
export function triggerHaptic(type: 'light' | 'medium' | 'success' | 'warn' = 'light'): void {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  try {
    if (type === 'light') {
      navigator.vibrate(15);
    } else if (type === 'medium') {
      navigator.vibrate(30);
    } else if (type === 'success') {
      navigator.vibrate([20, 40, 30]);
    } else if (type === 'warn') {
      navigator.vibrate([40, 30, 40]);
    }
  } catch {
    // Ignore unsupported
  }
}
