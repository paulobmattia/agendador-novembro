'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Copy, Check, ExternalLink, Phone } from 'lucide-react';
import { triggerHaptic } from '@/lib/client-session';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantName: string;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  participantName,
}) => {
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const messageText = `Fala ${participantName}! Só falta você preencher sua disponibilidade de novembro pra gente fechar nosso encontro. Abre o link rapidinho: ${currentUrl}`;

  // Clean phone number: remove non-digits
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`}?text=${encodeURIComponent(messageText)}`
    : `https://wa.me/?text=${encodeURIComponent(messageText)}`;

  const handleCopy = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    triggerHaptic('medium');
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-4 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                Cobrar no WhatsApp
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Lembrete amigável para <strong className="text-emerald-600 dark:text-emerald-400">{participantName}</strong>
              </p>
            </div>
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

        {/* Optional Phone Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-zinc-400" />
            Número de WhatsApp (Opcional - com DDD):
          </label>
          <input
            type="tel"
            placeholder="Ex: 11999998888 (ou deixe vazio para escolher o contato no app)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-zinc-400"
          />
        </div>

        {/* Message Preview */}
        <div>
          <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
            Mensagem formatada:
          </label>
          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans relative">
            <p className="italic">
              &quot;Fala <strong>{participantName}</strong>! Só falta você preencher sua disponibilidade de novembro pra gente fechar nosso encontro. Abre o link rapidinho: <span className="text-emerald-600 dark:text-emerald-400 underline break-all">{currentUrl}</span>&quot;
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-zinc-500" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Abrir no WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      </div>
    </div>
  );
};
