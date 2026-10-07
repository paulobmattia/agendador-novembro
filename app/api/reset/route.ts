import { NextRequest, NextResponse } from 'next/server';
import { analyzeGroupAvailability } from '@/lib/algorithm';
import { checkAndTriggerAutomatedNotifications } from '@/lib/email-service';
import { resetStateAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'seed';

    const newState = await resetStateAsync(mode);

    if (mode === 'perfect_simulation') {
      await checkAndTriggerAutomatedNotifications();
    }

    const analysis = analyzeGroupAvailability(newState);

    return NextResponse.json({
      success: true,
      data: {
        state: newState,
        analysis,
      },
    });
  } catch (error) {
    console.error('Error resetting state:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao redefinir estado.' },
      { status: 500 }
    );
  }
}
