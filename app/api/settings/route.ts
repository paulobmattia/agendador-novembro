import { NextRequest, NextResponse } from 'next/server';
import { readAppStateAsync, updateSettingsAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = await readAppStateAsync();
  return NextResponse.json({
    success: true,
    data: state.settings,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizerEmail, targetCount, eventName, webhookUrl, expectedParticipants } = body;

    const updates: Record<string, unknown> = {};

    if (organizerEmail && typeof organizerEmail === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(organizerEmail)) {
        return NextResponse.json(
          { success: false, error: 'E-mail do organizador inválido.' },
          { status: 400 }
        );
      }
      updates.organizerEmail = organizerEmail.trim();
    }

    if (targetCount !== undefined) {
      const num = parseInt(targetCount, 10);
      if (isNaN(num) || num < 1 || num > 100) {
        return NextResponse.json(
          { success: false, error: 'Total de pessoas deve ser entre 1 e 100.' },
          { status: 400 }
        );
      }
      updates.targetCount = num;
    }

    if (eventName && typeof eventName === 'string') {
      updates.eventName = eventName.trim();
    }

    if (webhookUrl !== undefined) {
      updates.webhookUrl = typeof webhookUrl === 'string' ? webhookUrl.trim() : undefined;
    }

    if (Array.isArray(expectedParticipants)) {
      updates.expectedParticipants = expectedParticipants
        .map((n) => String(n).trim())
        .filter((n) => n.length > 0);
    }

    const state = await updateSettingsAsync(updates);

    return NextResponse.json({
      success: true,
      data: state.settings,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar configurações.' },
      { status: 500 }
    );
  }
}
