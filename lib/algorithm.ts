import {
  CURRENT_YEAR,
  CURRENT_MONTH,
  NOVEMBER_HOLIDAYS_BR,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  getSlotKey,
  getEligibleNovemberDays,
  getShiftsForDay,
} from './constants';
import { AppState, SlotAnalysis } from './types';

export interface GroupAnalysisResult {
  slotsMap: Record<string, SlotAnalysis>;
  rankedSlots: SlotAnalysis[];
  top3Slots: SlotAnalysis[];
  perfectMatchSlots: SlotAnalysis[];
  completedCount: number;
  targetCount: number;
  allCompleted: boolean;
  participantsList: {
    name: string;
    hasResponded: boolean;
    updatedAt?: string;
  }[];
}

export function analyzeGroupAvailability(state: AppState): GroupAnalysisResult {
  const { settings, participants } = state;
  const targetCount = settings.targetCount || 16;
  const expectedNames = settings.expectedParticipants || [];

  // Build complete participants array including expected names that might not be in DB yet
  const participantsMap = new Map<string, { hasResponded: boolean; availability: Record<string, string>; updatedAt?: string }>();

  // Add expected participants
  expectedNames.forEach((name) => {
    participantsMap.set(name.trim().toLowerCase(), {
      hasResponded: false,
      availability: {},
    });
  });

  // Merge registered participants
  Object.values(participants).forEach((p) => {
    const key = p.name.trim().toLowerCase();
    participantsMap.set(key, {
      hasResponded: p.hasResponded,
      availability: p.availability || {},
      updatedAt: p.updatedAt,
    });
  });

  const participantEntries = Array.from(participantsMap.entries()).map(([_, data], idx) => {
    // Find proper display name
    const originalName =
      expectedNames.find((n) => n.trim().toLowerCase() === _) ||
      Object.values(participants).find((p) => p.name.trim().toLowerCase() === _)?.name ||
      `Participante ${idx + 1}`;

    return {
      name: originalName,
      hasResponded: data.hasResponded,
      availability: data.availability,
      updatedAt: data.updatedAt,
    };
  });

  // Calculate responded count
  const completedCount = participantEntries.filter((p) => p.hasResponded).length;
  const allCompleted = completedCount >= targetCount;

  const slotsMap: Record<string, SlotAnalysis> = {};
  const allSlots: SlotAnalysis[] = [];

  // Analyze only eligible days and shifts for the group (no Sundays, no Fridays, weekdays night only, Saturdays all shifts)
  const eligibleDays = getEligibleNovemberDays();

  for (const day of eligibleDays) {
    const dateObj = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
    const dayOfWeek = dateObj.getDay();
    const weekdayShort = WEEKDAYS_SHORT[dayOfWeek];
    const weekdayLong = WEEKDAYS_LONG[dayOfWeek];
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = NOVEMBER_HOLIDAYS_BR[day];

    const dayFormatted = `${day.toString().padStart(2, '0')}/11 (${weekdayShort})`;
    const shiftsForThisDay = getShiftsForDay(day);

    for (const shift of shiftsForThisDay) {
      const slotKey = getSlotKey(day, shift.id);

      const canList: string[] = [];
      const ifNeededList: string[] = [];
      const cannotList: string[] = [];

      participantEntries.forEach((p) => {
        const stateValue = p.availability[slotKey];
        if (stateValue === 'can') {
          canList.push(p.name);
        } else if (stateValue === 'if_needed') {
          ifNeededList.push(p.name);
        } else {
          cannotList.push(p.name);
        }
      });

      const canCount = canList.length;
      const ifNeededCount = ifNeededList.length;
      const cannotCount = cannotList.length;

      // Score formula: (Podem × 2) + (Se necessário × 1)
      const score = canCount * 2 + ifNeededCount * 1;
      const percentageCan = targetCount > 0 ? (canCount / targetCount) * 100 : 0;
      const percentageTotal = targetCount > 0 ? ((canCount + ifNeededCount) / targetCount) * 100 : 0;
      const isPerfectMatch = canCount >= targetCount && targetCount > 0;

      const slotAnalysis: SlotAnalysis = {
        key: slotKey,
        day,
        weekday: weekdayLong,
        dateFormatted: dayFormatted,
        isWeekend,
        isHoliday,
        shiftId: shift.id,
        shiftLabel: shift.label,
        shiftTime: shift.time,
        canCount,
        ifNeededCount,
        cannotCount,
        totalParticipants: targetCount,
        score,
        percentageCan: Math.round(percentageCan),
        percentageTotal: Math.round(percentageTotal),
        canList,
        ifNeededList,
        cannotList,
        isPerfectMatch,
      };

      slotsMap[slotKey] = slotAnalysis;
      allSlots.push(slotAnalysis);
    }
  }

  // Sort ranked slots by score desc, then by canCount desc, then by day asc
  const rankedSlots = [...allSlots].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.canCount !== a.canCount) return b.canCount - a.canCount;
    return a.day - b.day;
  });

  const top3Slots = rankedSlots.slice(0, 3);
  const perfectMatchSlots = rankedSlots.filter((s) => s.isPerfectMatch);

  return {
    slotsMap,
    rankedSlots,
    top3Slots,
    perfectMatchSlots,
    completedCount,
    targetCount,
    allCompleted,
    participantsList: participantEntries.map((p) => ({
      name: p.name,
      hasResponded: p.hasResponded,
      updatedAt: p.updatedAt,
    })),
  };
}
