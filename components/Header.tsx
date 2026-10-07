'use client';

import React, { useState } from 'react';
import { Calendar, User, Edit2, Check } from 'lucide-react';
import { triggerHaptic } from '@/lib/client-session';

interface HeaderProps {
  currentUserName: string;
  onSetUserName: (name: string) => void;
  isSaving?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUserName,
  onSetUserName,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(!currentUserName);
  const [tempName, setTempName] = useState(currentUserName);

  const handleSaveName = () => {
    if (!tempName.trim()) return;
    triggerHaptic('medium');
    onSetUserName(tempName.trim());
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-col gap-2">
        {/* Top row: Brand & User Identity or Save Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/25 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white leading-none">
                  Novembro 2026
                </h1>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Agenda
                </span>
              </div>
            </div>
          </div>

          {/* Right side: Auto-save status + Identified User info (if not editing) */}
          <div className="flex items-center gap-2.5">
            {/* Auto-save status */}
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-900/50">
              <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
              <span>{isSaving ? 'Salvando...' : 'Salvo'}</span>
            </div>

            {/* Identified user badge */}
            {!isEditing && currentUserName && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl">
                <span>
                  Olá, <strong className="text-zinc-900 dark:text-white font-bold">{currentUserName}</strong>
                </span>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setTempName(currentUserName);
                    setIsEditing(true);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] font-semibold flex items-center gap-0.5 ml-1"
                  title="Alterar seu nome"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>Editar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Name input row - only visible when not confirmed yet or when editing */}
        {(isEditing || !currentUserName) && (
          <div className="bg-zinc-50 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2 animate-fadeIn">
            <div className="relative flex-1">
              <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Qual é o seu nome? (Digite aqui)..."
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-zinc-400"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={!tempName.trim()}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
