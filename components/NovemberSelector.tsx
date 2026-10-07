'use client';

import React from 'react';
import {
  SunMedium,
  Sun,
  Moon,
  Sparkles,
  Flame,
  Check,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  CURRENT_YEAR,
  CURRENT_MONTH,
  NOVEMBER_HOLIDAYS_BR,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  getSlotKey,
  getEligibleNovemberDays,
  getShiftsForDay,
} from '@/lib/constants';
import { AvailabilityState, ShiftId, SlotAnalysis } from '@/lib/types';
import { triggerHaptic } from '@/lib/client-session';

interface NovemberSelectorProps {
  mode: 'personal' | 'group';
  myAvailability: Record<string, AvailabilityState>;
  onToggleMyShift: (slotKey: string) => void;
  slotsMap: Record<string, SlotAnalysis>;
  onSelectSlot: (slot: SlotAnalysis) => void;
  onQuickAction: (action: 'weekends' | 'nights' | 'clear') => void;
}

// Map shift to short time labels that fit in narrow buttons
const SHIFT_SHORT_TIME: Record<ShiftId, string> = {
  morning: '8h-12h',
  afternoon: '12h-18h',
  night: '18h-23h',
};

export const NovemberSelector: React.FC<NovemberSelectorProps> = ({
  mode,
  myAvailability,
  onToggleMyShift,
  slotsMap,
  onSelectSlot,
  onQuickAction,
}) => {
  const eligibleDays = getEligibleNovemberDays();

  const getShiftIcon = (shiftId: ShiftId, className = 'w-3.5 h-3.5') => {
    switch (shiftId) {
      case 'morning':  return <SunMedium className={className} />;
      case 'afternoon': return <Sun className={className} />;
      case 'night':    return <Moon className={className} />;
    }
  };

  const getHeatmapStyle = (slot?: SlotAnalysis) => {
    if (!slot) return 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-400 border-zinc-200 dark:border-zinc-800';
    const pct = slot.percentageCan;
    if (slot.isPerfectMatch) return 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30 animate-pulse-glow';
    if (pct >= 70)  return 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700';
    if (pct >= 40)  return 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:bg-amber-200';
    return 'bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100';
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 pb-24">
      {/* Quick Action Tools in Personal Mode */}
      {mode === 'personal' && (
        <div className="mb-3 p-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Preenchimento Rápido:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => onQuickAction('nights')} className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-400" />
              <span>Todas as Noites</span>
            </button>
            <button onClick={() => onQuickAction('weekends')} className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 active:scale-95 transition-all flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Todos os Sábados</span>
            </button>
            <button onClick={() => onQuickAction('clear')} className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-red-500 hover:border-red-300 active:scale-95 transition-all flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Limpar Tudo</span>
            </button>
          </div>
        </div>
      )}

      {/* Notice of excluded days */}
      <div className="mb-3 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
        <span>ℹ️ Domingos e Sextas não aparecem (compromissos fixos). Dias de semana só têm Noite.</span>
        <span className="font-semibold text-zinc-700 dark:text-zinc-300 shrink-0 ml-2">{eligibleDays.length} dias</span>
      </div>

      {/* Days List / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {eligibleDays.map((day) => {
          const dateObj  = new Date(CURRENT_YEAR, CURRENT_MONTH - 1, day);
          const dayOfWeek = dateObj.getDay();
          const isSaturday = dayOfWeek === 6;
          const holiday   = NOVEMBER_HOLIDAYS_BR[day];
          const dayShifts = getShiftsForDay(day);
          const isSingle  = dayShifts.length === 1;

          return (
            <div
              key={day}
              className={`p-3.5 rounded-3xl border transition-all duration-200 shadow-sm hover:shadow-md ${
                isSaturday
                  ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-900/60'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800/80'
              }`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-base ${isSaturday ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white'}`}>
                    {day.toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white leading-tight">
                      {WEEKDAYS_LONG[dayOfWeek]}
                    </h3>
                    <span className="text-[11px] text-zinc-400 leading-none">{day} de Novembro</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSaturday && <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">Sábado</span>}
                  {holiday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 max-w-[110px] truncate">{holiday}</span>}
                </div>
              </div>

              {/* Shifts grid */}
              <div className={`grid gap-2 ${isSingle ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {dayShifts.map((shift) => {
                  const slotKey     = getSlotKey(day, shift.id);
                  const slotAnalysis = slotsMap[slotKey];

                  /* ─── PERSONAL MODE ─── */
                  if (mode === 'personal') {
                    const state = myAvailability[slotKey] || 'none';

                    let bg = 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/80 hover:bg-zinc-100 dark:hover:bg-zinc-800';
                    let label = 'Neutro';
                    let icon: React.ReactNode = null;

                    if (state === 'can') {
                      bg = 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/25';
                      label = 'Posso ✓';
                    } else if (state === 'if_needed') {
                      bg = 'bg-amber-500 text-white border-amber-400 shadow-md shadow-amber-500/25';
                      label = 'Talvez';
                    }

                    /* SINGLE (weekday) – wide horizontal button */
                    if (isSingle) {
                      return (
                        <button
                          key={shift.id}
                          type="button"
                          onClick={() => { triggerHaptic('light'); onToggleMyShift(slotKey); }}
                          className={`h-14 px-4 rounded-2xl border flex items-center justify-between transition-all active:scale-95 select-none overflow-hidden ${bg}`}
                          title={`${shift.label} – toque para alterar`}
                        >
                          {/* Left: icon + label */}
                          <div className="flex items-center gap-2 min-w-0">
                            {getShiftIcon(shift.id, 'w-4 h-4 shrink-0')}
                            <span className="text-sm font-bold truncate">{shift.label}</span>
                            <span className="text-[10px] opacity-70 whitespace-nowrap hidden xs:block">
                              {SHIFT_SHORT_TIME[shift.id]}
                            </span>
                          </div>
                          {/* Right: status */}
                          <span className="text-xs font-bold whitespace-nowrap ml-2 shrink-0">{label}</span>
                        </button>
                      );
                    }

                    /* MULTI (Saturday) – narrow vertical button */
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => { triggerHaptic('light'); onToggleMyShift(slotKey); }}
                        className={`h-[88px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 px-1 transition-all active:scale-95 select-none overflow-hidden ${bg}`}
                        title={`${shift.label} – toque para alterar`}
                      >
                        {getShiftIcon(shift.id, 'w-4 h-4 shrink-0')}
                        <span className="text-[11px] font-bold uppercase leading-none text-center">{shift.label}</span>
                        <span className="text-[9px] opacity-70 leading-none text-center whitespace-nowrap">
                          {SHIFT_SHORT_TIME[shift.id]}
                        </span>
                        <span className={`text-[10px] font-bold leading-none mt-0.5 ${state === 'none' ? 'opacity-50' : ''}`}>
                          {label}
                        </span>
                      </button>
                    );
                  }

                  /* ─── GROUP HEATMAP MODE ─── */
                  const heatmapClass = getHeatmapStyle(slotAnalysis);
                  const canCount   = slotAnalysis?.canCount || 0;
                  const total      = slotAnalysis?.totalParticipants || 16;
                  const isPerfect  = slotAnalysis?.isPerfectMatch;

                  if (isSingle) {
                    return (
                      <button
                        key={shift.id}
                        type="button"
                        onClick={() => { triggerHaptic('light'); if (slotAnalysis) onSelectSlot(slotAnalysis); }}
                        className={`h-14 px-4 rounded-2xl border flex items-center justify-between transition-all active:scale-95 select-none overflow-hidden ${heatmapClass}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isPerfect ? <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce shrink-0" /> : getShiftIcon(shift.id, 'w-4 h-4 shrink-0')}
                          <span className="text-sm font-bold truncate">{shift.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-black whitespace-nowrap">{canCount}/{total}</span>
                          <span className="text-[10px] font-bold whitespace-nowrap px-1.5 py-0.5 rounded bg-black/10">
                            {isPerfect ? '🔥' : `${slotAnalysis?.percentageCan || 0}%`}
                          </span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={shift.id}
                      type="button"
                      onClick={() => { triggerHaptic('light'); if (slotAnalysis) onSelectSlot(slotAnalysis); }}
                      className={`h-[88px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 px-1 transition-all active:scale-95 select-none overflow-hidden ${heatmapClass}`}
                    >
                      {isPerfect ? <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" /> : getShiftIcon(shift.id, 'w-4 h-4')}
                      <span className="text-[11px] font-bold uppercase leading-none text-center">{shift.label}</span>
                      <span className="text-xs font-black leading-none">{canCount}/{total}</span>
                      <span className="text-[10px] font-bold leading-none opacity-80">
                        {isPerfect ? '100% 🔥' : `${slotAnalysis?.percentageCan || 0}%`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
