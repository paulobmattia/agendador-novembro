import { NextResponse } from 'next/server';
import { analyzeGroupAvailability } from '@/lib/algorithm';
import { readAppStateAsync } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const state = await readAppStateAsync();
    const analysis = analyzeGroupAvailability(state);

    return NextResponse.json({
      success: true,
      data: {
        state,
        analysis,
      },
    });
  } catch (error) {
    console.error('Error fetching state:', error);
    return NextResponse.json(
      { success: false, error: 'Falha ao carregar estado da aplicação' },
      { status: 500 }
    );
  }
}
