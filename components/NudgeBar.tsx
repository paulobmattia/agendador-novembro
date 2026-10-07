'use client';

import React from 'react';
import { Check, Clock, MessageCircle, Users } from 'lucide-react';
import { triggerHaptic } from '@/lib/client-session';

interface ParticipantStatus {
  name: string;
  hasResponded: boolean;
  updatedAt?: string;
}

interface NudgeBarProps {
  participants: ParticipantStatus[];
  onSelectPending: (name: string) => void;
  targetCount: number;
}

export const NudgeBar: React.FC<NudgeBarProps> = ({
  participants,
  onSelectPending,
  targetCount,
}) => {
  const pendingList = participants.filter((p) => !p.hasResponded);
  const completedList = participants.filter((p) => p.hasResponded);

  return (
    <section className="w-full bg-zinc-50/80 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80 py-3 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        {/* Title and stats */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Quem falta responder?
            </h2>
            {pendingList.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {pendingList.length} pendentes
              </span>
            ) : completedList.length >= targetCount ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Todos preencheram! 🎉
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-zinc-400">
                {completedList.length} de {targetCount}
              </span>
            )}
          </div>
          {participants.length > 0 && (
            <span className="text-[10px] text-zinc-400">
              Arraste para os lados ⇄
            </span>
          )}
        </div>

        {/* Horizontal scrollable chips container with scrollsnap */}
        {participants.length === 0 ? (
          <p className="text-xs text-zinc-400 italic py-1">
            Conforme as 16 pessoas do grupo forem inserindo seus nomes e preenchendo, os status aparecerão aqui.
          </p>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 snap-x snap-mandatory scroll-smooth scrollbar-none">
            {participants.map((p) => {
              if (p.hasResponded) {
                return (
                  <div
                    key={p.name}
                    className="snap-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium shadow-sm transition-all"
                    title={`${p.name} já respondeu a disponibilidade`}
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span className="font-semibold">{p.name}</span>
                  </div>
                );
              }

              // Pending badge with pulse animation
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    triggerHaptic('medium');
                    onSelectPending(p.name);
                  }}
                  className="snap-start shrink-0 group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs font-medium shadow-sm hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 transition-all active:scale-95 animate-pulse-glow"
                  title={`Clique para cobrar ${p.name} no WhatsApp`}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 group-hover:bg-emerald-500 transition-colors">
                    <Clock className="w-2.5 h-2.5 stroke-[2.5]" />
                  </div>
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 group-hover:text-emerald-600 flex items-center gap-0.5 font-bold">
                    <MessageCircle className="w-3 h-3 text-emerald-600 fill-emerald-600/30" />
                    Cobrar
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
