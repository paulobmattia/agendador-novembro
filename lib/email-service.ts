import nodemailer from 'nodemailer';
import { analyzeGroupAvailability } from './algorithm';
import { logEmailSentAsync, readAppStateAsync, saveAppStateAsync } from './storage';
import { SlotAnalysis } from './types';

export interface EmailDispatchResult {
  success: boolean;
  type: 'all_completed' | 'full_convergence' | 'manual_test';
  recipient: string;
  subject: string;
  messageId?: string;
  isSimulated: boolean;
  previewHtml: string;
}

export function generateNotificationHtml(params: {
  eventName: string;
  triggerReason: string;
  recipient: string;
  completedCount: number;
  targetCount: number;
  topSlots: SlotAnalysis[];
  perfectSlots: SlotAnalysis[];
}): { subject: string; html: string; summary: string } {
  const { eventName, triggerReason, completedCount, targetCount, topSlots, perfectSlots } = params;

  const isFull100 = perfectSlots.length > 0;
  const subject = isFull100
    ? `🔥 [Match Perfeito 100%] Encontramos a data ideal para ${eventName}!`
    : `🎉 [${completedCount}/${targetCount} Concluído] Todos os participantes responderam a agenda!`;

  const topSlotsHtml = topSlots
    .map(
      (slot, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px; font-weight: bold; color: #0f172a;">
        #${i + 1} ${slot.dateFormatted}
      </td>
      <td style="padding: 12px; color: #059669; font-weight: 600;">
        ${slot.shiftLabel} (${slot.shiftTime})
      </td>
      <td style="padding: 12px; text-align: center;">
        <span style="background-color: ${slot.isPerfectMatch ? '#10b981' : '#3b82f6'}; color: white; padding: 4px 10px; border-radius: 9999px; font-size: 13px; font-weight: bold;">
          ${slot.canCount} podem ${slot.ifNeededCount > 0 ? `+ ${slot.ifNeededCount} talvez` : ''}
        </span>
      </td>
      <td style="padding: 12px; font-weight: bold; text-align: right; color: #1e293b;">
        ${slot.score} pts
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #10b981 50%, #047857 100%); padding: 32px 24px; text-align: center; color: white;">
              <div style="font-size: 36px; margin-bottom: 8px;">${isFull100 ? '🌟🔥🎉' : '📅✨'}</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em; color: white;">
                Agendador Novembro
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.92; color: #ecfdf5;">
                ${eventName}
              </p>
            </td>
          </tr>

          <!-- Motivo do Alerta -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <div style="background-color: ${isFull100 ? '#ecfdf5' : '#eff6ff'}; border-left: 4px solid ${isFull100 ? '#10b981' : '#3b82f6'}; padding: 14px 18px; border-radius: 8px;">
                <p style="margin: 0; font-weight: 700; color: ${isFull100 ? '#065f46' : '#1e40af'}; font-size: 15px;">
                  🔔 Alerta do Sistema:
                </p>
                <p style="margin: 4px 0 0 0; color: ${isFull100 ? '#047857' : '#1d4ed8'}; font-size: 14px;">
                  ${triggerReason}
                </p>
              </div>
            </td>
          </tr>

          <!-- Status Geral -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 16px;">
                <tr>
                  <td align="center" style="width: 50%; border-right: 1px solid #cbd5e1;">
                    <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Participação</span>
                    <span style="display: block; font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 4px;">
                      ${completedCount} / ${targetCount} pessoas
                    </span>
                  </td>
                  <td align="center" style="width: 50%;">
                    <span style="display: block; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Status do Grupo</span>
                    <span style="display: block; font-size: 22px; font-weight: 800; color: ${completedCount >= targetCount ? '#059669' : '#d97706'}; margin-top: 4px;">
                      ${completedCount >= targetCount ? '100% Completo' : `${Math.round((completedCount / targetCount) * 100)}%`}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tabela de Melhores Datas -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <h2 style="font-size: 17px; font-weight: 700; margin: 0 0 12px 0; color: #0f172a;">
                🏆 Top Melhores Horários em Comum
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; font-size: 14px;">
                <thead>
                  <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                    <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Data</th>
                    <th style="padding: 10px 12px; text-align: left; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Turno</th>
                    <th style="padding: 10px 12px; text-align: center; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Adesão</th>
                    <th style="padding: 10px 12px; text-align: right; color: #64748b; font-weight: 600; font-size: 12px; text-transform: uppercase;">Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${topSlotsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Detalhe da Data Vencedora -->
          ${
            topSlots.length > 0
              ? `
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;">
                <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 15px; font-weight: 700;">
                  👑 Data Campeã: ${topSlots[0].dateFormatted} - ${topSlots[0].shiftLabel}
                </h3>
                <p style="margin: 0 0 6px 0; font-size: 13px; color: #15803d;">
                  <strong>Quem pode comparecer (${topSlots[0].canList.length}):</strong><br/>
                  ${topSlots[0].canList.join(', ') || 'Ninguém'}
                </p>
                ${
                  topSlots[0].ifNeededList.length > 0
                    ? `
                <p style="margin: 0; font-size: 13px; color: #854d0e;">
                  <strong>Se necessário (${topSlots[0].ifNeededList.length}):</strong> ${topSlots[0].ifNeededList.join(', ')}
                </p>
                `
                    : ''
                }
              </div>
            </td>
          </tr>
          `
              : ''
          }

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 13px; color: #64748b;">
              <p style="margin: 0 0 4px 0;">
                Este e-mail foi gerado automaticamente pelo <strong>Agendador de Novembro</strong>.
              </p>
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Destinatário do Organizador: <a href="mailto:${params.recipient}" style="color: #059669; text-decoration: none;">${params.recipient}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const summary = `${subject} (${completedCount}/${targetCount} participantes). Top: ${topSlots[0]?.dateFormatted || 'N/A'} - ${topSlots[0]?.shiftLabel || 'N/A'}`;

  return { subject, html, summary };
}

export async function sendEmailNotification(options: {
  triggerType: 'all_completed' | 'full_convergence' | 'manual_test';
  customReason?: string;
}): Promise<EmailDispatchResult> {
  const state = await readAppStateAsync();
  const analysis = analyzeGroupAvailability(state);

  const recipient = state.settings.organizerEmail || 'pauloeduardo.braga@hotmail.com';
  let triggerReason = options.customReason || '';

  if (!triggerReason) {
    if (options.triggerType === 'all_completed') {
      triggerReason = `Todos os ${analysis.targetCount} participantes definidos preencheram suas disponibilidades de Novembro!`;
    } else if (options.triggerType === 'full_convergence') {
      const best = analysis.perfectMatchSlots[0];
      triggerReason = `Convergência Total (100% de presença) atingida para a data: ${best ? `${best.dateFormatted} (${best.shiftLabel})` : 'uma ou mais datas'}!`;
    } else {
      triggerReason = 'Disparo de teste manual acionado pelo painel de configurações do organizador.';
    }
  }

  const { subject, html, summary } = generateNotificationHtml({
    eventName: state.settings.eventName || 'Encontro de Novembro',
    triggerReason,
    recipient,
    completedCount: analysis.completedCount,
    targetCount: analysis.targetCount,
    topSlots: analysis.top3Slots,
    perfectSlots: analysis.perfectMatchSlots,
  });

  // Check if real SMTP is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  let isSimulated = true;
  let messageId: string | undefined;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"Agendador Novembro" <${process.env.SMTP_FROM || smtpUser}>`,
        to: recipient,
        subject,
        html,
      });

      messageId = info.messageId;
      isSimulated = false;
    } catch (smtpErr) {
      console.warn('SMTP delivery failed, falling back to recorded simulation log:', smtpErr);
      isSimulated = true;
    }
  }

  // Webhook dispatch if configured
  if (state.settings.webhookUrl) {
    try {
      await fetch(state.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'scheduling_alert',
          triggerType: options.triggerType,
          recipient,
          completedCount: analysis.completedCount,
          targetCount: analysis.targetCount,
          topSlots: analysis.top3Slots,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (whErr) {
      console.warn('Webhook dispatch error:', whErr);
    }
  }

  // Always persist to log so organizer can see in UI
  await logEmailSentAsync({
    recipient,
    subject,
    triggerType: options.triggerType,
    htmlPreview: html,
    summary,
    status: isSimulated ? 'simulated' : 'sent',
  });

  return {
    success: true,
    type: options.triggerType,
    recipient,
    subject,
    messageId,
    isSimulated,
    previewHtml: html,
  };
}

export async function checkAndTriggerAutomatedNotifications(): Promise<{
  allCompletedTriggered: boolean;
  convergenceTriggered: boolean;
}> {
  const state = await readAppStateAsync();
  const analysis = analyzeGroupAvailability(state);

  let allCompletedTriggered = false;
  let convergenceTriggered = false;

  // 1. Check if all 16 participants completed
  if (analysis.allCompleted && !state.settings.notifiedAllCompleted) {
    await sendEmailNotification({
      triggerType: 'all_completed',
      customReason: `Todos os ${analysis.targetCount} participantes esperados preencheram sua agenda!`,
    });
    state.settings.notifiedAllCompleted = true;
    await saveAppStateAsync(state);
    allCompletedTriggered = true;
  }

  // 2. Check if at least 1 slot has 100% convergence
  const perfectSlotKeys = analysis.perfectMatchSlots.map((s) => s.key);
  const previouslyNotified = state.settings.notifiedFullConvergenceSlots || [];
  const newPerfectSlots = perfectSlotKeys.filter((k) => !previouslyNotified.includes(k));

  if (newPerfectSlots.length > 0) {
    const slotObj = analysis.slotsMap[newPerfectSlots[0]];
    await sendEmailNotification({
      triggerType: 'full_convergence',
      customReason: `Convergência 100%! Todos os ${analysis.targetCount} participantes estão livres em: ${slotObj.dateFormatted} (${slotObj.shiftLabel})!`,
    });
    state.settings.notifiedFullConvergenceSlots = [
      ...previouslyNotified,
      ...newPerfectSlots,
    ];
    await saveAppStateAsync(state);
    convergenceTriggered = true;
  }

  return { allCompletedTriggered, convergenceTriggered };
}
