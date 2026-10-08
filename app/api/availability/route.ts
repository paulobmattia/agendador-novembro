import { NextRequest, NextResponse } from 'next/server';
import { analyzeGroupAvailability } from '@/lib/algorithm';
import { checkAndTriggerAutomatedNotifications } from '@/lib/email-service';
import { updateParticipantAvailabilityAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, availability } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome do participante é obrigatório.' },
        { status: 400 }
      );
    }

    if (!availability || typeof availability !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Mapa de disponibilidade inválido.' },
        { status: 400 }
      );
    }

    // Save participant availability
    console.log(`[AVAILABILITY_SUBMISSION] ${name}:`, JSON.stringify(availability));
    const { state, participant } = await updateParticipantAvailabilityAsync(name, availability);

    // Check automated notifications for organizer (16 completed or 100% convergence)
    const automatedNotifications = await checkAndTriggerAutomatedNotifications();

    // Re-analyze
    const analysis = analyzeGroupAvailability(state);

    return NextResponse.json({
      success: true,
      data: {
        participant,
        analysis,
        automatedNotifications,
      },
    });
  } catch (error) {
    console.error('Error saving availability:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao salvar disponibilidade.' },
      { status: 500 }
    );
  }
}
