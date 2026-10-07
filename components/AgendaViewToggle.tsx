'use client';

import React from 'react';
import { UserCheck, Users, Info } from 'lucide-react';
import { triggerHaptic } from '@/lib/client-session';

export type AgendaMode = 'personal' | 'group';

interface AgendaViewToggleProps {
  mode: AgendaMode;
  onChangeMode: (mode: AgendaMode) => void;
  mySelectionCount: number;
}

export const AgendaViewToggle: React.FC<AgendaViewToggleProps> = ({
  mode,
  onChangeMode,
  mySelectionCount,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-1 pb-2">
      <div className="p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center shadow-inner">
        {/* Minha Agenda */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onChangeMode('personal');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'personal'
              ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-md border border-zinc-200/80 dark:border-zinc-700/80'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4 shrink-0" />
          <span>Minha Agenda</span>
          {mySelectionCount > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
              {mySelectionCount}
            </span>
          )}
        </button>

        {/* Visão do Grupo */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onChangeMode('group');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            mode === 'group'
              ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-md border border-zinc-200/80 dark:border-zinc-700/80'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span>Visão do Grupo</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
            Heatmap
          </span>
        </button>
      </div>

      {/* Helper caption */}
      <div className="px-2 pt-2 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
        {mode === 'personal' ? (
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Toque nos turnos para alternar: <strong>Posso (Verde)</strong> → <strong>Talvez (Amarelo)</strong> → <strong>Neutro</strong>.
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            Cores indicam a adesão do grupo. Toque em qualquer turno para ver a lista de nomes.
          </span>
        )}
      </div>
    </div>
  );
};
