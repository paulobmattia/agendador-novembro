'use client';

import React from 'react';
import { X, CheckCircle2, AlertCircle, XCircle, MessageCircle, Star, Flame } from 'lucide-react';
import { SlotAnalysis } from '@/lib/types';
import { triggerHaptic } from '@/lib/client-session';

interface SlotDetailSheetProps {
  slot: SlotAnalysis | null;
  onClose: () => void;
  onNudgeWhatsApp: (name: string) => void;
}

export const SlotDetailSheet: React.FC<SlotDetailSheetProps> = ({
  slot,
  onClose,
  onNudgeWhatsApp,
}) => {
  if (!slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full sm:max-w-lg max-h-[88vh] bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 animate-slideUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {slot.shiftLabel} • {slot.shiftTime}
              </span>
              {slot.isPerfectMatch && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  100% Match
                </span>
              )}
            </div>
            <h3 className="font-extrabold text-2xl text-zinc-900 dark:text-white mt-1">
              {slot.dateFormatted}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {slot.weekday} {slot.isHoliday ? `• Feriado (${slot.isHoliday})` : ''}
            </p>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Metrics Bar */}
        <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Adesão Total
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {slot.percentageTotal}%
            </span>
            <span className="text-[11px] text-zinc-500 block">
              {slot.canCount + slot.ifNeededCount} de {slot.totalParticipants}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Disponíveis
            </span>
            <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">
              {slot.canCount}
            </span>
            <span className="text-[11px] text-zinc-500 block">podem com certeza</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
              Pontuação
            </span>
            <span className="text-lg font-black text-zinc-900 dark:text-white">
              {slot.score}
            </span>
            <span className="text-[11px] text-zinc-500 block">pts algoritmo</span>
          </div>
        </div>

        {/* Scrollable Lists */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* ✅ PODEM */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Podem comparecer ({slot.canList.length})
              </span>
              <span className="text-[11px] font-semibold text-emerald-600">
                +2 pts cada
              </span>
            </div>
            {slot.canList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {slot.canList.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">Ninguém marcou certeza neste horário ainda.</p>
            )}
          </div>

          {/* ⚠️ SE NECESSÁRIO */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Se necessário / Talvez ({slot.ifNeededList.length})
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                +1 pt cada
              </span>
            </div>
            {slot.ifNeededList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {slot.ifNeededList.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-medium bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">Nenhum participante marcou como segunda opção.</p>
            )}
          </div>

          {/* ❌ NÃO PODEM OU NÃO RESPONDERAM */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-zinc-400" />
                Não responderam / Não podem ({slot.cannotList.length})
              </span>
              <span className="text-[11px] text-zinc-400">0 pts</span>
            </div>
            {slot.cannotList.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {slot.cannotList.map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      triggerHaptic('light');
                      onNudgeWhatsApp(name);
                    }}
                    className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-300 transition-all"
                    title={`Cobrar ${name} no WhatsApp`}
                  >
                    <span>{name}</span>
                    <MessageCircle className="w-3 h-3 text-zinc-400 group-hover:text-emerald-500" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">
                Parabéns! Ninguém está indisponível neste horário!
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            Dica: Toque em um nome indisponível para cobrar no WhatsApp.
          </span>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
