export type ShiftId = 'morning' | 'afternoon' | 'night';

export type AvailabilityState = 'none' | 'can' | 'if_needed';

export interface ShiftDefinition {
  id: ShiftId;
  label: string;
  time: string;
  icon: string;
}

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  hasResponded: boolean;
  updatedAt: string;
  // Key format: "day_{number}_{shiftId}", e.g., "day_5_morning"
  availability: Record<string, AvailabilityState>;
}

export interface SlotAnalysis {
  key: string;
  day: number;
  weekday: string;
  dateFormatted: string;
  isWeekend: boolean;
  isHoliday?: string;
  shiftId: ShiftId;
  shiftLabel: string;
  shiftTime: string;
  canCount: number;
  ifNeededCount: number;
  cannotCount: number;
  totalParticipants: number;
  score: number; // (canCount * 2) + (ifNeededCount * 1)
  percentageCan: number; // (canCount / totalParticipants) * 100
  percentageTotal: number; // ((canCount + ifNeededCount) / totalParticipants) * 100
  canList: string[];
  ifNeededList: string[];
  cannotList: string[];
  isPerfectMatch: boolean; // 100% canCount
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  recipient: string;
  subject: string;
  triggerType: 'all_completed' | 'full_convergence' | 'manual_test';
  htmlPreview: string;
  summary: string;
  status: 'sent' | 'simulated';
}

export interface AppSettings {
  eventName: string;
  organizerEmail: string;
  targetCount: number;
  webhookUrl?: string;
  expectedParticipants: string[];
  emailLogs: EmailLogEntry[];
  notifiedAllCompleted?: boolean;
  notifiedFullConvergenceSlots?: string[];
}

export interface AppState {
  settings: AppSettings;
  participants: Record<string, Participant>;
  lastUpdated: string;
}
