import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';
import {
  DEFAULT_PARTICIPANTS_16,
  ORGANIZER_DEFAULT_EMAIL,
  TARGET_PARTICIPANTS_COUNT,
  getSlotKey,
  isDayAllowed,
  getShiftsForDay,
  getEligibleNovemberDays,
} from './constants';
import { AppState, Participant, EmailLogEntry, AppSettings } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const REDIS_KEY = 'agendador_novembro_state';

// Helper to sanitize state
function sanitizeState(data: any): AppState {
  if (!data || typeof data !== 'object') {
    return getInitialSeedState();
  }
  if (!data.settings) {
    data.settings = {};
  }
  if (!data.settings.organizerEmail) {
    data.settings.organizerEmail = ORGANIZER_DEFAULT_EMAIL;
  }
  if (!data.settings.targetCount) {
    data.settings.targetCount = TARGET_PARTICIPANTS_COUNT;
  }
  if (!data.settings.expectedParticipants || data.settings.expectedParticipants.length === 0) {
    data.settings.expectedParticipants = [...DEFAULT_PARTICIPANTS_16];
  }
  if (!data.participants) {
    data.participants = {};
  }
  if (!data.settings.emailLogs) {
    data.settings.emailLogs = [];
  }
  return data as AppState;
}

// In-memory cache to prevent repeated fetches within same lambda lifecycle
let inMemoryState: AppState | null = null;

// Ensure directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem in serverless environments (Vercel)
  }
}

// Generate realistic seed data for demonstration
export function getInitialSeedState(): AppState {
  return {
    settings: {
      eventName: 'Encontro de Novembro da Galera',
      organizerEmail: ORGANIZER_DEFAULT_EMAIL,
      targetCount: TARGET_PARTICIPANTS_COUNT,
      expectedParticipants: [...DEFAULT_PARTICIPANTS_16],
      emailLogs: [],
      notifiedAllCompleted: false,
      notifiedFullConvergenceSlots: [],
    },
    participants: {},
    lastUpdated: new Date().toISOString(),
  };
}

// Helper to get Upstash Redis client
function getRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (e) {
      console.warn('Failed to initialize Redis client', e);
    }
  }
  return null;
}

export async function readAppStateAsync(): Promise<AppState> {
  const redis = getRedisClient();

  // 1. Try Upstash / Vercel KV if available
  if (redis) {
    try {
      const data = await redis.get<any>(REDIS_KEY);
      if (data) {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        const sanitized = sanitizeState(parsed);
        inMemoryState = sanitized;
        return sanitized;
      }
    } catch (err) {
      console.warn('Redis read failed, falling back to local/memory:', err);
    }
  }

  // 2. Try in-memory state
  if (inMemoryState) {
    return inMemoryState;
  }

  // 3. Fallback to local filesystem
  return readAppState();
}

export async function saveAppStateAsync(state: AppState): Promise<void> {
  state.lastUpdated = new Date().toISOString();
  inMemoryState = state;
  const redis = getRedisClient();

  // 1. Save to Upstash / Vercel KV if available
  if (redis) {
    try {
      await redis.set(REDIS_KEY, state);
    } catch (err) {
      console.warn('Redis save failed:', err);
    }
  }

  // 2. Also try saving locally
  try {
    saveAppState(state);
  } catch {
    // Read-only filesystem in Vercel is expected when KV is used
  }
}

export function readAppState(): AppState {
  ensureDataDir();
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content) as AppState;
      const sanitized = sanitizeState(data);
      inMemoryState = sanitized;
      return sanitized;
    }
  } catch (error) {
    console.error('Error reading store.json, using seed state:', error);
  }

  // Create initial state
  const seed = getInitialSeedState();
  try {
    saveAppState(seed);
  } catch {
    // Ignore in read-only environments
  }
  inMemoryState = seed;
  return seed;
}

