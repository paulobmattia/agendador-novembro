'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { NudgeBar } from '@/components/NudgeBar';
import { TopDatesBanner } from '@/components/TopDatesBanner';
import { AgendaViewToggle, AgendaMode } from '@/components/AgendaViewToggle';
import { NovemberSelector } from '@/components/NovemberSelector';
import { WhatsAppModal } from '@/components/WhatsAppModal';
import { SlotDetailSheet } from '@/components/SlotDetailSheet';
import {
  AppState,
  AvailabilityState,
  SlotAnalysis,
} from '@/lib/types';
import {
  getStoredUserName,
  saveStoredUserName,
  triggerHaptic,
} from '@/lib/client-session';
import {
  DEFAULT_PARTICIPANTS_16,
  TARGET_PARTICIPANTS_COUNT,
  getSlotKey,
  getEligibleNovemberDays,
  getShiftsForDay,
} from '@/lib/constants';
import { Share2, Check } from 'lucide-react';
import { launchConfetti } from '@/lib/confetti';

export default function Home() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [myAvailability, setMyAvailability] = useState<Record<string, AvailabilityState>>({});
  const [agendaMode, setAgendaMode] = useState<AgendaMode>('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Modals state
  const [whatsAppTarget, setWhatsAppTarget] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotAnalysis | null>(null);

  // Load state from backend
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.data) {
        setAppState(data.data.state);
        setAnalysis(data.data.analysis);
      }
    } catch (err) {
      console.error('Failed to load state', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchState();
    const storedName = getStoredUserName();
    if (storedName) {
      setCurrentUserName(storedName);
    }
  }, [fetchState]);

  // When currentUserName or appState changes, load the participant's saved choices
  useEffect(() => {
    if (!currentUserName || !appState) return;

    const lowerName = currentUserName.trim().toLowerCase();
    const found = Object.values(appState.participants).find(
      (p) => p.name.trim().toLowerCase() === lowerName
    );

    if (found && found.availability) {
      setMyAvailability(found.availability);
    }
  }, [currentUserName, appState]);

  // Handle changing user name
  const handleSetUserName = (name: string) => {
    const clean = name.trim();
    setCurrentUserName(clean);
    saveStoredUserName(clean);

    if (appState) {
      const found = Object.values(appState.participants).find(
        (p) => p.name.trim().toLowerCase() === clean.toLowerCase()
      );
      if (found && found.availability) {
        setMyAvailability(found.availability);
      }
    }
  };

  // Save availability to server
  const saveAvailabilityToServer = useCallback(
    async (name: string, updatedAvailability: Record<string, AvailabilityState>) => {
      if (!name.trim()) return;
      setIsSaving(true);
      try {
        const res = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            availability: updatedAvailability,
          }),
        });
        const data = await res.json();
        if (data.success && data.data) {
          setAnalysis(data.data.analysis);
          if (
            data.data.automatedNotifications?.convergenceTriggered ||
            data.data.automatedNotifications?.allCompletedTriggered
          ) {
            launchConfetti();
          }
          fetchState();
        }
      } catch (err) {
        console.error('Save availability failed', err);
      } finally {
        setIsSaving(false);
      }
    },
    [fetchState]
  );

  // Toggle shift state (Cycle: none -> can -> if_needed -> none)
  const handleToggleMyShift = (slotKey: string) => {
    if (!currentUserName.trim()) {
      alert('Por favor, informe seu nome no topo antes de marcar os horários!');
      return;
    }

    const currentVal = myAvailability[slotKey] || 'none';
    let nextVal: AvailabilityState = 'none';

    if (currentVal === 'none') {
      nextVal = 'can';
    } else if (currentVal === 'can') {
      nextVal = 'if_needed';
    } else {
      nextVal = 'none';
    }

    const updated = { ...myAvailability };
    if (nextVal === 'none') {
      delete updated[slotKey];
    } else {
      updated[slotKey] = nextVal;
    }

    setMyAvailability(updated);
    saveAvailabilityToServer(currentUserName, updated);
  };

  // Quick Action helper
  const handleQuickAction = (action: 'weekends' | 'nights' | 'clear') => {
    if (!currentUserName.trim()) {
      alert('Por favor, informe seu nome no topo antes de marcar os horários!');
      return;
    }

    triggerHaptic('medium');
    const updated = { ...myAvailability };
    const eligibleDays = getEligibleNovemberDays();

    if (action === 'clear') {
      for (const day of eligibleDays) {
        const shifts = getShiftsForDay(day);
        for (const s of shifts) {
          delete updated[getSlotKey(day, s.id)];
        }
      }
    } else if (action === 'weekends') {
      for (const day of eligibleDays) {
        const date = new Date(2026, 10, day);
        if (date.getDay() === 6) {
          updated[getSlotKey(day, 'morning')] = 'can';
          updated[getSlotKey(day, 'afternoon')] = 'can';
          updated[getSlotKey(day, 'night')] = 'can';
        }
      }
    } else if (action === 'nights') {
      for (const day of eligibleDays) {
        updated[getSlotKey(day, 'night')] = 'can';
      }
    }

    setMyAvailability(updated);
    saveAvailabilityToServer(currentUserName, updated);
  };

  // Share application link (supports native Web Share API on mobile + clipboard copy)
  const handleShareLink = async () => {
    triggerHaptic('success');
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Agendador de Novembro',
          text: 'Preencha sua disponibilidade para nosso encontro de Novembro!',
          url: url,
        });
        return;
      } catch (e) {
        // Ignora se o usuário cancelou o drawer nativo
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const mySelectionCount = Object.keys(myAvailability).length;
  const targetCount = appState?.settings.targetCount || TARGET_PARTICIPANTS_COUNT;
  const completedCount = analysis?.completedCount || 0;
  const participantsList = analysis?.participantsList || [];

  // Contagem de participantes que ainda faltam responder
  const pendingCount = participantsList.filter((p: any) => !p.hasResponded).length;

  return (
    <div className="min-h-screen bg-zinc-100/60 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. Header & User identification (textbox desaparece após confirmar nome) */}
      <Header
        currentUserName={currentUserName}
        onSetUserName={handleSetUserName}
        isSaving={isSaving}
      />

      {/* 2. Quem falta responder? (Cobrança Ativa - apenas visível quando restarem 5 ou menos pendentes) */}
      {pendingCount <= 5 && pendingCount > 0 && (
        <NudgeBar
          participants={participantsList}
          onSelectPending={(name) => setWhatsAppTarget(name)}
          targetCount={targetCount}
        />
      )}

      {/* 3. Melhores Datas Em Comum (Destaque do Algoritmo) */}
      <TopDatesBanner
        topSlots={analysis?.top3Slots || []}
        perfectSlots={analysis?.perfectMatchSlots || []}
        targetCount={targetCount}
        onSelectSlot={(slot) => setSelectedSlot(slot)}
      />

      {/* 4. Agenda View Toggle: [ Minha Agenda ] | [ Visão do Grupo ] */}
      <AgendaViewToggle
        mode={agendaMode}
        onChangeMode={(m) => setAgendaMode(m)}
        mySelectionCount={mySelectionCount}
      />

      {/* 5. Seletor de Novembro (Grid Mobile Otimizado & Heatmap) */}
      <main className="flex-1">
        <NovemberSelector
          mode={agendaMode}
          myAvailability={myAvailability}
          onToggleMyShift={handleToggleMyShift}
          slotsMap={analysis?.slotsMap || {}}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          onQuickAction={handleQuickAction}
        />
      </main>

      {/* 6. Footer Fixo Minimalista: Status geral de preenchimento + Botão Compartilhar */}
      <div className="fixed bottom-0 inset-x-0 z-30 p-2.5 sm:p-3 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
              <span className={`w-2 h-2 rounded-full ${completedCount === targetCount ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span>
                <strong>{completedCount}</strong> de <strong>{targetCount}</strong> já responderam
              </span>
            </div>
            {agendaMode === 'personal' && mySelectionCount > 0 && (
              <span className="text-zinc-400 text-[11px] hidden xs:inline">
                · <strong>{mySelectionCount}</strong> turnos marcados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareLink}
              className="py-2 px-3.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-md shrink-0"
              title="Compartilhar link de agendamento"
            >
              {shareCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                  <span>Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Cobrar no WhatsApp */}
      <WhatsAppModal
        isOpen={Boolean(whatsAppTarget)}
        onClose={() => setWhatsAppTarget(null)}
        participantName={whatsAppTarget || ''}
      />

      {/* Bottom Sheet: Detalhes do Turno na Visão do Grupo */}
      <SlotDetailSheet
        slot={selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onNudgeWhatsApp={(name) => {
          setSelectedSlot(null);
          setWhatsAppTarget(name);
        }}
      />
    </div>
  );
}
