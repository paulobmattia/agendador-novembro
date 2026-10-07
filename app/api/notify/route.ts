import { NextRequest, NextResponse } from 'next/server';
import { sendEmailNotification } from '@/lib/email-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { triggerType = 'manual_test', reason } = body;

    const result = await sendEmailNotification({
      triggerType: triggerType as 'all_completed' | 'full_convergence' | 'manual_test',
      customReason: reason,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error dispatching test email:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao processar disparo de e-mail.' },
      { status: 500 }
    );
  }
}
