'use client';

export async function launchConfetti() {
  if (typeof window === 'undefined') return;
  try {
    const confetti = (await import('canvas-confetti')).default;

    // Cannon 1 from left
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
    });

    // Cannon 2 from right
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
    });
  } catch (e) {
    console.warn('Confetti launch error', e);
  }
}