export function saveAppState(state: AppState): void {
  ensureDataDir();
  inMemoryState = state;
  try {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    state.lastUpdated = new Date().toISOString();
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch {
    // On Vercel, filesystem is read-only
  }
}

export async function updateParticipantAvailabilityAsync(
  name: string,
  availability: Record<string, 'none' | 'can' | 'if_needed'>
): Promise<{ state: AppState; participant: Participant }> {
  const state = await readAppStateAsync();
  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();

  let foundId = Object.keys(state.participants).find(
    (id) => state.participants[id].name.trim().toLowerCase() === lowerName
  );

  if (!foundId) {
    foundId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const cleanedAvailability: Record<string, 'can' | 'if_needed'> = {};
  Object.entries(availability).forEach(([key, val]) => {
    if (val === 'can' || val === 'if_needed') {
      cleanedAvailability[key] = val;
    }
  });

  const participant: Participant = {
    id: foundId,
    name: trimmedName,
    hasResponded: true,
    updatedAt: new Date().toISOString(),
    availability: cleanedAvailability,
  };

  state.participants[foundId] = participant;

  const existsInExpected = state.settings.expectedParticipants.some(
    (n) => n.trim().toLowerCase() === lowerName
  );
  if (!existsInExpected) {
    state.settings.expectedParticipants.push(trimmedName);
  }

  await saveAppStateAsync(state);
  return { state, participant };
}

export async function updateSettingsAsync(settings: Partial<AppSettings>): Promise<AppState> {
  const state = await readAppStateAsync();
  state.settings = {
    ...state.settings,
    ...settings,
  };
  await saveAppStateAsync(state);
  return state;
}

export async function logEmailSentAsync(log: Omit<EmailLogEntry, 'id' | 'timestamp'>): Promise<EmailLogEntry> {
  const state = await readAppStateAsync();
  const newEntry: EmailLogEntry = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  if (!state.settings.emailLogs) {
    state.settings.emailLogs = [];
  }
  state.settings.emailLogs.unshift(newEntry);
  if (state.settings.emailLogs.length > 50) {
    state.settings.emailLogs = state.settings.emailLogs.slice(0, 50);
  }

  await saveAppStateAsync(state);
  return newEntry;
}

export async function resetStateAsync(mode: 'seed' | 'empty' | 'perfect_simulation'): Promise<AppState> {
  if (mode === 'empty') {
    const emptyState: AppState = {
      settings: {
        eventName: 'Encontro de Novembro',
        organizerEmail: ORGANIZER_DEFAULT_EMAIL,
        targetCount: TARGET_PARTICIPANTS_COUNT,
        expectedParticipants: [...DEFAULT_PARTICIPANTS_16],
        emailLogs: [],
      },
      participants: {},
      lastUpdated: new Date().toISOString(),
    };
    await saveAppStateAsync(emptyState);
    return emptyState;
  }

  if (mode === 'perfect_simulation') {
    const state = getInitialSeedState();
    DEFAULT_PARTICIPANTS_16.forEach((name, i) => {
      const id = `user_${i + 1}`;
      const avail = state.participants[id]?.availability || {};
      avail[getSlotKey(14, 'night')] = 'can';
      avail[getSlotKey(21, 'night')] = 'can';
      state.participants[id] = {
        id,
        name,
        hasResponded: true,
        updatedAt: new Date().toISOString(),
        availability: avail,
      };
    });
    await saveAppStateAsync(state);
    return state;
  }

  const seed = getInitialSeedState();
  await saveAppStateAsync(seed);
  return seed;
}

// Backward-compatible sync exports
export function updateParticipantAvailability(
  name: string,
  availability: Record<string, 'none' | 'can' | 'if_needed'>
) {
  const state = readAppState();
  const trimmedName = name.trim();
  const lowerName = trimmedName.toLowerCase();
  let foundId = Object.keys(state.participants).find(
    (id) => state.participants[id].name.trim().toLowerCase() === lowerName
  );
  if (!foundId) {
    foundId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  const cleanedAvailability: Record<string, 'can' | 'if_needed'> = {};
  Object.entries(availability).forEach(([key, val]) => {
    if (val === 'can' || val === 'if_needed') {
      cleanedAvailability[key] = val;
    }
  });
  const participant: Participant = {
    id: foundId,
    name: trimmedName,
    hasResponded: true,
    updatedAt: new Date().toISOString(),
    availability: cleanedAvailability,
  };
  state.participants[foundId] = participant;
  saveAppState(state);
  return { state, participant };
}

export function updateSettings(settings: Partial<AppSettings>): AppState {
  const state = readAppState();
  state.settings = { ...state.settings, ...settings };
  saveAppState(state);
  return state;
}

export function logEmailSent(log: Omit<EmailLogEntry, 'id' | 'timestamp'>): EmailLogEntry {
  const state = readAppState();
  const newEntry: EmailLogEntry = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  if (!state.settings.emailLogs) state.settings.emailLogs = [];
  state.settings.emailLogs.unshift(newEntry);
  saveAppState(state);
  return newEntry;
}

export function resetState(mode: 'seed' | 'empty' | 'perfect_simulation'): AppState {
  return resetStateAsync(mode) as any;
}
