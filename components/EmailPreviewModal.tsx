'use client';

import React from 'react';
import { X, Mail, CheckCircle2, Clock } from 'lucide-react';
import { EmailLogEntry } from '@/lib/types';
import { triggerHaptic } from '@/lib/client-session';

interface EmailPreviewModalProps {
  log: EmailLogEntry | null;
  onClose: () => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {log.status === 'sent' ? 'Disparado via SMTP' : 'Log de Envio'}
                </span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white mt-0.5 truncate max-w-md">
                {log.subject}
              </h3>
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

        {/* Recipient info */}
        <div className="px-5 py-2.5 bg-zinc-100/70 dark:bg-zinc-800/60 border-b border-zinc-200/50 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex flex-wrap justify-between items-center gap-2">
          <div>
            <strong>Destinatário:</strong>{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {log.recipient}
            </span>
          </div>
          <div>
            <strong>Gatilho:</strong>{' '}
            <span className="capitalize">{log.triggerType.replace('_', ' ')}</span>
          </div>
        </div>

        {/* HTML Render Container */}
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-100 dark:bg-zinc-950">
          <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white shadow-sm">
            <iframe
              srcDoc={log.htmlPreview}
              title="Pré-visualização do e-mail"
              className="w-full h-[520px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
