import { ShiftDefinition } from './types';

export const ORGANIZER_DEFAULT_EMAIL = 'pauloeduardo.braga@hotmail.com';
export const TARGET_PARTICIPANTS_COUNT = 16;
export const CURRENT_YEAR = 2026;
export const CURRENT_MONTH = 11; // November

export const ALL_SHIFTS: Record<string, ShiftDefinition> = {
  morning: {
    id: 'morning',
    label: 'Manhã',
    time: '08h - 12h',
    icon: 'sunrise',
  },
  afternoon: {
    id: 'afternoon',
    label: 'Tarde',
    time: '12h - 18h',
    icon: 'sun',
  },
  night: {
    id: 'night',
    label: 'Noite',
    time: '18h - 23h',
    icon: 'moon',
  },
};

export const SHIFTS: ShiftDefinition[] = [
  ALL_SHIFTS.morning,
  ALL_SHIFTS.afternoon,
  ALL_SHIFTS.night,
];

export const DEFAULT_PARTICIPANTS_16: string[] = [
  'Yan',
  'Maria',
  'Beatriz',
  'Arlysson',
  'Esther',
  'Anna Clara',
  'Ylbert',
  'Josemar',
  'Pamela',
  'Diego',
  'Douglas',
  'Paulo',
  'Rodrigo',
  'Tabatha',
  'Ana Carolina',
  'Ana Júlia',
];

// Regras específicas do grupo:
// - Domingos removidos (Igreja)
// - Sextas-feiras removidas (Compromissos fixos)
// - Dias de semana (Seg a Qui): Apenas turno da Noite (18h às 23h)
// - Sábados: Manhã, Tarde e Noite
export function isDayAllowed(day: number): boolean {
  const dateObj = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
  const dayOfWeek = dateObj.getDay();
  // 0 = Domingo, 5 = Sexta-feira
  if (dayOfWeek === 0 || dayOfWeek === 5) {
    return false;
  }
  return true;
}

export function getShiftsForDay(day: number): ShiftDefinition[] {
  if (!isDayAllowed(day)) return [];
  const dateObj = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
  const dayOfWeek = dateObj.getDay();

  // Sábado = Manhã, Tarde e Noite
  if (dayOfWeek === 6) {
    return [ALL_SHIFTS.morning, ALL_SHIFTS.afternoon, ALL_SHIFTS.night];
  }

  // Segundas a Quintas = Apenas Noite
  return [ALL_SHIFTS.night];
}

export function getEligibleNovemberDays(): number[] {
  const days: number[] = [];
  for (let day = 1; day <= 30; day++) {
    if (isDayAllowed(day)) {
      days.push(day);
    }
  }
  return days;
}

export const NOVEMBER_HOLIDAYS_BR: Record<number, string> = {
  2: 'Finados',
  15: 'Proclamação da República',
  20: 'Dia da Consciência Negra',
};

export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAYS_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function getSlotKey(day: number, shiftId: string): string {
  return `day_${day}_${shiftId}`;
}

export function parseSlotKey(key: string): { day: number; shiftId: string } {
  const parts = key.split('_');
  return {
    day: parseInt(parts[1], 10),
    shiftId: parts[2],
  };
}
