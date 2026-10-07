'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Flame,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { SlotAnalysis } from '@/lib/types';
import { launchConfetti } from '@/lib/confetti';
import { triggerHaptic } from '@/lib/client-session';

interface TopDatesBannerProps {
  topSlots: SlotAnalysis[];
  perfectSlots: SlotAnalysis[];
  targetCount: number;
  onSelectSlot: (slot: SlotAnalysis) => void;
  defaultExpanded?: boolean;
}

export const TopDatesBanner: React.FC<TopDatesBannerProps> = ({
  topSlots,
  perfectSlots,
  targetCount,
  onSelectSlot,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasPerfectMatch = perfectSlots.length > 0;

  // Trigger celebratory confetti if there is 100% convergence
  useEffect(() => {
    if (hasPerfectMatch) {
      launchConfetti();
      setIsExpanded(true);
    }
  }, [hasPerfectMatch]);

  if (!topSlots || topSlots.length === 0) return null;

  const medals = ['🥇', '🥈', '🥉'];
  const championSlot = topSlots[0];

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-2 flex flex-col gap-2">
      {/* 100% Match Celebratory Banner */}
      {hasPerfectMatch && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-4 sm:p-5 text-white shadow-xl shadow-emerald-900/20 border border-emerald-400/40 animate-pulse-glow mb-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                🎉
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    Match Perfeito 100%
                  </span>
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-white mt-0.5 leading-snug">
                  Todos os {targetCount} podem no mesmo horário!
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('success');
                launchConfetti();
                if (perfectSlots[0]) onSelectSlot(perfectSlots[0]);
              }}
              className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ver Data Campeã ({perfectSlots[0]?.dateFormatted})</span>
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Top Dates Card */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm overflow-hidden transition-all">
        {/* Clickable Header bar to toggle */}
        <div
          onClick={() => {
            triggerHaptic('light');
            setIsExpanded(!isExpanded);
          }}
          className="p-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors select-none"
        >
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs text-zinc-900 dark:text-white">
                  Melhores Datas Em Comum
                </span>
                {championSlot && championSlot.score > 0 && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.2 rounded-full truncate">
                    1º lugar: {championSlot.dateFormatted} ({championSlot.shiftLabel})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-zinc-400 shrink-0">
            <span className="text-[10px] font-semibold hidden xs:inline">
              {isExpanded ? 'Ocultar' : 'Ver Top 3'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-3 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-1 animate-fadeIn">
            <p className="text-[10px] text-zinc-400 mb-2.5">
              Ranqueamento calculado por: (Podem × 2) + (Se necessário × 1)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {topSlots.slice(0, 3).map((slot, index) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={slot.key}
                    onClick={() => {
                      triggerHaptic('light');
                      onSelectSlot(slot);
                    }}
                    className={`group p-2.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between active:scale-[0.98] ${
                      slot.isPerfectMatch
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                        : isFirst
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                        : 'bg-zinc-50/60 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{medals[index] || `#${index + 1}`}</span>
                        <div>
                          <span className="font-bold text-xs text-zinc-900 dark:text-white block leading-tight">
                            {slot.dateFormatted}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                            {slot.shiftLabel} ({slot.shiftTime})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-zinc-700 dark:text-zinc-300 px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-700/60">
                        {slot.score} pts
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-zinc-200/50 dark:border-zinc-800">
                      <span className="text-emerald-700 dark:text-emerald-300 font-semibold">
                        {slot.canCount} podem {slot.ifNeededCount > 0 ? `+ ${slot.ifNeededCount} talvez` : ''}
                      </span>
                      <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
