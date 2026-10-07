'use client';

import React, { useState } from 'react';
import {
  X,
  Settings,
  Mail,
  Users,
  Send,
  Trash2,
  Plus,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  ExternalLink,
  History,
} from 'lucide-react';
import { AppSettings, EmailLogEntry } from '@/lib/types';
import { triggerHaptic } from '@/lib/client-session';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
  onTriggerTestEmail: () => Promise<void>;
  onResetData: (mode: 'seed' | 'empty' | 'perfect_simulation') => Promise<void>;
  onViewEmailLog: (log: EmailLogEntry) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTriggerTestEmail,
  onResetData,
  onViewEmailLog,
}) => {
  const [organizerEmail, setOrganizerEmail] = useState(
    settings.organizerEmail || 'pauloeduardo.braga@hotmail.com'
  );
  const [targetCount, setTargetCount] = useState(settings.targetCount || 16);
  const [eventName, setEventName] = useState(settings.eventName || 'Encontro de Novembro');
  const [webhookUrl, setWebhookUrl] = useState(settings.webhookUrl || '');
  const [participants, setParticipants] = useState<string[]>(
    settings.expectedParticipants || []
  );
  const [newParticipant, setNewParticipant] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddParticipant = () => {
    if (!newParticipant.trim()) return;
    triggerHaptic('light');
    const updated = [...participants, newParticipant.trim()];
    setParticipants(updated);
    setNewParticipant('');
    setTargetCount(updated.length);
  };

  const handleRemoveParticipant = (index: number) => {
    triggerHaptic('warn');
    const updated = participants.filter((_, i) => i !== index);
    setParticipants(updated);
    setTargetCount(updated.length);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      triggerHaptic('medium');
      await onSaveSettings({
        organizerEmail: organizerEmail.trim(),
        targetCount: Number(targetCount),
        eventName: eventName.trim(),
        webhookUrl: webhookUrl.trim() || undefined,
        expectedParticipants: participants,
      });
      setStatusMessage('Configurações salvas com sucesso!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setTestEmailLoading(true);
      triggerHaptic('medium');
      await onTriggerTestEmail();
      setStatusMessage(`E-mail de teste enviado para ${organizerEmail}!`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch {
      setStatusMessage('Erro ao enviar e-mail de teste.');
    } finally {
      setTestEmailLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 flex items-center justify-center">
              <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                Painel do Organizador
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configurações do evento, alertas por e-mail e participantes
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        {statusMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Alertas por E-mail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                Alertas por E-mail do Organizador
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Disparo Automático Ativo
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  E-mail do Organizador:
                </label>
                <input
                  type="email"
                  value={organizerEmail}
                  onChange={(e) => setOrganizerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  O sistema dispara automaticamente quando todos os {targetCount} preencherem ou quando houver 100% de convergência.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Webhook URL (Opcional para automações Zapier/Make/Discord):
                </label>
                <input
                  type="url"
                  placeholder="https://sua-api.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testEmailLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {testEmailLoading ? 'Disparando...' : 'Testar Disparo de E-mail Agora'}
                </button>
              </div>
            </div>
          </div>

          {/* 2. Participantes Esperados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Participantes do Grupo ({participants.length} de {targetCount} definidos)
              </h4>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-zinc-500">Meta:</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-bold"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
              {/* Add form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nome do participante..."
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddParticipant()}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="px-3.5 py-2 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar
                </button>
              </div>

              {/* Names list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                {participants.map((name, index) => (
                  <div
                    key={`${name}-${index}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-xs text-zinc-800 dark:text-zinc-200"
                  >
                    <span className="truncate pr-1 font-medium">{name}</span>
                    <button
                      onClick={() => handleRemoveParticipant(index)}
                      className="text-zinc-400 hover:text-red-500 p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Histórico de E-mails Disparados */}
          {settings.emailLogs && settings.emailLogs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-500" />
                Histórico de Notificações Enviadas ({settings.emailLogs.length})
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {settings.emailLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() => onViewEmailLog(log)}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs hover:border-emerald-300 cursor-pointer transition-all group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-white truncate">
                          {log.subject}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-500 block truncate">
                        Para: {log.recipient} • {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewEmailLog(log);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[11px] font-semibold border border-zinc-200 dark:border-zinc-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0"
                    >
                      Ver E-mail
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Ações de Demonstração e Testes */}
          <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Cenários de Teste & Demonstração Rápida
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  onResetData('perfect_simulation');
                }}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Simular 100% Match
                </div>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 leading-tight">
                  Dispara confetes, banner comemorativo e e-mail automático.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onResetData('seed');
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white mb-0.5">
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                  Modo Padrão (12/16)
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  12 responderam e 4 pendentes para testar a cobrança WhatsApp.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('warn');
                  onResetData('empty');
                }}
                className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 text-left transition-all"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white mb-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                  Limpar do Zero
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Zera todas as respostas para preenchimento limpo.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-zinc-600 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};
